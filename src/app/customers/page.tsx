"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  UserPlus, 
  Loader2,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { CustomerList } from "@/components/management/CustomerList";
import { ManagePageLayout } from "@/components/management/ManagePageLayout";
import { useCustomers } from "@/hooks/useCustomers";
import { cn } from "@/lib/utils";

export default function CustomersPage() {
  const { customers, loading, submitting, addCustomer } = useCustomers();
  const [search, setSearch] = useState("");
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", address: "" });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'balance' | 'newest'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | 'debt'>('all');

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addCustomer(newCustomer);
    if (success) {
      setNewCustomer({ name: "", phone: "", address: "" });
      setIsAddDialogOpen(false);
    }
  };

  const filteredCustomers = customers
    .filter(c => {
      const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || 
                           c.phone?.includes(search);
      const matchesFilter = filterBy === 'all' || (Number(c.balance || 0) > 0);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
      if (sortBy === 'balance') return Number(b.balance || 0) - Number(a.balance || 0);
      if (sortBy === 'newest') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      return 0;
    });

  return (
    <ManagePageLayout
      title="العملاء"
      subtitle="إدارة سجلات العملاء والمديونيات"
      backHref="/manage"
      searchPlaceholder="بحث باسم العميل أو رقم الهاتف..."
      searchValue={search}
      onSearchChange={setSearch}
      addButtonLabel="عميل جديد"
      addDialogIcon={UserPlus}
      addDialogTitle="إضافة عميل جديد"
      addDialogContent={
        <form onSubmit={handleAddCustomer} className="space-y-6 pt-6 text-right">
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
            <label className="text-xs font-black text-blue-500 uppercase tracking-widest mr-1">العنوان</label>
            <Input 
              className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white focus-visible:ring-blue-500 text-right glass"
              value={newCustomer.address}
              onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
              placeholder="مثال: القاهرة، مدينة نصر"
            />
          </div>

          <Button type="submit" className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-blue-500/20 bg-blue-600 text-white border border-white/10 active:scale-[0.98] transition-all" disabled={submitting}>
            {submitting ? <Loader2 className="w-7 h-7 animate-spin mx-auto" /> : "حفظ العميل"}
          </Button>
        </form>
      }
      isDialogOpen={isAddDialogOpen}
      onDialogOpenChange={setIsAddDialogOpen}
      isLoading={loading}
      iconColor="text-blue-400"
      buttonColor="bg-blue-600 hover:bg-blue-700"
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
                sortBy === 'newest' ? "bg-blue-500/80 text-white shadow-lg" : "text-white/40 hover:text-white"
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
                sortBy === 'name' ? "bg-blue-500/80 text-white shadow-lg" : "text-white/40 hover:text-white"
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
                sortBy === 'balance' ? "bg-blue-500/80 text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              المديونية
            </Button>
          </div>
        </div>
      }
    >
      <AnimatePresence mode="wait">
        <CustomerList 
          customers={filteredCustomers} 
        />
      </AnimatePresence>
    </ManagePageLayout>
  );
}
