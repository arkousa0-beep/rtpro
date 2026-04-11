import { createClient } from '@/lib/supabase/client';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Callback = (payload: RealtimePostgresChangesPayload<any>) => void;

class RealtimeManager {
  private static instance: RealtimeManager;
  private channels: Map<string, any> = new Map();
  private subscribers: Map<string, Set<Callback>> = new Map();

  private constructor() {}

  static getInstance() {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  subscribe(table: string, event: string, callback: Callback) {
    const key = `${table}:${event}`;
    
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    if (!this.channels.has(key)) {
      const supabase = createClient();
      const channel = supabase
        .channel(`global:${key}`)
        .on(
          'postgres_changes' as any,
          { event: event === '*' ? '*' : event, schema: 'public', table },
          (payload: any) => {
            this.subscribers.get(key)?.forEach(cb => cb(payload));
          }
        )
        .subscribe();
      
      this.channels.set(key, channel);
    }

    return () => {
      const callbacks = this.subscribers.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.channels.get(key)?.unsubscribe();
          this.channels.delete(key);
          this.subscribers.delete(key);
        }
      }
    };
  }
}

export const realtimeManager = RealtimeManager.getInstance();
