// Vercel serverless entry point.
// Vercel akan otomatis mem-build folder /api sebagai serverless functions.
// File ini hanya mengekspor ulang instance Express dari server.js.
module.exports = require('../server');
