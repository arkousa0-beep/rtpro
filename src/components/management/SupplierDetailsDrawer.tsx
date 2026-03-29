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
  Edit3, 
  Trash2, 
  X, 
  Activity,
  Wallet,
  Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence } from "framer-motion";

import { SupplierPaymentModal } from "./SupplierPaymentModal";
import { InventoryItemDetailsDrawer } from "./InventoryItemDetailsDrawer";
import { SupplierInfoTab } from "./supplier/SupplierInfoTab";
import { SupplierFinanceTab } from "./supplier/SupplierFinanceTab";
import { SupplierProductsTab } from "./supplier/SupplierProductsTab";

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
              {activeTab === 'info' && <SupplierInfoTab key="info" supplier={supplier} />}
              {activeTab === 'finance' && (
                <SupplierFinanceTab 
                  key="finance"
                  supplier={supplier} 
                  transactions={data.transactions}
                  onAddPayment={() => setPaymentModalOpen(true)}
                />
              )}
              {activeTab === 'products' && (
                <SupplierProductsTab 
                  key="products"
                  products={data.products} 
                  onSelectProduct={(barcode) => {
                    setSelectedBarcode(barcode);
                    setItemDetailsOpen(true);
                  }}
                />
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
