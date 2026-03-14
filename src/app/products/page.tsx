"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2,
  Box,
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { AnimatePresence } from "framer-motion";
import { ProductList } from "@/components/management/ProductList";
import { ManagePageLayout } from "@/components/management/ManagePageLayout";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";

export default function ProductsPage() {
  const { products, loading: productsLoading, submitting, addProduct, deleteProduct } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  
  const [search, setSearch] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", category_id: "" });
  const [open, setOpen] = useState(false);

  const loading = productsLoading || categoriesLoading;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.category_id) return toast.warning("يرجى اختيار التصنيف");
    
    const success = await addProduct(newProduct);
    if (success) {
      setNewProduct({ name: "", category_id: "" });
      setOpen(false);
    }
  };

  const filtered = products.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.categories?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ManagePageLayout
      title="قائمة المنتجات"
      subtitle="تعريف الأنواع والموديلات الأساسية"
      searchPlaceholder="ابحث عن منتج أو صنف..."
      searchValue={search}
      onSearchChange={setSearch}
      addButtonLabel="إضافة نوع"
      addDialogTitle="إضافة منتج أساسي"
      addDialogIcon={Box}
      isDialogOpen={open}
      onDialogOpenChange={setOpen}
      isLoading={loading}
      iconColor="text-indigo-500"
      buttonColor="bg-indigo-600"
      addDialogContent={
        <form onSubmit={handleAdd} className="space-y-6 pt-6 text-right">
          <div className="space-y-3">
            <label className="text-xs font-black text-indigo-500 uppercase tracking-widest mr-1">اسم المنتج / الموديل</label>
            <Input 
              required 
              className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-indigo-500 text-right glass"
              value={newProduct.name}
              onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              placeholder="مثال: iPhone 15 Pro Max"
            />
          </div>
          
          <div className="space-y-3">
            <label className="text-xs font-black text-indigo-500 uppercase tracking-widest mr-1">التصنيف</label>
            <Select 
              value={newProduct.category_id} 
              onValueChange={val => setNewProduct({...newProduct, category_id: val ?? ""})}
            >
              <SelectTrigger className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus:ring-indigo-500 glass flex-row-reverse">
                {newProduct.category_id ? (
                  <span className="block truncate">{categories.find(c => c.id === newProduct.category_id)?.name}</span>
                ) : (
                  <span className="block truncate text-white/40">اختر التصنيف</span>
                )}
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 rounded-2xl">
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id as string} className="text-right flex-row-reverse">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-indigo-500/20 bg-indigo-600 text-white border border-white/10 active:scale-[0.98] transition-all" disabled={submitting}>
            {submitting ? <Loader2 className="w-7 h-7 animate-spin mx-auto" /> : "حفظ المنتج"}
          </Button>
        </form>
      }
    >
      <AnimatePresence mode="wait">
        <ProductList products={filtered} onDelete={deleteProduct} />
      </AnimatePresence>
    </ManagePageLayout>
  );
}
