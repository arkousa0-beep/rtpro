"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  UserPlus, 
  Loader2
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { CustomerList } from "@/components/management/CustomerList";
import { ManagePageLayout } from "@/components/management/ManagePageLayout";
import { useCustomers } from "@/hooks/useCustomers";

export default function CustomersPage() {
  const { customers, loading, submitting, addCustomer, deleteCustomer } = useCustomers();
  const [search, setSearch] = useState("");
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", address: "" });
  const [open, setOpen] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addCustomer(newCustomer);
    if (success) {
      setNewCustomer({ name: "", phone: "", address: "" });
      setOpen(false);
    }
  };

  const filtered = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search)
  );

  return (
    <ManagePageLayout
      title="العملاء"
      subtitle="إدارة بيانات العملاء والديون"
      searchPlaceholder="ابحث عن عميل..."
      searchValue={search}
      onSearchChange={setSearch}
      addButtonLabel="إضافة عميل"
      addDialogTitle="إضافة عميل جديد"
      addDialogIcon={UserPlus}
      isDialogOpen={open}
      onDialogOpenChange={setOpen}
      isLoading={loading}
      iconColor="text-blue-500"
      buttonColor="bg-blue-600"
      addDialogContent={
        <form onSubmit={handleAdd} className="space-y-6 pt-6 text-right">
          <div className="space-y-3">
            <label className="text-xs font-black text-blue-500 uppercase tracking-widest mr-1">الاسم بالكامل</label>
            <Input 
              required 
              className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-blue-500 text-right glass"
              value={newCustomer.name}
              onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
              placeholder="مثال: أحمد محمد"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-blue-500 uppercase tracking-widest mr-1">رقم الهاتف</label>
            <Input 
              required 
              type="tel"
              className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-blue-500 text-left font-mono glass"
              value={newCustomer.phone}
              onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
              placeholder="012XXXXXXXX"
            />
          </div>
          <div className="space-y-3">
            <label className="text-xs font-black text-blue-500 uppercase tracking-widest mr-1">العنوان أو الملاحظات</label>
            <Input 
              className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-blue-500 text-right glass"
              value={newCustomer.address}
              onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
            />
          </div>
          <Button type="submit" className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-blue-500/20 bg-blue-600 text-white border border-white/10 active:scale-[0.98] transition-all" disabled={submitting}>
            {submitting ? <Loader2 className="w-7 h-7 animate-spin mx-auto" /> : "حفظ العميل"}
          </Button>
        </form>
      }
    >
      <AnimatePresence mode="wait">
        <CustomerList customers={filtered} onDelete={deleteCustomer} />
      </AnimatePresence>
    </ManagePageLayout>
  );
}
