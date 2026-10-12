// js/juego.js - Lógica Gamificada Offline con DUA, Audio Nativo y Evaluación de Maestría

// ==========================================
// 1. SISTEMA DE AUDIO NATIVO SINTÉTICO (WEB AUDIO API - 100% OFFLINE)
// ==========================================
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx && AudioContextClass) {
        audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSuccessSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "sine";
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(523.25, now); // Do5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // Mi5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // Sol5
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        osc.start(now);
        osc.stop(now + 0.45);
    } catch (e) {
        console.warn("Audio no soportado o bloqueado por el navegador:", e);
    }
}

function playErrorSound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "sawtooth";
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(220, now); // La3
        osc.frequency.setValueAtTime(164.81, now + 0.15); // Mi3
        
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        
        osc.start(now);
        osc.stop(now + 0.4);
    } catch (e) {
        console.warn("Audio no soportado:", e);
    }
}

function playVictorySound() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const notas = [523.25, 659.25, 783.99, 1046.50]; // Do, Mi, Sol, Do agudo
        const now = ctx.currentTime;
        notas.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            gain.gain.setValueAtTime(0.2, now + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);
            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.35);
        });
    } catch (e) {
        console.warn("Audio no soportado:", e);
    }
}

// ==========================================
// 2. INCLUSIÓN Y DUA: LECTURA DE PREGUNTAS EN VOZ ALTA (SPEECH SYNTHESIS EN PESOS)
// ==========================================

/**
 * Convierte números enteros a su equivalente en palabras en español.
 * Garantiza pronunciación 100% precisa y natural en cualquier motor TTS,
 * eliminando errores de lectura de puntos decimales o moneda.
 */
function numeroALetras(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) return '';
    if (n === 0) return 'cero';

    const unidades = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    function menores1000(num) {
        if (num === 0) return '';
        if (num === 100) return 'cien';
        let res = '';
        if (num >= 100) {
            res += centenas[Math.floor(num / 100)] + ' ';
            num %= 100;
        }
        if (num > 0) {
            if (num < 20) {
                res += unidades[num];
            } else if (num === 20) {
                res += 'veinte';
            } else if (num > 20 && num < 30) {
                const decs20 = ['', 'veintiún', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve'];
                res += decs20[num - 20];
            } else {
                const d = Math.floor(num / 10);
                const u = num % 10;
                res += decenas[d] + (u > 0 ? ' y ' + unidades[u] : '');
            }
        }
        return res.trim();
    }

    if (n < 1000) return menores1000(n);

    let res = '';
    const millones = Math.floor(n / 1000000);
    const miles = Math.floor((n % 1000000) / 1000);
    const resto = n % 1000;

    if (millones > 0) {
        if (millones === 1) res += 'un millón ';
        else res += menores1000(millones) + ' millones ';
    }

    if (miles > 0) {
        if (miles === 1) res += 'mil ';
        else res += menores1000(miles) + ' mil ';
    }

    if (resto > 0) {
        res += menores1000(resto);
    }

    return res.trim();
}

/**
 * Limpia y adapta el texto para que el sintetizador pronuncie correctamente
 * cantidades monetarias en pesos, cifras con separador de miles, operaciones matemáticas
 * y abreviaturas cotidianas (c/u, kg, /kg), evitando corromper palabras en español.
 */
function prepararTextoParaVoz(texto) {
    if (!texto) return "";
    let t = texto;

    // 1. Abreviaturas de unidades y comercio
    t = t.replace(/\bc\/u\b/gi, 'cada uno');
    t = t.replace(/\/kg\b/gi, ' por kilogramo');
    t = t.replace(/\bkg\b/gi, 'kilogramos');

    // 2. Moneda colombiana con signo $: $1.500, $20.000, $15.800.000
    t = t.replace(/\$\s*([0-9]+(?:\.[0-9]+)*)/g, (match, p1) => {
        const numLimpio = p1.replace(/\./g, '');
        const palabras = numeroALetras(numLimpio);
        return palabras ? palabras + ' pesos' : match;
    });

    // 3. Cantidades numéricas con separador de miles sin $ (ej: 2.450 reses, 1.100 bultos)
    t = t.replace(/\b([0-9]{1,3}(?:\.[0-9]{3})+)\b/g, (match, p1) => {
        const numLimpio = p1.replace(/\./g, '');
        const palabras = numeroALetras(numLimpio);
        return palabras || match;
    });

    // 4. Operadores matemáticos (+, -, x, =)
    // CUIDADO: NUNCA tocar la letra x dentro de palabras como Explicación o Experiencia
    t = t.replace(/(?<=\d)\s*[xX×*]\s*(?=\d)/g, ' por ');
    t = t.replace(/\s+[xX×*]\s+/g, ' por ');
    t = t.replace(/(?<=\d)\s*\+\s*(?=\d)/g, ' más ');
    t = t.replace(/\s+\+\s+/g, ' más ');
    t = t.replace(/(?<=\d)\s*-\s*(?=\d)/g, ' menos ');
    t = t.replace(/\s+-\s+/g, ' menos ');
    t = t.replace(/(?<=\d)\s*=\s*(?=\d)/g, ' es igual a ');
    t = t.replace(/\s+=\s+/g, ' es igual a ');

    // 5. Cifras enteras aisladas de 2 o más dígitos (ej. 18, 45, 340) para dicción fluida
    t = t.replace(/\b([0-9]{2,7})\b/g, (match, p1) => {
        const palabras = numeroALetras(p1);
        return palabras || match;
    });

    // Limpieza de signo $ residual
    t = t.replace(/\$/g, ' pesos ');
    t = t.replace(/\s+/g, ' ').trim();
    return t;
}

function obtenerVozEspanol() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    // Priorizar acento latinoamericano / colombiano, o cualquier español
    return voices.find(v => v.lang.toLowerCase() === 'es-co') ||
           voices.find(v => v.lang.toLowerCase() === 'es-419') ||
           voices.find(v => v.lang.toLowerCase().startsWith('es')) ||
           null;
}

function leerPreguntaEnVozAlta() {
    if (!('speechSynthesis' in window)) {
        alert("La síntesis de voz no está disponible en este navegador.");
        return;
    }
    
    // Detener cualquier lectura previa
    window.speechSynthesis.cancel();
    
    const q = state.preguntas[state.indexCurrent];
    if (!q) return;
    
    const textoPregunta = prepararTextoParaVoz(q.q);
    const letras = ['A', 'B', 'C', 'D'];
    const opcionesVoz = q.opts.map((opt, i) => `Opción ${letras[i]}: ${prepararTextoParaVoz(opt)}`).join('. ');
    const textoFinal = `${textoPregunta}. Las opciones de respuesta son: ${opcionesVoz}`;

    const utterance = new SpeechSynthesisUtterance(textoFinal);
    utterance.lang = 'es-CO';
    const voz = obtenerVozEspanol();
    if (voz) utterance.voice = voz;
    utterance.rate = 0.92; // Velocidad pausada y clara para estudiantes de primaria
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
}

function leerExplicacionEnVozAlta(texto) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const textoLimpio = prepararTextoParaVoz(texto);
    const utterance = new SpeechSynthesisUtterance(textoLimpio);
    utterance.lang = 'es-CO';
    const voz = obtenerVozEspanol();
    if (voz) utterance.voice = voz;
    utterance.rate = 0.92;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

// ==========================================
// 3. BANCO DE PREGUNTAS GAMIFICADO Y DE INVESTIGACIÓN
// ==========================================
const bancoPreguntasGamificado = {
    // FASE DIAGNÓSTICA (PRE-TEST) PARA LA INVESTIGACIÓN DE MAESTRÍA
    pretest: {
        General: [
            { id: 1, q: "En la tienda veredal, compras $1.500 de panela y $2.500 de arroz. ¿Cuánto dinero debes pagar?", opts: ["$3.500", "$4.000", "$4.500", "$3.800"], a: 1, feedback: "Explicación: Sumamos los dos valores: $1.500 + $2.500 = $4.000." },
            { id: 2, q: "Si pagas una cuenta de $6.500 con un billete de $10.000, ¿cuánto dinero deben darte de cambio?", opts: ["$4.500", "$3.000", "$3.500", "$4.000"], a: 2, feedback: "Explicación: Restamos el valor al billete: $10.000 - $6.500 = $3.500." },
            { id: 3, q: "Una canoa lleva 18 racimos de plátano por la mañana y 14 por la tarde. ¿Cuántos racimos transportó en total?", opts: ["30", "34", "28", "32"], a: 3, feedback: "Explicación: 18 + 14 = 32 racimos." },
            { id: 4, q: "Un campesino vendió 2 gallinas a $20.000 cada una y gastó $15.000 en abono. ¿Cuánto dinero le sobró?", opts: ["$25.000", "$20.000", "$30.000", "$35.000"], a: 0, feedback: "Explicación: Ganó 2 x $20.000 = $40.000. Le queda: $40.000 - $15.000 = $25.000." },
            { id: 5, q: "En un corral había 45 vacas y vendieron 18 en la feria de Cartagena del Chairá. ¿Cuántas vacas quedan?", opts: ["28", "27", "25", "29"], a: 1, feedback: "Explicación: Restamos: 45 - 18 = 27 vacas." }
        ]
    },

    // MÓDULO 1: Mercado Rural (Suma de Productos)
    mercado_suma: {
        Basico: [
            { id: 1, q: "En la tienda de la vereda, Don José vendió $1.200 en queso y $800 en yuca. ¿Cuánto dinero recibió?", opts: ["$1.800", "$2.000", "$2.200", "$1.900"], a: 1, feedback: "Explicación: Sumamos $1.200 + $800 = $2.000." },
            { id: 2, q: "En la embarcación del Río Caguán van 15 pasajeros y suben 12 más en el puerto. ¿Cuántos van ahora?", opts: ["25", "27", "28", "30"], a: 1, feedback: "Explicación: 15 + 12 = 27 pasajeros." },
            { id: 3, q: "María recolectó 340 huevos el lunes y 250 el martes. ¿Cuál es el total de la cosecha?", opts: ["580", "600", "590", "570"], a: 2, feedback: "Explicación: 340 + 250 = 590 huevos." },
            { id: 4, q: "Un camión transporta 1.100 kg de plátano y le cargan 900 kg de yuca. ¿Cuánto peso lleva?", opts: ["2.100 kg", "1.900 kg", "2.200 kg", "2.000 kg"], a: 3, feedback: "Explicación: 1.100 + 900 = 2.000 kg." },
            { id: 5, q: "En la escuela Santa Fé se usaron 45 cuadernos el primer periodo y 55 el segundo. ¿Cuántos van en total?", opts: ["100", "95", "90", "110"], a: 0, feedback: "Explicación: 45 + 55 = 100 cuadernos." }
        ],
        Intermedio: [
            { id: 1, q: "Una finca ganadera tiene 2.450 reses en el potrero norte y 1.780 en el potrero sur. ¿Cuántas reses hay?", opts: ["4.130", "$4.250", "4.230", "4.330"], a: 2, feedback: "Explicación: 2.450 + 1.780 = 4.230 reses." },
            { id: 2, q: "Para reparar la vía a Cartagena del Chairá se compraron 3.650 bultos de balastro y luego 2.480 más. ¿Total bultos?", opts: ["6.030", "6.230", "6.150", "6.130"], a: 3, feedback: "Explicación: 3.650 + 2.480 = 6.130 bultos." },
            { id: 3, q: "Se vendieron 4.500 litros de leche la primera semana y 3.850 la segunda. ¿Cuántos litros se vendieron?", opts: ["8.350", "8.250", "8.450", "8.150"], a: 0, feedback: "Explicación: 4.500 + 3.850 = 8.350 litros." },
            { id: 4, q: "Un proyecto ambiental sembró 5.670 árboles nativos y recuperó 2.430 plantas. ¿Total vegetal?", opts: ["8.000", "8.100", "8.200", "7.900"], a: 1, feedback: "Explicación: 5.670 + 2.430 = 8.100 plantas." },
            { id: 5, q: "El transporte en lancha costó $14.500 y la carga $8.700. ¿Cuánto fue el gasto total?", opts: ["$22.200", "$23.500", "$23.200", "$24.000"], a: 2, feedback: "Explicación: $14.500 + $8.700 = $23.200." }
        ],
        Avanzado: [
            { id: 1, q: "La cooperativa agrícola acopió 12.450 kg de cacao, 18.320 kg de café y 9.800 kg de maíz. ¿Cuál es la carga total acopiada?", opts: ["39.570 kg", "41.200 kg", "40.570 kg", "40.100 kg"], a: 2, feedback: "Explicación: Sumamos las tres cantidades: 12.450 + 18.320 + 9.800 = 40.570 kg." },
            { id: 2, q: "Para el acueducto veredal se invirtieron $15.800.000 en tubería, $8.450.000 en tanques y $4.250.000 en mano de obra. ¿Cuál fue el costo del proyecto?", opts: ["$27.900.000", "$29.100.000", "$28.300.000", "$28.500.000"], a: 3, feedback: "Explicación: $15.800.000 + $8.450.000 + $4.250.000 = $28.500.000." },
            { id: 3, q: "Un censo pecuario registró 14.230 vacas, 8.650 cerdos y 12.120 aves en la región del Chairá. ¿Cuántos animales hay registrados?", opts: ["35.000", "34.800", "35.200", "36.000"], a: 0, feedback: "Explicación: 14.230 + 8.650 + 12.120 = 35.000 animales." },
            { id: 4, q: "En la feria agropecuaria se vendieron $4.850.000 el viernes, $7.900.000 el sábado y $6.250.000 el domingo. ¿Total recaudado?", opts: ["$18.500.000", "$19.000.000", "$19.500.000", "$20.000.000"], a: 1, feedback: "Explicación: $4.850.000 + $7.900.000 + $6.250.000 = $19.000.000." },
            { id: 5, q: "Se despacharon tres remesas de madera sostenible: 24.500 pies, 18.900 pies y 31.600 pies. ¿Cuántos pies de madera se despacharon?", opts: ["74.000", "76.000", "75.000", "73.500"], a: 2, feedback: "Explicación: 24.500 + 18.900 + 31.600 = 75.000 pies de madera." }
        ]
    },

    // MÓDULO 2: Calculando el Cambio (Resta / Vueltas)
    calculando_cambio: {
        Basico: [
            { id: 1, q: "María compra $13.500 en víveres para la finca y paga con un billete de $20.000. ¿Cuánto dinero le deben devolver de cambio?", opts: ["$7.500", "$6.500", "$5.500", "$6.000"], a: 1, feedback: "Explicación: Restamos el costo al billete: $20.000 - $13.500 = $6.500." },
            { id: 2, q: "Carlos vende una gallina en $35.000. Si le pagaron con $50.000, ¿cuánto debe dar de vueltas?", opts: ["$25.000", "$10.000", "$15.000", "$20.000"], a: 2, feedback: "Explicación: Restamos el valor de la gallina: $50.000 - $35.000 = $15.000." },
            { id: 3, q: "Un saco de concentrado cuesta $48.000. Si pagas con $50.000, ¿cuánto te regresan?", opts: ["$3.000", "$1.500", "$2.500", "$2.000"], a: 3, feedback: "Explicación: Restamos: $50.000 - $48.000 = $2.000." },
            { id: 4, q: "Un pasaje de bus vale $7.200 y entregas un billete de $10.000. ¿Cuánto cambio recibes?", opts: ["$2.800", "$3.800", "$2.200", "$3.200"], a: 0, feedback: "Explicación: Restamos: $10.000 - $7.200 = $2.800." },
            { id: 5, q: "Compraste $16.400 en verduras con un billete de $20.000. ¿Cuánto te devuelven?", opts: ["$4.600", "$3.600", "$3.400", "$2.600"], a: 1, feedback: "Explicación: Restamos: $20.000 - $16.400 = $3.600." }
        ],
        Intermedio: [
            { id: 1, q: "Lucía llevó $100.000 al mercado. Gastó $64.300 en mercado y $18.500 en transporte. ¿Cuánto dinero le quedó sobrante?", opts: ["$18.200", "$16.500", "$17.200", "$19.000"], a: 2, feedback: "Explicación: Gastó $64.300 + $18.500 = $82.800. Le queda: $100.000 - $82.800 = $17.200." },
            { id: 2, q: "Un campesino vendió cosecha por $250.000. Pagó de flete $85.000. ¿Cuál fue su saldo restante?", opts: ["$155.000", "$175.000", "$160.000", "$165.000"], a: 3, feedback: "Explicación: Restamos el flete: $250.000 - $85.000 = $165.000." },
            { id: 3, q: "Tenías $80.000 y compraste herramientas por $53.700. ¿Cuánto dinero te sobra?", opts: ["$26.300", "$27.300", "$25.300", "$26.700"], a: 0, feedback: "Explicación: Restamos: $80.000 - $53.700 = $26.300." },
            { id: 4, q: "Un bulto de abono costaba $120.000 pero tenía un descuento de $24.500. ¿Cuánto pagaste al final?", opts: ["$96.500", "$95.500", "$94.500", "$95.000"], a: 1, feedback: "Explicación: Restamos el descuento: $120.000 - $24.500 = $95.500." },
            { id: 5, q: "De un remesa de $150.000 se compró combustible por $88.900. ¿Cuánto saldo le queda a la cuenta?", opts: ["$62.100", "$60.100", "$61.100", "$61.900"], a: 2, feedback: "Explicación: Restamos: $150.000 - $88.900 = $61.100." }
        ],
        Avanzado: [
            { id: 1, q: "Don Fernando vendió un novillo por $2.800.000. Si canceló una deuda de $1.250.000 y compró insumos por $680.000, ¿cuánto dinero le sobró?", opts: ["$970.000", "$850.000", "$920.000", "$870.000"], a: 3, feedback: "Explicación: Gastos totales = $1.250.000 + $680.000 = $1.930.000. Saldo = $2.800.000 - $1.930.000 = $870.000." },
            { id: 2, q: "Un fondo comunitario disponía de $5.000.000. Pagaron $2.150.000 en reparación de lancha y $1.640.000 en insumos. ¿Cuánto saldo queda?", opts: ["$1.210.000", "$1.310.000", "$1.150.000", "$1.250.000"], a: 0, feedback: "Explicación: Gastos = $3.790.000. Restante: $5.000.000 - $3.790.000 = $1.210.000." },
            { id: 3, q: "Un comerciante llevaba $1.500.000 para comprar queso. Compró $980.000 y pagó $120.000 de acarreo. ¿Cuánto cambio/saldo le queda?", opts: ["$380.000", "$400.000", "$420.000", "$390.000"], a: 1, feedback: "Explicación: Inversión = $1.100.000. Le queda: $1.500.000 - $1.100.000 = $400.000." },
            { id: 4, q: "Una escuela rural recibió $3.200.000 de presupuesto. Compró un televisor por $1.450.000 y pupitres por $1.120.000. ¿Cuánto sobró?", opts: ["$530.000", "$650.000", "$630.000", "$730.000"], a: 2, feedback: "Explicación: Gastos = $2.570.000. Sobrante: $3.200.000 - $2.570.000 = $630.000." },
            { id: 5, q: "Se cobraron $4.500.000 por un flete fluvial. Tras pagar $2.180.000 de gasolina y $850.000 de peajes/permisos, ¿cuál fue la ganancia limpia?", opts: ["$1.570.000", "$1.370.000", "$1.450.000", "$1.470.000"], a: 3, feedback: "Explicación: Gastos = $3.030.000. Ganancia: $4.500.000 - $3.030.000 = $1.470.000." }
        ]
    },

    // MÓDULO 3: Desafíos del Caguán (Operaciones Combinadas)
    desafios_caguan: {
        Basico: [
            { id: 1, q: "Un mototaxi cobró $8.000 por llevar 2 cargas de leche de $14.000 cada una. Si el granjero pagó todo con $40.000, ¿cuánto recibió de cambio?", opts: ["$6.000", "$4.000", "$5.000", "$8.000"], a: 1, feedback: "Explicación: Total gasto = $14.000 + $14.000 + $8.000 = $36.000. Cambio: $40.000 - $36.000 = $4.000." },
            { id: 2, q: "En la embarcación del Caguán van 3 sacos de maíz de $25.000 cada uno. Si pagan con 2 billetes de $50.000 ($100.000), ¿cuánto es el cambio?", opts: ["$15.000", "$30.000", "$25.000", "$20.000"], a: 2, feedback: "Explicación: 3 sacos valen $75.000. Cambio = $100.000 - $75.000 = $25.000." },
            { id: 3, q: "Compraste 2 cuadernos de $4.500 y una regla de $2.000. Si pagas con $20.000, ¿cuánto te devuelven?", opts: ["$11.000", "$8.000", "$10.000", "$9.000"], a: 3, feedback: "Explicación: $4.500 x 2 + $2.000 = $11.000. Cambio: $20.000 - $11.000 = $9.000." },
            { id: 4, q: "Pedro vendió 3 pollos a $12.000 cada uno y compró $16.000 en maicena. ¿Cuánto dinero le quedó?", opts: ["$20.000", "$18.000", "$22.000", "$15.000"], a: 0, feedback: "Explicación: Ganó 3 x $12.000 = $36.000. Le queda: $36.000 - $16.000 = $20.000." },
            { id: 5, q: "Se compran 4 jugos de $2.500 y un paquete de galletas de $3.000. Pagas con $20.000, ¿cuánto es el cambio?", opts: ["$8.000", "$7.000", "$6.000", "$9.000"], a: 1, feedback: "Explicación: Total = $10.000 + $3.000 = $13.000. Cambio = $20.000 - $13.000 = $7.000." }
        ],
        Intermedio: [
            { id: 1, q: "Don Antonio vendió 5 bultos de plátano a $18.000 cada uno. Pagó $25.000 por el flete en lancha y compró $35.000 en víveres. ¿Cuánto le quedó?", opts: ["$35.000", "$25.000", "$30.000", "$40.000"], a: 2, feedback: "Explicación: Venta = 5 x $18.000 = $90.000. Gastos = $25.000 + $35.000 = $60.000. Le queda: $90.000 - $60.000 = $30.000." },
            { id: 2, q: "En la escuela compraron 10 cajas de colores a $6.000 cada una y 5 resmas de papel a $15.000 cada una. ¿Cuánto fue el gasto total?", opts: ["$125.000", "$140.000", "$130.000", "$135.000"], a: 3, feedback: "Explicación: Colores = $60.000. Papel = $75.000. Total = $60.000 + $75.000 = $135.000." },
            { id: 3, q: "Un comerciante compró 4 canastillas de tomate a $32.000 cada una y vendió todo por $180.000. ¿Cuál fue su ganancia?", opts: ["$52.000", "$48.000", "$50.000", "$55.000"], a: 0, feedback: "Explicación: Inversión = 4 x $32.000 = $128.000. Ganancia = $180.000 - $128.000 = $52.000." },
            { id: 4, q: "Una lancha lleva 8 pasajeros cobrando $12.000 a cada uno y 2 cargas cobrando $15.000 a cada una. ¿Total recaudado?", opts: ["$120.000", "$126.000", "$130.000", "$115.000"], a: 1, feedback: "Explicación: Pasajeros = 8 x $12.000 = $96.000. Cargas = 2 x $15.000 = $30.000. Total = $126.000." },
            { id: 5, q: "Tenías $200.000. Compraste 3 sacos de alimento a $45.000 cada uno y pagaste $20.000 de acarreo. ¿Cuánto dinero te queda?", opts: ["$50.000", "$40.000", "$45.000", "$55.000"], a: 2, feedback: "Explicación: Gastos = (3 x $45.000) + $20.000 = $155.000. Te queda: $200.000 - $155.000 = $45.000." }
        ],
        Avanzado: [
            { id: 1, q: "Un transportador llevó 12 bultos de café a $25.000 c/u y 8 pimpina de miel a $30.000 c/u. Si le pagaron con 10 billetes de $100.000 ($1.000.000), ¿cuánto cambio debe dar?", opts: ["$540.000", "$480.000", "$520.000", "$460.000"], a: 3, feedback: "Explicación: Cobro total = (12 x $25.000) + (8 x $30.000) = $300.000 + $240.000 = $540.000. Cambio = $1.000.000 - $540.000 = $460.000." },
            { id: 2, q: "Doña Carmen produjo 150 kg de queso artesanal. Vendió 90 kg a $14.000/kg y el resto a $12.000/kg. ¿Cuánto dinero recolectó en total?", opts: ["$1.980.000", "$1.880.000", "$2.050.000", "$1.920.000"], a: 0, feedback: "Explicación: Primera venta = 90 x $14.000 = $1.260.000. Quedan 60 kg x $12.000 = $720.000. Total = $1.260.000 + $720.000 = $1.980.000." },
            { id: 3, q: "Para un evento escolar se contrataron 3 lanchas a $180.000 c/u y se compraron 45 refrigerios a $6.000 c/u. Si se tenía un presupuesto de $1.000.000, ¿cuánto dinero sobró?", opts: ["$210.000", "$190.000", "$180.000", "$200.000"], a: 1, feedback: "Explicación: Lanchas = $540.000. Refrigerios = $270.000. Gasto total = $810.000. Sobrante = $1.000.000 - $810.000 = $190.000." },
            { id: 4, q: "Un proyecto ganadero compró 4 vacas a $2.100.000 c/u. Vendió 2 de ellas a $2.500.000 c/u y las otras 2 a $2.300.000 c/u. ¿Cuál fue la ganancia total del proyecto?", opts: ["$1.000.000", "$1.400.000", "$1.200.000", "$1.100.000"], a: 2, feedback: "Explicación: Inversión = 4 x $2.100.000 = $8.400.000. Venta total = $5.000.000 + $4.600.000 = $9.600.000. Ganancia = $9.600.000 - $8.400.000 = $1.200.000." },
            { id: 5, q: "Un camión repartió 25 canastillas de gaseosa a $40.000 c/u. Pagó $150.000 de combustible y $200.000 de salario al conductor. ¿Cuál fue el ingreso neto de la ruta?", opts: ["$700.000", "$600.000", "$750.000", "$650.000"], a: 3, feedback: "Explicación: Venta bruta = 25 x $40.000 = $1.000.000. Gastos = $350.000. Ingreso neto = $1.000.000 - $350.000 = $650.000." }
        ]
    },

    // FASE SUMATIVA DE EVALUACIÓN (POST-TEST) PARA LA INVESTIGACIÓN DE MAESTRÍA
    posttest: {
        General: [
            { id: 1, q: "En la tienda veredal, compras $3.600 en víveres y $2.400 en leche. ¿Cuánto dinero debes pagar?", opts: ["$5.800", "$6.000", "$6.200", "$5.500"], a: 1, feedback: "Explicación: Sumamos $3.600 + $2.400 = $6.000." },
            { id: 2, q: "Pagas una compra de $13.200 con un billete de $20.000. ¿Cuánto dinero recibes de cambio exacto?", opts: ["$7.800", "$6.200", "$6.800", "$7.200"], a: 2, feedback: "Explicación: Restamos: $20.000 - $13.200 = $6.800." },
            { id: 3, q: "Un transportador fluvial lleva 24 sacos de maíz en el primer viaje y 28 en el segundo. ¿Total sacos transportados?", opts: ["50", "54", "48", "52"], a: 3, feedback: "Explicación: 24 + 28 = 52 sacos." },
            { id: 4, q: "Doña Rosa vendió 4 quesos a $15.000 cada uno y pagó $22.000 en acarreo de lancha. ¿Cuánto dinero le quedó?", opts: ["$38.000", "$35.000", "$40.000", "$42.000"], a: 0, feedback: "Explicación: Total venta = 4 x $15.000 = $60.000. Saldo = $60.000 - $22.000 = $38.000." },
            { id: 5, q: "De un lote de 60 bultos de cacao para Cartagena del Chairá, se despacharon 34. ¿Cuántos bultos quedan en bodega?", opts: ["24", "26", "28", "25"], a: 1, feedback: "Explicación: Restamos: 60 - 34 = 26 bultos." }
        ]
    }
};

/**
 * Baraja aleatoriamente las opciones (A, B, C, D) de una pregunta usando el algoritmo Fisher-Yates,
 * actualizando el índice de la respuesta correcta 'a' para que apunte exactamente a la nueva posición.
 */
function barajarOpcionesPregunta(pregunta) {
    const textoCorrecto = pregunta.opts[pregunta.a];
    const opcionesBarajadas = [...pregunta.opts];
    for (let i = opcionesBarajadas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [opcionesBarajadas[i], opcionesBarajadas[j]] = [opcionesBarajadas[j], opcionesBarajadas[i]];
    }
    const nuevoIndiceCorrecto = opcionesBarajadas.indexOf(textoCorrecto);
    return {
        ...pregunta,
        opts: opcionesBarajadas,
        a: nuevoIndiceCorrecto
    };
}

// ==========================================
// 4. ESTADO GLOBAL DEL JUEGO Y TELEMETRÍA CIENTÍFICA
// ==========================================
let state = {
    modulo: "mercado_suma",
    nivel: "Basico",
    preguntas: [],
    indexCurrent: 0,
    vidas: 3,
    aciertos: 0,
    errores: 0,
    puntaje: 0,
    racha: 0,
    maxRacha: 0,
    startTime: null,
    itemStartTime: null,
    tiempoTotalSegundos: 0,
    timerInterval: null,
    detalleRespuestas: [] // Microdatos para Learning Analytics (Ítem, selección, acierto, latencia)
};

// ==========================================
// 5. INICIALIZACIÓN Y NAVEGACIÓN
// ==========================================
function initJuego(moduloSeleccionado = "mercado_suma", nivelSeleccionado = "Basico") {
    state.modulo = moduloSeleccionado;
    
    // Normaliza eliminando tildes
    const nivelLimpio = nivelSeleccionado.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    state.nivel = nivelLimpio;
    
    // Obtener las preguntas del módulo y nivel seleccionado
    const moduloObj = bancoPreguntasGamificado[state.modulo] || bancoPreguntasGamificado['mercado_suma'];
    
    let listaPreguntas = [];
    if (state.modulo === 'pretest' || state.modulo === 'posttest') {
        listaPreguntas = moduloObj['General'] || [];
        state.nivel = 'General';
    } else {
        listaPreguntas = moduloObj[state.nivel] || moduloObj['Basico'] || [];
    }

    // Barajar aleatoriamente las opciones (A, B, C, D) de cada pregunta en cada partida
    state.preguntas = listaPreguntas.map(p => barajarOpcionesPregunta(p));
    
    state.indexCurrent = 0;
    state.vidas = 3;
    state.aciertos = 0;
    state.errores = 0;
    state.puntaje = 0;
    state.racha = 0;
    state.maxRacha = 0;
    state.detalleRespuestas = [];
    state.startTime = Date.now();
    state.itemStartTime = Date.now();

    iniciarCronometroHUD();
    renderHUD();
    loadPregunta();
}

function iniciarCronometroHUD() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    const lblTimer = document.getElementById('lbl-timer');
    
    state.timerInterval = setInterval(() => {
        if (!state.startTime) return;
        const segsTranscurridos = Math.floor((Date.now() - state.startTime) / 1000);
        const mins = Math.floor(segsTranscurridos / 60);
        const segs = segsTranscurridos % 60;
        const textoTiempo = `${mins < 10 ? '0' : ''}${mins}:${segs < 10 ? '0' : ''}${segs}`;
        if (lblTimer) lblTimer.innerText = textoTiempo;
    }, 1000);
}

function renderHUD() {
    const hudVidas = document.getElementById('hud-vidas');
    const progressFill = document.getElementById('progress-fill');
    const hudScore = document.getElementById('hud-score');
    const hudStreak = document.getElementById('hud-streak');
    const lblRacha = document.getElementById('lbl-racha-val');
    const qCounter = document.getElementById('question-counter');

    if (hudVidas) {
        let corazonesHTML = '';
        for (let i = 0; i < 3; i++) {
            if (i < state.vidas) {
                corazonesHTML += '<span class="heart-animated" style="margin-right:2px;">❤️</span>';
            } else {
                corazonesHTML += '<span style="opacity:0.3; filter:grayscale(1); margin-right:2px;">🖤</span>';
            }
        }
        hudVidas.innerHTML = corazonesHTML;
    }
    
    if (progressFill && state.preguntas.length > 0) {
        const pct = ((state.indexCurrent) / state.preguntas.length) * 100;
        progressFill.style.width = `${pct}%`;
    }
    
    if (hudScore) hudScore.innerText = `Puntos: ${state.puntaje}`;

    // Actualizar indicador de racha
    if (hudStreak) {
        if (state.racha >= 2) {
            hudStreak.style.display = 'flex';
            if (lblRacha) lblRacha.innerText = `${state.racha}🔥`;
        } else {
            hudStreak.style.display = 'none';
        }
    }

    if (qCounter && state.preguntas.length > 0) {
        qCounter.innerText = `Pregunta ${state.indexCurrent + 1} de ${state.preguntas.length}`;
    }
}

function loadPregunta() {
    if (state.indexCurrent >= state.preguntas.length || state.vidas <= 0) {
        finalizarJuego();
        return;
    }

    // Registrar inicio del ítem para calcular latencia
    state.itemStartTime = Date.now();

    const q = state.preguntas[state.indexCurrent];
    const questionEl = document.getElementById('question-text');
    const container = document.getElementById('options-container');
    const fbContainer = document.getElementById('feedback-container');

    // Botón de audio DUA para leer en voz alta
    if (questionEl) {
        questionEl.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <span style="flex: 1; font-size: 1.25rem; font-weight: 600; line-height: 1.5; color: #1e293b;">
                    ${state.indexCurrent + 1}. ${q.q}
                </span>
                <button type="button" onclick="leerPreguntaEnVozAlta()" title="Escuchar pregunta en voz alta (DUA)" style="background: #e8f5e9; border: 2px solid #2e7d32; border-radius: 50%; width: 44px; height: 44px; font-size: 1.25rem; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 3px 6px rgba(0,0,0,0.12); transition: transform 0.15s ease;">
                    🔊
                </button>
            </div>
        `;
    }
    
    // Limpieza total y ocultado del contenedor de retroalimentación
    if (fbContainer) {
        fbContainer.className = "hidden";
        fbContainer.innerHTML = "";
    }

    // Renderizar opciones interactivas en CUADRÍCULA 2x2 TÁCTIL 3D (DUOLINGO/KAHOOT STYLE)
    if (container) {
        container.innerHTML = "";
        container.className = "options-grid-2x2";

        const letras = ['A', 'B', 'C', 'D'];

        q.opts.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = "option-card-3d";
            btn.innerHTML = `
                <div class="option-letter-badge">${letras[i] || (i + 1)}</div>
                <div class="option-text-content">${opt}</div>
            `;
            btn.onclick = () => validarRespuesta(i);
            container.appendChild(btn);
        });
    }

    renderHUD();
}

function validarRespuesta(selectedIdx) {
    const q = state.preguntas[state.indexCurrent];
    const fbContainer = document.getElementById('feedback-container');
    const allButtons = document.querySelectorAll('.option-card-3d');
    
    // Deshabilitar botones para evitar dobles clics
    allButtons.forEach(b => b.disabled = true);

    // Calcular latencia exacta en segundos para este ítem
    const latenciaSegundos = Math.max(1, Math.round((Date.now() - state.itemStartTime) / 1000));
    const esCorrecto = (selectedIdx === q.a);

    // Guardar microdatos psicométricos para análisis en la tesis
    state.detalleRespuestas.push({
        numero: state.indexCurrent + 1,
        pregunta_id: q.id,
        pregunta_texto: q.q,
        seleccion_idx: selectedIdx,
        seleccion_texto: q.opts[selectedIdx],
        correcta_idx: q.a,
        correcta_texto: q.opts[q.a],
        es_acierto: esCorrecto,
        latencia_seg: latenciaSegundos
    });

    if (esCorrecto) {
        state.aciertos++;
        state.puntaje += 20;
        state.racha++;
        state.maxRacha = Math.max(state.maxRacha, state.racha);
        playSuccessSound();
        if (allButtons[selectedIdx]) {
            allButtons[selectedIdx].classList.add('selected-correct');
        }
        if (fbContainer) fbContainer.className = "feedback-box correct";
    } else {
        state.errores++;
        state.vidas--;
        state.racha = 0;
        playErrorSound();
        if (allButtons[selectedIdx]) {
            allButtons[selectedIdx].classList.add('selected-incorrect');
        }
        // Destacar cuál era la correcta para andamiaje formativo
        if (allButtons[q.a]) {
            allButtons[q.a].classList.add('selected-correct');
        }
        if (fbContainer) fbContainer.className = "feedback-box incorrect";
    }

    renderHUD();

    if (!fbContainer) return;

    const iconoEstado = esCorrecto ? "✅" : "❌";
    const textoEstado = esCorrecto ? "¡Correcto! Excelente trabajo." : "Incorrecto. Analicemos la solución:";
    const feedbackLimpioEscapado = (textoEstado + " " + q.feedback).replace(/'/g, "\\'");

    fbContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;">
            <div style="line-height: 1.5;">
                <b style="font-size: 1.05rem;">${iconoEstado} ${textoEstado}</b><br>
                <span style="font-size: 0.95rem; margin-top: 4px; display: inline-block;">${q.feedback}</span>
                <div style="font-size: 0.8rem; opacity: 0.85; margin-top: 6px;">⏱️ <i>Tiempo de respuesta en esta pregunta: ${latenciaSegundos} segundos.</i></div>
            </div>
            <button type="button" onclick="leerExplicacionEnVozAlta('${feedbackLimpioEscapado}')" title="Escuchar explicación en voz alta (DUA)" style="background: white; border: 1px solid #cbd5e1; border-radius: 50%; width: 36px; height: 36px; font-size: 1.15rem; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                🔊
            </button>
        </div>
    `;

    // Crear el botón "Siguiente Pregunta" con estilo 3D táctil
    const nextBtn = document.createElement('button');
    nextBtn.className = "btn-desafio-interactivo";
    nextBtn.style.marginTop = "14px";
    nextBtn.style.width = "auto";
    nextBtn.style.display = "inline-flex";
    nextBtn.style.padding = "10px 24px";
    nextBtn.innerText = "Siguiente Pregunta ➡";
    nextBtn.onclick = () => {
        state.indexCurrent++;
        loadPregunta();
    };
    fbContainer.appendChild(nextBtn);
}

function finalizarJuego() {
    // Detener el cronómetro en segundo plano
    if (state.timerInterval) clearInterval(state.timerInterval);
    
    state.tiempoTotalSegundos = Math.max(1, Math.round((Date.now() - state.startTime) / 1000));
    const totalItems = state.aciertos + state.errores || 1;
    const latenciaPromedio = Math.round(state.tiempoTotalSegundos / totalItems);

    const mainBox = document.getElementById('game-main-card') || document.getElementById('modulo-juego');
    let msg = state.vidas > 0 ? "🎉 ¡Felicidades! Has completado el desafío." : "💔 Te has quedado sin vidas. ¡Sigue practicando!";
    
    if (state.vidas > 0) {
        playVictorySound();
    }
    
    // 1. Obtener código del grupo/estudiante activo de la sesión
    const codigoEstudiante = sessionStorage.getItem('active_student_code') || 'GRP01';

    // 2. Crear objeto enriquecido para Learning Analytics y tesis de maestría
    const nuevoResultado = {
        id: Date.now(),
        estudiante_id: codigoEstudiante,
        codigo_usuario: codigoEstudiante,
        modulo: state.modulo,
        nivel: state.nivel,
        puntaje: state.puntaje,
        aciertos: state.aciertos,
        errores: state.errores,
        tiempo_segundos: state.tiempoTotalSegundos,
        latencia_promedio_seg: latenciaPromedio,
        max_racha: state.maxRacha,
        detalle_respuestas: state.detalleRespuestas,
        fecha: new Date().toISOString()
    };

    // 3. Guardar directamente en la BD local cartagena2_resultados
    const DB_KEY_RESULTADOS = 'cartagena2_resultados';
    let resultados = JSON.parse(localStorage.getItem(DB_KEY_RESULTADOS) || '[]');
    resultados.push(nuevoResultado);
    localStorage.setItem(DB_KEY_RESULTADOS, JSON.stringify(resultados));

    // Si completó el posttest con éxito, marcar desbloqueo de diploma en sesión
    if (state.modulo === 'posttest' && state.puntaje >= 60) {
        sessionStorage.setItem('diploma_disponible', 'true');
    }

    // Sincronizar en SQLite engine local
    if (typeof guardarResultadoSQLite === 'function') {
        guardarResultadoSQLite(state);
    }

    const minutos = Math.floor(state.tiempoTotalSegundos / 60);
    const segundos = state.tiempoTotalSegundos % 60;
    const textoTiempoFormateado = minutos > 0 ? `${minutos} min ${segundos} seg` : `${segundos} seg`;

    if (mainBox) {
        const esPostest = state.modulo === 'posttest';
        mainBox.innerHTML = `
            <div style="text-align: center; padding: 25px;">
                <h2 style="font-size: 1.8rem; margin-bottom: 10px;">${msg}</h2>
                
                <div style="display: flex; justify-content: center; gap: 15px; margin: 20px 0; flex-wrap: wrap;">
                    <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 12px 20px; min-width: 140px;">
                        <span style="display:block; font-size: 1.8rem; font-weight: bold; color: #2e7d32;">${state.puntaje} / 100</span>
                        <span style="font-size: 0.85rem; color: #64748b;">Puntaje Logrado</span>
                    </div>

                    <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 12px 20px; min-width: 140px;">
                        <span style="display:block; font-size: 1.8rem; font-weight: bold; color: #0284c7;">⏱️ ${textoTiempoFormateado}</span>
                        <span style="font-size: 0.85rem; color: #64748b;">Tiempo Empleado</span>
                    </div>

                    <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 12px 20px; min-width: 140px;">
                        <span style="display:block; font-size: 1.8rem; font-weight: bold; color: #d97706;">🔥 ${state.maxRacha}</span>
                        <span style="font-size: 0.85rem; color: #64748b;">Racha Máxima</span>
                    </div>
                </div>

                <p style="font-size: 1rem; color: #475569; margin: 10px 0;">
                    Aciertos: <b style="color: #16a34a;">${state.aciertos}</b> | 
                    Errores: <b style="color: #dc2626;">${state.errores}</b> | 
                    Velocidad promedio: <b>${latenciaPromedio} seg/pregunta</b>
                </p>

                <p style="color: #15803d; font-size: 0.9rem; margin-top: 15px;">
                    ✅ <i>Datos de telemetría y tiempos guardados para el análisis de tu investigación.</i>
                </p>
                
                <div style="margin-top: 25px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn-secondary" style="background: #e2e8f0; color: #1e293b; padding: 12px 22px; cursor: pointer; border-radius: 10px; font-weight: bold;" onclick="window.location.href='estudiante-menu.html'">
                        ⬅️ Regresar al Menú de Rutas
                    </button>
                    ${esPostest ? `
                        <button class="btn-desafio-interactivo" style="background: linear-gradient(135deg, #f59e0b, #d97706); width: auto; padding: 12px 28px; font-size: 1.05rem;" onclick="window.location.href='estudiante-menu.html?reclamarDiploma=true'">
                            🎓 ¡Reclamar mi Diploma de Honor!
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
}