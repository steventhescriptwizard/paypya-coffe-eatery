import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type DbLocation = Database['public']['Tables']['locations']['Row'];

/**
 * Get all store locations
 */
export async function getAllLocations() {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data;
}
