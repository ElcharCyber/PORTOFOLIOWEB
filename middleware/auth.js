/**
 * middleware/auth.js
 * Middleware untuk memverifikasi JWT dari httpOnly cookie.
 * Inject req.user jika token valid.
 */

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

function requireAuth(req, res, next) {
  const token = req.cookies?.portfolio_token;

  if (!token) {
    return res.status(401).json({ error: 'Belum login. Silakan masuk terlebih dahulu.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.clearCookie('portfolio_token');
    return res.status(401).json({ error: 'Sesi tidak valid atau sudah kedaluwarsa. Silakan login ulang.' });
  }
}

module.exports = { requireAuth };
