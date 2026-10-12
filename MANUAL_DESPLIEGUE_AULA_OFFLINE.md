# 🧭 MANUAL DE INSTALACIÓN Y DESPLIEGUE EN AULA OFFLINE
## Proyecto MateAventuras — I.E.R. Santa Fé del Caguán (Caquetá)

Este manual describe el procedimiento paso a paso para configurar un **computador principal (servidor del docente)** y compartir el aplicativo **MateAventuras** hacia **12 computadores o tablets de estudiantes** mediante una red Wi-Fi local interna (Hotspot), **sin necesidad de conexión a internet**.

---

### 🏛️ Arquitectura de la Red de Aula

```text
               ┌────────────────────────────────────────────────────────┐
               │              COMPUTADOR SERVIDOR (DOCENTE)             │
               │  - Ejecuta: INICIAR_MATEAVENTURAS.bat                 │
               │  - Emite red Wi-Fi Hotspot: "Aula-MateAventuras"       │
               │  - Dirección IP fija asignada: 192.168.137.1:8000       │
               └──────────────────────────┬─────────────────────────────┘
                                          │
            Onda Wi-Fi Local (Zona móvil sin necesidad de internet)
                                          │
          ┌───────────────────────────────┴───────────────────────────────┐
          │                                                               │
    ┌─────▼─────┐   ┌───────────┐   ┌───────────┐         ┌───────────────▼┐
    │  Equipo 1 │   │  Equipo 2 │   │  Equipo 3 │  ...    │   Equipo 12    │
    │  Grupo 01 │   │  Grupo 02 │   │  Grupo 03 │         │    Grupo 12    │
    │ (Delfín)  │   │ (Jaguar)  │   │ (Guacamaya│         │ (Armadillo)    │
    └───────────┘   └───────────┘   └───────────┘         └────────────────┘
      Navegador:      Navegador:      Navegador:              Navegador:
   192.168.137.1:8000 192.168.137.1:8000 ...               192.168.137.1:8000
```

---

## 📋 Requisitos Previos

1. **1 Computador Servidor (Docente):**
   - Sistema Operativo: Windows 10 o Windows 11.
   - Tarjeta Wi-Fi integrada o adaptador USB Wi-Fi.
   - La carpeta del proyecto `MateAventuras`.
2. **12 Computadores o Tablets de Estudiantes:**
   - Cualquier equipo con conexión Wi-Fi (computadores portátiles, de escritorio con Wi-Fi, tablets Android o iPads).
   - Navegador web moderno instalado (Google Chrome, Microsoft Edge, Mozilla Firefox o Safari).
3. **Memoria USB (Opcional):**
   - Para trasladar la carpeta del proyecto al computador de la escuela si no dispone de internet para descargarlo.

---

## 🚀 PASO 1: Copiar el Proyecto al Computador Servidor

1. Guarde la carpeta completa del proyecto `MateAventuras` en el computador del docente (por ejemplo en `C:\MateAventuras` o en el Escritorio).
2. Verifique que dentro de la carpeta se encuentren los archivos:
   - `INICIAR_MATEAVENTURAS.bat` (Lanzador automático de un solo clic)
   - `HABILITAR_FIREWALL_PUERTO_8000.bat` (Configurador de seguridad)
   - `servidor_aula.py` (Servidor en Python)
   - `servidor_aula.ps1` (Servidor alternativo nativo de Windows)
   - `index.html`, `js/`, `css/`, `img/`, `db/`

---

## 📶 PASO 2: Habilitar la Zona con Cobertura Inalámbrica Móvil (Hotspot)

Este paso convierte el computador del docente en una antena Wi-Fi para que los 12 equipos se conecten a él.

### En Windows 10 / Windows 11:
1. Abra la **Configuración** de Windows (presione las teclas `Windows + I`).
2. Vaya a **Red e Internet** y seleccione en el menú izquierdo o lista: **Zona con cobertura inalámbrica móvil** (Mobile Hotspot).
3. Haga clic en **Editar** para configurar:
   - **Nombre de red (SSID):** `Aula-MateAventuras` (o el nombre que prefiera).
   - **Contraseña de red:** `Caguan2026` (mínimo 8 caracteres).
   - **Banda de red:** Cualquiera o `2.4 GHz` (recomendada para mayor compatibilidad con equipos antiguos).
4. Active el interruptor: **Compartir mi conexión a Internet con otros dispositivos** en posición **ACTIVADO**.

> **💡 NOTA IMPORTANTE PARA AULAS SIN INTERNET:**
> En algunas versiones de Windows, si el computador no tiene internet, el botón de Hotspot puede mostrarse deshabilitado. Si esto ocurre:
> - **Opción A (Recomendada):** Conectar temporalmente el computador del docente a los datos de un celular por 1 minuto solo para activar el interruptor de la Zona Wi-Fi, y luego desconectar los datos móviles. El Hotspot permanecerá encendido emitiendo la red local.
> - **Opción B (Router de aula sin internet):** Si la escuela dispone de un router Wi-Fi común (incluso sin cable telefónico ni fibra), simplemente enciéndalo en el salón. Conecte el computador del docente y los 12 equipos a ese router por Wi-Fi.

---

## 🛡️ PASO 3: Abrir el Puerto 8000 en el Firewall de Windows

Para que Windows permita que los 12 computadores externos ingresen al servidor web:

1. Ubique el archivo: `HABILITAR_FIREWALL_PUERTO_8000.bat`.
2. Haga **clic derecho** sobre él y seleccione **"Ejecutar como administrador"**.
3. Aparecerá un mensaje verde que confirma: `[ÉXITO] Regla de firewall creada correctamente`.
4. Presione cualquier tecla para cerrar la ventana.

*(Este paso solo se realiza una única vez en el computador servidor).*

---

## ⚡ PASO 4: Iniciar el Servidor de Aula

1. Haga **doble clic** sobre el archivo:
   👉 **`INICIAR_MATEAVENTURAS.bat`**
2. Se abrirá una ventana de comandos con letras verdes similar a esta:

```text
==================================================================
      MATEAVENTURAS - SERVIDOR DE AULA OFFLINE (CAGUÁN)       
==================================================================
 Estado: SERVIDOR ACTIVO
 Puerto local: 8000
------------------------------------------------------------------
 [RECOMENDADA - ZONA WIFI/HOTSPOT]:
   >>> http://192.168.137.1:8000 <<<
   (Esta es la dirección que deben escribir los 12 equipos)
------------------------------------------------------------------
 INSTRUCCIONES PARA EL DOCENTE:
 1. Conecte los 12 computadores/tablets a la red WiFi de este PC.
 2. En el navegador de cada estudiante, abra la dirección indicada.
 3. En este PC (Docente), abra: http://localhost:8000
 4. Para DETENER el servidor, presione Ctrl + C en esta ventana.
==================================================================
```

3. Automáticamente se abrirá el navegador del docente mostrando la pantalla de inicio de **MateAventuras**.
4. **IMPORTANTE:** Mantenga esta ventana de comandos abierta durante toda la clase.

---

## 💻 PASO 5: Conectar los 12 Equipos de los Estudiantes

En cada uno de los 12 computadores o tablets de los alumnos:

1. **Conectarse al Wi-Fi:**
   - Buscar la red: `Aula-MateAventuras`.
   - Ingresar la contraseña: `Caguan2026`.
2. **Abrir el navegador web:**
   - Abrir **Google Chrome** o **Microsoft Edge**.
3. **Ingresar la dirección web:**
   - En la barra de direcciones superior, escribir:
     ```text
     http://192.168.137.1:8000
     ```
   - Presionar `Enter`.
4. **Selección de Grupo:**
   - Al cargar la pantalla, los estudiantes hacen clic en **"Estudiante"**.
   - Cada equipo selecciona su grupo correspondiente:
     - Computador 1 ➔ **Grupo 1 (Delfín Rosado)**
     - Computador 2 ➔ **Grupo 2 (Jaguar del Caguán)**
     - Computador 3 ➔ **Grupo 3 (Guacamaya Macao)**
     - ... hasta el **Grupo 12 (Armadillo Sabanero)**.
5. Los estudiantes realizan la prueba diagnóstica (Pre-test) y avanzan en los niveles del juego.

---

## 👨‍🏫 PASO 6: Acceso del Docente y Visualización en Vivo

Desde el computador servidor (o cualquier computador conectado a la red):

1. En el navegador, ingrese a:
   ```text
   http://localhost:8000/login-docente.html
   ```
2. Ingrese con las credenciales de investigación:
   - **Usuario:** `docente`
   - **Contraseña:** `caguan2026`
3. En el **Dashboard Docente** podrá:
   - Ver el rendimiento de los 12 grupos en tiempo real.
   - Filtrar métricas por grupo específico (`Grupo 1` a `Grupo 12`).
   - Consultar el gráfico comparativo del Pre-test diagnóstico.
   - Generar y descargar el **Reporte PDF Oficial** para el asesor de investigación.
   - Exportar los resultados en formato **CSV / Excel**.

---

## 📦 PASO 7: Guardar y Respaldar los Datos al Finalizar la Sesión

Dado que cada navegador almacena su progreso de forma independiente y segura:

1. En el Dashboard del Docente, haga clic en el botón:
   - **"📦 Guardar Copia Salón (.json)"**
2. Esto descargará un archivo con la fecha y hora de la sesión (ej. `respaldo_mateaventuras_salon_2026-10-12.json`).
3. Guarde este archivo en su memoria USB o en su carpeta de evidencias de tesis.

---

## 🔧 Solución de Problemas Frecuentes (FAQ)

| Problema | Causa probable | Solución rápida |
| :--- | :--- | :--- |
| **Los estudiantes escriben la IP y dice "No se puede acceder a este sitio"** | El Firewall de Windows está bloqueando las conexiones entrantes. | Cierre el navegador en los equipos. En el PC servidor, ejecute `HABILITAR_FIREWALL_PUERTO_8000.bat` como Administrador. Reinicie el servidor con `INICIAR_MATEAVENTURAS.bat`. |
| **Los estudiantes no ven la red Wi-Fi "Aula-MateAventuras"** | La Zona con cobertura inalámbrica está apagada. | Vuelva a activar la Zona Wi-Fi en `Configuración > Red e Internet > Zona con cobertura inalámbrica móvil`. |
| **La dirección IP que sale en la ventana no empieza por 192.168.137** | El PC no está usando Hotspot sino que está conectado a un router de la escuela. | Fíjese en la IP que muestra la ventana en verde (ejemplo: `http://192.168.1.15:8000`) y haga que los estudiantes escriban esa dirección exacta. |
| **El sintetizador de voz suena raro o no habla en alguna tablet** | El volumen está silenciado o falta activar el permiso de sonido. | Haga un clic en la pantalla de la tablet y presione el botón "🔊 Escuchar enunciado". |

---

*Manual elaborado para la investigación pedagógica en la Institución Educativa Rural Santa Fé del Caguán.*
