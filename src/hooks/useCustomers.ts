import { useState, useEffect } from 'react';
import { customerService, Customer } from '@/lib/services/customerService';
import { toast } from 'sonner';
import { createCustomerAction, updateCustomerAction, deleteCustomerAction } from '@/app/actions/customerActions';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerService.getAll();
      setCustomers(data || []);
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء جلب العملاء');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const addCustomer = async (newCustomer: Partial<Customer>) => {
    setSubmitting(true);
    try {
      await createCustomerAction(newCustomer);
      toast.success('تم إضافة العميل بنجاح');
      await fetchCustomers();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الإضافة');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const requestDeleteCustomer = (id: string) => setPendingDeleteId(id);

  const confirmDeleteCustomer = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      await deleteCustomerAction(id);
      toast.success('تم حذف العميل بنجاح');
      await fetchCustomers();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    setSubmitting(true);
    try {
      await updateCustomerAction(id, updates);
      toast.success('تم تحديث بيانات العميل بنجاح');
      await fetchCustomers();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء التحديث');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return { 
    customers, 
    loading, 
    submitting, 
    addCustomer, 
    requestDeleteCustomer,
    confirmDeleteCustomer,
    pendingDeleteId,
    setPendingDeleteId,
    updateCustomer,
    refresh: fetchCustomers 
  };
}
