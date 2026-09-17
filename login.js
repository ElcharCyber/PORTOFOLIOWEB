/**
 * login.js — Logika halaman login untuk Portofolio Abdi Fysabilillah
 * Menangani validasi form, autentikasi via API, toggle password,
 * dan modal "Lupa Password".
 */

(function () {
  'use strict';

  /* ── Elemen DOM ───────────────────────────────────────────────── */
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const passwordInput = document.getElementById('loginPassword');
  const rememberMe = document.getElementById('rememberMe');
  const loginBtn = document.getElementById('loginBtn');
  const errorMsg = document.getElementById('errorMsg');
  const errorText = document.getElementById('errorText');
  const toggleBtn = document.getElementById('togglePassword');
  const toggleIcon = document.getElementById('toggleIcon');
  const forgotLink = document.getElementById('forgotPasswordLink');
  const forgotModal = document.getElementById('forgotModal');

  /* ── Pulihkan "Ingat Saya" dari localStorage ──────────────────── */
  const savedUser = localStorage.getItem('portfolio_remember_user');
  if (savedUser && emailInput) {
    emailInput.value = savedUser;
    if (rememberMe) rememberMe.checked = true;
  }

  /* ── Validasi field individual ────────────────────────────────── */
  function setFieldError(input, hasError) {
    if (hasError) {
      input.classList.add('input-error');
    } else {
      input.classList.remove('input-error');
    }
  }

  function clearErrors() {
    setFieldError(emailInput, false);
    setFieldError(passwordInput, false);
    errorMsg.classList.remove('visible');
  }

  function showError(message) {
    errorText.textContent = message;
    errorMsg.classList.add('visible');
    // Paksa reflow agar animasi shake berjalan ulang
    errorMsg.style.animation = 'none';
    void errorMsg.offsetHeight;
    errorMsg.style.animation = '';
  }

  /* ── Toggle tampilkan/sembunyikan password ────────────────────── */
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      const isHidden = passwordInput.type === 'password';
      passwordInput.type = isHidden ? 'text' : 'password';
      toggleIcon.className = isHidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
      this.title = isHidden ? 'Sembunyikan password' : 'Tampilkan password';
    });
  }

  /* ── Hapus error saat user mulai mengetik ─────────────────────── */
  [emailInput, passwordInput].forEach(function (input) {
    if (!input) return;
    input.addEventListener('input', function () {
      setFieldError(this, false);
      if (!emailInput.classList.contains('input-error') &&
        !passwordInput.classList.contains('input-error')) {
        errorMsg.classList.remove('visible');
      }
    });
  });

  /* ── Submit form ──────────────────────────────────────────────── */
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      clearErrors();

      const userVal = emailInput.value.trim();
      const passVal = passwordInput.value;

      /* Validasi: tidak boleh kosong */
      let hasError = false;

      if (!userVal) {
        setFieldError(emailInput, true);
        hasError = true;
      }
      if (!passVal) {
        setFieldError(passwordInput, true);
        hasError = true;
      }
      if (hasError) {
        showError('Email/Username dan Password tidak boleh kosong.');
        emailInput.focus();
        return;
      }

      /* Tampilkan loading state */
      loginBtn.classList.add('loading');
      loginBtn.disabled = true;

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            identifier: userVal,
            password:   passVal,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Email/Username atau Password salah.');
        }

        /* ── Login berhasil ── */
        if (rememberMe && rememberMe.checked) {
          localStorage.setItem('portfolio_remember_user', userVal);
        } else {
          localStorage.removeItem('portfolio_remember_user');
        }

        /* Arahkan ke dashboard */
        window.location.href = 'dashboard.html';

      } catch (err) {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;

        setFieldError(emailInput, true);
        setFieldError(passwordInput, true);
        showError(err.message || 'Terjadi kesalahan server. Coba lagi.');
        passwordInput.value = '';
        passwordInput.focus();
      }
    });
  }

  /* ── Modal Lupa Password ──────────────────────────────────────── */
  if (forgotLink && forgotModal) {
    forgotLink.addEventListener('click', function (e) {
      e.preventDefault();
      openForgotModal();
    });

    /* Tutup modal jika klik di luar card */
    forgotModal.addEventListener('click', function (e) {
      if (e.target === forgotModal) {
        closeForgotModal();
      }
    });

    /* Tutup modal dengan tombol Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && forgotModal.style.display === 'flex') {
        closeForgotModal();
      }
    });
  }

  /* ── Fungsi global untuk modal (dipakai di onclick HTML) ──────── */
  window.openForgotModal = function () {
    forgotModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.closeForgotModal = function () {
    forgotModal.style.display = 'none';
    document.body.style.overflow = '';
  };

  /* ── Auto-redirect ke dashboard jika sudah login ──────────────── */
  (async function checkExistingSession() {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        // Sudah ada sesi aktif → langsung ke dashboard
        window.location.replace('dashboard.html');
      }
    } catch (_) {
      // Tidak ada sesi — tampilkan form login biasa
    }
  })();

})();
