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
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { playSuccessSound } from '@/lib/audioUtils';
import { useRouteGuard } from "@/hooks/useRouteGuard";

/**
 * POS Page - Mobile Optimized
 * Performance focused with modular components and store-driven state.
 */
export default function POSPage() {
  const { isAuthorized, isLoading: guardLoading } = useRouteGuard("pos");

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
    clearCart,
    paidAmount,
    setPaidAmount
  } = usePOSStore();
  
  const { customers } = useCustomers();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [isCreditConfirmOpen, setIsCreditConfirmOpen] = useState(false);

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
    // Confirm before processing credit/debt sales
    if (paymentMethod === 'Credit' && !isCreditConfirmOpen) {
      setIsCreditConfirmOpen(true);
      return;
    }

    try {
      const res = await checkout();
      if (res.success) {
        toast.success("تم إتمام عملية البيع بنجاح");
      } else {
        toast.error(res.message || "فشلت عملية البيع");
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ غير متوقع أثناء إتمام البيع");
    }
  };

  const handleParkCart = () => {
    parkCart();
    toast.success("تم تعليق الفاتورة لخدمة عميل آخر");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCameraScan = async (barcode: string) => {
    const res = await addItem(barcode);
    if (!res.success) {
      toast.error(res.message);
    }
  };

  if (!mounted || guardLoading || !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-black text-white p-2 md:p-6 gap-6">
      
      {/* LEFT COLUMN: Cart Header & Items List (Carts / Items) */}
      <div className="flex-1 flex flex-col space-y-6 pt-20 md:pt-0 pb-4 min-w-0">
        <div className="flex items-center justify-between px-2 md:px-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <ShoppingCart className="w-5 h-5" />
             </div>
             <h2 className="text-xl md:text-2xl font-black text-white">سلة المشتريات</h2>
          </div>
          <div className="flex items-center gap-2">
            <ParkedCartsDialog />
            {cart.length > 0 && (
              <Button
                variant="outline"
                onClick={handleParkCart}
                className="h-10 px-3 md:px-4 rounded-xl bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-all active:scale-95 flex items-center gap-2 font-bold text-xs md:text-sm"
                title="تعليق السلة لخدمة عميل آخر"
              >
                <PauseCircle className="w-4 h-4 text-white/40" />
                <span className="hidden sm:inline">تعليق السلة</span>
              </Button>
            )}
            <Badge className="bg-primary/10 text-primary h-8 rounded-xl px-4 font-bold border border-primary/20 shrink-0">
              {cart.length} أصناف
            </Badge>
          </div>
        </div>

        {/* Dynamic Cart List */}
        <AnimatePresence mode="popLayout">
          {cart.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-4 glass rounded-[3rem] border border-white/5"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-10 h-10 text-white/10" />
              </div>
              <h3 className="text-xl font-black text-white/40">السلة فارغة حالياً</h3>
              <p className="text-sm text-white/10 font-bold px-6">ابدأ بمسح باركود المنتجات لإضافتها</p>

              {parkedCarts.length > 0 && (
                <div className="mt-8 pt-8 border-t border-white/5 mx-auto w-full max-w-xs px-6">
                  <p className="text-xs text-amber-500/60 mb-2 font-bold">لديك سلال معلقة يمكنك استعادتها من الأعلى</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-250px)] md:max-h-none pr-1">
              <div className="flex justify-between items-center px-2 py-1 mb-2 border-b border-white/5">
                <button
                  onClick={() => setIsClearDialogOpen(true)}
                  className="text-xs text-red-500/70 hover:text-red-500 font-bold transition-colors"
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

      {/* RIGHT COLUMN: Control Panel & Checkout (Integrated on Desktop) */}
      <div className="w-full md:w-[380px] lg:w-[450px] shrink-0">
        <POSControlCockpit 
          total={total}
          loading={loading || isProcessing}
          paymentMethod={paymentMethod}
          selectedCustomerId={selectedCustomerId}
          paidAmount={paidAmount}
          onPaidAmountChange={setPaidAmount}
          onAddItem={handleAddItem}
          onCheckout={handleCheckout}
          onPaymentMethodChange={setPaymentMethod}
          onCustomerIdChange={setCustomerId}
          inputRef={inputRef}
          customers={customers}
          onScanBarcode={handleCameraScan}
        />
      </div>

      <ConfirmDialog
        open={isClearDialogOpen}
        onOpenChange={setIsClearDialogOpen}
        title="إفراغ السلة"
        description="هل أنت متأكد من رغبتك في إزالة جميع الأصناف من السلة الحالية؟"
        confirmLabel="إفراغ السلة"
        cancelLabel="تراجع"
        destructive
        onConfirm={() => {
          clearCart();
          toast.success("تم إفراغ السلة");
        }}
      />


      <ConfirmDialog
        open={isCreditConfirmOpen}
        onOpenChange={setIsCreditConfirmOpen}
        title="تأكيد بيع آجل"
        description={`سيتم تسجيل مبلغ ${(total - paidAmount).toLocaleString()} ج.م كدين على حساب العميل. هل أنت متأكد؟`}
        confirmLabel="تأكيد البيع الآجل"
        cancelLabel="تراجع"
        destructive={false}
        onConfirm={() => {
          setIsCreditConfirmOpen(false);
          handleCheckout();
        }}
      />
    </div>
  );
}
