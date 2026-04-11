"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { X, Camera, AlertCircle } from 'lucide-react';
import { playSuccessSound } from '@/lib/audioUtils';

// Dynamically import the scanner to avoid SSR issues
const Scanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  { ssr: false, loading: () => <div className="w-full h-full bg-black/50 animate-pulse rounded-[3rem]" /> }
);

interface CameraScannerDialogProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
  // Optional cooldown in ms to prevent duplicate scans
  cooldownMs?: number;
  /** If true, the scanner stays open after a successful scan (useful for batching) */
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
  const lastScanTimeRef = useRef<number>(0);
  
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  // Reset counters when the dialog opens
  useEffect(() => {
    if (open) {
      setLastScanned(null);
      setScanCount(0);
      lastScanTimeRef.current = 0;
      setError(null);
    }
  }, [open]);

  const handleScan = useCallback((detectedCodes: any[]) => {
    if (!detectedCodes || detectedCodes.length === 0) return;
    
    // We only care about the first detected code in the frame
    const text = detectedCodes[0].rawValue;
    if (!text) return;

    const now = Date.now();
    if (now - lastScanTimeRef.current > cooldownMs) {
      lastScanTimeRef.current = now;
      
      // Force mobile vibration feedback if supported
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100);
      }
      
      playSuccessSound();
      setLastScanned(text);
      setScanCount(prev => prev + 1);
      onScanRef.current(text);

      // Auto-close if not in continuous mode
      if (!continuous) {
        setTimeout(onClose, 400); // Small delay to let user see the "Success" state
      }
    }
  }, [cooldownMs, continuous, onClose]);

  const handleError = useCallback((err: unknown) => {
    console.error("Camera Error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    
    if (msg.includes('Permission') || msg.includes('NotAllowedError')) {
      setError("لم يتم السماح بالوصول للكاميرا. يرجى إعطاء الصلاحية من إعدادات المتصفح.");
    } else if (msg.includes('NotFoundError')) {
      setError("لم يتم العثور على كاميرا متاحة في هذا الجهاز.");
    } else if (msg.includes('NotReadableError')) {
      setError("الكاميرا مستخدمة حالياً بواسطة تطبيق آخر.");
    } else {
      setError("تعذر تشغيل الكاميرا. تأكد من إعطاء الصلاحيات الكافية.");
    }
  }, []);

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

      <div className="w-full max-w-md p-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-xl shadow-primary/20">
          <Camera className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">مسح الباركود</h2>
        <p className="text-white/40 text-sm font-bold mb-8 text-center max-w-[250px]">
          {continuous 
            ? "الماسح في وضع الإدخال المستمر. يمكنك مسح عدة قطع تتابعاً."
            : "وجّه الكاميرا نحو الباركود، وسيتم القراءة تلقائياً."}
        </p>

        <div className="w-full aspect-square relative rounded-[3rem] overflow-hidden bg-black/50 border-2 border-white/10 shadow-2xl group">
          {error ? (
            <div className="absolute inset-0 flex flex-col gap-3 items-center justify-center p-6 text-center text-red-400 font-bold bg-red-500/10">
              <AlertCircle className="w-10 h-10" />
              <p className="max-w-[200px] leading-relaxed">{error}</p>
            </div>
          ) : (
            <Scanner
              onScan={handleScan}
              onError={handleError}
              allowMultiple={true}
              scanDelay={350} // Optimized for mobile CPU/Battery (approx 3 frames/sec)
              constraints={{
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
              }}
              components={{
                finder: false,
                torch: true, // Enable flashlight support
                zoom: true   // Enable zoom support
              }}
              sound={false} // Use the correct prop for disabling library sound
              styles={{
                container: { width: '100%', height: '100%' },
                video: { objectFit: 'cover' }
              }}
            />
          )}

          {/* Scanned Feedback Overlay */}
          {lastScanned && (
            <div className="absolute bottom-6 inset-x-6 z-20 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-emerald-500/20 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl p-4 flex flex-col items-center shadow-2xl">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Scanned Successfully</span>
                <span className="text-white font-mono text-sm font-bold truncate w-full text-center" dir="ltr">{lastScanned}</span>
              </div>
            </div>
          )}
          
          {/* Scanning Animation overlay */}
          {!error && (
            <>
              <div 
                className="absolute inset-x-12 h-[1px] bg-primary/60 shadow-[0_0_20px_2px_rgba(59,130,246,0.8)] rounded-full z-10"
                style={{
                  top: '50%',
                  animation: 'scanner 3s ease-in-out infinite alternate',
                }} 
              />
              <style dangerouslySetInnerHTML={{__html:`
                @keyframes scanner {
                  0% { transform: translateY(-120px); opacity: 0.3; }
                  50% { opacity: 1; }
                  100% { transform: translateY(120px); opacity: 0.3; }
                }
              `}} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

