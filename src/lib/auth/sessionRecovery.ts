import { createClient } from '@/lib/supabase/client';

/**
 * Attempts to forcefully refresh the auth session.
 * Useful when getUser() fails but a refresh token might still be valid.
 */
export async function attemptSessionRecovery(): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error || !session) {
      console.warn('[SessionRecovery] Failed to refresh session:', error?.message);
      return false;
    }
    
    console.log('[SessionRecovery] Session refreshed successfully');
    return true;
  } catch (err) {
    console.error('[SessionRecovery] Unexpected error:', err);
    return false;
  }
}
