# 🤖 AI ASYSTENT PRAWNY - Instrukcja Użycia

## ✅ CO ZROBIONO:

### 1. **Backend Service** - `backend/services/ai/gemini-service.js`
   - Integracja z Google Gemini AI
   - 4 główne funkcje:
     - `analyzeDocument()` - analiza dokumentów
     - `askQuestion()` - pytania o sprawę
     - `generateCaseSummary()` - podsumowania
     - `suggestPrecedents()` - precedensy prawne

### 2. **API Endpoints** - `backend/routes/ai.js`
   - ✅ `POST /api/ai/gemini/analyze-document`
   - ✅ `POST /api/ai/gemini/ask`
   - ✅ `POST /api/ai/gemini/summary`
   - ✅ `POST /api/ai/gemini/precedents`
   - ✅ `GET /api/ai/status` - sprawdź dostępność AI

### 3. **Frontend Module** - `frontend/scripts/modules/ai-assistant-module.js`
   - Piękny panel UI z gradientem
   - Szybkie akcje (Analizuj, Sugestie, Precedensy)
   - Pole pytań
   - Historia konwersacji

---

## 🔑 KONFIGURACJA - WAŻNE!

### Krok 1: Pobierz DARMOWY klucz API Gemini
1. Wejdź na: https://makersuite.google.com/app/apikey
2. Zaloguj się kontem Google
3. Kliknij **"Create API Key"**
4. Skopiuj klucz (np. `AIzaSyC...`)

### Krok 2: Ustaw klucz w systemie

**Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY='AIzaSyC_TWÓJ_KLUCZ_TUTAJ'
node backend/server.js
```

**Lub dodaj do pliku `.env`:**
```
GEMINI_API_KEY=AIzaSyC_TWÓJ_KLUCZ_TUTAJ
```

---

## 🚀 JAK UŻYĆ AI ASYSTENTA:

### Opcja A: Dodaj do widoku sprawy (CRM)

Edytuj plik gdzie renderujesz szczegóły sprawy (np. `crm-case-tabs-v2021.js`):

```javascript
// Dodaj kontener dla AI Asystenta w HTML
const aiPanelHTML = `
    <div id="ai-assistant-panel" style="margin-top: 20px;"></div>
`;

// Po załadowaniu sprawy, renderuj panel AI
function loadCaseDetails(caseId) {
    // ... twój istniejący kod ...
    
    // Pobierz dane sprawy
    const caseData = {
        id: caseId,
        title: '...',
        description: '...',
        case_type: '...',
        // ... inne dane
    };
    
    // Renderuj panel AI
    if (window.AIAssistant) {
        AIAssistant.render(caseId, caseData);
    }
}
```

### Opcja B: Standalone test

Stwórz prostą stronę testową:

```html
<!DOCTYPE html>
<html>
<head>
    <title>AI Test</title>
</head>
<body>
    <div id="ai-assistant-panel"></div>
    
    <script src="scripts/modules/ai-assistant-module.js"></script>
    <script>
        // Test AI
        const testCaseData = {
            case_number: 'I C 123/2024',
            title: 'Test sprawy',
            description: 'Opis sprawy testowej',
            case_type: 'civil'
        };
        
        AIAssistant.render(1, testCaseData);
    </script>
</body>
</html>
```

---

## 📋 FUNKCJE AI ASYSTENTA:

### 1. **📊 Analizuj Sprawę**
   - Przycisk: "Analizuj Sprawę"
   - Co robi: Pełna analiza prawna + podstawa prawna + zalecenia
   - Endpoint: `POST /api/ai/gemini/summary`

### 2. **💡 Sugestie**
   - Przycisk: "Sugestie"
   - Co robi: Konkretne kroki do podjęcia + terminy
   - Endpoint: `POST /api/ai/gemini/ask`

### 3. **⚖️ Precedensy**
   - Przycisk: "Precedensy"
   - Co robi: Podobne sprawy + orzecznictwo
   - Endpoint: `POST /api/ai/gemini/precedents`

### 4. **📝 Podsumowanie**
   - Przycisk: "Podsumowanie"
   - Co robi: Zwięzłe podsumowanie sprawy
   - Endpoint: `POST /api/ai/gemini/summary`

### 5. **✨ Zadaj Pytanie**
   - Pole tekstowe + przycisk
   - Co robi: Dowolne pytanie o sprawę
   - Endpoint: `POST /api/ai/gemini/ask`

---

## 🎨 WYGLĄD UI:

- **Gradient tło**: Fioletowo-fioletowy gradient (#667eea → #764ba2)
- **Przełącznik AI**: Gemini / Claude
- **Responsywne przyciski**: 4 szybkie akcje
- **Historia**: Przewijana lista pytań i odpowiedzi
- **Kolory**: Pytania (niebieskie), Odpowiedzi (zielone), Błędy (czerwone)

---

## 💰 KOSZTY:

**Gemini Pro - DARMOWY:**
- 60 zapytań/minutę
- 1500 zapytań/dzień
- 1 milion tokenów/miesiąc
- **Całkowicie za darmo!**

**Claude AI (jeśli masz już klucz):**
- Alternatywa dla Gemini
- Również działa przez te same endpointy

---

## 🔧 TESTOWANIE:

### Test 1: Sprawdź status AI
```bash
curl http://localhost:3500/api/ai/status \
  -H "Authorization: Bearer TWÓJ_TOKEN"
```

Powinieneś zobaczyć:
```json
{
  "gemini": {
    "configured": true,
    "available": true,
    "model": "gemini-pro"
  }
}
```

### Test 2: Zadaj proste pytanie
```bash
curl -X POST http://localhost:3500/api/ai/gemini/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TWÓJ_TOKEN" \
  -d '{
    "question": "Jaka jest podstawa prawna w sprawie o zapłatę?",
    "context": ""
  }'
```

---

## ⚠️ WAŻNE UWAGI:

1. **Klucz API jest WYMAGANY** - bez niego AI nie działa
2. **Token autoryzacji** - musisz być zalogowany (lawyer/admin)
3. **Backend musi działać** - `node backend/server.js`
4. **Dane są anonimizowane** - PESEL, NIP itp. są maskowane przed wysłaniem do AI
5. **To ASYSTENT** - zawsze weryfikuj odpowiedzi AI z prawnikiem!

---

## 🐛 ROZWIĄZYWANIE PROBLEMÓW:

### Problem: "Gemini AI nie jest skonfigurowane"
**Rozwiązanie:** Ustaw `GEMINI_API_KEY` w zmiennych środowiskowych

### Problem: "Brak uprawnień"
**Rozwiązanie:** Zaloguj się jako lawyer lub admin

### Problem: Panel AI się nie renderuje
**Rozwiązanie:** 
1. Sprawdź czy skrypt jest załadowany w index.html
2. Sprawdź czy istnieje `<div id="ai-assistant-panel"></div>`
3. Otwórz konsolę przeglądarki (F12) i sprawdź błędy

### Problem: AI odpowiada po angielsku
**Rozwiązanie:** To nie powinno się zdarzyć - prompty są po polsku. Jeśli się zdarzy, dodaj "Odpowiedz PO POLSKU" w pytaniu.

---

## 📚 PRZYKŁADY UŻYCIA:

### Przykład 1: Analiza sprawy cywilnej
```javascript
AIAssistant.render(123, {
    case_number: 'I C 456/2024',
    title: 'Sprawa o zapłatę',
    description: 'Powód domaga się zapłaty 50 000 zł',
    case_type: 'civil',
    court_name: 'Sąd Rejonowy w Warszawie'
});
```

### Przykład 2: Pytanie o termin
```javascript
// Użytkownik wpisuje w pole:
"Jaki jest termin na wniesienie apelacji?"

// AI odpowie z podstawą prawną (art. 369 k.p.c.)
```

### Przykład 3: Precedensy
```javascript
AIAssistant.findPrecedents(); 
// AI wyszuka podobne sprawy i orzecznictwo
```

---

## ✅ GOTOWE DO UŻYCIA!

AI Asystent jest **w pełni zintegrowany** i gotowy do użycia. 

**Wystarczy:**
1. Dodać klucz API Gemini
2. Dodać `<div id="ai-assistant-panel"></div>` w widoku sprawy
3. Wywołać `AIAssistant.render(caseId, caseData)`

**To wszystko!** 🎉
