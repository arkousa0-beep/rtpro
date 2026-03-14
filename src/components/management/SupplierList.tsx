"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Store, PhoneCall, MapPin, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";

import { Supplier } from "@/lib/services/supplierService";

interface SupplierListProps {
  suppliers: Supplier[];
  onDelete: (id: string) => void;
}

export function SupplierList({ suppliers, onDelete }: SupplierListProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {suppliers.map((supplier, idx) => (
        <motion.div
          key={supplier.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Link href={`/suppliers/${supplier.id}`}>
            <Card className="glass border-white/5 rounded-[2rem] group hover:bg-white/[0.04] transition-all overflow-hidden cursor-pointer relative">
              <div className="absolute left-0 top-0 w-24 h-24 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all" />
              <CardContent className="p-5 flex items-center gap-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 group-hover:rotate-6 transition-transform">
                  <Store className="w-7 h-7" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-black text-lg text-white mb-1 flex items-center gap-2">
                    {supplier.name}
                    <ExternalLink className="w-3 h-3 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <div className="flex items-center gap-4">
                    {supplier.phone && (
                      <div className="flex items-center gap-1.5 text-white/40">
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold font-mono">{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-center gap-1.5 text-white/40">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold truncate max-w-[150px]">{supplier.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 hidden sm:block">
                    <p className={`font-black text-sm ${Number(supplier.balance) > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {Number(supplier.balance || 0).toLocaleString()} <span className="text-[10px]">ج.م</span>
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full text-white/20 hover:text-destructive hover:bg-destructive/10 z-20"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(supplier.id!); }}              >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
