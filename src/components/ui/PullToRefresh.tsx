"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Loader2, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh?: () => Promise<void> | void;
  children: React.ReactNode;
  className?: string;
}

export function PullToRefresh({ onRefresh, children, className }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const PULL_THRESHOLD = 80;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      // Only record touch start if at the top
      if (window.scrollY <= 0) {
        startY = e.touches[0].pageY;
      } else {
        startY = 0;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY === 0 || isRefreshing) return;
      
      const currentY = e.touches[0].pageY;
      const diff = currentY - startY;

      if (diff > 0 && window.scrollY <= 0) {
        // Prevent default scrolling when pulling down at the top
        if (e.cancelable) e.preventDefault();
        
        const progress = Math.min(diff / PULL_THRESHOLD, 1.5);
        setPullProgress(progress);
        setIsPulling(true);
      } else {
        setIsPulling(false);
        setPullProgress(0);
      }
    };

    const handleTouchEnd = async () => {
      if (isPulling && pullProgress >= 1 && !isRefreshing && onRefresh) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setIsPulling(false);
          setPullProgress(0);
        }
      } else {
        setIsPulling(false);
        setPullProgress(0);
      }
      startY = 0;
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isRefreshing, isPulling, pullProgress, onRefresh]);

  return (
    <div ref={containerRef} className={className}>
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: isRefreshing ? 60 : Math.min(pullProgress * PULL_THRESHOLD, 80),
              opacity: 1 
            }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-center overflow-hidden w-full sticky top-0 z-50 pointer-events-none"
          >
            <div className="bg-indigo-600/90 backdrop-blur-md rounded-full p-2 border border-white/10 shadow-xl">
              {isRefreshing ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <motion.div
                  style={{ rotate: (pullProgress - 1) * 180 }}
                >
                  <ArrowDown className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        animate={{ y: isPulling ? Math.min(pullProgress * PULL_THRESHOLD, 40) : 0 }}
        transition={isPulling ? { type: 'spring', damping: 20, stiffness: 300 } : { type: 'spring', damping: 25, stiffness: 200 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

import { AnimatePresence } from 'framer-motion';
