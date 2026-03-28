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
import { Product } from "@/lib/services/productService";
import { ImageUpload } from "./ImageUpload";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[2.5rem] border-white/5 bg-black/60 backdrop-blur-3xl shadow-2xl p-8 max-w-lg mx-auto z-[100] overflow-y-auto max-h-[90vh]">
        <DialogHeader className="space-y-3">
          <div className={cn("w-16 h-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center border border-white/10 mx-auto mb-2 text-indigo-500")}>
            <Box className="w-8 h-8" />
          </div>
          <DialogTitle className="text-center text-2xl font-black text-white">
            {initialData ? "تعديل المنتج" : "إضافة منتج أساسي"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-6 text-right">
          <ImageUpload 
            path="products" 
            defaultImage={formData.image_url} 
            onImageUploaded={(url) => setFormData(prev => ({ ...prev, image_url: url }))} 
          />

          <div className="space-y-3">
            <label className="text-xs font-black text-indigo-500 uppercase tracking-widest mr-1">اسم المنتج / الموديل</label>
            <Input
              required
              className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-indigo-500 text-right glass"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="مثال: iPhone 15 Pro Max"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-indigo-500 uppercase tracking-widest mr-1">التصنيف</label>
            <Select
              value={formData.category_id || ""}
              onValueChange={val => setFormData({...formData, category_id: val})}
            >
              <SelectTrigger className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus:ring-indigo-500 glass w-full">
                {formData.category_id ? (
                  <span className="block truncate">{categories.find(c => c.id === formData.category_id)?.name}</span>
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

          <div className="space-y-3">
            <label className="text-xs font-black text-indigo-500 uppercase tracking-widest mr-1">وصف المنتج (اختياري)</label>
            <Textarea
              className="min-h-[100px] rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-indigo-500 text-right glass resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="أضف وصفاً طويلاً للمنتج هنا..."
            />
          </div>

          <Button type="submit" className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-indigo-500/20 bg-indigo-600 text-white border border-white/10 active:scale-[0.98] transition-all" disabled={submitting}>
            {submitting ? <Loader2 className="w-7 h-7 animate-spin mx-auto" /> : (initialData ? "تحديث البيانات" : "حفظ المنتج")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
