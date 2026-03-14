"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Scan, Package, MoreHorizontal, TrendingUp, Wallet, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const links = [
  { name: "الرئيسية", href: "/", icon: Home },
  { name: "المبيعات", href: "/pos", icon: Scan },
  { name: "المالية", href: "/finance", icon: () => (
    <div className="relative">
      <TrendingUp className="w-6 h-6" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
    </div>
  ) },
  { name: "المخزن", href: "/inventory", icon: Package },
  { name: "الإدارة", href: "/manage", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-20 glass border-t border-white/5 flex items-center justify-around px-2 pb-6 pt-2">
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
            <span className={cn("text-[10px] font-bold tracking-wide transition-opacity", !isActive && "opacity-70")}>
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
