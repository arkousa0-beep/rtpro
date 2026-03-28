"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  UserPlus, 
  Search, 
  Loader2,
  ChevronLeft,
  Settings,
  LogOut,
  Plus,
  Store,
  Tag,
  Package
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ReturnDialog } from "@/components/ReturnDialog";
import { toast } from "sonner";

// Management Components
import { CustomerList } from "@/components/management/CustomerList";
import { SupplierList } from "@/components/management/SupplierList";
import { ProductList } from "@/components/management/ProductList";
import { CategoryList } from "@/components/management/CategoryList";

// Services
import { customerService, Customer } from "@/lib/services/customerService";
import { supplierService, Supplier } from "@/lib/services/supplierService";
import { productService, Product } from "@/lib/services/productService";
import { categoryService, Category } from "@/lib/services/categoryService";

type ManagementItem = Customer | Supplier | Product | Category;

export default function MorePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("customers");
  const [data, setData] = useState<ManagementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [newItem, setNewItem] = useState({ name: "", phone: "", categoryId: "" });
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch categories for the dropdown if needed
      if (activeTab === "products" && categories.length === 0) {
        const cats = await categoryService.getAll();
        setCategories(cats || []);
      }

      let result: ManagementItem[] = [];
      if (activeTab === "customers") result = await customerService.getAll() as Customer[];
      else if (activeTab === "suppliers") result = await supplierService.getAll() as Supplier[];
      else if (activeTab === "products") result = await productService.getAll() as Product[];
      else if (activeTab === "categories") result = await categoryService.getAll() as Category[];
      
      setData(result || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء جلب البيانات";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (activeTab === "customers") {
        await customerService.create({ name: newItem.name, phone: newItem.phone });
      } else if (activeTab === "suppliers") {
        await supplierService.create({ name: newItem.name, phone: newItem.phone });
      } else if (activeTab === "products") {
        await productService.create({ name: newItem.name, category_id: newItem.categoryId || null });
      } else if (activeTab === "categories") {
        await categoryService.create({ name: newItem.name });
      }

      toast.success("تم الإضافة بنجاح");
      setNewItem({ name: "", phone: "", categoryId: "" });
      setOpen(false);
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء الإضافة";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = (item: ManagementItem) => {
    const id = (item as any).id;
    if (!id) return;
    
    if (activeTab === "customers") router.push(`/customers/${id}`);
    else if (activeTab === "suppliers") router.push(`/suppliers/${id}`);
    else if (activeTab === "products") router.push(`/inventory/product/${id}`);
  };

  const handleEdit = (item: ManagementItem) => {
    // For categories, we might use a modal later
    if (activeTab === "categories") {
      // Logic for editing category
      toast("خاصية التعديل للموردين قيد التطوير");
    } else {
      handleViewDetails(item);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    
    try {
      if (activeTab === "customers") await customerService.delete(id);
      else if (activeTab === "suppliers") await supplierService.delete(id);
      else if (activeTab === "products") await productService.delete(id);
      else if (activeTab === "categories") await categoryService.delete(id);
      
      toast.success("تم الحذف بنجاح");
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء الحذف";
      toast.error(message);
    }
  };

  const filtered = data.filter((item: ManagementItem) => {
    const searchLower = search.toLowerCase();

    const nameMatch = item.name?.toLowerCase().includes(searchLower);

    const phoneMatch = 'phone' in item && item.phone?.includes(search);

    const categoryMatch = 'categories' in item &&
      item.categories?.name?.toLowerCase().includes(searchLower);

    return nameMatch || phoneMatch || categoryMatch;
  });

  const getIconForTab = (tab: string) => {
    switch(tab) {
      case "customers": return <Users className="w-5 h-5" />;
      case "suppliers": return <Store className="w-5 h-5" />;
      case "products": return <Package className="w-5 h-5" />;
      case "categories": return <Tag className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen pb-32 pt-6 space-y-8 px-1">
      {/* Premium Header */}
      <div className="flex items-center justify-between px-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary glass border border-primary/20">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            مركز الإدارة
          </h2>
          <p className="text-white/40 text-sm font-medium mr-13">تنظيم بيانات المتجر والكيانات</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-12 w-12 rounded-2xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>

      {/* Luxury Tabs System */}
      <Tabs defaultValue="customers" className="w-full" onValueChange={setActiveTab}>
        <div className="px-4 mb-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/[0.03] border border-white/5 p-1.5 h-16 rounded-[1.5rem] glass">
            {[
              { id: "customers", label: "العملاء" },
              { id: "suppliers", label: "الموردين" },
              { id: "products", label: "المنتجات" },
              { id: "categories", label: "الأصناف" }
            ].map(tab => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="rounded-[1.1rem] data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg text-sm font-black transition-all h-full gap-2 flex flex-col md:flex-row items-center justify-center"
              >
                {getIconForTab(tab.id)}
                <span className="hidden md:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="px-4 space-y-6">
          {/* Action Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder={
                  activeTab === "customers" ? "ابحث عن عميل بالاسم أو الهاتف..." : 
                  activeTab === "suppliers" ? "ابحث عن مورد..." : 
                  activeTab === "products" ? "ابحث عن منتج..." : "ابحث عن صنف..."
                } 
                className="pr-12 h-14 bg-white/[0.03] border-white/5 text-white placeholder:text-white/20 rounded-2xl focus-visible:ring-primary focus-visible:border-primary/50 text-right glass transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={
                <Button className="h-14 px-6 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 font-black border border-white/10 group active:scale-95 transition-all">
                  <Plus className="w-6 h-6 md:ml-2 group-hover:rotate-90 transition-transform duration-300" />
                  <span className="hidden md:inline text-lg">إضافة جديد</span>
                </Button>
              } />
              <DialogContent className="rounded-[2.5rem] border-white/5 bg-black/60 backdrop-blur-3xl shadow-2xl p-8 max-w-sm mx-auto">
                <DialogHeader className="space-y-3">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-primary/20 flex items-center justify-center text-primary border border-primary/20 mx-auto mb-2">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <DialogTitle className="text-center text-2xl font-black text-white">
                    إضافة {
                      activeTab === "customers" ? "عميل جديد" : 
                      activeTab === "suppliers" ? "مورد جديد" : 
                      activeTab === "products" ? "منتج جديد" : "صنف جديد"
                    }
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-6 pt-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-primary uppercase tracking-widest mr-1">
                      {activeTab === "products" ? "اسم المنتج" : 
                      activeTab === "categories" ? "اسم الصنف" : "الاسم بالكامل"}
                    </label>
                    <Input 
                      required 
                      className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-primary text-right glass"
                      value={newItem.name}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                    />
                  </div>

                  {(activeTab === "customers" || activeTab === "suppliers") ? (
                    <>
                      <div className="space-y-3">
                        <label className="text-xs font-black text-primary uppercase tracking-widest mr-1">رقم الهاتف</label>
                        <Input 
                          required 
                          type="tel"
                          className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-primary text-left font-mono glass"
                          value={newItem.phone}
                          onChange={e => setNewItem({...newItem, phone: e.target.value})}
                        />
                      </div>
                    </>
                  ) : activeTab === "products" ? (
                    <div className="space-y-3">
                      <label className="text-xs font-black text-primary uppercase tracking-widest mr-1">الصنف الرئيسي</label>
                      <Select 
                        value={newItem.categoryId}
                        onValueChange={(val) => setNewItem({...newItem, categoryId: val || ""})}
                      >
                        <SelectTrigger className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus:ring-primary glass text-right">
                          {newItem.categoryId ? (
                            <span className="block truncate">{categories.find(c => c.id === newItem.categoryId)?.name}</span>
                          ) : (
                            <span className="block truncate text-white/40">اختر الصنف...</span>
                          )}
                        </SelectTrigger>
                        <SelectContent className="glass border-white/10 rounded-2xl">
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id} className="focus:bg-primary/20 focus:text-primary">{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>                    </div>
                  ) : null}

                  <Button type="submit" className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/20 bg-primary text-white border border-white/10 active:scale-[0.98] transition-all" disabled={submitting}>
                    {submitting ? <Loader2 className="w-7 h-7 animate-spin mx-auto" /> : "حفظ البيانات"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Results Grid */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-24 space-y-4">
                <div className="relative w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="text-white/40 text-lg font-bold tracking-wide">جاري مزامنة البيانات...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 border border-white/5 rounded-[2.5rem] bg-white/[0.02] text-white/20 glass"
                  >
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-5" />
                    <p className="text-xl font-black">لا توجد نتائج مطابقة</p>
                    <p className="text-sm mt-1">حاول استخدام كلمات بحث مختلفة</p>
                  </motion.div>
                ) : (
                  <AnimatePresence mode="wait">
                    {activeTab === "customers" && (
                      <CustomerList customers={filtered as Customer[]} />
                    )}
                    {activeTab === "suppliers" && (
                      <SupplierList 
                        suppliers={filtered as Supplier[]} 
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                      />
                    )}
                    {activeTab === "products" && (
                      <ProductList 
                        products={filtered as Product[]} 
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onViewDetails={handleViewDetails}
                      />
                    )}
                    {activeTab === "categories" && (
                      <CategoryList 
                        categories={filtered as Category[]} 
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onViewDetails={handleViewDetails}
                      />
                    )}
                  </AnimatePresence>
                )}
              </div>
            )}
          </div>
        </div>
      </Tabs>

      {/* Footer Actions */}
      <div className="fixed bottom-32 left-0 right-0 px-5 flex flex-col md:flex-row gap-4 items-center justify-center z-40 pointer-events-none">
        <div className="pointer-events-auto flex gap-4 w-full max-w-lg">
          <ReturnDialog />
          <motion.div 
            whileHover={{ y: -5 }}
            className="flex-1"
          >
            <Card className="border-white/5 bg-white/5 backdrop-blur-3xl rounded-[2rem] p-5 flex items-center justify-between cursor-pointer group hover:bg-white/10 transition-all border border-white/10 shadow-2xl overflow-hidden relative">
              <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 glass border border-orange-500/20 group-hover:rotate-12 transition-transform">
                   <Settings className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <h4 className="font-black text-white text-lg">الإعدادات</h4>
                  <p className="text-white/30 text-xs">تخصيص تجربة التطبيق</p>
                </div>
              </div>
              <ChevronLeft className="w-6 h-6 text-white/20 group-hover:text-white group-hover:translate-x-[-10px] transition-all" />
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
