"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, RotateCcw, Search, Barcode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Item } from "@/lib/database.types";

export function ReturnDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [item, setItem] = useState<Item | null>(null);
  const [reason, setReason] = useState("");

  const handleSearch = async () => {
    if (!barcode) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('items')
      .select('*, products(name)')
      .eq('barcode', barcode)
      .eq('status', 'Sold')
      .single();

    if (error || !data) {
      toast.error("القطعة غير موجودة أو ليست في حالة 'مباع'");
      setItem(null);
    } else {
      setItem(data);
    }
    setLoading(false);
  };

  const handleReturn = async () => {
    if (!item) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc('process_return', {
        p_barcode: item.barcode,
        p_reason: reason || 'لم يذكر'
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.message);

      toast.success("تم إرجاع القطعة للمخزن بنجاح");
      setOpen(false);
      reset();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الإرجاع");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setBarcode("");
    setItem(null);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button 
          variant="outline" 
          className="h-20 rounded-[2rem] flex-1 border-white/5 bg-white/5 text-xl font-bold text-white/60 hover:text-white hover:bg-white/10 hover:border-amber-500/30 transition-all group"
        >
          <RotateCcw className="w-6 h-6 ml-3 text-amber-500 group-hover:rotate-[-45deg] transition-transform" />
          مرتجع مبيعات
        </Button>
      } />
      <DialogContent className="glass border-white/10 rounded-[3rem] sm:max-w-md p-8 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -z-10" />
        
        <DialogHeader className="mb-6">
          <DialogTitle className="text-3xl font-black text-white text-right flex items-center justify-end gap-3">
            إرجاع قطعة
            <RotateCcw className="w-6 h-6 text-amber-500" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block text-right">سيريال / باركود القطعة</label>
            <div className="flex gap-3">
              <Button 
                onClick={handleSearch} 
                disabled={loading} 
                size="icon" 
                className="h-16 w-16 shrink-0 rounded-2xl bg-white/5 hover:bg-white/10 text-amber-500 border border-white/5 active:scale-90 transition-all"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
              </Button>
              <div className="relative flex-1 group">
                <Barcode className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-amber-500 transition-colors" />
                <Input 
                  placeholder="افحص الباركود..."
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="h-16 pr-14 rounded-2xl bg-white/5 border-white/5 text-white text-lg font-bold placeholder:text-white/10 focus:bg-white/10 transition-all border-none focus:ring-0 text-right"
                />
              </div>
            </div>
          </div>

          <AnimatePresence>
            {item && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 space-y-6 relative overflow-hidden"
              >
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black text-white">{item.products?.name}</span>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">المنتج</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-mono text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">{item.barcode}</span>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">S/N</span>
                  </div>
                  
                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block text-right">سبب الإرجاع (اختياري)</label>
                    <Textarea 
                      placeholder="لماذا يتم إرجاع هذه القطعة؟"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="min-h-[100px] rounded-2xl bg-white/5 border-none text-right text-white font-bold placeholder:text-white/10 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <Button 
                    onClick={handleReturn} 
                    disabled={loading} 
                    className="w-full h-16 rounded-2xl text-xl font-black bg-amber-500 text-black hover:bg-amber-400 shadow-xl shadow-amber-500/10 active:scale-[0.98] transition-all"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin ml-3" /> : <RotateCcw className="w-5 h-5 ml-3" />}
                    تأكيد المرتجع
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
