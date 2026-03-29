"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { Sidebar } from "./Sidebar";
import { Omnibar } from "./Omnibar";
import { LogOut, Bell } from "lucide-react";
import { logoutAction } from "@/app/actions/authActions";
import { useState } from "react";
import { NotificationDrawer } from "./NotificationDrawer";
import { useNotifications } from "@/hooks/useNotifications";
import { PullToRefresh } from "@/components/ui/PullToRefresh";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/lib/store/uiStore";
import { motion } from "framer-motion";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const { isSidebarCollapsed } = useUIStore();
  
  // List of routes that should NOT show the app shell (header, nav, etc.)
  const standaloneRoutes = ["/login", "/auth/callback"];
  const isStandalone = standaloneRoutes.includes(pathname);

  if (isStandalone) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  const sidebarWidthClass = isSidebarCollapsed ? "md:pr-20" : "md:pr-64";
  const headerWidthClass = isSidebarCollapsed ? "md:w-[calc(100%-5rem)]" : "md:w-[calc(100%-16rem)]";

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Desktop Sidebar (RTL - right side) */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-500">
        <header className={cn(
          "fixed top-0 left-0 z-50 h-16 glass border-b flex items-center justify-between px-4 sm:px-6 transition-all duration-500 w-full",
          headerWidthClass
        )}>
          <div className="flex items-center gap-3">
             {/* Mobile branding - Only visible when sidebar Is not permanent */}
             <div className="flex flex-col items-start leading-none md:hidden shrink-0">
              <span className="text-[9px] font-black text-primary/80 tracking-widest uppercase mb-0.5">RT PRO</span>
              <h1 className="text-base font-black tracking-tight text-white whitespace-nowrap">سمارت ستور</h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
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

        <main className={cn(
          "pt-20 pb-24 min-h-screen relative transition-all duration-500 ease-in-out",
          sidebarWidthClass
        )}>
          <PullToRefresh>
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-4 lg:px-12 xl:px-24 max-w-7xl mx-auto text-right"
            >
              {children}
            </motion.div>
          </PullToRefresh>
          
          {/* Subtle Background Elements */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/5 blur-[120px] rounded-full" />
          </div>
        </main>

        <BottomNav />
        <NotificationDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      </div>
    </div>
  );
}

