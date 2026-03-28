import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type EventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface RealtimeOptions<T extends { [key: string]: any } = { [key: string]: any }> {
  /** Table name in the public schema */
  table: string;
  /** Event types to listen for */
  event?: EventType;
  /** Callback when a change occurs */
  onData: (payload: RealtimePostgresChangesPayload<T>) => void;
  /** Whether the subscription is active (defaults to true) */
  enabled?: boolean;
}

/**
 * Subscribes to Supabase Realtime postgres_changes for a given table.
 * Automatically cleans up the subscription on unmount.
 *
 * @example
 * useRealtimeSubscription({
 *   table: 'products',
 *   event: '*',
 *   onData: (payload) => {
 *     if (payload.eventType === 'INSERT') { ... }
 *   }
 * });
 */
export function useRealtimeSubscription<T extends { [key: string]: any } = { [key: string]: any }>(
  options: RealtimeOptions<T>
) {
  const { table, event = '*', onData, enabled = true } = options;
  const callbackRef = useRef(onData);

  // Keep callback ref fresh without re-subscribing
  useEffect(() => {
    callbackRef.current = onData;
  }, [onData]);

  useEffect(() => {
    if (!enabled) return;

    const channelName = `realtime-${table}-${event}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event,
          schema: 'public',
          table,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          callbackRef.current(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, enabled]);
}
