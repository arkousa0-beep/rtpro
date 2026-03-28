"use client";

import { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Loader2, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const controls = useAnimation();
  const router = useRouter();

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY > 0 && !refreshing) {
      const y = e.touches[0].clientY;
      // Only pull down
      if (y > startY) {
        // dampen the pull
        const pullDistance = Math.min((y - startY) * 0.4, 100);
        setCurrentY(pullDistance);
        if (pullDistance > 0) {
           e.cancelable && e.preventDefault(); // prevent native scroll when pulling
        }
        controls.set({ y: pullDistance });
      }
    }
  };

  const handleTouchEnd = () => {
    if (currentY > 70 && !refreshing) {
      setRefreshing(true);
      controls.start({ y: 50 });
      
      // Perform refresh
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } else {
      // Snap back
      controls.start({ y: 0 });
      setStartY(0);
      setCurrentY(0);
    }
  };

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
