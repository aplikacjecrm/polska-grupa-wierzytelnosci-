# ✅ PRIORYTET 1 ZAKOŃCZONY: Naprawa logiki "Dodaj do salda"

## 🎯 Problem
Checkbox "💰 Dodaj do salda klienta" był w ZŁYM miejscu - przy **tworzeniu płatności** (faktury).

### ❌ Poprzednio (źle):
```
Tworząc płatność:
┌─────────────────────────────────────┐
│ Kwota: 1000 PLN                     │
│ Metoda: Gotówka                     │
│ ☐ Dodaj do salda klienta (prepaid) │  ← ❌ Nie ma sensu!
│ [Utwórz płatność]                   │
└─────────────────────────────────────┘

Rejestrując wpłatę gotówką:
┌─────────────────────────────────────┐
│ Paragon: PAR/001                    │
│ Notatka: ...                        │
│                                     │  ← ❌ Brak opcji dodania do salda!
│ [Potwierdź wpłatę]                  │
└─────────────────────────────────────┘
```

**Problem:** Przy tworzeniu płatności tworzysz FAKTURĘ/ZOBOWIĄZANIE, nie dodajesz pieniędzy do salda!

## ✅ Rozwiązanie (teraz poprawnie):

### 1. Usunięto z formularza TWORZENIA płatności
**Plik:** `frontend/scripts/modules/payments-module.js`
**Linie:** 291-299 (usunięte)

```javascript
// ❌ USUNIĘTO - nie ma tu miejsca
<input type="checkbox" name="add_to_balance">
💰 Dodaj do salda klienta (prepaid)
```

### 2. Dodano do formularza REJESTROWANIA wpłaty
**Plik:** `frontend/scripts/modules/payments-module.js`
**Funkcja:** `payWithCash()` - linie 545-553

```javascript
// ✅ DODANO - tutaj ma to sens!
<div class="form-group">
    <label>
        <input type="checkbox" name="add_to_balance" value="1">
        <span>💰 Dodaj do salda klienta po opłaceniu</span>
    </label>
    <small>Jeśli zaznaczone, kwota zostanie dodana do salda klienta (prepaid)</small>
</div>
```

### 3. Zaktualizowano wysyłanie do backend
**Plik:** `frontend/scripts/modules/payments-module.js`
**Funkcja:** `submitCashPayment()` - linia 589

```javascript
// ✅ DODANO parametr add_to_balance
body: JSON.stringify({
    cash_receipt_number: formData.get('cash_receipt_number'),
    note: formData.get('note'),
    add_to_balance: formData.get('add_to_balance') === '1'  // ← Nowe!
})
```

### 4. Poprawiono backend
**Plik:** `backend/routes/payments.js`
**Endpoint:** `POST /payments/:id/pay-cash`

```javascript
// ✅ POPRAWIONO - używa parametru z requesta
const { cash_receipt_number, note, add_to_balance } = req.body;

// ... później ...

// Jeśli add_to_balance = true, dodaj do salda
if (add_to_balance === true) {
    console.log('💰 Dodaję do salda klienta:', payment.client_id, payment.amount);
    await addToClientBalance(db, payment.client_id, parseFloat(payment.amount), id, req.user.id, 'Wpłata gotówkowa');
}
```

**PRZED:** Sprawdzał `payment.add_to_balance` z tabeli (które nigdy nie było ustawione)
**PO:** Sprawdza `add_to_balance` z requesta

## 📊 Jak to teraz działa?

### Krok 1: Tworzenie płatności (Faktura)
```
Admin/Lawyer/Reception:
1. Otwiera sprawę
2. Płatności → "Dodaj płatność"
3. Wypełnia:
   - Kwota: 1000 PLN
   - Typ: Faktura VAT
   - Metoda: Gotówka
   - Termin: 2025-12-01
4. [Utwórz płatność] ✅

REZULTAT: Utworzona płatność o statusie "pending" (oczekująca)
```

### Krok 2: Rejestrowanie wpłaty
```
Admin/Finance/Reception:
1. Szczegóły płatności → [Zarejestruj gotówkę]
2. Wypełnia:
   - Paragon: PAR/2025/001
   - Notatka: "Zapłacono w recepcji"
   - ☑ Dodaj do salda klienta po opłaceniu  ← NOWA OPCJA!
3. [Potwierdź wpłatę] ✅

REZULTAT: 
- Płatność zmienia status na "completed" ✅
- Kwota dodana do salda klienta: +1000 PLN ✅
- Historia salda: "Wpłata gotówkowa" ✅
```

## 💰 Integracja z istniejącym systemem salda

Funkcja `addToClientBalance()` już istnieje w `backend/routes/payments.js` (linia 745) i robi:

1. **Aktualizuje saldo klienta**
   ```sql
   UPDATE clients SET balance = balance + 1000 WHERE id = ?
   ```

2. **Dodaje do historii salda**
   ```sql
   INSERT INTO client_balance_history (
       client_id, amount, operation_type, description, payment_id, 
       previous_balance, new_balance, created_by
   ) VALUES (?, 1000, 'add', 'Wpłata gotówkowa', ?, ?, ?, ?)
   ```

3. **Historia widoczna w profilu klienta**
   - Zakładka "💰 Saldo i płatności" pokazuje historię transakcji
   - Moduł: `frontend/scripts/modules/client-balance-module.js`

## 🧪 Test

### 1. Odśwież przeglądarkę
```
Ctrl + F5
```

### 2. Utwórz płatność
1. Otwórz dowolną sprawę
2. Płatności → "Dodaj płatność"
3. Kwota: 100 PLN, Metoda: Gotówka
4. Utwórz płatność
5. **Sprawdź:** Checkbox "Dodaj do salda" NIE POWINIEN być widoczny ✅

### 3. Zarejestruj wpłatę
1. Kliknij na utworzoną płatność
2. [Zarejestruj gotówkę]
3. Paragon: PAR/TEST/001
4. **☑ Zaznacz:** "Dodaj do salda klienta po opłaceniu"
5. [Potwierdź wpłatę]

### 4. Sprawdź saldo klienta
1. Przejdź do profilu klienta
2. Zakładka "💰 Saldo i płatności"
3. **Powinno być:** +100 PLN ✅
4. Historia: "Wpłata gotówkowa" ✅

## 📝 Co dalej?

### ✅ PRIORYTET 1 - ZAKOŃCZONY
- [x] Usunięto checkbox z tworzenia płatności
- [x] Dodano checkbox do rejestracji wpłaty
- [x] Zaktualizowano frontend (wysyłanie add_to_balance)
- [x] Poprawiono backend (sprawdzanie add_to_balance z requesta)
- [x] Zrestartowano backend

### 🔜 PRIORYTET 2 - Dashboard Finansowy
- [ ] Utworzyć widok wszystkich płatności ze wszystkich spraw
- [ ] Filtry: Status, Klient, Zakres dat
- [ ] Statystyki: Suma opłaconych, oczekujących, przeterminowanych
- [ ] Dostęp: Admin, Finance, Reception

### 🔜 PRIORYTET 3 - System ratalny
- [ ] Dodać opcję "Rozłóż na raty" przy tworzeniu płatności
- [ ] Integracja z `backend/routes/installments.js`
- [ ] Harmonogram rat w szczegółach płatności
- [ ] Opcja opłacania pojedynczych rat

## 🎉 Rezultat

Logika płatności jest teraz **spójna i logiczna**:

1. **Tworzysz płatność** → Faktura/Zobowiązanie (status: pending)
2. **Rejestrujesz wpłatę** → Gotówka/PayPal/Krypto (status: completed)
3. **Opcjonalnie** → Dodajesz do salda klienta (prepaid)

**Backend zrestartowany. System działa!** ✅

---

**Data naprawy:** 24 listopada 2025, 14:40
**Pliki zmienione:**
- `frontend/scripts/modules/payments-module.js` (3 edycje)
- `backend/routes/payments.js` (2 edycje)
