"use client";

import React, { useState } from "react";
import { Tag } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { CategoryList } from "@/components/management/CategoryList";
import { ManagePageLayout } from "@/components/management/ManagePageLayout";
import { CategoryModal } from "@/components/management/CategoryModal";
import { CategoryDetailsDrawer } from "@/components/management/CategoryDetailsDrawer";
import { useCategories } from "@/hooks/useCategories";
import { Category } from "@/lib/services/categoryService";

export default function CategoriesPage() {
  const { categories, loading, deleteCategory } = useCategories();
  
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState("name");

  const filtered = categories
    .filter(c => 
      c.name?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name, "ar");
      return 0; // Default
    });

  return (
    <>
      <ManagePageLayout
        title="أصناف المنتجات"
        subtitle="إدارة تصنيفات وخامات المنتجات"
        backHref="/manage"
        searchPlaceholder="ابحث عن صنف..."
        searchValue={search}
        onSearchChange={setSearch}
        addButtonLabel="إضافة صنف"
        addDialogIcon={Tag}
        isDialogOpen={open}
        onDialogOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditingCategory(null);
        }}
        isLoading={loading}
        iconColor="text-emerald-500"
        buttonColor="bg-emerald-600"
        onAddClick={() => {
          setEditingCategory(null);
          setOpen(true);
        }}
        showSort
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={[
          { value: "name", label: "أبجدياً (أ-ي)" },
          { value: "recent", label: "الأحدث أولاً" },
        ]}
      >
        <AnimatePresence mode="wait">
          <CategoryList 
            categories={filtered} 
            onDelete={deleteCategory} 
            onEdit={(c) => {
              setEditingCategory(c);
              setOpen(true);
            }}
            onViewDetails={setViewingCategory}
          />
        </AnimatePresence>
      </ManagePageLayout>

      <CategoryModal 
        open={open} 
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditingCategory(null);
        }} 
        initialData={editingCategory || undefined}
      />

      <CategoryDetailsDrawer
        category={viewingCategory}
        open={!!viewingCategory}
        onOpenChange={(o) => !o && setViewingCategory(null)}
        onEdit={(c) => {
          setEditingCategory(c);
          setOpen(true);
        }}
        onDelete={deleteCategory}
      />
    </>
  );
}
