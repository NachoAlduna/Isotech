// functions/api/bombas/[categoria].js
// Rutas:
//   /api/bombas/superficie
//   /api/bombas/multietapa
//   /api/bombas/sumergibles
//   /api/bombas/hidroneumaticos
//   /api/bombas/equipos-fuerza

const SHEETS = {
    superficie: {
        productos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRanwYQjb-Wy9oobfhVSr_Keu3guc9_GGINOmFaCFIkCPP9m7eUNQZ-nuxWwDiJRoAREMWPA_KpFE2g/pub?gid=1431501488&single=true&output=csv",
        detalle:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vRanwYQjb-Wy9oobfhVSr_Keu3guc9_GGINOmFaCFIkCPP9m7eUNQZ-nuxWwDiJRoAREMWPA_KpFE2g/pub?gid=1011480215&single=true&output=csv",
    },
    multietapa: {
        productos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRanwYQjb-Wy9oobfhVSr_Keu3guc9_GGINOmFaCFIkCPP9m7eUNQZ-nuxWwDiJRoAREMWPA_KpFE2g/pub?gid=91093468&single=true&output=csv",
        detalle:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vRanwYQjb-Wy9oobfhVSr_Keu3guc9_GGINOmFaCFIkCPP9m7eUNQZ-nuxWwDiJRoAREMWPA_KpFE2g/pub?gid=1639377483&single=true&output=csv",
    },
    sumergibles: {
        productos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRanwYQjb-Wy9oobfhVSr_Keu3guc9_GGINOmFaCFIkCPP9m7eUNQZ-nuxWwDiJRoAREMWPA_KpFE2g/pub?gid=772362966&single=true&output=csv",
        detalle:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vRanwYQjb-Wy9oobfhVSr_Keu3guc9_GGINOmFaCFIkCPP9m7eUNQZ-nuxWwDiJRoAREMWPA_KpFE2g/pub?gid=621038868&single=true&output=csv",
    },
    hidroneumaticos: {
        productos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRanwYQjb-Wy9oobfhVSr_Keu3guc9_GGINOmFaCFIkCPP9m7eUNQZ-nuxWwDiJRoAREMWPA_KpFE2g/pub?gid=1204448568&single=true&output=csv",
        detalle:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vRanwYQjb-Wy9oobfhVSr_Keu3guc9_GGINOmFaCFIkCPP9m7eUNQZ-nuxWwDiJRoAREMWPA_KpFE2g/pub?gid=8244479&single=true&output=csv",
    },
    "equipos-fuerza": {
        productos: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRanwYQjb-Wy9oobfhVSr_Keu3guc9_GGINOmFaCFIkCPP9m7eUNQZ-nuxWwDiJRoAREMWPA_KpFE2g/pub?gid=614487482&single=true&output=csv",
        detalle:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vRanwYQjb-Wy9oobfhVSr_Keu3guc9_GGINOmFaCFIkCPP9m7eUNQZ-nuxWwDiJRoAREMWPA_KpFE2g/pub?gid=1345040870&single=true&output=csv",
    },
};

// ─── CSV → JSON con soporte de comas dentro de comillas ───────────────────────
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

function csvToJson(csv) {
    const lineas = csv.trim().split(/\r?\n/);

    // Filas 1 y 2 son metadata (título y nota)
    // Los headers reales están en la fila 3 (índice 2)
    const headers = parseCsvLine(lineas[2]);

    return lineas.slice(3)
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

    try {
        const [csvProductos, csvDetalle] = await Promise.all([
            fetch(urls.productos).then(r => r.text()),
            fetch(urls.detalle).then(r => r.text()),
        ]);

        const productos  = csvToJson(csvProductos);
        const filaDetalle = csvToJson(csvDetalle);

        // Columnas de la tabla = headers del detalle sin producto_id
        const columnas = filaDetalle.length > 0
            ? Object.keys(filaDetalle[0]).filter(k => k !== "producto_id")
            : [];

        // Agrupar modelos dentro de cada producto
        productos.forEach(producto => {
            producto.modelos = filaDetalle
                .filter(fila => fila.producto_id === producto.id)
                .map(fila => {
                    const modelo = {};
                    columnas.forEach(col => {
                        modelo[col] = fila[col] ?? "";
                    });
                    return modelo;
                });
        });

        return Response.json(
            { categoria, columnas, productos },
            {
                headers: {
                    "Cache-Control": "public, max-age=1800",
                    "Access-Control-Allow-Origin": "*",
                },
            }
        );

    } catch (err) {
        return new Response(
            JSON.stringify({ error: "Error leyendo el Sheet", detalle: err.message }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
