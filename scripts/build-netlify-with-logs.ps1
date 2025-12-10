# PowerShell script to run build:netlify, log output with timestamped filenames, and keep only the 10 most recent logs
<#
=====================================================================
 build-netlify-with-logs.ps1
=====================================================================
This script runs the build:netlify npm command, logs output to a timestamped file, and keeps only the 10 most recent logs.
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
$logFile = "$logDir/build-netlify-$timestamp.log"

# =====================================================================
# 3. RUN BUILD AND LOG OUTPUT
# =====================================================================
# Runs the build:netlify npm script and logs all output to the file
npm run build:netlify *>&1 | Tee-Object -FilePath $logFile

# =====================================================================
# 4. CLEANUP: Keep Only 10 Most Recent Logs
# =====================================================================
# Finds all matching log files, sorts by date, and deletes older ones
$logFiles = Get-ChildItem -Path $logDir -Filter "build-netlify-*.log" | Sort-Object LastWriteTime -Descending
if ($logFiles.Count -gt 10) {
    $oldLogs = $logFiles | Select-Object -Skip 10
    foreach ($log in $oldLogs) {
        Remove-Item $log.FullName -Force
    }
}
