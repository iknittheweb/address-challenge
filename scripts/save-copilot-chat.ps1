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
  2. Press Ctrl+A, then Ctrl+C to copy all chat content.
  3. Run this script to append the clipboard contents to your log.
#>


# =====================================================================
# 1. SETUP: Log path and timestamp (filename includes timestamp)
# =====================================================================
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logPath = "$PSScriptRoot\..\copilot-chat-log-$timestamp.md"

# =====================================================================
# 2. READ CLIPBOARD
# =====================================================================
$chat = Get-Clipboard

# =====================================================================
# 3. WRITE TO LOG IF CLIPBOARD HAS CONTENT
# =====================================================================
if (![string]::IsNullOrWhiteSpace($chat)) {
  Add-Content -Path $logPath -Value "`n---`n## Copilot Chat Log: $timestamp`n"
  Add-Content -Path $logPath -Value $chat
  Write-Host "Chat log saved to $logPath"
} else {
  # =====================================================================
  # 4. ERROR HANDLING: Clipboard empty
  # =====================================================================
  Write-Host "Clipboard is empty. Please copy the chat buffer first."
}