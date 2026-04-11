import { useState, useEffect, useCallback } from 'react';
import { supplierService, Supplier } from '@/lib/services/supplierService';
import { toast } from 'sonner';
import { createSupplierAction, updateSupplierAction, deleteSupplierAction } from '@/app/actions/supplierActions';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { useUIStore } from '@/lib/store/uiStore';
import { useDataStore } from '@/lib/store/dataStore';
import { getFromCache, saveToCache } from '@/lib/services/offlineService';

const CACHE_KEY = 'suppliers';
const CACHE_TTL = 15 * 60 * 1000;

export function useSuppliers() {
  const { suppliers, isHydrated, setSuppliers, addSupplier: storeAdd, updateSupplier: storeUpdate, removeSupplier: storeRemove } = useDataStore();
  const [loading, setLoading] = useState(!isHydrated.suppliers);
  const [submitting, setSubmitting] = useState(false);
  const { lastRefresh } = useUIStore();

  const fetchSuppliers = useCallback(async (silent = false) => {
    if (!silent) {
      const cached = getFromCache<Supplier[]>(CACHE_KEY, CACHE_TTL);
      if (cached) {
        setSuppliers(cached);
        setLoading(false);
        silent = true;
      }
    }

    if (!silent) setLoading(true);
    try {
      const data = await supplierService.getAll();
      const finalData = data || [];
      setSuppliers(finalData);
      saveToCache(CACHE_KEY, finalData);
    } catch (err: any) {
      console.error('Suppliers fetch error:', err);
      const stale = getFromCache<Supplier[]>(CACHE_KEY);
      if (stale && suppliers.length === 0) setSuppliers(stale);
      if (!silent) toast.error(err.message || 'حدث خطأ أثناء جلب الموردين');
    } finally {
      setLoading(false);
    }
  }, [setSuppliers, suppliers.length]);

  useEffect(() => {
    fetchSuppliers(!isHydrated.suppliers);
  }, [fetchSuppliers, lastRefresh, isHydrated.suppliers]);

  // Realtime: auto-refresh when suppliers table changes
  useRealtimeSubscription({
    table: 'suppliers',
    event: '*',
    onData: () => fetchSuppliers(),
  });

  const addSupplier = async (newSupplier: Partial<Supplier>) => {
    setSubmitting(true);
    try {
      const created = await createSupplierAction(newSupplier);
      if (created) {
        storeAdd(created as Supplier);
        toast.success('تم إضافة المورد بنجاح');
      }
      return !!created;
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
      storeRemove(id);
      toast.success('تم حذف المورد بنجاح');
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  return { 
    suppliers, 
    loading, 
    refresh: fetchSuppliers,
    submitting, 
    addSupplier,
    updateSupplier: async (id: string, updates: Partial<Supplier>) => {
      setSubmitting(true);
      try {
        const updated = await updateSupplierAction(id, updates);
        if (updated) {
          storeUpdate(id, updated as Supplier);
          toast.success("تم تحديث بيانات المورد");
        }
        return !!updated;
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
    setPendingDeleteId
  };
}
