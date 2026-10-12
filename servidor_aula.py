# -*- coding: utf-8 -*-
"""
Servidor de Aula Offline - MateAventuras
I.E.R. Santa Fe del Caguan
Permite compartir MateAventuras a traves de Hotspot WiFi a los 12 equipos de estudiantes.
"""

import http.server
import socketserver
import socket
import webbrowser
import os
import sys

PUERTO = 8000

def obtener_direcciones_ip():
    """Detecta las direcciones IP locales disponibles."""
    ips = []
    try:
        hostname = socket.gethostname()
        for ip in socket.gethostbyname_ex(hostname)[2]:
            if not ip.startswith("127."):
                ips.append(ip)
    except Exception:
        pass

    # Metodo alternativo conectando a socket simulado
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip_activa = s.getsockname()[0]
        s.close()
        if ip_activa not in ips and not ip_activa.startswith("127."):
            ips.append(ip_activa)
    except Exception:
        pass

    # Si se detecta 192.168.137.1 (Hotspot de Windows), priorizarla
    ips_priorizadas = []
    for ip in ips:
        if ip.startswith("192.168.137."):
            ips_priorizadas.insert(0, ip)
        else:
            ips_priorizadas.append(ip)
    
    return ips_priorizadas if ips_priorizadas else ["127.0.0.1"]

class ManejadorConMime(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Desactivar cache estricto para desarrollo o cambios en caliente
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        # Habilitar CORS basico para recursos locales
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def iniciar_servidor():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    ips = obtener_direcciones_ip()
    
    ip_hotspot = None
    for ip in ips:
        if ip.startswith("192.168.137."):
            ip_hotspot = ip
            break

    print("=" * 66)
    print("      MATEAVENTURAS - SERVIDOR DE AULA OFFLINE (CAGUAN)       ")
    print("=" * 66)
    print(" Estado: SERVIDOR ACTIVO")
    print(f" Puerto local: {PUERTO}")
    print("-" * 66)
    
    if ip_hotspot:
        print(f" [RECOMENDADA - ZONA WIFI/HOTSPOT]:")
        print(f"   >>> http://{ip_hotspot}:{PUERTO} <<<")
        print("   (Esta es la direccion que deben escribir los 12 equipos)")
    else:
        print(" Direcciones IP detectadas en este equipo:")
        for ip in ips:
            print(f"   -> http://{ip}:{PUERTO}")
    
    print("-" * 66)
    print(" INSTRUCCIONES PARA EL DOCENTE:")
    print(" 1. Conecte los 12 computadores/tablets a la red WiFi de este PC.")
    print(" 2. En el navegador de cada estudiante, abra la direccion indicada arriba.")
    print(" 3. En este PC (Docente), abra: http://localhost:8000")
    print(" 4. Para DETENER el servidor, presione Ctrl + C en esta ventana.")
    print("=" * 66)
    
    # Abrir navegador del docente automaticamente
    try:
        url_docente = f"http://localhost:{PUERTO}"
        print(f"Abriendo {url_docente} en el navegador del docente...")
        webbrowser.open(url_docente)
    except Exception:
        pass

    Handler = ManejadorConMime
    # Permitir reutilizacion de socket rapidamente
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PUERTO), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido por el docente.")

if __name__ == '__main__':
    iniciar_servidor()

