'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

/**
 * Shows a slim banner at the top of the page when the user goes offline.
 * Dismisses automatically when the connection is restored.
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-[100] overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2 bg-amber-500/90 text-black px-4 py-2 text-xs font-black backdrop-blur-md">
            <WifiOff className="w-3.5 h-3.5" />
            <span>لا يوجد اتصال بالإنترنت — البيانات من الذاكرة المحلية</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
