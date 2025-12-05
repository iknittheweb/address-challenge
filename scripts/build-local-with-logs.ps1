# PowerShell script to run build:local, log output with timestamped filenames, and keep only the 10 most recent logs

$logDir = "./build-logs"
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

# Generate timestamp for log filename
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "$logDir/build-local-$timestamp.log"


# Run the build:local script and log output
npm run build:local *>&1 | Tee-Object -FilePath $logFile

# Get all log files sorted by LastWriteTime descending
$logFiles = Get-ChildItem -Path $logDir -Filter "build-local-*.log" | Sort-Object LastWriteTime -Descending

# Keep only the 10 most recent logs, delete the rest
if ($logFiles.Count -gt 10) {
    $oldLogs = $logFiles | Select-Object -Skip 10
    foreach ($log in $oldLogs) {
        Remove-Item $log.FullName -Force
    }
}
