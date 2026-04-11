"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { X, AlertCircle, Crosshair } from 'lucide-react';
import { playSuccessSound } from '@/lib/audioUtils';

// Dynamically import the scanner to avoid SSR issues
const BarcodeScanner = dynamic(
  () => import('react-barcode-scanner').then((mod) => mod.BarcodeScanner),
  { ssr: false, loading: () => <div className="w-full h-full bg-black/50 animate-pulse rounded-[2rem]" /> }
);

// Import polyfill on client side only
if (typeof window !== 'undefined') {
  import('react-barcode-scanner/polyfill').catch(() => {});
}

/** All supported barcode formats */
const ALL_FORMATS = [
  'ean_13', 'ean_8', 'upc_a', 'upc_e',
  'code_128', 'code_39', 'code_93', 'codabar', 'itf',
  'qr_code',
] as const;

interface CameraScannerDialogProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  cooldownMs?: number;
  continuous?: boolean;
}

export function CameraScannerDialog({
  open,
  onClose,
  onScan,
  cooldownMs = 1200,
  continuous = false,
}: CameraScannerDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [manualScanning, setManualScanning] = useState(false);
  const lastScanTimeRef = useRef<number>(0);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  // Scanner options
  const scanOptions = useMemo(() => ({
    delay: 100,
    formats: [...ALL_FORMATS],
  }), []);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setLastScanned(null);
      setScanCount(0);
      lastScanTimeRef.current = 0;
      setError(null);
      setIsFlashing(false);
      setManualScanning(false);
    }
  }, [open]);

  /** Shared handler for processing a successful barcode result */
  const processResult = useCallback((text: string) => {
    const now = Date.now();
    if (now - lastScanTimeRef.current > cooldownMs) {
      lastScanTimeRef.current = now;

      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100);
      }

      // Flash effect
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 200);

      playSuccessSound();
      setLastScanned(text);
      setScanCount(prev => prev + 1);
      onScanRef.current(text);

      if (!continuous) {
        setTimeout(onClose, 400);
      }
    }
  }, [cooldownMs, continuous, onClose]);

  /** Auto-scan callback from react-barcode-scanner */
  const handleCapture = useCallback((barcodes: any[]) => {
    if (!barcodes || barcodes.length === 0) return;
    const text = barcodes[0]?.rawValue;
    if (!text) return;
    processResult(text);
  }, [processResult]);

  /** Manual scan: grab video frame and decode with BarcodeDetector */
  const handleManualScan = useCallback(async () => {
    if (manualScanning) return;
    setManualScanning(true);

    // Flash effect
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    try {
      const container = scannerContainerRef.current;
      if (!container) throw new Error('no-container');

      const video = container.querySelector('video');
      if (!video || video.readyState < 2) throw new Error('no-video');

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no-ctx');
      ctx.drawImage(video, 0, 0);

      // Try native BarcodeDetector first, then polyfill
      let BarcodeDetectorClass: any = null;
      if ('BarcodeDetector' in globalThis) {
        BarcodeDetectorClass = (globalThis as any).BarcodeDetector;
      } else {
        try {
          const mod = await import('barcode-detector');
          BarcodeDetectorClass = mod.BarcodeDetector;
        } catch {
          // fallback
        }
      }

      if (!BarcodeDetectorClass) throw new Error('no-detector');

      const detector = new BarcodeDetectorClass({ formats: [...ALL_FORMATS] });
      const results = await detector.detect(canvas);

      if (results && results.length > 0 && results[0].rawValue) {
        processResult(results[0].rawValue);
      } else {
        // Nothing found feedback
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([50, 30, 50]);
        }
      }
    } catch (err) {
      console.warn('Manual scan failed:', err);
    } finally {
      setManualScanning(false);
    }
  }, [manualScanning, processResult]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
        <button
          onClick={onClose}
          className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {continuous && scanCount > 0 && (
          <div className="bg-primary text-black px-5 py-2.5 rounded-2xl font-black text-xs shadow-xl shadow-primary/20 animate-in slide-in-from-top-4">
             تم مسح {scanCount} قطع ✓
          </div>
        )}
      </div>

      <div className="w-full max-w-3xl px-4 flex flex-col items-center h-[90vh] justify-center">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-black text-white tracking-tight">مسح الباركود</h2>
          <p className="text-white/40 text-xs font-bold">
            {continuous
              ? "وضع الإدخال المستمر نشط."
              : "وجّه الكاميرا أو اضغط الزر للالتقاط."}
          </p>
        </div>

        <div ref={scannerContainerRef} className="w-full aspect-[4/3] md:aspect-video relative rounded-[2rem] overflow-hidden bg-black border-2 border-white/5 shadow-2xl">
          {error ? (
            <div className="absolute inset-0 flex flex-col gap-3 items-center justify-center p-6 text-center text-red-400 font-bold bg-red-500/10 z-20">
              <AlertCircle className="w-10 h-10" />
              <p className="max-w-[200px] leading-relaxed">{error}</p>
            </div>
          ) : (
            <BarcodeScanner
              onCapture={handleCapture}
              onError={(err: unknown) => {
                console.error("Camera Error:", err);
                const msg = err instanceof Error ? err.message : String(err);
                if (msg.includes('Permission') || msg.includes('NotAllowedError')) {
                  setError("لم يتم السماح بالوصول للكاميرا.");
                } else if (msg.includes('NotFoundError')) {
                  setError("لم يتم العثور على كاميرا.");
                } else {
                  setError("تعذر تشغيل الكاميرا.");
                }
              }}
              options={scanOptions}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              trackConstraints={{
                facingMode: 'environment',
                advanced: [{ focusMode: 'continuous' } as any]
              }}
            />
          )}

          {/* Shutter Flash Effect */}
          {isFlashing && (
            <div className="absolute inset-0 bg-white/40 z-30 pointer-events-none animate-out fade-out duration-200" />
          )}

          {/* Scanned Feedback Overlay */}
          {lastScanned && (
            <div className="absolute bottom-24 inset-x-6 z-20 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-emerald-500/40 backdrop-blur-3xl border border-emerald-500/50 rounded-2xl p-3 flex flex-col items-center shadow-2xl">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-1">تم المسح</span>
                <span className="text-white font-mono text-sm font-bold truncate w-full text-center" dir="ltr">{lastScanned}</span>
              </div>
            </div>
          )}

          {/* Scanning Animation */}
          {!error && (
            <div
              className="absolute inset-x-0 h-[2px] bg-primary/40 shadow-[0_0_15px_2px_rgba(59,130,246,0.5)] z-10 pointer-events-none"
              style={{
                top: '50%',
                animation: 'scanner 4s ease-in-out infinite alternate',
              }}
            />
          )}

          {/* Manual Capture Button — INSIDE scanner area */}
          {!error && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
              <button
                onClick={handleManualScan}
                disabled={manualScanning}
                className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border-4 border-white/20 hover:border-primary hover:bg-primary/20 hover:scale-110 active:scale-90 transition-all flex items-center justify-center shadow-2xl group/btn disabled:opacity-50"
                aria-label="التقاط"
              >
                <div className="w-10 h-10 rounded-full bg-white/40 group-hover/btn:bg-primary/60 flex items-center justify-center transition-all">
                  <Crosshair className="w-5 h-5 text-white" />
                </div>
              </button>
              <p className="text-white/60 text-[9px] font-black uppercase tracking-widest bg-black/40 px-2 py-1 rounded-full backdrop-blur-sm">اضغط للمسح</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes scanner {
          0% { transform: translateY(-150px); opacity: 0.1; }
          50% { opacity: 0.8; }
          100% { transform: translateY(150px); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}
