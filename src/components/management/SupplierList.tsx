"use client";

import { motion } from "framer-motion";
import { Store, Phone, Trash2, ArrowUpRight, MessageCircle, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Supplier } from "@/lib/services/supplierService";

interface SupplierListProps {
  suppliers: Supplier[];
  onDelete: (id: string) => void;
}

export const SupplierList = ({ suppliers, onDelete }: SupplierListProps) => {
  if (suppliers.length === 0) {
    return (
      <div className="text-center py-24 space-y-4 text-white/30">
        <Store className="w-16 h-16 mx-auto opacity-20" />
        <p className="font-bold">لا يوجد موردين مسجلين</p>
      </div>
    );
  }

  const formatWhatsAppNumber = (phone?: string) => {
    if (!phone) return null;
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '2' + clean;
    }
    return `https://wa.me/${clean}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {suppliers.map((supplier, idx) => {
        const waLink = formatWhatsAppNumber(supplier.phone);

        return (
          <motion.div
            key={supplier.id}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="glass border-white/5 rounded-[2rem] overflow-hidden hover:bg-white/[0.04] transition-all group active:scale-[0.98] shadow-lg shadow-black/40">
              <CardContent className="p-5 flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner group-hover:scale-110 transition-transform">
                      <Store className="w-6 h-6 text-amber-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-white group-hover:text-amber-400 transition-colors">
                        {supplier.name}
                      </h4>
                      {supplier.phone && (
                        <div className="flex items-center gap-1.5 mt-0.5 text-white/40 font-mono text-sm">
                          <Phone className="w-3 h-3" />
                          <span>{supplier.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="w-10 h-10 rounded-xl text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                    onClick={() => {
                      if (confirm("هل أنت متأكد من حذف هذا المورد؟")) {
                        onDelete(supplier.id);
                      }
                    }}
                    title="حذف المورد"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {supplier.address && (
                  <p className="text-sm text-white/40 bg-white/5 p-3 rounded-2xl mb-4 border border-white/5 truncate" title={supplier.address}>
                    {supplier.address}
                  </p>
                )}

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {waLink && (
                      <a href={waLink} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all border border-emerald-500/20"
                          title="مراسلة عبر واتساب"
                        >
                          <MessageCircle className="w-5 h-5" />
                        </Button>
                      </a>
                    )}
                    <Button
                      variant="ghost"
                      className="h-10 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all border border-amber-500/20 font-bold px-4"
                      title="سداد / إضافة مديونية"
                    >
                      <Truck className="w-4 h-4 ml-2" />
                      المديونية
                    </Button>
                  </div>

                  <div className="text-left bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-2">
                    <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">التوريدات</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-black text-white text-lg">0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};
