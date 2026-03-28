"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Product } from "@/lib/services/productService";
import { Box, Calendar, Tag, Activity, Edit3, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ProductDetailsDrawerProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductDetailsDrawer({
  product,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ProductDetailsDrawerProps) {
  if (!product) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-black/80 backdrop-blur-2xl border-white/5 rounded-t-[2.5rem] p-6 outline-none">
        <DrawerHeader className="pb-8 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 w-10 h-10 rounded-full bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all z-50"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] md:rounded-[3rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 mx-auto mb-4 mt-2 overflow-hidden shadow-2xl shadow-indigo-500/10">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover scale-110"
              />
            ) : (
              <Box className="w-10 h-10 md:w-12 md:h-12" />
            )}
          </div>
          <DrawerTitle className="text-center text-2xl md:text-3xl font-black text-white tracking-tight">
            {product.name}
          </DrawerTitle>
          <p className="text-center text-white/30 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-2">
            تفاصيل المنتج والمواصفات
          </p>
        </DrawerHeader>

        <div className="space-y-4 px-2">
          {/* Main Info Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="glass p-4 md:p-5 rounded-[1.8rem] md:rounded-3xl border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-indigo-500">
                <Tag className="w-3.5 h-3.5" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider">التصنيف</span>
              </div>
              <p className="text-white font-black text-base md:text-lg truncate">
                {product.categories?.name || "بدون تصنيف"}
              </p>
            </div>
            <div className="glass p-4 md:p-5 rounded-[1.8rem] md:rounded-3xl border-white/5 space-y-2">
              <div className="flex items-center gap-2 text-indigo-500">
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider">تاريخ الإضافة</span>
              </div>
              <p className="text-white font-black text-base md:text-lg">
                {(product as any).created_at ? format(new Date((product as any).created_at), "dd MMMM yyyy", { locale: ar }) : "غير متوفر"}
              </p>
            </div>
          </div>

          {/* Activity Section Placeholder */}
          <div className="glass p-6 rounded-[2rem] border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Activity className="w-4 h-4" />
                </div>
                <h5 className="font-black text-white text-sm">نشاط المنتج</h5>
              </div>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">آخر 30 يوم</span>
            </div>
            <p className="text-white/40 text-xs text-center py-4 font-bold italic">
              سيظهر سجل حركات المخزن لهذا المنتج قريباً...
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <Button 
              className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black gap-2 border border-white/10 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all order-1 sm:order-2"
              onClick={() => {
                onEdit(product);
                onOpenChange(false);
              }}
            >
              <Edit3 className="w-5 h-5" />
              تعديل البيانات
            </Button>
            <Button 
              variant="destructive"
              className="w-full sm:w-14 h-14 rounded-2xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/10 p-0 active:scale-95 transition-all order-2 sm:order-1"
              onClick={() => {
                onDelete(product.id!);
                onOpenChange(false);
              }}
            >
              <Trash2 className="w-6 h-6" />
            </Button>
          </div>
        </div>
        <div className="h-8" />
      </DrawerContent>
    </Drawer>
  );
}
