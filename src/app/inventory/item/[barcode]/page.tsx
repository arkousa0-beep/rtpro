"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Item, ItemHistory } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, History, Package, Tag, Circle, DollarSign, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ItemDetailsPage() {
  const params = useParams();
  const barcode = params.barcode as string;
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [history, setHistory] = useState<ItemHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemDetails();
  }, [barcode]);

  async function fetchItemDetails() {
    setLoading(true);
    try {
      const { data: itemData, error: itemError } = await supabase
        .from('inventory')
        .select('*, products(*, categories(*))')
        .eq('barcode', barcode)
        .single();

      if (itemError) throw itemError;
      setItem(itemData);

      const { data: historyData, error: historyError } = await supabase
        .from('item_history')
        .select('*')
        .eq('item_barcode', barcode)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;
      setHistory(historyData || []);
    } catch (error) {
      console.error("Error fetching item details:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white/50">
        <Package className="w-16 h-16 opacity-20" />
        <h2 className="text-2xl font-black">القطعة غير موجودة</h2>
        <Button variant="outline" asChild className="glass mt-4">
          <Link href="/inventory">العودة للمخزن</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 space-y-6 max-w-3xl mx-auto text-right" dir="rtl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-2xl glass" onClick={() => router.back()}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-black text-white">تفاصيل القطعة</h2>
          <p className="text-sm text-white/50">{item.products?.name}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="glass border-white/5 rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10" />
          <CardContent className="p-8 space-y-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-inner">
                  <Package className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-2">{item.products?.name}</h3>
                  <div className="flex items-center gap-2 text-white/40">
                    <Tag className="w-4 h-4" />
                    <span className="font-mono text-lg tracking-wider font-bold">{item.barcode}</span>
                  </div>
                </div>
              </div>
              
              <div className={cn(
                "px-4 py-2 rounded-2xl flex items-center gap-2 border text-sm font-black",
                item.status === 'In-Stock' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-500'
              )}>
                <Circle className={cn("w-2 h-2 fill-current", item.status === 'In-Stock' && "animate-pulse")} />
                {item.status === 'In-Stock' ? 'متوفر بالمخزن' : 'تم البيع'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-2">
                <span className="text-xs font-black text-white/20 uppercase tracking-widest flex items-center gap-2">
                  <DollarSign className="w-3 h-3" /> سعر البيع
                </span>
                <p className="text-3xl font-black text-white">
                  {Number(item.selling_price).toLocaleString()} <span className="text-sm text-emerald-500">ج.م</span>
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-2 text-left">
                <span className="text-xs font-black text-white/20 uppercase tracking-widest flex items-center gap-2 justify-end">
                   سعر التكلفة <DollarSign className="w-3 h-3" />
                </span>
                <p className="text-3xl font-black text-white/40">
                  {Number(item.cost_price).toLocaleString()} <span className="text-sm">ج.م</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge className="bg-white/5 text-white/50 border-white/10 px-4 py-2 rounded-xl font-bold flex gap-2">
                <Calendar className="w-4 h-4" /> تم الإضافة: {new Date(item.created_at || "").toLocaleDateString('ar-EG')}
              </Badge>
              {item.sold_date && (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-4 py-2 rounded-xl font-bold flex gap-2">
                  <Calendar className="w-4 h-4" /> تاريخ البيع: {new Date(item.sold_date).toLocaleDateString('ar-EG')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" /> سجل الحركات
          </h3>
        </div>
        
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 glass rounded-[2.5rem] border border-white/5 text-white/20 italic">
              لا توجد سجلات حركات لهذه القطعة حتى الآن
            </div>
          ) : (
            history.map((h, i) => (
              <Card key={h.id} className="glass border-white/5 rounded-2xl overflow-hidden relative">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center border",
                      h.action === 'Received' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      h.action === 'Sold' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                      'bg-amber-500/10 border-amber-500/20 text-amber-500'
                    )}>
                      {h.action === 'Received' ? <Package className="w-6 h-6" /> : 
                       h.action === 'Sold' ? <DollarSign className="w-6 h-6" /> : 
                       <History className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white leading-none mb-1">
                        {h.action === 'Received' ? 'استلام قطعة' : 
                         h.action === 'Sold' ? 'بيع قطعة' : 
                         h.action === 'Returned' ? 'مرتجع' : 'تعديل بيانات'}
                      </h4>
                      <p className="text-xs text-white/30">{h.details || 'لا توجد تفاصيل إضافية'}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-mono text-white/20 font-bold tracking-tighter">
                      {new Date(h.created_at).toLocaleString('ar-EG')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
