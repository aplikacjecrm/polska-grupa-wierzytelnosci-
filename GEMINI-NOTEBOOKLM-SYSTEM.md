# 🤖 GEMINI AI SYSTEM - NotebookLM dla Kancelarii

**Data:** 2 grudnia 2025, 01:45  
**Status:** ✅ GOTOWE - Pełny system oparty TYLKO na Gemini AI

---

## 🎯 CO ZBUDOWAŁEM

Kompletny system AI Assistant oparty na **Google Gemini AI** (darmowy!), działający jak **NotebookLM** ale zintegrowany z CRM kancelarii.

---

## ✨ FUNKCJE

### 1. **Analiza Dokumentów** 📄
- Upload dokumentów sprawy
- Automatyczna analiza treści
- Wyciąganie kluczowych informacji
- Podsumowanie dokumentu

### 2. **Q&A o Sprawę** 💬
- Zadawaj pytania o sprawę w języku naturalnym
- AI odpowiada na podstawie kontekstu sprawy
- Podaje podstawę prawną (artykuły kodeksów)
- Kontekst: dane sprawy, dokumenty, orzecznictwo

### 3. **Generowanie Dokumentów** 📝
- Pozwy
- Wnioski
- Pisma procesowe
- Umowy
- Dokumenty niestandardowe

### 4. **Analiza Sprawy** 🔍
- Podsumowanie stanu sprawy
- Kluczowe daty i terminy
- Potencjalne ryzyka
- Zalecane następne kroki

### 5. **Precedensy Prawne** ⚖️
- Sugerowanie podobnych spraw
- Relewantne artykuły kodeksów
- Kierunki argumentacji
- Strategie prawne

---

## 📂 STRUKTURA PLIKÓW

### Backend:
```
backend/
├── services/ai/
│   └── gemini-service.js          ✅ Główny serwis Gemini AI
├── routes/
│   └── ai.js                       ✅ Endpointy API
```

### Frontend:
```
frontend/scripts/
├── ai-assistant.js                 ✅ Główny moduł AI w sprawie
├── ai-search.js                    ✅ AI Legal Search (wyszukiwanie prawne)
└── modules/
    └── ai-assistant-module.js      ✅ Panel AI w CRM
```

---

## 🔌 ENDPOINTY API

### Gemini AI Endpoints:

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/ai/gemini/ask` | POST | Zadaj pytanie o sprawę |
| `/api/ai/gemini/summary` | POST | Generuj podsumowanie sprawy |
| `/api/ai/gemini/precedents` | POST | Sugeruj precedensy prawne |
| `/api/ai/gemini/generate-document` | POST | Generuj dokument prawny |
| `/api/ai/status` | GET | Status konfiguracji AI |

---

## 🔧 KONFIGURACJA

### 1. Klucz API Gemini:

**Plik:** `.env`
```bash
GEMINI_API_KEY=AIzaSyDMJL5m8E6BLh5f7thjRBBD1Y5ZN8G-fOE
```

**Gdzie go zdobyć:**
- https://makersuite.google.com/app/apikey
- 100% DARMOWY!
- Bez karty kredytowej

### 2. Uruchomienie Backend:
```powershell
cd kancelaria/komunikator-app
node backend/server.js
```

Powinieneś zobaczyć:
```
✅ Gemini AI: Initialized
🔑 GEMINI_API_KEY loaded: YES ✅
```

---

## 🚀 JAK UŻYWAĆ

### Opcja 1: AI Assistant w Sprawie

1. Otwórz **dowolną sprawę** w CRM
2. Kliknij przycisk **"AI Asystent"** (⚖️ ikona)
3. Wybierz akcję:
   - 📊 **Przeanalizuj sprawę** - pełna analiza
   - ⚠️ **Zidentyfikuj ryzyka** - potencjalne problemy
   - 📋 **Następne kroki** - co zrobić dalej
   - 📝 **Generuj dokument** - stwórz pismo

### Opcja 2: AI Legal Search

1. Kliknij **🤖 AI Legal Search** w menu głównym
2. Wpisz pytanie prawne, np.:
   - "Jaki jest termin na apelację w sprawie cywilnej?"
   - "Jak napisać pozew o zapłatę?"
3. Opcjonalnie włącz:
   - ✅ **Kontekst sprawy** - jeśli pytasz o konkretną sprawę
   - 📚 **Orzecznictwo** - wyszukiwanie w precedensach

---

## 💡 PRZYKŁADY UŻYCIA

### Przykład 1: Analiza Sprawy
```
Użytkownik: "Przeanalizuj sprawę"

AI odpowiada:
📊 PODSUMOWANIE SPRAWY
Sprawa cywilna o zapłatę...

⚠️ POTENCJALNE RYZYKA:
- Upływający termin na odpowiedź: 15.12.2025
- Brak pełnej dokumentacji

📋 ZALECANE KROKI:
1. Przygotować odpowiedź na pozew (termin: 15.12.2025)
2. Zebrać dowody transakcji
```

### Przykład 2: Generowanie Dokumentu
```
Użytkownik: Kliknął "Generuj dokument" → "Pozew o zapłatę"

AI generuje:
==========================================
POZEW O ZAPŁATĘ

Do Sądu Rejonowego w [DO UZUPEŁNIENIA]

POWÓD:
[Dane z systemu CRM]

POZWANY:
[Dane z systemu CRM]

UZASADNIENIE FAKTYCZNE:
[Szczegóły sprawy z bazy danych]

UZASADNIENIE PRAWNE:
Zgodnie z art. 353 § 1 Kodeksu cywilnego...

PETITUM:
1. Zasądzenie od pozwanego kwoty...
==========================================
```

### Przykład 3: Pytanie o Prawo
```
Użytkownik: "Jaki jest termin na apelację?"

AI odpowiada:
Termin na wniesienie apelacji w sprawie cywilnej 
wynosi 14 dni od doręczenia wyroku z uzasadnieniem.

Podstawa prawna:
- Art. 369 § 1 KPC

Uwaga: W sprawach karnych termin wynosi 30 dni.
```

---

## 🔒 BEZPIECZEŃSTWO

### Automatyczna Anonimizacja:
- ✅ PESEL - maskowany
- ✅ NIP - maskowany
- ✅ Adresy - maskowane
- ✅ Numery kont - maskowane

### Prywatność:
- ❌ **Zero logowania** rozmów
- ✅ Dane wysyłane tylko do Google Gemini
- ✅ Szyfrowane połączenie (HTTPS)

---

## 📊 RÓŻNICE: Claude vs Gemini

| Funkcja | Claude (WYŁĄCZONY) | Gemini (AKTYWNY) |
|---------|-------------------|------------------|
| **Koszt** | 💵 Płatny (~$0.01/zapytanie) | ✅ 100% DARMOWY |
| **Generowanie dokumentów** | ✅ Tak | ✅ Tak |
| **Analiza sprawy** | ✅ Tak | ✅ Tak |
| **Q&A** | ✅ Tak | ✅ Tak |
| **Język polski** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Limit zapytań** | 💳 Wymaga karty | 🎁 60 zapytań/minutę |

---

## 🎯 NASTĘPNE KROKI

### W przyszłości możesz dodać:

1. **ChatGPT (OpenAI)** - jako alternatywę
   - Lepsze odpowiedzi
   - Płatny (~$0.002/1K tokenów)
   
2. **Claude (Anthropic)** - gdy opłacisz
   - Najlepszy dla długich dokumentów
   - Płatny

3. **Wybór AI w panelu** - użytkownik wybiera który AI użyć

---

## ⚠️ ZNANE PROBLEMY

### Problem 1: "key not valid"
**Rozwiązanie:**
1. Sprawdź czy klucz API jest aktywny
2. Wejdź w Google Cloud Console
3. Upewnij się że "Generative Language API" jest włączone
4. Sprawdź ograniczenia klucza (powinno być "None")

### Problem 2: "Brak odpowiedzi"
**Rozwiązanie:**
1. Sprawdź konsole backendu - czy są błędy?
2. Sprawdź konsole przeglądarki (F12)
3. Upewnij się że backend działa (port 3500)

### Problem 3: Timeout
**Rozwiązanie:**
1. Gemini czasem jest wolny
2. Spróbuj ponownie po chwili
3. Sprawdź połączenie internetowe

---

## 📞 WSPARCIE

Jeśli coś nie działa:
1. Sprawdź logi backendu
2. Sprawdź konsolę przeglądarki (F12)
3. Zrestartuj backend
4. Odśwież stronę (Ctrl+Shift+R)

---

## ✅ STATUS INTEGRACJI

- ✅ Backend Gemini Service
- ✅ Endpointy API
- ✅ Frontend AI Assistant
- ✅ Frontend AI Search
- ✅ Generowanie dokumentów
- ✅ Analiza spraw
- ✅ Q&A system
- ✅ Precedensy prawne
- ❌ ChatGPT (zaplanowane)
- ❌ Claude (wyłączony - płatny)

---

**System gotowy do użycia! 🚀**
**100% darmowy dzięki Google Gemini AI!**
