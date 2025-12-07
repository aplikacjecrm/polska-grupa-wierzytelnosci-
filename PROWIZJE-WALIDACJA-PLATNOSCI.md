# ✅ PROWIZJE - WALIDACJA PŁATNOŚCI OD KLIENTA

## 🎯 CO ZMIENIŁEM:

**Prowizje można wypłacić TYLKO gdy klient opłaci usługę!**

System teraz sprawdza **status płatności** przed wypłatą prowizji pracownikowi.

---

## 🔒 WALIDACJA:

### **Backend - Warunki wypłaty prowizji:**

1. ✅ Prowizja musi być **zatwierdzona** (status: `approved`)
2. ✅ Prowizja musi mieć **przypisaną płatność** (`payment_id`)
3. ✅ **Płatność od klienta** musi być **opłacona** (status: `completed`)

### **Jeśli płatność NIE jest opłacona:**
```json
{
  "error": "Płatność nie została opłacona przez klienta",
  "message": "Płatność PAY-123 ma status: pending. Prowizję można wypłacić tylko gdy klient opłaci usługę (status: completed).",
  "payment_status": "pending"
}
```

---

## 💡 JAK TO DZIAŁA:

### **1. Klient płaci za usługę:**
```
Payment ID: 35
Status: pending → completed ✅
```

### **2. System tworzy prowizję:**
```
Commission ID: 41
Payment ID: 35
Status: pending
```

### **3. Finance zatwierdza:**
```
Commission ID: 41
Status: pending → approved
Payment Status: completed ✅
```

### **4. Finance wypłaca:**
```
✅ SPRAWDZENIE: Payment ID 35 ma status "completed"
✅ SUKCES: Prowizja wypłacona!
Commission Status: approved → paid
```

---

## 🚫 BLOKADA WYPŁATY:

### **Jeśli płatność NIE opłacona:**

**Backend zwróci błąd:**
```json
HTTP 400 Bad Request
{
  "error": "Płatność nie została opłacona przez klienta",
  "message": "...",
  "payment_status": "pending"
}
```

**Frontend pokaże:**
```
🔒 Przycisk "Wypłać" - ZABLOKOWANY (szary)
⚠️ Status płatności: pending
```

**Tooltip:**
```
"Płatność od klienta nie jest opłacona (status: pending).
Prowizję można wypłacić tylko gdy klient opłaci usługę."
```

---

## 📊 STATUSY PŁATNOŚCI:

| Status | Opis | Czy można wypłacić prowizję? |
|--------|------|------------------------------|
| **pending** | Oczekuje na płatność | ❌ NIE |
| **completed** | Opłacona przez klienta | ✅ TAK |
| **failed** | Płatność nieudana | ❌ NIE |
| **cancelled** | Anulowana | ❌ NIE |

---

## 🎨 FRONTEND:

### **Zatwierdzone prowizje (approved):**

**Jeśli płatność OPŁACONA:**
```
[💰 Wypłać] ← Przycisk aktywny (fioletowy)
```

**Jeśli płatność NIEOPŁACONA:**
```
[🔒 Płatność nieopłacona] ← Przycisk zablokowany (szary)
⚠️ Status płatności: pending
```

---

## 🔧 ZMIANY TECHNICZNE:

### **Backend - `/api/commissions/v2/:id/pay`**

**PRZED:**
```javascript
// Tylko sprawdzał status prowizji
if (commission.status !== 'approved') {
  return error
}
// Wypłacał bez sprawdzania płatności ❌
```

**PO:**
```javascript
// 1. Sprawdź status prowizji
if (commission.status !== 'approved') {
  return error
}

// 2. Sprawdź czy ma płatność
if (!commission.payment_id) {
  return error 'Brak płatności'
}

// 3. Sprawdź czy płatność opłacona ✅
if (commission.payment_status !== 'completed') {
  return error 'Płatność nieopłacona'
}

// Dopiero teraz wypłać
```

### **Backend - `/api/commissions/v2/pending`**

**Dodano kolumnę:**
```sql
SELECT 
  ...,
  p.status as payment_status  -- ✅ NOWE!
FROM employee_commissions ec
LEFT JOIN payments p ON ec.payment_id = p.id
```

### **Frontend - `finance-dashboard.js`**

**Dodano walidację przycisku:**
```javascript
if (comm.status === 'approved') {
  const paymentPaid = comm.payment_status === 'completed';
  
  if (paymentPaid) {
    // Pokaż przycisk "Wypłać" ✅
  } else {
    // Pokaż przycisk zablokowany ❌
    // + komunikat o statusie płatności
  }
}
```

---

## 🧪 JAK PRZETESTOWAĆ:

### **1. ODŚWIEŻ PRZEGLĄDARKĘ**
```
Ctrl + Shift + R
```

### **2. Finance Dashboard → Prowizje**

### **3. Znajdź prowizję ze statusem "approved"**

### **4. Sprawdź przycisk:**

**Jeśli płatność opłacona:**
- ✅ Przycisk "💰 Wypłać" - aktywny

**Jeśli płatność NIEopłacona:**
- 🔒 Przycisk "Płatność nieopłacona" - zablokowany
- ⚠️ Status płatności: pending

### **5. Spróbuj wypłacić:**

**Jeśli płatność opłacona:**
```
✅ Prowizja wypłacona!
```

**Jeśli płatność NIEopłacona:**
```
❌ Błąd: Płatność nie została opłacona przez klienta
```

---

## 📋 WORKFLOW:

```
1. Klient dostaje fakturę
   └─> Payment: pending

2. Klient płaci
   └─> Payment: completed ✅

3. System tworzy prowizję
   └─> Commission: pending

4. Finance zatwierdza prowizję
   └─> Commission: approved
   └─> Sprawdzenie: payment_status = completed ✅

5. Finance wypłaca prowizję
   └─> Sprawdzenie: czy płatność opłacona? ✅
   └─> Commission: paid
   └─> Employee Payment: utworzona
```

---

## ⚠️ WAŻNE UWAGI:

### **1. Kolejność ma znaczenie:**
```
NAJPIERW: Klient płaci (payment = completed)
POTEM:    Można wypłacić prowizję
```

### **2. Prowizje bez płatności:**
Jeśli prowizja nie ma `payment_id` → **nie można wypłacić**

### **3. Zmiana statusu płatności:**
Jeśli płatność była `completed` i została zmieniona na `pending` → **blokada wypłaty**

### **4. Frontend + Backend:**
- **Frontend** - blokuje przycisk (UI)
- **Backend** - sprawdza status (bezpieczeństwo)

---

## ✅ STATUS:

**Serwer:** ✅ Zrestartowany  
**Walidacja:** ✅ Dodana (backend + frontend)  
**Kolumna:** ✅ payment_status w API  
**Przycisk:** ✅ Blokowanie w UI  

---

## 🎯 PODSUMOWANIE:

**TERAZ:**
- ✅ Prowizje wypłacane **TYLKO** gdy klient opłaci
- ✅ Przycisk zablokowany jeśli płatność nieopłacona
- ✅ Komunikat o statusie płatności
- ✅ Walidacja w backend + frontend

**POPRZEDNIO:**
- ❌ Można było wypłacić prowizję bez płatności
- ❌ Brak sprawdzania statusu płatności

---

## 🚀 GOTOWE!

**ODŚWIEŻ PRZEGLĄDARKĘ I SPRAWDŹ!**

Przyciski "Wypłać" będą teraz blokowane jeśli klient nie opłacił usługi! 🎉
