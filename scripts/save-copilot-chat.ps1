# =====================================================================
# 0. CLEANUP: Delete copilot-chat-log files older than 7 days
# =====================================================================
$logDir = Join-Path $PSScriptRoot ".."
$logFiles = Get-ChildItem -Path $logDir -Filter "copilot-chat-log-*.md" -File
$now = Get-Date
foreach ($file in $logFiles) {
  if ($now - $file.CreationTime -gt (New-TimeSpan -Days 7)) {
    Remove-Item $file.FullName -Force
  }
}
<#
=====================================================================
 save-copilot-chat.ps1
=====================================================================
Saves Copilot Chat buffer from clipboard to a log file.
BEGINNER-FRIENDLY: Each section is commented for clarity.
Usage:
  1. In VS Code, focus the Copilot Chat panel.
  2. Right click and choose copy all.
  3. Run this script to append the clipboard contents to your log.
#>


# =====================================================================
# 1. SETUP: Log path and timestamp (filename includes timestamp)
# =====================================================================

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logDir = Join-Path $PSScriptRoot "..\copilot-chat-logs"
if (!(Test-Path $logDir)) {
  New-Item -ItemType Directory -Path $logDir | Out-Null
}
$logPath = Join-Path $logDir "copilot-chat-log-$timestamp.md"
Write-Host "[Copilot Chat Log] Will write to: $logPath"

# =====================================================================
# 2. READ CLIPBOARD
# =====================================================================
$chat = $null
try {
  $chat = Get-Clipboard
} catch {
  Write-Host "[Copilot Chat Log] ERROR: Could not read clipboard: $_"
}

# =====================================================================
# 3. WRITE TO LOG IF CLIPBOARD HAS CONTENT
# =====================================================================
if (![string]::IsNullOrWhiteSpace($chat)) {
  try {
    # Find the most recent previous chat log file (excluding the new one)
    $prevLog = Get-ChildItem -Path $logDir -Filter "copilot-chat-log-*.md" | Where-Object { $_.FullName -ne $logPath } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    $prevLines = @()
    if ($prevLog) {
      try {
        $prevLines = Get-Content $prevLog.FullName
      } catch {
        Write-Host "[Copilot Chat Log] WARNING: Could not read previous log: $_"
      }
    }
    $chatLines = $chat -split "`r?`n"
    # Only keep lines not present in the previous log
    if ($prevLines.Count -gt 0) {
      $uniqueLines = $chatLines | Where-Object { $prevLines -notcontains $_ }
    } else {
      $uniqueLines = $chatLines
    }
    if ($uniqueLines.Count -eq 0) {
      Write-Host "[Copilot Chat Log] No new lines to write (all lines duplicated)."
    } else {
      Add-Content -Path $logPath -Value "`n---`n## Copilot Chat Log: $timestamp`n"
      Add-Content -Path $logPath -Value ($uniqueLines -join "`n")
      Write-Host "[Copilot Chat Log] Chat log saved to $logPath (unique lines only)"
    }
  } catch {
    Write-Host "[Copilot Chat Log] ERROR: Could not write to ${logPath}: $_"
  }
} else {
  Write-Host "[Copilot Chat Log] Clipboard is empty. Please copy the chat buffer first."
}