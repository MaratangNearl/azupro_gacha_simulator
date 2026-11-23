[CmdletBinding()]
param(
    [ValidateRange(1024, 65535)]
    [int] $Port = 8789
)

$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'public'))
$rootPrefix = $root + [IO.Path]::DirectorySeparatorChar
$types = @{
    '.html' = 'text/html; charset=utf-8'
    '.js' = 'text/javascript; charset=utf-8'
    '.css' = 'text/css; charset=utf-8'
    '.svg' = 'image/svg+xml'
    '.woff2' = 'font/woff2'
    '.png' = 'image/png'
    '.jpg' = 'image/jpeg'
    '.webp' = 'image/webp'
    '.txt' = 'text/plain; charset=utf-8'
}

$listener = [Net.Sockets.TcpListener]::new([Net.IPAddress]::Loopback, $Port)
try {
    $listener.Start()
    Write-Host "Open http://127.0.0.1:$Port/ (Ctrl+C to stop)"
    while ($true) {
        # Keep waiting interruptible with Ctrl+C.
        if (!$listener.Pending()) {
            Start-Sleep -Milliseconds 30
            continue
        }

        $client = $listener.AcceptTcpClient()
        try {
            $stream = $client.GetStream()
            $stream.ReadTimeout = 1000
            $stream.WriteTimeout = 3000
            $reader = [IO.StreamReader]::new($stream)
            $request = $reader.ReadLine()
            if ($request -notmatch '^(GET|HEAD) /([a-zA-Z0-9._/-]*)(?:\?\S*)? HTTP/1\.[01]$') {
                continue
            }

            $method = $Matches[1]
            $relativePath = $Matches[2].TrimStart('/')
            if (!$relativePath) { $relativePath = 'index.html' }
            $file = [IO.Path]::GetFullPath([IO.Path]::Combine($root, $relativePath))

            while ($reader.ReadLine()) {}

            $status = '404 Not Found'
            $type = 'text/plain; charset=utf-8'
            $body = [Text.Encoding]::UTF8.GetBytes('Not found')
            if ($file.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase) -and [IO.File]::Exists($file)) {
                $status = '200 OK'
                $type = $types[[IO.Path]::GetExtension($file)]
                if (!$type) { $type = 'application/octet-stream' }
                $body = [IO.File]::ReadAllBytes($file)
            }

            $header = [Text.Encoding]::ASCII.GetBytes(
                "HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
            )
            $stream.Write($header, 0, $header.Length)
            if ($method -eq 'GET') { $stream.Write($body, 0, $body.Length) }
        } catch [IO.IOException] {
            # An idle or closed browser connection should not stop the preview.
        } finally {
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
}
