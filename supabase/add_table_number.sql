-- Migration: Add table_number to orders table
-- Run this in your Supabase SQL Editor

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS table_number TEXT;

-- Update comment for clarity
COMMENT ON COLUMN orders.table_number IS 'The table number assigned to the guest order';
