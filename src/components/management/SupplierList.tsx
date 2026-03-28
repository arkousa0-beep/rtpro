import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Store, Phone, Trash2, ArrowUpRight, MessageCircle, Truck, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Supplier } from "@/lib/services/supplierService";
import { cn } from "@/lib/utils";
import { SupplierDetailsDrawer } from "./SupplierDetailsDrawer";

interface SupplierListProps {
  suppliers: Supplier[];
  onDelete: (id: string) => void;
  onEdit?: (supplier: Supplier) => void;
}

export const SupplierList = ({ suppliers, onDelete, onEdit }: SupplierListProps) => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-24 space-y-4 text-white/30">
        <Store className="w-16 h-16 mx-auto opacity-20" />
        <p className="font-bold">لا يوجد موردين مسجلين</p>
      </div>
    );
  }

  const formatWhatsAppNumber = (phone?: string | null) => {
    if (!phone) return null;
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '2' + clean;
    }
    return `https://wa.me/${clean}`;
  };

  const handleOpenDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDrawerOpen(true);
  };

  return (
    <>
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
              <Card 
                onClick={() => handleOpenDetails(supplier)}
                className="glass border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-white/[0.04] transition-all group cursor-pointer active:scale-[0.98] shadow-xl shadow-black/40 border-t-white/10"
              >
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-500">
                        <Store className="w-7 h-7 text-amber-500 group-hover:text-amber-400" />
                      </div>
                      <div>
                        <h4 className="font-black text-xl text-white group-hover:text-amber-400 transition-colors leading-tight">
                          {supplier.name}
                        </h4>
                        {supplier.phone && (
                          <div className="flex items-center gap-1.5 mt-1 text-white/40 font-mono text-sm group-hover:text-white/60 transition-colors">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{supplier.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>



                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {waLink && (
                        <a 
                          href={waLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-black transition-all border border-emerald-500/20"
                            title="مراسلة عبر واتساب"
                          >
                            <MessageCircle className="w-6 h-6" />
                          </Button>
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetails(supplier);
                        }}
                        className="h-12 rounded-2xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-all border border-amber-500/20 font-black px-5 gap-2 text-sm shadow-lg shadow-amber-500/5"
                      >
                        {Number(supplier.balance || 0) > 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <Truck className="w-4 h-4" />
                        )}
                        حساب المورد
                      </Button>
                    </div>

                    <div className={cn(
                      "text-left bg-white/5 px-4 py-2 rounded-2xl border border-white/5 flex flex-col items-center min-w-[80px] shadow-inner transition-all",
                      Number(supplier.balance || 0) > 0 && "bg-red-500/10 border-red-500/20"
                    )}>
                      <span className={cn(
                        "text-[9px] uppercase font-black tracking-widest leading-tight mb-1",
                        Number(supplier.balance || 0) > 0 ? "text-red-400" : "text-white/30"
                      )}>
                        {Number(supplier.balance || 0) > 0 ? "مديونية" : "رصيد"}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className={cn(
                          "font-black text-xl tracking-tighter leading-tight",
                          Number(supplier.balance || 0) > 0 ? "text-red-400" : "text-white"
                        )}>
                          {Number(supplier.balance || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <SupplierDetailsDrawer
        supplier={selectedSupplier}
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onEdit={(s) => onEdit?.(s)}
        onDelete={onDelete}
      />
    </>
  );
};
