"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { notificationService, Notification } from '@/lib/services/notificationService';

const supabase = createClient();

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      const data = await notificationService.getAll();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error: any) {
      console.error('Error fetching notifications:', error?.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel(`public:notifications-${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (id: string) => {
    await notificationService.markAsRead(id);
    // Real-time subscription will handle state update
  };

  const markAllAsRead = async () => {
    await notificationService.markAllAsRead();
    // Real-time subscription will handle state update
  };

  const deleteNotification = async (id: string) => {
    await notificationService.delete(id);
    // Real-time subscription will handle state update
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: fetchNotifications
  };
}
