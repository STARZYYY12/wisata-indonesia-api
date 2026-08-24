const jwt = require('jsonwebtoken');

/**
 * Middleware untuk memverifikasi JWT (dipakai di endpoint manajemen akun,
 * seperti membuat/menghapus API key). Token dikirim lewat header:
 * Authorization: Bearer <token>
 */
function authJwt(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token JWT tidak ditemukan. Sertakan header Authorization: Bearer <token>',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token JWT tidak valid atau kadaluarsa',
    });
  }
}

module.exports = authJwt;
