# 🎉 SYSTEM PROWIZJI - W PEŁNI ZINTEGROWANY!

## ✅ CO DZIAŁA:

### 🔄 **AUTOMATYCZNE TWORZENIE PROWIZJI**

System automatycznie tworzy prowizje przy każdej płatności completed!

**Kiedy powstają prowizje:**
1. ✅ Płatność gotówką → POST `/api/payments/:id/pay-cash`
2. ✅ Potwierdzenie płatności → POST `/api/payments/:id/confirm-paid`
3. ✅ Każda zmiana statusu na `completed`

**Dla kogo:**
- **Mecenas (lawyer)** - 15% prowizji
- **Opiekun sprawy (case_manager)** - 10% prowizji
- **Opiekun klienta (client_manager)** - 5% prowizji

---

## 🧪 JAK PRZETESTOWAĆ:

### **Test 1: Utwórz płatność i zapłać**

```javascript
// 1. Utwórz płatność dla sprawy
api.request('/payments', {
    method: 'POST',
    body: JSON.stringify({
        case_id: 1,
        client_id: 1,
        amount: 5000,
        payment_type: 'invoice',
        description: 'Test płatności z prowizjami',
        due_date: '2025-12-31'
    })
}).then(r => {
    console.log('✅ Płatność utworzona:', r);
    const paymentId = r.payment_id;
    
    // 2. Opłać płatność gotówką
    return api.request(`/payments/${paymentId}/pay-cash`, {
        method: 'POST',
        body: JSON.stringify({
            cash_receipt_number: 'KW/001/2025',
            note: 'Test prowizji',
            add_to_balance: false
        })
    });
}).then(r => {
    console.log('✅ Płatność opłacona!');
    console.log('💰 Sprawdzam prowizje...');
    
    // 3. Sprawdź czy utworzyły się prowizje
    return api.request('/commissions/v2/pending');
}).then(r => {
    console.log('🎉 PROWIZJE UTWORZONE:');
    r.commissions.forEach(c => {
        console.log(`  - ${c.employee_name}: ${c.amount} PLN (${c.rate}%)`);
    });
});
```

---

### **Test 2: Zobacz swoje prowizje**

```javascript
// Sprawdź swoje finanse (User ID: 1)
api.request('/employees/1/finances/summary').then(r => {
    console.log('💰 TWOJE FINANSE:');
    console.log('Oczekujące:', r.summary.commissions.pending_amount, 'PLN');
    console.log('Do wypłaty:', r.summary.commissions.approved_amount, 'PLN');
    console.log('Wypłacone:', r.summary.commissions.paid_amount, 'PLN');
});
```

---

### **Test 3: Zatwierdź i wypłać prowizję**

```javascript
// 1. Zobacz prowizje do wypłaty (jako Admin/Finance)
api.request('/commissions/v2/pending').then(r => {
    console.log('💳 DO WYPŁATY:');
    r.commissions.forEach(c => {
        console.log(`  ID: ${c.id}, ${c.employee_name}: ${c.amount} PLN`);
    });
    
    // 2. Wypłać prowizję (zmień ID!)
    const commissionId = r.commissions[0]?.id;
    if (commissionId) {
        return api.request(`/commissions/v2/${commissionId}/pay`, { method: 'POST' });
    }
}).then(r => {
    console.log('✅ PROWIZJA WYPŁACONA!');
    console.log('Kwota:', r.amount, 'PLN');
});
```

---

## 📊 PRZEPŁYW DANYCH:

```
PŁATNOŚĆ COMPLETED
     ↓
commission-calculator.js (automatycznie)
     ↓
Sprawdza sprawę → Pobiera:
  • assigned_to (mecenas)
  • case_manager_id (opiekun sprawy)
  • client_manager_id (opiekun klienta)
     ↓
Tworzy prowizje w employee_commissions:
  • Status: pending
  • Rate: z commission_rates (lub domyślne)
  • Amount: płatność × stawka
     ↓
Prowizje widoczne w:
  ✅ Employee Dashboard (swoje)
  ✅ Finance Dashboard (wszystkie)
  ✅ Admin Dashboard (wszystkie)
     ↓
Finance/Admin wypłaca (POST /commissions/v2/:id/pay)
     ↓
Status zmienia się: pending → approved → paid
     ↓
Tworzy się wpis w employee_payments
     ↓
Pracownik widzi wypłatę w historii
```

---

## 🔧 KONFIGURACJA STAWEK PROWIZJI:

### **Domyślne stawki:**
- Mecenas: 15%
- Opiekun sprawy: 10%
- Opiekun klienta: 5%

### **Zmiana stawki dla pracownika:**

```sql
-- Sprawdź aktualne stawki
SELECT * FROM commission_rates WHERE user_id = 1;

-- Zmień stawkę (przez HR lub Admin)
INSERT INTO commission_rates (
    user_id, role_type, rate, effective_from, is_active
) VALUES (
    1, 'lawyer', 20, DATE('now'), 1
);

-- Dezaktywuj starą stawkę
UPDATE commission_rates 
SET is_active = 0 
WHERE user_id = 1 AND role_type = 'lawyer' AND rate = 15;
```

---

## 📁 PLIKI SYSTEMU:

### **Backend:**
```
✅ backend/routes/payments.js (zmodyfikowany)
   → Automatyczne tworzenie prowizji po płatności

✅ backend/routes/employee-finances.js (nowy)
   → API dla finansów pracownika

✅ backend/routes/commissions.js (rozbudowany)
   → V2 endpoints dla employee_commissions

✅ backend/utils/commission-calculator.js (nowy)
   → Logika wyliczania i tworzenia prowizji
```

### **Frontend:**
```
✅ frontend/test-commissions.html (nowy)
   → Strona testowa z pełnym UI

✅ frontend/scripts/dashboards/admin-dashboard.js (zmodyfikowany)
   → Przycisk "💰 Test Prowizji"
```

### **Baza danych:**
```
✅ employee_commissions (tabela)
✅ employee_payments (tabela)
✅ commission_rates (już istnieje)
```

---

## 🎯 TESTOWANIE W PRZEGLĄDARCE:

### **1. Otwórz stronę testową:**
```
http://localhost:3500/test-commissions.html
```

### **2. Lub przez Admin Dashboard:**
- Zaloguj się jako Admin
- Sekcja "💰 Dashboard Finansowy"
- Kliknij "💰 Test Prowizji"

### **3. Testuj przyciski:**
- 📊 Moje Finanse
- 📋 Historia Prowizji
- 💳 Historia Wypłat
- 📊 Statystyki (Admin)
- 💰 Do Wypłaty (Admin)
- 🏆 Top 5 Zarabiających
- 💳 Wypłać Prowizję

---

## 🎉 STATUS INTEGRACJI:

### **Backend:**
- ✅ Automatyczne tworzenie prowizji
- ✅ Wyliczanie na podstawie stawek
- ✅ API dla pracowników
- ✅ API dla admin/finance
- ✅ Wypłacanie prowizji
- ✅ Historia prowizji i wypłat

### **Baza danych:**
- ✅ Tabele utworzone
- ✅ Indeksy dodane
- ✅ Testowe dane

### **Frontend:**
- ✅ Strona testowa
- ✅ Przycisk w Admin Dashboard
- ⏳ Pełna integracja w dashboardach (opcjonalnie)

---

## 💡 CO DALEJ:

### **Opcjonalne rozbudowy:**

1. **Dashboard Pracownika - Zakładka Finanse**
   - Podsumowanie prowizji
   - Historia wypłat
   - Eksport PDF

2. **Finance Dashboard - Zakładka Prowizje**
   - Lista do wypłaty
   - Masowa wypłata
   - Raporty miesięczne

3. **Powiadomienia**
   - Email przy nowej prowizji
   - Email przy wypłacie
   - Push notifications

4. **Raporty**
   - Miesięczne zestawienie prowizji
   - Top zarabiający
   - Eksport do Excel/PDF

---

## 🚀 SYSTEM GOTOWY DO UŻYCIA!

**Wszystko działa automatycznie:**
1. ✅ Płatność → Prowizje tworzone automatycznie
2. ✅ Pracownik widzi swoje prowizje
3. ✅ Finance wypłaca prowizje
4. ✅ Wypłata trafia do employee_payments
5. ✅ Pracownik widzi wypłatę w historii

**Testuj teraz:** http://localhost:3500/test-commissions.html 🎉
