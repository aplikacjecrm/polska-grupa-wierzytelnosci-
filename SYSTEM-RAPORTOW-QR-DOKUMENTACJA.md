# 📋 System Raportów z Kodami QR - Pełna Dokumentacja

## 🎯 CEL SYSTEMU

Umożliwienie mecenasom bezpiecznego dostępu do pełnych danych sprawy poprzez zeskanowanie kodu QR z wydrukowanego raportu.

**Scenariusz użycia:**
1. Mecenas generuje raport (anonimowy - tylko kody)
2. Drukuje raport z kodem QR
3. Przed rozprawą skanuje QR telefonem
4. Wprowadza hasło i otrzymuje PEŁNE dane + AI wskazówki

---

## 🏗️ ARCHITEKTURA SYSTEMU

### **1. BAZA DANYCH**

**Tabela: `event_reports`**
```sql
CREATE TABLE event_reports (
  id INTEGER PRIMARY KEY,
  report_code TEXT UNIQUE NOT NULL,           -- RAP/CYW/JK/001/001
  event_id INTEGER NOT NULL,                  -- ID wydarzenia
  case_id INTEGER,                            -- ID sprawy
  event_type TEXT,                            -- Typ wydarzenia
  generated_by INTEGER NOT NULL,              -- User ID
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  report_data TEXT,                           -- JSON z danymi
  ai_recommendations TEXT,                    -- Wskazówki AI
  access_token TEXT UNIQUE NOT NULL,          -- Token dostępu (64 znaki)
  access_password TEXT DEFAULT 'Promeritum21',
  expires_at DATETIME NOT NULL,               -- Ważność (30 dni)
  view_count INTEGER DEFAULT 0,
  last_viewed_at DATETIME,
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (case_id) REFERENCES cases(id),
  FOREIGN KEY (generated_by) REFERENCES users(id)
)
```

**Indeksy:**
- `report_code` (UNIQUE)
- `access_token` (UNIQUE)
- `event_id`
- `expires_at`

---

### **2. BACKEND API**

**Plik:** `backend/routes/reports.js`

#### **Endpointy:**

##### 1. `POST /api/reports/generate`
Generuje raport w bazie i zwraca dane do QR.

**Body:**
```json
{
  "eventId": 123
}
```

**Response:**
```json
{
  "reportCode": "RAP/CYW/JK/001/001",
  "accessToken": "abc123xyz...",
  "reportUrl": "https://domena.pl/report-view?token=abc123xyz",
  "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=...",
  "expiresAt": "2025-12-08T09:00:00.000Z"
}
```

---

##### 2. `GET /api/reports/view?token=...&password=...`
Wyświetla pełny raport (wymaga hasła).

**Query params:**
- `token` - Token dostępu (z QR)
- `password` - Hasło (Promeritum21)

**Response:**
```json
{
  "reportCode": "RAP/CYW/JK/001/001",
  "generatedAt": "2025-11-08T09:00:00.000Z",
  "expiresAt": "2025-12-08T09:00:00.000Z",
  "viewCount": 5,
  "event": {
    "title": "Rozprawa sądowa",
    "startDate": "2025-11-15T10:00:00.000Z",
    "location": "Sąd Okręgowy",
    "description": "...",
    "extraData": {...}
  },
  "case": {
    "caseNumber": "CYW/JK/001",
    "title": "Sprawa o...",
    "caseType": "Cywilna"
  },
  "witnesses": [
    {
      "witness_code": "ŚW/CYW/JK/001/001",
      "first_name": "Jan",
      "last_name": "Kowalski",
      "phone": "123-456-789"
    }
  ],
  "evidence": [...],
  "documents": [...],
  "aiRecommendations": "🤖 WSKAZÓWKI..."
}
```

---

##### 3. `GET /api/reports/search?q=RAP/...`
Wyszukuje raporty po kodzie.

**Response:**
```json
{
  "reports": [
    {
      "report_code": "RAP/CYW/JK/001/001",
      "generated_at": "2025-11-08T09:00:00.000Z",
      "expires_at": "2025-12-08T09:00:00.000Z",
      "view_count": 5,
      "event_title": "Rozprawa",
      "case_number": "CYW/JK/001"
    }
  ]
}
```

---

##### 4. `POST /api/reports/:code/generate-ai`
Generuje AI rekomendacje.

**Response:**
```json
{
  "recommendations": "🤖 WSKAZÓWKI PRZYGOTOWANIA...",
  "prompt": "..." 
}
```

---

### **3. FRONTEND**

#### **A. Generator Raportu**

**Plik:** `frontend/scripts/event-report-generator.js`

**Funkcja:** `window.generateEventReport(eventId)`

**Przepływ:**
1. Wywołaj `POST /api/reports/generate` → otrzymaj `reportCode`, `qrCodeUrl`
2. Pobierz dane wydarzenia
3. Pobierz świadków, dowody, dokumenty (tylko kody!)
4. Wygeneruj HTML raportu z kodem QR w nagłówku
5. Otwórz w nowym oknie do druku
6. W tle: generuj AI rekomendacje (`POST /reports/:code/generate-ai`)

**Kod QR w nagłówku:**
```html
<div class="header">
  <div style="display: flex; ...">
    <div>
      <h1>📋 RAPORT PRZYGOTOWAWCZY</h1>
      <p>Kod raportu: RAP/CYW/JK/001/001</p>
      <p>Ważny do: 08.12.2025</p>
    </div>
    <div>
      <img src="[QR_CODE_URL]" width="150" height="150">
      <p>📱 Zeskanuj dla pełnego dostępu</p>
    </div>
  </div>
</div>
```

---

#### **B. Strona Mobilna**

**Plik:** `frontend/report-view.html`

**URL:** `https://domena.pl/report-view?token=abc123xyz`

**Przepływ:**
1. Użytkownik skanuje QR telefonem
2. Otwiera się strona z formularzem hasła
3. Wpisuje: `Promeritum21`
4. Wywołuje `GET /api/reports/view?token=...&password=...`
5. Wyświetla PEŁNE dane:
   - Wydarzenie (tytuł, data, lokalizacja, opis)
   - Sprawa (numer, tytuł, typ)
   - Świadkowie (kod, **imię, nazwisko, telefon**)
   - Dowody (kod, tytuł, typ)
   - Dokumenty (kod, tytuł)
   - AI Rekomendacje (🤖 sekcja)

**Design:**
- Gradient fioletowy tło
- Białe karty z cieniami
- Responsywny (mobile-first)
- Czytelne fonty (1.1rem+)
- Sekcje z kolorowymi nagłówkami

---

#### **C. Wyszukiwarka Raportów**

**Plik:** `frontend/scripts/reports-search.js`

**Moduł:** `window.reportsSearchModule`

**Funkcje:**
- `renderSearchSection()` - Renderuje UI
- `search()` - Wyszukuje raporty
- `renderResults(reports)` - Wyświetla wyniki

**Kontener:**
```html
<div id="reportsSearchContainer"></div>
```

**Przykład użycia:**
```javascript
// W CRM dodaj gdzieś:
<div id="reportsSearchContainer"></div>

// Inicjalizacja:
window.reportsSearchModule.renderSearchSection();
```

---

## 🔐 BEZPIECZEŃSTWO

### **1. Token dostępu**
- 64-znakowy token (crypto.randomBytes(32).toString('hex'))
- Unikalny dla każdego raportu
- Przechowywany w bazie

### **2. Hasło**
- Statyczne: `Promeritum21`
- Walidacja po stronie backend
- Możliwość zmiany w przyszłości

### **3. Wygasanie**
- Raport ważny 30 dni od wygenerowania
- Backend sprawdza `expires_at`
- Zwraca 410 Gone jeśli wygasł

### **4. Licznik wyświetleń**
- Każde otwarcie inkrementuje `view_count`
- Zapisuje `last_viewed_at`
- Audyt dostępu

---

## 🤖 INTEGRACJA Z AI

### **Automatyczne generowanie:**
Po utworzeniu raportu system automatycznie wywołuje:
```javascript
POST /api/reports/${reportCode}/generate-ai
```

### **Dane dla AI:**
```javascript
{
  event: { type, title, date, extra_data },
  witnesses: [ { code, name, ... } ],
  evidence: [ { code, title, ... } ],
  case_type: "Cywilna"
}
```

### **Format wskazówek:**
```
🤖 WSKAZÓWKI PRZYGOTOWANIA

📋 PODSTAWOWE INFORMACJE:
- Typ rozprawy: court
- Liczba świadków: 3
- Liczba dowodów: 5

👥 ŚWIADKOWIE:
1. Skontaktuj się z Jan Kowalski (ŚW/001)
2. Skontaktuj się z Anna Nowak (ŚW/002)

📋 DOWODY:
1. Przygotuj Nagranie audio (DOW/001)
2. Przygotuj Zdjęcia (DOW/002)

📄 DOKUMENTY:
- Przygotuj 3 kopie
- Sprawdź oryginały
- Uporządkuj chronologicznie

⚖️ STRATEGIA:
- Przygotuj główne argumenty
- Przewiduj kontrargumenty
- Miej plan B
```

---

## 📊 NUMERACJA RAPORTÓW

### **Format:**
```
RAP/[TYP_SPRAWY]/[INICJAŁY]/[NUMER_SPRAWY]/[NUMER_RAPORTU]
```

### **Przykłady:**
- `RAP/CYW/JK/001/001` - Pierwszy raport sprawy cywilnej
- `RAP/KAR/AN/002/003` - Trzeci raport sprawy karnej
- `RAP/ARB/DK/010/001` - Pierwszy raport sprawy arbitrażowej

### **Logika generowania:**
1. Pobierz `case_number` sprawy
2. Zlicz istniejące raporty dla sprawy
3. Numer = `count + 1` (padded do 3 cyfr)
4. Format: `RAP/${case_number}/${numer}`

---

## 🔄 PRZEPŁYW UŻYTKOWNIKA

```
┌─────────────────────────────────────────────────────────┐
│ 1. GENEROWANIE RAPORTU                                  │
├─────────────────────────────────────────────────────────┤
│ Mecenas → Otwiera wydarzenie → Klik "Generuj raport"   │
│ ↓                                                       │
│ System tworzy w bazie:                                  │
│  - report_code: RAP/CYW/JK/001/001                     │
│  - access_token: abc123xyz...                           │
│  - expires_at: +30 dni                                  │
│ ↓                                                       │
│ Generuje QR Code (150x150px)                           │
│ ↓                                                       │
│ Otwiera PDF z:                                          │
│  - Kod raportu w nagłówku                              │
│  - QR kod obok                                         │
│  - Anonimowe dane (tylko kody)                         │
│ ↓                                                       │
│ Mecenas drukuje raport                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 2. SKANOWANIE QR (PRZED ROZPRAWĄ)                       │
├─────────────────────────────────────────────────────────┤
│ Mecenas → Otwiera telefon → Skanuje QR                 │
│ ↓                                                       │
│ Otwiera: report-view?token=abc123xyz                   │
│ ↓                                                       │
│ Formularz hasła                                        │
│ ↓                                                       │
│ Wpisuje: Promeritum21                                  │
│ ↓                                                       │
│ System waliduje token + hasło                          │
│ ↓                                                       │
│ Wyświetla PEŁNE dane:                                  │
│  ✅ Nazwiska świadków                                  │
│  ✅ Telefony                                           │
│  ✅ Opisy dowodów                                      │
│  ✅ AI Wskazówki                                       │
│ ↓                                                       │
│ Mecenas jest przygotowany! 🎯                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 3. WYSZUKIWANIE RAPORTÓW                                │
├─────────────────────────────────────────────────────────┤
│ Mecenas → Wyszukiwarka → Wpisuje: RAP/CYW...          │
│ ↓                                                       │
│ System szuka w bazie                                   │
│ ↓                                                       │
│ Wyświetla listę:                                       │
│  - Kod raportu                                         │
│  - Data generowania                                    │
│  - Liczba wyświetleń                                   │
│  - Dni do wygaśnięcia                                  │
│  - [Pokaż QR] [Kopiuj link]                           │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 STRUKTURA PLIKÓW

```
backend/
├── database/
│   └── init.js                    ✅ Tabela event_reports
├── routes/
│   └── reports.js                 ✅ API raportów
└── server.js                      ✅ Router /api/reports

frontend/
├── scripts/
│   ├── event-report-generator.js  ✅ Generator (v12)
│   └── reports-search.js          ✅ Wyszukiwarka (v1)
├── report-view.html               ✅ Strona mobilna
└── index.html                     ✅ Importy
```

---

## 🧪 TESTOWANIE

### **1. Restart backendu:**
```bash
cd backend
npm start
```

**Sprawdź logi:**
```
✅ Tabela event_reports utworzona
✅ reports.js router loaded
```

---

### **2. Test generowania:**
```
1. Ctrl + Shift + F5 (wymuś odświeżenie)
2. Otwórz wydarzenie w CRM
3. Klik "📋 Generuj szczegółowy raport"
4. Poczekaj 2-3 sekundy
5. Raport się otworzy z QR!
```

**Sprawdź w konsoli:**
```
✅ Raport wygenerowany: RAP/CYW/JK/001/001
📱 QR Code URL: https://api.qrserver.com/...
🔗 Report URL: http://localhost:3500/report-view?token=...
🤖 AI Rekomendacje wygenerowane
```

---

### **3. Test QR (lokalnie):**
```
1. W konsoli skopiuj "Report URL"
2. Otwórz w nowej karcie
3. Wpisz hasło: Promeritum21
4. Zobacz pełne dane!
```

---

### **4. Test wyszukiwarki:**
```javascript
// W konsoli przeglądarki:
window.reportsSearchModule.renderSearchSection();
```

Następnie w wyszukiwarce wpisz: `RAP`

---

## 🚀 DEPLOY NA PRODUKCJĘ

### **1. Zmienne środowiskowe:**
```bash
# .env
DB_PATH=/var/lib/promeritum/kancelaria.db
NODE_ENV=production
PORT=3500
```

---

### **2. HTTPS (wymagane dla QR!):**
```nginx
server {
    listen 443 ssl;
    server_name twoja-domena.pl;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3500;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### **3. Backup bazy:**
```bash
# Cron: codziennie o 2:00
0 2 * * * sqlite3 /var/lib/promeritum/kancelaria.db ".backup /backup/kancelaria_$(date +\%Y\%m\%d).db"
```

---

## 📊 STATYSTYKI

### **Kwerendy SQL:**

#### Najpopularniejsze raporty:
```sql
SELECT report_code, view_count 
FROM event_reports 
ORDER BY view_count DESC 
LIMIT 10;
```

#### Raporty wygasające w ciągu 7 dni:
```sql
SELECT report_code, expires_at 
FROM event_reports 
WHERE datetime(expires_at) BETWEEN datetime('now') AND datetime('now', '+7 days')
ORDER BY expires_at;
```

#### Raporty nieużywane (0 wyświetleń):
```sql
SELECT report_code, generated_at 
FROM event_reports 
WHERE view_count = 0 
AND datetime(generated_at) < datetime('now', '-7 days');
```

---

## 🔧 ROZSZERZENIA PRZYSZŁE

### **1. Email z QR:**
Automatyczne wysłanie QR na email mecenasa

### **2. Multi-QR:**
Jeden raport, wiele kodów QR (dla zespołu)

### **3. Eksport PDF:**
Bezpośredni download PDF z kodem QR

### **4. Push Notifications:**
Przypomnienie dzień przed rozprawą

### **5. Analytics:**
Dashboard z statystykami użycia raportów

---

## ✅ ZALETY SYSTEMU

1. **Bezpieczeństwo** - Hasło + token + wygasanie
2. **Anonimowość** - Wydruk zawiera tylko kody
3. **Wygoda** - Scan & Go przed rozprawą
4. **AI Wskazówki** - Inteligentne rekomendacje
5. **Audyt** - Licznik wyświetleń
6. **Archiwum** - Wyszukiwarka raportów
7. **Mobile-first** - Responsywny design
8. **Offline-ready** - Wydruk działa zawsze

---

## 📞 WSPARCIE

**Dokumentacja:** Ten plik  
**Backend API:** `backend/routes/reports.js`  
**Frontend:** `frontend/scripts/event-report-generator.js`  
**Strona mobilna:** `frontend/report-view.html`

---

**Status:** ✅ **SYSTEM GOTOWY DO UŻYCIA**

**Data implementacji:** 08.11.2025  
**Wersja:** 1.0  
**Autor:** Windsurf AI + User
