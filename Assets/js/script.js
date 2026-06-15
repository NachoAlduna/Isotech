
window.addEventListener('scroll', function() {
  const header = document.getElementById('siteHeader');

  if (window.scrollY > 80) {
    header.classList.add('header-scrolled');
  } else {
    header.classList.remove('header-scrolled');
  }
});

