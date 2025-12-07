# 📚 AUTOMATYCZNA AKTUALIZACJA PRZEPISÓW PRAWNYCH

## ✅ CO DODALIŚMY:

### 1. **Legal Scraper** - moduł pobierania przepisów
- Pobiera z ISAP (Sejm)
- Fallback na Dziennik Ustaw
- Zapisuje do bazy `legal_acts`
- Automatyczna aktualizacja codziennie o 3:00

### 2. **RAG (Retrieval Augmented Generation)**
- Wyszukuje relevantne przepisy dla zapytania
- Dodaje do promptu AI
- AI odpowiada z AKTUALNYMI przepisami!

---

## 🔧 INSTALACJA WYMAGANYCH PAKIETÓW:

```bash
cd backend
npm install axios cheerio
```

**Pakiety:**
- `axios` - HTTP requests do API
- `cheerio` - HTML parsing (web scraping)

---

## 🚀 JAK TO DZIAŁA:

### 1. **Automatyczne pobieranie:**
```
Co 24h o 3:00 → Pobiera akty z ostatnich 7 dni → Zapisuje do bazy
```

### 2. **Podczas wyszukiwania AI:**
```
Pytanie użytkownika
    ↓
Wyszukaj w bazie legal_acts (keywords matching)
    ↓
Dodaj 3 najrelevantniejsze przepisy do promptu
    ↓
AI analizuje z AKTUALNYMI przepisami!
```

---

## 📊 ŹRÓDŁA DANYCH:

### 1️⃣ ISAP (Sejm) - GŁÓWNE
```
https://isap.sejm.gov.pl/api
```
- ✅ Oficjalne API
- ✅ Darmowe
- ✅ Aktualne ustawy

### 2️⃣ Dziennik Ustaw - FALLBACK
```
https://dziennikustaw.gov.pl/
```
- ✅ Scraping HTML
- ✅ Backup gdy ISAP nie działa

---

## 🧪 TESTOWANIE:

### 1. Ręczne uruchomienie aktualizacji:
```javascript
// W konsoli Node.js
const legalScraper = require('./utils/legal-scraper');
await legalScraper.autoUpdate();
```

### 2. Sprawdź bazę:
```sql
SELECT * FROM legal_acts ORDER BY date DESC LIMIT 10;
```

### 3. Test w AI Search:
1. Zadaj pytanie: "Jakie zmiany w kodeksie pracy?"
2. AI użyje aktualnych przepisów z bazy!

---

## 📈 PRZYKŁAD ODPOWIEDZI:

### ❌ PRZED (tylko wiedza modelu):
```
Według Kodeksu Pracy art. 15...
(dane z marca 2024)
```

### ✅ PO (z aktualnymi przepisami):
```
📚 AKTUALNE PRZEPISY PRAWNE:

- Ustawa o zmianie ustawy - Kodeks pracy (2024-11-01)
  Art. 15a - nowe przepisy o pracy zdalnej...
  Źródło: https://dziennikustaw.gov.pl/...

Zgodnie z najnowszą zmianą z 1 listopada 2024...
```

---

## ⚙️ KONFIGURACJA:

### Zmień częstotliwość aktualizacji:
```javascript
// W legal-scraper.js
setInterval(() => {
    const now = new Date();
    if (now.getHours() === 3 && now.getMinutes() === 0) {
        legalScraper.autoUpdate();
    }
}, 60000); // Co minutę sprawdza czy 3:00
```

### Zmień zakres pobierania:
```javascript
await this.fetchRecentLegalActs(7); // Ostatnie 7 dni
// Zmień na 30 dla ostatniego miesiąca
```

---

## 🔍 WYSZUKIWANIE:

System ekstrahuje słowa kluczowe z pytania:
```javascript
"Jakie są przepisy o urlopie?"
    ↓
Keywords: ["przepisy", "urlopie"]
    ↓
SELECT * FROM legal_acts 
WHERE title LIKE '%przepisy%urlopie%'
OR content LIKE '%przepisy%urlopie%'
```

---

## 🚨 UWAGA:

1. **Pierwsza aktualizacja**: Uruchomi się 5s po starcie serwera
2. **Regularnie**: Codziennie o 3:00
3. **Ręcznie**: Możesz wywołać `legalScraper.autoUpdate()`

---

## 💾 BAZA DANYCH:

Tabela `legal_acts`:
```sql
CREATE TABLE legal_acts (
  id INTEGER PRIMARY KEY,
  title TEXT,        -- Tytuł aktu
  date TEXT,         -- Data publikacji
  url TEXT,          -- Link do pełnego tekstu
  content TEXT,      -- Treść/streszczenie
  source TEXT,       -- 'isap' lub 'dziennikustaw'
  created_at DATETIME,
  updated_at DATETIME
);
```

---

## ✅ GOTOWE!

System automatycznie:
1. ✅ Pobiera nowe akty prawne
2. ✅ Zapisuje do bazy
3. ✅ Wyszukuje relevantne dla pytań
4. ✅ Dodaje do AI jako kontekst
5. ✅ AI odpowiada z AKTUALNYMI przepisami!

---

**Backend automatycznie pobierze przepisy przy następnym restarcie!**
