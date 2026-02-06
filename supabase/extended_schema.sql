-- Extended Schema for Orders and Locations
-- Run this in your Supabase SQL Editor

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL DEFAULT 'Guest',
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Cooking, Completed, Cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- LOCATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    image_url TEXT NOT NULL,
    map_url TEXT NOT NULL,
    hours JSONB NOT NULL DEFAULT '[]'::jsonb,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CONTACT MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Unread', -- Unread, Read, Replied
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Settings
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Public read for locations
CREATE POLICY "Allow public read access on locations" ON locations FOR SELECT TO public USING (true);

-- Authenticated users can manage everything else (Admin)
CREATE POLICY "Allow authenticated users to manage orders" ON orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users to manage order_items" ON order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users to manage locations" ON locations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated users to manage contact_messages" ON contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Public can insert orders and contact messages
CREATE POLICY "Allow public to insert orders" ON orders FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public to insert order_items" ON order_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public to insert contact_messages" ON contact_messages FOR INSERT TO public WITH CHECK (true);

-- Public can read orders they just created (via order_number or id)
-- Note: In a production app, you might want more restrictive read access, 
-- but this is required for the .select() call to return data to the user.
CREATE POLICY "Allow public to read orders" ON orders FOR SELECT TO public USING (true);
CREATE POLICY "Allow public to read order_items" ON order_items FOR SELECT TO public USING (true);

-- Triggers for updated_at
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed Data for Locations
INSERT INTO locations (name, address, city, phone, email, image_url, map_url, hours, display_order) VALUES
('PAYPYA Cafe Central', 'Jl. Jend. Sudirman Kav. 52-53', 'Jakarta Selatan, 12190', '(021) 555-0123', 'hello@paypya.com', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop', 'https://www.google.com/maps/search/?api=1&query=Jl.+Jend.+Sudirman+Kav.+52-53+Jakarta', '[{"day": "Mon - Fri", "time": "11.00 - 00:00"}, {"day": "Sat - Sun", "time": "17:00 - 00:00"}]'::jsonb, 1),
('PAYPYA Cafe Garden', 'Jl. Kemang Raya No. 88', 'Jakarta Selatan, 12730', '(021) 555-0199', 'garden@paypya.com', 'https://images.unsplash.com/photo-1574966739937-210ce8b7b257?q=80&w=1000&auto=format&fit=crop', 'https://www.google.com/maps/search/?api=1&query=Jl.+Kemang+Raya+No.+88+Jakarta', '[{"day": "Mon - Fri", "time": "11.00 - 00:00"}, {"day": "Sat - Sun", "time": "17:00 - 00:00"}]'::jsonb, 2);
-- =====================================================
-- STORAGE BUCKET setup
-- =====================================================

-- Insert bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('paypya-bucket', 'paypya-bucket', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for paypya-bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'paypya-bucket' );

CREATE POLICY "Public users can upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'paypya-bucket' );

CREATE POLICY "Public users can update"
ON storage.objects FOR UPDATE
TO public
WITH CHECK ( bucket_id = 'paypya-bucket' );

CREATE POLICY "Public users can delete"
ON storage.objects FOR DELETE
TO public
USING ( bucket_id = 'paypya-bucket' );
