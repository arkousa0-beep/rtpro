"use client";

import { motion } from "framer-motion";
import { Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupplierProductsTabProps {
  products: any[];
  onSelectProduct: (barcode: string) => void;
}

export function SupplierProductsTab({ 
  products, 
  onSelectProduct 
}: SupplierProductsTabProps) {
  return (
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
            <p className="text-white font-black text-xl">{products.length}</p>
          </div>
          <div className="glass p-4 rounded-2xl border-white/5 space-y-1">
            <span className="text-[10px] font-black text-amber-500/50 uppercase tracking-wider">قيمة الشراء</span>
            <p className="text-amber-500 font-black text-xl">
              {products.reduce((acc, p) => acc + Number(p.cost_price || 0), 0).toLocaleString()}
            </p>
          </div>
          <div className="glass p-4 rounded-2xl border-white/5 space-y-1">
            <span className="text-[10px] font-black text-emerald-500/50 uppercase tracking-wider">قيمة البيع المتوقعة</span>
            <p className="text-emerald-500 font-black text-xl">
              {products.reduce((acc, p) => acc + Number(p.selling_price || 0), 0).toLocaleString()}
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
          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{products.length} قطعة</span>
        </div>

        <div className="space-y-3">
          {products.length > 0 ? (
            products.map((item) => (
              <div 
                key={item.barcode} 
                onClick={() => onSelectProduct(item.barcode)}
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
  );
}
