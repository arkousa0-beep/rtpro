import { useState, useEffect, useCallback } from 'react';
import { productService, Product } from '@/lib/services/productService';
import { toast } from 'sonner';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      setProducts(data || []);
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء جلب المنتجات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (newProduct: Partial<Product>) => {
    setSubmitting(true);
    try {
      const created = await productService.create(newProduct);
      toast.success('تم إضافة المنتج بنجاح');
      await fetchProducts();
      return created; // Returning the created product object
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الإضافة');
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج الأساسي؟ الشطب سيؤثر على سجلات المخزن.')) return;
    try {
      await productService.delete(id);
      toast.success('تم حذف المنتج بنجاح');
      await fetchProducts();
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء الحذف');
    }
  };

  return { 
    products, 
    loading, 
    submitting, 
    addProduct, 
    deleteProduct, 
    refresh: fetchProducts 
  };
}
