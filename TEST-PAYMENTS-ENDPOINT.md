# 🔍 TEST ENDPOINTU PŁATNOŚCI

## ✅ CO ZROBIŁEM (automatycznie):

### 1. Dodałem logi diagnostyczne do `backend/routes/payments.js`:
```javascript
console.log('💰 [PAYMENTS] Pobieranie płatności dla sprawy:', req.params.caseId);
console.log(`✅ [PAYMENTS] Znaleziono ${rows.length} płatności`);
```

### 2. Dodałem debug info do `backend/server.js`:
```javascript
console.log('🔍 [DEBUG] Router zarejestrowany: /api/payments');
console.log('🔍 [DEBUG] Dostępne endpointy:');
console.log('   - GET /api/payments/case/:caseId');
```

---

## 🚀 CO MUSISZ ZROBIĆ (manual):

### KROK 1: ZRESTARTUJ BACKEND

**W terminalu Visual Studio Code:**

1. Jeśli backend działa - zatrzymaj go: `Ctrl + C`
2. Uruchom ponownie:

```bash
cd backend
npm start
```

### KROK 2: SPRAWDŹ LOGI BACKENDU

**Po uruchomieniu powinieneś zobaczyć:**

```
✅ Tabela payments utworzona
✅ Tabela payment_history utworzona
✅ Tabela client_balance utworzona
✅ payments.js router loaded - PayPal Integration ready! 💰
🔍 [DEBUG] Router zarejestrowany: /api/payments
🔍 [DEBUG] Dostępne endpointy:
   - POST /api/payments/generate-code
   - POST /api/payments
   - GET /api/payments/case/:caseId
   - GET /api/payments/client/:clientId
🚀 Backend uruchomiony na porcie 3500
```

**Jeśli NIE WIDZISZ tych logów:**
- Tabela `payments` nie została utworzona
- **Usuń bazę i utwórz nową:**

```bash
# Zatrzymaj backend (Ctrl+C)
del database\kancelaria.db
npm start
```

---

## 🧪 KROK 3: TESTUJ ENDPOINT

### Test 1: Sprawdź czy backend odpowiada

**W przeglądarce otwórz:**
```
http://localhost:3500/api/health
```

**Powinno zwrócić:**
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### Test 2: Sprawdź endpoint płatności

**W konsoli przeglądarki (F12) wklej:**

```javascript
fetch('http://localhost:3500/api/payments/case/74', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(data => {
  console.log('✅ Odpowiedź:', data);
})
.catch(err => {
  console.error('❌ Błąd:', err);
});
```

**Jeśli działa zobaczysz:**
```
Status: 200
✅ Odpowiedź: {payments: []}
```

**W konsoli backendu zobaczysz:**
```
📨 GET /api/payments/case/74
💰 [PAYMENTS] Pobieranie płatności dla sprawy: 74
✅ [PAYMENTS] Znaleziono 0 płatności dla sprawy 74
```

---

## ❌ JEŚLI NADAL 404:

### Problem 1: Backend nie działa
**Rozwiązanie:** Uruchom backend (`npm start`)

### Problem 2: Tabela nie istnieje
**Rozwiązanie:** Usuń bazę i zrestartuj:
```bash
del backend\database\kancelaria.db
npm start
```

### Problem 3: Router nie załadowany
**Sprawdź logi backendu** - jeśli nie ma:
```
✅ payments.js router loaded - PayPal Integration ready! 💰
```

To znaczy że plik `routes/payments.js` ma błędy składniowe.

---

## 📋 PODSUMOWANIE ZMIAN:

### Automatyczne (już zrobione):
- ✅ Dodane logi do `routes/payments.js`
- ✅ Dodane debug info do `server.js`

### Manualne (musisz zrobić):
1. Zrestartuj backend
2. Sprawdź logi
3. Testuj endpoint
4. Jeśli nie działa - usuń bazę i zrestartuj

---

## 🎯 OCZEKIWANY REZULTAT:

Po wykonaniu kroków:
1. Backend działa ✅
2. Endpoint odpowiada ✅
3. W przeglądarce "💰 Płatności" działa ✅
4. Możesz dodawać płatności ✅

---

**TERAZ: Zrestartuj backend i sprawdź logi!** 🚀
