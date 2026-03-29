"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { productService } from "@/lib/services/productService";
import { supplierService } from "@/lib/services/supplierService";
import { categoryService } from "@/lib/services/categoryService";
import { inventoryService } from "@/lib/services/inventoryService";
import { Product } from "@/lib/services/productService";
import { Supplier } from "@/lib/services/supplierService";
import { Category } from "@/lib/services/categoryService";
import { Item } from "@/lib/services/inventoryService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  ChevronRight, 
  Package, 
  Barcode, 
  CreditCard,
  Loader2,
  Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { ProductModal } from "@/components/management/ProductModal";
import { CameraScannerDialog } from "@/components/ui/CameraScannerDialog";
import { Suspense } from "react";
import { useRouteGuard } from "@/hooks/useRouteGuard";

function AddItemForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    productId: "",
    barcode: "",
    batchBarcodes: "", // New field for batch
    costPrice: "",
    sellingPrice: "",
    supplierId: "",
  });

  const [mode, setMode] = useState<"single" | "batch">("single");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [prodData, suppData, catData] = await Promise.all([
        productService.getAll(),
        supplierService.getAll(),
        categoryService.getAll()
      ]);

      if (prodData) setProducts(prodData);
      if (suppData) setSuppliers(suppData);
      if (catData) setCategories(catData);
    } catch (err: any) {
      toast.error("حدث خطأ أثناء جلب البيانات");
    }
  };

  useEffect(() => {
    fetchData();
    const productId = searchParams.get('productId');
    if (productId) {
      setFormData(prev => ({ ...prev, productId }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId) return toast.warning("يرجى اختيار المنتج أولاً");
    
    setLoading(true);

    try {
      let itemsToInsert: Partial<Item>[] = [];

      if (mode === 'single') {
        if (!formData.barcode) throw new Error("يرجى إدخال الباركود");
        itemsToInsert.push({
          barcode: formData.barcode,
          product_id: formData.productId,
          cost_price: parseFloat(formData.costPrice) || 0,
          selling_price: parseFloat(formData.sellingPrice) || 0,
          supplier_id: formData.supplierId || null,
          status: 'In-Stock' as const
        });
      } else {
        const barcodes = formData.batchBarcodes
          .split(/[\n, ]+/)
          .map(b => b.trim())
          .filter(b => b.length > 0);

        if (barcodes.length === 0) throw new Error("يرجى إدخال الباركودات");
        
        itemsToInsert = barcodes.map(barcode => ({
          barcode,
          product_id: formData.productId,
          cost_price: parseFloat(formData.costPrice) || 0,
          selling_price: parseFloat(formData.sellingPrice) || 0,
          supplier_id: formData.supplierId || null,
          status: 'In-Stock' as const
        }));
      }

      await inventoryService.insertItems(itemsToInsert);

      toast.success("تم الإضافة بنجاح");
      router.push('/inventory');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ ما");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-2xl bg-white/5 border border-white/5 text-white hover:bg-white/10 hover:scale-110 active:scale-90 transition-all" 
          asChild
        >
          <Link href="/inventory">
            <ChevronRight className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">إضافة قطعة جديدة</h2>
          <p className="text-sm text-white/50 italic font-medium">تسجيل الرقم التسلسلي للمنتج في المخزن</p>
        </div>
      </div>

      <ProductModal open={isProductModalOpen} onOpenChange={setIsProductModalOpen} onSuccess={(newId) => { setFormData(prev => ({...prev, productId: newId})); fetchData(); }} />
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="glass border-white/5 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-lg shadow-primary/5">
                   <Package className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-white">تفاصيل المنتج</CardTitle>
                  <p className="text-xs text-white/40 font-medium">اختر المنتج وحدد طريقة الإدخال</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-primary uppercase tracking-widest mr-1">تصفية حسب الصنف</label>
                  <Select 
                    value={selectedCategory} 
                    onValueChange={(val) => setSelectedCategory(val || "all")}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-white/[0.03] border-white/5 text-white focus:ring-primary focus:border-primary/50 text-right glass transition-all hover:bg-white/[0.05]">
                      {selectedCategory === "all" ? (
                        <span className="block truncate">الكل</span>
                      ) : (
                        <span className="block truncate">{categories.find(c => c.id === selectedCategory)?.name || "الكل"}</span>
                      )}
                    </SelectTrigger>
                    <SelectContent className="glass border-white/10 rounded-2xl">
                      <SelectItem value="all">الكل</SelectItem>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id} className="focus:bg-primary/20 focus:text-primary transition-colors">{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-primary uppercase tracking-widest mr-1">نوع المنتج</label>
                  <Select 
                    value={formData.productId}
                    onValueChange={(val: string | null) => { if(val) setFormData(prev => ({...prev, productId: val})) }}
                  >
                    <SelectTrigger className="h-14 rounded-2xl bg-white/[0.03] border-white/5 text-white focus:ring-primary focus:border-primary/50 text-right glass transition-all hover:bg-white/[0.05]">
                      {formData.productId ? (
                        <span className="block truncate">{products.find(p => p.id === formData.productId)?.name}</span>
                      ) : (
                        <span className="block truncate text-white/40">اختر المنتج...</span>
                      )}
                    </SelectTrigger>
                    <SelectContent className="glass border-white/10 rounded-2xl max-h-[300px]">
                      {products
                        .filter(p => selectedCategory === "all" || p.category_id === selectedCategory)
                        .map(p => (
                          <SelectItem key={p.id} value={p.id} className="focus:bg-primary/20 focus:text-primary transition-colors">{p.name}</SelectItem>
                        ))
                      }
                      <button type="button" onClick={() => setIsProductModalOpen(true)} className="flex items-center gap-2 p-4 text-primary font-black hover:bg-primary/10 transition-all border-t border-white/5 mt-2 group">
                         <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" /> إضافة منتج جديد
                      </button>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 h-16 rounded-[1.5rem] bg-white/[0.02] border border-white/5 mb-8 p-1.5">
                  <TabsTrigger value="single" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 text-base font-black transition-all">إضافة فردية</TabsTrigger>
                  <TabsTrigger value="batch" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl shadow-primary/20 text-base font-black transition-all">إضافة جماعية</TabsTrigger>
                </TabsList>
                
                <TabsContent value="single" className="space-y-3 mt-0">
                  <label className="text-xs font-black text-primary uppercase tracking-widest mr-1">الباركود / السيريال (S/N)</label>
                  <div className="relative group">
                    <Barcode className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-primary transition-all" />
                    <Input 
                      required={mode === 'single'}
                      placeholder="امسح الباركود أو اكتبه هنا..." 
                      value={formData.barcode}
                      onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                      className="h-16 pr-14 rounded-[1.5rem] bg-white/[0.03] border-white/5 text-white placeholder:text-white/20 focus-visible:ring-primary focus-visible:border-primary/50 text-right text-lg font-mono glass transition-all"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="w-full h-14 rounded-[1.5rem] bg-white/[0.03] border border-white/10 hover:bg-primary/10 hover:border-primary/30 text-white/60 hover:text-primary font-black gap-3 transition-all active:scale-[0.98]"
                  >
                    <Camera className="w-5 h-5" />
                    مسح بالكاميرا
                  </Button>
                </TabsContent>

                <TabsContent value="batch" className="space-y-3 mt-0">
                  <label className="text-xs font-black text-primary uppercase tracking-widest mr-1">قائمة الباركودات (كل واحد في سطر)</label>
                  <Textarea 
                    required={mode === 'batch'}
                    placeholder="أدخل الباركودات هنا... يمكنك نسخها ولصقها دفعة واحدة" 
                    value={formData.batchBarcodes}
                    onChange={(e) => setFormData({...formData, batchBarcodes: e.target.value})}
                    className="min-h-40 rounded-[1.5rem] bg-white/[0.03] border-white/5 text-white placeholder:text-white/20 focus-visible:ring-primary focus-visible:border-primary/50 text-right text-lg font-mono p-6 glass transition-all resize-none"
                  />
                  <Button
                    type="button"
                    onClick={() => setIsCameraOpen(true)}
                    className="w-full h-14 rounded-[1.5rem] bg-white/[0.03] border border-white/10 hover:bg-primary/10 hover:border-primary/30 text-white/60 hover:text-primary font-black gap-3 transition-all active:scale-[0.98]"
                  >
                    <Camera className="w-5 h-5" />
                    مسح مستمر بالكاميرا
                  </Button>
                  <div className="flex items-center gap-2 mr-1">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-tight">سيتم إضافة كل باركود كقطعة منفصلة من هذا المنتج.</p>
                  </div>
                </TabsContent>
              </Tabs>

              <CameraScannerDialog
                open={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onScan={(barcode) => {
                  if (mode === 'single') {
                    setFormData(prev => ({ ...prev, barcode }));
                    setIsCameraOpen(false);
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      batchBarcodes: prev.batchBarcodes
                        ? prev.batchBarcodes + '\n' + barcode
                        : barcode
                    }));
                  }
                }}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card className="glass border-white/5 rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                   <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-white">التسعير والمورد</CardTitle>
                  <p className="text-xs text-white/40 font-medium">تحديد التكاليف وجهة التوريد</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-primary uppercase tracking-widest mr-1">سعر التكلفة</label>
                  <div className="relative group">
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                      className="h-16 rounded-[1.5rem] bg-white/[0.03] border-white/5 text-white placeholder:text-white/20 focus-visible:ring-primary focus-visible:border-primary/50 text-right font-mono text-xl glass pr-14 transition-all"
                    />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-black text-xs">ج.م</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-primary uppercase tracking-widest mr-1">سعر البيع</label>
                  <div className="relative group">
                    <Input 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                      className="h-16 rounded-[1.5rem] bg-white/[0.03] border-white/5 text-white placeholder:text-white/20 focus-visible:ring-primary focus-visible:border-primary/50 text-right font-mono text-xl glass pr-14 transition-all"
                    />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 font-black text-xs">ج.م</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-primary uppercase tracking-widest mr-1">المورد</label>
                <Select 
                  value={formData.supplierId}
                  onValueChange={(val: string | null) => { if(val) setFormData(prev => ({...prev, supplierId: val})) }}
                >
                  <SelectTrigger className="h-14 rounded-2xl bg-white/[0.03] border-white/5 text-white focus:ring-primary focus:border-primary/50 text-right glass transition-all hover:bg-white/[0.05]">
                    {formData.supplierId ? (
                      <span className="block truncate">{suppliers.find(s => s.id === formData.supplierId)?.name}</span>
                    ) : (
                      <span className="block truncate text-white/40">اختر المورد...</span>
                    )}
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 rounded-2xl">
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id} className="focus:bg-primary/20 focus:text-primary transition-colors">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            type="submit" 
            className="w-full h-20 rounded-[2rem] text-xl font-black bg-primary text-white shadow-2xl shadow-primary/30 border border-white/10 transition-all active:brightness-90" 
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-7 h-7 animate-spin" />
                <span>جاري الحفظ...</span>
              </div>
            ) : (
              "حفظ القطعة في المخزن"
            )}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}

export default function AddItemPage() {
  const { isAuthorized, isLoading } = useRouteGuard("inventory");

  if (isLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <AddItemForm />
    </Suspense>
  );
}
