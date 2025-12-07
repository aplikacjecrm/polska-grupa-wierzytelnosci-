# 🤖 AUTOMATYCZNY BACKUP - INSTRUKCJA KROK PO KROKU

**Data:** 7 listopada 2025, 01:45  
**Dla:** Windows

---

## 🎯 CO ZOSTAŁO UTWORZONE:

```
✅ backup-full.js         - Backup BAZY + ZAŁĄCZNIKÓW
✅ auto-backup.bat        - Skrypt automatyczny
✅ Ta instrukcja          - Jak uruchomić
```

---

## 📦 CO BACKUPUJE:

### **1. Baza danych:**
```
database/kancelaria.db → backups/backup_2025-11-07_03-00-00.db
```

### **2. Wszystkie załączniki:**
```
uploads/ → backups/uploads_2025-11-07_03-00-00/
  ├── attachments/
  ├── documents/
  ├── evidence/
  └── ... (wszystkie foldery)
```

**KOMPLETNY BACKUP!** 🛡️

---

## ⚙️ KROK 1: TEST RĘCZNY

### **Przed konfiguracją przetestuj:**

```bash
cd backend
node backup-full.js
```

**Powinno pokazać:**
```
💾 PEŁNY BACKUP - BAZA + ZAŁĄCZNIKI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 [1/2] Backup bazy danych...
   ✅ Baza: 1234.56 KB

📁 [2/2] Backup załączników...
   ✅ Załączniki: 15.30 MB

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ BACKUP UKOŃCZONY POMYŚLNIE!

📦 Łączny rozmiar: 16.78 MB
⏱️  Czas: 2.35s
📂 Lokalizacja:
   - Baza: C:\...\backups\backup_2025-11-07_01-45-00.db
   - Załączniki: C:\...\backups\uploads_2025-11-07_01-45-00

📊 Łącznie backupów: 3
```

✅ **Jeśli widzisz to - DZIAŁA!**

---

## 🤖 KROK 2: AUTOMATYCZNY BACKUP (Windows)

### **A. Otwórz Harmonogram zadań**

1. **Naciśnij:** `Win + R`
2. **Wpisz:** `taskschd.msc`
3. **Enter**

---

### **B. Utwórz nowe zadanie**

1. **Kliknij:** "Utwórz zadanie podstawowe..." (prawy panel)

2. **Nazwa:**
   ```
   Backup Kancelaria - Codziennie 3:00
   ```

3. **Opis:**
   ```
   Automatyczny backup bazy danych i załączników
   ```

4. **Kliknij:** Dalej

---

### **C. Wyzwalacz (Kiedy uruchamiać)**

1. **Wybierz:** "Codziennie"
2. **Kliknij:** Dalej

3. **Godzina rozpoczęcia:**
   ```
   03:00:00  (3:00 w nocy)
   ```

4. **Powtarzaj co:**
   ```
   1 dni
   ```

5. **Kliknij:** Dalej

---

### **D. Akcja (Co uruchomić)**

1. **Wybierz:** "Uruchom program"
2. **Kliknij:** Dalej

3. **Program/skrypt:**
   ```
   C:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app\backend\auto-backup.bat
   ```
   
   **LUB kliknij "Przeglądaj" i wybierz `auto-backup.bat`**

4. **Rozpocznij w (opcjonalnie):**
   ```
   C:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app\backend
   ```

5. **Kliknij:** Dalej

---

### **E. Podsumowanie**

1. **Sprawdź ustawienia**
2. **☑ Zaznacz:** "Otwórz okno dialogowe właściwości..."
3. **Kliknij:** Zakończ

---

### **F. Dodatkowe ustawienia (WAŻNE!)**

**W oknie właściwości:**

#### **Zakładka "Ogólne":**
- ☑ **Uruchom niezależnie od tego, czy użytkownik jest zalogowany**
- ☑ **Uruchom z najwyższymi uprawnieniami**

#### **Zakładka "Warunki":**
- ☐ **Odznacz:** "Uruchamiaj zadanie tylko wtedy, gdy komputer jest zasilany z sieci"
  
  *(Backup też na baterii!)*

#### **Zakładka "Ustawienia":**
- ☑ **Jeśli zadanie nie powiedzie się, uruchom ponownie co:** 1 minutę
- **Spróbuj ponownie do:** 3 razy

---

### **G. Zapisz i testuj**

1. **Kliknij:** OK
2. **Podaj hasło systemu** (jeśli zapyta)

---

## 🧪 KROK 3: TEST AUTOMATYCZNEGO BACKUPU

### **Nie czekaj do 3:00! Przetestuj teraz:**

1. **W Harmonogramie zadań:**
   - Znajdź swoje zadanie
   - **Kliknij prawym:** "Uruchom"

2. **Sprawdź:**
   - Powinno pokazać się okno z logami
   - Backup powinien się wykonać

3. **Sprawdź folder:**
   ```
   backend/backups/
   ├── backup_2025-11-07_01-45-00.db       ✅
   ├── uploads_2025-11-07_01-45-00/        ✅
   └── backup-log.txt                      ✅
   ```

✅ **Jeśli pliki się pojawiły - DZIAŁA!**

---

## 📋 HARMONOGRAM BACKUPÓW

### **Domyślnie:**
```
Każdego dnia o 3:00 w nocy
```

### **Możesz zmienić na:**

**Częściej (co 6 godzin):**
- 03:00, 09:00, 15:00, 21:00

**Rzadziej (co tydzień):**
- Niedziela 3:00

**Edytuj zadanie → Wyzwalacze → Dodaj/Zmień**

---

## 📊 MONITORING BACKUPÓW

### **Plik logu:**
```
backend/backup-log.txt
```

**Zawartość:**
```
[07.11.2025 03:00:15] Backup wykonany
[08.11.2025 03:00:12] Backup wykonany
[09.11.2025 03:00:18] Backup wykonany
```

### **Sprawdź czy działa:**
```bash
# Zobacz ostatnie backupy
dir backups /od

# Zobacz log
type backup-log.txt
```

---

## 🛠️ RĘCZNE BACKUPY (nadal możesz!)

### **Pełny backup (baza + załączniki):**
```bash
cd backend
node backup-full.js
```

### **Tylko baza:**
```bash
node backup.js
```

---

## 🧹 CZYSZCZENIE STARYCH BACKUPÓW

### **Automatyczne czyszczenie:**

**Dodaj drugie zadanie w Harmonogramie:**

1. **Nazwa:** "Czyszczenie starych backupów"
2. **Wyzwalacz:** Pierwszy dzień miesiąca, 4:00
3. **Akcja:** 
   ```
   node cleanup-old-backups.js
   ```

**LUB ręcznie co miesiąc:**
```bash
node cleanup-old-backups.js
```

---

## ⚠️ WAŻNE UWAGI

### **1. Miejsce na dysku:**
```
Jeden backup ≈ 20-50 MB (średnio)
30 dni × 50 MB = 1.5 GB
```

**Sprawdzaj miejsce co miesiąc!**

### **2. Komputer musi być włączony:**
```
Backup o 3:00 → Komputer MUSI pracować!
```

**Opcje:**
- Zostaw komputer włączony na noc
- LUB zmień godzinę na dzień (np. 12:00)

### **3. Backup NIE zastępuje chmury:**
```
Lokalne backupy = Na tym samym dysku
Dysk się zepsuje = Tracisz wszystko!
```

**Zalecam:**
- Co tydzień kopiuj `backups/` na pendrive
- LUB uploaduj na Dysk Google / OneDrive

---

## 🎯 STRUKTURA BACKUPÓW

```
backups/
├── backup_2025-11-07_03-00-00.db       (Baza)
├── uploads_2025-11-07_03-00-00/        (Załączniki)
├── backup_2025-11-08_03-00-00.db
├── uploads_2025-11-08_03-00-00/
├── backup_2025-11-09_03-00-00.db
├── uploads_2025-11-09_03-00-00/
└── backup-log.txt                      (Historia)
```

**Każdy dzień = 2 foldery (baza + uploads)**

---

## 🆘 ROZWIĄZYWANIE PROBLEMÓW

### **Problem: Backup się nie uruchomił**

**Sprawdź:**
1. Czy komputer był włączony o 3:00?
2. Czy zadanie jest aktywne? (Harmonogram → powinno być "Gotowe")
3. Czy hasło systemowe się nie zmieniło?

**Rozwiązanie:**
```
Edytuj zadanie → Podaj nowe hasło → OK
```

---

### **Problem: Brak miejsca na dysku**

**Sprawdź:**
```bash
# Ile zajmują backupy?
dir backups

# Usuń stare
node cleanup-old-backups.js
```

---

### **Problem: Backup trwa za długo**

**Normalny czas:**
- Baza (500 KB) = 0.1s
- Załączniki (100 MB) = 5-10s
- **RAZEM:** ~10-30s

**Jeśli trwa dłużej:**
- Masz dużo załączników (to normalne)
- Dysk wolny (SSD szybszy niż HDD)

---

## 💡 ZALECENIA

### **✅ CO ROBIĆ:**
1. **Automatyczny backup codziennie** ✅ (już masz!)
2. **Sprawdzaj co tydzień** czy backupy się tworzą
3. **Czyść co miesiąc** stare backupy
4. **Kopiuj raz w tygodniu** na zewnętrzny dysk

### **❌ CZEGO UNIKAĆ:**
1. Nie wyłączaj komputera przed 3:00
2. Nie usuwaj ręcznie plików z `backups/`
3. Nie zapomnij o backupie zewnętrznym!

---

## 🎉 PODSUMOWANIE

### **MASZ TERAZ:**

```
✅ AUTOMATYCZNY BACKUP (codziennie 3:00)
   ├─ Baza danych
   └─ Wszystkie załączniki

✅ RĘCZNY BACKUP (gdy chcesz)
   node backup-full.js

✅ CZYSZCZENIE (co miesiąc)
   node cleanup-old-backups.js

✅ HISTORIA (backup-log.txt)
```

**TWOJE DANE SĄ BEZPIECZNE!** 🛡️💾

---

**Pytania? Problem?** Sprawdź logi:
- `backup-log.txt` - historia backupów
- Harmonogram zadań → Historia

---

**Ostatnia aktualizacja:** 7 listopada 2025, 01:45  
**Status:** ✅ GOTOWE DO UŻYCIA
