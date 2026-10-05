-- Creación de Tablas SQLite para el RED MateAventuras (I.E.R. Santa Fé del Caguán)
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
    integrantes INTEGER DEFAULT 2,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resultados_modulos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    modulo TEXT NOT NULL, -- 'pretest', 'mercado_suma', 'calculando_cambio', 'desafios_caguan', 'posttest'
    nivel TEXT NOT NULL,  -- 'General', 'Basico', 'Intermedio', 'Avanzado'
    puntaje INTEGER NOT NULL,
    aciertos INTEGER NOT NULL,
    errores INTEGER NOT NULL,
    tiempo_segundos INTEGER NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(estudiante_id) REFERENCES estudiantes(id)
);

-- Datos iniciales de docentes
INSERT OR IGNORE INTO docentes (usuario, password, nombre) 
VALUES 
('profesor.caguan', 'SantaFe2026*', 'Profesor Investigador I.E.R. Santa Fé'),
('admin', 'caguán2026', 'Administrador RED MateAventuras');

-- 12 Grupos colaborativos para los 12 computadores disponibles (23 estudiantes en total)
INSERT OR IGNORE INTO estudiantes (codigo_usuario, nombre, avatar, integrantes) 
VALUES 
('GRP01', 'Grupo 1 (Jaguares)', '🐆 Jaguar', 2),
('GRP02', 'Grupo 2 (Guacamayas)', '🦜 Guacamaya', 2),
('GRP03', 'Grupo 3 (Delfines Rosados)', '🐬 Delfín Rosado', 2),
('GRP04', 'Grupo 4 (Caimanes)', '🐊 Caimán', 2),
('GRP05', 'Grupo 5 (Monos Tití)', '🐵 Mono Tití', 2),
('GRP06', 'Grupo 6 (Nutrias)', '🦦 Nutria', 2),
('GRP07', 'Grupo 7 (Dantas)', '🦛 Danta', 2),
('GRP08', 'Grupo 8 (Tucanes)', '🪶 Tucán', 2),
('GRP09', 'Grupo 9 (Osos Palmeros)', '🐾 Oso Hormiguero', 2),
('GRP10', 'Grupo 10 (Pirarucús)', '🐟 Pirarucú', 2),
('GRP11', 'Grupo 11 (Garzas)', '🦢 Garza', 2),
('GRP12', 'Grupo 12 (Águilas)', '🦅 Águila Arpía', 1);