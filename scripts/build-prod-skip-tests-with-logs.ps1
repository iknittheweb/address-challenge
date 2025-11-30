# PowerShell script to run build:prod:skip-tests, log output with timestamped filenames, and keep only the 10 most recent logs

$logDir = "./build-logs"
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

# Generate timestamp for log filename
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "$logDir/build-prod-skip-tests-$timestamp.log"


# Run the build:prod:skip-tests script and log output
npm run build:prod:skip-tests *>&1 | Tee-Object -FilePath $logFile

 # Minify styles.css after build
Write-Host "Minifying styles.css..."
node ./scripts/minify-home-styles.cjs
Write-Host "Minification complete."

# Get all log files sorted by LastWriteTime descending
$logFiles = Get-ChildItem -Path $logDir -Filter "build-prod-skip-tests-*.log" | Sort-Object LastWriteTime -Descending

# Keep only the 10 most recent logs, delete the rest
if ($logFiles.Count -gt 10) {
    $oldLogs = $logFiles | Select-Object -Skip 10
    foreach ($log in $oldLogs) {
        Remove-Item $log.FullName -Force
    }
}

