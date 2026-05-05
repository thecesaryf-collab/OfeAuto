// OJO: Asegúrate de que aquí las mayúsculas coincidan EXACTAMENTE con tu GitHub
const rutaCSV = './csv/MasyMas_OFE_Auto(Listado_prod).csv'; 
const contenedor = document.getElementById('contenedor-productos');

Papa.parse(rutaCSV, {
    download: true,
    delimiter: ";",
    header: true,
    skipEmptyLines: true,
    encoding: "UTF-8"
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
    contenedor.innerHTML = ''; // Limpiamos el mensaje

    if(productos.length === 0) {
        contenedor.innerHTML = '<p>No hay productos para mostrar.</p>';
        return;
    }

    productos.forEach(producto => {
        // 1. Sacamos un array con los nombres EXACTOS de las columnas que detecta tu CSV
        const columnas = Object.keys(producto);
        
        // 2. Buscamos las columnas por "trozos" de palabra para no fallar nunca
        const colDesc = columnas.find(c => c.toLowerCase().includes('escrip'));
        const colMarca = columnas.find(c => c.toLowerCase().includes('marca'));
        const colPrecio = columnas.find(c => c.toLowerCase().includes('precio'));
        const colAcumulas = columnas.find(c => c.toLowerCase().includes('acumula'));
        const colArticulo = columnas.find(c => c.toLowerCase().includes('art'));
        const colVigencia = columnas.find(c => c.toLowerCase().includes('vigencia'));

        // Extraemos la descripción usando la columna real que hemos encontrado
        const descripcion = colDesc ? producto[colDesc] : null;
        
        // Si la fila viene totalmente vacía o sin descripción, la saltamos
        if (!descripcion || String(descripcion).trim() === '') return;

        // Extraemos el resto de datos
        const marca = (colMarca && producto[colMarca].trim() !== '') ? producto[colMarca] : "Sin Marca";
        
        let precio = (colPrecio && producto[colPrecio].trim() !== '') ? producto[colPrecio] : null;
        if (!precio) {
            // Si el precio principal está vacío, probamos en la columna de al lado por si se movió
            precio = (colAcumulas && producto[colAcumulas].trim() !== '') ? producto[colAcumulas] : "Consultar precio";
        }

        const articuloId = colArticulo ? producto[colArticulo] : "N/A";
        const vigencia = colVigencia ? producto[colVigencia] : "Hasta fin de existencias";

        // 3. Pintamos la tarjeta
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
