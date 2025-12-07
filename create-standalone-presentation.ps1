# Skrypt do konwersji logo na base64 i wstawienia do HTML
# Tworzy samodzielny plik HTML bez zewnętrznych zależności

$htmlFile = "prezentacja-federacja-ait.html"
$logoFile = "logo-federacja-ait.png"
$outputFile = "prezentacja-federacja-ait-standalone.html"

Write-Host "Konwersja prezentacji na standalone..." -ForegroundColor Cyan

# Sprawdź czy pliki istnieją
if (-not (Test-Path $htmlFile)) {
    Write-Host "Błąd: Nie znaleziono pliku $htmlFile" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $logoFile)) {
    Write-Host "Błąd: Nie znaleziono pliku $logoFile" -ForegroundColor Red
    exit 1
}

# Wczytaj HTML
$htmlContent = Get-Content $htmlFile -Raw -Encoding UTF8

# Konwertuj logo na base64
$logoBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $logoFile))
$logoBase64 = [System.Convert]::ToBase64String($logoBytes)
$logoDataUrl = "data:image/png;base64,$logoBase64"

# Zamień wszystkie odwołania do logo na data URL
$htmlContent = $htmlContent -replace 'src="logo-federacja-ait\.png"', "src=`"$logoDataUrl`""

# Zapisz nowy plik
$htmlContent | Out-File -FilePath $outputFile -Encoding UTF8 -NoNewline

Write-Host "`n✅ Gotowe!" -ForegroundColor Green
Write-Host "`nUtworzono plik: $outputFile" -ForegroundColor Yellow
Write-Host "Ten plik jest SAMODZIELNY - możesz wysłać tylko ten 1 plik HTML!" -ForegroundColor Green
Write-Host "`nRozmiar pliku: $([math]::Round((Get-Item $outputFile).Length / 1MB, 2)) MB" -ForegroundColor Cyan
