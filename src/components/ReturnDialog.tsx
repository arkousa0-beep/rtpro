"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RotateCcw, Search, Barcode, Trash2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Item } from "@/lib/database.types";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ReturnDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [itemsToReturn, setItemsToReturn] = useState<Item[]>([]);
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSearch = async () => {
    if (!barcode.trim()) return;

    // Check if already in list
    if (itemsToReturn.some(i => i.barcode === barcode.trim())) {
      toast.error("هذه القطعة مضافة بالفعل في قائمة المرتجعات");
      setBarcode("");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*, products(name)')
      .eq('barcode', barcode.trim())
      .eq('status', 'Sold')
      .single();

    if (error || !data) {
      toast.error("القطعة غير موجودة أو لم يتم بيعها مسبقاً");
    } else {
      setItemsToReturn(prev => [data, ...prev]);
      setBarcode("");
    }
    setLoading(false);
  };

  const handleRemove = (barcodeToRemove: string) => {
    setItemsToReturn(prev => prev.filter(i => i.barcode !== barcodeToRemove));
  };

  const handleReturnAll = async () => {
    if (itemsToReturn.length === 0) return;
    setIsProcessing(true);

    try {
      let successCount = 0;
      // Process returns sequentially to handle potential individual DB errors
      for (const item of itemsToReturn) {
        const { data, error } = await supabase.rpc('process_return', {
          p_barcode: item.barcode,
          p_reason: reason || 'مرتجع عميل'
        });

        if (!error && (!data || data.success !== false)) {
          successCount++;
        }
      }

      if (successCount === itemsToReturn.length) {
        toast.success(`تم إرجاع عدد ${successCount} قطع للمخزن بنجاح`);
        setOpen(false);
        reset();
      } else {
        toast.warning(`تم إرجاع ${successCount} من أصل ${itemsToReturn.length} قطع`);
        // Remove successful ones from list
        // Note: For a real app, you'd want a more robust bulk RPC call
        reset();
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الإرجاع");
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setBarcode("");
    setItemsToReturn([]);
    setReason("");
  };

  const totalReturnAmount = itemsToReturn.reduce((sum, item) => sum + Number(item.selling_price), 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="h-20 rounded-[2rem] flex-1 border-white/5 bg-white/5 text-xl font-bold text-white/60 hover:text-white hover:bg-white/10 hover:border-amber-500/30 transition-all group"
        >
          <RotateCcw className="w-6 h-6 ml-3 text-amber-500 group-hover:rotate-[-45deg] transition-transform" />
          مرتجع مبيعات
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-white/10 rounded-[3rem] sm:max-w-xl p-8 overflow-hidden bg-black/95 backdrop-blur-3xl shadow-2xl shadow-amber-500/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -z-10" />
        
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-black text-white text-right flex items-center justify-end gap-3">
            إرجاع بضاعة
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <RotateCcw className="w-6 h-6" />
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button 
                onClick={handleSearch} 
                disabled={loading} 
                className="h-16 w-16 shrink-0 rounded-2xl bg-amber-500 hover:bg-amber-600 text-black border-none active:scale-95 transition-all shadow-lg shadow-amber-500/20"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
              </Button>
              <div className="relative flex-1 group">
                <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/30 group-focus-within:text-amber-500 transition-colors" />
                <Input 
                  placeholder="افحص باركود القطعة المباعة..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-16 pr-14 rounded-2xl bg-white/5 border-white/5 text-white text-lg font-bold placeholder:text-white/20 focus:bg-white/10 transition-all border-none focus:ring-0 text-right"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-4 min-h-[200px] flex flex-col">
            <div className="flex items-center justify-between px-2 mb-3">
              <span className="text-xs font-black text-white/30 uppercase tracking-widest">المبلغ المسترد المتوقع: {totalReturnAmount} ج.م</span>
              <span className="text-xs font-black text-white/30 uppercase tracking-widest">القطع المراد إرجاعها ({itemsToReturn.length})</span>
            </div>

            <ScrollArea className="flex-1 pr-2 max-h-[250px]">
              <AnimatePresence>
                {itemsToReturn.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-10 text-white/20 space-y-3"
                  >
                    <Barcode className="w-12 h-12 opacity-20" />
                    <p className="font-bold">قم بمسح باركود القطع المراد إرجاعها للمخزن</p>
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {itemsToReturn.map((item) => (
                      <motion.div
                        key={item.barcode}
                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        className="flex items-center justify-between p-3 px-4 rounded-2xl bg-white/5 border border-white/5 group hover:border-amber-500/30 transition-all"
                      >
                        <div className="flex-1 text-right">
                          <span className="font-bold text-white block">{item.products?.name}</span>
                          <div className="flex items-center justify-end gap-2 mt-1">
                            <span className="text-[10px] font-mono text-white/40">{item.barcode}</span>
                            <span className="text-xs font-black text-amber-500">{item.selling_price} ج.م</span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemove(item.barcode)}
                          className="ml-4 h-10 w-10 rounded-xl text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </div>

          <div className="space-y-3">
            <Textarea
              placeholder="سبب الإرجاع أو ملاحظات (اختياري)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px] rounded-2xl bg-white/5 border-none text-right text-white font-bold placeholder:text-white/20 focus:bg-white/10 transition-all resize-none p-4"
            />
          </div>

          <Button
            onClick={handleReturnAll}
            disabled={isProcessing || itemsToReturn.length === 0}
            className="w-full h-16 rounded-[1.5rem] text-xl font-black bg-amber-500 text-black hover:bg-amber-400 shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                تأكيد إرجاع {itemsToReturn.length} قطع
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
