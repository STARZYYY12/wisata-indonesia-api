const { Pool } = require('pg');
require('dotenv').config();

// Supabase/Postgres connection pool.
// DATABASE_URL contoh: postgresql://user:pass@host:5432/postgres?sslmode=require
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase')
    ? { rejectUnauthorized: false }
    : false,
  max: 5,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('Unexpected error pada idle client PostgreSQL', err);
});

module.exports = pool;
