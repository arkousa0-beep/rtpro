"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Tag, 
  Loader2
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { CategoryList } from "@/components/management/CategoryList";
import { ManagePageLayout } from "@/components/management/ManagePageLayout";
import { useCategories } from "@/hooks/useCategories";

export default function CategoriesPage() {
  const { categories, loading, submitting, addCategory, deleteCategory } = useCategories();
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addCategory({ name: newName });
    if (success) {
      setNewName("");
      setOpen(false);
    }
  };

  const filtered = categories.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const addForm = (
    <form onSubmit={handleAdd} className="space-y-6 pt-6 text-right">
      <div className="space-y-3">
        <label className="text-xs font-black text-primary uppercase tracking-widest mr-1">اسم التصنيف</label>
        <Input 
          required 
          className="h-14 rounded-2xl bg-white/[0.1] border-white/10 text-white focus-visible:ring-primary text-right glass"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="مثال: هواتف ذكية"
        />
      </div>
      <Button 
        type="submit" 
        className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/20 bg-primary text-white border border-white/10 active:scale-[0.98] transition-all" 
        disabled={submitting}
      >
        {submitting ? <Loader2 className="w-7 h-7 animate-spin mx-auto" /> : "حفظ التصنيف"}
      </Button>
    </form>
  );

  return (
    <ManagePageLayout
      title="التصنيفات"
      subtitle="تنظيم المنتجات في مجموعات"
      searchPlaceholder="ابحث عن تصنيف..."
      searchValue={search}
      onSearchChange={setSearch}
      addButtonLabel="إضافة تصنيف"
      addDialogIcon={Tag}
      addDialogTitle="إضافة تصنيف جديد"
      addDialogContent={addForm}
      isDialogOpen={open}
      onDialogOpenChange={setOpen}
      isLoading={loading}
      iconColor="text-primary"
      buttonColor="bg-primary"
    >
      <AnimatePresence mode="wait">
        <CategoryList categories={filtered} onDelete={deleteCategory} />
      </AnimatePresence>
    </ManagePageLayout>
  );
}
