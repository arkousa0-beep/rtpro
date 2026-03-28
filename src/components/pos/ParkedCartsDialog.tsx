"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, ArchiveRestore, Trash2, ShoppingCart } from "lucide-react";
import { usePOSStore } from "@/store/usePOSStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function ParkedCartsDialog() {
  const [open, setOpen] = useState(false);
  const { parkedCarts, restoreCart, removeParkedCart } = usePOSStore();

  const handleRestore = (id: string) => {
    restoreCart(id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="relative h-10 px-4 rounded-xl bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400 transition-all active:scale-95 flex items-center gap-2 font-bold"
          title="فواتير معلقة"
        >
          <Clock className="w-4 h-4" />
          معلق
          {parkedCarts.length > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-amber-500 text-black px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center rounded-full text-[10px] font-black border-2 border-black">
              {parkedCarts.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-white/10 rounded-[2.5rem] p-6 sm:max-w-lg mx-auto top-[30%] translate-y-[-30%] shadow-2xl shadow-amber-500/10">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-black text-white text-right flex items-center justify-end gap-3">
            سلال معلقة
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[300px] pr-2">
          {parkedCarts.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence>
                {parkedCarts.map((parked) => (
                  <motion.div
                    key={parked.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-amber-500/30 transition-all group"
                  >
                    <div className="flex-1 text-right">
                      <div className="flex items-center gap-3 justify-end mb-1">
                        <span className="text-[10px] text-white/40 font-mono bg-white/5 px-2 py-0.5 rounded-md">
                          {new Date(parked.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <h4 className="font-bold text-white text-sm flex items-center gap-2">
                          فاتورة قيد الانتظار
                          <ShoppingCart className="w-3 h-3 text-amber-500" />
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 justify-end text-xs font-medium text-white/50">
                        <span className="flex items-center gap-1">
                          {parked.cart.length} أصناف
                        </span>
                        <span className="text-amber-500 font-black">{parked.total} ج.م</span>
                        {parked.customerId !== 'walkin' && (
                          <span className="text-blue-400 bg-blue-500/10 px-2 rounded">عميل مسجل</span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex items-center gap-2 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeParkedCart(parked.id)}
                        className="h-10 w-10 rounded-xl hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        onClick={() => handleRestore(parked.id)}
                        className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black transition-all shadow-lg"
                      >
                        <ArchiveRestore className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white/30 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 opacity-20" />
              </div>
              <p className="font-bold text-lg">لا توجد سلال معلقة حالياً</p>
              <p className="text-xs text-white/20 text-center px-8">استخدم زر تعليق الفاتورة لحفظ الأصناف مؤقتاً لخدمة عميل آخر دون فقدان البيانات.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
