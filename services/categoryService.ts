import { supabase } from '../lib/supabase';
import type { Database, DbCategory } from '../lib/database.types';

type Category = DbCategory;
export type CategoryInsert = Database['public']['Tables']['categories']['Insert'];
export type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

/**
 * Get all categories ordered by display_order
 */
export async function getAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    throw error;
  }

  return data;
}

/**
 * Get a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  return data;
}

/**
 * Create a new category
 */
export async function createCategory(category: CategoryInsert): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing category
 */
export async function updateCategory(id: string, updates: CategoryUpdate): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a category
 */
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

/**
 * Reorder categories
 */
export async function reorderCategories(categoryIds: string[]): Promise<void> {
  const updates = categoryIds.map((id, index) => 
    supabase
      .from('categories')
      .update({ display_order: index + 1 })
      .eq('id', id)
  );

  const results = await Promise.all(updates);
  
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.error('Error reordering categories:', errors);
    throw new Error('Failed to reorder categories');
  }
}

/**
 * Upload category image to Supabase Storage
 */
export async function uploadCategoryImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `categories/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('paypya-bucket') // Use same bucket for now, or create separate if needed
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data } = supabase.storage
    .from('paypya-bucket')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Delete category image from Supabase Storage
 */
export async function deleteCategoryImage(imageUrl: string): Promise<void> {
  const urlParts = imageUrl.split('/paypya-bucket/');
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from('paypya-bucket')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
  }
}
