-- Migration: Add payment_method to orders table
-- Run this in your Supabase SQL Editor

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cashier';

-- Update existing orders to have a default value
UPDATE orders SET payment_method = 'cashier' WHERE payment_method IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN orders.payment_method IS 'The method of payment for the order (e.g., cashier, wa_checkout)';
