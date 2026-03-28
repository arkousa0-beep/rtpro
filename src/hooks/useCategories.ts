import { useState, useEffect } from 'react';
import { categoryService, Category } from '@/lib/services/categoryService';
import { toast } from 'sonner';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '@/app/actions/categoryActions';
import { useRealtimeSubscription } from './useRealtimeSubscription';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data || []);
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء جلب التصنيفات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Realtime: auto-refresh when categories table changes
  useRealtimeSubscription({
    table: 'categories',
    event: '*',
    onData: () => fetchCategories(),
  });

  const addCategory = async (newCategory: Partial<Category>) => {
    setSubmitting(true);
    try {
      await createCategoryAction(newCategory);
      toast.success('تم إضافة التصنيف بنجاح');
      await fetchCategories();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الإضافة');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    setSubmitting(true);
    try {
      await updateCategoryAction(id, data);
      toast.success('تم تحديث التصنيف بنجاح');
      await fetchCategories();
      return true;
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء التحديث');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const requestDeleteCategory = (id: string) => setPendingDeleteId(id);

  const confirmDeleteCategory = async () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;
    setPendingDeleteId(null);
    try {
      await deleteCategoryAction(id);
      toast.success('تم حذف التصنيف بنجاح');
      await fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  const getCategoryProducts = async (id: string) => {
    try {
      return await categoryService.getProducts(id);
    } catch (err: any) {
      toast.error('حدث خطأ أثناء جلب المنتجات');
      return [];
    }
  };

  return { 
    categories, 
    loading, 
    submitting, 
    addCategory, 
    updateCategory,
    requestDeleteCategory,
    confirmDeleteCategory,
    pendingDeleteId,
    setPendingDeleteId,
    getCategoryProducts,
    refresh: fetchCategories 
  };
}
