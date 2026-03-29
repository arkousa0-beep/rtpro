"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Store, 
  Loader2
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { SupplierList } from "@/components/management/SupplierList";
import { ManagePageLayout } from "@/components/management/ManagePageLayout";
import { useSuppliers } from "@/hooks/useSuppliers";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useRouteGuard } from "@/hooks/useRouteGuard";

export default function SuppliersPage() {
  const { isAuthorized, isLoading: isAuthLoading } = useRouteGuard('suppliers');
  const { suppliers, loading, submitting, addSupplier, updateSupplier, requestDeleteSupplier, confirmDeleteSupplier, pendingDeleteId, setPendingDeleteId } = useSuppliers();
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'balance' | 'newest'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'debt'>('all');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    if (editingId) {
      success = await updateSupplier(editingId, formData);
    } else {
      success = await addSupplier(formData);
    }

    if (success) {
      setFormData({ name: "", phone: "" });
      setEditingId(null);
      setOpen(false);
    }
  };

  const handleEdit = (supplier: any) => {
    setFormData({
      name: supplier.name || "",
      phone: supplier.phone || ""
    });
    setEditingId(supplier.id);
    setOpen(true);
  };

  const handleOpenAdd = () => {
    setFormData({ name: "", phone: "" });
    setEditingId(null);
    setOpen(true);
  };

  const filtered = suppliers
    .filter(s => {
      const matchesSearch = (s.name || "").toLowerCase().includes(search.toLowerCase()) || 
                            (s.phone || "").includes(search);
      const matchesFilter = filterBy === 'all' || (Number(s.balance || 0) > 0);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return (a.name || "").localeCompare(b.name || "", 'ar');
      if (sortBy === 'balance') return Number(b.balance || 0) - Number(a.balance || 0);
      if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      return 0;
    });

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <ManagePageLayout
      title="الموردين"
      subtitle="إدارة شركات التوريد والمصنعين"
      backHref="/manage"
      searchPlaceholder="ابحث باسم المورد أو رقم الهاتف..."
      searchValue={search}
      onSearchChange={setSearch}
      addButtonLabel="إضافة مورد"
      onAddClick={handleOpenAdd}
      addDialogTitle={editingId ? "تعديل بيانات المورد" : "إضافة مورد جديد"}
      addDialogIcon={Store}
      isDialogOpen={open}
      onDialogOpenChange={setOpen}
      isLoading={loading}
      iconColor="text-amber-500"
      buttonColor="bg-amber-600 hover:bg-amber-700"
      extraContent={
        <div className="flex flex-wrap gap-2 pb-2">
          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/5">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFilterBy('all')}
              className={cn(
                "rounded-xl h-8 px-4 text-xs font-bold transition-all",
                filterBy === 'all' ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              الكل
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFilterBy('debt')}
              className={cn(
                "rounded-xl h-8 px-4 text-xs font-bold transition-all",
                filterBy === 'debt' ? "bg-red-500/80 text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              المديونين
            </Button>
          </div>

          {/* Sort Chips */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-2xl border border-white/5">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSortBy('newest')}
              className={cn(
                "rounded-xl h-8 px-4 text-xs font-bold transition-all",
                sortBy === 'newest' ? "bg-amber-500/80 text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              الأحدث
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSortBy('name')}
              className={cn(
                "rounded-xl h-8 px-4 text-xs font-bold transition-all",
                sortBy === 'name' ? "bg-amber-500/80 text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              الاسم
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSortBy('balance')}
              className={cn(
                "rounded-xl h-8 px-4 text-xs font-bold transition-all",
                sortBy === 'balance' ? "bg-amber-500/80 text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              المديونية
            </Button>
          </div>
        </div>
      }
      addDialogContent={
        <form onSubmit={handleSubmit} className="space-y-6 pt-6 text-right">
          <div className="space-y-3">
            <label className="text-xs font-black text-amber-500 uppercase tracking-widest mr-1">اسم المورد / الشركة</label>
            <Input 
              required 
              className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-amber-500 text-right glass"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: شركة التوريدات العالمية"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-amber-500 uppercase tracking-widest mr-1">رقم الهاتف</label>
            <Input 
              required 
              type="tel"
              className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-amber-500 text-left font-mono glass"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="011XXXXXXXX"
            />
          </div>

          <Button type="submit" className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-amber-500/20 bg-amber-600 text-white border border-white/10 active:scale-[0.98] transition-all" disabled={submitting}>
            {submitting ? <Loader2 className="w-7 h-7 animate-spin mx-auto" /> : editingId ? "تحديث البيانات" : "حفظ المورد"}
          </Button>
        </form>
      }
    >
      <AnimatePresence mode="wait">
        <SupplierList 
          suppliers={filtered} 
          onDelete={requestDeleteSupplier} 
          onEdit={handleEdit}
        />
      </AnimatePresence>

      <ConfirmDialog
        open={!!pendingDeleteId}
        onOpenChange={(open) => !open && setPendingDeleteId(null)}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف أو فقدان ارتباطات الفواتير والمدفوعات المتعلقة به."
        confirmLabel="نعم، احذف المورد"
        cancelLabel="إلغاء"
        onConfirm={confirmDeleteSupplier}
        destructive
      />
    </ManagePageLayout>
  );
}

