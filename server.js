const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const destinationRoutes = require('./routes/destinationRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('tiny'));

// Rate limit global sederhana (tambahan di luar rate_limit per API key)
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Terlalu banyak request, coba lagi sebentar.' },
  })
);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Selamat datang di Wisata Indonesia API 🇮🇩',
    docs: '/api/docs',
    version: 'v1',
  });
});

app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Daftar akun baru',
        'POST /api/auth/login': 'Login, mengembalikan JWT',
      },
      api_keys: {
        'POST /api/keys': 'Buat API key baru (butuh JWT)',
        'GET /api/keys': 'Lihat daftar API key milik user (butuh JWT)',
        'PATCH /api/keys/:id/revoke': 'Nonaktifkan API key (butuh JWT)',
        'DELETE /api/keys/:id': 'Hapus API key (butuh JWT)',
      },
      data: {
        'GET /api/v1/destinations': 'List destinasi wisata (butuh x-api-key)',
        'GET /api/v1/destinations/:idOrSlug': 'Detail destinasi + review (butuh x-api-key)',
        'POST /api/v1/destinations/:id/reviews': 'Tambah review (butuh x-api-key)',
        'GET /api/v1/categories': 'List kategori wisata (butuh x-api-key)',
        'GET /api/v1/provinces': 'List provinsi (butuh x-api-key)',
      },
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/keys', apiKeyRoutes);
app.use('/api/v1', destinationRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
});

const PORT = process.env.PORT || 3000;

// Saat dijalankan lokal (bukan di Vercel), start server biasa.
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));
}

module.exports = app;
