async function cargarProductos() {

    const respuesta = await fetch("/api/calderas");

    const data = await respuesta.json();

    const contenedor = document.getElementById("productos");

    contenedor.innerHTML = "";

    data.productos.forEach(producto => {

        contenedor.innerHTML += crearProducto(producto);

    });

}


function crearProducto(producto){

return `

<div class="producto">

<div class="row g-5 align-items-start">

<div class="col-lg-3">

<img
src="${producto.imagen}"
class="img-fluid">

<h2>

${producto.nombre}

</h2>

<p class="text-muted">

${producto.descripcion}

</p>

<a

href="${producto.ficha}"

target="_blank"

class="btn btn-danger w-100">

Ficha Técnica

</a>

</div>

<div class="col-lg-9">

${crearTablaModelos(producto.modelos)}

${producto.kits.length ? crearTablaKits(producto.kits):""}

</div>

</div>

</div>

`;

}
function crearTablaModelos(modelos){

return `

<div class="table-responsive">

<table class="table tabla-productos table-bordered">

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

${modelos.map(m=>`

<tr>

<td>

<strong>${m.modelo}</strong>

</td>

<td>${m.q_lmin||"-"}</td>

<td>${m.potencia_80_60||"-"}</td>

<td>${m.potencia_50_30||"-"}</td>

<td>${m.potencia_acs||"-"}</td>

<td>${m.m2_max||"-"}</td>

<td>

<strong>

$${Number(m.precio_con_iva).toLocaleString("es-CL")}

</strong>

</td>

</tr>

`).join("")}

</tbody>

</table>

</div>

`;

}
function crearTablaKits(kits){

return `

<h4 class="kit-title">

Kit de Escape

</h4>

<div class="table-responsive">

<table class="table tabla-productos table-bordered">

<thead>

<tr>

<th>Tipo</th>

<th>Largo</th>

<th>Ø</th>

<th>Precio</th>

</tr>

</thead>

<tbody>

${kits.map(k=>`

<tr>

<td>${k.nombre}</td>

<td>${k.largo} m</td>

<td>${k.diametro} mm</td>

<td>

<strong>

$${Number(k.precio_con_iva).toLocaleString("es-CL")}

</strong>

</td>

</tr>

`).join("")}

</tbody>

</table>

</div>

`;

}

cargarProductos();