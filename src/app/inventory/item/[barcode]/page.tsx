"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { inventoryService } from "@/lib/services/inventoryService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  ArrowRight, 
  Package, 
  Tag, 
  Circle, 
  DollarSign, 
  Calendar, 
  History 
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ItemDetailsPage() {
  const params = useParams();
  const barcode = params.barcode as string;
  const router = useRouter();

  const [item, setItem] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemDetails();
  }, [barcode]);

  async function fetchItemDetails() {
    setLoading(true);
    try {
      const data = await inventoryService.getItemDetails(barcode);
      setItem(data);
    } catch (error: any) {
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

  const history = item.history || [];

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 space-y-6 max-w-3xl mx-auto text-right" dir="rtl">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-2xl glass h-12 w-12 border border-white/10" onClick={() => router.back()}>
          <ArrowRight className="w-6 h-6 text-white/70" />
        </Button>
        <div>
          <h2 className="text-2xl font-black text-white">تفاصيل القطعة</h2>
          <p className="text-sm text-white/50">{item.products?.name}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="glass border-white/5 rounded-[2.5rem] overflow-hidden relative shadow-2xl shadow-black/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10" />
          <CardContent className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-inner">
                  <Package className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-2 leading-tight">{item.products?.name}</h3>
                  <div className="flex items-center gap-2 text-white/40">
                    <Tag className="w-4 h-4" />
                    <span className="font-mono text-xl tracking-wider font-black text-white/70">{item.barcode}</span>
                  </div>
                </div>
              </div>
              
              <div className={cn(
                "px-6 py-3 rounded-2xl flex items-center gap-3 border text-sm font-black shadow-lg",
                item.status === 'In-Stock' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/5' 
                  : item.status === 'Sold'
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-blue-500/5'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-amber-500/5'
              )}>
                <Circle className={cn("w-2 h-2 fill-current", item.status === 'In-Stock' && "animate-pulse")} />
                {item.status === 'In-Stock' ? 'متوفر بالمخزن' : item.status === 'Sold' ? 'تم البيع' : 'مرتجع'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-2 group hover:bg-white/[0.08] transition-colors">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                  <DollarSign className="w-3 h-3 text-primary" /> سعر البيع الحالي
                </span>
                <p className="text-4xl font-black text-white">
                  {Number(item.selling_price).toLocaleString()} <span className="text-sm text-primary">ج.م</span>
                </p>
              </div>
              <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-2 text-left group hover:bg-white/[0.08] transition-colors">
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] flex items-center gap-2 justify-end">
                   سعر التكلفة <DollarSign className="w-3 h-3 text-red-400/50" />
                </span>
                <p className="text-4xl font-black text-white/30">
                  {Number(item.cost_price).toLocaleString()} <span className="text-sm">ج.م</span>
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-xs font-black text-white/10 uppercase tracking-widest text-center mr-4">معلومات الحيازة</h4>
              <div className="flex flex-wrap gap-3 justify-center">
                <Badge className="bg-white/5 text-white/60 border-white/10 px-5 py-2.5 rounded-2xl font-black text-[11px] flex gap-2">
                  <Calendar className="w-3.5 h-3.5" /> أضيفت في: {new Date(item.created_at).toLocaleDateString('ar-EG')}
                </Badge>
                
                {item.status === 'Sold' && (
                  <>
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-5 py-2.5 rounded-2xl font-black text-[11px] flex gap-2">
                      <Calendar className="w-3.5 h-3.5" /> بيعت في: {new Date(item.sold_date).toLocaleDateString('ar-EG')}
                    </Badge>
                    {item.customers && (
                      <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-5 py-2.5 rounded-2xl font-black text-[11px] flex gap-2">
                        <History className="w-3.5 h-3.5" /> المشتري: {item.customers.name}
                      </Badge>
                    )}
                  </>
                )}
                
                {item.status === 'Returned' && (
                  <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-5 py-2.5 rounded-2xl font-black text-[11px] flex gap-2">
                    <Calendar className="w-3.5 h-3.5" /> استرجعت في: {new Date(item.return_date).toLocaleDateString('ar-EG')}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-6 px-4">
          <h3 className="text-xl font-black text-white flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary rounded-full" />
            تتبع الحركات (Timeline)
          </h3>
          <span className="text-[10px] font-black text-white/20 uppercase">Total {history.length} events</span>
        </div>
        
        <div className="relative border-r-2 border-white/5 mr-6 pr-8 space-y-8">
          {history.length === 0 ? (
            <div className="text-center py-12 glass rounded-[2.5rem] border border-white/5 text-white/20 italic mr-[-2rem]">
              لا توجد سجلات حركات لهذه القطعة حتى الآن
            </div>
          ) : (
            history.map((h: any, i: number) => (
              <div key={h.id} className="relative group">
                <div className={cn(
                  "absolute -right-[3.1rem] top-1.5 w-6 h-6 rounded-full border-4 border-[#0a0a0a] z-10 group-hover:scale-125 transition-transform",
                  h.action === 'Received' ? 'bg-emerald-500' :
                  h.action === 'Sold' ? 'bg-blue-500' :
                  h.action === 'Returned' ? 'bg-amber-500' :
                  'bg-white/40'
                )} />
                
                <div className="glass border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] transition-all relative overflow-hidden group-hover:translate-x-[-4px]">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner",
                        h.action === 'Received' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                        h.action === 'Sold' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                        h.action === 'Returned' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                        'bg-white/5 border-white/5 text-white/20'
                      )}>
                        {h.action === 'Received' ? <Package className="w-6 h-6" /> : 
                         h.action === 'Sold' ? <DollarSign className="w-6 h-6" /> : 
                         <History className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-black text-white text-lg">
                          {h.action === 'Received' ? 'استلام قطعة للمخزن' : 
                           h.action === 'Sold' ? 'بيع القطعة لعميل' : 
                           h.action === 'Returned' ? 'مرتجع من عميل' : 'تعديل بيانات'}
                        </h4>
                        <div className="flex flex-col gap-0.5 mt-1">
                          <p className="text-sm font-bold text-white/40">{h.details || 'لا توجد تفاصيل إضافية'}</p>
                          <p className="text-[10px] font-black text-primary/40 uppercase tracking-tighter">
                            بواسطة: {h.created_by_profile?.full_name || 'السيستم'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-left w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                      <div className="flex items-center gap-2 justify-end text-white/30">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-black">
                          {new Date(h.created_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                      <p className="text-[10px] font-bold text-white/10 mt-1 uppercase tracking-widest">
                        {new Date(h.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
