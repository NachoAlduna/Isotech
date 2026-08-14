// js/bombas.js
// Usar en cada página de subcategoría:
//   <script src="/js/bombas.js" data-categoria="superficie"></script>
// O definir window.CATEGORIA antes de cargar el script

(async function () {
  // ── Detectar categoría desde atributo del script o variable global ────────
  const scriptTag = document.currentScript;
  const CATEGORIA =
    (scriptTag && scriptTag.dataset.categoria) || window.CATEGORIA || null;

  if (!CATEGORIA) {
    console.error(
      "bombas.js: define data-categoria en el tag <script> o window.CATEGORIA",
    );
    return;
  }

  // ── Columna que se resalta en rojo (DNxDN, DN x DN, DN) ──────────────────
  const COLUMNAS_RESALTADAS = [];

  // ── Fetch al Worker ───────────────────────────────────────────────────────
  async function cargarProductos() {
    const contenedor = document.getElementById("productos");
    if (!contenedor) return;

    try {
      const respuesta = await fetch(`/api/bombas/${CATEGORIA}`);
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

      const data = await respuesta.json();

      contenedor.innerHTML = "";
      data.productos.forEach((producto) => {
        contenedor.innerHTML += crearProducto(producto, data.columnas);
      });
    } catch (err) {
      console.error("Error cargando bombas:", err);
      const contenedor = document.getElementById("productos");
      if (contenedor) {
        contenedor.innerHTML = `
                    <div class="alert alert-danger">
                        Error cargando los productos. Intente nuevamente.
                    </div>`;
      }
    }
  }

  // ── Bloque de producto: foto + descripción + tabla ────────────────────────
  function crearProducto(producto, columnas) {
    return `
        <div class="producto mb-5">
            <div class="row g-5 align-items-start">

                <div class="col-lg-3 text-center">
                    <img
                        src="${producto.imagen}"
                        alt="${producto.nombre}"
                        class="img-fluid mb-3"
                        style="max-height:200px; object-fit:contain;">
                    <h2 class="h5 fw-bold text-decoration-underline">
                        ${producto.nombre}
                    </h2>
                    <p class="text-muted small text-start">
                        ${producto.descripcion}
                    </p>
                    ${crearBotonesficha(producto.fichas)}
                </div>

                <div class="col-lg-9">
                    ${crearTabla(producto.modelos, columnas)}
                </div>

            </div>
        </div>`;
  }
  //Formato de botones de ficha tecnica
  function crearBotonesficha(fichas) {
    if (!fichas || fichas.length === 0) return "";

    // Una sola ficha — botón directo
    if (fichas.length === 1) {
      return `
        <a href="${fichas[0].url}"
           target="_blank"
           class="btn btn-danger btn-sm w-100">
            <i class="bi bi-file-earmark-pdf me-1"></i>
            ${fichas[0].nombre}
        </a>`;
    }

    // Varias fichas — dropdown Bootstrap 5
    return `
    <div class="dropdown w-100">
        <button class="btn btn-danger btn-sm w-100 dropdown-toggle"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false">
            <i class="bi bi-file-earmark-pdf me-1"></i>
            Fichas Técnicas
        </button>
        <ul class="dropdown-menu w-100">
            ${fichas
              .map(
                (f) => `
            <li>
                <a class="dropdown-item d-flex align-items-center gap-2"
                   href="${f.url}"
                   target="_blank">
                    <i class="bi bi-file-earmark-arrow-down text-danger"></i>
                    ${f.nombre}
                </a>
            </li>`,
              )
              .join("")}
        </ul>
    </div>`;
  }
  // ── Tabla dinámica: headers desde columnas del JSON ───────────────────────
  function crearTabla(modelos, columnas) {
    if (!modelos || modelos.length === 0) {
      return `<p class="text-muted small">Sin modelos disponibles.</p>`;
    }

    const thead = columnas.map((col) => `<th>${col}</th>`).join("");

    const tbody = modelos
      .map((modelo) => {
        const celdas = columnas
          .map((col) => {
            const valor = modelo[col] ?? "-";
            const esResaltada = COLUMNAS_RESALTADAS.includes(col);
            const esPrecio = col.toLowerCase().includes("precio");

            if (esResaltada) {
              return `<td class="text-danger fw-semibold">${valor || "-"}</td>`;
            }
            if (esPrecio) {
              return `<td><strong>${formatearPrecio(valor)}</strong></td>`;
            }
            if (col === "Modelo") {
              return `<td><strong>${valor || "-"}</strong></td>`;
            }
            return `<td>${valor || "-"}</td>`;
          })
          .join("");

        return `<tr>${celdas}</tr>`;
      })
      .join("");

    return `
    <div class="table-responsive">
        <table class="table tabla-productos table-bordered mb-1">
            <thead>
                <tr>${thead}</tr>
            </thead>
            <tbody>
                ${tbody}
            </tbody>
        </table>
        <p class="text-muted small mb-0">Precios con IVA</p>
    </div>`;
  }

  // ── Formatear precio ──────────────────────────────────────────────────────
  function formatearPrecio(valor) {
    if (!valor || valor.trim() === "") return "-";
    if (valor.toUpperCase() === "CONSULTAR") return "CONSULTAR";

    // Si ya viene formateado con $ lo devolvemos tal cual
    if (valor.startsWith("$")) return valor;

    // Si es número lo formateamos
    const num = Number(valor.replace(/\./g, "").replace(",", "."));
    if (!isNaN(num)) return `$${num.toLocaleString("es-CL")}`;

    return valor;
  }

  // ── Arrancar ──────────────────────────────────────────────────────────────
  document.addEventListener("DOMContentLoaded", cargarProductos);
})();
