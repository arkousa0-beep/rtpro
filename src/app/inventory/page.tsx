"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PackagePlus, LayoutGrid, Tag, Circle, Edit, Box, Search, Filter, ArrowUpRight } from "lucide-react";
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

  const filteredItems = items.filter(item => {
    const matchesSearch = item.barcode.toLowerCase().includes(search.toLowerCase()) || 
                          item.products?.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || item.products?.category_id === activeCategory;
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
          onClick={() => setActiveCategory(cat.id)}
        >
          {cat.name}
        </Button>
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
      isLoading={loading}
      extraContent={categoryFilters}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, idx) => (
            <motion.div
              key={item.barcode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="group relative overflow-hidden bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500">
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                          <Box className="w-6 h-6 text-white/40 group-hover:text-emerald-400 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-xl text-white truncate group-hover:text-emerald-400 transition-colors leading-tight">
                            <Link href={`/inventory/item/${item.barcode}`} className="hover:underline">
                              {item.products?.name}
                            </Link>
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Tag className="w-3 h-3 text-white/20" />
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                              {item.products?.categories?.name || 'بدون قسم'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 rounded-full hover:bg-white/10 text-white/40 hover:text-indigo-400 group"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingProduct(item.products || null);
                                setShowProductModal(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <div className={cn(
                              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                              item.status === 'In-Stock' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                              item.status === 'Sold' ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                              "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            )}>
                              {item.status === 'In-Stock' ? 'متاح' : 'مباع'}
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                      <div className="space-y-1">
                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest block">الباركود</span>
                        <code className="text-sm font-mono text-white/60 group-hover:text-white transition-colors">
                          {item.barcode}
                        </code>
                      </div>
                      <div className="space-y-1 text-left">
                        <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest block">تاريخ الإضافة</span>
                        <span className="text-xs text-white/40">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString('ar-EG') : '---'}
                        </span>
                      </div>
                    </div>

                    <Link 
                      href={`/inventory/item/${item.barcode}`}
                      className="flex items-center justify-between group/link pt-2"
                    >
                      <span className="text-xs font-bold text-white/20 group-hover/link:text-emerald-400/60 transition-colors">عرض التفاصيل</span>
                      <ArrowUpRight className="w-4 h-4 text-white/10 group-hover/link:text-emerald-400 transition-transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
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
