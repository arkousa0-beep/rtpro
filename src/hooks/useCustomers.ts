import { useState, useEffect } from 'react';
import { customerService, Customer } from '@/lib/services/customerService';
import { toast } from 'sonner';

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
      await customerService.create(newCustomer);
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

  const deleteCustomer = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا العميل؟')) return;
    try {
      await customerService.delete(id);
      toast.success('تم حذف العميل بنجاح');
      await fetchCustomers();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    setSubmitting(true);
    try {
      await customerService.update(id, updates);
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
    deleteCustomer, 
    updateCustomer,
    refresh: fetchCustomers 
  };
}
