// functions/api/calderas.js

const URL_PRODUCTOS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBSt42SUIS5zukeNySEEM_qLAY24_bZKOAAgobUddWL9A7WC_7K_iHa3Gic3muWerqHlXvAW74BY7U/pub?gid=1162208317&single=true&output=csv";
const URL_MODELOS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBSt42SUIS5zukeNySEEM_qLAY24_bZKOAAgobUddWL9A7WC_7K_iHa3Gic3muWerqHlXvAW74BY7U/pub?gid=448006446&single=true&output=csv";
const URL_KITS =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBSt42SUIS5zukeNySEEM_qLAY24_bZKOAAgobUddWL9A7WC_7K_iHa3Gic3muWerqHlXvAW74BY7U/pub?gid=476796109&single=true&output=csv";

// Soporta comas dentro de comillas (ej: descripciones largas)
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
  const headers = parseCsvLine(lineas[0]); // headers en fila 1, sin metadata
  return lineas
    .slice(1)
    .filter((l) => l.trim() !== "")
    .map((linea) => {
      const valores = parseCsvLine(linea);
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = (valores[i] ?? "").trim();
      });
      return obj;
    });
}

// Parsea ficha_tecnica en array { nombre, url }
function parsearFichas(fichaRaw) {
  if (!fichaRaw || !fichaRaw.trim()) return [];
  if (fichaRaw.includes("::")) {
    return fichaRaw.split("|").map((f) => {
      const [nombre, url] = f.split("::");
      return { nombre: nombre.trim(), url: url.trim() };
    });
  }
  return [{ nombre: "Ficha Técnica", url: fichaRaw.trim() }];
}

export async function onRequest() {
  const [csvProductos, csvModelos, csvKits] = await Promise.all([
    fetch(URL_PRODUCTOS).then((r) => r.text()),
    fetch(URL_MODELOS).then((r) => r.text()),
    fetch(URL_KITS).then((r) => r.text()),
  ]);

  const productos = csvToJson(csvProductos);
  const modelos = csvToJson(csvModelos);
  const kits = csvToJson(csvKits);

  productos.forEach((producto) => {
    producto.fichas = parsearFichas(producto.ficha_tecnica);
    producto.modelos = modelos.filter((m) => m.producto === producto.id);
    producto.kits = kits.filter((k) => k.producto === producto.id);
  });

  return Response.json(
    { productos },
    { headers: { "Cache-Control": "public, max-age=1800" } },
  );
}
