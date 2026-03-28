"use server";

import { createClient } from '@/lib/supabase/server';
import { Category } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

export async function createCategoryAction(category: Partial<Omit<Category, 'id' | 'created_at'>>) {
  const supabase: any = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("غير مصرح لك بإضافة أصناف");

  const { data, error } = await supabase
    .from('categories')
    .insert([category as any])
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  await supabase.from('activity_logs').insert({
    actor_id: user.id,
    action: 'CREATE_CATEGORY' as any,
    entity_type: 'categories',
    entity_id: data.id,
    details: { name: category.name } as any
  });

  revalidatePath('/categories');
  revalidatePath('/more');
  return data;
}

export async function updateCategoryAction(id: string, category: Partial<Category>) {
  const supabase: any = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("غير مصرح لك بتعديل الأصناف");

  const { data, error } = await supabase
    .from('categories')
    .update(category as any)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  await supabase.from('activity_logs').insert({
    actor_id: user.id,
    action: 'UPDATE_CATEGORY' as any,
    entity_type: 'categories',
    entity_id: id,
    details: { updates: category } as any
  });

  revalidatePath('/categories');
  revalidatePath('/more');
  return data;
}

export async function deleteCategoryAction(id: string) {
  const supabase: any = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("غير مصرح لك بحذف الأصناف");

  // Check for linked categories
  const { data: products } = await supabase
    .from('products')
    .select('id')
    .eq('category_id', id)
    .limit(1);

  if (products && products.length > 0) {
    throw new Error('لا يمكن حذف الصنف — لديه منتجات مرتبطة به');
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  await supabase.from('activity_logs').insert({
    actor_id: user.id,
    action: 'DELETE_CATEGORY' as any,
    entity_type: 'categories',
    entity_id: id,
    details: {} as any
  });

  revalidatePath('/categories');
  revalidatePath('/more');
  return { success: true };
}
