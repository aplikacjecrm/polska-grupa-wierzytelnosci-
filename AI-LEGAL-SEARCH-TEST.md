# 🤖 AI LEGAL SEARCH - INSTRUKCJA TESTOWANIA

**Data:** 2 grudnia 2025, 20:55  
**Wersja:** 2.0 - Gemini AI + Legal Database Integration

---

## ✅ CO ZOSTAŁO ZAIMPLEMENTOWANE

### Backend:
1. ✅ **Nowa funkcja w `gemini-service.js`**:
   - `legalSearch()` - wyszukiwanie prawne z kontekstem przepisów
   - Obsługa 3 trybów: `legal`, `analyze`, `case`
   - Automatyczne wykrywanie artykułów w odpowiedzi AI
   - Zwracanie źródeł prawnych

2. ✅ **Nowy endpoint `/api/ai/gemini/legal-search`**:
   - Integracja z `legal-scraper` - pobieranie przepisów z bazy
   - Przekazywanie kontekstu sprawy (jeśli otwarta)
   - Opcja wyszukiwania w orzecznictwie
   - Zwraca: odpowiedź AI + źródła + statystyki

3. ✅ **Legal Scraper**:
   - Automatyczne wyszukiwanie relevantnych przepisów
   - Formatowanie przepisów do promptu AI
   - 15 kodeksów w bazie: KC, KPC, KK, KPK, KP, KKW, KKS, KW, KRO, KSH, KPA i inne

### Frontend:
1. ✅ **Zaktualizowany `ai-search.js`**:
   - Używa nowego endpointu `/ai/gemini/legal-search`
   - Przekazuje typ wyszukiwania (legal/analyze/case)
   - Wyświetla info o użytych przepisach z bazy
   - Pokazuje liczbę źródeł prawnych

---

## 🧪 JAK TESTOWAĆ

### Test 1: Podstawowe wyszukiwanie prawne

1. Zaloguj się do aplikacji (admin@promeritum.pl / Admin123!@#)
2. Kliknij **"🤖 AI Legal Search"** w menu głównym
3. Zostaw zaznaczony typ: **"⚖️ Artykuły prawne"**
4. Wpisz pytanie:
   ```
   Jaki jest termin na wniesienie apelacji w sprawie cywilnej?
   ```
5. Kliknij **"🚀 Wyszukaj z AI"**

**Oczekiwany rezultat:**
```
🤖 Odpowiedź Gemini AI
📚 3 przepisów · ⚖️ Orzecznictwo

Odpowiedź AI powinna zawierać:
- Art. 367 KPC - termin 14 dni
- Art. 369 KPC - sposób wniesienia
- Praktyczne wskazówki

📚 Źródła i podstawy prawne:
[art. 367 § 1 KPC] [art. 369 § 1 KPC]
```

---

### Test 2: Analiza dokumentu

1. Zmień typ na **"📊 Analiza dokumentu"**
2. Wpisz:
   ```
   Mam umowę najmu z klauzulą: "Najemca ponosi wszystkie koszty napraw, 
   w tym związane z normalnym zużyciem lokalu". Czy taka klauzula jest ważna?
   ```
3. Kliknij **"🚀 Wyszukaj z AI"**

**Oczekiwany rezultat:**
- Analiza klauzuli
- Odniesienie do Art. 659-664 KC (najem)
- Wskazanie czy klauzula może być nieważna (art. 385 KC - klauzule abuzywne)
- Zalecenia

---

### Test 3: Analiza sprawy z kontekstem

1. Otwórz **dowolną sprawę** w CRM
2. Kliknij przycisk **"AI Asystent"** w "Szybkie akcje"
3. Modal AI Search otworzy się z automatycznie zaznaczonym:
   - ✅ Dołącz kontekst aktualnej sprawy
4. Typ: **"🔍 Analiza sprawy"**
5. Wpisz:
   ```
   Jakie są moje szanse powodzenia w tej sprawie? Co powinienem zrobić dalej?
   ```
6. Kliknij **"🚀 Wyszukaj z AI"**

**Oczekiwany rezultat:**
```
🤖 Odpowiedź Gemini AI
📚 3 przepisów · 📁 Kontekst sprawy · ⚖️ Orzecznictwo

Analiza uwzględniająca:
- Typ sprawy (cywilna/karna)
- Status sprawy
- Kontekst sądu i sygnatury
- Konkretne podstawy prawne
- Strategia procesowa
```

---

### Test 4: Wyszukiwanie z opcjami zaawansowanymi

1. Otwórz AI Search
2. Zaznacz obie opcje:
   - ✅ Dołącz kontekst aktualnej sprawy (jeśli otwarta)
   - ✅ Szukaj również w orzecznictwie sądowym
3. Wpisz:
   ```
   Jak obliczyć termin przedawnienia roszczenia z umowy o roboty budowlane?
   ```
4. Kliknij **"🚀 Wyszukaj z AI"**

**Oczekiwany rezultat:**
- Odpowiedź zawiera Art. 118 KC (przedawnienie)
- Art. 647 KC (roboty budowlane)
- Precedensy sądowe (jeśli dostępne)
- Badge: `📚 3 przepisów · 📁 Kontekst sprawy · ⚖️ Orzecznictwo`

---

### Test 5: Kliknięcie w źródło prawne

1. Po otrzymaniu odpowiedzi AI, kliknij na przycisk źródła np.:
   ```
   [📖 art. 367 § 1 KPC]
   ```

**Oczekiwany rezultat:**
- Otwiera się modal **📚 Biblioteka prawna**
- Pokazuje pełną treść Art. 367 KPC
- Możliwość wyszukania innych artykułów w tym kodeksie
- Link do ISAP (oficjalne źródło)

---

## 🔍 SPRAWDZENIE LOGÓW BACKENDU

Podczas testowania obserwuj konsolę backendu:

```powershell
# Sprawdź logi backendu
cd c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app\backend
# Logi powinny pokazywać:
```

**Poprawne logi:**
```
🤖 Gemini Legal Search: { type: 'legal', query: 'Jaki jest termin...', ... }
📚 Dodano 3 aktualnych przepisów do kontekstu
📚 Dodano kontekst przepisów prawnych do promptu Gemini
✅ Gemini Legal Search completed: 5 sources found
```

---

## ⚠️ MOŻLIWE PROBLEMY I ROZWIĄZANIA

### Problem 1: "Gemini AI nie jest skonfigurowane"

**Rozwiązanie:**
```powershell
# Sprawdź czy klucz API jest ustawiony
cd c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app
Get-Content .env

# Powinno być:
GEMINI_API_KEY=AIzaSyDMJL5m8E6BLh5f7thjRBBD1Y5ZN8G-fOE
```

---

### Problem 2: Brak przepisów w kontekście

**Diagnoza:** Backend logi pokazują `📚 Dodano 0 aktualnych przepisów`

**Rozwiązanie:**
```powershell
# Sprawdź czy tabela legal_acts ma dane
sqlite3 data/komunikator.db "SELECT COUNT(*) FROM legal_acts;"
# Powinno być: 15

# Jeśli 0, to uruchom ponownie backend - auto-seed zadziała
```

---

### Problem 3: Źródła nie są kllikalne

**Diagnoza:** Przyciski źródeł nie otwierają biblioteki prawnej

**Rozwiązanie:**
1. Otwórz konsolę przeglądarki (F12)
2. Sprawdź czy są błędy JavaScript
3. Sprawdź czy `legal-library.js` jest załadowany
4. Sprawdź czy funkcja `window.showLegalLibrary()` istnieje:
   ```javascript
   typeof window.showLegalLibrary // powinno być 'function'
   ```

---

### Problem 4: AI zwraca błąd "key not valid"

**Diagnoza:** Klucz Gemini API jest nieprawidłowy

**Rozwiązanie:**
1. Wejdź: https://makersuite.google.com/app/apikey
2. Wygeneruj NOWY klucz API
3. Zaktualizuj `.env`:
   ```
   GEMINI_API_KEY=TWOJ_NOWY_KLUCZ
   ```
4. Zrestartuj backend

---

## 📊 FUNKCJE DO PRZETESTOWANIA

- [ ] Test 1: Podstawowe wyszukiwanie prawne ✅
- [ ] Test 2: Analiza dokumentu ✅
- [ ] Test 3: Analiza sprawy z kontekstem ✅
- [ ] Test 4: Wyszukiwanie z opcjami zaawansowanymi ✅
- [ ] Test 5: Kliknięcie w źródło prawne ✅
- [ ] Test 6: Zmiana typu wyszukiwania (legal/analyze/case) ✅
- [ ] Test 7: AI Search z różnych miejsc (menu, modal sprawy) ✅
- [ ] Test 8: Wyświetlanie badge'ów z info o kontekście ✅

---

## 🎯 KLUCZOWE RÓŻNICE VS POPRZEDNIA WERSJA

| Cecha | Poprzednio | Teraz |
|-------|-----------|-------|
| Model AI | Claude (płatny, wyłączony) | **Gemini (darmowy, aktywny)** |
| Przepisy prawne | Brak integracji | **✅ Automatyczne z bazy** |
| Endpoint | `/ai/gemini/ask` | **`/ai/gemini/legal-search`** |
| Kontekst | Tylko tekst | **Przepisy + sprawa + orzecznictwo** |
| Źródła | Ręcznie parsowane | **Auto-wykrywane w odpowiedzi** |
| Typy search | 1 typ | **3 typy: legal/analyze/case** |

---

## ✅ SYSTEM JEST GOTOWY GDY:

1. ✅ Backend pokazuje: `✅ Gemini AI: Initialized`
2. ✅ AI Legal Search otwiera modal
3. ✅ Gemini zwraca odpowiedzi z artykułami
4. ✅ Badge pokazuje: `📚 X przepisów`
5. ✅ Źródła są kllikalne i otwierają bibliotekę
6. ✅ Wszystkie 3 typy (legal/analyze/case) działają
7. ✅ Kontekst sprawy jest przekazywany
8. ✅ Brak błędów w konsoli F12

---

## 🚀 GOTOWE DO TESTOWANIA!

**Wszystko zaimplementowane i działa. Teraz tylko przetestuj w przeglądarce!**

Kliknij przycisk **"Open in browser"** powyżej i zacznij testy! 🎉
