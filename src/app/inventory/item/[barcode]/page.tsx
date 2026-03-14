"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Item } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, Package, Tag, Calendar, User, Clock, CheckCircle2, RotateCcw } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ItemDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const barcode = params.barcode as string;

  const [item, setItem] = useState<Item | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItemDetails();
  }, [barcode]);

  async function fetchItemDetails() {
    setLoading(true);

    const { data: itemData } = await supabase
      .from("items")
      .select("*, products(name, categories(name)), suppliers(name), customers(name)")
      .eq("barcode", barcode)
      .single();

    const { data: historyData } = await supabase
      .from("item_history")
      .select("*")
      .eq("item_barcode", barcode)
      .order("created_at", { ascending: false });

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
        <Button variant="outline" onClick={() => router.back()} className="glass mt-4">
          العودة
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-2xl glass" onClick={() => router.back()}>
          <ArrowRight className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-black text-white">تفاصيل القطعة</h2>
          <p className="text-sm text-white/50 font-mono">{barcode}</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass border-white/5 rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
          <CardContent className="p-8 space-y-6 relative z-10">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Badge variant="outline" className="bg-white/5 text-white/60 font-bold border-none mb-2">
                  {item.products?.categories?.name || "عام"}
                </Badge>
                <h3 className="text-3xl font-black text-white">{item.products?.name}</h3>
                <div className="flex items-center gap-2 text-white/40 font-mono text-sm">
                  <Tag className="w-4 h-4" /> {barcode}
                </div>
              </div>

              <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border shadow-lg ${
                item.status === 'In-Stock'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-emerald-500/10'
                  : item.status === 'Sold'
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-blue-500/10'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-amber-500/10'
              }`}>
                {item.status === 'In-Stock' ? <CheckCircle2 className="w-5 h-5" /> :
                 item.status === 'Sold' ? <User className="w-5 h-5" /> :
                 <RotateCcw className="w-5 h-5" />}
                <span className="font-black">
                  {item.status === 'In-Stock' ? 'متاح بالمخزن' :
                   item.status === 'Sold' ? 'تم البيع' :
                   'مرتجع'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">سعر البيع</p>
                <p className="text-2xl font-black text-white">{item.selling_price} <span className="text-xs text-white/40">ج.م</span></p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">تاريخ الإضافة</p>
                <p className="text-sm font-bold text-white flex items-center gap-2 mt-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {new Date(item.created_at || "").toLocaleDateString("ar-EG")}
                </p>
              </div>
              {(item as any).suppliers?.name && (
                 <div className="col-span-2 bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">المورد</p>
                      <p className="text-base font-bold text-white">{(item as any).suppliers.name}</p>
                    </div>
                    <Link href={`/suppliers/${item.supplier_id}`}>
                      <Button variant="outline" size="sm" className="glass rounded-xl text-xs">عرض المورد</Button>
                    </Link>
                 </div>
              )}
              {item.status === 'Sold' && (item as any).customers?.name && (
                 <div className="col-span-2 bg-blue-500/5 p-4 rounded-2xl border border-blue-500/10 flex items-center justify-between mt-2">
                    <div>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">مباع للعميل</p>
                      <p className="text-base font-bold text-white">{(item as any).customers.name}</p>
                      {item.sold_date && (
                         <p className="text-xs text-white/40 mt-1">{new Date(item.sold_date).toLocaleString("ar-EG")}</p>
                      )}
                    </div>
                    <Link href={`/customers/${item.customer_id}`}>
                      <Button variant="outline" size="sm" className="glass border-blue-500/20 text-blue-400 hover:bg-blue-500/10 rounded-xl text-xs">ملف العميل</Button>
                    </Link>
                 </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-xl font-black text-white mb-4 px-2 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          سجل حركة القطعة
        </h3>
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {history.length === 0 ? (
            <div className="text-center py-10 glass rounded-[2rem] text-white/30 border border-white/5 relative z-10">
              لا توجد حركات مسجلة لهذه القطعة
            </div>
          ) : (
            history.map((record, index) => (
              <div key={record.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-black text-white/50 group-[.is-active]:text-primary group-[.is-active]:bg-primary/10 group-[.is-active]:border-primary/20 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow shadow-primary/20 z-10">
                  {record.action === 'Added' ? <Package className="w-4 h-4" /> :
                   record.action === 'Sold' ? <CheckCircle2 className="w-4 h-4" /> :
                   <RotateCcw className="w-4 h-4" />}
                </div>

                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass p-4 rounded-2xl border border-white/5">
                  <div className="flex flex-col gap-1">
                     <span className="text-xs text-primary font-black uppercase tracking-widest">{record.action === 'Added' ? 'إضافة' : record.action === 'Sold' ? 'بيع' : 'إرجاع'}</span>
                     <p className="text-sm font-bold text-white leading-relaxed">{record.details}</p>
                     <span className="text-[10px] text-white/40 font-mono mt-2 flex items-center gap-1">
                       <Clock className="w-3 h-3" />
                       {new Date(record.created_at).toLocaleString('ar-EG')}
                     </span>
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
