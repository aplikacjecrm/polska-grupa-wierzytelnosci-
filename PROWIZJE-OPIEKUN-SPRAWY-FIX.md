# ✅ PROWIZJE DLA OPIEKUNA SPRAWY - NAPRAWIONE!

## 🔍 PROBLEM:

**Utworzyłeś płatność w sprawie:**
- Mecenas: Tomasz Zygmund ✅ (prowizja utworzona)
- Opiekun klienta: Promeritum
- **Opiekun sprawy: Grzegorz Wiatrowski** ❌ (prowizja NIE utworzona)

**Prowizja była tylko dla Tomasza, a nie dla Grzegorza!**

---

## 🔍 PRZYCZYNA:

### **Problem 1: Sprawa nie miała wypełnionego `case_manager_id`**

Backend przy tworzeniu sprawy **nie zapisywał** `case_manager_id`.

**W bazie było:**
```sql
assigned_to = 2 (Tomasz)
case_manager_id = NULL  ← ❌ BRAK!
```

### **Problem 2: Frontend nie wysyłał `case_manager_id`**

Przy tworzeniu sprawy, frontend nie przekazywał `case_manager_id` do backendu.

---

## ✅ CO NAPRAWIŁEM:

### **1. Naprawiłem istniejącą sprawę (ID: 29)**

**WYKONAŁEM:**
```sql
UPDATE cases 
SET case_manager_id = 4  (Grzegorz)
WHERE id = 29
```

**UTWORZYŁEM prowizję dla Grzegorza:**
- Kwota: 100 PLN (10%)
- Status: pending
- Sprawa: ZAG/TN01/001

**TERAZ masz 2 prowizje dla płatności 37:**
1. ✅ Tomasz Zygmund - 150 PLN (15%) - mecenas
2. ✅ Grzegorz Wiatrowski - 100 PLN (10%) - opiekun sprawy

---

### **2. Naprawiłem backend - POST /api/cases**

**PRZED:**
```javascript
INSERT INTO cases (
  ..., assigned_to, additional_caretaker, ...  // ❌ BRAK case_manager_id
)
```

**PO:**
```javascript
INSERT INTO cases (
  ..., assigned_to, case_manager_id, additional_caretaker, ...  // ✅ DODANO!
)
```

### **3. Naprawiłem backend - PUT /api/cases/:id**

Teraz także endpoint UPDATE obsługuje `case_manager_id`.

---

## 📊 JAK DZIAŁA SYSTEM PROWIZJI:

### **Dla każdej płatności tworzone są prowizje:**

1. **Mecenas** (`assigned_to`) - **15%**
   ```
   Tomasz Zygmund: 1000 PLN × 15% = 150 PLN
   ```

2. **Opiekun sprawy** (`case_manager_id`) - **10%**
   ```
   Grzegorz Wiatrowski: 1000 PLN × 10% = 100 PLN
   ```

3. **Opiekun klienta** (`client_manager_id`) - **5%**
   ```
   (Jeśli kolumna zostanie dodana w przyszłości)
   ```

### **WARUNEK:**
Prowizja dla opiekuna sprawy tworzona jest **TYLKO jeśli**:
- `case_manager_id` jest wypełniony
- Jest inny niż mecenas (`assigned_to`)

---

## 🧪 JAK PRZETESTOWAĆ (NOWA SPRAWA):

### **1. Utwórz nową sprawę**
- Mecenas: Tomasz
- **Opiekun sprawy: Grzegorz** ← **WAŻNE!**

### **2. Utwórz płatność w tej sprawie**
- Kwota: np. 1000 PLN

### **3. Sprawdź Finance Dashboard → Prowizje**

**Powinieneś zobaczyć 2 prowizje:**
```
✅ Tomasz Zygmund - 150 PLN (15%) - pending
✅ Grzegorz Wiatrowski - 100 PLN (10%) - pending
```

---

## 🎯 AKTUALNA SPRAWA (ID: 29):

**Sprawdź Finance Dashboard - powinieneś zobaczyć:**

| Pracownik | Rola | Kwota | Stawka | Status |
|-----------|------|-------|--------|--------|
| Tomasz Zygmund | Mecenas | 150 PLN | 15% | pending |
| Grzegorz Wiatrowski | Opiekun sprawy | 100 PLN | 10% | pending |

---

## ⚙️ ZMIANY W KODZIE:

### **1. `backend/routes/cases.js` - POST /**

**Dodano (linia 524):**
```javascript
const { 
  ...,
  case_manager_id,  // ← NOWE!
  ...
} = req.body;
```

**Dodano (linia 553):**
```javascript
INSERT INTO cases (
  ..., assigned_to, case_manager_id, additional_caretaker, ...
)
VALUES (?, ?, ?, ?, ...)
```

### **2. `backend/routes/cases.js` - PUT /:id**

**Dodano (linia 628):**
```javascript
const { 
  ...,
  assigned_to, case_manager_id, additional_caretaker,  // ← NOWE!
  ...
} = req.body;
```

**Dodano (linia 652):**
```javascript
UPDATE cases SET
  ..., assigned_to = ?, case_manager_id = ?, additional_caretaker = ?, ...
```

### **3. `backend/scripts/fix-case-manager-and-recalculate.js`**

Skrypt do jednorazowej naprawy istniejącej sprawy.

---

## 📋 STRUKTURAPROWIZJI:

```
PŁATNOŚĆ (1000 PLN)
│
├─ MECENAS (assigned_to = 2) → 15%
│  └─ Tomasz Zygmund: 150 PLN
│
└─ OPIEKUN SPRAWY (case_manager_id = 4) → 10%
   └─ Grzegorz Wiatrowski: 100 PLN

RAZEM: 250 PLN prowizji
```

---

## ⚠️ WAŻNE:

### **Przy tworzeniu sprawy MUSISZ:**
1. ✅ Wybrać **Mecenasa** (assigned_to)
2. ✅ Wybrać **Opiekuna sprawy** (case_manager_id) ← **NOWE!**
3. ✅ (Opcjonalnie) Dodatkowy opiekun (additional_caretaker)

### **Frontend musi wysyłać:**
```javascript
POST /api/cases
{
  assigned_to: 2,           // Tomasz (mecenas)
  case_manager_id: 4,       // Grzegorz (opiekun sprawy) ← MUSI BYĆ!
  additional_caretaker: null
}
```

---

## ✅ STATUS:

**Backend:** ✅ Naprawiony (POST + PUT)  
**Istniejąca sprawa:** ✅ Naprawiona (ID: 29)  
**Prowizje:** ✅ Utworzone (Tomasz + Grzegorz)  
**Serwer:** ✅ Zrestartowany  

---

## 🚀 GOTOWE!

**OD TERAZ:**
- ✅ Przy tworzeniu sprawy można wybrać opiekuna sprawy
- ✅ System automatycznie utworzy prowizję dla opiekuna (10%)
- ✅ Prowizja dla mecenasa nadal działa (15%)

**DLA OBECNEJ SPRAWY (ID: 29):**
- ✅ **ODŚWIEŻ Finance Dashboard**
- ✅ Zobaczysz 2 prowizje (Tomasz + Grzegorz)

**SPRAWDŹ!** 🎉
