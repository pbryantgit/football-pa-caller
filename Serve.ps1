# Simple static file server for testing PA Play Caller
# Usage: run this script; it serves files from dist/ on http://localhost:8000/

$prefix = "http://localhost:8000/"
$root = Join-Path $PSScriptRoot "dist"

if (-not (Test-Path $root)) {
    Write-Output "dist folder not found. Building project..."
    $env:Path += ";C:\Program Files\nodejs"
    npm run build
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
try {
    $listener.Start()
    Write-Output "Serving PA Play Caller App on $prefix"
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        Start-Job -ArgumentList $context, $root -ScriptBlock {
            param($context, $root)
            try {
                $request = $context.Request
                $urlPath = $request.Url.LocalPath.TrimStart('/')
                if ([string]::IsNullOrEmpty($urlPath)) { $urlPath = 'index.html' }
                $filePath = Join-Path $root $urlPath
                if (Test-Path $filePath) {
                    $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                    switch ($ext) {
                        '.html' { $ctype = 'text/html' }
                        '.css' { $ctype = 'text/css' }
                        '.js' { $ctype = 'application/javascript' }
                        '.json' { $ctype = 'application/json' }
                        '.csv' { $ctype = 'text/csv' }
                        default { $ctype = 'application/octet-stream' }
                    }
                    $bytes = [System.IO.File]::ReadAllBytes($filePath)
                    $context.Response.ContentType = $ctype
                    $context.Response.StatusCode = 200
                    $context.Response.ContentLength64 = $bytes.Length
                    $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
                } else {
                    $msg = "404 Not Found: $urlPath"
                    $b = [System.Text.Encoding]::UTF8.GetBytes($msg)
                    $context.Response.StatusCode = 404
                    $context.Response.ContentType = 'text/plain'
                    $context.Response.ContentLength64 = $b.Length
                    $context.Response.OutputStream.Write($b, 0, $b.Length)
                }
            } catch {
                # ignore per-request errors
            } finally {
                $context.Response.OutputStream.Close()
            }
        } | Out-Null
    }
} catch {
    Write-Error $_.Exception.Message
} finally {
    if ($listener.IsListening) { $listener.Stop() }
    $listener.Close()
}
