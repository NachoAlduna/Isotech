window.addEventListener("scroll", function () {
  const header = document.getElementById("siteHeader");

  if (window.scrollY > 80) {
    header.classList.add("header-scrolled");
  } else {
    header.classList.remove("header-scrolled");
  }
});

function aplicarLayoutTablasMobile() {
  const isMobile = window.innerWidth <= 767.98;

  document.querySelectorAll(".tabla-productos").forEach((table) => {
    table.classList.toggle("mobile-table-layout", isMobile);
  });
}

window.addEventListener("resize", aplicarLayoutTablasMobile);
document.addEventListener("DOMContentLoaded", aplicarLayoutTablasMobile);
