"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronRight, LayoutGrid, Tag, FileText } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { productService } from "@/lib/services/productService";
import { toast } from "sonner";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await productService.create({
        name: formData.name,
        category_id: formData.category, // Assuming category maps to category_id or we just pass it
        ...({ category: formData.category, description: formData.description } as any)
      });
      toast.success("تم إضافة المنتج بنجاح");
      router.back();
    } catch (error: any) {
      toast.error(error.message || "حدث خطأ أثناء الإضافة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full bg-muted/50" asChild>
          <Link href="/inventory/add">
            <ChevronRight className="w-5 h-5" />
          </Link>
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
              <div className="space-y-3">
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

              <div className="space-y-3">
                <label className="text-sm font-bold text-muted-foreground mr-1">القسم / الفئة</label>
                <div className="relative">
                  <LayoutGrid className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    placeholder="مثال: هواتف ذكية" 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="h-14 pr-12 rounded-2xl bg-muted/40 border-none text-right text-base"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-muted-foreground mr-1">وصف المنتج (اختياري)</label>
                <div className="relative">
                  <FileText className="absolute right-4 top-4 w-5 h-5 text-muted-foreground" />
                  <textarea 
                    placeholder="اكتب تفاصيل إضافية عن المنتج..." 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full min-h-[120px] p-4 pr-12 rounded-2xl bg-muted/40 border-none text-right text-base focus-visible:ring-2 focus-visible:ring-primary outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Button type="submit" className="w-full h-16 rounded-[1.5rem] text-xl font-black shadow-2xl shadow-primary/20" disabled={loading}>
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "تعريف المنتج الجديد"}
        </Button>
      </form>
    </div>
  );
}
