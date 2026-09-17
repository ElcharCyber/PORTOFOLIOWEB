/**
 * db/database.js
 * Inisialisasi database SQLite dan skema tabel.
 * Menggunakan node:sqlite built-in (Node.js 22+) — tanpa npm dependency.
 */

/* node:sqlite tersedia sejak Node 22 (experimental) dan Node 24 (stable) */
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'database.db');

let db;

function getDb() {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name   TEXT    NOT NULL,
      username    TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      email       TEXT    NOT NULL UNIQUE COLLATE NOCASE,
      password    TEXT    NOT NULL,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

module.exports = { getDb };
