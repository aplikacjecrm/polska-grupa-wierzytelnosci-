# ✅ SYSTEM PROWIZJI - KOMPLETNY (3 OSOBY)

## 🎯 PEŁNY SYSTEM PROWIZJI:

Dla każdej płatności system **automatycznie** tworzy prowizje dla **3 osób**:

1. 🎓 **MECENAS** (assigned_to) → **15%**
2. 📋 **OPIEKUN SPRAWY** (case_manager_id) → **10%**
3. 👥 **OPIEKUN KLIENTA** (client_manager - z tabeli clients) → **5%**

**RAZEM: 30% prowizji**

---

## 📊 PRZYKŁAD (Płatność 37):

**Płatność: 1000 PLN**

| Kto | Rola | Stawka | Kwota |
|-----|------|--------|-------|
| **Tomasz Zygmund** | Mecenas (assigned_to) | 15% | 150 PLN |
| **Grzegorz Wiatrowski** | Opiekun sprawy (case_manager_id) | 10% | 100 PLN |
| **Pro Meritum** | Opiekun klienta (client.assigned_to) | 5% | 50 PLN |
| **RAZEM** | | **30%** | **300 PLN** |

---

## 🔧 CO NAPRAWIŁEM:

### **1. Dodałem JOIN z tabelą `clients`**

**PRZED:**
```sql
SELECT c.*, 
       u1.id as lawyer_id,
       u2.id as case_manager_id
FROM cases c
LEFT JOIN users u1 ON c.assigned_to = u1.id
LEFT JOIN users u2 ON c.case_manager_id = u2.id
```

**PO:**
```sql
SELECT c.*, 
       u1.id as lawyer_id,
       u2.id as case_manager_id,
       cl.assigned_to as client_manager_id,  -- ✅ NOWE!
       u3.name as client_manager_name         -- ✅ NOWE!
FROM cases c
LEFT JOIN users u1 ON c.assigned_to = u1.id
LEFT JOIN users u2 ON c.case_manager_id = u2.id
LEFT JOIN clients cl ON c.client_id = cl.id     -- ✅ NOWE!
LEFT JOIN users u3 ON cl.assigned_to = u3.id    -- ✅ NOWE!
```

### **2. Odkmentowałem prowizję dla opiekuna klienta**

**BYŁO ZAKOMENTOWANE:**
```javascript
// if (caseData.client_manager_id && ...) {
//     const rate = 5;
//     const commissionAmount = (amount * rate) / 100;
//     // ...
// }
```

**TERAZ AKTYWNE:**
```javascript
if (caseData.client_manager_id && 
    caseData.client_manager_id !== caseData.lawyer_id && 
    caseData.client_manager_id !== caseData.case_manager_id) {
    
    const rate = await getCommissionRate(db, caseData.client_manager_id, 'client_manager') || 5;
    const commissionAmount = (amount * rate) / 100;
    
    await createCommission(db, {
        employee_id: caseData.client_manager_id,
        case_id: caseId,
        payment_id: paymentId,
        amount: commissionAmount,
        rate: rate,
        status: 'pending',
        description: `Prowizja opiekuna klienta dla sprawy ${caseData.case_number} (${rate}%)`
    });
}
```

### **3. Dodałem brakującą prowizję (dla istniejącej płatności)**

Uruchomiłem skrypt:
```bash
node backend/scripts/add-client-manager-commission.js
```

**Efekt:**
- ✅ Dodano prowizję dla Pro Meritum: 50 PLN (5%)

---

## 🚀 JAK TO DZIAŁA:

### **Przy tworzeniu płatności:**

```javascript
// 1. Utwórz płatność
POST /api/payments
{
  case_id: 29,
  amount: 1000
}

// 2. System automatycznie:
calculateAndCreateCommissions(paymentId, caseId, amount)

// 3. Tworzy 3 prowizje:
// - Mecenas (15%)
// - Opiekun sprawy (10%)
// - Opiekun klienta (5%)
```

---

## 📋 STRUKTURA DANYCH:

### **Sprawa (cases):**
```
id: 29
assigned_to: 2          (Tomasz - mecenas)
case_manager_id: 4      (Grzegorz - opiekun sprawy)
client_id: 20
```

### **Klient (clients):**
```
id: 20
first_name: "tom123"
last_name: "nowak"
assigned_to: 6          (Pro Meritum - opiekun klienta)
```

### **Prowizje (employee_commissions):**
```
1. employee_id: 2, amount: 150, rate: 15  (Tomasz)
2. employee_id: 4, amount: 100, rate: 10  (Grzegorz)
3. employee_id: 6, amount: 50,  rate: 5   (Pro Meritum)
```

---

## ⚙️ WARUNKI TWORZENIA PROWIZJI:

### **1. Mecenas (15%) - ZAWSZE**
```javascript
if (caseData.lawyer_id) {
    // Tworzy prowizję
}
```

### **2. Opiekun sprawy (10%) - JEŚLI:**
```javascript
if (caseData.case_manager_id && 
    caseData.case_manager_id !== caseData.lawyer_id) {
    // Tworzy prowizję (inny niż mecenas)
}
```

### **3. Opiekun klienta (5%) - JEŚLI:**
```javascript
if (caseData.client_manager_id && 
    caseData.client_manager_id !== caseData.lawyer_id && 
    caseData.client_manager_id !== caseData.case_manager_id) {
    // Tworzy prowizję (inny niż mecenas i opiekun sprawy)
}
```

---

## 🧪 TESTY:

### **Scenariusz 1: Wszyscy różni**
```
Mecenas: Tomasz (ID: 2)
Opiekun sprawy: Grzegorz (ID: 4)
Opiekun klienta: Pro Meritum (ID: 6)

Płatność: 1000 PLN

Prowizje:
✅ Tomasz: 150 PLN (15%)
✅ Grzegorz: 100 PLN (10%)
✅ Pro Meritum: 50 PLN (5%)
RAZEM: 300 PLN
```

### **Scenariusz 2: Mecenas = Opiekun sprawy**
```
Mecenas: Tomasz (ID: 2)
Opiekun sprawy: Tomasz (ID: 2)  ← TEN SAM
Opiekun klienta: Pro Meritum (ID: 6)

Płatność: 1000 PLN

Prowizje:
✅ Tomasz: 150 PLN (15%)  ← TYLKO RAZ
✅ Pro Meritum: 50 PLN (5%)
RAZEM: 200 PLN
```

### **Scenariusz 3: Brak opiekuna klienta**
```
Mecenas: Tomasz (ID: 2)
Opiekun sprawy: Grzegorz (ID: 4)
Opiekun klienta: NULL  ← BRAK

Płatność: 1000 PLN

Prowizje:
✅ Tomasz: 150 PLN (15%)
✅ Grzegorz: 100 PLN (10%)
RAZEM: 250 PLN
```

---

## 📊 GDZIE SĄ OPIEKUNOWIE:

### **1. Mecenas (assigned_to)**
```
Tabela: cases
Kolumna: assigned_to
Rola: lawyer
```

### **2. Opiekun sprawy (case_manager_id)**
```
Tabela: cases
Kolumna: case_manager_id
Rola: case_manager
```

### **3. Opiekun klienta (client.assigned_to)**
```
Tabela: clients
Kolumna: assigned_to
Rola: client_manager
```

---

## 🎯 PODSUMOWANIE:

**OD TERAZ system automatycznie tworzy prowizje dla 3 osób:**

1. ✅ **Mecenas** - 15%
2. ✅ **Opiekun sprawy** - 10%
3. ✅ **Opiekun klienta** - 5%

**RAZEM: 30% prowizji z każdej płatności**

**Dla Twojej płatności (ID: 37):**
- ✅ Tomasz: 150 PLN
- ✅ Grzegorz: 100 PLN
- ✅ Pro Meritum: 50 PLN
- **RAZEM: 300 PLN**

---

## 🚀 SPRAWDŹ!

**Finance Dashboard → Prowizje**

Powinieneś zobaczyć **3 prowizje** dla płatności 37! 🎉
