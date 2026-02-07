-- Migration: Add missing columns to orders table to fix 400 Bad Request error
-- Run this in your Supabase SQL Editor

-- 1. Add table_number column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS table_number TEXT;

COMMENT ON COLUMN orders.table_number IS 'The table number assigned to the guest order';

-- 2. Add payment_method column
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cashier';

-- Update existing orders to have a default value
UPDATE orders SET payment_method = 'cashier' WHERE payment_method IS NULL;

COMMENT ON COLUMN orders.payment_method IS 'The method of payment for the order (e.g., cashier, wa_checkout)';
