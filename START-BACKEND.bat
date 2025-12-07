@echo off
echo ========================================
echo 🚀 URUCHAMIANIE BACKENDU
echo ========================================
echo.

cd /d "%~dp0"

echo 📦 Sprawdzam node_modules...
if not exist "node_modules\" (
    echo ⚠️ Brak node_modules - instaluję...
    call npm install
)

echo.
echo 🔧 Uruchamiam backend na porcie 3500...
echo.
echo ✅ Backend gotowy gdy zobaczysz: "🚀 Backend uruchomiony na porcie 3500"
echo.
echo ⚠️ NIE ZAMYKAJ tego okna!
echo 💡 Aby zatrzymać backend: CTRL+C
echo.
echo ========================================
echo.

node test-backend-start.js

pause
