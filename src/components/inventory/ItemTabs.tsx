"use client";

import { cn } from "@/lib/utils";
import { Package, DollarSign, RotateCcw, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

interface ItemTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    all: number;
    available: number;
    sold: number;
    returned: number;
  };
}

export function ItemTabs({ activeTab, onTabChange, counts }: ItemTabsProps) {
  const tabs = [
    { id: 'All', label: 'الكل', icon: LayoutGrid, count: counts.all, color: 'text-white' },
    { id: 'In-Stock', label: 'متاح', icon: Package, count: counts.available, color: 'text-emerald-500' },
    { id: 'Sold', label: 'مباع', icon: DollarSign, count: counts.sold, color: 'text-blue-500' },
    { id: 'Returned', label: 'مرتجع', icon: RotateCcw, count: counts.returned, color: 'text-amber-500' },
  ];

  return (
    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 backdrop-blur-xl overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm whitespace-nowrap min-w-[100px] justify-center",
            activeTab === tab.id ? "text-white shadow-lg" : "text-white/40 hover:text-white/60"
          )}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-primary/20 border border-primary/20 rounded-xl"
              initial={false}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <tab.icon className={cn("w-4 h-4 relative z-10", activeTab === tab.id ? tab.color : "text-current")} />
          <span className="relative z-10">{tab.label}</span>
          <span className={cn(
            "relative z-10 text-[10px] px-1.5 py-0.5 rounded-full font-black",
            activeTab === tab.id ? "bg-primary text-white" : "bg-white/10 text-white/30"
          )}>
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
