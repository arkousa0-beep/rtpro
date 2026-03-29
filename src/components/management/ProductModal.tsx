import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Box } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/services/productService";
import { ImageUpload } from "./ImageUpload";
import { ResponsiveDialog } from "@/components/ui/ResponsiveDialog";

interface ProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (productId: string) => void;
  initialData?: Product | null;
}

export function ProductModal({ open, onOpenChange, onSuccess, initialData }: ProductModalProps) {
  const { submitting, addProduct, updateProduct } = useProducts();
  const { categories } = useCategories();

  const [formData, setFormData] = useState({ 
    name: "", 
    category_id: "", 
    image_url: "",
    description: "" 
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        name: initialData.name || "", 
        category_id: initialData.category_id || "",
        image_url: initialData.image_url || "",
        description: initialData.description || ""
      });
    } else {
      setFormData({ name: "", category_id: "", image_url: "", description: "" });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.warning("يرجى إدخال اسم المنتج");
    if (!formData.category_id) return toast.warning("يرجى اختيار التصنيف");

    if (initialData?.id) {
      const success = await updateProduct(initialData.id, formData);
      if (success) {
        onOpenChange(false);
        onSuccess?.(initialData.id);
      }
    } else {
      const createdProduct = await addProduct(formData);
      if (createdProduct) {
        setFormData({ name: "", category_id: "", image_url: "", description: "" });
        onOpenChange(false);
        onSuccess?.(createdProduct.id || "");
      }
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "تعديل المنتج" : "إضافة منتج أساسي"}
      description="Product Management Center"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
             <Box className="w-7 h-7 text-indigo-500" />
          </div>
          <div className="text-right">
            <h4 className="text-xl font-black italic text-white/80">بيانات المنتج</h4>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Enter product specs</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-right">
          <ImageUpload 
            path="products" 
            defaultImage={formData.image_url} 
            onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url: url }))} 
          />

          <div className="space-y-3">
            <label className="text-xs font-black text-white/40 uppercase tracking-widest mr-1 flex items-center gap-2 justify-end">
              اسم المنتج / الموديل
              <span className="w-1 h-3 bg-indigo-500 rounded-full" />
            </label>
            <Input
              required
              className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-indigo-500 text-right glass text-lg font-bold"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="مثال: iPhone 15 Pro Max"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-white/40 uppercase tracking-widest mr-1 flex items-center gap-2 justify-end">
              التصنيف
              <span className="w-1 h-3 bg-emerald-500 rounded-full" />
            </label>
            <Select
              value={formData.category_id || ""}
              onValueChange={val => setFormData({...formData, category_id: val})}
            >
              <SelectTrigger className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus:ring-indigo-500 glass w-full text-right font-bold">
                {formData.category_id ? (
                  <span className="block truncate">{categories.find(c => c.id === formData.category_id)?.name}</span>
                ) : (
                  <span className="block truncate text-white/40">اختر التصنيف</span>
                )}
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 rounded-2xl z-[150]">
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id as string} className="text-right flex-row-reverse font-bold h-12">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-white/40 uppercase tracking-widest mr-1 flex items-center gap-2 justify-end">
              وصف المنتج (اختياري)
              <span className="w-1 h-3 bg-purple-500 rounded-full" />
            </label>
            <Textarea
              className="min-h-[100px] rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-indigo-500 text-right glass resize-none font-bold"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="أضف وصفاً طويلاً للمنتج هنا..."
            />
          </div>

          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-14 w-full sm:w-auto px-8 rounded-2xl font-black text-white/40 hover:text-white uppercase tracking-widest"
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="h-14 px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-lg gap-3 shadow-xl shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95 flex-1 w-full"
            >
              {submitting ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Box className="w-6 h-6" />
                  {initialData ? "تحديث البيانات" : "حفظ المنتج"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ResponsiveDialog>
  );
}
