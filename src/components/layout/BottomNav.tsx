"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Scan, Package, TrendingUp, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { ProfilePermissions } from "@/lib/database.types";

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
            className={cn(
              "relative flex flex-col items-center justify-center gap-1.5 w-16 h-12 transition-all duration-300",
              isActive ? "text-primary" : "text-muted-foreground/60 hover:text-white"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="nav-active"
                className="absolute -top-1 w-8 h-1 bg-primary rounded-full blur-[2px]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} />
            <span className={cn("text-[12px] font-bold tracking-wide transition-opacity", !isActive && "opacity-70")}>
              {link.name}
            </span>
            {isActive && (
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full -z-10" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
