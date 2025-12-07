# 💰 SYSTEM PROWIZJI - Dokumentacja

## 📋 Przegląd systemu

System prowizji automatycznie oblicza i przypisuje prowizje dla mecenasów i opiekunów na podstawie płatności od klientów.

---

## 🎯 Jak działa?

### **1. Płatność od klienta**
Gdy klient dokonuje płatności za usługę prawną:
- Mechanik wystawia płatność w systemie
- Płatność przypisana jest do sprawy i klienta

### **2. Automatyczne wyliczenie prowizji**
System automatycznie rozpoznaje:
- **Mecenasa** (assigned_to w sprawie) → **15% prowizji**
- **Opiekuna sprawy** (case_manager_id) → **10% prowizji**
- **Opiekuna klienta** (client_manager_id) → **5% prowizji**

### **3. Widoczność prowizji**
- **Finance** - widzi wszystkie prowizje, może je wypłacać
- **HR** - widzi wszystkie prowizje (tylko podgląd)
- **Pracownik** - widzi tylko swoje prowizje

---

## 🗂️ Struktura bazy danych

### **Tabela: `commission_rates`** (Stawki prowizji)
```sql
- id: INTEGER PRIMARY KEY
- user_id: INTEGER (0 = domyślna stawka dla wszystkich)
- role: TEXT (lawyer, case_manager, client_manager)
- commission_type: TEXT (percentage, fixed)
- commission_value: REAL (15.0 = 15%)
- applies_to: TEXT (all, specific_cases)
- min_amount: REAL (opcjonalne minimum)
- max_amount: REAL (opcjonalne maximum)
- is_active: BOOLEAN
- notes: TEXT
```

### **Tabela: `lawyer_commissions`** (Wyliczone prowizje)
```sql
- id: INTEGER PRIMARY KEY
- payment_id: INTEGER (powiązana płatność)
- case_id: INTEGER (sprawa)
- client_id: INTEGER (klient)
- user_id: INTEGER (kto dostaje prowizję)
- user_role: TEXT (lawyer, case_manager, client_manager)
- payment_amount: REAL (kwota płatności)
- commission_rate: REAL (% stawka)
- commission_amount: REAL (kwota prowizji)
- commission_type: TEXT (percentage/fixed)
- status: TEXT (pending, paid)
- paid_at: DATETIME
- paid_by: INTEGER
- payment_method: TEXT (bank_transfer, cash, etc.)
- notes: TEXT
```

---

## 🔌 API Endpoints

### **GET `/api/commissions/stats`**
Statystyki prowizji (wszystkie lub tylko swoje)
```json
{
  "success": true,
  "stats": {
    "total_commissions": 45,
    "pending_count": 12,
    "paid_count": 33,
    "pending_amount": 4500.00,
    "paid_amount": 15200.00,
    "total_amount": 19700.00
  },
  "canViewAll": true
}
```

### **GET `/api/commissions/pending`**
Lista prowizji do wypłaty
```json
{
  "success": true,
  "commissions": [
    {
      "id": 1,
      "user_name": "Jan Kowalski",
      "user_role": "lawyer",
      "payment_code": "PAY/CYW/JK/001/001",
      "payment_amount": 5000.00,
      "commission_amount": 750.00,
      "commission_rate": 15.0,
      "case_number": "CYW/JK/001/2024",
      "case_title": "Sprawa cywilna...",
      "client_name": "Anna Nowak",
      "created_at": "2024-01-15T10:30:00"
    }
  ],
  "count": 12
}
```

### **GET `/api/commissions/user/:userId`**
Prowizje konkretnego użytkownika
```json
{
  "success": true,
  "commissions": [...],
  "stats": {
    "total_commissions": 15,
    "pending_amount": 1200.00,
    "paid_amount": 5400.00,
    "total_amount": 6600.00
  }
}
```

### **POST `/api/commissions/calculate`**
Przelicz prowizje dla płatności
```json
// Request:
{
  "paymentId": 123
}

// Response:
{
  "success": true,
  "message": "Utworzono 3 prowizji",
  "commissions": [
    { "role": "lawyer", "user_id": 5, "amount": 750.00 },
    { "role": "case_manager", "user_id": 7, "amount": 500.00 },
    { "role": "client_manager", "user_id": 9, "amount": 250.00 }
  ]
}
```

### **POST `/api/commissions/:id/pay`**
Wypłać prowizję (tylko Finance/Admin)
```json
// Request:
{
  "payment_method": "bank_transfer",
  "notes": "Przelew 15.01.2024"
}

// Response:
{
  "success": true,
  "message": "Prowizja została wypłacona"
}
```

---

## 💼 Przykład działania

### **Scenariusz:**
1. **Klient** Anna Nowak płaci 5000 zł za usługę
2. **Sprawa** prowadzona przez:
   - Mecenas: Jan Kowalski
   - Opiekun sprawy: Piotr Wiśniewski
3. **Klient** ma przypisanego opiekuna: Maria Lewandowska

### **System automatycznie tworzy prowizje:**
```
✅ Jan Kowalski (lawyer) → 750 zł (15% z 5000 zł)
✅ Piotr Wiśniewski (case_manager) → 500 zł (10% z 5000 zł)
✅ Maria Lewandowska (client_manager) → 250 zł (5% z 5000 zł)
```

### **Suma prowizji:** 1500 zł (30% całości)
### **Pozostaje dla kancelarii:** 3500 zł (70%)

---

## 🎨 Integracja z Finance Dashboard

Finance Dashboard będzie miał nową zakładkę **"💰 Prowizje"** gdzie:

### **Widok główny:**
- 📊 **Statystyki:**
  - Do wypłaty: 4,500 zł (12 prowizji)
  - Wypłacone: 15,200 zł (33 prowizje)
  - Łącznie: 19,700 zł

### **Lista prowizji:**
```
┌────────────────────────────────────────────────────────────────┐
│ Pracownik          │ Rola     │ Kwota    │ Płatność │ Status  │
├────────────────────────────────────────────────────────────────┤
│ Jan Kowalski      │ Mecenas  │ 750 zł   │ PAY/...  │ ⏳ Czeka│
│ Piotr Wiśniewski  │ Opiekun  │ 500 zł   │ PAY/...  │ ⏳ Czeka│
│ Maria Lewandowska │ Opiekun  │ 250 zł   │ PAY/...  │ ⏳ Czeka│
└────────────────────────────────────────────────────────────────┘
```

### **Akcje:**
- 💸 **Wypłać prowizję** - oznacz jako wypłaconą
- 👁️ **Szczegóły** - zobacz pełne info o prowizji
- 📊 **Pokaż historię** - wszystkie prowizje pracownika

---

## ⚙️ Konfiguracja stawek

### **Domyślne stawki** (user_id = 0):
- Mecenas: 15%
- Opiekun sprawy: 10%
- Opiekun klienta: 5%

### **Indywidualne stawki:**
Można ustawić osobne stawki dla konkretnego pracownika:
```sql
INSERT INTO commission_rates 
(user_id, role, commission_type, commission_value, notes)
VALUES 
(123, 'lawyer', 'percentage', 20.0, 'Wyższa stawka dla seniora');
```

---

## 🔒 Uprawnienia

| Rola | Może zobaczyć | Może wypłacić | Może edytować stawki |
|------|---------------|---------------|----------------------|
| **Admin** | ✅ Wszystkie | ✅ Tak | ✅ Tak |
| **Finance** | ✅ Wszystkie | ✅ Tak | ❌ Nie |
| **HR** | ✅ Wszystkie | ❌ Nie | ❌ Nie |
| **Lawyer** | ✅ Tylko swoje | ❌ Nie | ❌ Nie |
| **Manager** | ✅ Tylko swoje | ❌ Nie | ❌ Nie |

---

## 📝 TODO - Przyszłe rozszerzenia

1. **Automatyczne wyliczanie przy tworzeniu płatności**
   - Hook w `/api/payments` → automatyczne `POST /api/commissions/calculate`

2. **Eksport do Excel**
   - Raport prowizji miesięcznych
   - Historia prowizji pracownika

3. **Powiadomienia**
   - Email do pracownika gdy prowizja zostanie wypłacona
   - Przypomnienie dla Finance o zaległych prowizjach

4. **Dashboard pracownika**
   - Zakładka "Moje prowizje" w Employee Dashboard
   - Wykres prowizji w czasie

5. **Progresywne stawki**
   - Wyższa prowizja przy większych kwotach
   - Bonusy za osiągnięcia miesięczne

---

**Utworzono:** 2025-11-23 22:20  
**Wersja:** 1.0  
**Status:** ✅ System działający, integracja z Finance Dashboard w toku
