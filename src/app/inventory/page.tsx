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
import { Product } from "@/lib/services/productService";
import { useUIStore } from "@/lib/store/uiStore";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useRouteGuard } from "@/hooks/useRouteGuard";

export default function InventoryPage() {
  const { isAuthorized, isLoading: guardLoading } = useRouteGuard("inventory");
  const { items, categories, loading, refresh } = useInventory();
  
  const { pageStates, setPageState } = useUIStore();
  const inventoryState = pageStates['inventory'] || { search: '', filters: {} };
  
  const search = inventoryState.search;
  const activeCategory = inventoryState.filters?.category || null;

  const setSearch = (val: string) => setPageState('inventory', { ...inventoryState, search: val });
  const setActiveCategory = (val: string | null) => setPageState('inventory', { 
    ...inventoryState, 
    filters: { ...inventoryState.filters, category: val } 
  });
  
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Group items by product
  const groupedProducts = Object.values(
    items.reduce((acc, item) => {
      const productId = item.product_id || 'unknown';
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
    const searchLower = search.toLowerCase().trim();
    if (!searchLower) return !activeCategory || group.product?.category_id === activeCategory;

    const matchesName = group.product?.name.toLowerCase().includes(searchLower);
    const matchesBarcode = group.items.some(item => item.barcode.toLowerCase().includes(searchLower));
    const matchesCategory = !activeCategory || group.product?.category_id === activeCategory;
    
    return (matchesName || matchesBarcode) && matchesCategory;
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

  if (guardLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ManagePageLayout
      title="المخزن"
      subtitle="إدارة جميع القطع المتاحة والمباعة"
      backHref="/manage"
      searchPlaceholder="بحث بالسيريال أو اسم المنتج..."
      searchValue={search}
      onSearchChange={setSearch}
      addButtonLabel="إضافة قطعة"
      addLink="/inventory/add"
      isLoading={loading}
      onRefresh={refresh}
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
              <Card className="group relative overflow-hidden bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500 rounded-[2.5rem] shadow-2xl">
                <CardContent className="p-0">
                  {/* Product Image Header */}
                  <div className="relative h-48 w-full overflow-hidden">
                    {group.product?.image_url ? (
                      <img 
                        src={group.product.image_url} 
                        alt={group.product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                        <Package className="w-16 h-16 text-white/5" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-4 right-4 left-4 flex items-end justify-between">
                      <div className="flex-1 min-w-0">
                        <Badge className="mb-2 bg-indigo-500/20 text-indigo-400 border-indigo-500/30 backdrop-blur-md rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-wider">
                          {group.product?.categories?.name || 'بدون قسم'}
                        </Badge>
                        <h4 className="font-black text-2xl text-white truncate drop-shadow-lg">
                          {group.product?.name}
                        </h4>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-indigo-600 hover:border-indigo-500 transition-all flex-shrink-0"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingProduct(group.product);
                          setShowProductModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-widest block mb-1">متوفر</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-emerald-400">{group.inStock}</span>
                          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">قطعة</span>
                        </div>
                      </div>
                      <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] text-white/20 font-black uppercase tracking-widest block mb-1">الإجمالي</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-white/60">{group.items.length}</span>
                          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">قطعة</span>
                        </div>
                      </div>
                    </div>

                    <Link 
                      href={`/inventory/product/${group.product?.id}`}
                      className="w-full flex items-center justify-between p-4 px-6 rounded-2xl bg-indigo-600/10 hover:bg-indigo-600 transition-all group/btn border border-indigo-500/20"
                    >
                      <span className="text-sm font-black text-white/60 group-hover/btn:text-white transition-colors">إدارة القطع والأسعار</span>
                      <ArrowUpRight className="w-4 h-4 text-white/20 group-hover/btn:text-white transition-transform group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
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
