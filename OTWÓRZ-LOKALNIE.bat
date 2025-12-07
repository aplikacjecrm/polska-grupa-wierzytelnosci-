@echo off
echo ========================================
echo    URUCHAMIANIE KOMUNIKATORA LOKALNIE
echo ========================================
echo.
echo 1. Czyszczenie cache...
RunDll32.exe InetCpl.cpl,ClearMyTracksByProcess 8

echo 2. Otwieranie http://localhost:3500...
start http://localhost:3500

echo.
echo ========================================
echo    GOTOWE!
echo ========================================
echo.
echo WAZNE: Jesli backend nie dziala, uruchom:
echo    npm start
echo.
pause
