"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Home, 
  Scan, 
  Package, 
  TrendingUp, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Users,
  Search,
  Truck,
  CreditCard,
  History,
  LayoutGrid,
  Box
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ProfilePermissions } from "@/lib/database.types";
import { useUIStore } from "@/lib/store/uiStore";

interface NavLink {
  name: string;
  href: string;
  icon: React.ElementType;
  permission?: keyof ProfilePermissions | (keyof ProfilePermissions)[];
  group: "main" | "inventory" | "business" | "admin";
}

const ALL_LINKS: NavLink[] = [
  // Main
  { name: "الرئيسية", href: "/",         icon: Home,       group: "main" },
  { name: "البحث الشامل", href: "/search", icon: Search,     group: "main" },
  { name: "المبيعات",  href: "/pos",      icon: Scan,       group: "main", permission: "pos" },
  
  // Inventory
  { name: "المنتجات",  href: "/inventory", icon: Package,    group: "inventory", permission: "inventory" },
  { name: "الأصناف",   href: "/categories", icon: LayoutGrid, group: "inventory", permission: "inventory" },
  
  // Business
  { name: "العملاء",   href: "/customers", icon: Users,      group: "business", permission: "customers" },
  { name: "الموردين",  href: "/suppliers", icon: Truck,      group: "business", permission: "suppliers" },
  { name: "الديون",    href: "/debts",     icon: CreditCard, group: "business", permission: "finance" },
  { name: "الحركات",   href: "/transactions", icon: History, group: "business", permission: "transactions" },
  
  // Admin
  { name: "المالية",   href: "/finance",   icon: TrendingUp, group: "admin", permission: "finance" },
  { name: "الموظفين",  href: "/manage/employees", icon: Users,      group: "admin", permission: "staff" },
  { name: "الإدارة العامة", href: "/manage", icon: Settings,  group: "admin", permission: ["staff", "customers", "suppliers", "transactions"] },
];

const GROUP_LABELS = {
  main: "الرئيسية",
  inventory: "المخزن",
  business: "الأعمال",
  admin: "الإدارة"
};

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const [links, setLinks] = useState<NavLink[]>(ALL_LINKS);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role, permissions, email")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      setUserProfile({
        name: profile.full_name || "مستخدم",
        email: profile.email || user.email || "",
        role: profile.role === "Manager" ? "المدير العام" : "موظف"
      });

      const perms = profile.permissions as ProfilePermissions;
      const isManager = profile.role === "Manager";

      setLinks(
        ALL_LINKS.filter((link) => {
          if (!link.permission) return true;
          if (isManager) return true;
          if (Array.isArray(link.permission)) {
            return link.permission.some((p) => perms?.[p] === true);
          }
          return perms?.[link.permission] === true;
        })
      );
    }

    loadUserData();
  }, []);

  const groupedLinks = links.reduce((acc, link) => {
    if (!acc[link.group]) acc[link.group] = [];
    acc[link.group].push(link);
    return acc;
  }, {} as Record<string, NavLink[]>);

  return (
    <aside 
      className={cn(
        "fixed right-0 top-0 bottom-0 z-[60] hidden md:flex flex-col glass border-l border-white/5 transition-all duration-500 ease-in-out shadow-2xl shadow-black/50",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-white/5 backdrop-blur-3xl shrink-0">
        <AnimatePresence mode="wait">
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col leading-none"
            >
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-black text-primary tracking-widest uppercase">RT PRO</span>
              </div>
              <span className="text-lg font-black text-white whitespace-nowrap mt-0.5">سمارت ستور</span>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-xl hover:bg-primary/20 transition-all text-white/40 hover:text-primary active:scale-90"
        >
          {isSidebarCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto custom-scrollbar pt-6 pb-20 px-3 space-y-6">
        {(Object.keys(GROUP_LABELS) as (keyof typeof GROUP_LABELS)[]).map((groupKey) => {
          const groupLinks = groupedLinks[groupKey];
          if (!groupLinks?.length) return null;

          return (
            <div key={groupKey} className="space-y-1">
              {!isSidebarCollapsed && (
                <h3 className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 selection:bg-transparent">
                  {GROUP_LABELS[groupKey]}
                </h3>
              )}
              <div className="space-y-1">
                {groupLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;

                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={cn(
                        "group relative flex items-center h-11 rounded-xl transition-all duration-300",
                        isActive 
                          ? "bg-primary text-black font-black shadow-lg shadow-primary/10" 
                          : "text-white/40 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <div className="min-w-[44px] flex items-center justify-center">
                        <Icon className={cn("w-5 h-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                      </div>
                      
                      <AnimatePresence>
                        {!isSidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, x: 5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 5 }}
                            className="text-sm font-bold whitespace-nowrap pr-1"
                          >
                            {link.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      
                      {isActive && !isSidebarCollapsed && (
                        <div className="absolute inset-0 bg-white/5 blur-xl rounded-full -z-10" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="absolute bottom-0 inset-x-0 p-3 bg-black/40 backdrop-blur-2xl border-t border-white/5">
         <div className={cn(
           "flex items-center gap-3 overflow-hidden transition-all",
           isSidebarCollapsed ? "justify-center" : "px-1"
         )}>
           <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-inner">
             <span className="text-primary text-[10px] font-black">{userProfile?.name.substring(0, 2).toUpperCase() || "AD"}</span>
           </div>
           {!isSidebarCollapsed && (
             <div className="flex flex-col leading-none overflow-hidden text-right">
               <span className="text-[13px] font-black text-white truncate">{userProfile?.name || "تحميل..."}</span>
               <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1 h-1 rounded-full bg-green-500" />
                  <span className="text-[10px] text-white/30 truncate font-bold">{userProfile?.role || "جارٍ التحميل"}</span>
               </div>
             </div>
           )}
         </div>
      </div>
    </aside>
  );
}

