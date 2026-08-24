const fs = require('fs');
const path = require('path');
const pool = require('../db/pool');

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
  try {
    console.log('Menjalankan migrasi...');
    await pool.query(sql);
    console.log('✅ Migrasi selesai. 5 tabel siap: users, api_keys, destinations, reviews, api_request_logs');
  } catch (err) {
    console.error('❌ Migrasi gagal:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
