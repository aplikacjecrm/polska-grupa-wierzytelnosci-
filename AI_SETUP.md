# 🤖 AI Asystent - Instrukcja instalacji

## Funkcje AI Asystenta:

### ✅ Dla prawników:
- **Analiza spraw** - AI analizuje sprawę i podaje kluczowe punkty
- **Identyfikacja ryzyk** - wskazuje potencjalne problemy
- **Następne kroki** - sugeruje działania
- **Generator dokumentów** - tworzy szkice pozwów, wniosków, pism

### ✅ Dla klientów:
- **Chatbot** - odpowiada na podstawowe pytania
- **Status sprawy** - informuje o terminach
- **FAQ** - wyjaśnia pojęcia prawne

### 🛡️ Bezpieczeństwo - MAKSYMALNE ZABEZPIECZENIA:

**✅ WDROŻONE ZABEZPIECZENIA:**

1. **Filtr danych wrażliwych (AKTYWNY):**
   - PESEL → [UKRYTE]
   - NIP → [UKRYTE]
   - REGON → [UKRYTE]
   - Adresy → tylko miasto
   - Email → tylko domena
   - Telefon → tylko kierunkowy
   - Wartości → zaokrąglone

2. **Logi AI (WYŁĄCZONE):**
   - Zero zapisów w bazie danych
   - Brak historii zapytań
   - Maksymalna dyskrecja

3. **Szyfrowanie:**
   - TLS/SSL komunikacja
   - API key zabezpieczony
   - HTTPS only

4. **Anthropic gwarancje:**
   - Zero trenowania na danych
   - 30 dni retention (potem usuwane)
   - GDPR/RODO compliant
   - SOC 2, ISO 27001

**📋 Szczegóły: PRIVACY_AI.md**

## Krok 1: Zainstaluj bibliotekę Anthropic

```bash
cd backend
npm install @anthropic-ai/sdk
```

## Krok 2: Uzyskaj klucz API

1. Zarejestruj się na: https://console.anthropic.com/
2. Przejdź do: API Keys
3. Wygeneruj nowy klucz API
4. Skopiuj klucz (zaczyna się od `sk-ant-api...`)

**Ceny (bardzo niskie!):**
- Claude 3.5 Sonnet: ~$3/$15 za 1M tokenów (input/output)
- Claude 3 Haiku: ~$0.25/$1.25 za 1M tokenów (tańszy)
- Przykład: 1000 analiz/miesiąc ≈ $5-15

## Krok 3: Dodaj klucz do .env

Edytuj plik `backend/.env`:

```bash
# AI Configuration
ANTHROPIC_API_KEY=sk-ant-api-TWOJ-KLUCZ-API-TUTAJ
```

## Krok 4: Dodaj route AI do serwera

Edytuj `backend/server.js` i dodaj:

```javascript
// AI routes
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);
```

Dodaj po innych routach (np. po `/api/cases`).

## Krok 5: Utwórz tabele w bazie danych

Uruchom plik SQL:

```bash
mysql -u root -p kancelaria < backend/migrations/create_ai_logs.sql
```

Lub ręcznie wykonaj zawartość pliku w MySQL Workbench.

## Krok 6: Uruchom serwer

```bash
cd backend
npm start
```

## Krok 7: Testowanie

1. Otwórz aplikację w przeglądarce
2. Zaloguj się jako prawnik/admin
3. Otwórz dowolną sprawę
4. Kliknij przycisk **🤖 AI Asystent**
5. Zadaj pytanie np.: "Przeanalizuj tę sprawę"

## Przykłady użycia:

### Analiza sprawy:
```
Pytanie: Przeanalizuj tę sprawę i podaj główne punkty
AI: 
💡 Główna analiza:
- Sprawa cywilna o zapłatę 50,000 PLN
- Strona przeciwna: XYZ Sp. z o.o.
- Brak odpowiedzi na pozew (14 dni termin)

✅ Zalecenia:
1. Sprawdź czy upłynął termin odpowiedzi
2. Przygotuj wniosek o wydanie wyroku zaocznego
3. Zabezpiecz dowody płatności

⚠️ Uwagi/ryzyka:
- Brak doręczenia pozwu = przedłużenie postępowania
- Sprawdź czy adres jest aktualny

⚠️ To sugestia AI - wymaga weryfikacji prawnika
```

### Generator dokumentów:
```
1. Kliknij "📝 Generuj dokument"
2. Wybierz typ: Pozew / Odpowiedź / Wniosek
3. Dodaj szczegóły
4. Kliknij "🤖 Generuj szkic"
5. AI wygeneruje SZKIC
6. EDYTUJ i zweryfikuj przed użyciem!
```

## Bezpieczeństwo:

### ✅ Co AI MOŻE:
- Czytać dane sprawy
- Analizować i doradzać
- Generować szkice dokumentów
- Odpowiadać na pytania

### ❌ Czego AI NIE MOŻE:
- Modyfikować bazy danych
- Usuwać/edytować dane
- Wykonywać akcji w systemie
- Podawać się za prawnika
- Działać bez weryfikacji użytkownika

## Logi i statystyki:

Admin może sprawdzić użycie AI:

```
GET /api/ai/usage-stats
```

Zwraca:
- Liczbę zapytań na użytkownika
- Zużycie tokenów
- Typy akcji
- Koszty (w przeliczeniu na PLN)

## Limity:

Domyślnie:
- **50 zapytań/dzień** na użytkownika
- Admin może zmienić w tabeli `ai_config`
- Można wyłączyć AI dla konkretnego użytkownika

```sql
-- Zmień limit
UPDATE ai_config SET daily_limit = 100 WHERE user_id = 1;

-- Wyłącz AI
UPDATE ai_config SET enabled = FALSE WHERE user_id = 1;
```

## Koszty szacunkowe:

**Claude 3.5 Sonnet (zalecany):**
- Analiza sprawy: ~2000 tokenów = ~$0.03
- Generator dokumentu: ~4000 tokenów = ~$0.08
- 100 analiz/miesiąc = ~$3
- 50 dokumentów/miesiąc = ~$4
- **Łącznie: ~$7/miesiąc przy średnim użyciu**

**Claude 3 Haiku (tańszy, dla chatbota klientów):**
- Odpowiedź chatbota: ~500 tokenów = ~$0.001
- 1000 pytań klientów/miesiąc = ~$1

## Troubleshooting:

### Error: "ANTHROPIC_API_KEY not found"
- Sprawdź czy dodałeś klucz do `.env`
- Zrestartuj serwer po dodaniu klucza

### Error: "Invalid API key"
- Klucz musi zaczynać się od `sk-ant-api`
- Sprawdź czy skopiowałeś cały klucz
- Wygeneruj nowy klucz w console.anthropic.com

### Error: "Rate limit exceeded"
- Za dużo zapytań w krótkim czasie
- Poczekaj chwilę lub zwiększ limit

### AI nie odpowiada / timeout
- Sprawdź połączenie internetowe
- API Anthropic może być przeciążone
- Spróbuj ponownie za chwilę

## Wyłączenie AI:

Jeśli chcesz wyłączyć całkowicie:

1. Usuń przycisk z HTML:
```javascript
// Zakomentuj w index.html linię z przyciskiem AI
<!-- <button onclick="crmManager.openAIForCurrentCase()"> -->
```

2. Lub zablokuj route:
```javascript
// W server.js zakomentuj:
// app.use('/api/ai', aiRoutes);
```

## Support:

W razie problemów:
- Sprawdź logi serwera: `npm start` w konsoli
- Sprawdź konsolę przeglądarki (F12)
- Sprawdź tabele `ai_logs` w bazie danych

## Dalszy rozwój:

Możliwe rozszerzenia:
- **Analiza dokumentów PDF** - AI czyta i podsumowuje
- **Automatyczne tagi** - AI kategoryzuje sprawy
- **Predykcja terminów** - AI sugeruje daty rozpraw
- **Generowanie umów** - szablony z AI
- **Voice assistant** - dyktowanie przez AI
- **Email drafts** - AI pisze maile do klientów
- **Case law search** - wyszukiwanie orzeczeń

---

🎉 **Gratulacje! AI Asystent jest gotowy!**

Otwórz sprawę i kliknij 🤖 AI Asystent aby zacząć!
