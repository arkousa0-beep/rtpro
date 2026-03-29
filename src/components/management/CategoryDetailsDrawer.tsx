"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Pencil, 
  Trash2, 
  Tag, 
  Clock, 
  ChevronLeft,
} from "lucide-react";
import { Category } from "@/lib/services/categoryService";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";

interface CategoryDetailsDrawerProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryDetailsDrawer({
  category,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: CategoryDetailsDrawerProps) {
  if (!category) return null;

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="تفاصيل التصنيف"
      description="Category Information Detail"
    >
      <div className="space-y-8">
        {/* Main Info */}
        <div className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col gap-4">
            <div className="space-y-1 text-right">
              <label className="text-white/20 text-[10px] font-black uppercase tracking-widest">
                اسم التصنيف
              </label>
              <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter">
                {category.name}
              </h3>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-indigo-500/50 to-transparent my-2" />
          </div>
          
          {/* Background Art */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-colors duration-700" />
        </div>

        {/* Timestamps */}
        {category.created_at && (
          <div className="flex items-center gap-6 px-4 justify-end">
            <div className="flex items-center gap-3 text-right">
              <div className="flex flex-col items-end">
                <span className="text-white/20 text-[9px] font-black uppercase block">تم الإنشاء في</span>
                <span className="text-white/60 text-sm font-bold">
                  {format(new Date(category.created_at), "PPP", { locale: ar })}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={() => {
              onEdit(category);
              onOpenChange(false);
            }}
            className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black gap-3 shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95 group order-1 sm:order-2"
          >
            <Pencil className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            تعديل البيانات
          </Button>
          <Button 
            variant="ghost"
            onClick={() => {
              onDelete(category.id);
              onOpenChange(false);
            }}
            className="h-14 w-full sm:w-14 rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center p-0 group order-2 sm:order-1"
          >
            <Trash2 className="w-6 h-6 group-hover:shake transition-transform" />
          </Button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}
