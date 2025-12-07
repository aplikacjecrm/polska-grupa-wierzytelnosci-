# AUTOMATYCZNA INSTALACJA NGROK
Write-Host "🚀 Instalacja ngrok..." -ForegroundColor Green

# 1. Pobierz ngrok
$ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
$downloadPath = "$env:USERPROFILE\Downloads\ngrok.zip"
$extractPath = "$env:USERPROFILE\Downloads\ngrok"

Write-Host "📥 Pobieranie ngrok..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $ngrokUrl -OutFile $downloadPath

Write-Host "📦 Rozpakowywanie..." -ForegroundColor Yellow
Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force

Write-Host "✅ Ngrok zainstalowany w: $extractPath" -ForegroundColor Green
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📋 NASTĘPNE KROKI:" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Otwórz przeglądarkę:" -ForegroundColor White
Write-Host "   https://dashboard.ngrok.com/signup" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣  Zarejestruj się (DARMOWE)" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Skopiuj komendę z tokenem (będzie wyglądać tak):" -ForegroundColor White
Write-Host "   ngrok config add-authtoken 2abc..." -ForegroundColor Cyan
Write-Host ""
Write-Host "4️⃣  Uruchom w terminalu (nowe okno PowerShell):" -ForegroundColor White
Write-Host "   cd $extractPath" -ForegroundColor Cyan
Write-Host "   .\ngrok config add-authtoken TWOJ_TOKEN" -ForegroundColor Cyan
Write-Host "   .\ngrok http 3500" -ForegroundColor Cyan
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Instalacja ukończona! Teraz zarejestruj się na ngrok.com" -ForegroundColor Green

# Otwórz stronę rejestracji
Start-Process "https://dashboard.ngrok.com/signup"
