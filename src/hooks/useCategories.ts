import { useState, useEffect, useCallback } from 'react';
import { categoryService, Category } from '@/lib/services/categoryService';
import { toast } from 'sonner';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '@/app/actions/categoryActions';
import { useRealtimeSubscription } from './useRealtimeSubscription';
import { useUIStore } from '@/lib/store/uiStore';
import { useDataStore } from '@/lib/store/dataStore';
import { getFromCache, saveToCache } from '@/lib/services/offlineService';

const CACHE_KEY = 'categories';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export function useCategories() {
  const { categories, isHydrated, setCategories, addCategory: storeAdd, updateCategory: storeUpdate, removeCategory: storeRemove } = useDataStore();
  const [loading, setLoading] = useState(!isHydrated.categories);
  const [submitting, setSubmitting] = useState(false);
  const { lastRefresh } = useUIStore();

  const fetchCategories = useCallback(async (silent = false) => {
    // ⚡ Optimization: Check cache first if not performing a forced silent refresh
    if (!silent) {
      const cached = getFromCache<Category[]>(CACHE_KEY, CACHE_TTL);
      if (cached) {
        setCategories(cached);
        setLoading(false);
        silent = true; // Still fetch in background but don't show loading
      }
    }

    if (!silent) setLoading(true);
    
    try {
      const data = await categoryService.getAll();
      const finalData = data || [];
      setCategories(finalData);
      saveToCache(CACHE_KEY, finalData);
    } catch (err: any) {
      console.error('Categories fetch error:', err);
      
      // Fallback: If network fails, try to use any stale cache even if older than TTL
      const stale = getFromCache<Category[]>(CACHE_KEY);
      if (stale && categories.length === 0) {
        setCategories(stale);
      }
      
      if (!silent) toast.error(err.message || 'حدث خطأ أثناء جلب التصنيفات');
    } finally {
      setLoading(false);
    }
  }, [setCategories, categories.length]);

  useEffect(() => {
    fetchCategories(!isHydrated.categories);
  }, [fetchCategories, lastRefresh, isHydrated.categories]);

  // Realtime: auto-refresh when categories table changes
  useRealtimeSubscription({
    table: 'categories',
    event: '*',
    onData: () => fetchCategories(),
  });

  const addCategory = async (newCategory: Partial<Category>) => {
    setSubmitting(true);
    try {
      const created = await createCategoryAction(newCategory);
      if (created) {
        storeAdd(created as Category);
        toast.success('تم إضافة التصنيف بنجاح');
      }
      return !!created;
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
      const updated = await updateCategoryAction(id, data);
      if (updated) {
        storeUpdate(id, updated as Category);
        toast.success('تم تحديث التصنيف بنجاح');
      }
      return !!updated;
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
      storeRemove(id);
      toast.success('تم حذف التصنيف بنجاح');
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
