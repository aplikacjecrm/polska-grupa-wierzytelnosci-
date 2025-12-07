# 💰 MODUŁ PŁATNOŚCI - FINALNE INSTRUKCJE

## ✅ CO ZROBIONO:

### 1. **Dodano zakładkę "💰 Płatności" do widoku sprawy**
📄 `frontend/scripts/app-config.js`:
- Dodano moduł `payments: true`
- Dodano zakładkę w `caseTabs` (order: 5)

### 2. **Utworzono automatyczny fix**
📄 `frontend/scripts/add-payments-tab-fix.js`:
- Rozszerza `loadCaseTabContent()` o obsługę płatności
- Rozszerza `switchCaseTab()` o obsługę płatności
- Automatycznie dodaje przycisk zakładki

### 3. **Zaktualizowano index.html**
- Dodano import fix-a
- Wersja v2.0

---

## 🚀 JAK URUCHOMIĆ:

### Krok 1: Odśwież stronę
```
Ctrl + Shift + R  (wymuszony refresh)
```

### Krok 2: Sprawdź w konsoli (F12)
Powinieneś zobaczyć:
```
💰 Fix zakładki płatności załadowany!
⏳ Czekam na crmManager...
✅ crmManager znaleziony!
✅ Funkcja loadCaseTabContent rozszerzona o zakładkę płatności!
✅ Payments Module v2.0 załadowany
```

### Krok 3: Otwórz sprawę
- Klient i Sprawy → Kliknij na sprawę
- **Zobaczysz zakładkę "💰 Płatności"** między "Wydarzenia" a "Grupa"

### Krok 4: Kliknij "💰 Płatności"
- Zobaczysz pełny widok płatności dla sprawy
- 5 metod płatności (PayPal, Gotówka, Krypto, Saldo, Przelew)
- Lista płatności
- KPI Cards
- Przycisk "Dodaj płatność"

---

## 📋 FUNKCJE MODUŁU PŁATNOŚCI:

### 5 METOD PŁATNOŚCI:
1. **💳 PayPal** - Online (wymaga Client ID)
2. **💵 Gotówka** - Rejestracja ręczna z paragonem ✅
3. **₿ Kryptowaluty** - BTC, ETH, USDT, BNB, USDC ✅
4. **💰 Saldo klienta** - Prepaid/kredyt ✅
5. **🏦 Przelew bankowy** - Do implementacji

### WIDOK PŁATNOŚCI W SPRAWIE:
- **KPI Cards:** Wszystkie, Oczekujące, Opłacone, Wpłacono, Do zapłaty
- **Lista płatności** z filtrami i wyszukiwaniem
- **Dodaj płatność** - formularz z wyborem metody
- **Szczegóły płatności** - pełne informacje + przyciski akcji
- **Historia płatności** - wszystkie zmiany statusu

### SZCZEGÓŁY KLIENTA:
- **Saldo ogólne** - suma ze wszystkich spraw
- **Płatności po sprawach** - dla każdej sprawy osobno
- **Historia transakcji** - balance before/after

---

## 🔧 JEŚLI NADAL NIE WIDZISZ ZAKŁADKI:

### Sprawdź 1: Czy pliki istnieją
```bash
frontend/scripts/app-config.js
frontend/scripts/add-payments-tab-fix.js
frontend/scripts/modules/payments-module.js
frontend/index.html
```

### Sprawdź 2: Czy import jest w index.html
Otwórz `frontend/index.html` i znajdź:
```html
<script src="scripts/modules/payments-module.js?v=2.0&MULTI_PAYMENT=TRUE"></script>
<script src="scripts/add-payments-tab-fix.js?v=2.0"></script>
```

### Sprawdź 3: Czy moduł jest włączony
Otwórz konsolę (F12) i wpisz:
```javascript
console.log('Moduł payments:', window.appConfig.modules.payments);
console.log('Payments Module:', window.paymentsModule);
```

Powinno zwrócić:
```
Moduł payments: true
Payments Module: Object { renderPaymentsTab: ƒ, ... }
```

### Sprawdź 4: Czy zakładka jest w konfiguracji
```javascript
console.log(window.appConfig.caseTabs.find(t => t.id === 'payments'));
```

Powinno zwrócić:
```
{id: "payments", label: "Płatności", icon: "💰", enabled: true, order: 5, moduleRequired: "payments"}
```

---

## 🔍 DEBUGOWANIE:

### Problem: Zakładka nie pojawia się
**Rozwiązanie:** Otwórz konsolę i sprawdź błędy. Upewnij się że:
1. `window.crmManager` istnieje
2. `window.paymentsModule` istnieje
3. Nie ma błędów ładowania skryptów

### Problem: Kliknięcie na zakładkę nic nie robi
**Rozwiązanie:** Sprawdź w konsoli:
```javascript
// Sprawdź czy funkcja jest nadpisana
console.log(typeof window.crmManager.loadCaseTabContent);
console.log(typeof window.crmManager.switchCaseTab);
```

### Problem: Moduł płatności nie ładuje się
**Rozwiązanie:** 
1. Sprawdź czy backend działa (`npm start` w `backend/`)
2. Sprawdź czy tabele w bazie istnieją (payments, client_balance, balance_transactions)
3. Sprawdź konsolę backendu czy są błędy

---

## 📊 STRUKTURA BAZY DANYCH:

### Tabela `payments`:
- payment_code, case_id, client_id, lawyer_id
- amount, currency, description, payment_type
- **payment_method** (paypal/cash/crypto/balance/bank_transfer)
- status (pending/completed/failed/refunded)
- **crypto_currency, crypto_wallet_address, crypto_transaction_hash, crypto_amount**
- **cash_receipt_number, cash_received_by**
- **add_to_balance**
- created_at, updated_at

### Tabela `client_balance`:
- client_id, **balance**, currency
- last_transaction_at, updated_at

### Tabela `balance_transactions`:
- client_id, payment_id
- amount, transaction_type (credit/debit)
- **balance_before, balance_after**
- description, created_by, created_at

---

## 🎯 NASTĘPNE KROKI:

### A. Saldo klienta w szczegółach
TODO: Dodać sekcję "💰 Saldo i płatności" w panelu szczegółów klienta:
- Saldo ogólne ze wszystkich spraw
- Lista spraw z płatnościami
- Historia transakcji salda

### B. PayPal Client ID
TODO: Dodać Client ID z PayPal Developer:
1. Załóż konto na https://developer.paypal.com
2. Utwórz aplikację
3. Skopiuj Client ID
4. Wklej do `frontend/index.html` linia ~17:
```html
<script src="https://www.paypal.com/sdk/js?client-id=TU_CLIENT_ID&currency=PLN&locale=pl_PL"></script>
```

### C. Przypomnienia płatności
TODO: System emaili dla zaległych płatności:
- 7 dni przed terminem
- W dniu terminu
- 3 dni po terminie

### D. Faktury automatyczne
TODO: Generowanie PDF faktur po opłaceniu

---

## 📁 PLIKI ZMODYFIKOWANE:

### Backend:
- ✅ `backend/database/init.js` - 3 nowe tabele
- ✅ `backend/routes/payments.js` - 11 endpointów API
- ✅ `backend/server.js` - Router płatności

### Frontend:
- ✅ `frontend/scripts/app-config.js` - Moduł + zakładka
- ✅ `frontend/scripts/modules/payments-module.js` - Pełny moduł
- ✅ `frontend/scripts/add-payments-tab-fix.js` - Fix automatyczny
- ✅ `frontend/index.html` - Importy

### Dokumentacja:
- ✅ `PAYPAL-SETUP.md`
- ✅ `PAYMENT-METHODS-EXTENDED.md`
- ✅ `DODAJ-ZAKLADKE-PLATNOSCI.md`
- ✅ `PLATNOSCI-FINALNE-INSTRUKCJE.md` (ten plik)

---

## ✅ GOTOWE!

**Odśwież stronę (Ctrl + Shift + R) i zobacz zakładkę "💰 Płatności"!** 🎉

Jeśli masz problemy, sprawdź konsolę (F12) i porównaj z oczekiwanymi logami powyżej.
