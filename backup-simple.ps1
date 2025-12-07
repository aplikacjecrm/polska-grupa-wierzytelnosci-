# BACKUP APLIKACJI PRO MERITUM - Prosty skrypt

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupName = "backup_$timestamp"
$backupDir = "backups\$backupName"

Write-Host "Rozpoczynam backup aplikacji..." -ForegroundColor Cyan
Write-Host "Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host ""

# Utworz katalog backups jesli nie istnieje
if (-not (Test-Path "backups")) {
    New-Item -ItemType Directory -Path "backups" -Force | Out-Null
}

# Utworz katalog backup
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "Utworzono katalog: $backupDir" -ForegroundColor Green

# BACKUP BAZY DANYCH
Write-Host ""
Write-Host "Backup bazy danych..." -ForegroundColor Cyan
if (Test-Path "backend\database\database.db") {
    Copy-Item "backend\database\database.db" "$backupDir\database.db"
    $dbSize = (Get-Item "backend\database\database.db").Length / 1MB
    Write-Host "Baza danych: $([math]::Round($dbSize, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "Baza danych nie znaleziona!" -ForegroundColor Yellow
}

# BACKUP BACKEND
Write-Host ""
Write-Host "Backup backendu..." -ForegroundColor Cyan
if (Test-Path "backend") {
    Copy-Item "backend" -Destination "$backupDir\backend" -Recurse -Force
    Write-Host "Backend: OK" -ForegroundColor Green
}

# BACKUP FRONTEND
Write-Host ""
Write-Host "Backup frontendu..." -ForegroundColor Cyan
if (Test-Path "frontend") {
    Copy-Item "frontend" -Destination "$backupDir\frontend" -Recurse -Force
    Write-Host "Frontend: OK" -ForegroundColor Green
}

# BACKUP DOKUMENTACJI
Write-Host ""
Write-Host "Backup dokumentacji..." -ForegroundColor Cyan
$docs = Get-ChildItem -Path . -Filter "*.md" -File
foreach ($doc in $docs) {
    Copy-Item $doc.FullName -Destination $backupDir -Force
}
Write-Host "Dokumentacja: $($docs.Count) plikow" -ForegroundColor Green

# BACKUP KONFIGURACJI
Write-Host ""
Write-Host "Backup konfiguracji..." -ForegroundColor Cyan
$configs = @("package.json", "package-lock.json", ".gitignore")
foreach ($config in $configs) {
    if (Test-Path $config) {
        Copy-Item $config -Destination $backupDir -Force
    }
}

if (Test-Path ".env") {
    Copy-Item ".env" -Destination "$backupDir\.env.BACKUP" -Force
    Write-Host ".env zapisany jako .env.BACKUP" -ForegroundColor Yellow
}
Write-Host "Konfiguracja: OK" -ForegroundColor Green

# BACKUP UPLOADS
Write-Host ""
Write-Host "Backup uploads..." -ForegroundColor Cyan
if (Test-Path "uploads") {
    Copy-Item "uploads" -Destination "$backupDir\uploads" -Recurse -Force
    Write-Host "Uploads: OK" -ForegroundColor Green
} else {
    Write-Host "Brak katalogu uploads" -ForegroundColor Gray
}

# UTWORZ README
Write-Host ""
Write-Host "Tworzenie README..." -ForegroundColor Cyan
$readme = "# BACKUP APLIKACJI PRO MERITUM`n`n"
$readme += "Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
$readme += "Komputer: $env:COMPUTERNAME`n"
$readme += "Uzytkownik: $env:USERNAME`n`n"
$readme += "## Zawartosc:`n"
$readme += "- Backend (wszystkie pliki)`n"
$readme += "- Frontend (wszystkie pliki)`n"
$readme += "- Baza danych (database.db)`n"
$readme += "- Dokumentacja (pliki .md)`n"
$readme += "- Konfiguracja (package.json, .env)`n`n"
$readme += "## Jak przywrocic:`n"
$readme += "1. Zatrzymaj serwer`n"
$readme += "2. Skopiuj pliki z backupu`n"
$readme += "3. npm install`n"
$readme += "4. node backend/server.js`n"
$readme | Out-File -FilePath "$backupDir\README.txt" -Encoding UTF8
Write-Host "README.txt utworzony" -ForegroundColor Green

# KOMPRESJA
Write-Host ""
Write-Host "Kompresowanie..." -ForegroundColor Cyan
$zipFile = "backups\$backupName.zip"
try {
    Compress-Archive -Path $backupDir -DestinationPath $zipFile -Force
    $zipSize = (Get-Item $zipFile).Length / 1MB
    Write-Host "Archiwum: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Green
    
    # Usun nieskompresowany katalog
    Remove-Item $backupDir -Recurse -Force
    Write-Host "Katalog tymczasowy usuniety" -ForegroundColor Green
} catch {
    Write-Host "Blad kompresji: $_" -ForegroundColor Red
}

# PODSUMOWANIE
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "BACKUP ZAKONCZONY POMYSLNIE!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Lokalizacja: $zipFile" -ForegroundColor Yellow
Write-Host "Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ostatnie backupy:" -ForegroundColor Cyan
Get-ChildItem "backups\backup_*.zip" | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 5 | 
    ForEach-Object {
        $size = [math]::Round($_.Length / 1MB, 2)
        Write-Host "  $($_.Name) - $size MB" -ForegroundColor Gray
    }
Write-Host ""
Write-Host "Gotowe!" -ForegroundColor Green
