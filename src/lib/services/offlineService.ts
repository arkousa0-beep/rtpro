/**
 * Lightweight offline-first service.
 * Caches data in localStorage and queues write operations for later sync.
 */

const CACHE_PREFIX = 'rtpro_cache_';
const QUEUE_KEY = 'rtpro_offline_queue';

// ── Cache (Read) ───────────────────────────────────────────────────────────

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/** Save data to local cache with a timestamp */
export function saveToCache<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage full or unavailable — silently fail
    console.warn('[Offline] Failed to save cache for', key);
  }
}

/** Get cached data. Returns null if not found or expired. */
export function getFromCache<T>(key: string, maxAgeMs?: number): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);

    // Check if cache is stale
    if (maxAgeMs && Date.now() - entry.timestamp > maxAgeMs) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

/** Clear a specific cache entry */
export function clearCache(key: string): void {
  localStorage.removeItem(CACHE_PREFIX + key);
}

// ── Offline Queue (Write) ──────────────────────────────────────────────────

export interface OfflineAction {
  id: string;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: Record<string, unknown>;
  createdAt: number;
}

/** Queue a write operation for later sync */
export function queueOfflineAction(action: Omit<OfflineAction, 'id' | 'createdAt'>): void {
  try {
    const queue = getOfflineQueue();
    queue.push({
      ...action,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    console.warn('[Offline] Failed to queue action');
  }
}

/** Get all pending offline actions */
export function getOfflineQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Remove a specific action from the queue after successful sync */
export function removeFromQueue(actionId: string): void {
  const queue = getOfflineQueue().filter((a) => a.id !== actionId);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/** Clear the entire offline queue */
export function clearOfflineQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

/** Check if there are pending actions to sync */
export function hasPendingActions(): boolean {
  return getOfflineQueue().length > 0;
}

// ── Connectivity ───────────────────────────────────────────────────────────

/** Check if the browser is currently online */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}
