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
  const headerTexts = headerCells.map((h) => h.textContent.trim());
  const rows = Array.from(table.querySelectorAll("tbody tr")).map((tr) =>
    Array.from(tr.querySelectorAll("td,th")).map((cell) =>
      (cell.innerHTML || "").trim(),
    ),
  );

  if (!headerTexts.length || !rows.length) return;

  const parent = table.parentElement;
  if (!parent) return;

  // normalize row lengths to avoid desorden
  const columnCount = Math.max(
    headerTexts.length,
    ...rows.map((r) => r.length),
  );
  rows.forEach((r) => {
    while (r.length < columnCount) r.push("");
  });

  const wrapper = document.createElement("div");
  wrapper.className = "table-responsive transposed-wrap";

  const transposed = document.createElement("table");
  transposed.className = `${table.className} mobile-transposed`;

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  const blankCell = document.createElement("th");
  blankCell.innerHTML = "";
  headRow.appendChild(blankCell);

  // top row: model labels (first cell of each original row)
  rows.forEach((row) => {
    const th = document.createElement("th");
    th.innerHTML = row[0] || "-";
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  transposed.appendChild(thead);

  const tbody = document.createElement("tbody");

  headerTexts.forEach((label, index) => {
    const tr = document.createElement("tr");
    const labelCell = document.createElement("th");
    labelCell.innerHTML = label || "-";
    tr.appendChild(labelCell);

    rows.forEach((row) => {
      const valueCell = document.createElement("td");
      valueCell.innerHTML =
        row[index] !== undefined && row[index] !== null && row[index] !== ""
          ? row[index]
          : "-";
      tr.appendChild(valueCell);
    });

    tbody.appendChild(tr);
  });

  transposed.appendChild(tbody);
  wrapper.appendChild(transposed);

  // hide original table and insert wrapper after it (preserve original DOM)
  table.style.display = "none";
  table.parentElement.insertBefore(wrapper, table.nextSibling);
  table.dataset.mobileTransposed = "true";
  table.dataset.transposedWrapper = "true";
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
      // remove the transposed wrapper (inserted after original) and show original
      const maybeWrapper = table.nextSibling;
      if (
        maybeWrapper &&
        maybeWrapper.classList &&
        maybeWrapper.classList.contains("transposed-wrap")
      ) {
        maybeWrapper.parentElement.removeChild(maybeWrapper);
      }
      table.style.display = "";
      delete table.dataset.mobileTransposed;
      delete table.dataset.transposedWrapper;
    }
  });
}

window.addEventListener("resize", aplicarLayoutTablasMobile);
document.addEventListener("DOMContentLoaded", aplicarLayoutTablasMobile);
