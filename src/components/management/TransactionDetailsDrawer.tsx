"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { 
  Receipt, 
  Calendar, 
  User, 
  CreditCard, 
  Package, 
  X, 
  Printer, 
  MessageCircle,
  Hash,
  Clock,
  ChevronLeft,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { transactionService, TransactionDetails } from "@/lib/services/transactionService";
import { Badge } from "@/components/ui/badge";
import { ReturnDialog } from "@/components/ReturnDialog";
import { Item } from "@/lib/database.types";

interface TransactionDetailsDrawerProps {
  transactionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailsDrawer({
  transactionId,
  open,
  onOpenChange,
}: TransactionDetailsDrawerProps) {
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (transactionId && open) {
      loadTransaction();
    }
  }, [transactionId, open]);

  const loadTransaction = async () => {
    setLoading(true);
    try {
      if (transactionId) {
        const data = await transactionService.getTransactionDetails(transactionId);
        setTransaction(data);
      }
    } catch (error) {
      console.error("Failed to load transaction details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!transactionId) return null;

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
          
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.8rem] md:rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 mx-auto mb-4 mt-2">
            <Receipt className="w-8 h-8 md:w-10 md:h-10" />
          </div>
          <DrawerTitle className="text-center text-2xl md:text-3xl font-black text-white tracking-tight">
            تفاصيل العملية
          </DrawerTitle>
          <div className="flex justify-center gap-2 items-center mt-2">
            <Badge variant="outline" className="bg-white/5 border-white/10 text-white/40 px-3 py-1 font-black">
              #{transactionId.slice(0, 8)}
            </Badge>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 px-3 py-1 font-black">
              {({'Sale': 'بيع', 'Return': 'مرتجع', 'Payment': 'تحصيل', 'SupplierPayment': 'سداد مورد', 'Expense': 'مصروفات', 'Exchange': 'استبدال'} as Record<string, string>)[transaction?.type ?? ''] ?? transaction?.type ?? '...'}
            </Badge>
          </div>
        </DrawerHeader>

        <div className="overflow-y-auto custom-scrollbar px-2 space-y-6 pb-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
               <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
               <p className="text-white/40 font-black text-sm animate-pulse">جاري تحميل البيانات...</p>
            </div>
          ) : transaction ? (
            <>
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="glass p-4 rounded-[1.8rem] border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">التاريخ</span>
                  </div>
                  <p className="text-white font-black text-xs truncate">
                    {format(new Date(transaction.created_at), "dd MMM yyyy", { locale: ar })}
                  </p>
                </div>
                <div className="glass p-4 rounded-[1.8rem] border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">الوقت</span>
                  </div>
                  <p className="text-white font-black text-xs">
                    {format(new Date(transaction.created_at), "HH:mm a")}
                  </p>
                </div>
                <div className="glass p-4 rounded-[1.8rem] border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">طريقة الدفع</span>
                  </div>
                  <p className="text-white font-black text-xs">
                    {transaction.method === 'Cash' ? 'نقدي' : 
                     transaction.method === 'Debt' ? 'آجل' : 
                     transaction.method === 'Card' ? 'بطاقة' : transaction.method}
                  </p>
                </div>
                <div className="glass p-4 rounded-[1.8rem] border-white/5 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">العميل</span>
                  </div>
                  <p className="text-white font-black text-xs truncate">
                    {transaction.customers?.name || "عميل عابر"}
                  </p>
                </div>
              </div>

              {/* Items Section */}
              <div className="glass p-6 rounded-[2rem] border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                    <Package className="w-4 h-4" />
                  </div>
                  <h5 className="font-black text-white text-sm">العناصر المباعة ({transaction.items?.length || 0})</h5>
                </div>
                
                <div className="space-y-3">
                  {transaction.items && transaction.items.length > 0 ? (
                    transaction.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 border border-white/5 shrink-0 overflow-hidden">
                            {item.products.image_url ? (
                              <img 
                                src={item.products.image_url} 
                                alt={item.products.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-black text-sm truncate">{item.products.name}</p>
                            <div className="flex items-center gap-2 text-white/30 text-[10px] font-black tracking-widest">
                              <Hash className="w-3 h-3" />
                              {item.barcode}
                            </div>
                          </div>
                        </div>
                        <div className="text-left bg-white/5 py-2 px-4 rounded-xl border border-white/5">
                          <p className="text-indigo-400 font-black text-sm">
                            {Number(item.price ?? 0).toLocaleString()} <span className="text-[10px] opacity-40">ج.م</span>
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/20 text-xs text-center py-4 font-black italic">لا توجد عناصر مسجلة لهذه العملية</p>
                  )}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="glass p-6 rounded-[2rem] border-white/5 bg-indigo-500/5">
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-white/40 font-black text-xs px-2">
                      <span>الإجمالي</span>
                      <span>{transaction.total?.toLocaleString()} ج.م</span>
                   </div>
                   {transaction.method === 'Debt' && (
                     <>
                       <div className="flex justify-between items-center text-emerald-400/70 font-black text-xs px-2">
                           <span>المدفوع</span>
                           <span>{Number((transaction as any).paid_amount ?? 0).toLocaleString()} ج.م</span>
                       </div>
                       {Number(transaction.total) - Number((transaction as any).paid_amount ?? 0) > 0 && (
                         <div className="flex justify-between items-center text-red-400/70 font-black text-xs px-2">
                             <span>المتبقي (آجل)</span>
                             <span>{(Number(transaction.total) - Number((transaction as any).paid_amount ?? 0)).toLocaleString()} ج.م</span>
                         </div>
                       )}
                     </>
                   )}
                   <div className="h-px bg-white/5 mx-2 my-2" />
                   <div className="flex justify-between items-center px-2">
                      <span className="text-white font-black text-lg">الإجمالي</span>
                      <span className="text-white font-black text-2xl tracking-tighter">
                        {transaction.total?.toLocaleString()} <span className="text-sm">ج.م</span>
                      </span>
                   </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  className="flex-1 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black gap-3 border border-white/10 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all order-1 sm:order-2"
                  onClick={() => window.print()}
                >
                  <Printer className="w-5 h-5" />
                  طباعة الإيصال
                </Button>
                {transaction.type === 'Sale' && (
                  <ReturnDialog
                    initialCustomerId={transaction.customer_id}
                    initialItems={(transaction.items || []).map((i: any) => ({
                      id: i.id || i.barcode || '',
                      created_at: '',
                      barcode: i.barcode || '',
                      batch_id: null,
                      buying_price: 0,
                      selling_price: Number(i.price) || 0,
                      status: 'Sold',
                      product_id: i.products?.id || '',
                      products: { name: i.products?.name || '' }
                    } as unknown as Item))}
                    customTrigger={
                      <Button 
                        variant="outline"
                        className="flex-1 sm:flex-none h-14 px-6 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border-amber-500/20 font-black gap-2 transition-all order-2 sm:order-3"
                      >
                        <RotateCcw className="w-5 h-5" />
                        إرجاع مبدئي
                      </Button>
                    }
                  />
                )}
                {transaction.customers?.phone && (
                   <Button 
                      variant="outline"
                      className="w-full sm:w-14 h-14 rounded-2xl bg-white/5 border-white/10 text-white hover:bg-white/10 p-0 active:scale-95 transition-all order-3 sm:order-1"
                      onClick={() => window.open(`tel:${transaction.customers?.phone}`)}
                    >
                      <MessageCircle className="w-6 h-6" />
                    </Button>
                )}
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <p className="text-white/20 font-black">لم يتم العثور على تفاصيل لهذه العملية</p>
            </div>
          )}
        </div>
        <div className="h-8" />
      </DrawerContent>
    </Drawer>
  );
}
