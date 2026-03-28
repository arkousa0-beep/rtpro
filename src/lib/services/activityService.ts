import { createClient } from '@/lib/supabase/client';
import { ActivityAction, ActivityLog } from '@/lib/database.types';

export type { ActivityAction, ActivityLog };

export async function logActivity(
  action: ActivityAction,
  entityType: string,
  entityId: string,
  details?: Record<string, unknown>
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.warn('No user found when trying to log activity:', action);
    return;
  }

  const { error } = await supabase.from('activity_logs').insert({
    actor_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details
  });

  if (error) {
    console.error('Error logging activity:', error);
  }
}

export async function getActivities(): Promise<ActivityLog[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      profiles (
        full_name,
        role
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching activities:', error);
    return [];
  }

  return (data ?? []) as ActivityLog[];
}
