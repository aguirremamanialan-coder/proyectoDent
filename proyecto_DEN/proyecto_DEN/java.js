
const NUMERO_WHATSAPP = "";

const FRASES = ["saludables", "seguras", "con confianza", "para toda la familia"];

const $ = (id) => document.getElementById(id);
const reduceMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


function revisarImagenes() {
    document.querySelectorAll("img").forEach((img) => {
        const marcar = () => img.classList.add("sin-imagen");
        if (img.complete && img.naturalWidth === 0) marcar();
        img.addEventListener("error", marcar);
    });
}


function entrar() {
    const bienvenida = $("bienvenida");
    bienvenida.classList.add("saliendo");

    setTimeout(() => {
        bienvenida.classList.add("oculto");
        $("paginaPrincipal").classList.remove("oculto");
        window.scrollTo(0, 0);
        escribirTexto();
        marcarSeccionActiva();
    }, reduceMovimiento ? 0 : 450);
}

function escribirTexto() {
    const destino = $("textoAnimado");

    if (reduceMovimiento) {
        destino.textContent = FRASES[0];
        return;
    }

    let frase = 0;
    let letras = 0;
    let borrando = false;

    function paso() {
        const actual = FRASES[frase];
        letras += borrando ? -1 : 1;
        destino.textContent = actual.slice(0, letras);

        let espera = borrando ? 45 : 90;

        if (!borrando && letras === actual.length) {
            borrando = true;
            espera = 1600;
        } else if (borrando && letras === 0) {
            borrando = false;
            frase = (frase + 1) % FRASES.length;
            espera = 400;
        }

        setTimeout(paso, espera);
    }

    paso();
}

function configurarMenu() {
    const boton = $("menuBtn");
    const menu = $("menu");

    function cambiar(abierto) {
        menu.classList.toggle("abierto", abierto);
        boton.setAttribute("aria-expanded", String(abierto));
        boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
        boton.textContent = abierto ? "✕" : "☰";
    }

    boton.addEventListener("click", () => cambiar(!menu.classList.contains("abierto")));
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => cambiar(false)));
}
function marcarSeccionActiva() {
    const enlaces = document.querySelectorAll(".menu a");

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (!entrada.isIntersecting) return;
            enlaces.forEach((a) => {
                a.classList.toggle("activo", a.getAttribute("href") === "#" + entrada.target.id);
            });
        });
    }, { rootMargin: "-45% 0px -50% 0px" });

    document.querySelectorAll("#paginaPrincipal section[id]").forEach((s) => observador.observe(s));
}


function mostrarResultado(tipo, lineas, enlace) {
    const resultado = $("resultado");
    resultado.replaceChildren();

    const caja = document.createElement("div");
    caja.className = "mensaje " + tipo;

    lineas.forEach((texto) => {
        const p = document.createElement("p");
        p.textContent = texto;
        caja.appendChild(p);
    });

    if (enlace) caja.appendChild(enlace);

    resultado.appendChild(caja);
    caja.scrollIntoView({ behavior: reduceMovimiento ? "auto" : "smooth", block: "nearest" });
}

function configurarReserva() {
    const formulario = $("formReserva");

    // fecha mínima = hoy (en hora local)
    const ahora = new Date();
    const hoy = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);
    $("fecha").min = hoy;

    formulario.addEventListener("submit", (e) => {
        e.preventDefault();

        const cita = {
            nombre: $("nombre").value.trim(),
            celular: $("celular").value.replace(/\s/g, ""),
            fecha: $("fecha").value,
            hora: $("hora").value,
            servicio: $("servicio").value,
            observaciones: $("observaciones").value.trim()
        };

        if (!/^\d{7,10}$/.test(cita.celular)) {
            mostrarResultado("error", ["Escribe un numero de celular valido"]);
            return;
        }

        if (cita.fecha < hoy) {
            mostrarResultado("error", ["Elige una fecha desde hoy en adelante."]);
            return;
        }

        const fechaTexto = new Date(cita.fecha + "T00:00:00").toLocaleDateString("es-BO", {
            weekday: "long",
            day: "numeric",
            month: "long"
        });

        const lineas = [
            "Listo, " + cita.nombre + ". Recibimos tu solicitud.",
            cita.servicio + " · " + fechaTexto + ", " + cita.hora,
            "Te contactaremos al " + cita.celular + " para confirmar tu cita."
        ];

        let enlace = null;

        if (NUMERO_WHATSAPP) {
            const mensaje =
                "Hola, quiero reservar una cita en USMILE.\n" +
                "Nombre: " + cita.nombre + "\n" +
                "Celular: " + cita.celular + "\n" +
                "Especialidad: " + cita.servicio + "\n" +
                "Fecha: " + fechaTexto + ", " + cita.hora +
                (cita.observaciones ? "\nObservaciones: " + cita.observaciones : "");

            enlace = document.createElement("a");
            enlace.className = "boton";
            enlace.href = "https://wa.me/" + NUMERO_WHATSAPP + "?text=" + encodeURIComponent(mensaje);
            enlace.target = "_blank";
            enlace.rel = "noopener";
            enlace.textContent = "Enviar por WhatsApp";
        }

        mostrarResultado("exito", lineas, enlace);
        formulario.reset();
    });
}

revisarImagenes();
configurarMenu();
configurarReserva();
$("btnIniciar").addEventListener("click", entrar, { once: true });