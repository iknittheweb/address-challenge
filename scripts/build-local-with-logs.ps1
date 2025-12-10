<#
=====================================================================
 build-local-with-logs.ps1
=====================================================================
This script runs the build:local npm command, logs output to a timestamped file, and keeps only the 10 most recent logs.
BEGINNER-FRIENDLY: Each section is commented for clarity.
#>

# =====================================================================
# 1. SETUP: Ensure log directory exists
# =====================================================================
$logDir = "./build-logs"
if (!(Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

# =====================================================================
# 2. GENERATE TIMESTAMPED LOG FILE NAME
# =====================================================================
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = "$logDir/build-local-$timestamp.log"

# =====================================================================
# 3. RUN BUILD AND LOG OUTPUT
# =====================================================================
# Runs the build:local npm script and logs all output to the file
npm run build:local *>&1 | Tee-Object -FilePath $logFile

# =====================================================================
# 4. CLEANUP: Keep Only 10 Most Recent Logs
# =====================================================================
# Finds all matching log files, sorts by date, and deletes older ones
$logFiles = Get-ChildItem -Path $logDir -Filter "build-local-*.log" | Sort-Object LastWriteTime -Descending
if ($logFiles.Count -gt 10) {
    $oldLogs = $logFiles | Select-Object -Skip 10
    foreach ($log in $oldLogs) {
        Remove-Item $log.FullName -Force
    }
}