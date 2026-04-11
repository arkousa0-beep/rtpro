import { useEffect, useRef } from 'react';
import { realtimeManager } from '@/lib/realtime/realtimeManager';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface RealtimeOptions<T extends { [key: string]: any } = { [key: string]: any }> {
  table: string;
  event?: EventType;
  onData: (payload: RealtimePostgresChangesPayload<T>) => void;
  enabled?: boolean;
}

/**
 * Subscribes to Supabase Realtime postgres_changes using a centralized manager.
 */
export function useRealtimeSubscription<T extends { [key: string]: any } = { [key: string]: any }>(
  options: RealtimeOptions<T>
) {
  const { table, event = '*', onData, enabled = true } = options;
  const callbackRef = useRef(onData);

  useEffect(() => {
    callbackRef.current = onData;
  }, [onData]);

  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = realtimeManager.subscribe(table, event, (payload) => {
      callbackRef.current(payload);
    });

    return () => {
      unsubscribe();
    };
  }, [table, event, enabled]);
}
