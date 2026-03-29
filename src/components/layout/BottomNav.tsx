"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Scan, Package, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ProfilePermissions } from "@/lib/database.types";
import { useHaptics } from "@/hooks/useHaptics";

interface NavLink {
  name: string;
  href: string;
  icon: React.ElementType;
  permission?: keyof ProfilePermissions | (keyof ProfilePermissions)[];
}

const ALL_LINKS: NavLink[] = [
  { name: "الرئيسية", href: "/",         icon: Home },
  { name: "المبيعات",  href: "/pos",      icon: Scan,      permission: "pos" },
  { name: "المالية",   href: "/finance",  icon: TrendingUp, permission: "finance" },
  { name: "المخزن",   href: "/inventory", icon: Package,   permission: "inventory" },
  { name: "الإدارة",  href: "/manage",    icon: Settings,  permission: ["staff", "customers", "suppliers", "transactions"] },
];

export function BottomNav() {
  const pathname = usePathname();
  const [links, setLinks] = useState<NavLink[]>(ALL_LINKS);
  const { selection } = useHaptics();

  useEffect(() => {
    async function loadPermissions() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, permissions")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      const perms = profile.permissions as ProfilePermissions;
      const isManager = profile.role === "Manager";

      setLinks(
        ALL_LINKS.filter((link) => {
          if (!link.permission) return true; // always visible (Home)
          if (isManager) return true;
          
          if (Array.isArray(link.permission)) {
            return link.permission.some((p) => perms?.[p] === true);
          }
          
          return perms?.[link.permission] === true;
        })
      );
    }

    loadPermissions();
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 glass border-t border-white/5 flex md:hidden items-center justify-around px-2 pb-6 pt-2">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.name}
            href={link.href}
            onClick={() => selection()}
            className={cn(
              "relative flex flex-col items-center justify-center gap-1.5 w-16 h-12 transition-all duration-300",
              isActive ? "text-primary" : "text-muted-foreground/60 hover:text-white"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="nav-active-pill"
                className="absolute -top-3 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            <div className="relative">
              <Icon className={cn("w-6 h-6 transition-all duration-300", 
                isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" : "scale-100"
              )} />
              {isActive && (
                <motion.div
                  layoutId="nav-bg-glow"
                  className="absolute inset-0 bg-primary/20 blur-xl rounded-full -z-10"
                  initial={false}
                />
              )}
            </div>

            <span className={cn("text-[11px] font-black tracking-wide transition-all duration-300", 
              isActive ? "text-primary translate-y-0.5" : "text-white/40 opacity-70"
            )}>
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
