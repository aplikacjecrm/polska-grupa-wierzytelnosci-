# 💾 SYSTEM BACKUPÓW BAZY DANYCH

**Data utworzenia:** 7 listopada 2025, 01:30  
**Status:** ✅ AKTYWNY

---

## 📋 OPIS

Kompletny system zabezpieczeń bazy danych SQLite:
- ✅ **Automatyczne backupy** z timestampem
- ✅ **Przywracanie** wybranego backupu
- ✅ **Czyszczenie** starych backupów
- ✅ **Zabezpieczenie** przed utratą danych

---

## 🗂️ PLIKI SYSTEMU

```
backend/
├── backup.js                  - Tworzy backup
├── restore.js                 - Przywraca backup
├── cleanup-old-backups.js     - Usuwa stare backupy
├── BACKUP-SYSTEM.md           - Ta dokumentacja
└── backups/                   - Folder z backupami (auto-tworzony)
    ├── backup_2025-11-07_01-30-00.db
    ├── backup_2025-11-07_12-00-00.db
    └── before_restore_XXX.db  - Backupy zabezpieczające
```

---

## 🚀 JAK UŻYWAĆ

### 1️⃣ TWORZENIE BACKUPU

**Ręcznie:**
```bash
cd backend
node backup.js
```

**Wynik:**
```
💾 Tworzę backup bazy danych...
✅ Backup utworzony pomyślnie!
📁 Plik: backup_2025-11-07_01-30-00.db
📊 Rozmiar: 1234.56 KB
📂 Lokalizacja: C:\...\backend\backups\backup_2025-11-07_01-30-00.db

📦 Łącznie backupów: 5

📋 Ostatnie backupy:
   1. backup_2025-11-07_01-30-00.db (7.11.2025, 01:30:00)
   2. backup_2025-11-06_20-15-30.db (6.11.2025, 20:15:30)
   3. backup_2025-11-06_12-00-00.db (6.11.2025, 12:00:00)
```

---

### 2️⃣ PRZYWRACANIE BACKUPU

**Lista dostępnych backupów:**
```bash
node restore.js
```

**Przywróć konkretny backup:**
```bash
node restore.js backup_2025-11-07_01-30-00.db
```

**Proces:**
```
⚠️  UWAGA! Ta operacja:
   1. Utworzy backup AKTUALNEJ bazy
   2. Zastąpi aktualną bazę wybranym backupem
   3. Przywróci stan z: backup_2025-11-07_01-30-00.db

🔴 WSZYSTKIE NIEZAPISANE ZMIANY ZOSTANĄ UTRACONE!

❓ Czy na pewno chcesz kontynuować? (TAK/nie): TAK

💾 Tworzę backup aktualnej bazy...
✅ Backup zabezpieczający: before_restore_2025-11-07_01-35-00.db

⚡ Przywracam backup...
✅ Backup przywrócony pomyślnie!
📊 Rozmiar przywróconej bazy: 1234.56 KB

🔄 Zrestartuj serwer aby zmiany zadziałały!
   Ctrl+C na serwerze → node server.js
```

**WAŻNE:** Po przywróceniu **MUSISZ** zrestartować serwer!

---

### 3️⃣ CZYSZCZENIE STARYCH BACKUPÓW

**Uruchom czyszczenie:**
```bash
node cleanup-old-backups.js
```

**Proces:**
```
📦 Łącznie backupów: 45
✅ Do zachowania: 30 (młodsze niż 30 dni)
🗑️  Do usunięcia: 15 (starsze niż 30 dni)

📋 Backupy do usunięcia:
   1. backup_2025-09-15_10-00-00.db (15.09.2025, 10:00:00, 1200.00 KB)
   2. backup_2025-09-14_10-00-00.db (14.09.2025, 10:00:00, 1198.50 KB)
   ...

💾 Zwolnisz 18.50 MB miejsca

❓ Czy chcesz usunąć te backupy? (TAK/nie): TAK

🗑️  Usunięto: backup_2025-09-15_10-00-00.db
🗑️  Usunięto: backup_2025-09-14_10-00-00.db
...

✅ Usunięto 15 backupów (18.50 MB)
📦 Pozostało: 30 backupów
```

**Domyślnie:** Zachowuje ostatnie **30 dni** historii

---

## ⏰ AUTOMATYCZNE BACKUPY

### **Opcja 1: Cron / Task Scheduler (Zalecane)**

**Windows Task Scheduler:**
1. Otwórz "Harmonogram zadań" (Task Scheduler)
2. Utwórz nowe zadanie:
   - **Nazwa:** Backup Kancelaria DB
   - **Wyzwalacz:** Codziennie o 3:00
   - **Akcja:** 
     ```
     Program: node
     Argumenty: backup.js
     Katalog: C:\...\backend
     ```

**Linux Cron:**
```bash
# Edytuj crontab
crontab -e

# Dodaj linię (backup o 3:00 każdego dnia)
0 3 * * * cd /path/to/backend && node backup.js >> /path/to/logs/backup.log 2>&1
```

---

### **Opcja 2: npm script**

Dodaj do `package.json`:
```json
{
  "scripts": {
    "backup": "node backend/backup.js",
    "restore": "node backend/restore.js",
    "cleanup": "node backend/cleanup-old-backups.js"
  }
}
```

Użycie:
```bash
npm run backup
npm run restore
npm run cleanup
```

---

## 🛡️ ZABEZPIECZENIA

### **1. Podwójne zabezpieczenie**
Przed przywróceniem backupu system automatycznie tworzy backup aktualnej bazy jako `before_restore_XXX.db`

### **2. Potwierdzenie akcji**
Wszystkie destruktywne operacje wymagają wpisania "TAK"

### **3. Timestampy**
Każdy backup ma unikalną nazwę z dokładnym czasem utworzenia

### **4. Statystyki**
Zawsze widzisz ile backupów masz i ile miejsca zajmują

---

## 📊 FORMAT NAZW

```
backup_2025-11-07_01-30-00.db
       └─ YYYY-MM-DD_HH-MM-SS

before_restore_2025-11-07_01-35-00.db
               └─ Backup zabezpieczający
```

---

## ⚠️ WAŻNE OSTRZEŻENIA

### ❌ NIE USUWAJ RĘCZNIE
Nie usuwaj plików z `backups/` ręcznie! Użyj `cleanup-old-backups.js`

### 🔄 RESTART SERWERA
Po przywróceniu backupu **ZAWSZE** restartuj serwer!

### 💾 MIEJSCE NA DYSKU
Sprawdzaj regularnie ile miejsca zajmują backupy. Średnio: ~1-2 MB na backup.

### 📁 BACKUPY TO NIE WSZYSTKO
Backupy NIE zawierają plików z `uploads/`! Zrób osobny backup tego folderu!

---

## 🆘 AWARYJNE PRZYWRACANIE

### **Gdyby coś poszło bardzo źle:**

1. **Sprawdź backupy:**
   ```bash
   node restore.js
   ```

2. **Wybierz ostatni dobry backup**

3. **Przywróć:**
   ```bash
   node restore.js backup_XXXX.db
   ```

4. **Zrestartuj serwer**

5. **Sprawdź czy działa**

---

## 💡 DOBRE PRAKTYKI

### ✅ CO ROBIĆ:
- ✅ Twórz backup **PRZED każdą większą zmianą**
- ✅ Automatyzuj backupy (codziennie o 3:00)
- ✅ Czyść stare backupy co miesiąc
- ✅ Testuj przywracanie co jakiś czas

### ❌ CZEGO UNIKAĆ:
- ❌ Nie przywracaj backupów "na żywym" serwerze
- ❌ Nie usuwaj backupów ręcznie
- ❌ Nie zapomnij o backupie `uploads/`

---

## 📞 WSPARCIE

**Problem z backupem?**
1. Sprawdź logi w konsoli
2. Upewnij się że folder `backups/` istnieje
3. Sprawdź uprawnienia do zapisu
4. Sprawdź miejsce na dysku

**Nie działa przywracanie?**
1. Sprawdź czy backup istnieje
2. Czy serwer jest wyłączony?
3. Czy masz uprawnienia do nadpisania `system.db`?

---

## 🎯 PODSUMOWANIE

**System backupów to:**
- 💾 **3 proste skrypty**
- ⚡ **1 komenda** = backup gotowy
- 🛡️ **100% bezpieczeństwa** Twoich danych
- 🔄 **Łatwe przywracanie** w razie problemów

**ZAWSZE TWÓRZ BACKUP PRZED:**
- Migracjami bazy
- Większymi zmianami w kodzie
- Testowaniem nowych funkcji
- Aktualizacjami systemu

---

**Ostatnia aktualizacja:** 7 listopada 2025, 01:30  
**Status:** ✅ GOTOWY DO UŻYCIA
