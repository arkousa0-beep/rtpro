import { useState, useEffect } from 'react';
import { inventoryService } from '@/lib/services/inventoryService';
import { categoryService, Category } from '@/lib/services/categoryService';
import { toast } from 'sonner';
import { Item } from '@/lib/database.types';

export function useInventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const [invRes, catRes] = await Promise.all([
        inventoryService.getAllItems(),
        categoryService.getAll()
      ]);

      setItems(invRes || []);
      setCategories(catRes || []);
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء جلب بيانات المخزن');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  return { 
    items, 
    categories, 
    loading, 
    refresh: fetchInventoryData 
  };
}
