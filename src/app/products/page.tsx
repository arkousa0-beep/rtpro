"use client";

import React, { useState } from "react";
import { Box } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ProductList } from "@/components/management/ProductList";
import { ManagePageLayout } from "@/components/management/ManagePageLayout";
import { ProductModal } from "@/components/management/ProductModal";
import { ProductDetailsDrawer } from "@/components/management/ProductDetailsDrawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Product } from "@/lib/database.types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProductsPage() {
  const {
    products,
    loading: productsLoading,
    requestDeleteProduct,
    confirmDeleteProduct,
    pendingDeleteId,
    setPendingDeleteId,
  } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const loading = productsLoading || categoriesLoading;

  const filtered = products.filter(p => {
    const matchesSearch =
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      (p.categories as any)?.name?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = !activeCategory || p.category_id === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const categoryFilters = (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
      <Button
        variant={!activeCategory ? "secondary" : "ghost"}
        size="sm"
        className={cn(
          "rounded-xl whitespace-nowrap font-black text-xs h-10 px-6 border transition-all",
          !activeCategory
            ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
            : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white"
        )}
        onClick={() => setActiveCategory(null)}
      >
        الكل
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={activeCategory === cat.id ? "secondary" : "ghost"}
          size="sm"
          className={cn(
            "rounded-xl whitespace-nowrap font-black text-xs h-10 px-6 border transition-all",
            activeCategory === cat.id
              ? "bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
              : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white"
          )}
          onClick={() => setActiveCategory(cat.id || null)}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  );

  return (
    <>
      <ManagePageLayout
        title="قائمة المنتجات"
        subtitle="تعريف الأنواع والموديلات الأساسية"
        backHref="/manage"
        searchPlaceholder="ابحث عن منتج أو صنف..."
        searchValue={search}
        onSearchChange={setSearch}
        addButtonLabel="إضافة نوع"
        addDialogIcon={Box}
        isDialogOpen={open}
        onDialogOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditingProduct(null);
        }}
        isLoading={loading}
        iconColor="text-indigo-500"
        buttonColor="bg-indigo-600"
        onAddClick={() => {
          setEditingProduct(null);
          setOpen(true);
        }}
        extraContent={categoryFilters}
      >
        <AnimatePresence mode="wait">
          <ProductList
            products={filtered}
            onDelete={requestDeleteProduct}
            onEdit={(p) => {
              setEditingProduct(p);
              setOpen(true);
            }}
            onViewDetails={setViewingProduct}
          />
        </AnimatePresence>
      </ManagePageLayout>

      <ProductModal
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditingProduct(null);
        }}
        initialData={editingProduct || undefined}
      />

      <ProductDetailsDrawer
        product={viewingProduct}
        open={!!viewingProduct}
        onOpenChange={(o) => !o && setViewingProduct(null)}
        onEdit={(p) => {
          setEditingProduct(p);
          setOpen(true);
        }}
        onDelete={requestDeleteProduct}
      />

      {/* Custom delete confirmation — replaces native confirm() */}
      <ConfirmDialog
        open={!!pendingDeleteId}
        onOpenChange={(o) => !o && setPendingDeleteId(null)}
        title="حذف المنتج"
        description="هذا الإجراء لا يمكن التراجع عنه. هل أنت متأكد؟"
        confirmLabel="حذف"
        destructive
        onConfirm={confirmDeleteProduct}
      />
    </>
  );
}
