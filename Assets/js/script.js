window.addEventListener("scroll", function () {
  const header = document.getElementById("siteHeader");

  if (window.scrollY > 80) {
    header.classList.add("header-scrolled");
  } else {
    header.classList.remove("header-scrolled");
  }
});

function transponerTablaMovil(table) {
  const headerCells = Array.from(table.querySelectorAll("thead th"));
  const rows = Array.from(table.querySelectorAll("tbody tr")).map((tr) =>
    Array.from(tr.children).map((cell) => cell.innerHTML),
  );

  if (!headerCells.length || !rows.length) return;

  const parent = table.parentElement;
  if (!parent) return;

  const transposed = document.createElement("table");
  transposed.className = `${table.className} mobile-transposed`;

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const blankCell = document.createElement("th");
  blankCell.innerHTML = "";
  headRow.appendChild(blankCell);

  rows.forEach((row) => {
    const th = document.createElement("th");
    th.innerHTML = row[0] || "-";
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  transposed.appendChild(thead);

  const tbody = document.createElement("tbody");

  headerCells.forEach((headerCell, index) => {
    const tr = document.createElement("tr");
    const labelCell = document.createElement("th");
    labelCell.innerHTML = headerCell.textContent.trim() || "-";
    tr.appendChild(labelCell);

    rows.forEach((row) => {
      const valueCell = document.createElement("td");
      valueCell.innerHTML = row[index] || "-";
      tr.appendChild(valueCell);
    });

    tbody.appendChild(tr);
  });

  transposed.appendChild(tbody);
  table.dataset.mobileTransposed = "true";
  parent.replaceChild(transposed, table);
}

function restaurarTablaDesktop(table) {
  if (!table.dataset.mobileTransposed) return;
  const parent = table.parentElement;
  if (!parent) return;

  const original = document.createElement("table");
  original.className = table.className.replace(" mobile-transposed", "");
  original.innerHTML = table.dataset.originalHtml || "";
  parent.replaceChild(original, table);
  delete table.dataset.mobileTransposed;
}

function aplicarLayoutTablasMobile() {
  const isMobile = window.innerWidth <= 767.98;

  document.querySelectorAll(".tabla-productos").forEach((table) => {
    if (isMobile) {
      if (!table.dataset.mobileTransposed) {
        table.dataset.originalHtml = table.outerHTML;
        transponerTablaMovil(table);
      }
    } else if (table.dataset.mobileTransposed) {
      const tableOriginal = document.createElement("table");
      tableOriginal.className = table.className.replace(
        " mobile-transposed",
        "",
      );
      tableOriginal.innerHTML = table.dataset.originalHtml || "";
      table.parentElement.replaceChild(tableOriginal, table);
      delete tableOriginal.dataset.mobileTransposed;
    }
  });
}

window.addEventListener("resize", aplicarLayoutTablasMobile);
document.addEventListener("DOMContentLoaded", aplicarLayoutTablasMobile);
