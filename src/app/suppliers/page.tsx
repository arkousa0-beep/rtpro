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

export default function SuppliersPage() {
  const { suppliers, loading, submitting, addSupplier, deleteSupplier } = useSuppliers();
  const [search, setSearch] = useState("");
  const [newSupplier, setNewSupplier] = useState({ name: "", phone: "" });
  const [open, setOpen] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addSupplier(newSupplier);
    if (success) {
      setNewSupplier({ name: "", phone: "" });
      setOpen(false);
    }
  };

  const filtered = suppliers.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.phone?.includes(search)
  );

  return (
    <ManagePageLayout
      title="الموردين"
      subtitle="إدارة شركات التوريد والمصنعين"
      searchPlaceholder="ابحث عن مورد..."
      searchValue={search}
      onSearchChange={setSearch}
      addButtonLabel="إضافة مورد"
      addDialogTitle="إضافة مورد جديد"
      addDialogIcon={Store}
      isDialogOpen={open}
      onDialogOpenChange={setOpen}
      isLoading={loading}
      iconColor="text-amber-500"
      buttonColor="bg-amber-600"
      addDialogContent={
        <form onSubmit={handleAdd} className="space-y-6 pt-6 text-right">
          <div className="space-y-3">
            <label className="text-xs font-black text-amber-500 uppercase tracking-widest mr-1">اسم المورد / الشركة</label>
            <Input 
              required 
              className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-amber-500 text-right glass"
              value={newSupplier.name}
              onChange={e => setNewSupplier({...newSupplier, name: e.target.value})}
              placeholder="مثال: شركة التوريدات العالمية"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-amber-500 uppercase tracking-widest mr-1">رقم الهاتف</label>
            <Input 
              required 
              type="tel"
              className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-amber-500 text-left font-mono glass"
              value={newSupplier.phone}
              onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})}
              placeholder="011XXXXXXXX"
            />
          </div>
          <Button type="submit" className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-amber-500/20 bg-amber-600 text-white border border-white/10 active:scale-[0.98] transition-all" disabled={submitting}>
            {submitting ? <Loader2 className="w-7 h-7 animate-spin mx-auto" /> : "حفظ المورد"}
          </Button>
        </form>
      }
    >
      <AnimatePresence mode="wait">
        <SupplierList suppliers={filtered} onDelete={deleteSupplier} />
      </AnimatePresence>
    </ManagePageLayout>
  );
}

