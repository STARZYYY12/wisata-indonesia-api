const pool = require('../db/pool');

/**
 * Middleware untuk memverifikasi API Key pada endpoint penyedia data.
 * API key dikirim lewat header: x-api-key: <api_key>
 * Setiap request yang valid akan dicatat ke tabel api_request_logs
 * dan menaikkan request_count pada api_keys (mirip mekanisme OpenRouter/WeatherAPI).
 */
async function authApiKey(req, res, next) {
  const apiKey = req.header('x-api-key');

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key tidak ditemukan. Sertakan header x-api-key.',
    });
  }

  try {
    const result = await pool.query(
      'SELECT id, user_id, is_active, rate_limit FROM api_keys WHERE api_key = $1',
      [apiKey]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'API key tidak valid.' });
    }

    const keyRow = result.rows[0];

    if (!keyRow.is_active) {
      return res.status(403).json({ success: false, message: 'API key sudah dinonaktifkan.' });
    }

    // Update pemakaian key
    await pool.query(
      'UPDATE api_keys SET request_count = request_count + 1, last_used_at = NOW() WHERE id = $1',
      [keyRow.id]
    );

    req.apiKeyId = keyRow.id;
    req.apiKeyUserId = keyRow.user_id;

    // Catat log request (fire-and-forget, tidak menghambat response)
    res.on('finish', () => {
      pool
        .query(
          'INSERT INTO api_request_logs (api_key_id, endpoint, method, status_code, ip_address) VALUES ($1,$2,$3,$4,$5)',
          [keyRow.id, req.originalUrl, req.method, res.statusCode, req.ip]
        )
        .catch((e) => console.error('Gagal mencatat log request:', e.message));
    });

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Kesalahan server saat validasi API key.' });
  }
}

module.exports = authApiKey;
