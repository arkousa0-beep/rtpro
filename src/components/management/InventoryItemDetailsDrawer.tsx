"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { inventoryService } from "@/lib/services/inventoryService";
import { 
  Package, 
  Barcode, 
  Calendar, 
  User, 
  History, 
  Tag, 
  DollarSign, 
  ArrowRightLeft,
  X,
  ShieldCheck,
  Building,
  Activity,
  Box
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { TransactionDetailsDrawer } from "./TransactionDetailsDrawer";

const ACTION_MAP: Record<string, { label: string; color: string }> = {
  'Sold': { label: 'عملية بيع', color: 'text-amber-500' },
  'Add': { label: 'إضافة للمخزن', color: 'text-emerald-500' },
  'Return': { label: 'عملية مرتجع', color: 'text-rose-500' },
  'Exchange': { label: 'عملية استبدال', color: 'text-blue-500' },
  'In-Stock': { label: 'إضافة للمخزن', color: 'text-emerald-500' }
};

interface InventoryItemDetailsDrawerProps {
  barcode: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InventoryItemDetailsDrawer({
  barcode,
  open,
  onOpenChange,
}: InventoryItemDetailsDrawerProps) {
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);

  useEffect(() => {
    if (barcode && open) {
      fetchItemDetails(barcode);
    }
  }, [barcode, open]);

  async function fetchItemDetails(bc: string) {
    setLoading(true);
    try {
      const data = await inventoryService.getItemDetails(bc);
      setItem(data);
    } catch (error) {
      console.error("Error fetching item details:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!barcode) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-black/80 backdrop-blur-2xl border-white/5 rounded-t-[2.5rem] p-6 outline-none max-h-[92vh]">
        <DrawerHeader className="pb-4 relative">
          <div
            className="absolute left-4 top-4 w-10 h-10 rounded-full bg-white/5 border border-white/5 text-white/40 flex items-center justify-center cursor-pointer hover:text-white hover:bg-white/10 transition-all z-50"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </div>
          
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] md:rounded-[3rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 mx-auto mb-4 mt-2 overflow-hidden shadow-2xl shadow-indigo-500/10">
            {item?.products?.image_url ? (
              <img 
                src={item.products.image_url} 
                alt={item.products.name} 
                className="w-full h-full object-cover scale-110"
              />
            ) : (
              <Box className="w-10 h-10 md:w-12 md:h-12" />
            )}
          </div>
          <DrawerTitle className="text-center text-2xl font-black text-white tracking-tight">
            تفاصيل القطعة
          </DrawerTitle>
          <p className="text-center text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            تتبع الحركات والبيانات الأساسية
          </p>
        </DrawerHeader>

        <div className="overflow-y-auto px-2 pb-6 flex-1 min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
              <Activity className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xs font-black">جاري تحميل البيانات...</p>
            </div>
          ) : item ? (
            <div className="space-y-6">
              {/* Product Info Header */}
              <div className="glass p-6 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white">{item.products?.name}</h3>
                    <p className="text-white/40 text-xs font-bold">{item.products?.categories?.name}</p>
                  </div>
                  <div className={cn(
                    "px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest",
                    item.status === 'In-Stock' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/10" :
                    item.status === 'Sold' ? "bg-amber-500/10 text-amber-500 border border-amber-500/10" :
                    "bg-white/10 text-white/40 border border-white/10"
                  )}>
                    {item.status === 'In-Stock' ? 'موجود بالمخزن' : 
                     item.status === 'Sold' ? 'مباع' : 'مرتجع'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-white/20">
                      <Barcode className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-wider">السيريال / الباركود</span>
                    </div>
                    <p className="text-white font-mono font-black text-sm tracking-widest">{item.barcode}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center gap-1.5 text-white/20 justify-end">
                      <Tag className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-wider">تاريخ الإضافة</span>
                    </div>
                    <p className="text-white font-black text-sm tracking-tight">
                      {item.created_at ? format(new Date(item.created_at), "dd/MM/yyyy") : '---'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing & Source */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass p-5 rounded-[2rem] border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">التكلفة</span>
                  </div>
                  <p className="text-white font-black text-lg">
                    {Number(item.cost_price).toLocaleString()} <span className="text-[10px] text-white/30">ج.م</span>
                  </p>
                </div>
                <div className="glass p-5 rounded-[2rem] border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">سعر البيع</span>
                  </div>
                  <p className="text-white font-black text-lg">
                    {Number(item.products?.selling_price).toLocaleString()} <span className="text-[10px] text-white/30">ج.م</span>
                  </p>
                </div>
              </div>

              {/* Timeline / History */}
              <div className="glass p-6 rounded-[2.5rem] border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <History className="w-5 h-5" />
                  </div>
                  <h5 className="font-black text-white text-sm">تتبع الحركات</h5>
                </div>

                <div className="relative space-y-6 before:absolute before:right-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/5">
                  {item.history?.length > 0 ? (
                    item.history.map((h: any, idx: number) => (
                      <div key={h.id} className="relative flex items-start gap-4 pr-10 group">
                        <div className={cn(
                          "absolute right-2.5 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-black z-10 transition-transform group-hover:scale-125",
                          idx === 0 ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" : "bg-white/10"
                        )} />
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <p className={cn("font-black text-xs", ACTION_MAP[h.action]?.color || "text-white")}>
                              {ACTION_MAP[h.action]?.label || h.action}
                            </p>
                            <span className="text-white/20 text-[9px] font-bold">
                              {format(new Date(h.created_at), "hh:mm a", { locale: ar })}
                            </span>
                          </div>
                          <p className="text-white/40 text-[10px] font-bold leading-relaxed">
                            {h.details || 'تم تنفيذ العملية عبر النظام'}
                          </p>
                          
                          {h.action === 'Sold' && h.target_id && (
                             <button 
                               onClick={() => {
                                 setSelectedTransactionId(h.target_id);
                                 setIsTransactionOpen(true);
                               }}
                               className="mt-2 px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[9px] font-black text-amber-500 hover:bg-amber-500/10 transition-colors flex items-center gap-1.5"
                             >
                               <ArrowRightLeft className="w-3 h-3" />
                               عرض الفاتورة
                             </button>
                          )}
                          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/[0.02]">
                            <User className="w-3 h-3 text-white/20" />
                            <span className="text-white/40 text-[9px] font-black">
                              بواسطة: {h.created_by_profile?.full_name || 'النظام'}
                            </span>
                            <span className="text-white/20 mr-auto text-[9px] font-bold">
                              {format(new Date(h.created_at), "dd MMM yyyy", { locale: ar })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 opacity-20">
                      <p className="text-xs font-bold italic">لا يوجد سجل حركات مفصل متاح</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 opacity-20">
              <p className="text-sm font-bold">لم يتم العثور على بيانات لهذه القطعة</p>
            </div>
          )}
        </div>
      </DrawerContent>

      <TransactionDetailsDrawer 
        transactionId={selectedTransactionId}
        open={isTransactionOpen}
        onOpenChange={setIsTransactionOpen}
      />
    </Drawer>
  );
}
