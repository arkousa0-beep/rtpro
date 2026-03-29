import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '@/lib/services/inventoryService';
import { categoryService } from '@/lib/services/categoryService';
import { toast } from 'sonner';
import { useUIStore } from '@/lib/store/uiStore';
import { Item, Category } from '@/lib/database.types';
import { useDataStore } from '@/lib/store/dataStore';

export function useInventory() {
  const { items, categories, isHydrated, setItems, setCategories } = useDataStore();
  const [loading, setLoading] = useState(!isHydrated.items || !isHydrated.categories);
  const { lastRefresh } = useUIStore();

  const fetchInventoryData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [invRes, catRes] = await Promise.all([
        inventoryService.getAllItems(),
        categoryService.getAll()
      ]);

      setItems((invRes as Item[]) || []);
      setCategories((catRes as Category[]) || []);
    } catch (err: any) {
      console.error('Inventory fetch error:', err);
      if (!silent) toast.error(err.message || 'حدث خطأ أثناء جلب بيانات المخزن');
    } finally {
      setLoading(false);
    }
  }, [setItems, setCategories]);

  useEffect(() => {
    const silent = isHydrated.items && isHydrated.categories;
    fetchInventoryData(silent);
  }, [fetchInventoryData, lastRefresh, isHydrated.items, isHydrated.categories]);

  return {
    items,
    categories,
    loading,
    refresh: fetchInventoryData
  };
}
