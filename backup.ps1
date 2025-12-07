# 📦 BACKUP APLIKACJI PRO MERITUM
# Automatyczny backup całej aplikacji z bazą danych

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backups\backup_$timestamp"
$rootDir = $PSScriptRoot

Write-Host "🔄 Rozpoczynam backup aplikacji..." -ForegroundColor Cyan
Write-Host "📅 Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host ""

# Utwórz katalog backup
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "✅ Utworzono katalog: $backupDir" -ForegroundColor Green

# 1. BACKUP BAZY DANYCH
Write-Host ""
Write-Host "📊 Backup bazy danych..." -ForegroundColor Cyan
if (Test-Path "backend\database\database.db") {
    Copy-Item "backend\database\database.db" "$backupDir\database.db"
    $dbSize = (Get-Item "backend\database\database.db").Length / 1MB
    Write-Host "✅ Baza danych: $([math]::Round($dbSize, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "⚠️  Baza danych nie znaleziona!" -ForegroundColor Yellow
}

# 2. BACKUP BACKEND
Write-Host ""
Write-Host "🔧 Backup backendu..." -ForegroundColor Cyan
$backendFiles = @(
    "backend\server.js",
    "backend\config",
    "backend\routes",
    "backend\utils",
    "backend\services",
    "backend\middleware",
    "backend\database\init.js"
)

$backendDir = "$backupDir\backend"
New-Item -ItemType Directory -Path $backendDir -Force | Out-Null

foreach ($file in $backendFiles) {
    if (Test-Path $file) {
        $dest = Join-Path $backendDir (Split-Path $file -Leaf)
        if (Test-Path $file -PathType Container) {
            Copy-Item $file -Destination $dest -Recurse -Force
        } else {
            Copy-Item $file -Destination $dest -Force
        }
        Write-Host "  ✓ $file" -ForegroundColor Gray
    }
}
Write-Host "✅ Backend: OK" -ForegroundColor Green

# 3. BACKUP FRONTEND
Write-Host ""
Write-Host "🎨 Backup frontendu..." -ForegroundColor Cyan
$frontendDir = "$backupDir\frontend"
Copy-Item "frontend" -Destination $frontendDir -Recurse -Force -Exclude "node_modules","*.log"
$frontendCount = (Get-ChildItem $frontendDir -Recurse -File).Count
Write-Host "✅ Frontend: $frontendCount plików" -ForegroundColor Green

# 4. BACKUP DOKUMENTACJI
Write-Host ""
Write-Host "📚 Backup dokumentacji..." -ForegroundColor Cyan
$docsFiles = Get-ChildItem -Path $rootDir -Filter "*.md" -File
$docsDir = "$backupDir\dokumentacja"
New-Item -ItemType Directory -Path $docsDir -Force | Out-Null

foreach ($doc in $docsFiles) {
    Copy-Item $doc.FullName -Destination $docsDir -Force
    Write-Host "  ✓ $($doc.Name)" -ForegroundColor Gray
}
Write-Host "✅ Dokumentacja: $($docsFiles.Count) plików" -ForegroundColor Green

# 5. BACKUP KONFIGURACJI
Write-Host ""
Write-Host "⚙️  Backup konfiguracji..." -ForegroundColor Cyan
$configFiles = @(
    "package.json",
    "package-lock.json",
    ".gitignore",
    ".env.example"
)

foreach ($config in $configFiles) {
    if (Test-Path $config) {
        Copy-Item $config -Destination $backupDir -Force
        Write-Host "  ✓ $config" -ForegroundColor Gray
    }
}

# Backup .env (jeśli istnieje) - UWAGA: zawiera hasła!
if (Test-Path ".env") {
    Copy-Item ".env" -Destination "$backupDir\.env.BACKUP" -Force
    Write-Host "  ✓ .env (jako .env.BACKUP)" -ForegroundColor Yellow
}
Write-Host "✅ Konfiguracja: OK" -ForegroundColor Green

# 6. BACKUP UPLOADS (jeśli istnieją)
Write-Host ""
Write-Host "📁 Backup plików użytkowników..." -ForegroundColor Cyan
if (Test-Path "uploads") {
    Copy-Item "uploads" -Destination "$backupDir\uploads" -Recurse -Force
    $uploadsSize = (Get-ChildItem "uploads" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "✅ Uploads: $([math]::Round($uploadsSize, 2)) MB" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Brak katalogu uploads" -ForegroundColor Gray
}

# 7. UTWÓRZ PLIK INFO
Write-Host ""
Write-Host "📝 Tworzenie pliku informacyjnego..." -ForegroundColor Cyan
$infoContent = "# BACKUP APLIKACJI PRO MERITUM`n`n"
$infoContent += "Data utworzenia: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
$infoContent += "Wersja: 1.0`n"
$infoContent += "Komputer: $env:COMPUTERNAME`n"
$infoContent += "Uzytkownik: $env:USERNAME`n`n"
$infoContent += "## Zawartosc backupu:`n`n"
$infoContent += "### Backend:`n"
$infoContent += "- server.js`n"
$infoContent += "- routes/`n"
$infoContent += "- utils/`n"
$infoContent += "- services/`n"
$infoContent += "- config/`n"
$infoContent += "- database/init.js`n`n"
$infoContent += "### Frontend:`n"
$infoContent += "- Wszystkie pliki HTML, CSS, JS`n`n"
$infoContent += "### Baza danych:`n"
$infoContent += "- database.db (SQLite)`n`n"
$infoContent += "### Dokumentacja:`n"
$infoContent += "- Wszystkie pliki .md`n`n"
$infoContent += "### Konfiguracja:`n"
$infoContent += "- package.json`n"
$infoContent += "- .env (jako .env.BACKUP)`n`n"
$infoContent += "## Jak przywrocic backup:`n`n"
$infoContent += "1. Zatrzymaj serwer`n"
$infoContent += "2. Skopiuj zawartosc backupu`n"
$infoContent += "3. Przywroc baze danych`n"
$infoContent += "4. npm install`n"
$infoContent += "5. node backend/server.js`n`n"
$infoContent += "UWAGA: Plik .env.BACKUP zawiera hasla i klucze API!`n"
$infoContent += "Przechowuj backup w bezpiecznym miejscu.`n"

$infoContent | Out-File -FilePath "$backupDir\README.md" -Encoding UTF8
Write-Host "✅ Plik README.md utworzony" -ForegroundColor Green

# 8. KOMPRESJA (opcjonalnie)
Write-Host ""
Write-Host "📦 Kompresowanie backupu..." -ForegroundColor Cyan
$zipFile = "backups\backup_$timestamp.zip"

try {
    Compress-Archive -Path $backupDir -DestinationPath $zipFile -Force
    $zipSize = (Get-Item $zipFile).Length / 1MB
    Write-Host "✅ Utworzono archiwum: backup_$timestamp.zip ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green
    
    # Usuń nieskompresowany katalog
    Remove-Item $backupDir -Recurse -Force
    Write-Host "✅ Usunięto tymczasowy katalog" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Nie udało się skompresować: $_" -ForegroundColor Yellow
}

# 9. PODSUMOWANIE
Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ BACKUP ZAKOŃCZONY POMYŚLNIE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Lokalizacja: $zipFile" -ForegroundColor Yellow
Write-Host "📅 Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Aby przywrócić backup:" -ForegroundColor Cyan
Write-Host "   1. Rozpakuj archiwum ZIP" -ForegroundColor Gray
Write-Host "   2. Przeczytaj README.md" -ForegroundColor Gray
Write-Host "   3. Skopiuj pliki do głównego katalogu" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  WAŻNE: Przechowuj backup w bezpiecznym miejscu!" -ForegroundColor Yellow
Write-Host ""

# 10. LISTA OSTATNICH BACKUPÓW
Write-Host "📋 Ostatnie backupy:" -ForegroundColor Cyan
Get-ChildItem "backups\backup_*.zip" | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object -First 5 | 
    ForEach-Object {
        $size = [math]::Round($_.Length / 1MB, 2)
        Write-Host "   • $($_.Name) - $size MB - $($_.LastWriteTime)" -ForegroundColor Gray
    }

Write-Host ""
Write-Host "✨ Gotowe! Możesz kontynuować pracę." -ForegroundColor Green
Write-Host ""
