"use client";

import { useState, useCallback } from "react";
import { motion, useAnimation } from "framer-motion";
import { Loader2, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";

interface PullToRefreshProps {
  children: React.ReactNode;
  /** Optional callback executed on refresh. If omitted, uses router.refresh(). */
  onRefresh?: () => Promise<void> | void;
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const controls = useAnimation();
  const router = useRouter();

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0 && !refreshing) {
      setStartY(e.touches[0].clientY);
    }
  }, [refreshing]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (startY > 0 && !refreshing) {
      const y = e.touches[0].clientY;
      if (y > startY) {
        const pullDistance = Math.min((y - startY) * 0.4, 100);
        setCurrentY(pullDistance);
        if (pullDistance > 0) {
          e.cancelable && e.preventDefault();
        }
        controls.set({ y: pullDistance });
      }
    }
  }, [startY, refreshing, controls]);

  const handleTouchEnd = useCallback(async () => {
    if (currentY > 70 && !refreshing) {
      setRefreshing(true);
      controls.start({ y: 50 });
      
      try {
        if (onRefresh) {
          await onRefresh();
        } else {
          // Use Next.js soft refresh — no full page reload
          router.refresh();
          // Wait a moment for data to re-fetch
          await new Promise(resolve => setTimeout(resolve, 600));
        }
      } catch {
        // Silently handle refresh errors
      } finally {
        await controls.start({ y: 0 });
        setRefreshing(false);
        setStartY(0);
        setCurrentY(0);
      }
    } else {
      controls.start({ y: 0 });
      setStartY(0);
      setCurrentY(0);
    }
  }, [currentY, refreshing, controls, onRefresh, router]);

  return (
    <div 
      className="relative w-full min-h-screen"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-0 left-0 right-0 h-16 flex flex-col items-center justify-center -z-10 mt-4">
        {refreshing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-[10px] text-primary font-bold uppercase tracking-widest">تحديث البيانات...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-50" style={{ opacity: Math.min(currentY / 100, 1) }}>
            <ArrowDown 
              className="w-5 h-5 text-white/60 transition-transform duration-200" 
              style={{ transform: `rotate(${currentY > 70 ? 180 : 0}deg)` }}
            />
            <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">
              {currentY > 70 ? "أفلت للتحديث" : "اسحب للتحديث"}
            </span>
          </div>
        )}
      </div>
      <motion.div animate={controls} className="w-full h-full bg-transparent">
        {children}
      </motion.div>
    </div>
  );
}
