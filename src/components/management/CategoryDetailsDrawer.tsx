"use client";

import React from "react";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { 
  Pencil, 
  Trash2, 
  Tag, 
  Clock, 
  Info,
  ChevronLeft,
  X
} from "lucide-react";
import { Category } from "@/lib/services/categoryService";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh] outline-none">
        <div className="mx-auto w-full max-w-2xl px-6">
          <DrawerHeader className="px-0 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <Tag className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <DrawerTitle className="text-3xl font-black text-white italic uppercase">
                    تفاصيل التصنيف
                  </DrawerTitle>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">
                    Category Information Detail
                  </p>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5">
                  <X className="w-5 h-5 text-white/40" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="py-8 space-y-8 overflow-y-auto max-h-[50vh]">
            {/* Main Info */}
            <div className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
              <div className="relative z-10 flex flex-col gap-4">
                <div className="space-y-1">
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
              <div className="flex items-center gap-6 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <span className="text-white/20 text-[9px] font-black uppercase block">تم الإنشاء في</span>
                    <span className="text-white/60 text-sm font-bold">
                      {format(new Date(category.created_at), "PPP", { locale: ar })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DrawerFooter className="px-0 py-8 border-t border-white/5 gap-4">
            <div className="flex gap-4">
              <Button 
                onClick={() => {
                  onEdit(category);
                  onOpenChange(false);
                }}
                className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black gap-3 shadow-xl shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95 group"
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
                className="h-14 w-14 rounded-2xl border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center p-0 group"
              >
                <Trash2 className="w-6 h-6 group-hover:shake transition-transform" />
              </Button>
            </div>
            
            <DrawerClose asChild>
              <Button 
                variant="ghost" 
                className="w-full h-12 rounded-xl text-white/20 hover:text-white/40 hover:bg-white/5 font-bold uppercase tracking-widest gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                إغلاق النافذة
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
