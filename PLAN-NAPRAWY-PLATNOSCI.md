# 📋 PLAN NAPRAWY SYSTEMU PŁATNOŚCI

## 🎯 Cel: Uporządkować logikę płatności

### ❌ Problemy do naprawy:

1. **Checkbox "Dodaj do salda" jest w złym miejscu** (Zdjęcie 1)
   - Teraz: Jest przy TWORZENIU płatności
   - Problem: To nie ma sensu - przy tworzeniu faktury/zobowiązania nie dodajesz do salda
   - Rozwiązanie: Usunąć z formularza tworzenia płatności

2. **Przycisk "Zarejestruj gotówkę" nie ma opcji salda** (Zdjęcie 3)
   - Teraz: Przy rejestracji wpłaty gotówką nie ma opcji dodania do salda
   - Rozwiązanie: Dodać checkbox "Dodaj do salda klienta" do formularza rejestracji wpłaty

3. **Brak integracji Dashboard Finansowy**
   - Potrzebny widok wszystkich płatności ze wszystkich spraw
   - Status: Opłacone/Nieopłacone
   - Dostęp: Admin, Finance, Reception

4. **System ratalny nie jest podłączony**
   - Plik istnieje: `backend/routes/installments.js`
   - Problem: Nie ma integracji z frontend
   - Rozwiązanie: Dodać opcję "Rozłóż na raty" przy tworzeniu płatności

5. **Brak widoku płatności w profilu klienta**
   - Powinny być widoczne w szczegółach klienta
   - Lista wszystkich płatności klienta ze wszystkich spraw

---

## 🔧 KROK 1: Naprawa logiki "Dodaj do salda"

### 1.1 Usunąć z formularza TWORZENIA płatności

**Plik:** `frontend/scripts/modules/payments-module.js`
**Linie:** 291-299

```javascript
// ❌ USUNĄĆ TO:
<div class="form-group">
    <label>
        <input type="checkbox" name="add_to_balance" value="1">
        💰 Dodaj do salda klienta (prepaid)
    </label>
    <small>Jeśli zaznaczone, kwota zostanie dodana do salda klienta po opłaceniu</small>
</div>
```

**Uzasadnienie:** Przy tworzeniu płatności tworzysz FAKTURĘ/ZOBOWIĄZANIE, nie WPŁATĘ.

### 1.2 Dodać do formularza REJESTROWANIA wpłaty

**Plik:** `frontend/scripts/modules/payments-module.js`
**Funkcja:** `payWithCash(paymentId)` - linie 535-576

```javascript
// ✅ DODAĆ TO:
<div class="form-group">
    <label>
        <input type="checkbox" name="add_to_balance" value="1">
        💰 Dodaj do salda klienta po opłaceniu
    </label>
    <small style="display: block; color: #999; margin-top: 5px;">
        Jeśli zaznaczone, kwota zostanie dodana do salda klienta (prepaid)
    </small>
</div>
```

**Gdzie:** Po polu "Notatka", przed komunikatem ostrzegawczym.

### 1.3 Aktualizować backend

**Plik:** `backend/routes/payments.js`
**Endpoint:** `POST /payments/:id/pay-cash`

Sprawdzić czy backend obsługuje `add_to_balance` przy rejestracji wpłaty.

---

## 🔧 KROK 2: Dashboard Finansowy

### 2.1 Utworzyć nowy moduł: Finance Dashboard

**Nowy plik:** `frontend/scripts/finance-dashboard.js`

#### Funkcjonalności:
1. **Wszystkie płatności** - tabela ze wszystkich spraw
   - Kolumny: Kod płatności, Sprawa, Klient, Kwota, Status, Termin, Akcje
   - Filtry: Status (wszystkie/opłacone/nieopłacone), Klient, Zakres dat
   - Sortowanie: Po dacie, kwocie, statusie

2. **Statystyki finansowe**
   - Suma opłaconych w tym miesiącu
   - Suma oczekujących
   - Suma przeterminowanych
   - Wykres miesięcznych przychodów

3. **Zarządzanie ratami**
   - Lista wszystkich rozłożonych płatności
   - Status każdej raty
   - Przypomnienia o zbliżających się ratach

4. **Saldo klientów (prepaid)**
   - Lista klientów z saldem
   - Historia dodawania/odejmowania z salda
   - Opcja doładowania salda klienta

### 2.2 Backend endpoints

**Plik:** `backend/routes/payments.js`

```javascript
// GET /api/payments/all - wszystkie płatności (dla Finance Dashboard)
router.get('/all', authenticateToken, isFinanceOrAdmin, async (req, res) => {
  const { status, client_id, date_from, date_to, limit, offset } = req.query;
  
  // Zapytanie z filtrami
  // JOIN z cases, clients
  // Zwróć pełne dane: case_number, client_name, payment_code, amount, status, due_date
});

// GET /api/payments/stats - statystyki dla Dashboard
router.get('/stats', authenticateToken, isFinanceOrAdmin, async (req, res) => {
  // Zwróć:
  // - total_pending, total_completed, total_overdue
  // - monthly_revenue (wykres)
  // - upcoming_payments (zbliżające się terminy)
});
```

### 2.3 Dodać zakładkę w menu

**Plik:** `frontend/index.html`

```html
<!-- Dla Finance, Admin, Reception -->
<li>
    <a href="#" onclick="financeManager.openDashboard()">
        💰 Dashboard Finansowy
    </a>
</li>
```

---

## 🔧 KROK 3: Integracja systemu ratalnego

### 3.1 Frontend - Opcja "Rozłóż na raty"

**Plik:** `frontend/scripts/modules/payments-module.js`
**Funkcja:** `showAddPaymentForm()`

```javascript
// Dodać checkbox przed "Termin płatności":
<div class="form-group">
    <label>
        <input type="checkbox" id="enableInstallments" onchange="paymentsModule.toggleInstallments()">
        📅 Rozłóż na raty
    </label>
</div>

<!-- Pola rat (ukryte domyślnie) -->
<div id="installmentFields" style="display: none;">
    <div class="form-group">
        <label>Liczba rat *</label>
        <select name="installment_count">
            <option value="2">2 raty</option>
            <option value="3">3 raty</option>
            <option value="4">4 raty</option>
            <option value="6">6 rat</option>
            <option value="12">12 rat</option>
        </select>
    </div>
    
    <div class="form-group">
        <label>Częstotliwość *</label>
        <select name="frequency">
            <option value="monthly">Miesięczna</option>
            <option value="weekly">Tygodniowa</option>
            <option value="biweekly">Co 2 tygodnie</option>
        </select>
    </div>
    
    <div class="form-group">
        <label>Pierwsza rata *</label>
        <input type="date" name="start_date">
    </div>
</div>
```

### 3.2 Backend - Połączenie payments z installments

**Plik:** `backend/routes/payments.js`
**Endpoint:** `POST /payments`

```javascript
// Po utworzeniu płatności:
if (installment_count && installment_count > 1) {
    await api.request('/installments/generate', {
        method: 'POST',
        body: {
            invoice_id: paymentId,  // payment_id jako invoice_id
            case_id: case_id,
            client_id: client_id,
            total_amount: amount,
            installment_count: installment_count,
            frequency: frequency,
            start_date: start_date
        }
    });
}
```

### 3.3 Widok rat w szczegółach płatności

**Funkcja:** `viewPaymentDetails(paymentId)`

```javascript
// Pobierz raty:
const installments = await api.request(`/installments/${paymentId}`);

// Wyświetl tabelę rat:
if (installments && installments.length > 0) {
    html += `
        <h4>📅 Harmonogram rat</h4>
        <table>
            <tr>
                <th>Rata</th>
                <th>Kwota</th>
                <th>Termin</th>
                <th>Status</th>
                <th>Akcje</th>
            </tr>
            ${installments.map(inst => `
                <tr>
                    <td>${inst.installment_number}/${inst.total_installments}</td>
                    <td>${inst.amount} PLN</td>
                    <td>${inst.due_date}</td>
                    <td>${inst.status}</td>
                    <td>
                        ${inst.status === 'pending' ? 
                            `<button onclick="paymentsModule.payInstallment(${inst.id})">Opłać</button>` 
                            : '✅'}
                    </td>
                </tr>
            `).join('')}
        </table>
    `;
}
```

---

## 🔧 KROK 4: Płatności w profilu klienta

### 4.1 Frontend - Zakładka "Płatności" w profilu klienta

**Plik:** `frontend/scripts/client-manager.js` (lub gdzie jest profil klienta)

```javascript
// Dodać zakładkę "💳 Płatności" obok "Sprawy", "Pliki", "Historia"

renderClientPaymentsTab(clientId) {
    // Pobierz wszystkie płatności klienta ze wszystkich spraw
    const payments = await api.request(`/clients/${clientId}/payments`);
    
    // Wyświetl tabelę:
    // - Case Number
    // - Payment Code
    // - Amount
    // - Status
    // - Due Date
    // - Akcje (Zobacz, Zapłać)
}
```

### 4.2 Backend endpoint

**Plik:** `backend/routes/clients.js`

```javascript
// GET /api/clients/:id/payments
router.get('/:id/payments', authenticateToken, async (req, res) => {
    const { id } = req.params;
    
    // SELECT * FROM payments WHERE client_id = ? ORDER BY created_at DESC
    // JOIN z cases dla case_number
    
    res.json({ payments: [...] });
});
```

---

## 🔧 KROK 5: Saldo klienta (Prepaid)

### 5.1 Widok salda w profilu klienta

```javascript
<div class="client-balance">
    <h4>💰 Saldo prepaid</h4>
    <div class="balance-amount">${client.balance || 0} PLN</div>
    <button onclick="clientManager.addToBalance(${clientId})">
        ➕ Doładuj saldo
    </button>
</div>
```

### 5.2 Historia salda

```javascript
<table>
    <tr>
        <th>Data</th>
        <th>Operacja</th>
        <th>Kwota</th>
        <th>Nowe saldo</th>
    </tr>
    ${balanceHistory.map(h => `
        <tr>
            <td>${h.created_at}</td>
            <td>${h.description}</td>
            <td class="${h.amount > 0 ? 'positive' : 'negative'}">
                ${h.amount > 0 ? '+' : ''}${h.amount} PLN
            </td>
            <td>${h.new_balance} PLN</td>
        </tr>
    `)}
</table>
```

### 5.3 Backend - Tabela balance_history

**Migracja:** `backend/database/migrations/create-balance-history.js`

```sql
CREATE TABLE IF NOT EXISTS client_balance_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    operation_type VARCHAR(50), -- 'add', 'deduct', 'payment'
    description TEXT,
    payment_id INTEGER,
    previous_balance DECIMAL(10,2),
    new_balance DECIMAL(10,2),
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id),
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

---

## 📊 Podsumowanie zadań

### Priorytet 1 (Pilne):
- [ ] Usunąć checkbox "add_to_balance" z formularza TWORZENIA płatności
- [ ] Dodać checkbox "add_to_balance" do formularza REJESTROWANIA wpłaty
- [ ] Zaktualizować backend `/payments/:id/pay-cash` dla add_to_balance

### Priorytet 2 (Ważne):
- [ ] Utworzyć Finance Dashboard (wszystkie płatności)
- [ ] Dodać statystyki finansowe
- [ ] Widok płatności w profilu klienta

### Priorytet 3 (Miłe mieć):
- [ ] Integracja systemu ratalnego z frontend
- [ ] Harmonogram rat w szczegółach płatności
- [ ] System salda prepaid z historią

---

## 🎯 Rezultat końcowy

Po wdrożeniu wszystkich zmian:

1. ✅ Logika płatności jest spójna (faktura → wpłata → saldo)
2. ✅ Dashboard Finansowy pokazuje wszystkie płatności
3. ✅ System ratalny działa i jest zintegrowany
4. ✅ Klient widzi swoje płatności w profilu
5. ✅ Admin/Finance ma pełny wgląd w finanse
6. ✅ Saldo prepaid działa poprawnie

---

**Czy zacząć od Priorytetu 1?** 🚀
