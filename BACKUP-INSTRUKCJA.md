# 📦 SYSTEM BACKUPU APLIKACJI PRO MERITUM

**Wersja:** 1.0  
**Data:** 16.11.2025

---

## 🎯 CEL

Automatyczny backup całej aplikacji Pro Meritum z możliwością szybkiego przywrócenia w przypadku awarii.

---

## 📋 CO JEST BACKUPOWANE?

### 1. **Backend** 🔧
- `server.js` - główny serwer
- `routes/` - wszystkie endpointy API
- `utils/` - funkcje pomocnicze
- `services/` - logika biznesowa
- `config/` - konfiguracja
- `middleware/` - middleware
- `database/init.js` - inicjalizacja bazy

### 2. **Frontend** 🎨
- Wszystkie pliki HTML
- Wszystkie skrypty JavaScript
- Wszystkie style CSS
- Obrazy i zasoby
- Moduły i komponenty

### 3. **Baza danych** 📊
- `database.db` - pełna baza SQLite
- Wszystkie tabele
- Wszystkie dane

### 4. **Dokumentacja** 📚
- Wszystkie pliki `.md`
- Specyfikacje techniczne
- Instrukcje

### 5. **Konfiguracja** ⚙️
- `package.json` - zależności
- `package-lock.json` - wersje pakietów
- `.gitignore` - ignorowane pliki
- `.env` - zmienne środowiskowe (jako `.env.BACKUP`)

### 6. **Uploads** 📁
- Pliki użytkowników
- Załączniki
- Dokumenty

---

## 🚀 JAK UTWORZYĆ BACKUP?

### Metoda 1: PowerShell (Zalecana)

```powershell
# Uruchom skrypt backup
.\backup.ps1
```

**Co się stanie:**
1. ✅ Utworzy katalog `backups/backup_YYYYMMDD_HHMMSS/`
2. ✅ Skopiuje wszystkie pliki
3. ✅ Skompresuje do archiwum ZIP
4. ✅ Utworzy plik README.md z informacjami
5. ✅ Wyświetli podsumowanie

**Czas trwania:** ~10-30 sekund (zależy od rozmiaru)

---

### Metoda 2: Ręczna

```powershell
# 1. Utwórz katalog
mkdir backups\backup_manual

# 2. Skopiuj pliki
xcopy backend backups\backup_manual\backend /E /I /Y
xcopy frontend backups\backup_manual\frontend /E /I /Y
copy backend\database\database.db backups\backup_manual\
copy *.md backups\backup_manual\dokumentacja\

# 3. Skompresuj
Compress-Archive -Path backups\backup_manual -DestinationPath backups\backup_manual.zip
```

---

## 🔄 JAK PRZYWRÓCIĆ BACKUP?

### Metoda 1: PowerShell (Zalecana)

```powershell
# Pokaż dostępne backupy
.\restore.ps1

# Przywróć konkretny backup
.\restore.ps1 -BackupFile "backups\backup_20251116_210000.zip"
```

**Co się stanie:**
1. ⚠️  Wyświetli ostrzeżenie
2. 🛑 Zatrzyma serwer (jeśli działa)
3. 💾 Utworzy backup bezpieczeństwa obecnego stanu
4. 📦 Rozpakuje wybrany backup
5. 🔄 Przywróci wszystkie pliki
6. 📊 Przywróci bazę danych
7. 📦 Zainstaluje zależności (`npm install`)
8. ✅ Wyświetli podsumowanie

**Czas trwania:** ~1-3 minuty

---

### Metoda 2: Ręczna

```powershell
# 1. Zatrzymaj serwer
# Ctrl + C w terminalu serwera

# 2. Rozpakuj backup
Expand-Archive -Path backups\backup_XXXXXXXX_XXXXXX.zip -DestinationPath temp_restore

# 3. Skopiuj pliki
xcopy temp_restore\backend backend /E /I /Y
xcopy temp_restore\frontend frontend /E /I /Y
copy temp_restore\database.db backend\database\database.db /Y

# 4. Zainstaluj zależności
npm install

# 5. Uruchom serwer
node backend/server.js
```

---

## 📅 HARMONOGRAM BACKUPÓW

### Zalecane:

| Częstotliwość | Kiedy | Przechowywanie |
|---------------|-------|----------------|
| **Codziennie** | 23:00 | 7 dni |
| **Co tydzień** | Niedziela 23:00 | 4 tygodnie |
| **Co miesiąc** | 1. dzień miesiąca | 12 miesięcy |
| **Przed aktualizacją** | Zawsze | Do końca aktualizacji |

---

## 🤖 AUTOMATYZACJA BACKUPÓW

### Windows Task Scheduler

1. Otwórz **Task Scheduler**
2. Kliknij **Create Basic Task**
3. Nazwa: "Pro Meritum Daily Backup"
4. Trigger: **Daily** o 23:00
5. Action: **Start a program**
   - Program: `powershell.exe`
   - Arguments: `-File "C:\...\komunikator-app\backup.ps1"`
6. Finish

---

### Skrypt automatyczny (backup-auto.ps1)

```powershell
# Utwórz plik: backup-auto.ps1
$logFile = "backups\backup_log.txt"

# Uruchom backup
.\backup.ps1 | Tee-Object -FilePath $logFile -Append

# Usuń stare backupy (starsze niż 7 dni)
Get-ChildItem "backups\backup_*.zip" | 
    Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | 
    Remove-Item -Force

# Wyślij email z potwierdzeniem (opcjonalnie)
# Send-MailMessage -To "admin@pro-meritum.pl" ...
```

Dodaj do Task Scheduler:
```
powershell.exe -File "C:\...\backup-auto.ps1"
```

---

## 💾 GDZIE PRZECHOWYWAĆ BACKUPY?

### ✅ Zalecane lokalizacje:

1. **Lokalnie** (krótkoterminowe)
   - `backups/` w katalogu aplikacji
   - Szybki dostęp
   - ⚠️ Nie chroni przed awarią dysku!

2. **Zewnętrzny dysk** (średnioterminowe)
   - Dysk USB / Zewnętrzny HDD
   - Odłączony od komputera
   - ✅ Chroni przed awarią dysku

3. **Chmura** (długoterminowe)
   - Google Drive
   - OneDrive
   - Dropbox
   - ✅ Chroni przed awarią sprzętu

4. **Serwer zdalny** (profesjonalne)
   - FTP / SFTP
   - NAS (Network Attached Storage)
   - ✅ Najwyższe bezpieczeństwo

---

## 🔐 BEZPIECZEŃSTWO BACKUPÓW

### ⚠️ WAŻNE:

1. **Plik `.env.BACKUP` zawiera:**
   - Hasła do bazy danych
   - Klucze API (PayPal, Stripe, etc.)
   - Tokeny dostępu
   - **NIE UDOSTĘPNIAJ NIKOMU!**

2. **Szyfrowanie** (zalecane):
```powershell
# Zaszyfruj backup
$password = Read-Host -AsSecureString "Hasło do backupu"
Compress-Archive -Path backups\backup_XXXXXXXX_XXXXXX -DestinationPath backup_encrypted.zip -Password $password
```

3. **Uprawnienia:**
   - Tylko administrator ma dostęp
   - Nie przechowuj na publicznych serwerach

---

## 🧪 TESTOWANIE BACKUPÓW

### Co miesiąc:

1. Wybierz losowy backup
2. Przywróć na testowym środowisku
3. Sprawdź czy:
   - ✅ Aplikacja się uruchamia
   - ✅ Baza danych działa
   - ✅ Wszystkie funkcje działają
   - ✅ Dane są kompletne

```powershell
# Test backupu
.\restore.ps1 -BackupFile "backups\backup_test.zip"
node backend/server.js
# Otwórz http://localhost:3500
# Przetestuj logowanie, CRM, faktury, etc.
```

---

## 📊 MONITORING BACKUPÓW

### Sprawdź status backupów:

```powershell
# Lista backupów
Get-ChildItem backups\backup_*.zip | 
    Sort-Object LastWriteTime -Descending | 
    Select-Object Name, @{N='Size(MB)';E={[math]::Round($_.Length/1MB,2)}}, LastWriteTime | 
    Format-Table -AutoSize

# Ostatni backup
$lastBackup = Get-ChildItem backups\backup_*.zip | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Write-Host "Ostatni backup: $($lastBackup.Name) - $($lastBackup.LastWriteTime)"
```

---

## 🆘 SCENARIUSZE AWARYJNE

### 1. **Awaria serwera**
```powershell
.\restore.ps1 -BackupFile "backups\backup_latest.zip"
node backend/server.js
```

### 2. **Uszkodzenie bazy danych**
```powershell
# Tylko baza
copy backups\backup_XXXXXXXX_XXXXXX\database.db backend\database\database.db
```

### 3. **Błąd po aktualizacji**
```powershell
# Przywróć backup sprzed aktualizacji
.\restore.ps1 -BackupFile "backups\backup_before_update.zip"
```

### 4. **Utrata plików**
```powershell
# Rozpakuj i skopiuj tylko potrzebne pliki
Expand-Archive backups\backup_XXXXXXXX_XXXXXX.zip -DestinationPath temp
copy temp\frontend\scripts\module.js frontend\scripts\
```

---

## 📋 CHECKLIST BACKUPU

### Przed wdrożeniem:
- [ ] Skrypt `backup.ps1` działa
- [ ] Skrypt `restore.ps1` działa
- [ ] Katalog `backups/` istnieje
- [ ] Przetestowano przywracanie
- [ ] Skonfigurowano automatyzację
- [ ] Określono lokalizację przechowywania
- [ ] Zaszyfrowano wrażliwe backupy

### Co tydzień:
- [ ] Sprawdź czy backupy są tworzone
- [ ] Sprawdź rozmiar backupów
- [ ] Usuń stare backupy (>7 dni)

### Co miesiąc:
- [ ] Przetestuj przywracanie backupu
- [ ] Przenieś backup do chmury
- [ ] Sprawdź logi backupów

---

## 💡 WSKAZÓWKI

1. **Nazywaj backupy opisowo:**
   ```
   backup_20251116_before_payment_system.zip
   backup_20251116_before_database_migration.zip
   ```

2. **Twórz backup przed:**
   - Aktualizacją systemu
   - Migracją bazy danych
   - Dodaniem nowych funkcji
   - Zmianą konfiguracji

3. **Przechowuj minimum 3 kopie:**
   - 1x lokalnie (szybki dostęp)
   - 1x zewnętrzny dysk (bezpieczeństwo)
   - 1x chmura (długoterminowe)

---

## 📞 POMOC

W razie problemów:
1. Sprawdź logi: `backups\backup_log.txt`
2. Przeczytaj README.md w backupie
3. Skontaktuj się z administratorem

---

**KONIEC INSTRUKCJI**
