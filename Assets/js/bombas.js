// js/bombas.js
// Usar en cada página de subcategoría:
//   <script src="/js/bombas.js" data-categoria="superficie"></script>
// O definir window.CATEGORIA antes de cargar el script

(async function () {

    // ── Detectar categoría desde atributo del script o variable global ────────
    const scriptTag = document.currentScript;
    const CATEGORIA = (scriptTag && scriptTag.dataset.categoria)
        || window.CATEGORIA
        || null;

    if (!CATEGORIA) {
        console.error("bombas.js: define data-categoria en el tag <script> o window.CATEGORIA");
        return;
    }

    // ── Columna que se resalta en rojo (DNxDN, DN x DN, DN) ──────────────────
    const COLUMNAS_RESALTADAS = ["DNxDN", "DN x DN", "DN", "Conexión"];

    // ── Fetch al Worker ───────────────────────────────────────────────────────
    async function cargarProductos() {
        const contenedor = document.getElementById("productos");
        if (!contenedor) return;

        try {
            const respuesta = await fetch(`/api/bombas/${CATEGORIA}`);
            if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

            const data = await respuesta.json();

            contenedor.innerHTML = "";
            data.productos.forEach(producto => {
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
                    ${producto.ficha_tecnica ? `
                    <a href="${producto.ficha_tecnica}"
                       target="_blank"
                       class="btn btn-danger btn-sm w-100">
                        Ficha Técnica
                    </a>` : ""}
                </div>

                <div class="col-lg-9">
                    ${crearTabla(producto.modelos, columnas)}
                </div>

            </div>
        </div>`;
    }

    // ── Tabla dinámica: headers desde columnas del JSON ───────────────────────
    function crearTabla(modelos, columnas) {
        if (!modelos || modelos.length === 0) {
            return `<p class="text-muted small">Sin modelos disponibles.</p>`;
        }

        const thead = columnas.map(col => `<th>${col}</th>`).join("");

        const tbody = modelos.map(modelo => {
            const celdas = columnas.map(col => {
                const valor = modelo[col] ?? "-";
                const esResaltada = COLUMNAS_RESALTADAS.includes(col);
                const esPrecio    = col.toLowerCase().includes("precio");

                if (esResaltada) {
                    return `<td class="text-danger fw-semibold">${valor || "-"}</td>`;
                }
                if (esPrecio) {
                    return `<td><strong>${formatearPrecio(valor)}</strong></td>`;
                }
                return `<td>${valor || "-"}</td>`;
            }).join("");

            return `<tr>${celdas}</tr>`;
        }).join("");

        // Repetir headers al pie (igual que el WordPress original)
        const tfoot = columnas.map(col => `<th>${col}</th>`).join("");

        return `
        <div class="table-responsive">
            <table class="table tabla-productos table-bordered table-sm">
                <thead>
                    <tr>${thead}</tr>
                </thead>
                <tbody>
                    ${tbody}
                </tbody>
                <tfoot>
                    <tr>${tfoot}</tr>
                </tfoot>
            </table>
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
