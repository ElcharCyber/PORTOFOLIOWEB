document.addEventListener('DOMContentLoaded', () => {
  // Aktifkan indikator menu navigasi sesuai halaman yang dibuka
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('text-indigo-400', 'font-semibold', 'border-b-2', 'border-indigo-400', 'pb-1');
      link.classList.remove('text-slate-300');
    }
  });
});

// Fungsi pergeseran slider horizontal pada halaman Education
function scrollEdu(direction) {
  const container = document.getElementById('eduContainer');
  if (!container) return;

  const scrollAmount = 400;
  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else if (direction === 'right') {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}