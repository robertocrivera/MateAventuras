# Servidor de Aula Offline en PowerShell (Cero Instalaciones, Sin restricciones HTTP.SYS)
# MateAventuras - I.E.R. Santa Fe del Caguan

$Port = 8000
$BaseFolder = $PSScriptRoot

# Obtener IPs locales
$IPs = [System.Net.Dns]::GetHostAddresses([System.Net.Dns]::GetHostName()) | 
       Where-Object { $_.AddressFamily -eq 'InterNetwork' -and $_.IPAddressToString -notmatch '^127\.' } | 
       Select-Object -ExpandProperty IPAddressToString

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "       MATEAVENTURAS - SERVIDOR DE AULA (POWERSHELL)              " -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Estado: SERVIDOR ACTIVO" -ForegroundColor Green
Write-Host "Puerto: $Port"

$HotspotIP = $IPs | Where-Object { $_ -like "192.168.137.*" } | Select-Object -First 1

if ($HotspotIP) {
    Write-Host "`n[DIRECCION PARA LOS 12 EQUIPOS DE ESTUDIANTES]:" -ForegroundColor Yellow
    Write-Host "   >>> http://${HotspotIP}:${Port} <<<" -ForegroundColor Green
} else {
    Write-Host "`nDirecciones IP detectadas:" -ForegroundColor Yellow
    foreach ($ip in $IPs) {
        Write-Host "   -> http://${ip}:${Port}" -ForegroundColor Green
    }
}

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Presione Ctrl + C para detener el servidor.`n" -ForegroundColor Gray

# Intentar abrir el navegador del docente
Start-Process "http://localhost:$Port"

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".wasm" = "application/wasm"
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
try {
    $listener.Server.SetSocketOption([System.Net.Sockets.SocketOptionLevel]::Socket, [System.Net.Sockets.SocketOptionName]::ReuseAddress, $true)
} catch {}
$listener.Start()

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        
        try {
            $buffer = New-Object byte[] 4096
            $bytesRead = $stream.Read($buffer, 0, $buffer.Length)
            if ($bytesRead -gt 0) {
                $requestText = [System.Text.Encoding]::UTF8.GetString($buffer, 0, $bytesRead)
                $firstLine = ($requestText -split "`r`n")[0]
                $tokens = $firstLine -split " "
                
                if ($tokens.Length -ge 2 -and ($tokens[0] -eq "GET" -or $tokens[0] -eq "HEAD")) {
                    $rawPath = $tokens[1].Split('?')[0].TrimStart('/')
                    if ([string]::IsNullOrWhiteSpace($rawPath) -or $rawPath -eq '/') {
                        $rawPath = "index.html"
                    }
                    $rawPath = [System.Uri]::UnescapeDataString($rawPath)
                    $localPath = Join-Path $BaseFolder $rawPath
                    
                    if (Test-Path $localPath -PathType Leaf) {
                        $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
                        $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
                        $fileBytes = [System.IO.File]::ReadAllBytes($localPath)
                        
                        $header = "HTTP/1.1 200 OK`r`n" +
                                  "Content-Type: $mime`r`n" +
                                  "Content-Length: $($fileBytes.Length)`r`n" +
                                  "Access-Control-Allow-Origin: *`r`n" +
                                  "Cache-Control: no-cache`r`n" +
                                  "Connection: close`r`n`r`n"
                        
                        $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                        $stream.Write($headerBytes, 0, $headerBytes.Length)
                        if ($tokens[0] -eq "GET") {
                            $stream.Write($fileBytes, 0, $fileBytes.Length)
                        }
                    } else {
                        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 No encontrado: $rawPath")
                        $header = "HTTP/1.1 404 Not Found`r`n" +
                                  "Content-Type: text/plain; charset=utf-8`r`n" +
                                  "Content-Length: $($msg.Length)`r`n" +
                                  "Connection: close`r`n`r`n"
                        $headerBytes = [System.Text.Encoding]::UTF8.GetBytes($header)
                        $stream.Write($headerBytes, 0, $headerBytes.Length)
                        $stream.Write($msg, 0, $msg.Length)
                    }
                }
            }
        } catch {
            # Continuar en caso de desconexion abrupta de cliente
        } finally {
            $stream.Close()
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
}
