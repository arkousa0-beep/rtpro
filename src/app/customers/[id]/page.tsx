"use client";

import { useState, useEffect, use } from "react";
import { supabase } from "@/lib/supabase/client";
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
import { ArrowRight, User, Phone, MapPin, Loader2, ArrowUpRight, ArrowDownRight, Wallet, Pencil, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TransactionDetailsDrawer } from "@/components/management/TransactionDetailsDrawer";
import { PaymentModal } from "@/components/debts/PaymentModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { customerService } from "@/lib/services/customerService";
import { debtService } from "@/lib/services/debtService";
import { useRouteGuard } from "@/hooks/useRouteGuard";

export default function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { isAuthorized, isLoading: isAuthLoading } = useRouteGuard('customers');
  const { id } = use(params);
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isTransactionOpen, setIsTransactionOpen] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Payment Form State
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  
  // Edit Profile State
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", address: "" });
  const [submittingEdit, setSubmittingEdit] = useState(false);

  useEffect(() => {
    if (customer) {
      setEditForm({
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
      });
    }
  }, [customer]);

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
      await debtService.processPayment(id, amount, paymentMethod as 'Cash' | 'Card' | 'Transfer');

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

  const handleDelete = async () => {
    setOpenDeleteDialog(false);
    setDeleting(true);
    try {
      await customerService.delete(id);
      toast.success("تم حذف العميل بنجاح");
      router.push("/customers");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء الحذف");
      setDeleting(false);
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEdit(true);
    try {
      await customerService.update(id, editForm);

      toast.success("تم تحديث البيانات بنجاح");
      setOpenEditDialog(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء التحديث");
    } finally {
      setSubmittingEdit(false);
    }
  };

  if (isAuthLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) return null;

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

              <div className="flex flex-col items-end gap-3">
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setOpenDeleteDialog(true)}
                    disabled={deleting}
                    className="h-10 w-10 glass rounded-xl text-red-500/40 hover:text-white hover:bg-red-500 transition-all"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>

                  <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 glass rounded-xl text-white/40 hover:text-white">
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="glass border-white/10 rounded-[2.5rem] p-8 max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black text-white text-center">تعديل بيانات العميل</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditProfile} className="space-y-4 mt-4 text-right">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-white/40 uppercase tracking-widest mr-1">الاسم</label>
                        <Input 
                          required
                          className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white glass text-right"
                          value={editForm.name}
                          onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-white/40 uppercase tracking-widest mr-1">الهاتف</label>
                        <Input 
                          className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white glass text-right"
                          value={editForm.phone}
                          onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-white/40 uppercase tracking-widest mr-1">العنوان</label>
                        <Input 
                          className="h-14 rounded-2xl bg-white/[0.05] border-white/5 text-white glass text-right"
                          value={editForm.address}
                          onChange={e => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                        />
                      </div>

                      <Button type="submit" className="w-full h-14 rounded-2xl font-black bg-blue-600 text-white mt-4" disabled={submittingEdit}>
                        {submittingEdit ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "حفظ التعديلات"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
                </div>

                <div className="text-left bg-white/5 p-4 rounded-3xl border border-white/10 min-w-[140px]">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">المديونية الحالية</p>
                  <p className={`text-2xl font-black ${Number(customer.balance) > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {Number(customer.balance || 0).toLocaleString()} <span className="text-xs">ج.م</span>
                  </p>
                </div>
              </div>
            </div>

            <Button 
                onClick={() => setOpenPaymentDialog(true)}
                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
            >
                <Wallet className="w-5 h-5 ml-2" />
                تحصيل دفعة
            </Button>

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
              <Card 
                key={t.id} 
                className="glass border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all cursor-pointer active:scale-[0.98]"
                onClick={() => {
                  setSelectedTransactionId(t.id);
                  setIsTransactionOpen(true);
                }}
              >
                <CardContent className="p-4 flex gap-4 items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center border",
                      (t as any).type === 'Sale' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                      (t as any).type === 'CustomerPayment' || (t as any).type === 'Income' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                      'bg-amber-500/10 border-amber-500/20 text-amber-500'
                    )}>
                      {t.type === 'Sale' ? <ArrowDownRight className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-md">
                        {t.type === 'Sale' ? 'فاتورة مبيعات' : ((t as any).type === 'CustomerPayment' || (t as any).type === 'Payment' || (t as any).type === 'Income') ? 'تحصيل نقدي' : 'مرتجع مبيعات'}
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
                    <p className="text-[10px] text-white/40 font-bold uppercase">{(t as any).method === 'Cash' ? 'كاش' : (t as any).method === 'Card' ? 'فيزا' : (t as any).method === 'Debt' ? 'آجل' : (t as any).method || ''}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </motion.div>

      <PaymentModal
        isOpen={openPaymentDialog}
        onClose={() => setOpenPaymentDialog(false)}
        entityId={id}
        entityName={customer.name}
        currentBalance={customer.balance}
        onSuccess={fetchData}
      />

      <ConfirmDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="تأكيد الحذف"
        description="هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء وسيتم حذف أو فقدان ارتباطات الفواتير والمدفوعات المتعلقة به."
        confirmLabel="نعم، احذف العميل"
        cancelLabel="إلغاء"
        onConfirm={handleDelete}
        destructive
      />

      <TransactionDetailsDrawer 
        transactionId={selectedTransactionId}
        open={isTransactionOpen}
        onOpenChange={setIsTransactionOpen}
      />
    </div>
  );
}
