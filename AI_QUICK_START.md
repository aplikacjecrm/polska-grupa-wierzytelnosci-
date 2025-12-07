# 🚀 AI Asystent - Szybki start (5 minut)

## Instalacja ekspresowa:

### 1. Zainstaluj bibliotekę:
```bash
cd backend
npm install @anthropic-ai/sdk
```

### 2. Pobierz klucz API:
- Wejdź na: https://console.anthropic.com/
- Zarejestruj się (darmowe konto startowe)
- Skopiuj klucz API (zaczyna się od `sk-ant-api...`)

### 3. Dodaj klucz do .env:
```bash
# backend/.env
ANTHROPIC_API_KEY=sk-ant-api-TWOJ-KLUCZ-TUTAJ
```

### 4. Dodaj route do server.js:
```javascript
// W backend/server.js dodaj po innych routach:
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);
```

### 5. Utwórz tabele:
```bash
mysql -u root -p kancelaria < backend/migrations/create_ai_logs.sql
```

### 6. Uruchom serwer:
```bash
npm start
```

## ✅ Gotowe!

Kliknij **🤖 AI Asystent** w szczegółach sprawy i zacznij korzystać!

---

## Przykłady pytań do AI:

- "Przeanalizuj tę sprawę"
- "Jakie są ryzyka?"
- "Co powinienem zrobić dalej?"
- "Generuj pozew" (przycisk)

## Koszty:
~$5-10/miesiąc przy normalnym użyciu

## Bezpieczeństwo:
✅ AI tylko czyta (nie modyfikuje)
✅ Wszystkie sugestie wymagają weryfikacji
✅ Logi użycia
✅ Limity dzienne

---

📖 **Pełna dokumentacja:** AI_SETUP.md
