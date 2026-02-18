import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in your .env file');
}




const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'sms-tyre-depot-backend',
    },
  },
});


supabase.from('users').select('count').limit(1)
  .then(({ data, error }) => {
    if (error) {
      if (error.code === '42P01') {
        console.error('❌ Table "users" does not exist. Please run schema.sql in Supabase SQL Editor.');
      } else if (error.message && error.message.includes('fetch failed')) {
        console.error('❌ Cannot connect to Supabase. Check:');
        console.error('   1. Is your Supabase project active?');
        console.error('   2. Is your SUPABASE_URL correct?');
        console.error('   3. Is your network connection working?');
        console.error('   4. Error:', error.message);
      } else {
        console.error('❌ Supabase connection error:', error.message);
      }
    } else {
      console.log('✅ Connected to Supabase database');
    }
  })
  .catch((error) => {
    console.error('❌ Error connecting to Supabase:', error.message);
    console.error('   This might be a network or SSL issue.');
    console.log('⚠️  Make sure your Supabase project is set up and tables are created');
  });

export default supabase;
