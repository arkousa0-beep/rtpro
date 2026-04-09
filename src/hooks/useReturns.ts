import { useState, useEffect, useCallback } from 'react';
import { ReturnRecord, getReturns } from '@/lib/services/returnService';

export function useReturns(page: number = 1) {
  const [returns, setReturns] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      const limit = 20;
      const { returns: data, total } = await getReturns(page, limit);
      setReturns(data);
      setTotalPages(Math.ceil(total / limit));
    } catch (error) {
      console.error('Failed to fetch returns:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  return { returns, loading, totalPages, refresh: fetchReturns };
}
