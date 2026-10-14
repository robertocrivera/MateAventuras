# 📊 INFORME TÉCNICO Y PEDAGÓGICO DEL PROYECTO
## Recurso Educativo Digital: **MateAventuras Offline**
### Fortalecimiento del Pensamiento Numérico y Resolución de Problemas Aditivos
**Institución Educativa Rural Santa Fé del Caguán — Cartagena del Chairá (Caquetá)**  
**Maestría en Recursos Digitales Aplicados a la Educación — Universidad de Cartagena**

---

## 1. RESUMEN EJECUTIVO Y FICHA TÉCNICA

| Parámetro | Detalle |
| :--- | :--- |
| **Nombre del Software** | **MateAventuras Offline** |
| **Versión Actual** | 2.5 (Edición Salón Offline — Caguán) |
| **Tipo de Aplicación** | Aplicación Web Progresiva (PWA) de arquitectura *Offline-First* |
| **Población Beneficiaria** | Estudiantes de Grado 5° de Básica Primaria (23 estudiantes en 12 grupos de trabajo) |
| **Área Disciplinar** | Matemáticas (Pensamiento Numérico y Resolución de Problemas Aditivos) |
| **Contextualización** | Actividades comerciales, agropecuarias y fluviales de la cuenca del Río Caguán |
| **Infraestructura Requerida** | Cero internet requerido; red Wi-Fi local interna o despliegue autónomo vía USB |
| **Base de Datos** | Motor dual SQLite3 local (WebAssembly/sql.js) + persistencia en LocalStorage |
| **Métricas de Investigación**| Ganancia de Hake ($g$), latencia psicométrica por ítem (segundos), racha y aciertos |

---

## 2. DESCRIPCIÓN Y PROPÓSITO DEL PROYECTO

**MateAventuras Offline** es un Recurso Educativo Digital (RED) diseñado para responder a las particularidades socio-educativas de la zona rural del Caquetá. El software busca superar la brecha de conectividad digital mediante una plataforma interactiva, gamificada e inclusiva que permite a los estudiantes de 5° de primaria ejercitar y afianzar la resolución de problemas aditivos (suma y resta con números naturales en situaciones cotidianas de compra, venta, cambio, cálculo de presupuestos y fletes fluviales).

El proyecto integra:
1. **La pedagogía activa y el aprendizaje significativo**, situando las matemáticas en la cotidianidad campesina y ribereña.
2. **El Diseño Universal para el Aprendizaje (DUA)**, incorporando lectura de voz alta de enunciados y retroalimentaciones adaptadas para estudiantes con dificultades lectoras o visuales.
3. **La analítica de aprendizaje (Learning Analytics)**, que provee al docente investigador datos cuantitativos de precisión (tiempos de respuesta, curva de error y ganancia de aprendizaje pretest vs. posttest) para sustentar la tesis de maestría.

---

## 3. INFRAESTRUCTURA Y ARQUITECTURA TECNOLÓGICA

El sistema fue concebido bajo el paradigma **Offline-First**, garantizando que el 100% de sus funcionalidades estén disponibles sin requerir conexión a internet ni servidores externos en la nube.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ARQUITECTURA DEL SISTEMA                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  CAPA DE CLIENTE (Dispositivos Estudiantes: 12 Equipos / Grupos GRP01-GRP12) │
│  - Navegador Web Moderno (Chrome / Edge / Firefox)                          │
│  - Interfaz Táctil 3D y Teclado (HTML5 Semántico + CSS3 Glassmorphism)      │
│  - Síntesis de Voz Web Speech API con transcriptor fonético numérico         │
│  - PWA Service Worker (mateaventuras-caguan-v6) -> Cache API local          │
├─────────────────────────────────────────────────────────────────────────────┤
│  CAPA DE PERSISTENCIA Y ANALÍTICA LOCAL                                     │
│  - SQLite3 Engine (sql.js compilado en WebAssembly)                         │
│  - Espejo de redundancia en HTML5 Web Storage (LocalStorage)                │
│  - Telemetría Psicométrica por ítem (ID, Latencia en segs, Acierto/Error)   │
├─────────────────────────────────────────────────────────────────────────────┤
│  CAPA DE SERVIDOR LOCAL DE AULA (Computador Servidor del Docente)           │
│  - Servidor TCP Multihilo en PowerShell / Python (0.0.0.0:8000)             │
│  - Emisión de Zona Wi-Fi Local (Windows Mobile Hotspot / Router sin internet)│
│  - Panel Docente: Motor de Cálculo Hake, Exportador PDF y CSV (SPSS/Excel)  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.1. Componentes del Stack Tecnológico
- **Frontend:** HTML5, CSS3 moderno con variables dinámicas, diseño responsivo táctil (adaptado tanto a computadores portátiles como a tablets), JavaScript ES6+ Vanilla sin sobrecarga de frameworks.
- **Service Worker (`sw.js`):** Gestiona el almacenamiento en caché de todos los recursos (imágenes, hojas de estilo, motores lógicos y páginas). Una vez cargado por primera vez, el equipo puede incluso apagar el Wi-Fi y la aplicación sigue operando.
- **Motor de Datos Local:** Implementación dual:
  1. *SQLite3*: Esquema relacional formal (`db/schema.sql`) para validación estructurada.
  2. *LocalStorage*: Persistencia inmediata que sobrevive al cierre del navegador o reinicio del equipo.
- **Servidor de Aula Ligero Multihilo:**
  - `INICIAR_MATEAVENTURAS.bat`: Lanzador turnkey de un solo clic.
  - `servidor_aula.py`: Servidor HTTP en Python con detección automática de interfaces de red y priorización de la IP de Hotspot (`192.168.137.1`).
  - `servidor_aula.ps1`: Servidor nativo de Windows basado en sockets TCP multihilo (`TcpListener`), eliminando cualquier dependencia de software adicional (no requiere Node.js ni Python).

### 3.2. Estrategias de Despliegue en Aulas Rurales
1. **Despliegue en Red Wi-Fi Local (Recomendado):** Un computador docente emite red Wi-Fi (Hotspot o router común sin internet). Los 12 equipos se conectan a `http://192.168.137.1:8000` (o la IP asignada) y juegan simultáneamente.
2. **Despliegue vía Smartphone como Switch:** Un teléfono celular en modo "Punto de acceso Wi-Fi" (con datos móviles apagados) interconecta al docente y los 12 equipos sin costo alguno.
3. **Despliegue Autónomo vía USB:** Cada computador ejecuta el software directamente en su navegador desde una memoria USB. Al final de la sesión, los datos se consolidan mediante la herramienta de exportación JSON integrada.

---

## 4. FUNCIONALIDAD DEL SISTEMA: EXPERIENCIA DEL ESTUDIANTE

### 4.1. Organización de Grupos y Avatares de la Amazonía
Para optimizar el uso de los 12 computadores disponibles para los 23 estudiantes de la institución, la plataforma organiza a los participantes en **12 Grupos Colaborativos** (11 grupos en parejas y 1 grupo individual). Cada grupo se identifica mediante un avatar inspirado en la fauna del Río Caguán:

- **Grupo 01:** 🐆 Jaguar del Caguán
- **Grupo 02:** 🦜 Guacamaya Macao
- **Grupo 03:** 🐬 Delfín Rosado
- **Grupo 04:** 🐊 Caimán Llanero
- **Grupo 05:** 🐒 Mono Tití
- **Grupo 06:** 🦦 Nutria Gigante
- **Grupo 07:** 🦏 Danta Amazónica
- **Grupo 08:** 🦤 Tucán Pechiblanco
- **Grupo 09:** 🦥 Oso Palmero
- **Grupo 10:** 🐟 Pirarucú
- **Grupo 11:** 🦩 Garza Morena
- **Grupo 12:** 🦅 Águila Arpía

### 4.2. Módulo de Diagnóstico de Entrada (Pre-test)
- **Objetivo:** Establecer la línea base del pensamiento numérico antes de la intervención pedagógica.
- **Configuración de Vidas:** **Ilimitadas** (`♾️ Intentos Ilimitados`). El estudiante no es expulsado por errores; todos completan los 5 ítems para garantizar la integridad psicométrica de la muestra.
- **Telemetría Registrada:** Número de aciertos, errores, tiempo total de la prueba y latencia exacta en segundos de cada una de las 5 preguntas.

### 4.3. Rutas de Entrenamiento Gamificado
1. **Módulo 1: Mercado Rural (Suma / Adición):**
   - Problemas contextualizados en venta de queso costeño, bultos de yuca, cosecha de plátano, pesaje de ganado y transporte fluvial.
   - Niveles: Básico, Intermedio y Avanzado.
2. **Módulo 2: Calculando el Cambio (Resta / Sustracción):**
   - Situaciones de pago con billetes de alta denominación ($10.000, $20.000, $50.000, $100.000), cálculo de vueltas, descuentos y control de gastos en la finca.
   - Niveles: Básico, Intermedio y Avanzado.
3. **Módulo 3: Desafíos del Caguán (Operaciones Combinadas):**
   - Retos contextuales que combinan ingresos y egresos, fletes de lanchas por galones de gasolina y presupuestos de acueductos veredales.

### 4.4. Dinámica de Gamificación y DUA
- **Mecánica de Vidas y Rachas:** 3 corazones animados en las fases de entrenamiento. Multiplicador de racha con llama animada (`🔥 Racha`) para premiar la perseverancia.
- **Barajado Aleatorio (Fisher-Yates):** En cada partida, las respuestas A, B, C y D se mezclan aleatoriamente, erradicando vicios de memorización por posición.
- **Andamiaje Formativo:** Al cometer un error, el sistema destaca la respuesta correcta y despliega una explicación paso a paso de la operación matemática.
- **Accesibilidad por Voz (DUA):** Botón de audio `🔊` que vocaliza las preguntas y explicaciones. Dispone de un algoritmo convertidor numérico a palabras (`numeroALetras`), logrando que cifras como `$15.800.000` sean pronunciadas como *"quince millones ochocientos mil pesos"*, evitando pausas o lecturas erradas en inglés.

### 4.5. Evaluación Final (Post-test) y Diploma de Honor
- **Post-test:** Módulo sumativo equivalente al pre-test que permite medir el avance de los estudiantes.
- **Diploma de Excelencia Matemática:**
  - Al culminar la ruta, los estudiantes pueden reclamar su diploma conmemorativo.
  - Incluye el **escudo oficial de la Universidad de Cartagena**, la mención a la Institución Educativa Rural Santa Fé del Caguán, el nombre personalizado del alumno, fecha y registro digital único.
  - Diagramado con CSS estricto para encajar con elegancia en **1 sola hoja tamaño Carta horizontal (Letter landscape)** al imprimir o guardar en PDF.

---

## 5. FUNCIONALIDAD DEL PANEL DOCENTE Y LEARNING ANALYTICS

El portal docente (`login-docente.html`, usuario: `docente`, clave: `caguan2026`) ofrece una suite analítica diseñada específicamente para la recolección de evidencias de la tesis de maestría:

### 5.1. Ganancia de Aprendizaje Formal (Índice de Hake)
El sistema calcula automáticamente la ganancia normalizada de Hake:
$$g = \frac{\text{Postest} - \text{Pretest}}{100 - \text{Pretest}}$$

Clasificando a cada grupo en:
- **Ganancia Alta:** $g \ge 0.70$ (Verde)
- **Ganancia Media:** $0.30 \le g < 0.70$ (Azul)
- **Ganancia Baja:** $g < 0.30$ (Ámbar)

### 5.2. Telemetría de Tiempos y Psicométrica
- Gráficos comparativos de rendimiento por módulo.
- Cronometría y latencia promedio por ítem (demuestra empíricamente la automatización y fluidez del cálculo mental tras la intervención).
- Filtro individual por grupo (`Grupo 1` a `Grupo 12`) o vista global de aula.

### 5.3. Exportación y Respaldo de Evidencias
1. **Reporte en PDF Oficial:** Genera un documento con membrete institucional, tablas estadísticas de los 12 grupos y firmas para presentar directamente al director o asesor de tesis.
2. **Exportación a CSV (Excel / SPSS):** Descarga una matriz estructurada con todas las variables cuantitativas lista para pruebas estadísticas (t de Student, Wilcoxon, correlaciones).
3. **Respaldo Integral en JSON:** Botón *"📦 Guardar Copia Salón (.json)"* que crea un archivo de seguridad con toda la base de datos para transferirlo mediante memoria USB.

---

## 6. IMPACTO SOCIAL Y EDUCATIVO EN EL CONTEXTO RURAL

1. **Inclusión Tecnológica Real:** Demuestra que la falta de conectividad a internet en las veredas de Cartagena del Chairá no es un obstáculo para implementar herramientas digitales de alta gama pedagógica.
2. **Revalorización del Territorio:** Al utilizar personajes, flora, fauna y situaciones de mercado propias del Río Caguán, las matemáticas cobran sentido práctico para el estudiante del campo.
3. **Rigor Investigativo:** Automatiza la toma de datos psicométricos y evaluativos, garantizando la validez interna y externa de la investigación de posgrado.

---

*Documento técnico y pedagógico elaborado para el proyecto de investigación de Maestría en Recursos Digitales Aplicados a la Educación.*
