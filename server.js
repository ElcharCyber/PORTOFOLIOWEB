/**
 * server.js
 * Entry point Express server untuk PORTOFOLIOWEB.
 * Melayani file statis HTML/CSS/JS + REST API autentikasi.
 *
 * Jalankan dengan: node server.js  atau  npm start
 */

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const { PORT } = require('./config');
const authRoutes = require('./routes/auth');

const app = express();

/* ── Middleware ─────────────────────────────────────────────── */
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ── Sajikan file statis dari root folder ─────────────────── */
app.use(express.static(path.join(__dirname)));

/* ── API Routes ─────────────────────────────────────────────── */
app.use('/api/auth', authRoutes);

/* ── Fallback: untuk path yang tidak dikenal ────────────────── */
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

/* ── Start server ───────────────────────────────────────────── */
app.listen(PORT, () => {
  console.log(`\n🚀 PORTOFOLIOWEB Server berjalan di http://localhost:${PORT}`);
  console.log(`   Tekan Ctrl+C untuk menghentikan server.\n`);
});
