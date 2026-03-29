"use client";

import { motion } from "framer-motion";
import { Phone, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Supplier } from "@/lib/services/supplierService";

interface SupplierInfoTabProps {
  supplier: Supplier;
}

export function SupplierInfoTab({ supplier }: SupplierInfoTabProps) {
  const waLink = supplier.phone 
    ? `https://wa.me/${supplier.phone.replace(/\D/g, '').startsWith('0') ? '2' + supplier.phone.replace(/\D/g, '') : supplier.phone.replace(/\D/g, '')}` 
    : null;

  return (
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
  );
}
