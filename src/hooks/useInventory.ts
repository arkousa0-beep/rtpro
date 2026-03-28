import { useState, useEffect, useCallback } from 'react';
import { inventoryService } from '@/lib/services/inventoryService';
import { categoryService } from '@/lib/services/categoryService';
import { toast } from 'sonner';
import { Item, Category } from '@/lib/database.types';

export function useInventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventoryData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, catRes] = await Promise.all([
        inventoryService.getAllItems(),
        categoryService.getAll()
      ]);

      setItems((invRes as Item[]) || []);
      setCategories((catRes as Category[]) || []);
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء جلب بيانات المخزن');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  return {
    items,
    categories,
    loading,
    refresh: fetchInventoryData
  };
}
