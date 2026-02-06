import { supabase } from '../lib/supabase';
import type { Database, DbProduct } from '../lib/database.types';

type Product = DbProduct;
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

/**
 * Get all products with optional filtering
 */
export async function getAllProducts(options?: {
  categoryId?: string;
  isAvailable?: boolean;
  searchQuery?: string;
}): Promise<Product[]> {
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId);
  }

  if (options?.isAvailable !== undefined) {
    query = query.eq('is_available', options.isAvailable);
  }

  if (options?.searchQuery) {
    const searchTerm = `%${options.searchQuery}%`;
    query = query.or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get products by category slug
 */
export async function getProductsByCategorySlug(categorySlug: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories!inner(slug)
    `)
    .eq('categories.slug', categorySlug)
    .eq('is_available', true);

  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }

  return data;
}

/**
 * Create a new product
 */
export async function createProduct(product: ProductInsert): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
    .single();

  if (error) {
    console.error('Error creating product:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, updates: ProductUpdate): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating product:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a product
 */
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

/**
 * Upload product image to Supabase Storage
 */
export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('paypya-bucket')
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
 * Delete product image from Supabase Storage
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  // Extract file path from URL
  const urlParts = imageUrl.split('/paypya-bucket/');
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from('paypya-bucket')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
    // Don't throw error, just log it
  }
}

/**
 * Search products by name, description, or tags
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const searchTerm = query.toLowerCase().trim();
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
    .eq('is_available', true);

  if (error) {
    console.error('Error searching products:', error);
    throw error;
  }

  const products = data as Product[];

  // Also filter by tags in memory since Supabase doesn't support array search easily
  const filteredData = products?.filter(product => {
    const matchesNameOrDesc = 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);
    
    const matchesTags = product.tags?.some(tag => 
      tag.toLowerCase().includes(searchTerm)
    );

    return matchesNameOrDesc || matchesTags;
  });

  return filteredData || [];
}
