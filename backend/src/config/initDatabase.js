import supabase from './database.js';
import dotenv from 'dotenv';

dotenv.config();

// SQL migration script for Supabase (PostgreSQL)
const createTablesSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  size VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table
CREATE TABLE IF NOT EXISTS cart (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_zip VARCHAR(20) NOT NULL,
  shipping_phone VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'gcash',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, user_id)
);

-- Brands table
CREATE TABLE IF NOT EXISTS brands (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  logo TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(type);
CREATE INDEX IF NOT EXISTS idx_products_size ON products(size);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);

-- Vehicle Tyre Mapping table
CREATE TABLE IF NOT EXISTS vehicle_tyre_mapping (
  id BIGSERIAL PRIMARY KEY,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  trim VARCHAR(100),
  tyre_size VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vehicle_make ON vehicle_tyre_mapping(make);
CREATE INDEX IF NOT EXISTS idx_vehicle_model ON vehicle_tyre_mapping(model);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  branch VARCHAR(100) NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointment_date ON appointments(appointment_date);
`;

async function initDatabase() {
  try {
    console.log('🔄 Initializing Supabase database...');

    // Note: Supabase doesn't support executing raw SQL directly from the client
    // You need to run this SQL in the Supabase SQL Editor or use migrations
    // For now, we'll use the Supabase client to create tables via RPC or direct SQL execution

    // Alternative: Use Supabase REST API to execute SQL
    // Or better: Use Supabase migrations (recommended)

    console.log('⚠️  Note: Table creation should be done via Supabase Dashboard SQL Editor or migrations.');
    console.log('📝 Copy and paste the following SQL into your Supabase SQL Editor:');
    console.log('\n' + '='.repeat(60));
    console.log(createTablesSQL);
    console.log('='.repeat(60) + '\n');

    // Check if brands table exists and insert brands from local images
    const { count: brandCount, error: brandCheckError } = await supabase
      .from('brands')
      .select('*', { count: 'exact', head: true });

    if (!brandCheckError && (brandCount === 0 || brandCount === null)) {
      console.log('🏷️ Populating brands from local images...');

      const brandsPath = './../frontend/public/images/brands';
      if (fs.existsSync(brandsPath)) {
        const files = fs.readdirSync(brandsPath);
        const brandData = files
          .filter(file => ['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(path.extname(file).toLowerCase()))
          .map(file => {
            let name = file.split('-logo')[0].replace(/-/g, ' ');
            // Capitalize
            name = name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            // Manual fixes
            if (name.toLowerCase() === 'gtradial') name = 'GT Radial';
            if (name.toLowerCase() === 'mrf') name = 'MRF';

            return {
              name,
              logo: `/images/brands/${file}`,
              description: `${name} premium tyres and automotive services.`
            };
          });

        if (brandData.length > 0) {
          const { data, error } = await supabase
            .from('brands')
            .insert(brandData)
            .select();

          if (error) {
            console.error('❌ Error populating brands:', error);
          } else {
            console.log(`✅ Inserted ${data.length} brands`);
          }
        }
      }
    }

    // Check if products table exists and insert sample data
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.error('❌ Tables do not exist. Please run the SQL script above in Supabase SQL Editor first.');
      process.exit(1);
    }

    // Check if we have products
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (count === 0) {
      console.log('📦 Inserting sample products...');

      const sampleProducts = [
        {
          name: 'Michelin Energy XM2+',
          brand: 'Michelin',
          size: '225/45R17',
          type: 'Summer',
          price: 189.99,
          description: 'Premium fuel-efficient tyre with excellent wet grip',
          image_url: '/images/tyres/MichelinEnergyXM2.jpg',
          stock: 50,
          rating: 4.8
        },
        {
          name: 'Michelin Primacy 4 ST',
          brand: 'Michelin',
          size: '205/55R16',
          type: 'All-Season',
          price: 149.99,
          description: 'Comfortable and quiet all-season tyre',
          image_url: '/images/tyres/MichelinPrimacy4ST.jpg',
          stock: 45,
          rating: 4.7
        },
        {
          name: 'Michelin Pilot Sport 5',
          brand: 'Michelin',
          size: '195/65R15',
          type: 'Summer',
          price: 129.99,
          description: 'High-performance summer tyre',
          image_url: '/images/tyres/MichelinPilotSport5.jpg',
          stock: 40,
          rating: 4.6
        },
        {
          name: 'Michelin Agilis 3',
          brand: 'Michelin',
          size: '215/60R16',
          type: 'All-Season',
          price: 139.99,
          description: 'Durable commercial vehicle tyre',
          image_url: '/images/tyres/MichelinAgilis3.jpg',
          stock: 35,
          rating: 4.5
        },
        {
          name: 'Continental Premium Contact 6',
          brand: 'Continental',
          size: '205/55R16',
          type: 'All-Season',
          price: 149.99,
          description: 'German engineering excellence',
          image_url: 'https://images.unsplash.com/photo-1753325365298-497e6058142b',
          stock: 42,
          rating: 4.7
        },
        {
          name: 'Bridgestone Turanza T005',
          brand: 'Bridgestone',
          size: '195/65R15',
          type: 'All-Season',
          price: 129.99,
          description: 'Trusted performance worldwide',
          image_url: 'https://images.unsplash.com/photo-1654872820853-56a1ba8e987e',
          stock: 38,
          rating: 4.6
        }
      ];

      const { data, error } = await supabase
        .from('products')
        .insert(sampleProducts)
        .select();

      if (error) {
        console.error('❌ Error inserting sample products:', error);
        throw error;
      }

      console.log(`✅ Inserted ${data.length} sample products`);
    } else {
      console.log(`✅ Database already has ${count} products`);
    }

    // Insert sample vehicle mappings
    const { count: vehicleCount } = await supabase
      .from('vehicle_tyre_mapping')
      .select('*', { count: 'exact', head: true });

    if (vehicleCount === 0) {
      console.log('🚗 Inserting sample vehicle mappings...');
      const sampleVehicles = [
        { make: 'Toyota', model: 'Vios', year: 2022, trim: '1.3 E', tyre_size: '185/60R15' },
        { make: 'Toyota', model: 'Vios', year: 2022, trim: '1.5 G', tyre_size: '195/50R16' },
        { make: 'Toyota', model: 'Fortuner', year: 2023, trim: 'Q / LTD', tyre_size: '265/60R18' },
        { make: 'Mitsubishi', model: 'Montero Sport', year: 2023, trim: 'GT', tyre_size: '265/60R18' },
        { make: 'Mitsubishi', model: 'Xpander', year: 2023, trim: 'GLS', tyre_size: '205/55R16' },
        { make: 'Honda', model: 'Civic', year: 2022, trim: 'RS Turbo', tyre_size: '235/40R18' },
        { make: 'Ford', model: 'Ranger', year: 2023, trim: 'Wildtrak', tyre_size: '255/65R18' },
        { make: 'Nissan', model: 'Navara', year: 2022, trim: 'Pro-4X', tyre_size: '255/60R18' },
      ];

      const { error: vehicleError } = await supabase
        .from('vehicle_tyre_mapping')
        .insert(sampleVehicles);

      if (vehicleError) console.error('❌ Error inserting vehicles:', vehicleError);
      else console.log('✅ Inserted sample vehicle mappings');
    }

    console.log('✅ Database initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
