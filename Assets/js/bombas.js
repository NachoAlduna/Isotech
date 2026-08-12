// functions/api/bombas/[categoria].js
// Rutas:
//   /api/bombas/superficie
//   /api/bombas/multietapa
//   /api/bombas/sumergibles
//   /api/bombas/hidroneumaticos
//   /api/bombas/equipos-fuerza

// ─── URLs Google Sheets por subcategoría ─────────────────────────────────────
// Reemplaza cada gid con el ID real de cada hoja publicada como CSV

const SHEETS = {
    superficie: {
        productos: "https://docs.google.com/spreadsheets/d/e/ID_DEL_SHEET/pub?gid=GID_SUP_PRODUCTOS&single=true&output=csv",
        detalle:   "https://docs.google.com/spreadsheets/d/e/ID_DEL_SHEET/pub?gid=GID_SUP_DETALLE&single=true&output=csv",
    },
    multietapa: {
        productos: "https://docs.google.com/spreadsheets/d/e/ID_DEL_SHEET/pub?gid=GID_MUL_PRODUCTOS&single=true&output=csv",
        detalle:   "https://docs.google.com/spreadsheets/d/e/ID_DEL_SHEET/pub?gid=GID_MUL_DETALLE&single=true&output=csv",
    },
    sumergibles: {
        productos: "https://docs.google.com/spreadsheets/d/e/ID_DEL_SHEET/pub?gid=GID_SUM_PRODUCTOS&single=true&output=csv",
        detalle:   "https://docs.google.com/spreadsheets/d/e/ID_DEL_SHEET/pub?gid=GID_SUM_DETALLE&single=true&output=csv",
    },
    hidroneumaticos: {
        productos: "https://docs.google.com/spreadsheets/d/e/ID_DEL_SHEET/pub?gid=GID_HID_PRODUCTOS&single=true&output=csv",
        detalle:   "https://docs.google.com/spreadsheets/d/e/ID_DEL_SHEET/pub?gid=GID_HID_DETALLE&single=true&output=csv",
    },
    "equipos-fuerza": {
        productos: "https://docs.google.com/spreadsheets/d/e/ID_DEL_SHEET/pub?gid=GID_EQF_PRODUCTOS&single=true&output=csv",
        detalle:   "https://docs.google.com/spreadsheets/d/e/ID_DEL_SHEET/pub?gid=GID_EQF_DETALLE&single=true&output=csv",
    },
};

// ─── CSV → JSON ───────────────────────────────────────────────────────────────
// Soporta campos con comas dentro de comillas dobles
function csvToJson(csv) {
    const lineas = csv.trim().split(/\r?\n/);
    const headers = parseCsvLine(lineas[0]);

    return lineas.slice(1)
        .filter(l => l.trim() !== "")
        .map(linea => {
            const valores = parseCsvLine(linea);
            const obj = {};
            headers.forEach((header, i) => {
                obj[header] = (valores[i] ?? "").trim();
            });
            return obj;
        });
}

function parseCsvLine(line) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function onRequest({ params }) {
    const categoria = params.categoria;
    const urls = SHEETS[categoria];

    if (!urls) {
        return new Response(
            JSON.stringify({ error: `Categoría '${categoria}' no encontrada` }),
            { status: 404, headers: { "Content-Type": "application/json" } }
        );
    }

    // Fetch ambos CSV en paralelo
    const [csvProductos, csvDetalle] = await Promise.all([
        fetch(urls.productos).then(r => r.text()),
        fetch(urls.detalle).then(r => r.text()),
    ]);

    const productos = csvToJson(csvProductos);
    const filaDetalle = csvToJson(csvDetalle);

    // Las columnas de la tabla vienen de los headers del CSV de detalle
    // excluyendo 'producto_id' que es solo el campo de join
    const todasLasColumnas = filaDetalle.length > 0
        ? Object.keys(filaDetalle[0]).filter(k => k !== "producto_id")
        : [];

    // Agrupar filas de detalle dentro de cada producto
    productos.forEach(producto => {
        producto.modelos = filaDetalle
            .filter(fila => fila.producto_id === producto.id)
            .map(fila => {
                // Retornar solo las columnas propias (sin producto_id)
                const modelo = {};
                todasLasColumnas.forEach(col => {
                    modelo[col] = fila[col] ?? "";
                });
                return modelo;
            });
    });

    return Response.json(
        {
            categoria,
            columnas: todasLasColumnas,   // el frontend las usa para construir el <thead>
            productos,
        },
        {
            headers: {
                "Cache-Control": "public, max-age=1800",
                "Access-Control-Allow-Origin": "*",
            },
        }
    );
}
