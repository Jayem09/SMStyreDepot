-- Add warranty column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS warranty TEXT;

-- Example update for existing products (optional)
-- UPDATE products SET warranty = '5 Years Manufacturer Warranty' WHERE brand = 'Michelin';
