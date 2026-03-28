"use server";

import { createClient } from '@/lib/supabase/server';
import { Product } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

export async function createProductAction(product: Partial<Product>) {
  const supabase: any = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("غير مصرح لك بإضافة منتجات");

  const { data, error } = await supabase
    .from('products')
    .insert([product as any])
    .select('*, categories(name, icon)')
    .single();

  if (error) throw new Error(error.message);

  await supabase.from('activity_logs').insert({
    actor_id: user.id,
    action: 'CREATE_PRODUCT' as any,
    entity_type: 'products',
    entity_id: data.id,
    details: { name: product.name } as any
  });

  revalidatePath('/products');
  return data;
}

export async function updateProductAction(id: string, product: Partial<Product>) {
  const supabase: any = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("غير مصرح لك بتعديل المنتجات");

  const { data, error } = await supabase
    .from('products')
    .update(product as any)
    .eq('id', id)
    .select('*, categories(name, icon)')
    .single();

  if (error) throw new Error(error.message);

  await supabase.from('activity_logs').insert({
    actor_id: user.id,
    action: 'UPDATE_PRODUCT' as any,
    entity_type: 'products',
    entity_id: id,
    details: { updates: product } as any
  });

  revalidatePath('/products');
  return data;
}

export async function deleteProductAction(id: string) {
  const supabase: any = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("غير مصرح لك بحذف المنتجات");

  // Server-side check for linked items
  const { data: linkedItems } = await supabase
    .from('items')
    .select('barcode')
    .eq('product_id', id)
    .limit(1);

  if (linkedItems && linkedItems.length > 0) {
    throw new Error('لا يمكن حذف المنتج — لديه قطع مرتبطة في المخزون');
  }

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  await supabase.from('activity_logs').insert({
    actor_id: user.id,
    action: 'DELETE_PRODUCT' as any,
    entity_type: 'products',
    entity_id: id,
    details: {} as any
  });

  revalidatePath('/products');
  return { success: true };
}
