const crypto = require('crypto');
const pool = require('../db/pool');

function generateApiKey() {
  return 'wid_' + crypto.randomBytes(24).toString('hex'); // prefix wid_ = Wisata Indonesia
}

// POST /api/keys  (JWT protected)
async function createApiKey(req, res) {
  const { label } = req.body;
  const userId = req.user.id;

  try {
    const apiKey = generateApiKey();
    const result = await pool.query(
      'INSERT INTO api_keys (user_id, api_key, label) VALUES ($1,$2,$3) RETURNING id, api_key, label, is_active, rate_limit, created_at',
      [userId, apiKey, label || 'default key']
    );
    return res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Gagal membuat API key.' });
  }
}

// GET /api/keys  (JWT protected) - list milik user login
async function listApiKeys(req, res) {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      'SELECT id, api_key, label, is_active, request_count, rate_limit, last_used_at, created_at FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Gagal mengambil daftar API key.' });
  }
}

// PATCH /api/keys/:id/revoke (JWT protected)
async function revokeApiKey(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE api_keys SET is_active = FALSE WHERE id = $1 AND user_id = $2 RETURNING id, is_active',
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'API key tidak ditemukan.' });
    }
    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Gagal menonaktifkan API key.' });
  }
}

// DELETE /api/keys/:id (JWT protected)
async function deleteApiKey(req, res) {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM api_keys WHERE id = $1 AND user_id = $2 RETURNING id', [id, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'API key tidak ditemukan.' });
    }
    return res.json({ success: true, message: 'API key dihapus.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Gagal menghapus API key.' });
  }
}

module.exports = { createApiKey, listApiKeys, revokeApiKey, deleteApiKey };
