"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase";
import { Customer, Transaction } from "@/lib/database.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ArrowRight, User, Phone, MapPin, Loader2, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  async function fetchData() {
    setLoading(true);
    
    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    const { data: transData } = await supabase
      .from('transactions')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false });

    if (customerData) setCustomer(customerData);
    if (transData) setTransactions(transData as any[]);
    
    setLoading(false);
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(paymentAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    setSubmittingPayment(true);
    
    try {
      const { data, error } = await supabase.rpc('pay_customer_debt', {
        p_customer_id: id,
        p_amount: amount,
        p_payment_method: paymentMethod
      });

      if (error) throw error;
      if (data && !data.success) throw new Error(data.message);

      toast.success("تم تسجيل الدفعة بنجاح");
      setPaymentAmount("");
      setOpenPaymentDialog(false);
      fetchData(); // Refresh data
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء تسجيل الدفعة");
    } finally {
      setSubmittingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-white/50">
        <User className="w-16 h-16 opacity-20" />
        <h2 className="text-2xl font-black">العميل غير موجود</h2>
        <Button variant="outline" asChild className="glass mt-4">
          <Link href="/customers">العودة للعملاء</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="rounded-2xl glass" asChild>
          <Link href="/customers">
            <ArrowRight className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-black text-white">ملف العميل</h2>
          <p className="text-sm text-white/50">سجل المعاملات والمديونيات</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass border-white/5 rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
          <CardContent className="p-8 space-y-6 relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-black text-white mb-2">{customer.name}</h3>
                <div className="flex flex-col gap-2 text-white/50 text-sm">
                  {customer.phone && (
                    <span className="flex items-center gap-2"><Phone className="w-4 h-4" /> {customer.phone}</span>
                  )}
                  {customer.address && (
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {customer.address}</span>
                  )}
                </div>
              </div>

              <div className="text-left bg-white/5 p-4 rounded-3xl border border-white/10 min-w-[140px]">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">المديونية الحالية</p>
                <p className={`text-2xl font-black ${Number(customer.balance) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {Number(customer.balance || 0).toLocaleString()} <span className="text-xs">ج.م</span>
                </p>
              </div>
            </div>

            <Dialog open={openPaymentDialog} onOpenChange={setOpenPaymentDialog}>
              <DialogTrigger render={
                <Button className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                  <Wallet className="w-5 h-5 ml-2" />
                  تسديد دفعة
                </Button>
              } />
              <DialogContent className="glass border-white/10 rounded-[2.5rem] p-8 max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-white text-center">تسديد من مديونية العميل</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePayment} className="space-y-6 mt-4 text-right">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-blue-400 uppercase tracking-widest mr-1">المبلغ المراد سداده</label>
                    <div className="relative">
                      <Input 
                        required 
                        type="number"
                        step="0.01"
                        className="h-16 rounded-2xl bg-white/[0.05] border-white/5 text-white text-xl font-mono text-right pr-14 glass"
                        value={paymentAmount}
                        onChange={e => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">ج.م</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-black text-blue-400 uppercase tracking-widest mr-1">طريقة الدفع</label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white glass text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10 rounded-2xl">
                        <SelectItem value="Cash" className="text-right">كاش (نقد)</SelectItem>
                        <SelectItem value="Card" className="text-right">فيزا (بطاقة)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-blue-500/20 bg-blue-600 text-white border border-white/10 active:scale-[0.98] transition-all" disabled={submittingPayment}>
                    {submittingPayment ? <Loader2 className="w-7 h-7 animate-spin mx-auto" /> : "تأكيد الدفعة"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-xl font-black text-white mb-4 px-2">المعاملات السابقة</h3>
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center py-10 glass rounded-[2rem] text-white/30 border border-white/5">
              لا توجد معاملات سابقة لهذا العميل
            </div>
          ) : (
            transactions.map((t) => (
              <Card key={t.id} className="glass border-white/5 rounded-2xl hover:bg-white/[0.02] transition-colors">
                <CardContent className="p-4 flex gap-4 items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center border",
                      t.type === 'Sale' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      t.type === 'Income' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                      'bg-amber-500/10 border-amber-500/20 text-amber-500'
                    )}>
                      {t.type === 'Sale' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-md">
                        {t.type === 'Sale' ? 'عملية شراء' : t.type === 'Income' ? 'تسديد دفعة' : 'مرتجع'}
                      </h4>
                      <span className="text-xs text-white/30">{new Date(t.created_at).toLocaleString('ar-EG')}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={cn(
                      "text-xl font-black",
                      t.type === 'Sale' ? 'text-red-400' : 'text-emerald-400' // Sale increases debt (red), income reduces debt (green)
                    )}>
                      {t.type === 'Sale' ? '+' : '-'}{Number(t.total).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-white/40 font-bold uppercase">{t.payment_method === 'Cash' ? 'كاش' : t.payment_method === 'Card' ? 'فيزا' : 'آجل'}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}