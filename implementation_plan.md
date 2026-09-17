# Full-Stack Auth + Dashboard — PORTOFOLIOWEB

Menambahkan sistem **Register / Login** dengan backend Node.js + database SQLite, serta halaman **Dashboard** yang hanya bisa diakses setelah login.

---

## User Review Required

> [!IMPORTANT]
> Perubahan ini mengubah proyek dari **static frontend** menjadi **full-stack Node.js app**. File HTML yang ada tetap dipertahankan. Server Express berjalan di port `3000` dan melayani file statis serta REST API.

> [!WARNING]
> Database yang dipilih adalah **SQLite** (via `better-sqlite3`) karena:
> - **Tidak butuh instalasi server terpisah** (PostgreSQL / MySQL perlu service)
> - File tunggal `database.db` langsung dibuat di folder proyek
> - Cocok untuk portfolio / demo skala kecil
> - Kalau ingin MySQL/PostgreSQL bisa diubah, tinggal ganti driver

---

## Open Questions

> [!NOTE]
> Berikut keputusan desain yang sudah saya ambil — beri tahu jika ingin diubah:
> - **Token auth**: JWT disimpan di `httpOnly cookie` (lebih aman dari localStorage)
> - **Password hashing**: bcrypt dengan salt rounds 12
> - **Session expiry**: Token JWT expired 7 hari
> - **Dashboard**: Halaman baru `dashboard.html` — jadi landing setelah login berhasil, menampilkan profil user + statistik sederhana

---

## Proposed Changes

### Backend (Node.js + Express)

#### [NEW] `server.js`
Entry point Express server — melayani file statis + mendaftarkan semua route API.

#### [NEW] `package.json`
Dependensi: `express`, `better-sqlite3`, `bcryptjs`, `jsonwebtoken`, `cookie-parser`, `cors`.

#### [NEW] `db/database.js`
Inisialisasi database SQLite dan pembuatan tabel `users`.

#### [NEW] `routes/auth.js`
REST API endpoint:
- `POST /api/auth/register` — validasi, hash password, simpan ke DB
- `POST /api/auth/login` — cek kredensial, buat JWT, set cookie
- `POST /api/auth/logout` — hapus cookie
- `GET  /api/auth/me` — return info user dari token (untuk validasi sesi)

#### [NEW] `middleware/auth.js`
Middleware `requireAuth` — verifikasi JWT dari cookie, inject `req.user`.

---

### Frontend (HTML/CSS/JS)

#### [MODIFY] `login.html`
Tambah link **"Daftar Akun"** menuju `register.html`.

#### [NEW] `register.html`
Form registrasi dengan field:
- Nama Lengkap
- Email
- Username
- Password
- Konfirmasi Password
- Link kembali ke Login

#### [NEW] `register.js`
Validasi form registrasi + fetch ke `POST /api/auth/register`.

#### [MODIFY] `login.js`
Ganti simulasi dummy credentials → fetch ke `POST /api/auth/login`.  
Tambah fungsi cek sesi via `GET /api/auth/me`.

#### [NEW] `dashboard.html`
Halaman dashboard baru — hanya bisa diakses setelah login. Menampilkan:
- Welcome banner dengan nama user
- Statistik (Projects, Skills, Connections)
- Quick nav ke About, Education, Projects
- Tombol Logout

#### [NEW] `dashboard.js`
Verifikasi sesi via `/api/auth/me`, redirect ke `login.html` jika belum login.

#### [MODIFY] `style.css`
Tambah CSS untuk form register dan dashboard.

---

## Alur Halaman

```
index.html
  ├─→ login.html ──────────────────→ dashboard.html (setelah login berhasil)
  │       ↑ "Kembali"                    │ (Logout)
  │       │                              ↓
  └─→ register.html ──────────────→ login.html
```

---

## Verification Plan

### Automated
```
node server.js   # Server start tanpa error
```

### Manual
1. Buka `http://localhost:3000`
2. Klik "Masuk ke Portfolio" → halaman login
3. Klik "Daftar Akun" → form registrasi → isi → submit → redirect ke login
4. Login dengan akun baru → redirect ke `dashboard.html`
5. Klik Logout → kembali ke login
6. Coba akses `dashboard.html` langsung (tanpa login) → redirect ke `login.html`
