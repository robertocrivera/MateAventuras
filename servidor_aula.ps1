# Servidor de Aula Offline en PowerShell (Cero Instalaciones)
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

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://*:$Port/")
try {
    $listener.Start()
} catch {
    Write-Warning "Nota: Para escuchar en todas las interfaces sin privilegios de administrador, usando localhost/puerto o ejecute como Administrador si Windows lo restringe."
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Start()
}

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

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $rawUrl = $request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($rawUrl) -or $rawUrl -eq '/') {
            $rawUrl = "index.html"
        }
        $rawUrl = [System.Uri]::UnescapeDataString($rawUrl)
        $localPath = Join-Path $BaseFolder $rawUrl

        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }
            
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            $response.Headers.Add("Cache-Control", "no-cache")
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $msg = [System.Text.Encoding]::UTF8.GetBytes("404 No encontrado: $rawUrl")
            $response.OutputStream.Write($msg, 0, $msg.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
