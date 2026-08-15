window.addEventListener("scroll", function () {
  const header = document.getElementById("siteHeader");

  if (window.scrollY > 80) {
    header.classList.add("header-scrolled");
  } else {
    header.classList.remove("header-scrolled");
  }
});

function transponerTablaMovil(table) {
  const headers = Array.from(table.querySelectorAll("thead th")).map((th) =>
    th.textContent.trim(),
  );

  const filas = Array.from(table.querySelectorAll("tbody tr")).map((tr) =>
    Array.from(tr.children).map((td) => td.textContent.trim()),
  );

  if (!headers.length || !filas.length) return;

  // Nombres de modelos = primera fila de datos (SM 50, SM 80...)
  // Labels de fila = headers originales (Modelo, Código, Pot...)
  const wrapper = document.createElement("div");
  wrapper.className = "table-responsive transposed-wrap";

  const transposed = document.createElement("table");
  transposed.className = table.className + " mobile-transposed";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");

  // Primera celda vacía (esquina superior izquierda)
  const emptyTh = document.createElement("th");
  emptyTh.textContent = headers[0] || "Modelo";
  headRow.appendChild(emptyTh);

  // Columna por cada modelo (SM 50, SM 80...)
  filas.forEach((fila) => {
    const th = document.createElement("th");
    th.textContent = fila[0] || "-";
    headRow.appendChild(th);
  });

  thead.appendChild(headRow);
  transposed.appendChild(thead);

  // Una fila por cada campo (Código, Pot., Tensión...)
  const tbody = document.createElement("tbody");

  headers.forEach((header, i) => {
    if (i === 0) return; // saltar "Modelo" — ya está en el thead

    const tr = document.createElement("tr");

    // Label fijo a la izquierda
    const labelTh = document.createElement("th");
    labelTh.textContent = header;
    tr.appendChild(labelTh);

    // Valor de cada modelo para este campo
    filas.forEach((fila) => {
      const td = document.createElement("td");
      td.textContent = fila[i] || "-";
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  transposed.appendChild(tbody);
  wrapper.appendChild(transposed);

  const parent = table.parentElement;
  if (!parent) return;

  // Limpiar transpuesta anterior si existe
  const existing = parent.querySelector(".transposed-wrap");
  if (existing) existing.remove();

  table.style.display = "none";
  parent.insertBefore(wrapper, table.nextSibling);
  table.dataset.mobileTransposed = "true";
}

function aplicarLayoutTablasMobile() {
  const isMobile = window.innerWidth <= 767.98;

  document.querySelectorAll(".tabla-productos").forEach((table) => {
    if (isMobile) {
      // Solo transponer si no está ya oculta
      if (table.style.display !== "none") {
        transponerTablaMovil(table);
      }
    } else {
      // Restaurar tabla original
      const nextWrapper = table.nextElementSibling;
      if (nextWrapper && nextWrapper.classList.contains("transposed-wrap")) {
        nextWrapper.remove();
      }
      table.style.display = "";
      delete table.dataset.mobileTransposed;
    }
  });
}

window.addEventListener("resize", aplicarLayoutTablasMobile);
document.addEventListener("DOMContentLoaded", aplicarLayoutTablasMobile);
