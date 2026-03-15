"use client";

import { useState } from "react";
import { Box } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { ProductList } from "@/components/management/ProductList";
import { ManagePageLayout } from "@/components/management/ManagePageLayout";
import { ProductModal } from "@/components/management/ProductModal";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";

export default function ProductsPage() {
  const { products, loading: productsLoading, deleteProduct } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const loading = productsLoading || categoriesLoading;

  const filtered = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.categories?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <ManagePageLayout
        title="قائمة المنتجات"
        subtitle="تعريف الأنواع والموديلات الأساسية"
        searchPlaceholder="ابحث عن منتج أو صنف..."
        searchValue={search}
        onSearchChange={setSearch}
        addButtonLabel="إضافة نوع"
        addDialogIcon={Box}
        isDialogOpen={open}
        onDialogOpenChange={setOpen}
        isLoading={loading}
        iconColor="text-indigo-500"
        buttonColor="bg-indigo-600"
        onAddClick={() => setOpen(true)}
      >
        <AnimatePresence mode="wait">
          <ProductList products={filtered} onDelete={deleteProduct} />
        </AnimatePresence>
      </ManagePageLayout>

      <ProductModal open={open} onOpenChange={setOpen} />
    </>
  );
}
