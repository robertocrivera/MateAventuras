@echo off
title Habilitar Puerto 8000 para MateAventuras en Firewall
echo ====================================================================
echo        HABILITAR PUERTO 8000 EN FIREWALL DE WINDOWS
echo ====================================================================
echo.
echo Este script abre el puerto TCP 8000 para permitir que los 12
echo computadores de los estudiantes se conecten al servidor de aula.
echo.
echo NOTA: Debe ejecutarse haciendo clic derecho -> "Ejecutar como administrador".
echo.

netsh advfirewall firewall add rule name="MateAventuras Aula (Puerto 8000)" dir=in action=allow protocol=TCP localport=8000

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ====================================================================
    echo [EXITO] Regla de firewall creada correctamente.
    echo Los estudiantes ahora podran acceder sin bloqueos.
    echo ====================================================================
) else (
    echo.
    echo [ERROR] No se pudo crear la regla. Asegurese de ejecutar como Administrador.
)

echo.
pause

