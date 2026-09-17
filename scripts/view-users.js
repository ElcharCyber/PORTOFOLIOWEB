/**
 * scripts/view-users.js
 * Skrip praktis untuk melihat daftar semua pengguna yang terdaftar di database.
 * Jalankan dengan: npm run users  atau  node scripts/view-users.js
 */

const { getDb } = require('../db/database');

try {
  const db = getDb();
  const users = db.prepare(`
    SELECT 
      id, 
      full_name AS "Nama Lengkap", 
      username AS "Username", 
      email AS "Email", 
      created_at AS "Tanggal Daftar"
    FROM users 
    ORDER BY id ASC
  `).all();

  console.log('\n📋 DAFTAR PENGGUNA TERDAFTAR (Total: ' + users.length + ' user)\n');
  if (users.length === 0) {
    console.log('Belum ada pengguna yang mendaftar.');
  } else {
    console.table(users);
  }
  console.log('\nFile Database: d:\\SSD\\PORTOFOLIOWEB\\database.db\n');
} catch (err) {
  console.error('Gagal membaca database:', err.message);
}
