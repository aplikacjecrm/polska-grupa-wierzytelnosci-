@echo off
echo ========================================
echo   INSTALACJA FUNKCJI KLIENTA
echo ========================================
echo.

echo [1/3] Instalacja zależności...
cd "%~dp0"
call npm install
if errorlevel 1 (
    echo.
    echo BŁĄD: Instalacja nie powiodła się!
    pause
    exit /b 1
)

echo.
echo [2/3] Uruchamianie migracji bazy danych...
cd backend
node run-migration.js
if errorlevel 1 (
    echo.
    echo BŁĄD: Migracja nie powiodła się!
    pause
    exit /b 1
)

echo.
echo [3/3] Tworzenie katalogu na pliki...
if not exist "uploads\client-files" mkdir "uploads\client-files"

echo.
echo ========================================
echo   INSTALACJA ZAKOŃCZONA!
echo ========================================
echo.
echo Możesz teraz uruchomić backend:
echo   cd backend
echo   node server.js
echo.
pause
