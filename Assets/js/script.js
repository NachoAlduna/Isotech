window.addEventListener("scroll", function () {
  const header = document.getElementById("siteHeader");

  if (window.scrollY > 80) {
    header.classList.add("header-scrolled");
  } else {
    header.classList.remove("header-scrolled");
  }
});

// Tabla transpuesta (mobile)
(function () {
  function buildTransposedWrapper(table) {
    const headers = Array.from(table.querySelectorAll("thead th")).map((th) =>
      th.textContent.trim(),
    );
    const bodyRows = Array.from(table.querySelectorAll("tbody tr"));
    if (bodyRows.length === 0) return null;

    const rowsData = bodyRows.map((tr) =>
      Array.from(tr.querySelectorAll("td,th")).map((cell) => cell.innerHTML),
    );

    const transposedTable = document.createElement("table");
    transposedTable.className = table.className + " transposed";

    const thead = document.createElement("thead");
    const headTr = document.createElement("tr");
    const emptyTh = document.createElement("th");
    emptyTh.innerHTML = "";
    headTr.appendChild(emptyTh);

    rowsData.forEach((cells) => {
      const th = document.createElement("th");
      th.innerHTML = cells[0] || "-";
      headTr.appendChild(th);
    });
    thead.appendChild(headTr);

    const tbody = document.createElement("tbody");

    headers.forEach((label, colIndex) => {
      const tr = document.createElement("tr");
      const th = document.createElement("th");
      th.innerHTML = label;
      tr.appendChild(th);

      rowsData.forEach((cells) => {
        const td = document.createElement("td");
        td.innerHTML = cells[colIndex] !== undefined ? cells[colIndex] : "-";
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    transposedTable.appendChild(thead);
    transposedTable.appendChild(tbody);

    const wrapper = document.createElement("div");
    wrapper.className = "table-responsive transposed-wrap";
    wrapper.appendChild(transposedTable);
    return wrapper;
  }

  function ensureTransposed() {
    const breakpoint = 768;
    const width = window.innerWidth || document.documentElement.clientWidth;
    document.querySelectorAll(".tabla-productos").forEach((origTable) => {
      const container =
        origTable.closest(".table-responsive") || origTable.parentElement;
      if (!container) return;

      if (width <= breakpoint) {
        if (origTable.dataset.transposed === "true") return;
        const transposedWrapper = buildTransposedWrapper(origTable);
        if (!transposedWrapper) return;
        container.style.display = "none";
        container.parentNode.insertBefore(
          transposedWrapper,
          container.nextSibling,
        );
        origTable.dataset.transposed = "true";
      } else {
        if (origTable.dataset.transposed !== "true") return;
        // remove the transposed wrapper and show original
        const next = container.nextSibling;
        if (
          next &&
          next.classList &&
          next.classList.contains("transposed-wrap")
        ) {
          next.parentNode.removeChild(next);
        }
        container.style.display = "";
        delete origTable.dataset.transposed;
      }
    });
  }

  window.addEventListener("resize", function () {
    // debounce
    clearTimeout(window.__transposeTimer);
    window.__transposeTimer = setTimeout(ensureTransposed, 120);
  });

  document.addEventListener("DOMContentLoaded", function () {
    // run after tables are rendered
    setTimeout(ensureTransposed, 250);
    // also observe DOM changes in case tables are injected later
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          ensureTransposed();
          break;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
