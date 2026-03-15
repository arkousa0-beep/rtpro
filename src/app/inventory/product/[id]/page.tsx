"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product, Item, Category } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, Tag, Box, TrendingUp, AlertCircle, Plus, Printer } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BarcodePrinter } from "@/components/management/BarcodePrinter";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [product, setProduct] = useState<(Product & { categories?: Category }) | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  async function fetchProductDetails() {
    setLoading(true);
    try {
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('id', id)
        .single();

      if (prodError) throw prodError;
      setProduct(prodData);

      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('product_id', id)
        .order('created_at', { ascending: false });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error: any) {
      console.error("Error fetching product details:", error);
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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white/50">
        <Box className="w-16 h-16 opacity-20" />
        <h2 className="text-2xl font-black">المنتج غير موجود</h2>
        <Button variant="outline" asChild className="glass mt-4">
          <Link href="/inventory">العودة للمخزن</Link>
        </Button>
      </div>
    );
  }

  const inStockCount = items.filter(i => i.status === 'In-Stock').length;
  const soldCount = items.filter(i => i.status === 'Sold').length;

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 space-y-6 max-w-4xl mx-auto text-right" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-2xl glass h-12 w-12 border border-white/10" onClick={() => router.back()}>
            <ArrowRight className="w-6 h-6 text-white/70" />
          </Button>
          <div>
            <h2 className="text-3xl font-black text-white">{product.name}</h2>
            <p className="text-sm text-white/50 font-bold mt-1">{product.categories?.name || 'بدون قسم'}</p>
          </div>
        </div>
        <Button asChild className="rounded-2xl h-12 bg-primary hover:bg-primary/90 text-black font-black px-6 shadow-lg shadow-primary/20 active:scale-95 transition-all">
          <Link href={`/inventory/add?productId=${product.id}`}>
            <Plus className="w-5 h-5 ml-2" />
            إضافة قطعة
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -z-10" />
          <Box className="w-8 h-8 text-blue-400 mb-4" />
          <p className="text-sm font-bold text-white/40 mb-1">إجمالي القطع</p>
          <p className="text-3xl font-black text-white">{items.length}</p>
        </Card>
        <Card className="glass border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -z-10" />
          <TrendingUp className="w-8 h-8 text-emerald-400 mb-4" />
          <p className="text-sm font-bold text-white/40 mb-1">متوفر بالمخزن</p>
          <p className="text-3xl font-black text-white">{inStockCount}</p>
        </Card>
        <Card className="glass border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -z-10" />
          <AlertCircle className="w-8 h-8 text-amber-400 mb-4" />
          <p className="text-sm font-bold text-white/40 mb-1">تم بيعها</p>
          <p className="text-3xl font-black text-white">{soldCount}</p>
        </Card>
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between pr-2">
          <h3 className="text-xl font-black text-white">القطع المتاحة</h3>
          <span className="text-xs font-bold text-white/30 tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
            حسب الأحدث
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => (
              <motion.div
                key={item.barcode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass border-white/5 rounded-[2rem] p-4 hover:bg-white/[0.04] transition-all group shadow-xl shadow-black/40">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border",
                        item.status === 'In-Stock' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/5 text-white/20'
                      )}>
                        <Tag className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <code className="text-sm font-mono font-black text-white tracking-widest">
                          {item.barcode}
                        </code>
                        <div className="flex gap-2 mt-1 items-center">
                          <span className="text-[10px] text-primary font-black bg-primary/10 px-2 rounded">{Number(item.selling_price).toLocaleString()} ج.م</span>
                          <span className="text-[10px] text-white/10 uppercase font-black">|</span>
                          <span className="text-[10px] text-white/30 font-bold">{new Date(item.created_at || '').toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        "rounded-xl px-3 py-1 text-[10px] font-black border-none hidden sm:flex",
                        item.status === 'In-Stock' ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-white/40"
                      )}>
                        {item.status === 'In-Stock' ? 'متاح' : 'مباع'}
                      </Badge>

                      <BarcodePrinter
                        value={item.barcode}
                        name={product.name}
                        price={Number(item.selling_price)}
                      />

                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-primary/10 text-white/50 hover:text-primary transition-all border border-white/5" asChild>
                        <Link href={`/inventory/item/${item.barcode}`}>
                          <ArrowRight className="w-5 h-5 rotate-180" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {items.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-white/30 space-y-4">
                <Box className="w-12 h-12 opacity-20" />
                <p className="font-bold">لا توجد قطع مضافة لهذا المنتج</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
