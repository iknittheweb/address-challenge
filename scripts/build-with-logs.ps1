# PowerShell script to run a build, log output with a timestamp, and keep only the 10 most recent logs

# Set log directory and ensure it exists
$logDir = "build-logs"
if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }

# Create timestamped log filename
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$logFile = "$logDir/build-log-$ts.txt"

# Run the build and log output
npm run build:alt:skip-tests | Tee-Object -FilePath $logFile

# Keep only the 10 most recent logs, delete older ones
Get-ChildItem -Path $logDir -Filter "build-log-*.txt" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 10 | Remove-Item
