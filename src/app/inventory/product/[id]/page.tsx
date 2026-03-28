"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Product, Item, Category } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight, Tag, Box, TrendingUp, AlertCircle, Plus, Printer, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { BarcodePrinter } from "@/components/management/BarcodePrinter";
import { inventoryService } from "@/lib/services/inventoryService";
import { ItemTabs } from "@/components/inventory/ItemTabs";
import { ItemFilters } from "@/components/inventory/ItemFilters";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [product, setProduct] = useState<(Product & { categories?: Category }) | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering states
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateType, setDateType] = useState<'Add' | 'Sale' | 'Return'>('Add');
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 50;

  const [counts, setCounts] = useState({ all: 0, available: 0, sold: 0, returned: 0 });

  useEffect(() => {
    fetchData();
  }, [id, activeTab, search, startDate, endDate, dateType, page]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search, startDate, endDate, dateType]);

  async function fetchData() {
    setLoading(true);
    try {
      const { data: prodData } = await supabase
        .from('products')
        .select('*, categories(*)')
        .eq('id', id)
        .single();
      setProduct(prodData);

      const { data: itemsData, count } = await inventoryService.getProductItems(id, {
        status: activeTab,
        search,
        startDate,
        endDate,
        dateType,
        page,
        pageSize
      });
      setItems(itemsData || []);
      if (count !== null) {
        setTotalPages(Math.ceil(count / pageSize) || 1);
      }

      // Fetch counts for tabs (unfiltered)
      const { data: allItems } = await supabase
        .from('items')
        .select('status')
        .eq('product_id', id);
      
      if (allItems) {
        setCounts({
          all: allItems.length,
          available: allItems.filter(i => i.status === 'In-Stock').length,
          sold: allItems.filter(i => i.status === 'Sold').length,
          returned: allItems.filter(i => i.status === 'Returned').length,
        });
      }
    } catch (error: any) {
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !product) {
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

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 space-y-6 max-w-4xl mx-auto text-right" dir="rtl">
      {/* Header */}
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

      {/* Tabs & Filters */}
      <div className="space-y-4">
        <ItemTabs activeTab={activeTab} onTabChange={setActiveTab} counts={counts} />
        <ItemFilters 
          onSearchChange={setSearch}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onDateTypeChange={setDateType}
          dateType={dateType}
        />
      </div>

      {/* Stats Quick View (Dynamic) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'الإجمالي', val: counts.all, color: 'text-white' },
          { label: 'متاح', val: counts.available, color: 'text-emerald-400' },
          { label: 'مباع', val: counts.sold, color: 'text-blue-400' },
          { label: 'مرتجع', val: counts.returned, color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="glass p-4 rounded-2xl border-white/5 flex flex-col items-center">
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{s.label}</span>
            <span className={cn("text-2xl font-black mt-1", s.color)}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Items List */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between pr-2 border-r-4 border-primary pl-4 py-1 bg-primary/5 rounded-l-xl">
          <h3 className="text-xl font-black text-white">النتائج ({items.length})</h3>
          <span className="text-[10px] font-black text-white/20 tracking-tighter uppercase">
            {activeTab === 'All' ? 'جميع الحالات' : activeTab === 'In-Stock' ? 'متاح فقط' : activeTab === 'Sold' ? 'مباع فقط' : 'مرتجع فقط'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {loading ? (
              <div className="col-span-full py-20 flex justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin opacity-20" />
              </div>
            ) : items.map((item, idx) => (
              <motion.div
                key={item.barcode}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
              >
                <Card className="glass border-white/5 rounded-[2rem] p-5 hover:bg-white/[0.04] transition-all group shadow-xl shadow-black/40 relative overflow-hidden">
                  {/* Status Indicator Bar */}
                  <div className={cn(
                    "absolute top-0 right-0 w-1.5 h-full",
                    item.status === 'In-Stock' ? "bg-emerald-500" : item.status === 'Sold' ? "bg-blue-500" : "bg-amber-500"
                  )} />
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center border",
                          item.status === 'In-Stock' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                          item.status === 'Sold' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                          'bg-amber-500/10 border-amber-500/20 text-amber-500'
                        )}>
                          <Tag className="w-5 h-5" />
                        </div>
                        <div className="text-right">
                          <code className="text-sm font-mono font-black text-white tracking-widest block leading-tight">
                            {item.barcode}
                          </code>
                          <span className="text-[10px] text-white/30 font-bold block mt-0.5">
                            أضيف في {new Date(item.created_at).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-lg font-black text-primary leading-none">
                          {Number(item.selling_price).toLocaleString()} <span className="text-[10px]">ج.م</span>
                        </span>
                        <Badge className={cn(
                          "rounded-lg px-2 py-0.5 text-[10px] font-black border-none",
                          item.status === 'In-Stock' ? "bg-emerald-500/20 text-emerald-400" : 
                          item.status === 'Sold' ? "bg-blue-500/20 text-blue-400" :
                          "bg-amber-500/20 text-amber-400"
                        )}>
                          {item.status === 'In-Stock' ? 'متاح' : item.status === 'Sold' ? 'مباع' : 'مرتجع'}
                        </Badge>
                      </div>
                    </div>

                    {/* Actor / Event info */}
                    <div className="grid grid-cols-1 gap-2 border-t border-white/5 pt-3">
                      {item.status === 'Sold' && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-white/20">اسم العميل:</span>
                          <span className="text-[11px] font-black text-blue-400">{item.customers?.name || 'غير معروف'}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/20">بواسطة:</span>
                        <span className="text-[11px] font-black text-white/60">
                          {item.status === 'In-Stock' ? (item.created_by_profile?.full_name || 'السيستم') :
                           item.status === 'Sold' ? (item.sold_by_profile?.full_name || 'السيستم') :
                           (item.returned_by_profile?.full_name || 'السيستم')}
                        </span>
                      </div>

                      {item.status === 'Returned' && item.return_reason && (
                        <div className="mt-1 p-2 bg-amber-500/5 rounded-lg border border-amber-500/10">
                          <p className="text-[10px] text-amber-200/50 font-medium leading-relaxed">
                            <span className="font-black ml-1">سبب المرتجع:</span>
                            {item.return_reason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-1">
                      <div className="flex items-center gap-2">
                        <BarcodePrinter
                          value={item.barcode}
                          name={product.name}
                          price={Number(item.selling_price)}
                        />
                      </div>
                      <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl bg-white/5 hover:bg-primary text-white/50 hover:text-black transition-all border border-white/5 font-black text-[11px]" asChild>
                        <Link href={`/inventory/item/${item.barcode}`}>
                          عرض التفاصيل
                          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            {!loading && items.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-white/30 space-y-4">
                <Box className="w-16 h-16 opacity-10" />
                <div className="text-center">
                  <p className="text-lg font-black opacity-40">لا توجد قطع مطابقة</p>
                  <p className="text-xs font-bold opacity-20">جرب تغيير حالة الفلتر أو كلمة البحث</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 pb-8">
            <Button 
              variant="outline" 
              className="glass border-white/10"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <span className="text-white/50 text-sm font-bold">
              صفحة {page} من {totalPages}
            </span>
            <Button 
              variant="outline" 
              className="glass border-white/10"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
