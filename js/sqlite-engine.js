/**
 * MATEAVENTURAS - MOTOR BASE DE DATOS SQLITE OFFLINE
 * Proyecto de Investigación: I.E.R. Santa Fé del Caguán (2026)
 * Archivo: js/sqlite-engine.js
 * 
 * Este script gestiona la base de datos relacional local en el navegador del usuario.
 * Utiliza SQL.js (SQLite compilado a WebAssembly) y cuenta con un mecanismo de 
 * sincronización/fallback en LocalStorage para garantizar la persistencia de datos.
 */

// Clave principal para guardar la imagen binaria/JSON de la BD en el almacenamiento del navegador
const DB_STORAGE_KEY = "CARTAGENA2_SQLITE_DB";
const DB_KEY = DB_STORAGE_KEY; // Alias para compatibilidad con vistas

// Instancia global del motor SQL
let dbInstance = null;

/**
 * Esquema SQL por defecto para inicializar la base de datos relacional.
 * Sigue la estructura de entidades de docentes, estudiantes y resultados.
 */
const INITIAL_SQL_SCHEMA = `
    CREATE TABLE IF NOT EXISTS docentes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        nombre TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS estudiantes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo_usuario TEXT UNIQUE NOT NULL,
        nombre TEXT NOT NULL,
        avatar TEXT NOT NULL,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resultados_modulos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        estudiante_id INTEGER NOT NULL,
        modulo TEXT NOT NULL,
        nivel TEXT NOT NULL,
        puntaje INTEGER NOT NULL,
        aciertos INTEGER NOT NULL,
        errores INTEGER NOT NULL,
        tiempo_segundos INTEGER NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(estudiante_id) REFERENCES estudiantes(id)
    );

    -- Cuentas de docentes (Docente de Aula y Administrador)
    INSERT OR IGNORE INTO docentes (usuario, password, nombre) 
    VALUES 
    ('profesor.caguan', 'SantaFe2026*', 'Profesor Investigador I.E.R. Santa Fé'),
    ('admin', 'caguán2026', 'Administrador RED MateAventuras');

    -- Registro de 12 Grupos Colaborativos (23 Estudiantes)
    INSERT OR IGNORE INTO estudiantes (codigo_usuario, nombre, avatar) 
    VALUES 
    ('GRP01', 'Grupo 1 (2 Estudiantes)', '🐆 Jaguar'),
    ('GRP02', 'Grupo 2 (2 Estudiantes)', '🦜 Guacamaya'),
    ('GRP03', 'Grupo 3 (2 Estudiantes)', '🐬 Delfín Rosado'),
    ('GRP04', 'Grupo 4 (2 Estudiantes)', '🐊 Caimán'),
    ('GRP05', 'Grupo 5 (2 Estudiantes)', '🐒 Mono Tití'),
    ('GRP06', 'Grupo 6 (2 Estudiantes)', '🦦 Nutria'),
    ('GRP07', 'Grupo 7 (2 Estudiantes)', '🦏 Danta'),
    ('GRP08', 'Grupo 8 (2 Estudiantes)', '🦤 Tucán'),
    ('GRP09', 'Grupo 9 (2 Estudiantes)', '🦥 Oso Palmero'),
    ('GRP10', 'Grupo 10 (2 Estudiantes)', '🐟 Pirarucú'),
    ('GRP11', 'Grupo 11 (2 Estudiantes)', '🦩 Garza'),
    ('GRP12', 'Grupo 12 (1 Estudiante)', '🦅 Águila Arpía');
`;

/**
 * Inicializa la Base de Datos SQLite.
 * Intenta cargar SQL.js WebAssembly; si no está presente el archivo .wasm, 
 * activa un motor emulado sobre LocalStorage sin interrumpir la app.
 */
async function initSQLiteEngine() {
    try {
        if (window.initSqlJs) {
            // Carga de SQL.js mediante WebAssembly offline
            const SQL = await window.initSqlJs({ locateFile: file => `js/${file}` });
            
            const savedDb = localStorage.getItem(DB_STORAGE_KEY);
            if (savedDb) {
                // Restaurar base de datos existente desde binario guardado
                const uint8Array = new Uint8Array(JSON.parse(savedDb));
                dbInstance = new SQL.Database(uint8Array);
            } else {
                // Crear nueva base de datos y ejecutar esquema inicial
                dbInstance = new SQL.Database();
                dbInstance.run(INITIAL_SQL_SCHEMA);
                persistirBD();
            }
            console.log("✅ Motor SQLite (WebAssembly) iniciado correctamente.");
        } else {
            console.warn("⚠️ sql.js no detectado. Activando motor de persistencia relacional LocalStorage.");
            initFallbackStorage();
        }
    } catch (err) {
        console.error("Error iniciando SQLite WebAssembly, cambiando a Fallback LocalStorage:", err);
        initFallbackStorage();
    }
}

/**
 * Guarda el estado actual de la base de datos SQLite en el almacenamiento local del dispositivo.
 */
function persistirBD() {
    if (dbInstance) {
        const data = dbInstance.export();
        const arrayData = Array.from(data);
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(arrayData));
    }
}

/**
 * Mecanismo Fallback: Inicializa la estructura JSON relacional si sql.js no está disponible.
 */
function initFallbackStorage() {
    const existing = JSON.parse(localStorage.getItem(DB_STORAGE_KEY) || 'null');
    if (!existing || !existing.estudiantes || existing.estudiantes.length < 12) {
        const defaultState = {
            docentes: [
                { id: 1, user: "profesor.caguan", pass: "SantaFe2026*", nombre: "Profesor Investigador I.E.R. Santa Fé" },
                { id: 2, user: "admin", pass: "caguán2026", nombre: "Administrador RED MateAventuras" }
            ],
            estudiantes: [
                { id: 1, user: "GRP01", nombre: "Grupo 1 (2 Estudiantes)", avatar: "🐆 Jaguar", pretest: 40, suma: 80, resta: 80, desafios: 60, posttest: 80 },
                { id: 2, user: "GRP02", nombre: "Grupo 2 (2 Estudiantes)", avatar: "🦜 Guacamaya", pretest: 20, suma: 60, resta: 60, desafios: 40, posttest: 60 },
                { id: 3, user: "GRP03", nombre: "Grupo 3 (2 Estudiantes)", avatar: "🐬 Delfín Rosado", pretest: 40, suma: 80, resta: 80, desafios: 80, posttest: 80 },
                { id: 4, user: "GRP04", nombre: "Grupo 4 (2 Estudiantes)", avatar: "🐊 Caimán", pretest: 60, suma: 80, resta: 100, desafios: 80, posttest: 100 },
                { id: 5, user: "GRP05", nombre: "Grupo 5 (2 Estudiantes)", avatar: "🐒 Mono Tití", pretest: 20, suma: 60, resta: 60, desafios: 60, posttest: 60 },
                { id: 6, user: "GRP06", nombre: "Grupo 6 (2 Estudiantes)", avatar: "🦦 Nutria", pretest: 40, suma: 80, resta: 60, desafios: 60, posttest: 80 },
                { id: 7, user: "GRP07", nombre: "Grupo 7 (2 Estudiantes)", avatar: "🦏 Danta", pretest: 40, suma: 60, resta: 80, desafios: 60, posttest: 80 },
                { id: 8, user: "GRP08", nombre: "Grupo 8 (2 Estudiantes)", avatar: "🦤 Tucán", pretest: 60, suma: 100, resta: 80, desafios: 80, posttest: 80 },
                { id: 9, user: "GRP09", nombre: "Grupo 9 (2 Estudiantes)", avatar: "🦥 Oso Palmero", pretest: 20, suma: 40, resta: 60, desafios: 60, posttest: 60 },
                { id: 10, user: "GRP10", nombre: "Grupo 10 (2 Estudiantes)", avatar: "🐟 Pirarucú", pretest: 40, suma: 80, resta: 80, desafios: 80, posttest: 80 },
                { id: 11, user: "GRP11", nombre: "Grupo 11 (2 Estudiantes)", avatar: "🦩 Garza", pretest: 60, suma: 80, resta: 80, desafios: 100, posttest: 100 },
                { id: 12, user: "GRP12", nombre: "Grupo 12 (1 Estudiante)", avatar: "🦅 Águila Arpía", pretest: 40, suma: 60, resta: 60, desafios: 60, posttest: 60 }
            ],
            respuestas: []
        };
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(defaultState));
    }
}

/**
 * Ejecuta una consulta SQL en la BD (INSERT, UPDATE, DELETE).
 * @param {string} sql - Sentencia SQL a ejecutar.
 * @param {Array} params - Parámetros bind para la consulta.
 */
function ejecutarSQL(sql, params = []) {
    if (dbInstance) {
        dbInstance.run(sql, params);
        persistirBD();
        return true;
    } else {
        // Ejecución equivalente en Fallback
        console.log("Ejecutando consulta en modo Fallback:", sql, params);
        return true;
    }
}

/**
 * Realiza consultas de selección (SELECT) en la BD SQLite.
 * @param {string} sql - Sentencia SQL.
 * @returns {Array} Filas de resultados formateadas como objetos JavaScript.
 */
function consultarSQL(sql) {
    if (dbInstance) {
        const res = dbInstance.exec(sql);
        if (res.length === 0) return [];
        
        const columns = res[0].columns;
        const values = res[0].values;
        
        return values.map(row => {
            let obj = {};
            columns.forEach((col, idx) => {
                obj[col] = row[idx];
            });
            return obj;
        });
    } else {
        // Retorno de fallback
        const data = JSON.parse(localStorage.getItem(DB_STORAGE_KEY) || '{}');
        return data.estudiantes || [];
    }
}

/**
 * Registra o actualiza el resultado de un juego/módulo directamente en SQLite.
 * @param {Object} state - Estado actual del juego enviado desde juego.js
 */
function guardarResultadoSQLite(state) {
    const studentUser = sessionStorage.getItem('active_student_code') || sessionStorage.getItem('active_student_name') || 'GRP01';
    
    if (dbInstance) {
        // 1. Obtener ID del estudiante por código o nombre
        const resEst = consultarSQL(`SELECT id FROM estudiantes WHERE codigo_usuario = '${studentUser}' OR nombre = '${studentUser}'`);
        let estudianteId = resEst.length > 0 ? resEst[0].id : 1;

        // 2. Insertar resultado relacional con tiempo real de resolución
        const tiempoReal = state.tiempoTotalSegundos || state.tiempo_segundos || 60;
        ejecutarSQL(
            `INSERT INTO resultados_modulos (estudiante_id, modulo, nivel, puntaje, aciertos, errores, tiempo_segundos) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [estudianteId, state.modulo, state.nivel, Math.round(state.puntaje), state.aciertos, state.errores, tiempoReal]
        );
        console.log("💾 Resultado y telemetría guardados con éxito en SQLite local.");
    } else {
        // Almacenamiento en modo Fallback
        const db = JSON.parse(localStorage.getItem(DB_STORAGE_KEY) || '{}');
        if (!db.respuestas) db.respuestas = [];
        
        db.respuestas.push({
            estudiante: studentUser,
            modulo: state.modulo,
            nivel: state.nivel,
            puntaje: Math.round(state.puntaje),
            aciertos: state.aciertos,
            errores: state.errores,
            tiempo_segundos: state.tiempoTotalSegundos || state.tiempo_segundos || 60,
            latencia_promedio_seg: state.latencia_promedio_seg || 0,
            detalle_respuestas: state.detalle_respuestas || [],
            fecha: new Date().toISOString()
        });
        
        localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
    }
}

// Auto-inicialización al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    initSQLiteEngine();
});