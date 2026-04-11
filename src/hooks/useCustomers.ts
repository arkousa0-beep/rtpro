import { useState, useEffect, useCallback } from 'react';
import { customerService, Customer } from '@/lib/services/customerService';
import { toast } from 'sonner';
import { createCustomerAction, updateCustomerAction, deleteCustomerAction } from '@/app/actions/customerActions';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { useUIStore } from '@/lib/store/uiStore';
import { useDataStore } from '@/lib/store/dataStore';
import { getFromCache, saveToCache } from '@/lib/services/offlineService';

const CACHE_KEY = 'customers';
const CACHE_TTL = 15 * 60 * 1000;

export function useCustomers() {
  const { customers, isHydrated, setCustomers, addCustomer: storeAdd, updateCustomer: storeUpdate, removeCustomer: storeRemove } = useDataStore();
  const [loading, setLoading] = useState(!isHydrated.customers);
  const [submitting, setSubmitting] = useState(false);
  const { lastRefresh } = useUIStore();

  const fetchCustomers = useCallback(async (silent = false) => {
    if (!silent) {
      const cached = getFromCache<Customer[]>(CACHE_KEY, CACHE_TTL);
      if (cached) {
        setCustomers(cached);
        setLoading(false);
        silent = true;
      }
    }

    if (!silent) setLoading(true);
    try {
      const data = await customerService.getAll();
      const finalData = data || [];
      setCustomers(finalData);
      saveToCache(CACHE_KEY, finalData);
    } catch (err: any) {
      console.error('Customers fetch error:', err);
      const stale = getFromCache<Customer[]>(CACHE_KEY);
      if (stale && customers.length === 0) setCustomers(stale);
      if (!silent) toast.error(err.message || 'حدث خطأ أثناء جلب العملاء');
    } finally {
      setLoading(false);
    }
  }, [setCustomers, customers.length]);

  useEffect(() => {
    fetchCustomers(!isHydrated.customers);
  }, [fetchCustomers, lastRefresh, isHydrated.customers]);

  // Realtime: auto-refresh when customers table changes
  useRealtimeSubscription({
    table: 'customers',
    event: '*',
    onData: () => fetchCustomers(),
  });

  const addCustomer = async (newCustomer: Partial<Customer>) => {
    setSubmitting(true);
    try {
      const created = await createCustomerAction(newCustomer);
      if (created) {
        storeAdd(created as Customer);
        toast.success('تم إضافة العميل بنجاح');
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

  const requestDeleteCustomer = (id: string) => setPendingDeleteId(id);

  const confirmDeleteCustomer = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      await deleteCustomerAction(id);
      storeRemove(id);
      toast.success('تم حذف العميل بنجاح');
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    setSubmitting(true);
    try {
      const updated = await updateCustomerAction(id, updates);
      if (updated) {
        storeUpdate(id, updated as Customer);
        toast.success('تم تحديث بيانات العميل بنجاح');
      }
      return !!updated;
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
    refresh: fetchCustomers,
    submitting, 
    addCustomer, 
    requestDeleteCustomer,
    confirmDeleteCustomer,
    pendingDeleteId,
    setPendingDeleteId,
    updateCustomer
  };
}
