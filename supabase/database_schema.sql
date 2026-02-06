-- PAYPYA Cafe Menu Catalog Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    description TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT NOT NULL,
    badge TEXT,
    rating NUMERIC(2, 1) CHECK (rating >= 0 AND rating <= 5),
    calories INTEGER CHECK (calories >= 0),
    tags TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_available ON products(is_available);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-updating updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public read access for categories
CREATE POLICY "Allow public read access on categories"
    ON categories FOR SELECT
    TO public
    USING (true);

-- Public read access for products
CREATE POLICY "Allow public read access on products"
    ON products FOR SELECT
    TO public
    USING (true);

-- Authenticated users can insert/update/delete categories
CREATE POLICY "Allow authenticated users to manage categories"
    ON categories FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Authenticated users can insert/update/delete products
CREATE POLICY "Allow authenticated users to manage products"
    ON products FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- SEED DATA (Optional - based on existing data.ts)
-- =====================================================

-- Insert categories
INSERT INTO categories (name, slug, icon, description, display_order) VALUES
    ('Menu Rice', 'rice', 'rice_bowl', 'Discover our flavorful collection of aromatic rice specialties, prepared with the finest jasmine and basmati grains.', 1),
    ('Vegetables', 'vegetables', 'grass', 'Farm-to-table seasonal greens and vibrant stir-fries meant to nourish your body.', 2),
    ('Mie', 'mie', 'ramen_dining', 'From classic savory stir-fries to steaming bowls of authentic broth-based delights.', 3),
    ('Non-Coffee Ice / Hot', 'non-coffee', 'local_bar', 'Indulge in our handcrafted fruit juices, premium matcha lattes, and calming herbal infusions.', 4),
    ('Coffee Ice / Hot', 'coffee', 'coffee', 'From single-origin beans to our signature house blends, curated by master roasters.', 5),
    ('Snack', 'snack', 'tapas', 'Delicious appetizers and light bites perfect for any time of the day.', 6),
    ('Dessert', 'dessert', 'icecream', 'Sweet treats to complete your meal, from traditional delights to modern indulgences.', 7)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products (Menu Rice)
INSERT INTO products (category_id, name, description, price, image_url, badge, rating, tags, is_available)
SELECT 
    c.id,
    'Thai Basil Fried Rice',
    'Stir-fried jasmine rice with aromatic holy basil, fresh chili, and authentic spices.',
    45000,
    'https://images.unsplash.com/photo-1596560548464-f010549b84d7?q=80&w=1000&auto=format&fit=crop',
-- ... and so on for others ...
    'Popular',
    4.8,
    '{}',
    true
FROM categories c WHERE c.slug = 'rice';

INSERT INTO products (category_id, name, description, price, image_url, rating, tags, is_available)
SELECT 
    c.id,
    'Classic Egg Fried Rice',
    'Traditional wok-tossed rice with fluffy eggs, crunchy vegetables and fresh scallions.',
    35000,
    'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=1000&auto=format&fit=crop',
    4.5,
    '{}',
    true
FROM categories c WHERE c.slug = 'rice';

INSERT INTO products (category_id, name, description, price, image_url, rating, tags, is_available)
SELECT 
    c.id,
    'Pineapple Fried Rice',
    'Sweet and savory rice with fresh pineapple, plump shrimp, and crunchy cashews.',
    48000,
    'https://images.unsplash.com/photo-1536304993881-ff002453bef4?q=80&w=1000&auto=format&fit=crop',
    4.9,
    '{}',
    true
FROM categories c WHERE c.slug = 'rice';

INSERT INTO products (category_id, name, description, price, image_url, rating, tags, is_available)
SELECT 
    c.id,
    'Spicy Kimchi Rice',
    'Tangy and spicy Korean-style rice topped with a perfect sunnyside-up fried egg.',
    42000,
    'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1000&auto=format&fit=crop',
    4.7,
    ARRAY['Spicy'],
    true
FROM categories c WHERE c.slug = 'rice';

-- Insert sample products (Vegetables)
INSERT INTO products (category_id, name, description, price, image_url, calories, tags, is_available)
SELECT 
    c.id,
    'Garden Harvest Salad',
    'Mixed baby greens, avocado, cucumber, pumpkin seeds, and our house balsamic vinaigrette.',
    38000,
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop',
    320,
    ARRAY['Vegan', 'GF'],
    true
FROM categories c WHERE c.slug = 'vegetables';

INSERT INTO products (category_id, name, description, price, image_url, calories, tags, is_available)
SELECT 
    c.id,
    'Sesame Ginger Stir-fry',
    'Snap peas, bell peppers, broccoli, and carrots tossed in a spicy sesame ginger glaze.',
    45000,
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop',
    410,
    ARRAY['Spicy', 'Vegan'],
    true
FROM categories c WHERE c.slug = 'vegetables';

-- Insert sample products (Mie)
INSERT INTO products (category_id, name, description, price, image_url, rating, tags, is_available)
SELECT 
    c.id,
    'Classic Fried Mie',
    'Savory soy sauce base with fresh seasonal vegetables and crispy shallots.',
    35000,
    'https://images.unsplash.com/photo-1617375783516-2f63d8fb5d82?q=80&w=1000&auto=format&fit=crop',
    4.6,
    ARRAY['Spicy'],
    true
FROM categories c WHERE c.slug = 'mie';

INSERT INTO products (category_id, name, description, price, image_url, badge, rating, tags, is_available)
SELECT 
    c.id,
    'Creamy Tom Yum Mie',
    'Rich Thai spicy and sour broth with prawns, mushrooms and herbs.',
    55000,
    'https://images.unsplash.com/photo-1548943487-a2e4e43b485c?q=80&w=1000&auto=format&fit=crop',
    'New',
    4.8,
    ARRAY['Spicy'],
    true
FROM categories c WHERE c.slug = 'mie';

-- Insert sample products (Snack)
INSERT INTO products (category_id, name, description, price, image_url, calories, rating, is_available)
SELECT 
    c.id,
    'Mozzarella Sticks',
    'Golden brown breaded cheese sticks served with marinara sauce.',
    28000,
    'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?q=80&w=1000&auto=format&fit=crop',
    450,
    4.8,
    true
FROM categories c WHERE c.slug = 'snack';

INSERT INTO products (category_id, name, description, price, image_url, badge, calories, rating, is_available)
SELECT 
    c.id,
    'Chicken Wings',
    'Spicy buffalo chicken wings served with ranch dip and celery sticks.',
    45000,
    'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?q=80&w=1000&auto=format&fit=crop',
    'Best Seller',
    680,
    4.9,
    true
FROM categories c WHERE c.slug = 'snack';

-- Insert sample products (Non-Coffee)
INSERT INTO products (category_id, name, description, price, image_url, badge, is_available)
SELECT 
    c.id,
    'Ceremonial Iced Matcha',
    'Premium grade A matcha whisked with creamy oat milk and local honey.',
    32000,
    'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?q=80&w=1000&auto=format&fit=crop',
    'Best Seller',
    true
FROM categories c WHERE c.slug = 'non-coffee';

INSERT INTO products (category_id, name, description, price, image_url, badge, is_available)
SELECT 
    c.id,
    'Sunset Passion Punch',
    'Freshly squeezed navel oranges blended with exotic passionfruit seeds.',
    28000,
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=1000&auto=format&fit=crop',
    'New',
    true
FROM categories c WHERE c.slug = 'non-coffee';

-- Insert sample products (Coffee)
INSERT INTO products (category_id, name, description, price, image_url, tags, is_available)
SELECT 
    c.id,
    'Artisan Flat White',
    'Velvety micro-foam poured over a double shot of our house espresso blend.',
    25000,
    'https://images.unsplash.com/photo-1577968897966-3d4325b36b61?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Medium Roast'],
    true
FROM categories c WHERE c.slug = 'coffee';

INSERT INTO products (category_id, name, description, price, image_url, badge, tags, is_available)
SELECT 
    c.id,
    'Vanilla Cold Brew',
    '24-hour slow steeped cold brew with Madagascar vanilla and a splash of cream.',
    28000,
    'https://images.unsplash.com/photo-1517701604599-bb29b5c5090c?q=80&w=1000&auto=format&fit=crop',
    'Top Rated',
    ARRAY['Dark Roast'],
    true
FROM categories c WHERE c.slug = 'coffee';

-- Insert sample products (Dessert)
INSERT INTO products (category_id, name, description, price, image_url, badge, is_available)
SELECT 
    c.id,
    'Mango Sticky Rice',
    'Sweet glutinous rice with fresh mango slices and coconut milk topping.',
    35000,
    'https://images.unsplash.com/photo-1596716982316-430b35eb04d7?q=80&w=1000&auto=format&fit=crop',
    'Popular',
    true
FROM categories c WHERE c.slug = 'dessert';

INSERT INTO products (category_id, name, description, price, image_url, tags, is_available)
SELECT 
    c.id,
    'Molten Chocolate Lava Cake',
    'Rich chocolate cake with a molten center, served with vanilla bean ice cream.',
    45000,
    'https://images.unsplash.com/photo-1606313564200-e75d5e30476d?q=80&w=1000&auto=format&fit=crop',
    ARRAY['Vegetarian'],
    true
FROM categories c WHERE c.slug = 'dessert';

-- =====================================================
-- STORAGE BUCKET FOR PRODUCT IMAGES
-- =====================================================
-- Note: Create this bucket manually in Supabase Storage UI
-- Bucket name: paypya-bucket
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
