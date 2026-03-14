"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { usePOSStore } from '@/store/usePOSStore';
import { useCustomers } from '@/hooks/useCustomers';
import { CartItem } from '@/components/pos/CartItem';
import { POSControlCockpit } from '@/components/pos/POSControlCockpit';

/**
 * POS Page - Mobile Optimized
 * Performance focused with modular components and store-driven state.
 * Refactored to comply with clean architecture rules.
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
    setPaymentMethod
  } = usePOSStore();
  
  const { customers } = useCustomers();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Auto-focus barcode input for instant scan readiness
    inputRef.current?.focus();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return; // Prevent double scans

    const barcode = inputRef.current?.value;
    if (barcode) {
      setIsProcessing(true);
      await addItem(barcode);
      if (inputRef.current) inputRef.current.value = '';
      setIsProcessing(false);
      // Keep focus for next scan
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleCheckout = async () => {
    try {
      await checkout();
    } catch (err: any) {
      // Error is already set in the store
    }
  };

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
          <Badge className="bg-white/5 text-white/40 h-8 rounded-xl px-4 font-bold border-none transition-all">
            {cart.length} أصناف
          </Badge>
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
            </motion.div>
          ) : (
            <div className="grid gap-3 px-1">
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

      {/* Floating Error Notification - Non-intrusive feedback */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-24 left-4 right-4 z-[100] max-w-lg mx-auto"
          >
            <div className="glass border border-red-500/20 bg-red-500/5 px-6 py-4 rounded-3xl flex items-center gap-3 shadow-2xl shadow-red-500/10 backdrop-blur-3xl">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <p className="text-white font-black text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
