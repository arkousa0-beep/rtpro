"use client";

import { Input } from "@/components/ui/input";
import { Search, Calendar, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ItemFiltersProps {
  onSearchChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onDateTypeChange: (value: 'Add' | 'Sale' | 'Return') => void;
  dateType: 'Add' | 'Sale' | 'Return';
}

export function ItemFilters({
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onDateTypeChange,
  dateType
}: ItemFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="ابحث بالباركود أو النص..." 
            className="glass pr-12 h-12 rounded-2xl border-white/5 focus-visible:ring-primary/30 text-right"
            dir="rtl"
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          className={cn(
            "glass h-12 px-4 rounded-2xl transition-all duration-300",
            showFilters ? "bg-primary/20 border-primary/30 text-white" : "border-white/5 text-white/50"
          )}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {showFilters && (
        <div className="glass p-4 rounded-3xl border border-white/10 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-white/60">الفلترة بالتاريخ</span>
            <div className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              {(['Add', 'Sale', 'Return'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => onDateTypeChange(t)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black transition-all",
                    dateType === t ? "bg-primary text-white" : "text-white/30 hover:text-white/50"
                  )}
                >
                  {t === 'Add' ? 'إضافة' : t === 'Sale' ? 'بيع' : 'ارتجاع'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white/20 mr-2 uppercase">من</span>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 pointer-events-none" />
                <Input 
                  type="date" 
                  className="glass h-10 pr-9 border-white/5 rounded-xl text-xs text-white/50 font-mono" 
                  onChange={(e) => onStartDateChange(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white/20 mr-2 uppercase">إلى</span>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 pointer-events-none" />
                <Input 
                  type="date" 
                  className="glass h-10 pr-9 border-white/5 rounded-xl text-xs text-white/50 font-mono" 
                  onChange={(e) => onEndDateChange(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
