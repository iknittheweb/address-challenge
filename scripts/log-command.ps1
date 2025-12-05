<#
    log-command.ps1
    Logs any PowerShell command and its output to a log file.
    Usage:
      powershell -ExecutionPolicy Bypass -File ./scripts/log-command.ps1 -Command "npm run build:gh"
      Optional: -LogFile "my-log.txt"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$Command,
    [string]$LogFile = "terminal-log.txt"
)

# Get the current timestamp for log entries
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"

# Log the command being run with timestamp
"`n[$timestamp] Running: $Command" | Out-File -FilePath $LogFile -Append

try {
  # Run the command, capturing both output and errors
  $output = Invoke-Expression $Command 2>&1
  # Write the command output to the log file
  $output | Out-File -FilePath $LogFile -Append
  # Log successful completion
  "[$timestamp] Command completed successfully." | Out-File -FilePath $LogFile -Append
} catch {
  # Log any errors that occur during command execution
  "[$timestamp] ERROR: $_" | Out-File -FilePath $LogFile -Append
}
