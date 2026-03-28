"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default: return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[101] bg-[#0A0A0B] border-t border-white/10 rounded-t-[32px] max-h-[85vh] flex flex-col glass"
          >
            {/* Header */}
            <div className="p-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-2xl">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">الإشعارات</h2>
                  <p className="text-sm text-muted-foreground">
                    لديك {unreadCount} إشعارات غير مقروءة
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={markAllAsRead}
                  className="hover:bg-primary/10 hover:text-primary transition-colors"
                  title="تحديد الكل كمقروء"
                >
                  <CheckCheck className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="rounded-full hover:bg-white/5"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* List */}
            <ScrollArea className="flex-1 px-4 py-2">
              <div className="space-y-3 pb-8">
                {notifications.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <Bell className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                    <p className="text-muted-foreground font-medium">لا توجد إشعارات حالياً</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all relative group overflow-hidden",
                        n.read 
                          ? "bg-transparent border-white/5 opacity-80" 
                          : "bg-white/[0.02] border-primary/20 shadow-[0_0_20px_-10px_rgba(245,158,11,0.2)]"
                      )}
                      onClick={() => !n.read && markAsRead(n.id)}
                    >
                      {/* Read Indicator */}
                      {!n.read && (
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary" />
                      )}

                      <div className="flex gap-4">
                        <div className="mt-1">{getIcon(n.type)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className={cn("font-bold text-[15px]", !n.read ? "text-white" : "text-muted-foreground")}>
                              {n.title}
                            </h3>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(n.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[11px] text-muted-foreground/60 pt-1">
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ar })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
