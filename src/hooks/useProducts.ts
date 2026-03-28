import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/lib/services/productService';
import { createProductAction, updateProductAction, deleteProductAction } from '@/app/actions/productActions';
import { Product } from '@/lib/database.types';
import { toast } from 'sonner';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  /** ID of the product pending deletion — drives the ConfirmDialog in the UI */
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts((data as Product[]) || []);
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء جلب المنتجات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
        setProducts(prev => [created as Product, ...prev]);
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
        setProducts(prev => prev.map(p => p.id === id ? updated as Product : p));
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
      setProducts(prev => prev.filter(p => p.id !== id));
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
