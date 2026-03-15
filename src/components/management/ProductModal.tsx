"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Box } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (productId: string) => void;
}

export function ProductModal({ open, onOpenChange, onSuccess }: ProductModalProps) {
  const { submitting, addProduct } = useProducts();
  const { categories } = useCategories();

  const [newProduct, setNewProduct] = useState({ name: "", category_id: "" });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.category_id) return toast.warning("يرجى اختيار التصنيف");

    const createdProduct = await addProduct(newProduct);
    if (createdProduct && Array.isArray(createdProduct) && createdProduct.length > 0) {
      setNewProduct({ name: "", category_id: "" });
      onOpenChange(false);
      onSuccess?.(createdProduct[0].id);
    } else if (createdProduct && createdProduct.id) {
      setNewProduct({ name: "", category_id: "" });
      onOpenChange(false);
      onSuccess?.(createdProduct.id);
    } else if (createdProduct) {
      // In case it returns just boolean true or an object without ID that we can't extract, we still succeed.
      setNewProduct({ name: "", category_id: "" });
      onOpenChange(false);
      onSuccess?.("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2.5rem] border-white/5 bg-black/60 backdrop-blur-3xl shadow-2xl p-8 max-w-sm mx-auto z-[100]">
        <DialogHeader className="space-y-3">
          <div className={cn("w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center border border-white/10 mx-auto mb-2 text-indigo-500")}>
            <Box className="w-8 h-8" />
          </div>
          <DialogTitle className="text-center text-2xl font-black text-white">
            إضافة منتج أساسي
          </DialogTitle>
        </DialogHeader>
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
              <SelectContent className="bg-zinc-900 border-white/10 rounded-2xl z-[150]">
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
      </DialogContent>
    </Dialog>
  );
}
