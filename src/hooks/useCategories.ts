import { useState, useEffect } from 'react';
import { categoryService, Category } from '@/lib/services/categoryService';
import { toast } from 'sonner';

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

  const addCategory = async (newCategory: Partial<Category>) => {
    setSubmitting(true);
    try {
      await categoryService.create(newCategory);
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

  const deleteCategory = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    try {
      await categoryService.delete(id);
      toast.success('تم حذف التصنيف بنجاح');
      await fetchCategories();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  return { 
    categories, 
    loading, 
    submitting, 
    addCategory, 
    deleteCategory, 
    refresh: fetchCategories 
  };
}
