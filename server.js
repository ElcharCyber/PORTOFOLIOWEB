/**
 * server.js
 * Entry point Express server untuk PORTOFOLIOWEB.
 * Melayani file statis HTML/CSS/JS + REST API autentikasi + Route Guard.
 *
 * Jalankan dengan: node server.js  atau  npm run dev
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const { PORT, JWT_SECRET } = require('./config');
const authRoutes = require('./routes/auth');

const app = express();

/* ── Middleware Global ───────────────────────────────────────── */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ── API Routes (Diproses sebelum file statis) ──────────────── */
app.use('/api/auth', authRoutes);

/* ── Route Guard untuk Halaman Terproteksi ───────────────────── */
const protectedPages = [
  '/dashboard.html',
  '/dashboard',
  '/about.html',
  '/about',
  '/education.html',
  '/education',
  '/projects.html',
  '/projects'
];

app.use((req, res, next) => {
  const reqPath = req.path.toLowerCase();
  const isProtected = protectedPages.some(page => reqPath === page || reqPath === page + '.html');

  if (isProtected) {
    const token = req.cookies?.portfolio_token;
    if (!token) {
      // Belum login -> langsung redirect ke login.html
      return res.redirect('/login.html');
    }
    try {
      jwt.verify(token, JWT_SECRET);
      // Dukung clean URL tanpa ekstensi .html
      if (!reqPath.endsWith('.html')) {
        const pageFile = reqPath.replace('/', '') + '.html';
        return res.sendFile(path.join(__dirname, pageFile));
      }
      return next();
    } catch (err) {
      res.clearCookie('portfolio_token');
      return res.redirect('/login.html');
    }
  }
  next();
});

/* ── Sajikan file statis dari root folder ─────────────────── */
app.use(express.static(path.join(__dirname)));

/* ── Error Handler Middleware (Pastikan respon selalu JSON) ─── */
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Format data JSON tidak valid.' });
  }
  console.error('[server error]', err);
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ error: 'Terjadi kesalahan server internal.' });
  }
  next(err);
});

/* ── Fallback: untuk path yang tidak dikenal ────────────────── */
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

/* ── Start server ───────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🚀 PORTOFOLIOWEB Server berjalan di http://localhost:${PORT}`);
  console.log(`   Tekan Ctrl+C untuk menghentikan server.\n`);
});
