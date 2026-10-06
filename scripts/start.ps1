param([switch]$Lan, [switch]$NoBrowser, [int]$Port = 0)
$ErrorActionPreference = 'Stop'
$barRoot = Split-Path -Parent $PSScriptRoot
$barNodeCommand = Get-Command node -ErrorAction SilentlyContinue
$barNode = if ($barNodeCommand) { $barNodeCommand.Source } else { Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' }
if (-not (Test-Path -LiteralPath $barNode)) { throw 'Node.js 20 or later is needed to start the menu.' }
$barPort = if ($Port -gt 0) { $Port } elseif ($Lan) { 4174 } else { 4173 }
$barUrl = "http://localhost:$barPort"
$barHealthUrl = "http://127.0.0.1:$barPort/manifest.webmanifest"
function Test-BarServer {
  try {
    $barResponse = Invoke-WebRequest -Uri $barHealthUrl -UseBasicParsing -TimeoutSec 2
    $barContent = if ($barResponse.Content -is [byte[]]) { [System.Text.Encoding]::UTF8.GetString($barResponse.Content) } else { $barResponse.Content }
    return (($barContent | ConvertFrom-Json).name -eq 'The Home Bar')
  } catch { return $false }
}
$barRunning = Test-BarServer
if (-not $barRunning) {
  $barLogs = Join-Path $barRoot '.local'
  New-Item -ItemType Directory -Path $barLogs -Force | Out-Null
  $barArguments = @(('"' + (Join-Path $PSScriptRoot 'serve.mjs') + '"'), "--port=$barPort")
  if ($Lan) { $barArguments += '--lan' }
  $barProcess = Start-Process -FilePath $barNode -ArgumentList $barArguments -WorkingDirectory $barRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $barLogs "server-$barPort.log") -RedirectStandardError (Join-Path $barLogs "server-$barPort-error.log")
  $barProcess.Id | Set-Content -LiteralPath (Join-Path $barLogs "server-$barPort.pid")
  for ($barAttempt=0; $barAttempt -lt 20; $barAttempt++) {
    Start-Sleep -Milliseconds 250
    if ($barProcess.HasExited) { throw "The menu server could not start. See .local/server-$barPort-error.log." }
    if (Test-BarServer) { $barRunning=$true; break }
  }
  if (-not $barRunning) { throw "The menu server did not respond. See .local/server-$barPort-error.log." }
}
if (-not $NoBrowser) { Start-Process $barUrl }
Write-Output "Home Bar ready: $barUrl"
