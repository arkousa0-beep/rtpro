"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { Omnibar } from "./Omnibar";
import { LogOut, Bell } from "lucide-react";
import { logoutAction } from "@/app/actions/authActions";
import { useState } from "react";
import { NotificationDrawer } from "./NotificationDrawer";
import { useNotifications } from "@/hooks/useNotifications";
import { PullToRefresh } from "@/components/ui/PullToRefresh";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  
  // List of routes that should NOT show the app shell (header, nav, etc.)
  const standaloneRoutes = ["/login", "/auth/callback"];
  const isStandalone = standaloneRoutes.includes(pathname);

  if (isStandalone) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 h-16 glass border-b flex items-center justify-between px-6">
        <div className="flex flex-col items-start leading-none">
          <span className="text-xs font-medium text-primary/80 mb-0.5">RT PRO</span>
          <h1 className="text-xl font-black tracking-tight text-white">سمارت ستور</h1>
        </div>
        <div className="flex items-center gap-2">
          <Omnibar />
          
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative flex items-center justify-center w-10 h-10 rounded-full glass border-white/10 hover:bg-white/10 group transition-all"
            title="الإشعارات"
          >
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-lg">
                {unreadCount > 9 ? '+9' : unreadCount}
              </span>
            )}
          </button>

          <div className="h-8 w-[1px] bg-white/10 mx-1 hidden sm:block" />
          
          <button
            onClick={async () => {
              await logoutAction();
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full glass border-white/10 hover:bg-red-500/20 hover:text-red-400 group transition-all"
            title="تسجيل الخروج"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      <main className="pt-20 pb-24 px-4 w-full max-w-md md:max-w-4xl mx-auto min-h-screen relative">
        <PullToRefresh>
          <div className="relative z-10 text-right">
            {children}
          </div>
        </PullToRefresh>
        
        {/* Subtle Background Elements for Luxury feel - Mirrored for RTL */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full" />
        </div>
      </main>

      <BottomNav />
      <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
}
