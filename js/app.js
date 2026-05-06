const config = {
    rutaCSV: './csv/MasyMas_OFE_Auto(Listado_prod).csv',
    duracionOferta: 10000,
    folderAssets: './assets/'
};

let listaOfertas = [];
let indiceActual = 0;

// Cargar Datos
Papa.parse(config.rutaCSV, {
    download: true,
    delimiter: ";",
    header: true,
    encoding: "UTF-8",
    complete: (results) => {
        listaOfertas = results.data.filter(f => f.Descripción || f.Marca);
        iniciarCiclo();
    }
});

async function iniciarCiclo() {
    if (listaOfertas.length === 0) return;
    mostrarOferta(listaOfertas[indiceActual]);
}

function mostrarOferta(datos) {
    const videoTrans = document.getElementById('video-transicion');
    const bgMosaico = document.getElementById('bg-mosaico');

    // --- 00:00 a 00:01 - ENTRADA ---
    // Ponemos el video de entrada y le decimos que se vaya borrando (wipe-out)
    videoTrans.src = `${config.folderAssets}cortinilla_entrada.mp4`;
    videoTrans.classList.remove('wipe-in');
    videoTrans.classList.add('wipe-out');
    videoTrans.play();

    // Preparar contenido oculto mientras el video aún tapa la pantalla
    prepararContenido(datos);

    // --- 00:01 - MOSTRAR ELEMENTOS (El video de entrada acaba de desaparecer) ---
    setTimeout(() => {
        // Arrancamos el mosaico del fondo
        bgMosaico.src = `${config.folderAssets}cortinilla_fondo_mosaico.mp4`;
        bgMosaico.style.opacity = 1;
        bgMosaico.play();

        // Subimos el Panel de Cristal
        document.getElementById('glass-panel').classList.add('show');
        
        // Escribimos la Fecha
        escribirTexto(document.getElementById('fecha-validez'), datos["Fecha de vigencia"] || "");
    }, 1000);

    // --- 00:01.5 - SUBIR PRODUCTO ---
    setTimeout(() => {
        const prod = document.getElementById('bloque-producto');
        prod.style.transform = "translateY(0)";
        prod.style.opacity = "1";
    }, 1500);

    // --- 00:01.8 - ANIMAR PRECIO ---
    setTimeout(() => {
        document.getElementById('caja-precio').classList.add('show');
        const entero = document.getElementById('precio-entero');
        const decimal = document.getElementById('precio-decimal');
        escribirTexto(entero, entero.innerText, true);
        escribirTexto(decimal, decimal.innerText, true);
    }, 1800);

    // --- 00:09 a 00:10 - SALIDA ---
    setTimeout(() => {
        // Ponemos el video de salida y le decimos que vaya tapando la pantalla (wipe-in)
        videoTrans.src = `${config.folderAssets}cortinilla_salida.mp4`;
        videoTrans.classList.remove('wipe-out');
        videoTrans.classList.add('wipe-in');
        videoTrans.play();
    }, 9000);

    // --- 00:10 - SIGUIENTE ---
    setTimeout(() => {
        indiceActual = (indiceActual + 1) % listaOfertas.length;
        resetearAnimaciones();
        
        // Al volver a llamar a mostrarOferta, el nuevo video de entrada 
        // reemplazará al de salida, asegurando que siempre hay video en pantalla en la transición.
        mostrarOferta(listaOfertas[indiceActual]);
    }, 10000);
}
function prepararContenido(d) {
    // 1. Imagen Producto
    document.getElementById('foto-producto').src = `${config.folderAssets}${d.Artículo}.png`;

    // 2. Precio
    let precioFull = d.Precio || d.Acumulas || "0,00";
    let partes = precioFull.replace('€', '').trim().split(',');
    document.getElementById('precio-entero').innerText = partes[0];
    document.getElementById('precio-decimal').innerText = partes[1] || "00";

    // 3. Sellos
    const sellosCont = document.getElementById('contenedor-sellos');
    sellosCont.innerHTML = '';
    if (d.Sello) {
        d.Sello.split(',').forEach(s => {
            const img = document.createElement('img');
            img.src = `${config.folderAssets}${s.trim()}.png`;
            sellosCont.appendChild(img);
        });
    }

    // 4. Lógica de Descripción / Marca
    const descCont = document.getElementById('descripcion-prod');
    let titulo = "", subtitulo = "";

    if (d.Marca && d.Marca.trim() !== "") {
        titulo = d.Marca.toUpperCase();
        subtitulo = d.Descripción.replace(new RegExp(d.Marca, 'gi'), '').trim();
    } else {
        // Si no hay marca, buscamos la parte en mayúsculas de la descripción
        let palabras = d.Descripción.split(' ');
        titulo = palabras.filter(p => p === p.toUpperCase() && p.length > 2).join(' ');
        subtitulo = d.Descripción.replace(titulo, '').trim();
    }

    descCont.innerHTML = `<div class="tit">${titulo}</div><div class="sub">${formatearSubtitulo(subtitulo)}</div>`;
}

function formatearSubtitulo(txt) {
    // Máximo 20 caracteres por línea sin cortar palabras
    let palabras = txt.split(' ');
    let lineas = [], lineaActual = "";
    palabras.forEach(p => {
        if ((lineaActual + p).length > 20) {
            lineas.push(lineaActual);
            lineaActual = p + " ";
        } else {
            lineaActual += p + " ";
        }
    });
    lineas.push(lineaActual);
    return lineas.join('<br>');
}

function escribirTexto(elemento, texto, conEscala = false) {
    elemento.innerHTML = '';
    texto.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.innerText = char;
        span.className = 'char';
        elemento.appendChild(span);
        setTimeout(() => span.classList.add('visible'), i * 50);
    });
}

function resetearAnimaciones() {
    document.getElementById('glass-panel').classList.remove('show');
    document.getElementById('caja-precio').classList.remove('show');
    document.getElementById('bloque-producto').style.opacity = "0";
    document.getElementById('bloque-producto').style.transform = "translateY(100px)";
}
