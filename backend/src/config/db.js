import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  pool.on('connect', () => {
    console.log('✅ PostgreSQL connected');
  });

  pool.on('error', (err) => {
    console.error('❌ PostgreSQL error:', err);
  });
} else {
  console.log('ℹ️  Database not configured - using mock data mode');
}

export default pool;
