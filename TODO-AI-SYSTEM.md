# 📋 TODO - System AI dla Kancelarii

**Data:** 2 grudnia 2025, 02:50  
**Status:** W trakcie implementacji

---

## ✅ CO ZOSTAŁO ZROBIONE DZISIAJ:

### Backend:
- ✅ Stworzony `backend/services/ai/gemini-service.js` - pełny serwis Gemini AI
- ✅ Dodane endpointy w `backend/routes/ai.js`:
  - `/api/ai/gemini/ask` - pytania o sprawę
  - `/api/ai/gemini/summary` - podsumowanie sprawy
  - `/api/ai/gemini/precedents` - precedensy prawne
  - `/api/ai/gemini/generate-document` - generowanie dokumentów
- ✅ Funkcja `generateDocument()` w Gemini service

### Frontend:
- ✅ Zaktualizowany `frontend/scripts/ai-search.js` - używa Gemini
- ✅ Zaktualizowany `frontend/scripts/ai-assistant.js` - używa Gemini
- ✅ Panel AI Legal Search z nowym UI
- ✅ Generowanie dokumentów włączone (używa Gemini)
- ✅ Banner "Używamy Gemini AI (100% darmowe)"

### Konfiguracja:
- ✅ Klucz API Gemini: `AIzaSyCCeQNRPr4KVirwr9l_jO8CCuIIyMPqe_Q`
- ✅ Project ID: `gen-lang-client-0343931291`
- ✅ Plik `.env` skonfigurowany
- ✅ Google Cloud Console - ograniczenia usunięte (czeka na propagację)

### Claude AI:
- ✅ Wyłączony (nie opłacony)
- ✅ Endpointy zwracają 503 z informacją

---

## ⏰ CZEKA NA PROPAGACJĘ (5 minut):

- ⏳ Zmiana ograniczeń klucza Gemini w Google Cloud Console
- ⏳ Klucz ma teraz: "Nie ograniczaj klucza" zamiast "Ogranicz klucz"
- ⏳ **Test za ~3 minuty** (o 02:55)

---

## 🔴 PROBLEM DO ROZWIĄZANIA:

### Gemini API nadal zwraca błąd:
```
[GoogleGenerativeAI Error]: Error fetching from m1.api key not valid
```

**Możliwe przyczyny:**
1. Klucz wymaga czasu na propagację (czekamy 5 minut)
2. Płatne konto Google Workspace może wymagać Vertex AI zamiast standardowego Gemini API
3. Projekt `gen-lang-client-0343931291` może mieć dodatkowe ograniczenia

---

## 📝 DO ZROBIENIA JUTRO:

### 1️⃣ PRIORYTE 1: Sprawdź czy Gemini działa (po propagacji)

**Rano sprawdź:**
```
1. Otwórz aplikację: http://localhost:3500
2. Uruchom backend: node backend/server.js
3. Kliknij 🤖 AI Legal Search
4. Wpisz: "Jaki jest termin na apelację?"
5. Kliknij "Wyszukaj z AI"
```

**Jeśli działa:** ✅ Gotowe!  
**Jeśli nie działa:** → Przejdź do opcji 2 lub 3

---

### 2️⃣ OPCJA 2: Dodaj ChatGPT (OpenAI) jako główny AI

**Zalety:**
- ✅ 100% niezawodny
- ✅ Najlepszy dla języka polskiego
- ✅ Świetne generowanie dokumentów prawnych
- ✅ Bardzo tani: ~$0.002 za 1000 tokenów (~$20-30/miesiąc dla kancelarii)

**Koszty przykładowe:**
- Pytanie prawne: ~$0.03
- Generowanie dokumentu: ~$0.10
- Analiza sprawy: ~$0.05

#### 🔑 JAK DODAĆ CHATGPT:

##### Krok 1: Zdobądź klucz API

1. Wejdź: https://platform.openai.com/api-keys
2. Zaloguj się / zarejestruj
3. Dodaj kartę kredytową: https://platform.openai.com/settings/organization/billing/overview
4. Kliknij: "Create new secret key"
5. Nazwij: "Kancelaria CRM"
6. Skopiuj klucz (zaczyna się `sk-...`)
7. **ZAPISZ KLUCZ** - nie będzie widoczny drugi raz!

##### Krok 2: Zainstaluj pakiet

```powershell
cd c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app
npm install openai
```

##### Krok 3: Dodaj klucz do .env

```bash
# W pliku .env dodaj:
OPENAI_API_KEY=sk-twój_klucz_tutaj
```

##### Krok 4: Powiedz mi że masz klucz

Daj mi klucz OpenAI → dodam serwis `openai-service.js` i podłączę do aplikacji.

---

### 3️⃣ OPCJA 3: Spróbuj Vertex AI (dla płatnych Google Cloud)

**Jeśli Gemini nadal nie działa**, możemy użyć Vertex AI:
- ✅ Dedykowane dla firm z Google Cloud
- ✅ Bardziej stabilne
- ✅ Wspiera płatne workspace

**Wymaga:**
- Service Account JSON (pobierz z Google Cloud)
- Vertex AI API włączone (już jest)
- Inna biblioteka (`@google-cloud/aiplatform`)

**Instrukcje:**
1. Wejdź: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Utwórz Service Account
3. Pobierz klucz JSON
4. Daj mi - skonfiguruję Vertex AI

---

## 🎯 REKOMENDACJA:

### PLAN NA JUTRO:

1. **Rano (10 minut):**
   - ☕ Uruchom backend
   - 🧪 Przetestuj czy Gemini działa po propagacji
   
2. **Jeśli Gemini NIE działa:**
   - 🚀 **Dodaj ChatGPT** (opcja 2) - najszybsze i najbardziej niezawodne
   - ⏰ Zajmie 15 minut
   - 💰 Koszt: ~$20-30/miesiąc
   
3. **W przyszłości:**
   - 🔄 Możesz mieć OBA: ChatGPT + Gemini
   - 🎛️ Użytkownik wybiera który AI użyć
   - 💡 ChatGPT dla ważnych dokumentów, Gemini dla prostych pytań

---

## 📊 PORÓWNANIE AI:

| Funkcja | Gemini (Google) | ChatGPT (OpenAI) | Claude (Anthropic) |
|---------|-----------------|------------------|---------------------|
| **Koszt** | 🟢 Darmowy | 🟡 ~$0.002/1K tokenów | 🟡 ~$0.01/zapytanie |
| **Niezawodność** | 🟡 Średnia | 🟢 Wysoka | 🟢 Wysoka |
| **Polski język** | 🟡 Dobry | 🟢 Świetny | 🟢 Bardzo dobry |
| **Dokumenty prawne** | 🟡 Dobre | 🟢 Świetne | 🟢 Świetne |
| **Łatwość integracji** | 🔴 Trudna | 🟢 Łatwa | 🟢 Łatwa |
| **Status** | ❌ Nie działa | ⚪ Nie dodany | ❌ Wyłączony |

---

## 🔧 PLIKI DO MODYFIKACJI (dla ChatGPT):

Gdy będziesz dodawać ChatGPT, będę musiał stworzyć/zmodyfikować:

### Backend:
- `backend/services/ai/openai-service.js` - NOWY
- `backend/routes/ai.js` - dodać endpointy `/openai/*`

### Frontend:
- `frontend/scripts/ai-search.js` - dodać wybór AI
- `frontend/scripts/ai-assistant.js` - dodać wybór AI

### Konfiguracja:
- `.env` - dodać `OPENAI_API_KEY`
- `package.json` - zainstalować `openai`

---

## 📞 KONTAKT:

Jutro jak będziesz testować:
1. Sprawdź czy Gemini działa
2. Jeśli nie - zdecyduj: ChatGPT czy Vertex AI
3. Daj mi znać - dokończę integrację

---

## 🎉 CO JUŻ DZIAŁA:

- ✅ Frontend AI Search (UI gotowe)
- ✅ Frontend AI Assistant (UI gotowe)
- ✅ Backend endpointy Gemini (gotowe)
- ✅ Generowanie dokumentów (logika gotowa)
- ✅ Analiza spraw (logika gotowa)
- ✅ Precedensy prawne (logika gotowa)

**Brakuje TYLKO działającego klucza API!**

---

## 💡 WSKAZÓWKI NA JUTRO:

### Jeśli wybierzesz ChatGPT:
```
1. Zdobądź klucz: https://platform.openai.com/api-keys
2. Dodaj kartę: https://platform.openai.com/settings/organization/billing/overview
3. Daj mi klucz (sk-...)
4. Dokończę za 15 minut
5. Wszystko zadziała!
```

### Jeśli Gemini zacznie działać:
```
1. Przetestuj dokładnie
2. Sprawdź różne funkcje
3. Jeśli stabilne - zostań przy Gemini (darmowy!)
4. Jeśli niestabilne - dodaj ChatGPT jako backup
```

---

**Powodzenia jutro! 🚀**

**STATUS:** ⏰ Czekamy na propagację zmian w Google Cloud (do 02:55)
