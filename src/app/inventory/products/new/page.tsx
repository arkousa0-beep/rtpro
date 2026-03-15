"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ChevronRight, LayoutGrid, Tag } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { productService } from "@/lib/services/productService";
import { categoryService, Category } from "@/lib/services/categoryService";
import { toast } from "sonner";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "general", // Using general as default if none selected
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await categoryService.getAll();
        if (data) setCategories(data);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("يرجى إدخال اسم المنتج");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        name: formData.name.trim(),
      };

      // Only attach category_id if it's not the generic "general" string
      // and it's a valid UUID from the categories table
      if (formData.categoryId !== "general") {
        payload.category_id = formData.categoryId;
      }

      await productService.create(payload);

      toast.success("تم إضافة المنتج بنجاح");
      router.back();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الإضافة. تأكد من الصلاحيات.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full bg-muted/50" onClick={() => router.back()}>
          <ChevronRight className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-black tracking-tight">إضافة نوع منتج</h2>
          <p className="text-sm text-muted-foreground">تعريف منتج جديد في النظام</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardContent className="p-6 space-y-6 pt-8">
              <div className="space-y-3 text-right">
                <label className="text-sm font-bold text-muted-foreground mr-1">اسم المنتج</label>
                <div className="relative">
                  <Tag className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    required
                    placeholder="مثال: آيفون 15 برو ماكس" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-14 pr-12 rounded-2xl bg-muted/40 border-none text-right text-base"
                  />
                </div>
              </div>

              <div className="space-y-3 text-right">
                <label className="text-sm font-bold text-muted-foreground mr-1">القسم / الفئة</label>
                <div className="relative">
                  <LayoutGrid className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                  <Select value={formData.categoryId} onValueChange={(val) => setFormData({...formData, categoryId: val})}>
                    <SelectTrigger className="h-14 pr-12 rounded-2xl bg-muted/40 border-none text-right text-base w-full flex-row-reverse">
                      <SelectValue placeholder="اختر الفئة..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      <SelectItem value="general" className="text-right focus:bg-primary/20">عام (بدون تصنيف)</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-right focus:bg-primary/20">
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Button type="submit" className="w-full h-16 rounded-[1.5rem] text-xl font-black shadow-2xl shadow-primary/20" disabled={loading}>
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "حفظ المنتج"}
        </Button>
      </form>
    </div>
  );
}
