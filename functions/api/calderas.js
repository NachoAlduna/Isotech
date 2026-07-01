export async function onRequest() {

    const url =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRBSt42SUIS5zukeNySEEM_qLAY24_bZKOAAgobUddWL9A7WC_7K_iHa3Gic3muWerqHlXvAW74BY7U/pub?output=csv";

    const respuesta = await fetch(url);

    const csv = await respuesta.text();

    // luego convertiremos CSV → JSON

    return new Response(csv,{
        headers:{
            "Content-Type":"text/plain"
        }
    });

}