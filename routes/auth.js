/**
 * routes/auth.js
 * API endpoints untuk autentikasi:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/logout
 *   GET  /api/auth/me
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { getDb } = require('../db/database');
const { requireAuth } = require('../middleware/auth');
const { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS, COOKIE_MAX_AGE } = require('../config');

const router = express.Router();

/* ── Helpers ────────────────────────────────────────────────── */

function setCookie(res, token) {
  res.cookie('portfolio_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    // secure: true   // aktifkan jika pakai HTTPS
  });
}

function sanitize(str) {
  return typeof str === 'string' ? str.trim() : '';
}

/* ── POST /api/auth/register ──────────────────────────────────── */
router.post('/register', async (req, res) => {
  try {
    const fullName = sanitize(req.body.full_name);
    const username = sanitize(req.body.username);
    const email = sanitize(req.body.email).toLowerCase();
    const password = sanitize(req.body.password);
    const confirm = sanitize(req.body.confirm_password);

    // Validasi kosong
    if (!fullName || !username || !email || !password || !confirm) {
      return res.status(400).json({ error: 'Semua field wajib diisi.' });
    }

    // Validasi panjang username
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username harus 3–30 karakter.' });
    }

    // Validasi username: hanya huruf, angka, underscore
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username hanya boleh berisi huruf, angka, dan underscore.' });
    }

    // Validasi format email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Format email tidak valid.' });
    }

    // Validasi panjang password
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter.' });
    }

    // Validasi konfirmasi password
    if (password !== confirm) {
      return res.status(400).json({ error: 'Password dan konfirmasi password tidak cocok.' });
    }

    const db = getDb();

    // Cek duplikasi username
    const existingUser = db.prepare(
      'SELECT id FROM users WHERE username = ? OR email = ?'
    ).get(username, email);

    if (existingUser) {
      // Cek mana yang duplikat
      const byEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (byEmail) return res.status(409).json({ error: 'Email sudah digunakan.' });
      return res.status(409).json({ error: 'Username sudah digunakan.' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Insert user
    const result = db.prepare(
      'INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)'
    ).run(fullName, username, email, hashed);

    // Buat token langsung setelah registrasi
    const token = jwt.sign(
      { id: result.lastInsertRowid, username, email, full_name: fullName },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    setCookie(res, token);

    return res.status(201).json({
      message: 'Registrasi berhasil!',
      user: { id: result.lastInsertRowid, username, email, full_name: fullName },
    });

  } catch (err) {
    console.error('[register]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server. Coba lagi.' });
  }
});

/* ── POST /api/auth/login ─────────────────────────────────────── */
router.post('/login', async (req, res) => {
  try {
    const identifier = sanitize(req.body.identifier).toLowerCase(); // email or username
    const password = sanitize(req.body.password);

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Username dan Password tidak boleh kosong.' });
    }

    const db = getDb();
    const user = db.prepare(
      'SELECT * FROM users WHERE email = ? OR username = ?'
    ).get(identifier, identifier);

    if (!user) {
      return res.status(401).json({ error: 'Email/Username atau Password salah.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Email/Username atau Password salah.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    setCookie(res, token);

    return res.json({
      message: 'Login berhasil!',
      user: { id: user.id, username: user.username, email: user.email, full_name: user.full_name },
    });

  } catch (err) {
    console.error('[login]', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server. Coba lagi.' });
  }
});

/* ── POST /api/auth/logout ────────────────────────────────────── */
router.post('/logout', (req, res) => {
  res.clearCookie('portfolio_token', { httpOnly: true, sameSite: 'strict' });
  return res.json({ message: 'Logout berhasil.' });
});

/* ── GET /api/auth/me ─────────────────────────────────────────── */
router.get('/me', requireAuth, (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
