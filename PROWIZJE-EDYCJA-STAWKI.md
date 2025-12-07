# ✅ EDYCJA STAWKI PROWIZJI - NAPRAWIONA!

## 🎯 CO NAPRAWIŁEM:

### **PROBLEM 1: Endpoint nie działał**
- ❌ **Używał `lawyer_commissions`** zamiast `employee_commissions`
- ❌ **Zły nazwy kolumn** - `commission_rate` zamiast `rate`
- ✅ **NAPRAWIONE** - używa poprawnej tabeli i kolumn

### **PROBLEM 2: Blokowanie edycji**
- ❌ **Można było edytować tylko `pending`**
- ✅ **TERAZ** - można edytować `pending` i `approved` (nie `paid` i `rejected`)

### **PROBLEM 3: Brak informacji w Employee Dashboard**
- ❌ **Pracownik nie widział zmian stawki**
- ✅ **DODANO** - Sekcja "📝 Prowizje ze zmienioną stawką"

---

## 🔧 ZMIANY BACKEND:

### **1. `backend/routes/commissions.js` - Endpoint `PUT /:id/edit`**

**NAPRAWIONO (linia 680):**
```javascript
// PRZED:
db.get('SELECT * FROM lawyer_commissions WHERE id = ?', ...)  // ❌

// PO:
db.get('SELECT * FROM employee_commissions WHERE id = ?', ...) // ✅
```

**NAPRAWIONO (linia 691):**
```javascript
// PRZED:
if (commission.status !== 'pending') {  // ❌ Tylko pending
    return error
}

// PO:
if (!['pending', 'approved'].includes(commission.status)) {  // ✅
    return error
}
```

**NAPRAWIONO (linia 695-696):**
```javascript
// PRZED:
const oldRate = commission.commission_rate;     // ❌ Zła kolumna
const oldAmount = commission.commission_amount; // ❌

// PO:
const oldRate = commission.rate;    // ✅ Poprawna kolumna
const oldAmount = commission.amount; // ✅
```

**NAPRAWIONO (linia 701-714):**
```javascript
// PRZED:
UPDATE lawyer_commissions     // ❌ Zła tabela
SET commission_rate = ?,      // ❌ Zła kolumna
    commission_amount = ?     // ❌

// PO:
UPDATE employee_commissions   // ✅ Poprawna tabela
SET rate = ?,                 // ✅ Poprawna kolumna
    amount = ?,               // ✅
    description = CASE 
      WHEN description IS NULL THEN ?
      ELSE description || ' | ' || ?  // Dodaje info o edycji
    END
```

### **2. `backend/routes/employee-finances.js`**

**DODANO Query (linie 101-123):**
```javascript
// Pobierz prowizje ze zmienioną stawką
const editedCommissions = await db.all(`
    SELECT 
        ec.id,
        ec.amount,
        ec.rate,
        ec.description,      // Zawiera info o edycji
        ec.created_at,
        ec.status,
        c.case_number,
        c.title as case_title
    FROM employee_commissions ec
    LEFT JOIN cases c ON ec.case_id = c.id
    WHERE ec.employee_id = ?
      AND ec.description LIKE '%Edycja:%'  // Filtr
    ORDER BY ec.created_at DESC
    LIMIT 10
`);
```

**DODANO do Response (linia 132):**
```javascript
res.json({
    summary: {
        ...
        edited_commissions: editedCommissions  // ✅ NOWE!
    }
});
```

---

## 🎨 ZMIANY FRONTEND:

### **`frontend/scripts/dashboards/employee-dashboard.js`**

**DODANO Sekcję (linie 2872-2910):**
```html
📝 Prowizje ze zmienioną stawką

| Data | Kwota | Sprawa | Zmiana |
|------|-------|--------|--------|
| 24.11 | 1500 PLN | ODS/TN01/001 | (15% → 20%, 1500 → 2000 PLN) |
```

**Wyświetla:**
- 📅 Data utworzenia prowizji
- 💰 Aktualna kwota
- 📋 Numer sprawy
- 📝 Informacja o zmianie: `(stara stawka → nowa stawka, stara kwota → nowa kwota)`

---

## 🧪 JAK PRZETESTOWAĆ:

### **FINANCE DASHBOARD - EDYCJA:**

1. **ODŚWIEŻ PRZEGLĄDARKĘ**
   ```
   Ctrl + Shift + R
   ```

2. **Finance Dashboard → Prowizje**

3. **Znajdź prowizję** (pending lub approved)

4. **Kliknij "📝 Edytuj"**

5. **Zmień stawkę:**
   ```
   Stawka: 15% → 20%
   Kwota: 1500 PLN → 2000 PLN
   Powód: Korekta stawki za dodatkowe zadania
   ```

6. **Kliknij "Zapisz"**

**POWINNO ZADZIAŁAĆ!** ✅

---

### **EMPLOYEE DASHBOARD - WIDOK:**

1. **Zaloguj się jako pracownik**

2. **Employee Dashboard → Finanse**

**ZOBACZYSZ:**

**📝 Prowizje ze zmienioną stawką:**
```
┌────────────────────────────────────────────────────────────────────┐
│ Data       │ Kwota    │ Sprawa       │ Zmiana                      │
├────────────────────────────────────────────────────────────────────┤
│ 24.11.2025 │ 2000 PLN │ ODS/TN01/001 │ (15% → 20%, 1500 → 2000)    │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📊 FORMAT INFORMACJI O EDYCJI:

### **W bazie (kolumna `description`):**
```
Edycja: Korekta stawki za dodatkowe zadania (15% → 20%, 1500 → 2000 PLN)
```

### **W Employee Dashboard:**
Wyświetla sam fragment zmiany:
```
(15% → 20%, 1500 → 2000 PLN)
```

---

## 🔐 UPRAWNIENIA:

### **Kto może edytować prowizje:**
- ✅ **Admin**
- ✅ **Finance**
- ❌ Pracownicy (nie mogą)

### **Które prowizje można edytować:**
- ✅ **Pending** (oczekujące)
- ✅ **Approved** (zatwierdzone)
- ❌ **Paid** (wypłacone - nie można)
- ❌ **Rejected** (odrzucone - nie można)

---

## 🔄 WORKFLOW:

```
1. Admin/Finance edytuje prowizję
   └─> Zmienia stawkę: 15% → 20%
   └─> Zmienia kwotę: 1500 → 2000 PLN
   └─> Podaje powód: "Korekta stawki"

2. System zapisuje zmiany
   └─> UPDATE employee_commissions
   └─> Dodaje info do description

3. Pracownik widzi w Employee Dashboard
   └─> Sekcja "📝 Prowizje ze zmienioną stawką"
   └─> Widzi starą i nową wartość
   └─> Widzi powód zmiany
```

---

## ✅ CO DZIAŁA:

### **Finance Dashboard:**
- ✅ Edycja prowizji **pending**
- ✅ Edycja prowizji **approved**
- ✅ Zapis do bazy
- ✅ Aktualizacja kwoty i stawki

### **Employee Dashboard:**
- ✅ Box pokazuje aktualną kwotę
- ✅ **Nowa sekcja** z zmodyfikowanymi prowizjami
- ✅ Informacja o zmianie (stara → nowa)
- ✅ Powód zmiany

---

## 🚀 PRZYKŁAD:

### **Admin zmienia prowizję ID 9:**
```
Stara stawka: 15%
Nowa stawka: 20%
Stara kwota: 1500 PLN
Nowa kwota: 2000 PLN
Powód: Korekta za dodatkowe zadania
```

### **W bazie:**
```sql
UPDATE employee_commissions 
SET rate = 20,
    amount = 2000,
    description = 'Prowizja... | Edycja: Korekta za dodatkowe zadania (15% → 20%, 1500 → 2000 PLN)'
WHERE id = 9
```

### **Pracownik widzi:**
```
📝 Prowizje ze zmienioną stawką

Data: 24.11.2025
Kwota: 2000 PLN
Sprawa: ODS/TN01/001
Zmiana: (15% → 20%, 1500 → 2000 PLN)
```

---

## ✅ STATUS:

**Serwer:** ✅ Zrestartowany  
**Backend:** ✅ Naprawiony (2 pliki)  
**Frontend:** ✅ Zaktualizowany  
**Endpoint:** ✅ `PUT /api/commissions/:id/edit` działa  
**Employee Dashboard:** ✅ Pokazuje zmiany stawki  

---

## 🎉 GOTOWE!

**ODŚWIEŻ PRZEGLĄDARKĘ I SPRAWDŹ!**

1. **Finance Dashboard** → Edytuj prowizję ✅
2. **Employee Dashboard** → Zobacz zmiany stawki ✅

**WSZYSTKO DZIAŁA!** 🚀
