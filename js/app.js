const config = {
    rutaCSV: './csv/MasyMas_OFE_Auto(Listado_prod).csv',
    duracionOferta: 10000,
    folderAssets: './assets/'
};

let listaOfertas = [];
let indiceActual = 0;

// Referencias a los vídeos fijos en RAM
const vidEntrada = document.getElementById('video-entrada');
const vidSalida = document.getElementById('video-salida');
const bgMosaico = document.getElementById('bg-mosaico');

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
    // Calculamos cuál será la siguiente oferta
    const siguienteIndice = (indiceActual + 1) % listaOfertas.length;

    // --- 00:00 a 00:01 - ENTRADA ---
    // Ocultamos el video de salida anterior para limpiar pantalla
    vidSalida.style.opacity = 0; 
    vidSalida.classList.remove('wipe-in');

    // Preparamos y lanzamos el video de entrada (ya está en RAM)
    vidEntrada.style.opacity = 1;
    vidEntrada.currentTime = 0; // Lo rebobinamos
    
    // TRUCO VITAL: Forzar al navegador a reiniciar la animación CSS (Reflow)
    vidEntrada.classList.remove('wipe-out');
    void vidEntrada.offsetWidth; 
    vidEntrada.classList.add('wipe-out');
    
    vidEntrada.play();

    // Inyectamos los datos en el HTML mientras el video tapa la pantalla
    prepararContenido(datos);

    // --- 00:01 - MOSTRAR ELEMENTOS ---
    setTimeout(() => {
        // Arrancamos el fondo (si es la primera vez lo arranca, si no, ya está rodando en bucle)
        bgMosaico.style.opacity = 1;
        if(bgMosaico.paused) bgMosaico.play();

        // Panel Cristal
        document.getElementById('glass-panel').classList.add('show');
        
        // Escribir Fecha
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

        // OPTIMIZACIÓN DE MEMORIA: Mientras el usuario mira el precio, 
        // descargamos en modo "fantasma" la foto de la SIGUIENTE oferta.
        preCargarImagen(listaOfertas[siguienteIndice]);
    }, 1800);

    // --- 00:09 a 00:10 - SALIDA ---
    setTimeout(() => {
        vidSalida.style.opacity = 1;
        vidSalida.currentTime = 0; // Lo rebobinamos

        // TRUCO VITAL: Reflow de animación
        vidSalida.classList.remove('wipe-in');
        void vidSalida.offsetWidth;
        vidSalida.classList.add('wipe-in');
        
        vidSalida.play();
    }, 9000);

    // --- 00:10 - SIGUIENTE ---
    setTimeout(() => {
        indiceActual = siguienteIndice;
        resetearAnimaciones();
        mostrarOferta(listaOfertas[indiceActual]);
    }, 10000);
}

// FUNCIONES AUXILIARES

// Descarga la imagen en caché sin mostrarla
function preCargarImagen(datosSiguiente) {
    if (datosSiguiente && datosSiguiente.Artículo) {
        const imgPreload = new Image();
        imgPreload.src = `${config.folderAssets}${datosSiguiente.Artículo}.png`;
    }
}

function prepararContenido(d) {
    document.getElementById('foto-producto').src = `${config.folderAssets}${d.Artículo}.png`;

    let precioFull = d.Precio || d.Acumulas || "0,00";
    let partes = precioFull.replace('€', '').trim().split(',');
    document.getElementById('precio-entero').innerText = partes[0];
    document.getElementById('precio-decimal').innerText = partes[1] || "00";

    const sellosCont = document.getElementById('contenedor-sellos');
    sellosCont.innerHTML = '';
    if (d.Sello) {
        d.Sello.split(',').forEach(s => {
            const img = document.createElement('img');
            img.src = `${config.folderAssets}${s.trim()}.png`;
            sellosCont.appendChild(img);
        });
    }

    const descCont = document.getElementById('descripcion-prod');
    let titulo = "", subtitulo = "";

    if (d.Marca && d.Marca.trim() !== "") {
        titulo = d.Marca.toUpperCase();
        subtitulo = d.Descripción.replace(new RegExp(d.Marca, 'gi'), '').trim();
    } else {
        let palabras = d.Descripción.split(' ');
        titulo = palabras.filter(p => p === p.toUpperCase() && p.length > 2).join(' ');
        subtitulo = d.Descripción.replace(titulo, '').trim();
    }

    descCont.innerHTML = `<div class="tit">${titulo}</div><div class="sub">${formatearSubtitulo(subtitulo)}</div>`;
}

function formatearSubtitulo(txt) {
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
