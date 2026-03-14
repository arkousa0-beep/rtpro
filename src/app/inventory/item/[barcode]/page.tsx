"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { Item } from "@/lib/database.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Package, Tag, Clock, Circle, FileText, User } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ItemHistory {
  id: string;
  action: string;
  details: string;
  created_at: string;
}

export default function ItemProfilePage({ params }: { params: Promise<{ barcode: string }> }) {
  const { barcode } = use(params);
  const [item, setItem] = useState<Item | null>(null);
  const [history, setHistory] = useState<ItemHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemData();
  }, [barcode]);

  async function fetchItemData() {
    setLoading(true);
    
    // Fetch item details and history concurrently
    const [{ data: itemData }, { data: historyData }] = await Promise.all([
      supabase
        .from('items')
        .select('*, products(name, categories(name)), customers(name), suppliers(name)')
        .eq('barcode', decodeURIComponent(barcode))
        .single(),
      supabase
        .from('item_history')
        .select('*')
        .eq('item_barcode', decodeURIComponent(barcode))
        .order('created_at', { ascending: false })
    ]);

    if (itemData) setItem(itemData as any);
    if (historyData) setHistory(historyData);
    
    setLoading(false);
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
    <div className="min-h-screen pb-32 pt-6 px-4 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-2xl glass" asChild>
          <Link href="/inventory">
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-black text-white">تفاصيل القطعة</h2>
          <p className="text-sm text-white/50 font-mono tracking-widest">{item.barcode}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass border-white/5 rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
          <CardContent className="p-8 space-y-6 relative z-10">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Badge className="bg-primary/20 text-primary border-none mb-2">
                  {(item as any).products?.categories?.name || 'عام'}
                </Badge>
                <h3 className="text-3xl font-black text-white">{(item as any).products?.name}</h3>
              </div>
              <div className={cn(
                "px-4 py-2 rounded-xl flex items-center gap-2 border",
                item.status === 'In-Stock' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                item.status === 'Sold' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                'bg-amber-500/10 border-amber-500/20 text-amber-400'
              )}>
                <Circle className={cn("w-3 h-3 fill-current", item.status === 'In-Stock' && "animate-pulse")} />
                <span className="text-sm font-black uppercase tracking-widest">{item.status === 'In-Stock' ? 'متاح بالمخزن' : item.status === 'Sold' ? 'مباع' : 'مرتجع'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
              <div className="space-y-1">
                <p className="text-white/40 text-xs font-bold">سعر التكلفة</p>
                <p className="text-xl font-black text-white">{item.cost_price} <span className="text-xs text-primary">ج.م</span></p>
              </div>
              <div className="space-y-1">
                <p className="text-white/40 text-xs font-bold">سعر البيع</p>
                <p className="text-xl font-black text-white">{item.selling_price} <span className="text-xs text-primary">ج.م</span></p>
              </div>
            </div>

            <div className="space-y-3">
              {(item as any).suppliers?.name && (
                <div className="flex items-center gap-3 text-white/60 text-sm bg-white/5 p-3 rounded-xl">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>المورد: <strong>{(item as any).suppliers?.name}</strong></span>
                </div>
              )}
              {(item as any).customers?.name && (
                <div className="flex items-center gap-3 text-white/60 text-sm bg-white/5 p-3 rounded-xl">
                  <User className="w-4 h-4 text-blue-500" />
                  <span>تم البيع للعميل: <strong>{(item as any).customers?.name}</strong></span>
                </div>
              )}
              {item.sold_date && (
                <div className="flex items-center gap-3 text-white/60 text-sm bg-white/5 p-3 rounded-xl">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>تاريخ البيع: {new Date(item.sold_date).toLocaleString('ar-EG')}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-xl font-black text-white mb-4 px-2 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          سجل حركة القطعة
        </h3>
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-10 glass rounded-[2rem] text-white/30 border border-white/5">
              لا توجد حركات مسجلة لهذه القطعة بعد
            </div>
          ) : (
            history.map((h, i) => (
              <Card key={h.id} className="glass border-white/5 rounded-2xl hover:bg-white/[0.02] transition-colors">
                <CardContent className="p-4 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-sm">{h.action === 'Returned' ? 'مرتجع' : h.action}</h4>
                      <span className="text-xs text-white/30">{new Date(h.created_at).toLocaleString('ar-EG')}</span>
                    </div>
                    <p className="text-white/60 text-sm">{h.details}</p>
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