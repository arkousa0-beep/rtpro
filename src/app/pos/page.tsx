"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, XCircle, PauseCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePOSStore } from '@/store/usePOSStore';
import { useCustomers } from '@/hooks/useCustomers';
import { CartItem } from '@/components/pos/CartItem';
import { POSControlCockpit } from '@/components/pos/POSControlCockpit';
import { ParkedCartsDialog } from '@/components/pos/ParkedCartsDialog';
import { toast } from 'sonner';

/**
 * POS Page - Mobile Optimized
 * Performance focused with modular components and store-driven state.
 */
export default function POSPage() {
  const { 
    cart, 
    total, 
    loading, 
    error, 
    selectedCustomerId,
    paymentMethod,
    addItem, 
    removeItem, 
    checkout,
    setCustomerId,
    setPaymentMethod,
    parkCart,
    parkedCarts,
    clearCart
  } = usePOSStore();
  
  const { customers } = useCustomers();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Prevent hydration mismatch for persisted store by deferring render slightly
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    inputRef.current?.focus();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return; // Prevent double scans

    const barcode = inputRef.current?.value;
    if (barcode) {
      setIsProcessing(true);
      const res = await addItem(barcode);
      if (inputRef.current) inputRef.current.value = '';
      setIsProcessing(false);
      // Keep focus for next scan
      setTimeout(() => inputRef.current?.focus(), 50);

      // Auto-dismiss errors after 3s
      if (!res.success) {
        toast.error(res.message);
      }
    }
  };

  const handleCheckout = async () => {
    try {
      const res = await checkout();
      if (res.success) {
        toast.success("تم إتمام عملية البيع بنجاح");
      }
    } catch (err: any) {
      // Error is already set in the store
    }
  };

  const handleParkCart = () => {
    parkCart();
    toast.success("تم تعليق الفاتورة لخدمة عميل آخر");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-5rem)] bg-black text-white p-4">
      
      <div className="flex-1 max-w-xl w-full mx-auto space-y-6 pt-20 pb-4">
        {/* Cart Header Section */}
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ShoppingCart className="w-5 h-5" />
             </div>
             <h2 className="text-2xl font-black text-white">سلة المشتريات</h2>
          </div>
          <div className="flex items-center gap-2">
            <ParkedCartsDialog />
            {cart.length > 0 && (
              <Button
                variant="outline"
                onClick={handleParkCart}
                className="h-10 px-4 rounded-xl bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-95 flex items-center gap-2 font-bold"
                title="تعليق السلة لخدمة عميل آخر"
              >
                <PauseCircle className="w-4 h-4 text-white/40" />
                تعليق السلة
              </Button>
            )}
            <Badge className="bg-white/5 text-white/40 h-8 rounded-xl px-4 font-bold border-none transition-all">
              {cart.length} أصناف
            </Badge>
          </div>
        </div>

        {/* Dynamic Cart List with Framer Motion Layout animations */}
        <AnimatePresence mode="popLayout">
          {cart.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-20 text-center space-y-4"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-white/10" />
              </div>
              <h3 className="text-xl font-black text-white/40">السلة فارغة حالياً</h3>
              <p className="text-sm text-white/10 font-bold">ابدأ بمسح باركود المنتجات لإضافتها</p>

              {parkedCarts.length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/5 mx-auto max-w-xs">
                  <p className="text-xs text-amber-500/60 mb-2 font-bold">لديك سلال معلقة يمكنك استعادتها</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="grid gap-3 px-1 pb-32">
              <div className="flex justify-between items-center px-2 py-1 mb-2 border-b border-white/5">
                <button
                  onClick={clearCart}
                  className="text-xs text-red-500/70 hover:text-red-500 font-bold"
                >
                  إفراغ السلة
                </button>
              </div>
              {cart.map((item) => (
                <CartItem 
                  key={item.barcode} 
                  item={item} 
                  onRemove={removeItem} 
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Unified Bottom Control UI */}
      <POSControlCockpit 
        total={total}
        loading={loading || isProcessing}
        paymentMethod={paymentMethod}
        selectedCustomerId={selectedCustomerId}
        onAddItem={handleAddItem}
        onCheckout={handleCheckout}
        onPaymentMethodChange={setPaymentMethod}
        onCustomerIdChange={setCustomerId}
        inputRef={inputRef}
        customers={customers}
      />
    </div>
  );
}
