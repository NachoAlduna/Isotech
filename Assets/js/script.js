window.addEventListener("scroll", function () {
  const header = document.getElementById("siteHeader");

  if (window.scrollY > 80) {
    header.classList.add("header-scrolled");
  } else {
    header.classList.remove("header-scrolled");
  }
});

function transponerTablaMovil(table) {
  const originalHeaderCells = Array.from(table.querySelectorAll("thead th"));
  const rows = Array.from(table.querySelectorAll("tbody tr")).map((tr) =>
    Array.from(tr.children).map((cell) => (cell.textContent || "").trim()),
  );

  if (!originalHeaderCells.length || !rows.length) return;

  const modelNames = originalHeaderCells
    .map((cell) => (cell.textContent || "").trim())
    .filter((name, index, arr) => {
      if (index === 0) {
        return !name || !["modelo", "model"].includes(name.toLowerCase());
      }
      return true;
    });

  if (!modelNames.length) return;

  const wrapper = document.createElement("div");
  wrapper.className = "table-responsive transposed-wrap";

  const transposed = document.createElement("table");
  transposed.className = `${table.className} mobile-transposed`;

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const blankCell = document.createElement("th");
  blankCell.textContent = "";
  headRow.appendChild(blankCell);

  modelNames.forEach((name) => {
    const th = document.createElement("th");
    th.textContent = name || "-";
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  transposed.appendChild(thead);

  const tbody = document.createElement("tbody");

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    const labelCell = document.createElement("th");
    labelCell.textContent = row[0] || "-";
    tr.appendChild(labelCell);

    modelNames.forEach((_, colIndex) => {
      const valueCell = document.createElement("td");
      valueCell.textContent = row[colIndex + 1] || "-";
      tr.appendChild(valueCell);
    });

    tbody.appendChild(tr);
  });

  transposed.appendChild(tbody);
  wrapper.appendChild(transposed);

  const parent = table.parentElement;
  if (!parent) return;

  const existingWrapper = parent.querySelector(".transposed-wrap");
  if (existingWrapper) {
    existingWrapper.remove();
  }

  table.style.display = "none";
  parent.insertBefore(wrapper, table.nextSibling);
  table.dataset.mobileTransposed = "true";
}

function aplicarLayoutTablasMobile() {
  const isMobile = window.innerWidth <= 767.98;

  document.querySelectorAll(".tabla-productos").forEach((table) => {
    if (isMobile) {
      if (!table.dataset.mobileTransposed) {
        transponerTablaMovil(table);
      }
    } else {
      const nextWrapper = table.nextElementSibling;
      if (
        nextWrapper &&
        nextWrapper.classList &&
        nextWrapper.classList.contains("transposed-wrap")
      ) {
        nextWrapper.remove();
      }
      table.style.display = "";
      delete table.dataset.mobileTransposed;
    }
  });
}

window.addEventListener("resize", aplicarLayoutTablasMobile);
document.addEventListener("DOMContentLoaded", aplicarLayoutTablasMobile);
