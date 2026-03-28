import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  debtService,
  DebtSummary,
  CustomerDebt,
  DeferredSale,
} from '@/lib/services/debtService';

export function useDebts() {
  const [summary, setSummary]           = useState<DebtSummary | null>(null);
  const [customerDebts, setCustomerDebts] = useState<CustomerDebt[]>([]);
  const [deferredSales, setDeferredSales] = useState<DeferredSale[]>([]);
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [hasMore, setHasMore]           = useState(false);
  const [totalCount, setTotalCount]     = useState(0);
  const [page, setPage]                 = useState(1);

  const fetchAll = useCallback(async (currentPage = 1) => {
    if (currentPage === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const [summaryData, customerData, deferredResult] = await Promise.all([
        currentPage === 1 ? debtService.getSummary()       : Promise.resolve(summary),
        currentPage === 1 ? debtService.getCustomerDebts() : Promise.resolve(customerDebts),
        debtService.getDeferredSales(undefined, currentPage),
      ]);

      if (currentPage === 1) {
        setSummary(summaryData as DebtSummary);
        setCustomerDebts(customerData as CustomerDebt[]);
        setDeferredSales(deferredResult.data);
      } else {
        setDeferredSales(prev => [...prev, ...deferredResult.data]);
      }

      setHasMore(deferredResult.hasMore);
      setTotalCount(deferredResult.total);
      setPage(currentPage);
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء جلب بيانات الديون');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAll(1);
  }, [fetchAll]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) fetchAll(page + 1);
  }, [fetchAll, hasMore, loadingMore, page]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchAll(1);
  }, [fetchAll]);

  return {
    summary,
    customerDebts,
    deferredSales,
    loading,
    loadingMore,
    hasMore,
    totalCount,
    refresh,
    loadMore,
  };
}
