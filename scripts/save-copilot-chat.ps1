# Save Copilot Chat buffer from clipboard to log file
# 1. In VS Code, focus the Copilot Chat panel.
# 2. Press Ctrl+A, then Ctrl+C to copy all chat content.
# 3. Run this script to append the clipboard contents to your log.

$logPath = "$PSScriptRoot\..\copilot-chat-log.md"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$chat = Get-Clipboard

if (![string]::IsNullOrWhiteSpace($chat)) {
    Add-Content -Path $logPath -Value "`n---`n## Copilot Chat Log: $timestamp`n"
    Add-Content -Path $logPath -Value $chat
    Write-Host "Chat log saved to $logPath"
} else {
    Write-Host "Clipboard is empty. Please copy the chat buffer first."
}