document.getElementById('mobile-menu-btn')?.addEventListener('click', () => {
  document.getElementById('mobile-nav')?.classList.add('open');
  document.body.style.overflow = 'hidden';
});

document.getElementById('mobile-nav-close')?.addEventListener('click', closeMobileNav);
document.getElementById('mobile-nav')?.addEventListener('click', (e) => {
  if (e.target.id === 'mobile-nav') closeMobileNav();
});

function closeMobileNav() {
  document.getElementById('mobile-nav')?.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('hero-shop-btn')?.addEventListener('click', () => {
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
});


// High-performance scroll animation for header (mimicking Framer Motion transitions)
const headerScrollHandler = () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
};

window.addEventListener('scroll', headerScrollHandler, { passive: true });
headerScrollHandler(); // Execute once on load to sync with active page coordinates

