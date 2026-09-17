/**
 * config.js
 * Konfigurasi aplikasi. Untuk produksi, ganti JWT_SECRET
 * dengan nilai dari environment variable (process.env.JWT_SECRET).
 */

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'portfolio_jwt_secret_change_in_production_2026',
  JWT_EXPIRES_IN: '7d',
  BCRYPT_ROUNDS: 12,
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000,  // 7 hari dalam ms
};
