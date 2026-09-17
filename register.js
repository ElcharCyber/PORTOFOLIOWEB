/**
 * register.js — Logika halaman registrasi untuk Portofolio Abdi Fysabilillah
 * Menangani validasi form, fetch ke POST /api/auth/register,
 * toggle password visibility.
 */

(function () {
  'use strict';

  /* ── Elemen DOM ────────────────────────────────────────────── */
  const form        = document.getElementById('registerForm');
  const fullNameIn  = document.getElementById('regFullName');
  const usernameIn  = document.getElementById('regUsername');
  const emailIn     = document.getElementById('regEmail');
  const passwordIn  = document.getElementById('regPassword');
  const confirmIn   = document.getElementById('regConfirm');
  const registerBtn = document.getElementById('registerBtn');
  const alertMsg    = document.getElementById('alertMsg');
  const alertText   = document.getElementById('alertText');
  const successMsg  = document.getElementById('successMsg');
  const successText = document.getElementById('successText');

  const allInputs = [fullNameIn, usernameIn, emailIn, passwordIn, confirmIn];

  /* ── Toggle password visibility ────────────────────────────── */
  function bindToggle(btnId, iconId, inputEl) {
    const btn  = document.getElementById(btnId);
    const icon = document.getElementById(iconId);
    if (!btn || !icon) return;
    btn.addEventListener('click', function () {
      const hidden = inputEl.type === 'password';
      inputEl.type  = hidden ? 'text' : 'password';
      icon.className = hidden ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
      btn.title      = hidden ? 'Sembunyikan password' : 'Tampilkan password';
    });
  }
  bindToggle('togglePassword', 'togglePasswordIcon', passwordIn);
  bindToggle('toggleConfirm',  'toggleConfirmIcon',  confirmIn);

  /* ── Helper: tampilkan / sembunyikan alert ─────────────────── */
  function showAlert(message) {
    alertText.textContent = message;
    alertMsg.classList.add('visible');
    alertMsg.style.animation = 'none';
    void alertMsg.offsetHeight;
    alertMsg.style.animation = '';
  }

  function hideAlert() {
    alertMsg.classList.remove('visible');
  }

  function setFieldError(input, hasError) {
    if (hasError) {
      input.classList.add('input-error');
    } else {
      input.classList.remove('input-error');
    }
  }

  /* ── Hapus error saat user mengetik ────────────────────────── */
  allInputs.forEach(function (input) {
    if (!input) return;
    input.addEventListener('input', function () {
      setFieldError(this, false);
      hideAlert();
    });
  });

  /* ── Validasi lokal sebelum fetch ──────────────────────────── */
  function validateForm() {
    const full    = fullNameIn.value.trim();
    const uname   = usernameIn.value.trim();
    const email   = emailIn.value.trim();
    const pass    = passwordIn.value;
    const confirm = confirmIn.value;

    if (!full) {
      setFieldError(fullNameIn, true);
      showAlert('Nama lengkap tidak boleh kosong.');
      fullNameIn.focus();
      return false;
    }

    if (!uname) {
      setFieldError(usernameIn, true);
      showAlert('Username tidak boleh kosong.');
      usernameIn.focus();
      return false;
    }

    if (uname.length < 3 || uname.length > 30) {
      setFieldError(usernameIn, true);
      showAlert('Username harus 3–30 karakter.');
      usernameIn.focus();
      return false;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(uname)) {
      setFieldError(usernameIn, true);
      showAlert('Username hanya boleh berisi huruf, angka, dan underscore.');
      usernameIn.focus();
      return false;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError(emailIn, true);
      showAlert('Format email tidak valid.');
      emailIn.focus();
      return false;
    }

    if (pass.length < 6) {
      setFieldError(passwordIn, true);
      showAlert('Password minimal 6 karakter.');
      passwordIn.focus();
      return false;
    }

    if (pass !== confirm) {
      setFieldError(confirmIn, true);
      showAlert('Password dan konfirmasi password tidak cocok.');
      confirmIn.focus();
      return false;
    }

    return true;
  }

  /* ── Submit form ────────────────────────────────────────────── */
  if (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      hideAlert();

      if (!validateForm()) return;

      /* Loading state */
      registerBtn.classList.add('loading');
      registerBtn.disabled = true;

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            full_name:        fullNameIn.value.trim(),
            username:         usernameIn.value.trim(),
            email:            emailIn.value.trim().toLowerCase(),
            password:         passwordIn.value,
            confirm_password: confirmIn.value,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Registrasi gagal. Coba lagi.');
        }

        /* Berhasil */
        form.style.display = 'none';
        successMsg.style.display = 'flex';
        successText.textContent = `Akun berhasil dibuat! Mengarahkan ke halaman login...`;

        /* Redirect ke login setelah 2 detik */
        setTimeout(function () {
          window.location.href = 'login.html';
        }, 2000);

      } catch (err) {
        showAlert(err.message || 'Terjadi kesalahan. Coba lagi.');
        registerBtn.classList.remove('loading');
        registerBtn.disabled = false;
      }
    });
  }

})();
