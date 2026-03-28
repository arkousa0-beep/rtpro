import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  debtService,
  DebtSummary,
  CustomerDebt,
  DeferredSale,
} from '@/lib/services/debtService';

export function useDebts() {
  const [summary, setSummary] = useState<DebtSummary | null>(null);
  const [customerDebts, setCustomerDebts] = useState<CustomerDebt[]>([]);
  const [deferredSales, setDeferredSales] = useState<DeferredSale[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, customerData, deferredData] = await Promise.all([
        debtService.getSummary(),
        debtService.getCustomerDebts(),
        debtService.getDeferredSales(),
      ]);
      setSummary(summaryData);
      setCustomerDebts(customerData);
      setDeferredSales(deferredData);
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء جلب بيانات الديون');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    summary,
    customerDebts,
    deferredSales,
    loading,
    refresh: fetchAll,
  };
}
