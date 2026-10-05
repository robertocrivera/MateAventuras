# 🌴 MateAventuras Offline

**Recurso Educativo Digital (RED) Offline para el fortalecimiento del pensamiento numérico y habilidades operacionales en educación básica rural.**  
**Proyecto de Investigación de Maestría** — *Institución Educativa Rural Santa Fé del Caguán, Cartagena del Chairá, Caquetá, Colombia (2026).*

---

## 📌 Descripción del Proyecto

**MateAventuras** es una aplicación web interactiva y progresiva (PWA) diseñada para operar de forma **100% offline** en contextos rurales con conectividad limitada o nula. El recurso fortalece las competencias en resolución de problemas aditivos y sustrácticos contextualizados en la economía fluvial y agropecuaria de la región del Río Caguán (Grado 5° de básica primaria).

El proyecto integra:
- **Gamificación Didáctica:** Sistema de vidas, racha de aciertos, temporizador en tiempo real y retroalimentación pedagógica paso a paso con Text-to-Speech nativo.
- **Díadas de Aprendizaje Colaborativo:** Adaptado para 12 computadores de aula y 23 estudiantes distribuidos en 12 grupos de trabajo (`GRP01` a `GRP12`) con mascotas de la fauna regional amazónica.
- **Learning Analytics & Telemetría:** Medición de latencia de respuesta (cronometría precisa) y psicometría de errores.
- **Dashboard Docente Cuasiexperimental:** Cálculo automático del factor de Ganancia Normalizada de Hake ($g$), matrices comparativas Pre-test vs. Post-test, exportación de datos a **CSV (para SPSS / Jamovi / R)** y generación de informes oficiales en **PDF**.
- **Persistencia Relacional Local:** Motor SQLite offline respaldado por WebAssembly (`sql.js`) y sincronización en LocalStorage.

---

## 🚀 Estructura de Módulos Pedagógicos

1. **Pre-test Diagnóstico:** Evaluación inicial de línea base (problemas aditivos de varios dígitos y situaciones contextualizadas).
2. **Mercado Campesino del Caguán:** Desafíos de adición y cálculo de presupuestos en compras de productos típicos.
3. **Calculando el Cambio:** Desafíos de sustracción y manejo de transacciones comerciales cotidianas.
4. **Desafíos del Río:** Problemas combinados con contexto fluvial y ganadero.
5. **Post-test Sumativo:** Medición final del aprendizaje para determinar el factor de ganancia.

---

## 💻 Ejecución Local

Dado que la aplicación incluye un *Service Worker* para caché offline y módulos WebAssembly, se recomienda ejecutarla a través de un servidor web local ligero:

### Opción 1: Con Python (Recomendada)
```bash
python -m http.server 8000
```
Luego abre tu navegador en: `http://localhost:8000`

### Opción 2: Con Node.js
```bash
npx serve -l 8000
```
O también:
```bash
npx http-server -p 8000
```

---

## 🔐 Credenciales de Acceso Docente

Para ingresar al panel de seguimiento y evaluación ([login-docente.html](login-docente.html)):

| Perfil | Usuario | Contraseña |
| :--- | :---: | :---: |
| **Docente Investigador** | `profesor.caguan` | `SantaFe2026*` |
| **Administrador RED** | `admin` | `caguán2026` |

---

## 📁 Estructura del Repositorio

```text
├── css/
│   └── main.css                  # Hoja de estilos con diseño responsivo y tactile cards 3D
├── db/
│   └── schema.sql                # Esquema relacional SQLite con tablas de docentes, grupos y resultados
├── img/
│   └── logo.png                  # Identidad gráfica institucional y del RED
├── js/
│   ├── sqlite-engine.js          # Motor de base de datos relacional SQLite local
│   ├── docente.js                # Lógica del dashboard, métricas Hake y exportaciones CSV/PDF
│   └── juego.js                  # Motor del juego, Web Audio API, TTS y analítica
├── index.html                    # Acceso de estudiantes por código de grupo (GRP01 - GRP12)
├── estudiante-menu.html          # Menú de selección de módulos y diploma de honor
├── estudiante-tutorial.html      # Guía ilustrada de interacción para estudiantes
├── juego.html                    # Interfaz gamificada con HUD, cronómetro y tarjetas 3D
├── login-docente.html            # Autenticación segura local del docente
├── docente-dashboard.html        # Panel de control, gráficos nativos y Learning Analytics
├── manifest.json                 # Manifiesto PWA para instalación de la app
├── sw.js                         # Service Worker para funcionamiento 100% sin internet
└── README.md                     # Documentación técnica y metodológica
```

---

## 📄 Licencia y Derechos

Desarrollado en el marco del Proyecto de Investigación de Maestría en Educación, adscrito a la **Institución Educativa Rural Santa Fé del Caguán** (Cartagena del Chairá, Caquetá). Todos los derechos reservados © 2026.
