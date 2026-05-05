// La ruta asume que app.js se ejecuta desde index.html en la raíz
const rutaCSV = './csv/MasyMas_OFE_Auto(Listado_prod).csv';
const contenedor = document.getElementById('contenedor-productos');

// Usamos PapaParse para leer el archivo local (o de servidor)
Papa.parse(rutaCSV, {
    download: true,       // Va a buscar el archivo a la ruta indicada
    delimiter: ";",       // Sabemos que tu separador es ;
    header: true,         // Usa la primera fila (Sección, Marca, etc) como claves
    skipEmptyLines: true, // Ignora saltos de línea finales
    complete: function(resultados) {
        // resultados.data es un array con todos tus productos
        pintarProductos(resultados.data);
    },
    error: function(error) {
        contenedor.innerHTML = `<p style="color:red; text-align:center; width:100%;">
            Error al cargar el CSV. Recuerda abrir el archivo con Live Server o un servidor local.
        </p>`;
        console.error(error);
    }
});

function pintarProductos(productos) {
    // Vaciamos el texto de "Cargando..."
    contenedor.innerHTML = '';

    productos.forEach(producto => {
        // Validamos que haya descripción (a veces hay líneas residuales en el CSV sin nombre)
        if (!producto["Descripción"] || producto["Descripción"].trim() === '') return;

        // Limpiamos un poco los datos en caso de que vengan vacíos en el Excel
        const marca = producto["Marca"] ? producto["Marca"] : "Sin Marca";
        const descripcion = producto["Descripción"];
        const precio = producto["Precio"] ? producto["Precio"] : "Consultar precio";
        const articuloId = producto["Artículo"] || "N/A";
        const vigencia = producto["Fecha de vigencia"] || "Hasta fin de existencias";

        // Creamos el div de la tarjeta
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta');

        // Metemos el contenido HTML a la tarjeta con interpolación de variables ${...}
        tarjeta.innerHTML = `
            <div>
                <div class="tarjeta-marca">${marca}</div>
                <h2 class="tarjeta-titulo">${descripcion}</h2>
            </div>
            
            <div>
                <div class="tarjeta-precio">${precio}</div>
                <div class="tarjeta-footer">
                    <p><strong>Ref:</strong> ${articuloId}</p>
                    <p class="tarjeta-vigencia">⏳ ${vigencia}</p>
                </div>
            </div>
        `;

        // Agregamos la tarjeta terminada al contenedor del HTML
        contenedor.appendChild(tarjeta);
    });
}