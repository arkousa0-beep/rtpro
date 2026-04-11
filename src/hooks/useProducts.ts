import { useState, useEffect, useCallback, useMemo } from 'react';
import { productService } from '@/lib/services/productService';
import { createProductAction, updateProductAction, deleteProductAction } from '@/app/actions/productActions';
import { Product } from '@/lib/database.types';
import { toast } from 'sonner';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { useUIStore } from '@/lib/store/uiStore';
import { useDataStore } from '@/lib/store/dataStore';
import { getFromCache, saveToCache } from '@/lib/services/offlineService';

const CACHE_KEY = 'products';
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export function useProducts() {
  const { products, isHydrated, setProducts, addProduct: storeAdd, updateProduct: storeUpdate, removeProduct: storeRemove } = useDataStore();
  const [loading, setLoading] = useState(!isHydrated.products);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { lastRefresh } = useUIStore();

  const fetchProducts = useCallback(async (silent = false) => {
    // ⚡ Early Exit: serving from cache if valid
    if (!silent) {
      const cached = getFromCache<Product[]>(CACHE_KEY, CACHE_TTL);
      if (cached) {
        setProducts(cached);
        setLoading(false);
        silent = true; // Proceed with background sync but skip main loading state
      }
    }

    if (!silent) setLoading(true);
    
    try {
      const data = await productService.getAll();
      const finalData = (data as Product[]) || [];
      setProducts(finalData);
      saveToCache(CACHE_KEY, finalData);
    } catch (err: any) {
      console.error('Products fetch error:', err);
      
      // Attempt to recover using stale cache if current data is empty
      const stale = getFromCache<Product[]>(CACHE_KEY);
      if (stale && products.length === 0) {
        setProducts(stale);
      }
      
      if (!silent) toast.error(err.message || 'حدث خطأ أثناء جلب المنتجات');
    } finally {
      setLoading(false);
    }
  }, [setProducts, products.length]);

  useEffect(() => {
    // If not hydrated, check cache first then fetch.
    fetchProducts(!isHydrated.products);
  }, [fetchProducts, lastRefresh, isHydrated.products]);

  // Realtime: auto-refresh when products table changes
  useRealtimeSubscription({
    table: 'products',
    event: '*',
    onData: () => fetchProducts(),
  });

  const addProduct = async (newProduct: Partial<Product>) => {
    setSubmitting(true);
    try {
      const created = await createProductAction(newProduct);
      if (created) {
        storeAdd(created as Product);
        toast.success('تم إضافة المنتج بنجاح');
      }
      return created;
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الإضافة');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    setSubmitting(true);
    try {
      const updated = await updateProductAction(id, product);
      if (updated) {
        storeUpdate(id, updated as Product);
        toast.success('تم تحديث البيانات بنجاح');
      }
      return !!updated;
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء التحديث');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  /** Call this to initiate deletion — shows a ConfirmDialog in the UI */
  const requestDeleteProduct = (id: string) => setPendingDeleteId(id);

  /** Called when the user confirms the deletion dialog */
  const confirmDeleteProduct = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      await deleteProductAction(id);
      storeRemove(id);
      toast.success('تم حذف المنتج بنجاح');
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  return {
    products,
    loading,
    submitting,
    addProduct,
    updateProduct,
    /** Trigger the delete confirmation dialog */
    requestDeleteProduct,
    /** Execute confirmed deletion */
    confirmDeleteProduct,
    /** ID awaiting confirmation — pass to ConfirmDialog's open prop */
    pendingDeleteId,
    setPendingDeleteId,
    refresh: fetchProducts
  };
}
