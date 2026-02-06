import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type DbContactMessage = Database['public']['Tables']['contact_messages']['Row'];

/**
 * Send a contact message
 */
export async function sendContactMessage(messageData: Database['public']['Tables']['contact_messages']['Insert']) {
  const { data, error } = await supabase
    .from('contact_messages')
    .insert({
      ...messageData,
      status: 'Unread'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all contact messages (for future admin functionality)
 */
export async function getAllContactMessages() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}
