# Usuń wszystkie duplikaty (wersjonowane pliki)

Write-Host "🗑️ USUWAM DUPLIKATY..." -ForegroundColor Yellow

$removed = 0
$savedSpace = 0

# Chat versions (v62-v73)
62..73 | ForEach-Object {
    $file = "frontend\scripts\chat-v$_.js"
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Remove-Item $file -Force
        $removed++
        $savedSpace += $size
        Write-Host "❌ Usunięto: chat-v$_.js" -ForegroundColor Red
    }
}

# Floating chat versions (v23-v27)
23..27 | ForEach-Object {
    $file = "frontend\scripts\floating-chat-v$_.js"
    if (Test-Path $file) {
        $size = (Get-Item $file).Length
        Remove-Item $file -Force
        $removed++
        $savedSpace += $size
        Write-Host "❌ Usunięto: floating-chat-v$_.js" -ForegroundColor Red
    }
}

# Employees-fixed
$file = "backend\routes\employees-fixed.js"
if (Test-Path $file) {
    $size = (Get-Item $file).Length
    Remove-Item $file -Force
    $removed++
    $savedSpace += $size
    Write-Host "❌ Usunięto: employees-fixed.js" -ForegroundColor Red
}

$savedMB = [math]::Round($savedSpace / 1MB, 2)
Write-Host "`n✅ GOTOWE!" -ForegroundColor Green
Write-Host "📊 Usunięto: $removed plików" -ForegroundColor Cyan
Write-Host "💾 Oszczędność: $savedMB MB" -ForegroundColor Cyan
