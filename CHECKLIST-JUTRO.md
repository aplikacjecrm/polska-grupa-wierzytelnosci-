# ✅ CHECKLIST NA JUTRO - AI System

**Data:** 3 grudnia 2025  
**Cel:** Uruchomić działający system AI

---

## 🌅 RANO (10 minut):

### ☑️ KROK 1: Test Gemini po propagacji

```powershell
# Uruchom backend
cd c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app
node backend/server.js
```

**Sprawdź w konsoli:**
```
✅ Gemini AI: Initialized (gemini-1.5-pro)
🔑 GEMINI_API_KEY: AIzaSyCCeQNRPr4KVir...
📁 PROJECT_ID: gen-lang-client-0343931291
```

**Przetestuj:**
1. Otwórz: http://localhost:3500
2. Zaloguj się
3. Kliknij: 🤖 AI Legal Search
4. Wpisz: "Jaki jest termin na apelację?"
5. Kliknij: "Wyszukaj z AI"

**Rezultat:**
- ✅ **DZIAŁA** → Gotowe! Korzystaj z Gemini!
- ❌ **NIE DZIAŁA** → Przejdź do KROK 2

---

## 🔧 KROK 2: Dodaj ChatGPT (jeśli Gemini nie działa)

### A) Zdobądź klucz OpenAI (5 minut):

1. **Wejdź:** https://platform.openai.com/api-keys
2. **Zaloguj się** (lub zarejestruj)
3. **Dodaj kartę:** https://platform.openai.com/settings/organization/billing/overview
4. **Dodaj $10** na start (wystarczy na miesiąc)
5. **Kliknij:** "Create new secret key"
6. **Nazwij:** "Kancelaria Pro Meritum"
7. **Skopiuj klucz:** `sk-proj-...` (zapisz bezpiecznie!)

---

### B) Zainstaluj pakiet (1 minuta):

```powershell
cd c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app
npm install openai
```

---

### C) Daj mi klucz (tu w Windsurf):

**Napisz:** "Mam klucz OpenAI: sk-proj-..."

**Dodam:**
1. ✅ Serwis OpenAI (`backend/services/ai/openai-service.js`)
2. ✅ Endpointy API (`/api/ai/openai/*`)
3. ✅ Integrację z frontendem
4. ✅ Wybór AI (Gemini / ChatGPT)

**Czas:** 15 minut

---

## 📊 DECYZJA:

### Opcja A: Tylko Gemini (darmowy)
- ✅ $0/miesiąc
- ⚠️ Może być niestabilny
- 🎯 Jeśli działa po propagacji

### Opcja B: Tylko ChatGPT (płatny, niezawodny)
- 💰 ~$20-30/miesiąc
- ✅ 100% stabilny
- ✅ Najlepszy dla polskiego

### Opcja C: Gemini + ChatGPT (backup)
- 💰 ~$20-30/miesiąc
- ✅ ChatGPT dla ważnych zadań
- 🆓 Gemini dla prostych pytań
- 🎛️ Użytkownik wybiera

---

## 🎯 REKOMENDACJA:

**Najlepsze rozwiązanie:** **OPCJA C (OBA)**

**Dlaczego:**
- 🆓 Gemini dla 80% zapytań (darmowy)
- 💎 ChatGPT dla ważnych dokumentów (płatny, ale pewny)
- 🎛️ Elastyczność - użytkownik decyduje
- 💰 Koszt ~$15-20/miesiąc (tylko ChatGPT dla ważnych rzeczy)

---

## 📞 KONTAKT Z WINDSURF:

Jutro napisz:

### Jeśli Gemini działa:
```
"Gemini działa! Co dalej?"
```

### Jeśli Gemini nie działa:
```
"Gemini nie działa, dodajmy ChatGPT. Mam klucz: sk-proj-..."
```

### Jeśli chcesz oba:
```
"Dodaj ChatGPT jako backup. Klucz: sk-proj-..."
```

---

## ⏰ TIMELINE:

**Jutro rano:**
- 09:00 - Test Gemini
- 09:10 - Decyzja: Gemini / ChatGPT / Oba
- 09:15 - Zdobycie klucza OpenAI (jeśli potrzebne)
- 09:30 - Integracja ChatGPT (jeśli potrzebne)
- 10:00 - ✅ System AI działa!

---

## 🔑 KLUCZE DO ZAPISANIA:

### Gemini (masz już):
```
AIzaSyCCeQNRPr4KVirwr9l_jO8CCuIIyMPqe_Q
```

### OpenAI (zdobędziesz jutro):
```
sk-proj-... [TUTAJ WPISZESZ KLUCZ]
```

### Claude (na przyszłość):
```
[OPCJONALNIE - gdy opłacisz]
```

---

## 📝 NOTATKI:

- ✅ Backend gotowy (wszystkie funkcje)
- ✅ Frontend gotowy (UI i integracja)
- ⏰ Czeka: działający klucz API
- 💡 Najszybsze: ChatGPT (15 minut)
- 🆓 Najtańsze: Gemini (0 zł, jeśli zadziała)

---

**Powodzenia! 🚀**

**Sprawdź rano i daj znać jak poszło!**
