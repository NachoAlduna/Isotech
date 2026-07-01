export async function onRequest() {

    // URLs de Google Sheets
        const URL_PRODUCTOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBSt42SUIS5zukeNySEEM_qLAY24_bZKOAAgobUddWL9A7WC_7K_iHa3Gic3muWerqHlXvAW74BY7U/pub?gid=1162208317&single=true&output=csv";
        const URL_MODELOS   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBSt42SUIS5zukeNySEEM_qLAY24_bZKOAAgobUddWL9A7WC_7K_iHa3Gic3muWerqHlXvAW74BY7U/pub?gid=448006446&single=true&output=csv";
        const URL_KITS      = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBSt42SUIS5zukeNySEEM_qLAY24_bZKOAAgobUddWL9A7WC_7K_iHa3Gic3muWerqHlXvAW74BY7U/pub?gid=476796109&single=true&output=csv";

    // Leer los tres CSV en paralelo
    const [csvProductos, csvModelos, csvKits] = await Promise.all([
        fetch(URL_PRODUCTOS).then(r => r.text()),
        fetch(URL_MODELOS).then(r => r.text()),
        fetch(URL_KITS).then(r => r.text())
    ]);

    // Conversor CSV → JSON
    function csvToJson(csv) {

        const lineas = csv.trim().split(/\r?\n/);

        const headers = lineas[0]
            .split(",")
            .map(h => h.trim());

        return lineas.slice(1).map(linea => {

            const valores = linea.split(",");

            const obj = {};

            headers.forEach((header, i) => {
                obj[header] = (valores[i] || "").trim();
            });

            return obj;

        });

    }

    const productos = csvToJson(csvProductos);
    const modelos = csvToJson(csvModelos);
    const kits = csvToJson(csvKits);

    // Agrupar modelos y kits dentro de cada producto
    productos.forEach(producto => {

        producto.modelos = modelos.filter(
            modelo => modelo.producto === producto.id
        );

        producto.kits = kits.filter(
            kit => kit.producto === producto.id
        );

    });

    return Response.json(
        {
            productos
        },
        {
            headers: {
                "Cache-Control": "public, max-age=1800"
            }
        }
    );

}