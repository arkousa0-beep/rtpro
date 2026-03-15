"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Product, Item, Category } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, Package, Tag, Box, TrendingUp, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
          <Button variant="ghost" size="icon" className="rounded-2xl glass" onClick={() => router.back()}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-black text-white">{product.name}</h2>
            <p className="text-sm text-white/50">{product.categories?.name || 'بدون قسم'}</p>
          </div>
        </div>
        <Button asChild className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-black px-6">
          <Link href={`/inventory/add?productId=${product.id}`}>
            <Plus className="w-5 h-5 ml-2" />
            إضافة قطعة
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -z-10" />
          <Box className="w-8 h-8 text-blue-400 mb-4" />
          <p className="text-sm font-bold text-white/40 mb-1">إجمالي القطع</p>
          <p className="text-3xl font-black text-white">{items.length}</p>
        </Card>
        <Card className="glass border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -z-10" />
          <TrendingUp className="w-8 h-8 text-emerald-400 mb-4" />
          <p className="text-sm font-bold text-white/40 mb-1">متوفر بالمخزن</p>
          <p className="text-3xl font-black text-white">{inStockCount}</p>
        </Card>
        <Card className="glass border-white/5 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -z-10" />
          <AlertCircle className="w-8 h-8 text-amber-400 mb-4" />
          <p className="text-sm font-bold text-white/40 mb-1">تم بيعها</p>
          <p className="text-3xl font-black text-white">{soldCount}</p>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-white pr-2">جميع القطع (سيريال)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((item, idx) => (
              <motion.div
                key={item.barcode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="glass border-white/5 rounded-2xl p-4 hover:border-white/20 transition-all group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border",
                        item.status === 'In-Stock' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/5 text-white/20'
                      )}>
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <code className="text-sm font-mono font-bold text-white group-hover:text-primary transition-colors">
                          {item.barcode}
                        </code>
                        <div className="flex gap-2 mt-1">
                          <span className="text-[10px] text-white/30">{Number(item.selling_price).toLocaleString()} ج.م</span>
                          <span className="text-[10px] text-white/10 uppercase font-black">|</span>
                          <span className="text-[10px] text-white/30">{new Date(item.created_at || '').toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={cn(
                        "rounded-lg px-2 py-1 text-[10px] font-black",
                        item.status === 'In-Stock' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/20 border-white/5"
                      )}>
                        {item.status === 'In-Stock' ? 'متاح' : 'مباع'}
                      </Badge>
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" asChild>
                        <Link href={`/inventory/item/${item.barcode}`}>
                          <ArrowRight className="w-4 h-4 rotate-180" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
