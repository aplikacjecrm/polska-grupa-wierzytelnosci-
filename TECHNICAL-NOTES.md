# 📝 TECHNICAL NOTES - Kancelaria CRM

## 🗄️ BAZA DANYCH

### ⚠️ WAŻNE - Ścieżka do bazy danych:
```
PRAWDZIWA BAZA: data/komunikator.db
NIE UŻYWAĆ: backend/database/kancelaria.db (stara, nieużywana)
```

### Konfiguracja w kodzie:
- **File:** `backend/database/init.js`
- **Domyślna ścieżka:** `./data/komunikator.db`
- **Można nadpisać:** Ustaw `process.env.DB_PATH`

### Uruchamianie migracji:
```powershell
# Z domyślną bazą
node backend/migrations/005-monthly-reports.js

# Z konkretną bazą (jeśli trzeba)
$env:DB_PATH='c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app\data\komunikator.db'
node backend/migrations/005-monthly-reports.js
```

### Generowanie raportów miesięcznych:
```powershell
# Z domyślną bazą
$env:DB_PATH='c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app\data\komunikator.db'
node backend/cron/generate-monthly-reports.js
```

---

## 📊 RAPORTY MIESIĘCZNE

### Tabela: `monthly_reports`
- **Lokalizacja:** `data/komunikator.db`
- **Utworzona:** 2025-11-23
- **Migracja:** `005-monthly-reports.js`

### Struktura:
- `id, user_id, report_year, report_month`
- `total_work_hours, total_login_sessions, avg_session_duration`
- `total_cases, total_clients, completed_tasks, total_tasks`
- `avg_rating, status, generated_at`
- **JSON:** `work_time_details, activity_summary`

### Cron Job:
- **File:** `backend/cron/generate-monthly-reports.js`
- **Uruchamianie:** Ostatni dzień miesiąca o **23:55**
- **Strefa czasowa:** Europe/Warsaw
- **Scheduler:** `backend/server.js` (linie 358-387)

### API Endpoints:
```
GET /api/employees/:userId/monthly-reports
GET /api/employees/:userId/monthly-reports/:year/:month
```

### Frontend:
- **File:** `frontend/scripts/dashboards/employee-dashboard.js`
- **Wersja:** v5.6
- **Zakładka:** "📁 Raporty"
- **Funkcje:** `renderReportsTab()`, `showReportDetails()`

---

## ⏰ CZAS PRACY - Format

### Problem rozwiązany (2025-11-23):
- **Przed:** 3.80h (mylące - dziesiętne)
- **Po:** 3h 48m (czytelne)

### Funkcja formatowania:
```javascript
formatDecimalHours(decimalHours) {
  if (!decimalHours || decimalHours === 0) return '0h 0m';
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}h ${minutes}m`;
}
```

### Matematyka:
- **Godzina = 60 minut** (NIE 100!)
- 3.80h = 3h + (0.80 × 60) = 3h + 48 = **3h 48m** ✓

---

## 🌍 STREFA CZASOWA

### Konfiguracja:
- **Strefa:** Europe/Warsaw
- **Czas zimowy:** UTC+1
- **Czas letni:** UTC+2

### Backend:
- **Login:** `datetime('now', 'localtime')` w `routes/auth.js`
- **Logout:** `datetime('now', 'localtime')` w `routes/auth.js`

### Frontend:
- **Parsowanie:** Daty z SQLite parsowane jako lokalny czas (bez 'Z')
- **Wyświetlanie:** Format 24-godzinny, `pl-PL`

---

## 🔧 CZĘSTE PROBLEMY I ROZWIĄZANIA

### Problem: "Error: Bad servers" / SQLITE_ERROR
**Przyczyna:** Tabela nie istnieje w używanej bazie  
**Rozwiązanie:**
1. Sprawdź którą bazę używa serwer: `📍 Database path:` w logach
2. Uruchom migrację z `$env:DB_PATH` ustawionym na tę bazę
3. Wygeneruj raporty

### Problem: Błąd 500 przy `/api/employees/:userId/monthly-reports`
**Przyczyna:** Kolejność routów - parametryzowane routy przejmują request  
**Rozwiązanie:** Route `monthly-reports` MUSI być przed `/:userId/:taskId`

### Problem: Cache przeglądarki - stary JS
**Rozwiązanie:** Zmień wersję w `index.html`:
```html
<script src="scripts/dashboards/employee-dashboard.js?v=5.7&..."></script>
```

---

## 📁 STRUKTURA PROJEKTU

### Backend:
```
backend/
├── database/
│   ├── init.js                    # Inicjalizacja bazy (używa data/komunikator.db)
│   └── kancelaria.db              # ❌ NIEUŻYWANA
├── data/
│   └── komunikator.db             # ✅ PRAWDZIWA BAZA
├── migrations/
│   └── 005-monthly-reports.js     # Migracja raportów
├── cron/
│   └── generate-monthly-reports.js # Generator raportów
├── routes/
│   ├── auth.js                    # Logowanie/wylogowanie
│   └── employees.js               # Dashboard pracownika + raporty
└── server.js                      # Scheduler CRON
```

### Frontend:
```
frontend/
├── scripts/
│   └── dashboards/
│       └── employee-dashboard.js  # Dashboard + zakładka Raporty
└── index.html                     # Wersjonowanie skryptów
```

---

## 🚀 RESTART SERWERA

```powershell
# Zatrzymaj
Stop-Process -Name node -Force

# Uruchom
node backend/server.js
```

### Weryfikacja:
- Log: `📍 Database path: ./data/komunikator.db` ✅
- Log: `⏰ Scheduler raportów miesięcznych uruchomiony` ✅
- Log: `✅ employees.js router loaded` ✅

---

## 👥 UŻYTKOWNICY - KONTA SYSTEMOWE

### Tworzenie kont HR i Finance:

**METODA:** Używaj Admin Dashboard → "👤 Dodaj użytkownika"

**Dostępne role w systemie:**
- `admin` - Administrator (pełny dostęp)
- `lawyer` - Prawnik/Radca
- `client_manager` - Opiekun klienta
- `case_manager` - Opiekun sprawy
- `reception` - Recepcja
- **`hr`** - Dział HR/Kadr ⭐ NOWE
- **`finance`** - Dział Finansowy ⭐ NOWE
- `client` - Klient

### Uprawnienia ról:

**HR (`hr`):**
- Zarządzanie pracownikami, profilami
- Raporty miesięczne, oceny
- Przypisywanie zadań
- Edycja danych finansowych pracowników

**Finance (`finance`):**
- Pełny dostęp do finansów
- Wypłaty pensji (z automatyczną listą pracowników)
- Faktury, wydatki, raty
- Edycja danych finansowych pracowników

---

## 📝 CHANGELOG

### 2025-11-23
- ✅ Utworzono system raportów miesięcznych
- ✅ Naprawiono format czasu (3h 48m zamiast 3.80h)
- ✅ Naprawiono strefę czasową (Warsaw lokalny czas)
- ✅ Dodano zakładkę "Raporty" w dashboardzie pracownika
- ✅ Dodano automatyczny scheduler (ostatni dzień miesiąca 23:55)
  - HR startuje na Employee Dashboard
  - Finance startuje na Finance Dashboard
  - Menu pokazuje tylko: Ustawienia, Czat, Poczta
  - **FIX:** Dodano obsługę finance-dashboard i employee-dashboard w app.js switchView()
  - **FIX:** Zablokowano ładowanie CRM (loadClients/loadCases) dla HR i Finance w auth.js
-  **MODUŁ FINANSOWY PRACOWNIKA:**
  - Rozszerzono `employee_profiles` o pola finansowe (pensja, konto, umowa, etc.)
  - Dodano zakładkę " Finanse" w Employee Dashboard
  - Historia wypłat pracownika z podsumowaniami (łącznie, średnia)
  - Formularz edycji danych finansowych (tylko HR + Finance + Admin)
  - Endpoint `/api/employees/:userId/salary-history` (GET)
  - Endpoint `/api/employees/:userId/financial-data` (PUT)
  - Automatyczne ładowanie historii przy przełączeniu zakładki

---

## 🔗 PRZYDATNE KOMENDY

### Sprawdź tabelę w bazie:
```powershell
node backend/check-monthly-reports.js
```

### Wygeneruj raporty manualnie:
```powershell
$env:DB_PATH='c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app\data\komunikator.db'
node backend/cron/generate-monthly-reports.js
```

### Sprawdź liczbę raportów:
```powershell
node -e "const sqlite3 = require('sqlite3').verbose(); const db = new sqlite3.Database('./data/komunikator.db'); db.get('SELECT COUNT(*) as count FROM monthly_reports', (err, row) => { console.log('Raporty:', row.count); db.close(); });"
```

---

**Ostatnia aktualizacja:** 2025-11-23 20:54  
**Autor:** Windsurf AI + User
