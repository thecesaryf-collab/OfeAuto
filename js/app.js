// OJO: Asegúrate de que aquí las mayúsculas coincidan EXACTAMENTE con tu GitHub
const rutaCSV = './csv/MasyMas_OFE_Auto(Listado_prod).csv'; 
const contenedor = document.getElementById('contenedor-productos');

Papa.parse(rutaCSV, {
    download: true,
    delimiter: ";",
    header: true,
    skipEmptyLines: true,
    complete: function(resultados) {
        // ESTO ES MAGIA: Lo imprime en la consola para que podamos investigar
        console.log("¡CSV leído! Mira los datos aquí:", resultados.data);
        pintarProductos(resultados.data);
    },
    error: function(error) {
        console.error("Error crítico al leer el CSV:", error);
        contenedor.innerHTML = '<p style="color:red;">Error al cargar el archivo CSV. Revisa la ruta.</p>';
    }
});

function pintarProductos(productos) {
    contenedor.innerHTML = ''; // Limpiamos el mensaje de "Cargando..."

    if(productos.length === 0) {
        contenedor.innerHTML = '<p>El archivo CSV parece estar vacío o la ruta está mal.</p>';
        return;
    }

    productos.forEach(producto => {
        // 1. Truco anti-errores de Excel: Buscamos la descripción con o sin tilde rota
        const descripcion = producto["Descripción"] || producto["Descripcin"] || producto["Descripcion"];
        
        // Si de verdad no hay descripción, nos la saltamos
        if (!descripcion || descripcion.trim() === '') return;

        // 2. Recogemos el resto de datos
        const marca = producto["Marca"] && producto["Marca"].trim() !== '' ? producto["Marca"] : "Sin Marca";
        
        // 3. Truco por si el precio se ha desplazado a la columna "Acumulas"
        let precio = producto["Precio"];
        if (!precio || precio.trim() === '') {
            precio = producto["Acumulas"]; // Si Precio está vacío, miramos en Acumulas
        }
        if (!precio || precio.trim() === '') {
            precio = "Consultar"; // Si ambos están vacíos
        }

        const articuloId = producto["Artículo"] || "N/A";
        const vigencia = producto["Fecha de vigencia"] || "Consultar fechas";

        // 4. Creamos la tarjeta
        const tarjeta = document.createElement('div');
        tarjeta.classList.add('tarjeta');
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
        contenedor.appendChild(tarjeta);
    });
}
