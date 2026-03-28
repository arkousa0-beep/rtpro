'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

/**
 * Tracks online/offline status and shows toasts on change.
 * Also triggers a sync callback when coming back online.
 */
export function useOnlineStatus(onReconnect?: () => void) {
  const [isOnline, setIsOnline] = useState(true);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    toast.success('تم استعادة الاتصال بالإنترنت', {
      description: 'جاري مزامنة البيانات...',
      duration: 3000,
    });
    onReconnect?.();
  }, [onReconnect]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    toast.warning('انقطع الاتصال بالإنترنت', {
      description: 'البيانات المحفوظة محلياً ستظهر. أي تغييرات ستُرسل عند عودة الاتصال.',
      duration: 5000,
    });
  }, []);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return isOnline;
}
