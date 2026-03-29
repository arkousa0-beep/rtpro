"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Transaction } from '@/lib/database.types';
import { useDataStore } from '@/lib/store/dataStore';
import { useUIStore } from '@/lib/store/uiStore';
import { toast } from 'sonner';

export function useTransactions(page = 1, pageSize = 50) {
  const { transactions, setTransactions, isHydrated } = useDataStore();
  const [loading, setLoading] = useState(!isHydrated.transactions);
  const [totalPages, setTotalPages] = useState(1);
  const { lastRefresh } = useUIStore();

  const fetchTransactions = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await supabase
        .from('transactions')
        .select('*, customers(name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setTransactions((data as any) || []);
      if (count !== null) setTotalPages(Math.ceil(count / pageSize) || 1);
    } catch (err: any) {
      console.error('Transactions fetch error:', err);
      if (!silent) toast.error(err.message || 'حدث خطأ أثناء جلب المعاملات');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, setTransactions]);

  useEffect(() => {
    const silent = isHydrated.transactions && page === 1; // Only silent for first page if already cached
    fetchTransactions(silent);
  }, [fetchTransactions, lastRefresh, page]);

  return {
    transactions,
    loading,
    totalPages,
    refresh: () => fetchTransactions()
  };
}
