"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PackagePlus, LayoutGrid, Tag, Circle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ManagePageLayout } from "@/components/management/ManagePageLayout";
import { useInventory } from "@/hooks/useInventory";
import Link from "next/link";

export default function InventoryPage() {
  const { items, categories, loading } = useInventory();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredItems = items.filter(item => {
    const itemName = item.products?.name || "";
    const matchesSearch = item.barcode.toLowerCase().includes(search.toLowerCase()) ||
                         itemName.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.products?.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryFilters = (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
      <button
        onClick={() => setSelectedCategory("all")}
        className={cn(
          "px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border shrink-0",
          selectedCategory === "all" 
            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
            : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white"
        )}
      >
        الكل
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setSelectedCategory(cat.id!)}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border shrink-0",
            selectedCategory === cat.id 
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
              : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white"
          )}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );

  return (
    <ManagePageLayout
      title="المخزن"
      subtitle="إدارة كافة القطع والمنتجات المتوفرة"
      searchPlaceholder="ابحث عن سيريال أو اسم منتج..."
      searchValue={search}
      onSearchChange={setSearch}
      addButtonLabel="إضافة صنف"
      addLink="/inventory/add"
      addDialogIcon={PackagePlus}
      addDialogTitle="إضافة صنف جديد"
      addDialogContent={null}
      isDialogOpen={false}
      onDialogOpenChange={() => {}}
      isLoading={loading}
      iconColor="text-emerald-500"
      buttonColor="bg-emerald-600"
      extraContent={categoryFilters}
    >
      {filteredItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24 glass border-2 border-dashed border-white/5 rounded-[3rem] text-white/20 gap-6"
        >
          <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 shadow-inner">
            <LayoutGrid className="w-16 h-16 opacity-20" />
          </div>
          <div className="text-center space-y-2">
            <p className="font-black text-2xl text-white/80 tracking-tight">لا توجد قطع مطابقة</p>
            <p className="text-sm font-medium text-white/40 italic">جرب البحث بكلمات مختلفة أو تغيير التصنيف</p>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div
                key={item.barcode}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
              >
                <Link href={`/inventory/item/${item.barcode}`}>
                  <Card className="glass border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.04] transition-all group active:scale-[0.98] relative cursor-pointer">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all" />
                    <CardContent className="p-6 flex flex-col gap-5 relative z-10">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center text-emerald-500 border border-emerald-500/10 shadow-inner group-hover:rotate-6 transition-transform">
                            <PackagePlus className="w-8 h-8" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-xl text-white truncate group-hover:text-emerald-400 transition-colors leading-tight">
                              {item.products?.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Tag className="w-3 h-3 text-white/20" />
                              <span className="text-xs font-black text-white/20 font-mono tracking-wider">{item.barcode}</span>
                            </div>
                          </div>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full flex items-center gap-2 border",
                          item.status === 'In-Stock' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                            : 'bg-white/5 border-white/10 text-white/20'
                        )}>
                          <Circle className={cn("w-2 h-2 fill-current", item.status === 'In-Stock' && "animate-pulse")} />
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                            {item.status === 'In-Stock' ? 'متاح' : 'مباع'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider block">سعر البيع</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-white">{item.selling_price}</span>
                            <span className="text-[10px] font-bold text-emerald-500">ج.م</span>
                          </div>
                        </div>
                        <div className="space-y-1 text-left">
                           <span className="text-[10px] font-bold text-white/20 uppercase tracking-wider block">التصنيف</span>
                           <Badge className="bg-white/5 text-white/60 hover:bg-white/10 rounded-lg font-bold border-none h-7 px-3">
                              {item.products?.categories?.name || "عام"}
                           </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </ManagePageLayout>
  );
}
