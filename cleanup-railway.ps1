# Skrypt do usunięcia crashującego dokumentu na Railway
# Wywołuje endpoint emergency-cleanup

$railwayUrl = "https://web-production-7504.up.railway.app"
$documentId = 17

Write-Host "🗑️ EMERGENCY CLEANUP - Railway" -ForegroundColor Yellow
Write-Host ""
Write-Host "Usuwam dokument ID: $documentId z Railway..." -ForegroundColor Cyan
Write-Host ""

# Najpierw musimy się zalogować żeby dostać token
Write-Host "⏸️  POCZEKAJ 2 MINUTY na Railway deployment..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Potem:"
Write-Host "1. Otwórz: $railwayUrl" -ForegroundColor Green
Write-Host "2. Zaloguj się jako ADMIN" -ForegroundColor Green
Write-Host "3. Otwórz DevTools (F12) → Console" -ForegroundColor Green
Write-Host "4. Wklej i uruchom:" -ForegroundColor Green
Write-Host ""
Write-Host @"
// Usuń crashujący dokument
fetch('/api/documents/emergency-cleanup/17', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ SUKCES:', data);
  alert('Dokument usunięty! Odśwież stronę.');
})
.catch(err => {
  console.error('❌ BŁĄD:', err);
});
"@ -ForegroundColor White

Write-Host ""
Write-Host "5. Po sukcesie - odśwież stronę (F5)" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Wszystko powinno działać!" -ForegroundColor Green

# Opcjonalnie - otwórz Railway w przeglądarce
$response = Read-Host "Otworzyć Railway w przeglądarce? (t/n)"
if ($response -eq "t") {
    Start-Process $railwayUrl
}
