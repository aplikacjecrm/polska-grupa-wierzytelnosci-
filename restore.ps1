# 🔄 PRZYWRACANIE BACKUPU APLIKACJI PRO MERITUM

param(
    [Parameter(Mandatory=$false)]
    [string]$BackupFile
)

Write-Host "🔄 PRZYWRACANIE BACKUPU APLIKACJI PRO MERITUM" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Jeśli nie podano pliku, pokaż listę dostępnych backupów
if (-not $BackupFile) {
    Write-Host "📋 Dostępne backupy:" -ForegroundColor Yellow
    Write-Host ""
    
    $backups = Get-ChildItem "backups\backup_*.zip" | Sort-Object LastWriteTime -Descending
    
    if ($backups.Count -eq 0) {
        Write-Host "❌ Brak dostępnych backupów!" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Najpierw utwórz backup:" -ForegroundColor Cyan
        Write-Host "   .\backup.ps1" -ForegroundColor Gray
        exit
    }
    
    for ($i = 0; $i -lt $backups.Count; $i++) {
        $backup = $backups[$i]
        $size = [math]::Round($backup.Length / 1MB, 2)
        $date = $backup.LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')
        Write-Host "   [$($i+1)] $($backup.Name)" -ForegroundColor White
        Write-Host "       Rozmiar: $size MB | Data: $date" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "💡 Użycie:" -ForegroundColor Cyan
    Write-Host "   .\restore.ps1 -BackupFile 'backups\backup_XXXXXXXX_XXXXXX.zip'" -ForegroundColor Gray
    Write-Host ""
    exit
}

# Sprawdź czy plik istnieje
if (-not (Test-Path $BackupFile)) {
    Write-Host "❌ Plik backupu nie istnieje: $BackupFile" -ForegroundColor Red
    exit
}

# OSTRZEŻENIE
Write-Host "⚠️  UWAGA! PRZYWRACANIE BACKUPU:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   • Nadpisze WSZYSTKIE pliki aplikacji" -ForegroundColor Red
Write-Host "   • Zastąpi bazę danych" -ForegroundColor Red
Write-Host "   • Usunie niezapisane zmiany" -ForegroundColor Red
Write-Host ""
$confirm = Read-Host "Czy na pewno chcesz kontynuować? (TAK/nie)"

if ($confirm -ne "TAK") {
    Write-Host ""
    Write-Host "❌ Anulowano przywracanie backupu" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "🔄 Rozpoczynam przywracanie..." -ForegroundColor Cyan
Write-Host ""

# 1. ZATRZYMAJ SERWER (jeśli działa)
Write-Host "🛑 Sprawdzam czy serwer działa..." -ForegroundColor Cyan
$nodeProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*komunikator-app*" }
if ($nodeProcess) {
    Write-Host "   Zatrzymuję serwer..." -ForegroundColor Yellow
    $nodeProcess | Stop-Process -Force
    Start-Sleep -Seconds 2
    Write-Host "✅ Serwer zatrzymany" -ForegroundColor Green
} else {
    Write-Host "✅ Serwer nie działa" -ForegroundColor Green
}

# 2. UTWÓRZ BACKUP OBECNEGO STANU (na wszelki wypadek)
Write-Host ""
Write-Host "💾 Tworzę backup obecnego stanu..." -ForegroundColor Cyan
$safetyBackup = "backups\safety_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').zip"
try {
    Compress-Archive -Path @("backend", "frontend", "*.md") -DestinationPath $safetyBackup -Force
    Write-Host "✅ Backup bezpieczeństwa: $safetyBackup" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Nie udało się utworzyć backupu bezpieczeństwa" -ForegroundColor Yellow
}

# 3. ROZPAKUJ BACKUP
Write-Host ""
Write-Host "📦 Rozpakowuję backup..." -ForegroundColor Cyan
$tempDir = "temp_restore_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Expand-Archive -Path $BackupFile -DestinationPath $tempDir -Force
Write-Host "✅ Rozpakowano do: $tempDir" -ForegroundColor Green

# 4. PRZYWRÓĆ BACKEND
Write-Host ""
Write-Host "🔧 Przywracam backend..." -ForegroundColor Cyan
if (Test-Path "$tempDir\backend") {
    Copy-Item "$tempDir\backend\*" -Destination "backend\" -Recurse -Force
    Write-Host "✅ Backend przywrócony" -ForegroundColor Green
}

# 5. PRZYWRÓĆ FRONTEND
Write-Host ""
Write-Host "🎨 Przywracam frontend..." -ForegroundColor Cyan
if (Test-Path "$tempDir\frontend") {
    Remove-Item "frontend\*" -Recurse -Force -ErrorAction SilentlyContinue
    Copy-Item "$tempDir\frontend\*" -Destination "frontend\" -Recurse -Force
    Write-Host "✅ Frontend przywrócony" -ForegroundColor Green
}

# 6. PRZYWRÓĆ BAZĘ DANYCH
Write-Host ""
Write-Host "📊 Przywracam bazę danych..." -ForegroundColor Cyan
if (Test-Path "$tempDir\database.db") {
    Copy-Item "$tempDir\database.db" -Destination "backend\database\database.db" -Force
    $dbSize = (Get-Item "backend\database\database.db").Length / 1MB
    Write-Host "✅ Baza danych przywrócona: $([math]::Round($dbSize, 2)) MB" -ForegroundColor Green
}

# 7. PRZYWRÓĆ DOKUMENTACJĘ
Write-Host ""
Write-Host "📚 Przywracam dokumentację..." -ForegroundColor Cyan
if (Test-Path "$tempDir\dokumentacja") {
    Copy-Item "$tempDir\dokumentacja\*.md" -Destination "." -Force
    $docsCount = (Get-ChildItem "$tempDir\dokumentacja\*.md").Count
    Write-Host "✅ Dokumentacja przywrócona: $docsCount plików" -ForegroundColor Green
}

# 8. PRZYWRÓĆ KONFIGURACJĘ
Write-Host ""
Write-Host "⚙️  Przywracam konfigurację..." -ForegroundColor Cyan
$configFiles = @("package.json", "package-lock.json", ".gitignore")
foreach ($config in $configFiles) {
    if (Test-Path "$tempDir\$config") {
        Copy-Item "$tempDir\$config" -Destination "." -Force
        Write-Host "  ✓ $config" -ForegroundColor Gray
    }
}

# .env
if (Test-Path "$tempDir\.env.BACKUP") {
    Write-Host ""
    Write-Host "⚠️  Znaleziono plik .env.BACKUP" -ForegroundColor Yellow
    $restoreEnv = Read-Host "Czy przywrócić plik .env? (tak/NIE)"
    if ($restoreEnv -eq "tak") {
        Copy-Item "$tempDir\.env.BACKUP" -Destination ".env" -Force
        Write-Host "✅ Plik .env przywrócony" -ForegroundColor Green
    }
}

# 9. PRZYWRÓĆ UPLOADS
Write-Host ""
Write-Host "📁 Przywracam pliki użytkowników..." -ForegroundColor Cyan
if (Test-Path "$tempDir\uploads") {
    Copy-Item "$tempDir\uploads" -Destination "." -Recurse -Force
    Write-Host "✅ Uploads przywrócone" -ForegroundColor Green
}

# 10. USUŃ KATALOG TYMCZASOWY
Write-Host ""
Write-Host "🧹 Sprzątam..." -ForegroundColor Cyan
Remove-Item $tempDir -Recurse -Force
Write-Host "✅ Katalog tymczasowy usunięty" -ForegroundColor Green

# 11. ZAINSTALUJ ZALEŻNOŚCI
Write-Host ""
Write-Host "📦 Instaluję zależności..." -ForegroundColor Cyan
Write-Host "   (to może potrwać kilka minut)" -ForegroundColor Gray
npm install --silent
Write-Host "✅ Zależności zainstalowane" -ForegroundColor Green

# 12. PODSUMOWANIE
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ BACKUP PRZYWRÓCONY POMYŚLNIE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Przywrócono z: $BackupFile" -ForegroundColor Yellow
Write-Host "💾 Backup bezpieczeństwa: $safetyBackup" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Aby uruchomić aplikację:" -ForegroundColor Cyan
Write-Host "   node backend/server.js" -ForegroundColor White
Write-Host ""
Write-Host "💡 Sprawdź czy wszystko działa poprawnie!" -ForegroundColor Yellow
Write-Host ""
