import { useState, useEffect } from 'react';
import { supplierService, Supplier } from '@/lib/services/supplierService';
import { toast } from 'sonner';

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const data = await supplierService.getAll();
      setSuppliers(data || []);
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء جلب الموردين');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const addSupplier = async (newSupplier: Partial<Supplier>) => {
    setSubmitting(true);
    try {
      await supplierService.create(newSupplier);
      toast.success('تم إضافة المورد بنجاح');
      await fetchSuppliers();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الإضافة');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSupplier = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المورد؟')) return;
    try {
      await supplierService.delete(id);
      toast.success('تم حذف المورد بنجاح');
      await fetchSuppliers();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  return { 
    suppliers, 
    loading, 
    submitting, 
    addSupplier, 
    deleteSupplier, 
    refresh: fetchSuppliers 
  };
}
