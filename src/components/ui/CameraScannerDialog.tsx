"use client";

import React, { useEffect, useRef, useState } from 'react';
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
}

export function CameraScannerDialog({
  open,
  onClose,
  onScan,
  cooldownMs = 1500
}: CameraScannerDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  
  const onScanRef = useRef(onScan);
  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const handleScan = (detectedCodes: any[]) => {
    if (!detectedCodes || detectedCodes.length === 0) return;
    
    // We only care about the first detected code in the frame
    const text = detectedCodes[0].rawValue;
    if (!text) return;

    const now = Date.now();
    if (now - lastScanTimeRef.current > cooldownMs) {
      lastScanTimeRef.current = now;
      playSuccessSound();
      onScanRef.current(text);
    }
  };

  const handleError = (err: unknown) => {
    console.error("Camera Error:", err);
    setError("تعذر تشغيل الكاميرا. الرجاء التأكد من إعطاء الصلاحيات.");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-6 left-6 w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all z-10"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-md p-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-xl shadow-primary/20">
          <Camera className="w-8 h-8" />
        </div>
        
        <h2 className="text-2xl font-black text-white mb-2 tracking-tight">مسح الباركود</h2>
        <p className="text-white/40 text-sm font-bold mb-8 text-center max-w-[250px]">
          وجّه كاميرا الهاتف نحو الباركود، وسيتم القراءة تلقائياً دون الحاجة للضغط.
        </p>

        <div className="w-full aspect-square relative rounded-[3rem] overflow-hidden bg-black/50 border-2 border-white/10 shadow-2xl">
          {error ? (
            <div className="absolute inset-0 flex flex-col gap-3 items-center justify-center p-6 text-center text-red-400 font-bold bg-red-500/10">
              <AlertCircle className="w-10 h-10" />
              {error}
            </div>
          ) : (
            <Scanner
              onScan={handleScan}
              onError={handleError}
              allowMultiple={true}
              scanDelay={100}
              components={{
                audio: false,      // We use our custom playSuccessSound
                finder: false     // Disable default finder bounding box to use our custom scanner animation
              } as any}
              styles={{
                container: { width: '100%', height: '100%' },
                video: { objectFit: 'cover' }
              }}
            />
          )}
          
          {/* Scanning Animation overlay */}
          {!error && (
            <>
              <div 
                className="absolute inset-x-12 h-[2px] bg-primary/80 shadow-[0_0_20px_4px_rgba(59,130,246,0.6)] rounded-full z-10"
                style={{
                  top: '50%',
                  animation: 'scanner 2.5s ease-in-out infinite alternate',
                }} 
              />
              <style dangerouslySetInnerHTML={{__html:`
                @keyframes scanner {
                  0% { transform: translateY(-100px); }
                  100% { transform: translateY(100px); }
                }
              `}} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
