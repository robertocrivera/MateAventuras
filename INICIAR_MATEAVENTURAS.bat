@echo off
title MateAventuras - Servidor de Aula Offline
color 0A
cd /d "%~dp0"

echo ====================================================================
echo             MATEAVENTURAS - SERVIDOR DE AULA OFFLINE
echo       Institucion Educativa Rural Santa Fe del Caguan (Caqueta)
echo ====================================================================
echo.
echo Iniciando servidor local para los 12 equipos de estudiantes...
echo.

:: 1. Comprobar si Python esta disponible
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Python detectado en el sistema.
    echo Iniciando mediante Python en puerto 8000...
    echo.
    python servidor_aula.py
    goto FIN
)

:: 2. Comprobar si Node / npx esta disponible
where npx >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Node.js detectado en el sistema.
    echo Iniciando mediante npx serve en puerto 8000...
    echo.
    start http://localhost:8000
    npx serve . -l 8000
    goto FIN
)

:: 3. Si no hay Python ni Node, usar PowerShell (Nativo de Windows, Cero Instalacion)
echo [AVISO] Ni Python ni Node.js estan instalados.
echo Usando el servidor nativo de Windows (PowerShell)...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0servidor_aula.ps1"

:FIN
echo.
echo El servidor se ha detenido.
pause
