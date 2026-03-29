import { useState, useEffect, useCallback, useMemo } from 'react';
import { productService } from '@/lib/services/productService';
import { createProductAction, updateProductAction, deleteProductAction } from '@/app/actions/productActions';
import { Product } from '@/lib/database.types';
import { toast } from 'sonner';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { useUIStore } from '@/lib/store/uiStore';
import { useDataStore } from '@/lib/store/dataStore';

export function useProducts() {
  const { products, isHydrated, setProducts, addProduct: storeAdd, updateProduct: storeUpdate, removeProduct: storeRemove } = useDataStore();
  const [loading, setLoading] = useState(!isHydrated.products);
  const [submitting, setSubmitting] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const { lastRefresh } = useUIStore();

  const fetchProducts = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts((data as Product[]) || []);
    } catch (err: any) {
      console.error('Products fetch error:', err);
      // Don't toast on silent background refresh to avoid annoying the user
      if (!silent) toast.error(err.message || 'حدث خطأ أثناء جلب المنتجات');
    } finally {
      setLoading(false);
    }
  }, [setProducts]);

  useEffect(() => {
    // If not hydrated, do a full load. If hydrated, do a silent refresh.
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
