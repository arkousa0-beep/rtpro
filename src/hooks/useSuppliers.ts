import { useState, useEffect } from 'react';
import { supplierService, Supplier } from '@/lib/services/supplierService';
import { toast } from 'sonner';
import { createSupplierAction, updateSupplierAction, deleteSupplierAction } from '@/app/actions/supplierActions';
import { useRealtimeSubscription } from './useRealtimeSubscription';

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

  // Realtime: auto-refresh when suppliers table changes
  useRealtimeSubscription({
    table: 'suppliers',
    event: '*',
    onData: () => fetchSuppliers(),
  });

  const addSupplier = async (newSupplier: Partial<Supplier>) => {
    setSubmitting(true);
    try {
      await createSupplierAction(newSupplier);
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

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const requestDeleteSupplier = (id: string) => setPendingDeleteId(id);

  const confirmDeleteSupplier = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      await deleteSupplierAction(id);
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
    updateSupplier: async (id: string, updates: Partial<Supplier>) => {
      setSubmitting(true);
      try {
        await updateSupplierAction(id, updates);
        toast.success("تم تحديث بيانات المورد");
        await fetchSuppliers();
        return true;
      } catch (err: any) {
        toast.error(err.message || "حدث خطأ أثناء التحديث");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    requestDeleteSupplier,
    confirmDeleteSupplier,
    pendingDeleteId,
    setPendingDeleteId,
    refresh: fetchSuppliers 
  };
}
