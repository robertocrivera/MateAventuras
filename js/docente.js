/**
 * CARTAGENA 2 - LÓGICA DEL DASHBOARD DOCENTE (INVESTIGACIÓN DE MAESTRÍA)
 * Manejo de gráficos nativos, cálculo formal de Ganancia de Hake (Pretest vs Postest),
 * telemetría de tiempos de demora, psicometría de errores, exportaciones (CSV SPSS, PDF) y consolidación JSON/USB.
 */

const DB_KEY_ESTUDIANTES = 'cartagena2_estudiantes';
const DB_KEY_RESULTADOS = 'cartagena2_resultados';

// Datos iniciales con telemetría realista de investigación: 12 Grupos Colaborativos (23 Estudiantes)
const estudiantesSemilla = [
    { id: 1, codigo_usuario: 'GRP01', nombre: 'Grupo 1 (2 Estudiantes)', avatar: '🐆 Jaguar' },
    { id: 2, codigo_usuario: 'GRP02', nombre: 'Grupo 2 (2 Estudiantes)', avatar: '🦜 Guacamaya' },
    { id: 3, codigo_usuario: 'GRP03', nombre: 'Grupo 3 (2 Estudiantes)', avatar: '🐬 Delfín Rosado' },
    { id: 4, codigo_usuario: 'GRP04', nombre: 'Grupo 4 (2 Estudiantes)', avatar: '🐊 Caimán' },
    { id: 5, codigo_usuario: 'GRP05', nombre: 'Grupo 5 (2 Estudiantes)', avatar: '🐒 Mono Tití' },
    { id: 6, codigo_usuario: 'GRP06', nombre: 'Grupo 6 (2 Estudiantes)', avatar: '🦦 Nutria' },
    { id: 7, codigo_usuario: 'GRP07', nombre: 'Grupo 7 (2 Estudiantes)', avatar: '🦏 Danta' },
    { id: 8, codigo_usuario: 'GRP08', nombre: 'Grupo 8 (2 Estudiantes)', avatar: '🦤 Tucán' },
    { id: 9, codigo_usuario: 'GRP09', nombre: 'Grupo 9 (2 Estudiantes)', avatar: '🦥 Oso Palmero' },
    { id: 10, codigo_usuario: 'GRP10', nombre: 'Grupo 10 (2 Estudiantes)', avatar: '🐟 Pirarucú' },
    { id: 11, codigo_usuario: 'GRP11', nombre: 'Grupo 11 (2 Estudiantes)', avatar: '🦩 Garza' },
    { id: 12, codigo_usuario: 'GRP12', nombre: 'Grupo 12 (1 Estudiante)', avatar: '🦅 Águila Arpía' }
];

const resultadosSemilla = [
    // GRP01: Jaguar - 2 Estudiantes
    { id: 101, estudiante_id: 'GRP01', modulo: 'pretest', nivel: 'General', puntaje: 40, aciertos: 2, errores: 3, tiempo_segundos: 215, fecha: '2026-03-01T08:00:00Z' },
    { id: 102, estudiante_id: 'GRP01', modulo: 'mercado_suma', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 160, fecha: '2026-03-02T08:00:00Z' },
    { id: 103, estudiante_id: 'GRP01', modulo: 'calculando_cambio', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 145, fecha: '2026-03-03T08:00:00Z' },
    { id: 104, estudiante_id: 'GRP01', modulo: 'desafios_caguan', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 180, fecha: '2026-03-04T08:00:00Z' },
    { id: 105, estudiante_id: 'GRP01', modulo: 'posttest', nivel: 'General', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 110, fecha: '2026-03-05T08:00:00Z' },

    // GRP02: Guacamaya - 2 Estudiantes
    { id: 106, estudiante_id: 'GRP02', modulo: 'pretest', nivel: 'General', puntaje: 20, aciertos: 1, errores: 4, tiempo_segundos: 290, fecha: '2026-03-01T08:00:00Z' },
    { id: 107, estudiante_id: 'GRP02', modulo: 'mercado_suma', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 190, fecha: '2026-03-02T08:00:00Z' },
    { id: 108, estudiante_id: 'GRP02', modulo: 'calculando_cambio', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 175, fecha: '2026-03-03T08:00:00Z' },
    { id: 109, estudiante_id: 'GRP02', modulo: 'desafios_caguan', nivel: 'Basico', puntaje: 40, aciertos: 2, errores: 3, tiempo_segundos: 210, fecha: '2026-03-04T08:00:00Z' },
    { id: 110, estudiante_id: 'GRP02', modulo: 'posttest', nivel: 'General', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 155, fecha: '2026-03-05T08:00:00Z' },

    // GRP03: Delfín Rosado - 2 Estudiantes
    { id: 111, estudiante_id: 'GRP03', modulo: 'pretest', nivel: 'General', puntaje: 40, aciertos: 2, errores: 3, tiempo_segundos: 240, fecha: '2026-03-01T08:15:00Z' },
    { id: 112, estudiante_id: 'GRP03', modulo: 'mercado_suma', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 150, fecha: '2026-03-02T08:15:00Z' },
    { id: 113, estudiante_id: 'GRP03', modulo: 'calculando_cambio', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 140, fecha: '2026-03-03T08:15:00Z' },
    { id: 114, estudiante_id: 'GRP03', modulo: 'desafios_caguan', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 160, fecha: '2026-03-04T08:15:00Z' },
    { id: 115, estudiante_id: 'GRP03', modulo: 'posttest', nivel: 'General', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 105, fecha: '2026-03-05T08:15:00Z' },

    // GRP04: Caimán - 2 Estudiantes
    { id: 116, estudiante_id: 'GRP04', modulo: 'pretest', nivel: 'General', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 195, fecha: '2026-03-01T08:30:00Z' },
    { id: 117, estudiante_id: 'GRP04', modulo: 'mercado_suma', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 140, fecha: '2026-03-02T08:30:00Z' },
    { id: 118, estudiante_id: 'GRP04', modulo: 'calculando_cambio', nivel: 'Basico', puntaje: 100, aciertos: 5, errores: 0, tiempo_segundos: 130, fecha: '2026-03-03T08:30:00Z' },
    { id: 119, estudiante_id: 'GRP04', modulo: 'desafios_caguan', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 150, fecha: '2026-03-04T08:30:00Z' },
    { id: 120, estudiante_id: 'GRP04', modulo: 'posttest', nivel: 'General', puntaje: 100, aciertos: 5, errores: 0, tiempo_segundos: 95, fecha: '2026-03-05T08:30:00Z' },

    // GRP05: Mono Tití - 2 Estudiantes
    { id: 121, estudiante_id: 'GRP05', modulo: 'pretest', nivel: 'General', puntaje: 20, aciertos: 1, errores: 4, tiempo_segundos: 310, fecha: '2026-03-01T08:45:00Z' },
    { id: 122, estudiante_id: 'GRP05', modulo: 'mercado_suma', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 200, fecha: '2026-03-02T08:45:00Z' },
    { id: 123, estudiante_id: 'GRP05', modulo: 'calculando_cambio', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 185, fecha: '2026-03-03T08:45:00Z' },
    { id: 124, estudiante_id: 'GRP05', modulo: 'desafios_caguan', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 195, fecha: '2026-03-04T08:45:00Z' },
    { id: 125, estudiante_id: 'GRP05', modulo: 'posttest', nivel: 'General', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 140, fecha: '2026-03-05T08:45:00Z' },

    // GRP06: Nutria - 2 Estudiantes
    { id: 126, estudiante_id: 'GRP06', modulo: 'pretest', nivel: 'General', puntaje: 40, aciertos: 2, errores: 3, tiempo_segundos: 230, fecha: '2026-03-01T09:00:00Z' },
    { id: 127, estudiante_id: 'GRP06', modulo: 'mercado_suma', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 165, fecha: '2026-03-02T09:00:00Z' },
    { id: 128, estudiante_id: 'GRP06', modulo: 'calculando_cambio', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 160, fecha: '2026-03-03T09:00:00Z' },
    { id: 129, estudiante_id: 'GRP06', modulo: 'desafios_caguan', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 175, fecha: '2026-03-04T09:00:00Z' },
    { id: 130, estudiante_id: 'GRP06', modulo: 'posttest', nivel: 'General', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 115, fecha: '2026-03-05T09:00:00Z' },

    // GRP07: Danta - 2 Estudiantes
    { id: 131, estudiante_id: 'GRP07', modulo: 'pretest', nivel: 'General', puntaje: 40, aciertos: 2, errores: 3, tiempo_segundos: 260, fecha: '2026-03-01T09:15:00Z' },
    { id: 132, estudiante_id: 'GRP07', modulo: 'mercado_suma', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 180, fecha: '2026-03-02T09:15:00Z' },
    { id: 133, estudiante_id: 'GRP07', modulo: 'calculando_cambio', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 155, fecha: '2026-03-03T09:15:00Z' },
    { id: 134, estudiante_id: 'GRP07', modulo: 'desafios_caguan', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 190, fecha: '2026-03-04T09:15:00Z' },
    { id: 135, estudiante_id: 'GRP07', modulo: 'posttest', nivel: 'General', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 125, fecha: '2026-03-05T09:15:00Z' },

    // GRP08: Tucán - 2 Estudiantes
    { id: 136, estudiante_id: 'GRP08', modulo: 'pretest', nivel: 'General', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 205, fecha: '2026-03-01T09:30:00Z' },
    { id: 137, estudiante_id: 'GRP08', modulo: 'mercado_suma', nivel: 'Basico', puntaje: 100, aciertos: 5, errores: 0, tiempo_segundos: 135, fecha: '2026-03-02T09:30:00Z' },
    { id: 138, estudiante_id: 'GRP08', modulo: 'calculando_cambio', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 140, fecha: '2026-03-03T09:30:00Z' },
    { id: 139, estudiante_id: 'GRP08', modulo: 'desafios_caguan', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 155, fecha: '2026-03-04T09:30:00Z' },
    { id: 140, estudiante_id: 'GRP08', modulo: 'posttest', nivel: 'General', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 100, fecha: '2026-03-05T09:30:00Z' },

    // GRP09: Oso Palmero - 2 Estudiantes
    { id: 141, estudiante_id: 'GRP09', modulo: 'pretest', nivel: 'General', puntaje: 20, aciertos: 1, errores: 4, tiempo_segundos: 320, fecha: '2026-03-01T09:45:00Z' },
    { id: 142, estudiante_id: 'GRP09', modulo: 'mercado_suma', nivel: 'Basico', puntaje: 40, aciertos: 2, errores: 3, tiempo_segundos: 220, fecha: '2026-03-02T09:45:00Z' },
    { id: 143, estudiante_id: 'GRP09', modulo: 'calculando_cambio', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 190, fecha: '2026-03-03T09:45:00Z' },
    { id: 144, estudiante_id: 'GRP09', modulo: 'desafios_caguan', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 200, fecha: '2026-03-04T09:45:00Z' },
    { id: 145, estudiante_id: 'GRP09', modulo: 'posttest', nivel: 'General', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 160, fecha: '2026-03-05T09:45:00Z' },

    // GRP10: Pirarucú - 2 Estudiantes
    { id: 146, estudiante_id: 'GRP10', modulo: 'pretest', nivel: 'General', puntaje: 40, aciertos: 2, errores: 3, tiempo_segundos: 225, fecha: '2026-03-01T10:00:00Z' },
    { id: 147, estudiante_id: 'GRP10', modulo: 'mercado_suma', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 155, fecha: '2026-03-02T10:00:00Z' },
    { id: 148, estudiante_id: 'GRP10', modulo: 'calculando_cambio', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 145, fecha: '2026-03-03T10:00:00Z' },
    { id: 149, estudiante_id: 'GRP10', modulo: 'desafios_caguan', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 165, fecha: '2026-03-04T10:00:00Z' },
    { id: 150, estudiante_id: 'GRP10', modulo: 'posttest', nivel: 'General', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 110, fecha: '2026-03-05T10:00:00Z' },

    // GRP11: Garza - 2 Estudiantes
    { id: 151, estudiante_id: 'GRP11', modulo: 'pretest', nivel: 'General', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 190, fecha: '2026-03-01T10:15:00Z' },
    { id: 152, estudiante_id: 'GRP11', modulo: 'mercado_suma', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 145, fecha: '2026-03-02T10:15:00Z' },
    { id: 153, estudiante_id: 'GRP11', modulo: 'calculando_cambio', nivel: 'Basico', puntaje: 80, aciertos: 4, errores: 1, tiempo_segundos: 135, fecha: '2026-03-03T10:15:00Z' },
    { id: 154, estudiante_id: 'GRP11', modulo: 'desafios_caguan', nivel: 'Basico', puntaje: 100, aciertos: 5, errores: 0, tiempo_segundos: 140, fecha: '2026-03-04T10:15:00Z' },
    { id: 155, estudiante_id: 'GRP11', modulo: 'posttest', nivel: 'General', puntaje: 100, aciertos: 5, errores: 0, tiempo_segundos: 90, fecha: '2026-03-05T10:15:00Z' },

    // GRP12: Águila Arpía - 1 Estudiante
    { id: 156, estudiante_id: 'GRP12', modulo: 'pretest', nivel: 'General', puntaje: 40, aciertos: 2, errores: 3, tiempo_segundos: 250, fecha: '2026-03-01T10:30:00Z' },
    { id: 157, estudiante_id: 'GRP12', modulo: 'mercado_suma', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 175, fecha: '2026-03-02T10:30:00Z' },
    { id: 158, estudiante_id: 'GRP12', modulo: 'calculando_cambio', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 165, fecha: '2026-03-03T10:30:00Z' },
    { id: 159, estudiante_id: 'GRP12', modulo: 'desafios_caguan', nivel: 'Basico', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 180, fecha: '2026-03-04T10:30:00Z' },
    { id: 160, estudiante_id: 'GRP12', modulo: 'posttest', nivel: 'General', puntaje: 60, aciertos: 3, errores: 2, tiempo_segundos: 130, fecha: '2026-03-05T10:30:00Z' }
];

document.addEventListener("DOMContentLoaded", () => {
    initBDLocalDocente();
    cargarDashboardCompleto();
});

// 0. INICIALIZAR Y ASEGURAR ESTRUCTURA DE BASE DE DATOS LOCAL
function initBDLocalDocente() {
    const estudiantesGuardados = JSON.parse(localStorage.getItem(DB_KEY_ESTUDIANTES) || '[]');
    // Si no existen o si provienen de la versión anterior con menos de 12 grupos, actualizar a la muestra completa
    if (!localStorage.getItem(DB_KEY_ESTUDIANTES) || estudiantesGuardados.length < 12) {
        localStorage.setItem(DB_KEY_ESTUDIANTES, JSON.stringify(estudiantesSemilla));
        localStorage.setItem(DB_KEY_RESULTADOS, JSON.stringify(resultadosSemilla));
    }
}

// CARGA GENERAL DEL DASHBOARD
function cargarDashboardCompleto() {
    const estudiantes = JSON.parse(localStorage.getItem(DB_KEY_ESTUDIANTES) || '[]');
    const resultados = JSON.parse(localStorage.getItem(DB_KEY_RESULTADOS) || '[]');

    actualizarEstadisticasYGrafico(estudiantes, resultados);
    cargarTablaResultados(estudiantes, resultados);
    poblarSelectEstudiantes(estudiantes);
}

// HELPERS DE TELEMETRÍA Y ANALÍTICA DE APRENDIZAJE
function obtenerMejorPuntaje(notas, moduloKey) {
    const notasModulo = notas.filter(r => r.modulo === moduloKey);
    if (notasModulo.length === 0) return 0;
    return Math.max(...notasModulo.map(r => r.puntaje || 0));
}

function obtenerTiempoModulo(notas, moduloKey) {
    const notasModulo = notas.filter(r => r.modulo === moduloKey);
    if (notasModulo.length === 0) return 0;
    const tiempos = notasModulo.map(r => r.tiempo_segundos || 0).filter(t => t > 0);
    return tiempos.length > 0 ? Math.min(...tiempos) : 0;
}

function obtenerTotalErrores(notas) {
    return notas.reduce((acc, r) => acc + (r.errores || 0), 0);
}

// 1. DIBUJAR GRÁFICO ESTADÍSTICO NATIVO Y CALCULAR MÉTRICAS FORMALES (HAKE + TELEMETRÍA)
function actualizarEstadisticasYGrafico(estudiantes, resultados) {
    const totalEstudiantes = estudiantes.length;
    const lblTotal = document.getElementById('lbl-total-alumnos');
    if (lblTotal) lblTotal.innerText = totalEstudiantes;

    if (totalEstudiantes === 0) {
        if (document.getElementById('lbl-promedio-pre')) document.getElementById('lbl-promedio-pre').innerText = '0%';
        if (document.getElementById('lbl-tiempo-pre')) document.getElementById('lbl-tiempo-pre').innerText = '0s';
        if (document.getElementById('lbl-promedio-post')) document.getElementById('lbl-promedio-post').innerText = '0%';
        if (document.getElementById('lbl-tiempo-post')) document.getElementById('lbl-tiempo-post').innerText = '0s';
        if (document.getElementById('lbl-ganancia-hake')) document.getElementById('lbl-ganancia-hake').innerText = '0.00';
        if (document.getElementById('lbl-categoria-hake')) document.getElementById('lbl-categoria-hake').innerText = 'Sin datos';
        if (document.getElementById('lbl-reduccion-tiempo')) document.getElementById('lbl-reduccion-tiempo').innerText = '0%';
        if (document.getElementById('lbl-total-errores')) document.getElementById('lbl-total-errores').innerText = '0';
        renderGraficoBarrasNativo(0, 0, 0, 0, 0);
        return;
    }

    let sumPre = 0, sumMercado = 0, sumCambio = 0, sumDesafios = 0, sumPost = 0;
    let sumTiempoPre = 0, sumTiempoPost = 0;
    let countPre = 0, countPost = 0;
    let totalErroresGrupo = 0;

    estudiantes.forEach(est => {
        const notasEst = resultados.filter(r => r.estudiante_id === est.codigo_usuario || r.codigo_usuario === est.codigo_usuario);
        
        const notaPre = obtenerMejorPuntaje(notasEst, 'pretest');
        const tiempoPre = obtenerTiempoModulo(notasEst, 'pretest');
        if (tiempoPre > 0) {
            sumTiempoPre += tiempoPre;
            countPre++;
        }

        const notaMercado = obtenerMejorPuntaje(notasEst, 'mercado_suma');
        const notaCambio = obtenerMejorPuntaje(notasEst, 'calculando_cambio');
        const notaDesafios = obtenerMejorPuntaje(notasEst, 'desafios_caguan');
        
        let notaPost = obtenerMejorPuntaje(notasEst, 'posttest');
        let tiempoPost = obtenerTiempoModulo(notasEst, 'posttest');
        if (notaPost === 0 && (notaMercado > 0 || notaCambio > 0 || notaDesafios > 0)) {
            notaPost = Math.round((notaMercado + notaCambio + notaDesafios) / 3);
        }
        if (tiempoPost > 0) {
            sumTiempoPost += tiempoPost;
            countPost++;
        }

        totalErroresGrupo += obtenerTotalErrores(notasEst);

        sumPre += notaPre;
        sumMercado += notaMercado;
        sumCambio += notaCambio;
        sumDesafios += notaDesafios;
        sumPost += notaPost;
    });

    const promPre = Math.round(sumPre / totalEstudiantes);
    const promMercado = Math.round(sumMercado / totalEstudiantes);
    const promCambio = Math.round(sumCambio / totalEstudiantes);
    const promDesafios = Math.round(sumDesafios / totalEstudiantes);
    const promPost = Math.round(sumPost / totalEstudiantes);

    const promTPre = countPre > 0 ? Math.round(sumTiempoPre / countPre) : 0;
    const promTPost = countPost > 0 ? Math.round(sumTiempoPost / countPost) : 0;

    let reduccionTiempo = 0;
    if (promTPre > 0 && promTPost > 0) {
        reduccionTiempo = Math.round(((promTPre - promTPost) / promTPre) * 100);
    }

    // Cálculo formal del Factor de Ganancia Normalizada de Hake:
    // g = (Post% - Pre%) / (100% - Pre%)
    let hake = 0;
    if (100 - promPre > 0) {
        hake = (promPost - promPre) / (100 - promPre);
    }
    const hakeVal = Math.max(0, hake).toFixed(2);

    // Categorización cualitativa de Hake
    let catHake = "Baja (< 0.30)";
    let colorHake = "#c62828";
    if (hakeVal >= 0.70) {
        catHake = "Alta (≥ 0.70)";
        colorHake = "#2e7d32";
    } else if (hakeVal >= 0.30) {
        catHake = "Media (0.30 - 0.69)";
        colorHake = "#f57f17";
    }

    if (document.getElementById('lbl-promedio-pre')) {
        document.getElementById('lbl-promedio-pre').innerText = `${promPre}%`;
    }
    if (document.getElementById('lbl-tiempo-pre')) {
        document.getElementById('lbl-tiempo-pre').innerText = `${promTPre}s`;
    }
    if (document.getElementById('lbl-promedio-post')) {
        document.getElementById('lbl-promedio-post').innerText = `${promPost}%`;
    }
    if (document.getElementById('lbl-tiempo-post')) {
        document.getElementById('lbl-tiempo-post').innerText = `${promTPost}s`;
    }
    if (document.getElementById('lbl-ganancia-hake')) {
        document.getElementById('lbl-ganancia-hake').innerText = hakeVal;
    }
    if (document.getElementById('lbl-categoria-hake')) {
        const catBadge = document.getElementById('lbl-categoria-hake');
        catBadge.innerText = catHake;
        catBadge.style.color = colorHake;
    }
    if (document.getElementById('lbl-reduccion-tiempo')) {
        document.getElementById('lbl-reduccion-tiempo').innerText = `${reduccionTiempo > 0 ? '-' + reduccionTiempo + '%' : '0%'}`;
    }
    if (document.getElementById('lbl-total-errores')) {
        document.getElementById('lbl-total-errores').innerText = totalErroresGrupo;
    }

    renderGraficoBarrasNativo(promPre, promMercado, promCambio, promDesafios, promPost);
}

function renderGraficoBarrasNativo(vPre, vMercado, vCambio, vDesafios, vPost) {
    const contenedor = document.getElementById('chartDesempeno');
    if (!contenedor) return;

    const parent = contenedor.parentElement;
    parent.innerHTML = `
        <div id="chartDesempeno" style="display: flex; align-items: flex-end; justify-content: space-around; height: 260px; padding: 20px 10px 10px 10px; background: #ffffff; border-radius: 12px; border: 1px solid #e0e0e0; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
            
            <div style="display: flex; flex-direction: column; align-items: center; width: 16%; height: 100%; justify-content: flex-end;">
                <span style="font-weight: bold; margin-bottom: 5px; color: #0284c7;">${vPre}%</span>
                <div style="width: 100%; height: ${vPre}%; background: linear-gradient(180deg, #38bdf8, #0284c7); border-radius: 6px 6px 0 0; transition: height 0.6s ease;"></div>
                <span style="font-size: 0.8rem; font-weight: 700; margin-top: 8px; color: #0369a1; text-align: center;">1. Pre-test</span>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; width: 16%; height: 100%; justify-content: flex-end;">
                <span style="font-weight: bold; margin-bottom: 5px; color: #2e7d32;">${vMercado}%</span>
                <div style="width: 100%; height: ${vMercado}%; background: linear-gradient(180deg, #66bb6a, #2e7d32); border-radius: 6px 6px 0 0; transition: height 0.6s ease;"></div>
                <span style="font-size: 0.8rem; font-weight: 600; margin-top: 8px; color: #333; text-align: center;">2. Mercado</span>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; width: 16%; height: 100%; justify-content: flex-end;">
                <span style="font-weight: bold; margin-bottom: 5px; color: #1565c0;">${vCambio}%</span>
                <div style="width: 100%; height: ${vCambio}%; background: linear-gradient(180deg, #42a5f5, #1565c0); border-radius: 6px 6px 0 0; transition: height 0.6s ease;"></div>
                <span style="font-size: 0.8rem; font-weight: 600; margin-top: 8px; color: #333; text-align: center;">3. Cambio</span>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; width: 16%; height: 100%; justify-content: flex-end;">
                <span style="font-weight: bold; margin-bottom: 5px; color: #ef6c00;">${vDesafios}%</span>
                <div style="width: 100%; height: ${vDesafios}%; background: linear-gradient(180deg, #ffa726, #ef6c00); border-radius: 6px 6px 0 0; transition: height 0.6s ease;"></div>
                <span style="font-size: 0.8rem; font-weight: 600; margin-top: 8px; color: #333; text-align: center;">4. Desafíos</span>
            </div>

            <div style="display: flex; flex-direction: column; align-items: center; width: 16%; height: 100%; justify-content: flex-end;">
                <span style="font-weight: bold; margin-bottom: 5px; color: #7e22ce;">${vPost}%</span>
                <div style="width: 100%; height: ${vPost}%; background: linear-gradient(180deg, #a855f7, #7e22ce); border-radius: 6px 6px 0 0; transition: height 0.6s ease;"></div>
                <span style="font-size: 0.8rem; font-weight: 700; margin-top: 8px; color: #6b21a8; text-align: center;">5. Post-test</span>
            </div>

        </div>
    `;
}

// 2. POBLAR SELECTOR DE ESTUDIANTES PARA VISTA INDIVIDUAL
function poblarSelectEstudiantes(estudiantes) {
    const selectEst = document.getElementById('select-estudiante');
    if (!selectEst) return;

    selectEst.innerHTML = '<option value="TODOS">-- Ver Todo el Curso (Grupal) --</option>';
    estudiantes.forEach(est => {
        selectEst.innerHTML += `<option value="${est.codigo_usuario}">${est.nombre} (${est.codigo_usuario})</option>`;
    });
}

// 4. CARGAR TABLA DE RESULTADOS REALES CON TELEMETRÍA DE TIEMPOS Y ERRORES
function cargarTablaResultados(estudiantesData, resultadosData) {
    const tbody = document.getElementById('tbody-resultados');
    if (!tbody) return;

    const estudiantes = estudiantesData || JSON.parse(localStorage.getItem(DB_KEY_ESTUDIANTES) || '[]');
    const resultados = resultadosData || JSON.parse(localStorage.getItem(DB_KEY_RESULTADOS) || '[]');

    tbody.innerHTML = '';

    if (estudiantes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; padding: 15px;">No hay estudiantes registrados en la base de datos local.</td></tr>`;
        return;
    }

    estudiantes.forEach(est => {
        const notasEst = resultados.filter(r => r.estudiante_id === est.codigo_usuario || r.codigo_usuario === est.codigo_usuario);
        
        const pre = obtenerMejorPuntaje(notasEst, 'pretest');
        const tPre = obtenerTiempoModulo(notasEst, 'pretest');
        const mercado = obtenerMejorPuntaje(notasEst, 'mercado_suma');
        const cambio = obtenerMejorPuntaje(notasEst, 'calculando_cambio');
        const desafios = obtenerMejorPuntaje(notasEst, 'desafios_caguan');
        
        let post = obtenerMejorPuntaje(notasEst, 'posttest');
        let tPost = obtenerTiempoModulo(notasEst, 'posttest');
        if (post === 0 && (mercado > 0 || cambio > 0 || desafios > 0)) {
            post = Math.round((mercado + cambio + desafios) / 3);
        }

        const erroresEst = obtenerTotalErrores(notasEst);

        let redInd = 0;
        if (tPre > 0 && tPost > 0) {
            redInd = Math.round(((tPre - tPost) / tPre) * 100);
        }

        // Ganancia individual de Hake
        let hakeInd = 0;
        if (100 - pre > 0) {
            hakeInd = (post - pre) / (100 - pre);
        }
        hakeInd = Math.max(0, hakeInd).toFixed(2);

        const promedioTotal = Math.round((pre + mercado + cambio + desafios + post) / 5);
        let estadoDominio = '🔴 Requiere Apoyo';
        let colorBadge = '#c62828';

        if (promedioTotal >= 70) {
            estadoDominio = '🟢 Dominado';
            colorBadge = '#2e7d32';
        } else if (promedioTotal >= 50) {
            estadoDominio = '🟡 En Proceso';
            colorBadge = '#f57f17';
        }

        tbody.innerHTML += `
            <tr>
                <td><b>${est.codigo_usuario}</b></td>
                <td>${est.nombre}</td>
                <td>${est.avatar || '🧑‍🎓'}</td>
                <td style="text-align: center; font-weight: bold; color: #0284c7;">
                    ${pre}% <br><span style="font-size:0.75rem; color:#64748b; font-weight:normal;">⏱️${tPre}s</span>
                </td>
                <td style="text-align: center;">${mercado}%</td>
                <td style="text-align: center;">${cambio}%</td>
                <td style="text-align: center;">${desafios}%</td>
                <td style="text-align: center; font-weight: bold; color: #7e22ce;">
                    ${post}% <br><span style="font-size:0.75rem; color:#64748b; font-weight:normal;">⏱️${tPost}s</span>
                </td>
                <td style="text-align: center; font-weight: bold;">${hakeInd}</td>
                <td style="text-align: center; color: #dc2626; font-weight: bold;">${erroresEst}</td>
                <td style="text-align: center; font-weight: bold; color: ${redInd > 0 ? '#16a34a' : '#64748b'};">
                    ${redInd > 0 ? '-' + redInd + '%' : '0%'}
                </td>
                <td style="text-align: center; color: ${colorBadge}; font-weight: bold;">${estadoDominio}</td>
                <td style="text-align: center;">
                    <button onclick="eliminarEstudiante('${est.codigo_usuario}')" style="background:#e74c3c; color:white; border:none; padding: 4px 8px; border-radius: 4px; cursor:pointer;" title="Eliminar Estudiante">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// 5. GESTIÓN CRUD DE ESTUDIANTES (CREAR Y ELIMINAR)
function abrirModalCrearEstudiante() {
    const modal = document.getElementById('modal-estudiante');
    if (modal) modal.classList.remove('hidden');
}

function cerrarModalCrearEstudiante() {
    const modal = document.getElementById('modal-estudiante');
    if (modal) modal.classList.add('hidden');
}

function guardarNuevoEstudiante() {
    const txtCodigo = document.getElementById('txt-codigo-estudiante');
    const txtNombre = document.getElementById('txt-nombre-estudiante');
    const txtAvatar = document.getElementById('txt-avatar-estudiante');

    if (!txtCodigo || !txtNombre) return;

    const codigo = txtCodigo.value.trim().toUpperCase();
    const nombre = txtNombre.value.trim();
    const avatar = txtAvatar ? txtAvatar.value : '🧑‍🎓';

    if (!codigo || !nombre) {
        alert('Por favor diligencia el código y nombre del grupo.');
        return;
    }

    let estudiantes = JSON.parse(localStorage.getItem(DB_KEY_ESTUDIANTES) || '[]');

    if (estudiantes.some(e => e.codigo_usuario === codigo)) {
        alert(`El código ${codigo} ya existe. Por favor ingresa uno diferente.`);
        return;
    }

    const nuevoEstudiante = {
        id: Date.now(),
        codigo_usuario: codigo,
        nombre: nombre,
        avatar: avatar
    };

    estudiantes.push(nuevoEstudiante);
    localStorage.setItem(DB_KEY_ESTUDIANTES, JSON.stringify(estudiantes));

    cerrarModalCrearEstudiante();
    txtCodigo.value = '';
    txtNombre.value = '';

    cargarDashboardCompleto();
}

function eliminarEstudiante(codigoUsuario) {
    if (confirm(`¿Estás seguro de eliminar al grupo con código ${codigoUsuario}?`)) {
        let estudiantes = JSON.parse(localStorage.getItem(DB_KEY_ESTUDIANTES) || '[]');
        estudiantes = estudiantes.filter(e => e.codigo_usuario !== codigoUsuario);
        
        localStorage.setItem(DB_KEY_ESTUDIANTES, JSON.stringify(estudiantes));
        cargarDashboardCompleto();
    }
}

// 6. CAMBIAR MODO DE VISTA (GRUPAL vs INDIVIDUAL)
function cambiarVistaReporte(modo) {
    const selectWrap = document.getElementById('wrapper-select-estudiante');
    if (modo === 'individual') {
        if (selectWrap) selectWrap.classList.remove('hidden');
    } else {
        if (selectWrap) selectWrap.classList.add('hidden');
        cargarDashboardCompleto();
    }
}

// 7. FILTRAR RESULTADOS POR UN GRUPO
function filtrarPorEstudiante(codigoUsuario) {
    if (codigoUsuario === 'TODOS') {
        cargarDashboardCompleto();
        return;
    }

    const estudiantes = JSON.parse(localStorage.getItem(DB_KEY_ESTUDIANTES) || '[]');
    const resultados = JSON.parse(localStorage.getItem(DB_KEY_RESULTADOS) || '[]');

    const estFiltrado = estudiantes.filter(e => e.codigo_usuario === codigoUsuario);
    cargarTablaResultados(estFiltrado, resultados);
    actualizarEstadisticasYGrafico(estFiltrado, resultados);
}

// 8. EXPORTAR REPORTE EN CSV CON VARIABLES CUANTITATIVAS (TIEMPOS, HAKE Y ERRORES PARA SPSS)
function exportarCSV() {
    const estudiantes = JSON.parse(localStorage.getItem(DB_KEY_ESTUDIANTES) || '[]');
    const resultados = JSON.parse(localStorage.getItem(DB_KEY_RESULTADOS) || '[]');

    if (estudiantes.length === 0) {
        alert("No hay datos disponibles para exportar.");
        return;
    }

    let csvContent = "\uFEFF"; // BOM UTF-8
    csvContent += "Codigo_Grupo;Nombre_Grupo_Integrantes;Mascota;Pretest_Pct;Pretest_Tiempo_Seg;Mercado_Suma_Pct;Cambio_Resta_Pct;Desafios_Pct;Posttest_Pct;Posttest_Tiempo_Seg;Reduccion_Tiempo_Pct;Ganancia_Hake_g;Total_Errores_Cometidos;Estado_Dominio\n";

    estudiantes.forEach(est => {
        const notasEst = resultados.filter(r => r.estudiante_id === est.codigo_usuario || r.codigo_usuario === est.codigo_usuario);
        const pre = obtenerMejorPuntaje(notasEst, 'pretest');
        const tPre = obtenerTiempoModulo(notasEst, 'pretest');
        const mercado = obtenerMejorPuntaje(notasEst, 'mercado_suma');
        const cambio = obtenerMejorPuntaje(notasEst, 'calculando_cambio');
        const desafios = obtenerMejorPuntaje(notasEst, 'desafios_caguan');
        
        let post = obtenerMejorPuntaje(notasEst, 'posttest');
        let tPost = obtenerTiempoModulo(notasEst, 'posttest');
        if (post === 0 && (mercado > 0 || cambio > 0 || desafios > 0)) {
            post = Math.round((mercado + cambio + desafios) / 3);
        }

        let redInd = 0;
        if (tPre > 0 && tPost > 0) {
            redInd = Math.round(((tPre - tPost) / tPre) * 100);
        }

        let hakeInd = 0;
        if (100 - pre > 0) {
            hakeInd = (post - pre) / (100 - pre);
        }
        hakeInd = Math.max(0, hakeInd).toFixed(2);

        const errores = obtenerTotalErrores(notasEst);
        const promedio = Math.round((pre + mercado + cambio + desafios + post) / 5);
        const estado = promedio >= 70 ? 'Dominado' : (promedio >= 50 ? 'En Proceso' : 'Requiere Apoyo');

        csvContent += `"${est.codigo_usuario}";"${est.nombre}";"${est.avatar || ''}";${pre};${tPre};${mercado};${cambio};${desafios};${post};${tPost};${redInd};${hakeInd};${errores};"${estado}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Investigacion_MateAventuras_SPSS_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 9. SINCRONIZACIÓN DE AULA RURAL: EXPORTAR E IMPORTAR RESPALDO (.JSON / USB)
function exportarRespaldoJSON() {
    const estudiantes = JSON.parse(localStorage.getItem(DB_KEY_ESTUDIANTES) || '[]');
    const resultados = JSON.parse(localStorage.getItem(DB_KEY_RESULTADOS) || '[]');

    const backupData = {
        app: "MateAventuras-RED-Offline",
        sede: "I.E.R. Santa Fé del Caguán",
        fecha_exportacion: new Date().toISOString(),
        estudiantes: estudiantes,
        resultados: resultados
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Respaldo_Aula_MateAventuras_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function abrirModalImportarJSON() {
    const modal = document.getElementById('modal-importar-json');
    if (modal) modal.classList.remove('hidden');
}

function cerrarModalImportarJSON() {
    const modal = document.getElementById('modal-importar-json');
    if (modal) modal.classList.add('hidden');
}

function procesarArchivoConsolidarJSON() {
    const fileInput = document.getElementById('file-import-json');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert("Por favor selecciona un archivo .json de respaldo.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (!data.estudiantes || !data.resultados) {
                alert("El archivo no tiene el formato válido de respaldo de MateAventuras.");
                return;
            }

            let estudiantesActuales = JSON.parse(localStorage.getItem(DB_KEY_ESTUDIANTES) || '[]');
            let resultadosActuales = JSON.parse(localStorage.getItem(DB_KEY_RESULTADOS) || '[]');

            let nuevosEst = 0;
            let nuevosRes = 0;

            // Fusionar estudiantes sin duplicar código
            data.estudiantes.forEach(estImport => {
                if (!estudiantesActuales.some(e => e.codigo_usuario === estImport.codigo_usuario)) {
                    estudiantesActuales.push(estImport);
                    nuevosEst++;
                }
            });

            // Fusionar resultados sin duplicar id o combinación idéntica
            data.resultados.forEach(resImport => {
                const yaExiste = resultadosActuales.some(r => 
                    r.id === resImport.id || 
                    (r.estudiante_id === resImport.estudiante_id && r.modulo === resImport.modulo && r.fecha === resImport.fecha)
                );
                if (!yaExiste) {
                    resultadosActuales.push(resImport);
                    nuevosRes++;
                }
            });

            localStorage.setItem(DB_KEY_ESTUDIANTES, JSON.stringify(estudiantesActuales));
            localStorage.setItem(DB_KEY_RESULTADOS, JSON.stringify(resultadosActuales));

            cerrarModalImportarJSON();
            alert(`✅ Consolidación exitosa:\n• ${nuevosEst} nuevo(s) grupo(s) integrado(s).\n• ${nuevosRes} nuevo(s) resultado(s) de evaluación consolidado(s).`);
            cargarDashboardCompleto();

        } catch (err) {
            alert("Error al leer el archivo JSON: " + err.message);
        }
    };

    reader.readAsText(file);
}

// 10. EXPORTAR PDF VISUAL NATIVO CON ANÁLISIS DE TIEMPOS Y HAKE
function exportarPDFVisual() {
    const chartHTML = document.getElementById('chartDesempeno') ? document.getElementById('chartDesempeno').outerHTML : '';
    const tablaHTML = document.querySelector('.data-table') ? document.querySelector('.data-table').outerHTML : '';
    const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    const docente = "Profesor Investigador - I.E.R. Santa Fé";

    const totalEst = document.getElementById('lbl-total-alumnos') ? document.getElementById('lbl-total-alumnos').innerText : '0';
    const promPre = document.getElementById('lbl-promedio-pre') ? document.getElementById('lbl-promedio-pre').innerText : '0%';
    const tPre = document.getElementById('lbl-tiempo-pre') ? document.getElementById('lbl-tiempo-pre').innerText : '0s';
    const promPost = document.getElementById('lbl-promedio-post') ? document.getElementById('lbl-promedio-post').innerText : '0%';
    const tPost = document.getElementById('lbl-tiempo-post') ? document.getElementById('lbl-tiempo-post').innerText : '0s';
    const hakeVal = document.getElementById('lbl-ganancia-hake') ? document.getElementById('lbl-ganancia-hake').innerText : '0.00';
    const catHake = document.getElementById('lbl-categoria-hake') ? document.getElementById('lbl-categoria-hake').innerText : '';
    const redT = document.getElementById('lbl-reduccion-tiempo') ? document.getElementById('lbl-reduccion-tiempo').innerText : '0%';
    const errTotal = document.getElementById('lbl-total-errores') ? document.getElementById('lbl-total-errores').innerText : '0';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>Reporte de Investigación Cuasiexperimental - MateAventuras</title>
            <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #333; }
                .header { text-align: center; border-bottom: 2px solid #2e7d32; padding-bottom: 10px; margin-bottom: 20px; }
                .header h1 { color: #2e7d32; margin: 0; font-size: 1.6rem; }
                .header h3 { margin: 5px 0 0 0; color: #666; font-size: 1rem; }
                .meta-info { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 0.9rem; background: #f5f5f5; padding: 10px; border-radius: 6px; }
                .summary-grid { display: flex; justify-content: space-around; margin-bottom: 25px; flex-wrap: wrap; gap: 10px; }
                .summary-card { text-align: center; background: #e8f5e9; padding: 12px; border-radius: 8px; width: 18%; min-width: 130px; border: 1px solid #c8e6c9; }
                .summary-card span { display: block; font-size: 1.3rem; font-weight: bold; color: #2e7d32; }
                table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.85rem; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #2e7d32; color: white; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                @media print {
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>I.E.R. SANTA FÉ DEL CAGUÁN</h1>
                <h3>Informe Cuasiexperimental del Pensamiento Numérico - MateAventuras Offline</h3>
            </div>

            <div class="meta-info">
                <div><b>Docente Investigador:</b> ${docente}</div>
                <div><b>Fecha del Reporte:</b> ${fecha}</div>
                <div><b>Curso:</b> Grado Quinto (5°) | 12 Grupos (23 Estudiantes)</div>
            </div>

            <div class="summary-grid">
                <div class="summary-card"><span>${totalEst} Grupos</span>Muestra (23 Alumnos)</div>
                <div class="summary-card"><span>${promPre} (${tPre})</span>Línea Base (Pretest)</div>
                <div class="summary-card"><span>${promPost} (${tPost})</span>Evaluación (Posttest)</div>
                <div class="summary-card"><span>${hakeVal}</span>Hake: ${catHake}</div>
                <div class="summary-card"><span>${redT}</span>Agilidad (Δ Tiempo)</div>
            </div>

            <h3>Comparativa Pretest vs. Módulos vs. Post-test</h3>
            <div style="margin-bottom: 30px;">
                ${chartHTML}
            </div>

            <h3>Matriz Cuantitativa de Desempeño, Latencia y Ganancia por Grupo</h3>
            ${tablaHTML}

            <div style="margin-top: 30px; font-size: 0.8rem; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
                <i>Nota metodológica: Datos anonimizados procesados localmente en MateAventuras. Ganancia normalizada calculada según Hake \(g = \frac{\%Post - \%Pre}{100 - \%Pre}\). Tiempos registrados con cronometría de alta precisión.</i>
            </div>

            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                    }, 300);
                };
            <\/script>
        </body>
        </html>
    `);

    printWindow.document.close();
}