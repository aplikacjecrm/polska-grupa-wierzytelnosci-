# 📦 Skrypt do tworzenia backupu aplikacji
# Użycie: .\create-backup.ps1

Write-Host "📦 Tworzenie backupu aplikacji..." -ForegroundColor Cyan
Write-Host ""

# 1. Zatrzymaj serwer Node.js
Write-Host "⏸️  Zatrzymywanie serwera Node.js..." -ForegroundColor Yellow
try {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Serwer zatrzymany" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Brak uruchomionego serwera" -ForegroundColor Yellow
}

Start-Sleep -Seconds 2

# 2. Utwórz katalog backups jeśli nie istnieje
Write-Host ""
Write-Host "📁 Sprawdzanie katalogu backups..." -ForegroundColor Yellow
if (!(Test-Path "backups")) {
    New-Item -ItemType Directory -Force -Path "backups" | Out-Null
    Write-Host "✅ Katalog backups utworzony" -ForegroundColor Green
} else {
    Write-Host "✅ Katalog backups istnieje" -ForegroundColor Green
}

# 3. Przygotuj nazwę backupu z datą
$date = Get-Date -Format "yyyy-MM-dd_HH-mm"
$backupName = "backup_full_$date.zip"
$source = $PSScriptRoot
$destination = Join-Path $source "backups" $backupName

# 4. Utwórz backup
Write-Host ""
Write-Host "💾 Tworzenie archiwum ZIP..." -ForegroundColor Yellow
Write-Host "   Źródło: $source" -ForegroundColor Gray
Write-Host "   Cel: $backupName" -ForegroundColor Gray
Write-Host ""

$excludeDirs = @('node_modules', 'backups', '.git')
$itemsToBackup = Get-ChildItem -Path $source | Where-Object { $_.Name -notin $excludeDirs }

try {
    Compress-Archive -Path $itemsToBackup.FullName -DestinationPath $destination -Force
    
    # 5. Pokaż informacje o backupie
    $backupSize = (Get-Item $destination).Length / 1MB
    Write-Host "✅ Backup utworzony pomyślnie!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Informacje o backupie:" -ForegroundColor Cyan
    Write-Host "   Nazwa: $backupName" -ForegroundColor White
    Write-Host "   Rozmiar: $([math]::Round($backupSize, 2)) MB" -ForegroundColor White
    Write-Host "   Lokalizacja: backups\$backupName" -ForegroundColor White
    
    # 6. Pokaż listę wszystkich backupów
    Write-Host ""
    Write-Host "📂 Wszystkie backupy:" -ForegroundColor Cyan
    $allBackups = Get-ChildItem -Path "backups" -Filter "*.zip" | Sort-Object LastWriteTime -Descending
    foreach ($backup in $allBackups) {
        $size = $backup.Length / 1MB
        $time = $backup.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        Write-Host "   • $($backup.Name) - $([math]::Round($size, 2)) MB - $time" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "❌ Błąd podczas tworzenia backupu!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# 7. Zapytaj czy uruchomić serwer ponownie
Write-Host ""
$restart = Read-Host "🔄 Uruchomić serwer ponownie? (T/N)"
if ($restart -eq "T" -or $restart -eq "t") {
    Write-Host ""
    Write-Host "🚀 Uruchamianie serwera..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "node backend/server.js"
    Write-Host "✅ Serwer uruchomiony w nowym oknie" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Gotowe!" -ForegroundColor Green
Write-Host ""
