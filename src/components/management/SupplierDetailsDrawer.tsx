"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Supplier, supplierService } from "@/lib/services/supplierService";
import { 
  Store, 
  Calendar, 
  Phone, 
  Activity, 
  Edit3, 
  Trash2, 
  X, 
  MapPin, 
  Wallet, 
  ScrollText,
  Package,
  MessageCircle,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

import { SupplierPaymentModal } from "./SupplierPaymentModal";
import { InventoryItemDetailsDrawer } from "./InventoryItemDetailsDrawer";
import { Plus } from "lucide-react";

interface SupplierDetailsDrawerProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
}

export function SupplierDetailsDrawer({
  supplier,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: SupplierDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'finance' | 'products'>('info');
  const [data, setData] = useState<{ transactions: any[], products: any[] }>({ transactions: [], products: [] });
  const [loading, setLoading] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState<string | null>(null);
  const [itemDetailsOpen, setItemDetailsOpen] = useState(false);

  useEffect(() => {
    if (supplier?.id && open) {
      fetchSupplierData(supplier.id);
    }
  }, [supplier?.id, open]);

  async function fetchSupplierData(id: string) {
    setLoading(true);
    try {
      const [transactions, products] = await Promise.all([
        supplierService.getTransactions(id),
        supplierService.getProducts(id)
      ]);
      setData({ transactions, products });
    } catch (error) {
      console.error("Error fetching supplier data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (!supplier) return null;

  const waLink = supplier.phone ? `https://wa.me/${supplier.phone.replace(/\D/g, '').startsWith('0') ? '2' + supplier.phone.replace(/\D/g, '') : supplier.phone.replace(/\D/g, '')}` : null;

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="bg-black/80 backdrop-blur-2xl border-white/5 rounded-t-[2.5rem] p-6 outline-none max-h-[92vh]">
          <DrawerHeader className="pb-4 relative">
            <div
              className="absolute right-4 top-4 w-10 h-10 rounded-full bg-white/5 border border-white/5 text-white/40 flex items-center justify-center cursor-pointer hover:text-white hover:bg-white/10 transition-all z-50"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </div>
            
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.8rem] md:rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 mx-auto mb-4 mt-2 shadow-lg shadow-amber-500/10">
              <Store className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <DrawerTitle className="text-center text-2xl md:text-3xl font-black text-white tracking-tight">
              {supplier.name}
            </DrawerTitle>
            <p className="text-center text-white/30 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-2">
              ملف المورد وسجل التعاملات
            </p>
          </DrawerHeader>

          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 mb-6 mx-auto w-fit">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('info')}
              className={cn(
                "rounded-xl h-10 px-6 text-xs font-black transition-all gap-2",
                activeTab === 'info' ? "bg-amber-500 text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              <Activity className="w-3.5 h-3.5" />
              المعلومات
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('finance')}
              className={cn(
                "rounded-xl h-10 px-6 text-xs font-black transition-all gap-2",
                activeTab === 'finance' ? "bg-amber-500 text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              <Wallet className="w-3.5 h-3.5" />
              المالية
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab('products')}
              className={cn(
                "rounded-xl h-10 px-6 text-xs font-black transition-all gap-2",
                activeTab === 'products' ? "bg-amber-500 text-white shadow-lg" : "text-white/40 hover:text-white"
              )}
            >
              <Package className="w-3.5 h-3.5" />
              القطع
            </Button>
          </div>

          <div className="overflow-y-auto px-2 pb-6 flex-1 min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="glass p-5 rounded-[2rem] border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-amber-500">
                        <Phone className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">رقم الهاتف</span>
                      </div>
                      <p className="text-white font-black text-lg font-mono">
                        {supplier.phone || "غير متوفر"}
                      </p>
                      {waLink && (
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="block pt-2">
                          <Button className="w-full bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl h-10 gap-2 text-xs font-black transition-all">
                            <MessageCircle className="w-4 h-4" />
                            مراسلة واتساب
                          </Button>
                        </a>
                      )}
                    </div>
                    <div className="glass p-5 rounded-[2rem] border-white/5 space-y-2">
                      <div className="flex items-center gap-2 text-amber-500">
                        <Calendar className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wider">تاريخ الانضمام</span>
                      </div>
                      <p className="text-white font-black text-lg">
                        {supplier.created_at ? format(new Date(supplier.created_at), "dd MMMM yyyy", { locale: ar }) : "غير متوفر"}
                      </p>
                      <p className="text-white/30 text-[10px] font-bold">
                        شريك منذ {supplier.created_at ? format(new Date(supplier.created_at), "yyyy") : "..."}
                      </p>
                    </div>
                  </div>


                </motion.div>
              )}

              {activeTab === 'finance' && (
                <motion.div
                  key="finance"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className={cn(
                    "p-8 rounded-[2.5rem] border flex flex-col items-center justify-center text-center shadow-2xl relative group overflow-hidden",
                    Number(supplier.balance || 0) > 0 
                    ? "bg-red-500/10 border-red-500/20 shadow-red-500/5" 
                    : "bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5"
                  )}>
                    <span className={cn(
                      "text-xs font-black uppercase tracking-[0.3em] mb-2 leading-none",
                      Number(supplier.balance || 0) > 0 ? "text-red-400" : "text-emerald-400"
                    )}>
                      {Number(supplier.balance || 0) > 0 ? "إجمالي المديونية" : "الرصيد الحالي"}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className={cn(
                        "text-5xl font-black tracking-tighter",
                        Number(supplier.balance || 0) > 0 ? "text-red-500" : "text-emerald-500"
                      )}>
                        {Math.abs(Number(supplier.balance || 0)).toLocaleString()}
                      </span>
                      <span className="text-white/40 font-bold text-sm">ج.م</span>
                    </div>

                    {Number(supplier.balance || 0) > 0 && (
                      <Button
                        onClick={() => setPaymentModalOpen(true)}
                        className="mt-6 bg-red-500 hover:bg-red-600 text-white border-white/10 rounded-2xl h-12 px-8 font-black text-xs gap-2 shadow-xl shadow-red-500/20 transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        تسجيل سداد دفعة
                      </Button>
                    )}
                  </div>

                  <div className="glass p-6 rounded-[2.5rem] border-white/5">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                          <ScrollText className="w-5 h-5" />
                        </div>
                        <h5 className="font-black text-white text-sm">سجل المدفوعات</h5>
                      </div>
                      <Button variant="ghost" size="sm" className="text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 rounded-xl border border-amber-500/10 h-8">تصدير كشف</Button>
                    </div>

                    <div className="space-y-3">
                      {data.transactions.length > 0 ? (
                        data.transactions.map((t, idx) => (
                          <div key={t.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <Wallet className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-white font-black text-sm">دفعة نقدية</p>
                                <p className="text-white/30 text-[10px] font-bold">{format(new Date(t.created_at), "dd/MM/yyyy")}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-emerald-500 font-black tracking-tight">{Number(t.total).toLocaleString()} ج.م</p>
                              <p className="text-white/20 text-[10px] font-bold uppercase">{t.method}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 space-y-2 opacity-20">
                          <ScrollText className="w-12 h-12 mx-auto" />
                          <p className="text-xs font-bold">لا يوجد تعاملات مالية مسجلة</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'products' && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="glass p-6 rounded-[2.5rem] border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                      <div className="glass p-4 rounded-2xl border-white/5 space-y-1">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-wider">إجمالي القطع</span>
                        <p className="text-white font-black text-xl">{data.products.length}</p>
                      </div>
                      <div className="glass p-4 rounded-2xl border-white/5 space-y-1">
                        <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-wider">قيمة الشراء</span>
                        <p className="text-amber-500 font-black text-xl">
                          {data.products.reduce((acc, p) => acc + Number(p.cost_price || 0), 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="glass p-4 rounded-2xl border-white/5 space-y-1">
                        <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-wider">قيمة البيع المتوقعة</span>
                        <p className="text-emerald-500 font-black text-xl">
                          {data.products.reduce((acc, p) => acc + Number(p.selling_price || 0), 0).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                          <Truck className="w-5 h-5" />
                        </div>
                        <h5 className="font-black text-white text-sm">القطع الموردة من هذا المورد</h5>
                      </div>
                      <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{data.products.length} قطعة</span>
                    </div>

                    <div className="space-y-3">
                      {data.products.length > 0 ? (
                        data.products.map((item, idx) => (
                          <div 
                            key={item.barcode} 
                            onClick={() => {
                              setSelectedBarcode(item.barcode);
                              setItemDetailsOpen(true);
                            }}
                            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/[0.08] transition-all cursor-pointer active:scale-[0.98]"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 overflow-hidden border border-amber-500/20">
                                <Package className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-white font-black text-sm">{item.products?.name}</p>
                                <p className="text-white/30 text-[10px] font-mono tracking-wider">{item.barcode}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-amber-500 font-black tracking-tight">{Number(item.cost_price).toLocaleString()} ج.م</p>
                              <span className={cn(
                                "text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest",
                                item.status === 'In-Stock' ? "bg-emerald-500/20 text-emerald-500" : "bg-white/10 text-white/40"
                              )}>
                                {item.status === 'In-Stock' ? "موجود" : item.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 space-y-2 opacity-20">
                          <Package className="w-12 h-12 mx-auto" />
                          <p className="text-xs font-bold">لا يوجد قطع مسجلة لهذا المورد</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5 mt-auto">
            <Button 
              className="flex-1 h-16 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-lg gap-3 border border-white/10 shadow-xl shadow-amber-600/20 active:scale-95 transition-all order-1 sm:order-2"
              onClick={() => {
                onEdit(supplier);
                onOpenChange(false);
              }}
            >
              <Edit3 className="w-6 h-6" />
              تعديل البيانات
            </Button>
            <Button 
              variant="destructive"
              className="w-full sm:w-16 h-16 rounded-2xl bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/10 p-0 active:scale-95 transition-all order-2 sm:order-1"
              onClick={() => {
                if (supplier.id) onDelete(supplier.id);
                onOpenChange(false);
              }}
            >
              <Trash2 className="w-7 h-7" />
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <SupplierPaymentModal
        supplierId={supplier.id!}
        supplierName={supplier.name}
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        onSuccess={() => fetchSupplierData(supplier.id!)}
      />

      <InventoryItemDetailsDrawer
        barcode={selectedBarcode}
        open={itemDetailsOpen}
        onOpenChange={setItemDetailsOpen}
      />
    </>
  );
}
