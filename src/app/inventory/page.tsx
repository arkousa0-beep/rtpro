"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PackagePlus, LayoutGrid, Tag, Circle, Edit, Box, Search, Filter, ArrowUpRight, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ManagePageLayout } from "@/components/management/ManagePageLayout";
import { useInventory } from "@/hooks/useInventory";
import { useProducts } from "@/hooks/useProducts";
import { ProductModal } from "@/components/management/ProductModal";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/database.types";
import Link from "next/link";

export default function InventoryPage() {
  const { items, categories, loading, refresh } = useInventory();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Group items by product
  const groupedProducts = Object.values(
    items.reduce((acc, item) => {
      const productId = item.product_id;
      if (!acc[productId]) {
        acc[productId] = {
          product: item.products,
          items: [],
          inStock: 0
        };
      }
      acc[productId].items.push(item);
      if (item.status === 'In-Stock') acc[productId].inStock++;
      return acc;
    }, {} as Record<string, { product: any, items: any[], inStock: number }>)
  ).filter(group => {
    const matchesSearch = group.product?.name.toLowerCase().includes(search.toLowerCase()) || 
                          group.items.some(item => item.barcode.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = !activeCategory || group.product?.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = [
    { label: 'إجمالي القطع', value: items.length, icon: Box, color: 'text-blue-400' },
    { label: 'في المخزن', value: items.filter(i => i.status === 'In-Stock').length, icon: PackagePlus, color: 'text-emerald-400' },
  ];

  const categoryFilters = (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      <Button
        variant={!activeCategory ? "secondary" : "ghost"}
        size="sm"
        className={cn("rounded-full whitespace-nowrap", !activeCategory && "bg-white/10 text-white")}
        onClick={() => setActiveCategory(null)}
      >
        الكل
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={activeCategory === cat.id ? "secondary" : "ghost"}
          size="sm"
          className={cn("rounded-full whitespace-nowrap", activeCategory === cat.id && "bg-white/10 text-white")}
          onClick={() => setActiveCategory(cat.id || null)}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  );

  return (
    <ManagePageLayout
      title="المخزن"
      subtitle="إدارة جميع القطع المتاحة والمباعة"
      searchPlaceholder="بحث بالسيريال أو اسم المنتج..."
      searchValue={search}
      onSearchChange={setSearch}
      addButtonLabel="إضافة قطعة"
      addLink="/inventory/add"
      isLoading={loading}
      extraContent={categoryFilters}
      isDialogOpen={false}
      onDialogOpenChange={() => {}}
      addDialogIcon={Package}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {groupedProducts.map((group, idx) => (
            <motion.div
              key={group.product?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="group relative overflow-hidden bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 rounded-[2rem]">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-white/5 shadow-inner">
                          <Package className="w-7 h-7 text-white/40 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-xl text-white truncate leading-tight mb-1">
                            {group.product?.name}
                          </h4>
                          <div className="flex items-center gap-2">
                            <Tag className="w-3 h-3 text-white/20" />
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                              {group.product?.categories?.name || 'بدون قسم'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <Badge className="rounded-xl px-3 py-1 bg-primary/10 text-primary border-primary/20 text-[10px] font-black">
                          {group.items.length} قطع
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-6 mt-2 border-t border-white/5">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-widest block mb-1">متوفر</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-emerald-400">{group.inStock}</span>
                          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">قطعة</span>
                        </div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-widest block mb-1">تم بيعها</span>
                        <div className="flex items-baseline gap-1 justify-end">
                          <span className="text-2xl font-black text-white/40">{group.items.length - group.inStock}</span>
                          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">قطعة</span>
                        </div>
                      </div>
                    </div>

                    <Link 
                      href={`/inventory/product/${group.product?.id}`}
                      className="w-full flex items-center justify-between p-3 px-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group/btn border border-white/5"
                    >
                      <span className="text-sm font-black text-white/60 group-hover/btn:text-white transition-colors">إدارة القطع</span>
                      <ArrowUpRight className="w-4 h-4 text-white/20 group-hover/btn:text-primary transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <ProductModal 
        open={showProductModal} 
        onOpenChange={setShowProductModal}
        initialData={editingProduct}
        onSuccess={() => {
          setEditingProduct(null);
          refresh();
        }}
      />
    </ManagePageLayout>
  );
}
