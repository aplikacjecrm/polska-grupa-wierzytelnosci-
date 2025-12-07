# 💰 FAZA 1: INTEGRACJA FINANSOWA
**Priorytet:** ⚡ NAJWYŻSZY  
**Czas:** 5-7 dni  

---

## 📋 ZADANIA DO WYKONANIA

### 1.1 Dashboard Admina - Statystyki Płatności
**Plik:** `frontend/scripts/admin-dashboard.js`

**Co dodać:**
- ✅ Box: Przychody miesiąca
- ✅ Box: Średnia płatność
- ✅ Box: Wskaźnik realizacji
- ✅ Box: Zaległości
- ✅ Wykres: Przychody 12 miesięcy
- ✅ Tabela: Top 5 klientów

**API:**
```
GET /api/admin/financial-stats
GET /api/admin/revenue-chart?period=12months
GET /api/admin/top-clients
```

---

### 1.2 Miesięczne Raporty
**Pliki:** 
- `backend/routes/reports.js`
- `backend/utils/monthly-report-cron.js`

**Tabela:**
```sql
CREATE TABLE monthly_reports (
    id INTEGER PRIMARY KEY,
    month TEXT,
    total_revenue REAL,
    total_payments INTEGER,
    completed_count INTEGER,
    pending_count INTEGER,
    overdue_count INTEGER,
    report_data TEXT,
    pdf_path TEXT,
    created_at DATETIME
);
```

**Cron:** 1. dnia miesiąca o 00:00

---

### 1.3 Automatyczne Faktury
**Plik:** `backend/utils/invoice-generator.js`

**Kiedy generować:**
1. Po potwierdzeniu płatności
2. Po upload potwierdzenia
3. Po płatności online

**Tabela:**
```sql
CREATE TABLE invoices (
    id INTEGER PRIMARY KEY,
    invoice_number TEXT UNIQUE,
    payment_id INTEGER,
    client_id INTEGER,
    seller_name TEXT,
    seller_nip TEXT,
    buyer_name TEXT,
    buyer_nip TEXT,
    net_amount REAL,
    vat_rate REAL DEFAULT 23,
    vat_amount REAL,
    gross_amount REAL,
    status TEXT DEFAULT 'issued',
    pdf_path TEXT,
    sent_to_accounting BOOLEAN DEFAULT 0,
    created_at DATETIME
);
```

---

### 1.4 Panel Klienta - Faktury
**Funkcje:**
- Lista faktur
- Podgląd PDF
- Pobieranie
- Wysyłka na email

---

### 1.5 Księgowość
**Tabela kosztów:**
```sql
CREATE TABLE expenses (
    id INTEGER PRIMARY KEY,
    expense_number TEXT,
    expense_type TEXT,
    category TEXT,
    description TEXT,
    supplier_name TEXT,
    net_amount REAL,
    vat_amount REAL,
    gross_amount REAL,
    payment_date DATE,
    invoice_file TEXT,
    added_by INTEGER,
    created_at DATETIME
);
```

**Dashboard:**
- Przychody vs Koszty
- Wykres
- Dodawanie kosztów
- Eksport JPK

---

## 🚀 KOLEJNOŚĆ IMPLEMENTACJI

1. **Dzień 1-2:** Dashboard admina + API statystyk
2. **Dzień 3:** Generator faktur + PDF
3. **Dzień 4:** Panel klienta faktury
4. **Dzień 5:** Księgowość + koszty
5. **Dzień 6:** Miesięczne raporty + cron
6. **Dzień 7:** Testy + poprawki
