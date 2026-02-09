import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

export type DbOrder = Database['public']['Tables']['orders']['Row'];
export type DbOrderItem = Database['public']['Tables']['order_items']['Row'];

/**
 * Get all orders with their items
 */
export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name))')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Create a new order with items
 */
export async function createOrder(
  orderData: Omit<Database['public']['Tables']['orders']['Insert'], 'order_number'>, 
  items: { product_id: string, quantity: number, price_at_time: number }[]
) {
  // Generate order number: ORD-ddmmyyyy-Random6Char
  const now = new Date();
  const dateStr = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()}`;
  const randomChars = Math.random().toString(36).slice(2, 8).toUpperCase();
  const orderNumber = `ORD-${dateStr}-${randomChars}`;
  
  // 1. Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      order_number: orderNumber,
      status: 'Pending',
      payment_status: 'Unpaid'
    })
    .select()
    .single();

  if (orderError) throw orderError;

  // 2. Create order items
  const orderItems = items.map(item => ({
    ...item,
    order_id: order.id
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return order;
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(orderId: string, payment_status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ payment_status })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId: string) {
  // Items will be deleted automatically if cascade is set, 
  // but let's be explicit if needed or just delete the order.
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);

  if (error) throw error;
}

/**
 * Get order statistics for dashboard
 */
export async function getOrderStats() {
  const { data, error } = await supabase
    .from('orders')
    .select('total_amount, status');

  if (error) throw error;

  const totalRevenue = data.reduce((acc, order) => acc + Number(order.total_amount), 0);
  const totalOrders = data.length;

  return {
    totalRevenue,
    totalOrders,
  };
}
