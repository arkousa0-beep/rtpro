"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { 
  RotateCcw,
  Calendar,
  Clock,
  CreditCard,
  Package,
  X,
  Printer,
  Hash,
  Receipt,
  History,
  ChevronLeft,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getReturnDetails, ReturnRecord, ReturnItem } from "@/lib/services/returnService";

interface ReturnDetailsDrawerProps {
  returnId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewTransaction?: (transactionId: string) => void;
  onViewItemHistory?: (barcode: string) => void;
}

export function ReturnDetailsDrawer({
  returnId,
  open,
  onOpenChange,
  onViewTransaction,
  onViewItemHistory,
}: ReturnDetailsDrawerProps) {
  const [returnRecord, setReturnRecord] = useState<ReturnRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (returnId && open) {
      loadReturn();
    }
  }, [returnId, open]);

  const loadReturn = async () => {
    setLoading(true);
    try {
      if (returnId) {
        const data = await getReturnDetails(returnId);
        setReturnRecord(data);
      }
    } catch (error) {
      console.error("Failed to load return details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!returnId) return null;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-black/80 backdrop-blur-2xl border-white/5 rounded-t-[2.5rem] p-6 outline-none max-h-[95vh]">
        <DrawerHeader className="pb-8 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 w-10 h-10 rounded-full bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all z-50"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.8rem] md:rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 mx-auto mb-4 mt-2">
            <RotateCcw className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <DrawerTitle className="text-center text-2xl md:text-3xl font-black text-white tracking-tight">
            تفاصيل المرتجع
          </DrawerTitle>
          <div className="flex justify-center gap-2 items-center mt-2">
            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/40 px-3 py-1 font-black">
              #{returnId.slice(0, 8)}
            </Badge>
            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 font-black">
              {returnRecord?.status === 'completed' ? 'مكتمل' : returnRecord?.status === 'pending' ? 'قيد الانتظار' : 'ملغي'}
            </Badge>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto custom-scrollbar px-2 space-y-6 pb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
               <p className="text-white/40 font-black text-sm animate-pulse">جاري تحميل البيانات...</p>
            </div>
          ) : returnRecord ? (
            <>
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="glass p-4 rounded-[1.8rem] border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">التاريخ</span>
                  </div>
                  <p className="text-white font-black text-xs truncate">
                    {new Date(returnRecord.created_at).toLocaleDateString('ar-EG')}
                  </p>
                </div>
                <div className="glass p-4 rounded-[1.8rem] border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">الوقت</span>
                  </div>
                  <p className="text-white font-black text-xs">
                    {new Date(returnRecord.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="glass p-4 rounded-[1.8rem] border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">طريقة الاسترجاع</span>
                  </div>
                  <p className="text-white font-black text-xs">
                    {returnRecord.refund_method === 'Cash' ? 'نقدي' : 'رصيد الحساب'}
                  </p>
                </div>
                <div className="glass p-4 rounded-[1.8rem] border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Package className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">العميل</span>
                  </div>
                  <p className="text-white font-black text-xs truncate">
                    {returnRecord.customer_name || "عميل عام"}
                  </p>
                </div>
              </div>

              {/* Transaction History Link */}
              <div className="glass p-5 rounded-[2rem] border-white/5 bg-amber-500/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-black text-white text-sm">تاريخ العملية</h5>
                      <p className="text-[10px] text-white/30 font-bold">عرض تفاصيل عملية البيع الأصلية</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="h-10 w-10 rounded-xl bg-white/5 border-white/10 text-white hover:bg-white/10 p-0 active:scale-95 transition-all"
                    onClick={() => onViewTransaction?.(returnRecord.transaction_id)}
                    title="عرض تاريخ العملية"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Items Section */}
              <div className="glass p-6 rounded-[2rem] border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  <h5 className="font-black text-white text-sm">القطع المرتجعة ({returnRecord.items?.length || 0})</h5>
                </div>
                
                <div className="space-y-3">
                  {returnRecord.items && returnRecord.items.length > 0 ? (
                    returnRecord.items.map((item: ReturnItem, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 border border-white/5 shrink-0 overflow-hidden">
                            <Hash className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-black text-sm truncate">{item.product_name}</p>
                            <div className="flex items-center gap-2 text-white/30 text-[10px] font-black tracking-widest">
                              <Hash className="w-3 h-3" />
                              {item.barcode}
                            </div>
                            {item.sold_date && (
                              <div className="flex items-center gap-1 mt-1 text-white/20 text-[10px]">
                                <Calendar className="w-3 h-3" />
                                <span>تاريخ البيع: {new Date(item.sold_date).toLocaleDateString('ar-EG')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <p className="text-amber-400 font-black text-sm">
                            {Number(item.price ?? 0).toLocaleString()} <span className="text-[10px] opacity-40">ج.م</span>
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] font-black text-amber-500/50 hover:text-amber-500 hover:bg-amber-500/10 gap-1 px-2"
                            onClick={() => onViewItemHistory?.(item.barcode)}
                          >
                            <History className="w-3 h-3" />
                            تاريخ القطعة
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/20 text-xs text-center py-4 font-black italic">لا توجد عناصر مسجلة لهذا المرتجع</p>
                  )}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="glass p-6 rounded-[2rem] border-white/5 bg-amber-500/5">
                <div className="space-y-3">
                  {returnRecord.reason && (
                    <div className="flex justify-between items-center text-white/40 font-black text-xs px-2">
                      <span>السبب</span>
                      <span className="text-white/60 text-right">{returnRecord.reason}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-white/40 font-black text-xs px-2">
                    <span>عدد القطع</span>
                    <span>{returnRecord.items_count || returnRecord.items?.length || 0}</span>
                  </div>
                  <div className="h-px bg-white/5 mx-2 my-2" />
                  <div className="flex justify-between items-center px-2">
                    <span className="text-white font-black text-lg">الإجمالي المسترد</span>
                    <span className="text-amber-400 font-black text-2xl tracking-tighter">
                      {(returnRecord.total_amount || returnRecord.items?.reduce((s: number, i: ReturnItem) => s + Number(i.price), 0) || 0).toLocaleString()} <span className="text-sm">ج.م</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  className="flex-1 h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black font-black gap-3 border border-white/10 shadow-xl shadow-amber-500/20 active:scale-95 transition-all order-1 sm:order-2"
                  onClick={() => window.print()}
                >
                  <Printer className="w-5 h-5" />
                  طباعة تقرير الإرجاع
                </Button>
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <p className="text-white/20 font-black">لم يتم العثور على تفاصيل لهذا المرتجع</p>
            </div>
          )}
        </div>
        <div className="h-8" />
      </DrawerContent>
    </Drawer>
  );
}
