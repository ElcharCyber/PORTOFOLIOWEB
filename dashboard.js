/**
 * dashboard.js — Logika halaman dashboard untuk Portofolio Abdi Fysabilillah
 * Verifikasi sesi JWT via GET /api/auth/me.
 * Redirect ke login.html jika belum/tidak login.
 * Isi data user ke elemen DOM jika sesi valid.
 */

(function () {
  'use strict';

  const loadingOverlay   = document.getElementById('loadingOverlay');
  const dashboardContent = document.getElementById('dashboardContent');
  const logoutBtn        = document.getElementById('logoutBtn');

  /* ── Verifikasi sesi saat halaman dimuat ───────────────────── */
  async function checkSession() {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        // Token tidak ada / expired → redirect ke login
        redirectToLogin();
        return;
      }

      const data = await res.json();
      const user = data.user;

      if (!user) {
        redirectToLogin();
        return;
      }

      // Sesi valid → tampilkan konten
      populateDashboard(user);
      showDashboard();

    } catch (err) {
      // Network error atau server mati → redirect ke login
      console.error('[dashboard] session check failed:', err);
      redirectToLogin();
    }
  }

  /* ── Isi data user ke elemen DOM ───────────────────────────── */
  function populateDashboard(user) {
    const displayName = user.full_name || user.username || 'Pengguna';
    const username    = user.username || '';
    const email       = user.email || '';

    const welcomeName     = document.getElementById('welcomeName');
    const welcomeUsername = document.getElementById('welcomeUsername');
    const infoFullName    = document.getElementById('infoFullName');
    const infoUsername    = document.getElementById('infoUsername');
    const infoEmail       = document.getElementById('infoEmail');

    if (welcomeName)     welcomeName.textContent     = displayName;
    if (welcomeUsername) welcomeUsername.textContent  = '@' + username;
    if (infoFullName)    infoFullName.textContent     = displayName;
    if (infoUsername)    infoUsername.textContent     = username;
    if (infoEmail)       infoEmail.textContent        = email;
  }

  /* ── Tampilkan dashboard setelah data terisi ───────────────── */
  function showDashboard() {
    if (loadingOverlay)   loadingOverlay.style.display   = 'none';
    if (dashboardContent) dashboardContent.style.display = 'block';
  }

  /* ── Redirect ke halaman login ─────────────────────────────── */
  function redirectToLogin() {
    window.location.replace('login.html');
  }

  /* ── Logout ────────────────────────────────────────────────── */
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function () {
      logoutBtn.disabled = true;

      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (_) {
        // Abaikan error network — tetap redirect
      } finally {
        window.location.href = 'login.html';
      }
    });
  }

  /* ── Run ───────────────────────────────────────────────────── */
  checkSession();

})();
