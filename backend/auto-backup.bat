@echo off
REM =============================================
REM  AUTOMATYCZNY BACKUP - HARMONOGRAM ZADAŃ
REM =============================================

echo.
echo ========================================
echo  AUTOMATYCZNY BACKUP KANCELARIA
echo  %DATE% %TIME%
echo ========================================
echo.

REM Przejdź do katalogu backend
cd /d %~dp0

REM Uruchom pełny backup (baza + załączniki)
node backup-full.js

REM Zapisz log
echo. >> backup-log.txt
echo [%DATE% %TIME%] Backup wykonany >> backup-log.txt

echo.
echo ========================================
echo  BACKUP ZAKOŃCZONY!
echo ========================================
echo.

REM Nie zamykaj okna automatycznie (do testów)
REM timeout /t 5
