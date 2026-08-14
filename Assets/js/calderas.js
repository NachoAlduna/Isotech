// Assets/js/calderas.js

document.addEventListener("DOMContentLoaded", cargarProductos);

async function cargarProductos() {
  const contenedor = document.getElementById("productos");
  if (!contenedor) return;

  try {
    const respuesta = await fetch("/api/calderas");
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

    const data = await respuesta.json();

    contenedor.innerHTML = "";
    data.productos.forEach((producto) => {
      contenedor.innerHTML += crearProducto(producto);
    });
  } catch (err) {
    console.error("Error cargando calderas:", err);
    const contenedor = document.getElementById("productos");
    if (contenedor) {
      contenedor.innerHTML = `
                <div class="alert alert-danger">
                    Error cargando los productos. Intente nuevamente.
                </div>`;
    }
  }
}

function crearProducto(producto) {
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
                ${crearBotonesFicha(producto.fichas)}
            </div>

            <div class="col-lg-9">
                ${crearTablaModelos(producto.modelos)}
                ${producto.kits && producto.kits.length ? crearTablaKits(producto.kits) : ""}
            </div>

        </div>
    </div>`;
}

// ── Fichas técnicas — botón simple o dropdown ─────────────────────────────────
function crearBotonesFicha(fichas) {
  if (!fichas || fichas.length === 0) return "";

  if (fichas.length === 1) {
    return `
        <a href="${fichas[0].url}"
           target="_blank"
           class="btn btn-danger btn-sm w-100">
            <i class="bi bi-file-earmark-pdf me-1"></i>
            ${fichas[0].nombre}
        </a>`;
  }

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

// ── Tabla de modelos ──────────────────────────────────────────────────────────
function crearTablaModelos(modelos) {
  if (!modelos || modelos.length === 0) {
    return `<p class="text-muted small">Sin modelos disponibles.</p>`;
  }

  const tbody = modelos
    .map(
      (m) => `
        <tr>
            <td><strong>${m.modelo || "-"}</strong></td>
            <td>${m.q_lmin || "-"}</td>
            <td>${m.potencia_80_60 || "-"}</td>
            <td>${m.potencia_50_30 || "-"}</td>
            <td>${m.potencia_acs || "-"}</td>
            <td>${m.m2_max || "-"}</td>
            <td><strong>${formatearPrecio(m.precio_con_iva)}</strong></td>
        </tr>`,
    )
    .join("");

  return `
    <div class="table-responsive">
        <table class="table tabla-productos table-bordered mb-1">
            <thead>
                <tr>
                    <th>Modelo</th>
                    <th>Q<br><small>L/min</small></th>
                    <th>80/60°C</th>
                    <th>50/30°C</th>
                    <th>ACS</th>
                    <th>m²</th>
                    <th>Precio</th>
                </tr>
            </thead>
            <tbody>
                ${tbody}
            </tbody>
        </table>
        <p class="text-muted small mb-0">Precios con IVA</p>
    </div>`;
}

// ── Tabla de kits de escape ───────────────────────────────────────────────────
function crearTablaKits(kits) {
  const tbody = kits
    .map(
      (k) => `
        <tr>
            <td>${k.nombre || "-"}</td>
            <td>${k.largo ? k.largo + " m" : "-"}</td>
            <td>${k.diametro ? k.diametro + " mm" : "-"}</td>
            <td><strong>${formatearPrecio(k.precio_con_iva)}</strong></td>
        </tr>`,
    )
    .join("");

  return `
    <h4 class="kit-title mt-4">Kit de Escape</h4>
    <div class="table-responsive">
        <table class="table tabla-productos table-bordered mb-1">
            <thead>
                <tr>
                    <th>Tipo</th>
                    <th>Largo</th>
                    <th>Ø</th>
                    <th>Precio</th>
                </tr>
            </thead>
            <tbody>
                ${tbody}
            </tbody>
        </table>
        <p class="text-muted small mb-0">Precios con IVA</p>
    </div>`;
}

// ── Formatear precio ──────────────────────────────────────────────────────────
function formatearPrecio(valor) {
  if (!valor || String(valor).trim() === "") return "-";
  if (String(valor).toUpperCase() === "CONSULTAR") return "CONSULTAR";
  if (String(valor).startsWith("$")) return valor;

  const num = Number(String(valor).replace(/\./g, "").replace(",", "."));
  if (!isNaN(num)) return `$${num.toLocaleString("es-CL")}`;

  return valor;
}
