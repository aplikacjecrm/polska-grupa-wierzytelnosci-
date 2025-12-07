# 🔗 INTEGRACJA PROWIZJI I WYPŁAT - KOMPLEKSOWY PLAN

**Cel:** Połączyć prowizje i wypłaty w 3 dashboardach: Pracownik, Finanse, HR

---

## 📊 STRUKTURA DANYCH

### Już istnieje w bazie:
```sql
-- Prowizje pracowników
employee_commissions (
    id, employee_id, case_id, amount, rate, 
    status (pending, approved, paid), 
    approved_at, paid_at
)

-- Wypłaty pracowników  
employee_payments (
    id, employee_id, amount, payment_type,
    payment_date, status, description
)

-- Koszty pracowników
employee_expenses (
    id, employee_id, amount, status,
    expense_category, expense_date
)
```

---

## 🎯 DASHBOARD PRACOWNIKA - SEKCJA FINANSE

### Widok dla pracownika:
```
┌──────────────────────────────────────────────────────────┐
│ 💰 MOJE FINANSE                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ PROWIZJE - LISTOPAD 2025                                │
│ ┌────────────────────┬────────────────────┐             │
│ │ Do wypłaty         │ Wypłacone          │             │
│ │ 1,500.00 PLN       │ 3,000.00 PLN       │             │
│ └────────────────────┴────────────────────┘             │
│                                                          │
│ SZCZEGÓŁY PROWIZJI:                                     │
│ • ODS/TN01/001 - 1,500 PLN [15%] ⏳ Oczekuje            │
│ • DLU/TS01/002 - 1,500 PLN [15%] ✅ Wypłacone          │
│                                                          │
│ WYPŁATY (ostatnie 3 miesiące):                          │
│ • 30.10.2025 - Prowizje - 3,000 PLN                     │
│ • 30.09.2025 - Prowizje - 2,500 PLN                     │
│ • 31.08.2025 - Prowizje - 2,200 PLN                     │
│                                                          │
│ [📊 Historia] [📄 Wygeneruj raport PDF]                 │
└──────────────────────────────────────────────────────────┘
```

### Nowe API endpoints dla pracownika:
```javascript
GET /api/employees/:userId/finances/summary
   → Podsumowanie finansów pracownika
   → Prowizje (pending, approved, paid)
   → Wypłaty (ostatnie 6 miesięcy)
   → Koszty do rozliczenia

GET /api/employees/:userId/commissions/history
   → Historia prowizji (wszystkie sprawy)
   → Filtry: status, data, kwota

GET /api/employees/:userId/payments/history  
   → Historia wypłat
   → Filtry: data, typ płatności

GET /api/employees/:userId/finances/report?month=2025-11
   → Raport finansowy za miesiąc (PDF)
```

---

## 💼 DASHBOARD FINANSOWY - SEKCJA PROWIZJE

### Widok dla finance/admin:
```
┌──────────────────────────────────────────────────────────┐
│ 💰 PROWIZJE PRACOWNIKÓW                                  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ STATYSTYKI - LISTOPAD 2025:                             │
│ ┌──────────┬──────────┬──────────┬──────────┐           │
│ │ Oczekują │ Zatw.    │ Do wyp.  │ Wypłac.  │           │
│ │ 4,500    │ 3,000    │ 3,000    │ 12,000   │           │
│ └──────────┴──────────┴──────────┴──────────┘           │
│                                                          │
│ LISTA PROWIZJI DO WYPŁATY:                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Pracownik    │ Sprawa      │ Kwota  │ Akcja        │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Jan Kowalski │ ODS/TN01    │ 1,500  │ [💳 Wypłać]  │ │
│ │ Anna Nowak   │ DLU/TS02    │ 1,500  │ [💳 Wypłać]  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ TOP 5 ZARABIAJĄCYCH (miesiąc):                          │
│ 1. Jan Kowalski - 4,500 PLN (3 sprawy)                 │
│ 2. Anna Nowak - 3,500 PLN (2 sprawy)                   │
│                                                          │
│ [📊 Raport miesięczny] [📥 Eksport Excel]               │
└──────────────────────────────────────────────────────────┘
```

### Nowe sekcje w Finance Dashboard:
```javascript
// frontend/scripts/finance-dashboard.js

renderCommissionsSection() {
    // Sekcja prowizji w Finance Dashboard
    // - Statystyki (pending, approved, to_pay, paid)
    // - Lista prowizji do wypłaty
    // - Przycisk "Wypłać" (zmienia status na paid)
    // - Top 5 zarabiających
}

async payCommission(commissionId) {
    // Wypłać prowizję
    // POST /api/commissions/:id/pay
    // Utworzy wpis w employee_payments
}
```

### API endpoints dla finansów:
```javascript
GET /api/admin/commissions/stats
   → Statystyki prowizji (wszystkich)
   → Grupowane po statusie

GET /api/admin/commissions/pending
   → Lista prowizji do wypłaty
   → Sorted by date

POST /api/commissions/:id/pay
   → Wypłać prowizję (zmień status)
   → Utwórz employee_payment

GET /api/admin/commissions/top-earners?month=2025-11
   → Top 5 zarabiających w miesiącu
```

---

## 👥 HR DASHBOARD - ZARZĄDZANIE PROWIZJAMI

### Widok dla HR:
```
┌──────────────────────────────────────────────────────────┐
│ 💼 PROWIZJE I WYNAGRODZENIA                              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ PRACOWNICY I ICH STAWKI:                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Pracownik    │ Rola      │ Stawka │ Akcja          │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Jan Kowalski │ Mecenas   │ 15%    │ [✏️ Zmień]     │ │
│ │ Anna Nowak   │ Mecenas   │ 15%    │ [✏️ Zmień]     │ │
│ │ Tomasz S.    │ Opiekun   │ 10%    │ [✏️ Zmień]     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ WNIOSKI O ZMIANĘ STAWEK:                                │
│ • Jan Kowalski: 15% → 20% ⏳ Oczekuje na zatwierdzenie │
│   [✅ Zatwierdź] [❌ Odrzuć]                             │
│                                                          │
│ HISTORIA WYPŁAT (ostatni miesiąc):                      │
│ • 30.10.2025 - Jan Kowalski - 3,000 PLN (prowizje)     │
│ • 30.10.2025 - Anna Nowak - 2,500 PLN (prowizje)       │
│                                                          │
│ [➕ Dodaj pracownika] [📊 Raport płac] [📥 Eksport]     │
└──────────────────────────────────────────────────────────┘
```

### Funkcje HR:
```javascript
// HR może:
1. Przeglądać prowizje wszystkich pracowników
2. Tworzyć wnioski o zmianę stawek prowizji
3. Generować raporty płacowe
4. Eksportować dane do Excel/PDF
5. Widzieć historię wszystkich wypłat

// HR NIE MOŻE:
- Wypłacać prowizji (tylko Finance/Admin)
- Zatwierdzać własnych wniosków (tylko Admin)
```

---

## 🔄 PRZEPŁYW DANYCH

### 1. POWSTANIE PROWIZJI:
```
Sprawa zmienia status → "completed" / "won"
   ↓
Backend automatycznie liczy prowizje
   ↓
Tworzy wpisy w employee_commissions
   ↓
Status: "pending" (oczekuje na zatwierdzenie)
```

### 2. ZATWIERDZENIE PROWIZJI:
```
Admin/Finance klika "Zatwierdź"
   ↓
Status zmienia się: "pending" → "approved"
   ↓
approved_by = admin_user_id
approved_at = CURRENT_TIMESTAMP
   ↓
Powiadomienie do pracownika
```

### 3. WYPŁATA PROWIZJI:
```
Finance klika "Wypłać"
   ↓
Status zmienia się: "approved" → "paid"
   ↓
Tworzy employee_payment (typ: "commission")
   ↓
paid_at = CURRENT_TIMESTAMP
   ↓
Powiadomienie do pracownika + email
```

---

## 📊 RAPORTY

### Raport dla pracownika (PDF):
```
RAPORT FINANSOWY - JAN KOWALSKI
Miesiąc: Listopad 2025

PROWIZJE:
┌────────────┬─────────┬─────────┬──────────┐
│ Sprawa     │ Kwota   │ Stawka  │ Status   │
├────────────┼─────────┼─────────┼──────────┤
│ ODS/TN01   │ 1,500   │ 15%     │ Oczekuje │
│ DLU/TS02   │ 1,500   │ 15%     │ Wypłac.  │
├────────────┼─────────┼─────────┼──────────┤
│ RAZEM      │ 3,000   │         │          │
└────────────┴─────────┴─────────┴──────────┘

WYPŁATY:
• 30.10.2025 - Prowizje - 3,000 PLN
• 30.09.2025 - Prowizje - 2,500 PLN

PODSUMOWANIE:
• Zarobione w miesiącu: 3,000 PLN
• Do wypłaty: 1,500 PLN
• Liczba spraw: 2
```

### Raport dla Finance/Admin:
```
RAPORT PROWIZJI - LISTOPAD 2025

STATYSTYKI:
• Całkowite prowizje: 15,000 PLN
• Wypłacone: 12,000 PLN
• Do wypłaty: 3,000 PLN
• Liczba pracowników: 8

TOP 5 ZARABIAJĄCYCH:
1. Jan Kowalski - 4,500 PLN
2. Anna Nowak - 3,500 PLN
...

SZCZEGÓŁY PO PRACOWNIKACH:
[Tabela z prowizjami każdego pracownika]
```

---

## 🚀 IMPLEMENTACJA - FAZY

### FAZA 1: Dashboard Pracownika (2 dni)
1. ✅ API endpoints dla finansów pracownika
2. ✅ Sekcja "Moje Finanse" w employee-dashboard.js
3. ✅ Lista prowizji (pending, paid)
4. ✅ Lista wypłat (historia)
5. ✅ Generator raportu PDF

### FAZA 2: Finance Dashboard (2 dni)
1. ✅ Sekcja "Prowizje" w finance-dashboard.js
2. ✅ Statystyki prowizji
3. ✅ Lista do wypłaty + przycisk "Wypłać"
4. ✅ Top 5 zarabiających
5. ✅ Raport miesięczny

### FAZA 3: HR Dashboard (1 dzień)
1. ✅ Sekcja zarządzania stawkami
2. ✅ Wnioski o zmianę stawek
3. ✅ Historia wypłat wszystkich
4. ✅ Eksport do Excel

### FAZA 4: Powiadomienia (1 dzień)
1. ✅ Email przy zatwierdzeniu prowizji
2. ✅ Email przy wypłacie
3. ✅ Push notifications w aplikacji
4. ✅ Historia powiadomień

---

## 📁 PLIKI DO MODYFIKACJI

```
BACKEND:
✅ backend/routes/admin.js (już istnieje - rozbudować)
✅ backend/routes/employees.js (rozbudować o finances)
✅ backend/routes/commissions.js (już istnieje - uzupełnić)
✅ backend/routes/hr-compensation.js (już istnieje)
🆕 backend/utils/commission-calculator.js (nowy)
🆕 backend/utils/pdf-generator-employee.js (nowy)

FRONTEND:
✅ frontend/scripts/dashboards/employee-dashboard.js (rozbudować)
✅ frontend/scripts/finance-dashboard.js (dodać sekcję)
🆕 frontend/scripts/dashboards/hr-dashboard.js (nowy lub rozbudować employee-dashboard)
```

---

## ✅ CHECKLIST IMPLEMENTACJI

### Dashboard Pracownika:
- [ ] API /employees/:id/finances/summary
- [ ] API /employees/:id/commissions/history
- [ ] API /employees/:id/payments/history
- [ ] Frontend: sekcja "Moje Finanse"
- [ ] Frontend: lista prowizji z statusami
- [ ] Frontend: historia wypłat
- [ ] PDF: raport miesięczny pracownika

### Finance Dashboard:
- [ ] API /admin/commissions/stats
- [ ] API /admin/commissions/pending
- [ ] API /commissions/:id/pay
- [ ] API /admin/commissions/top-earners
- [ ] Frontend: sekcja "Prowizje"
- [ ] Frontend: lista do wypłaty
- [ ] Frontend: przycisk "Wypłać"
- [ ] Frontend: top 5 zarabiających

### HR Dashboard:
- [ ] API /hr-compensation/employees (już istnieje)
- [ ] API /hr-compensation/rate-changes (już istnieje)
- [ ] Frontend: lista pracowników + stawki
- [ ] Frontend: wnioski o zmianę
- [ ] Frontend: historia wypłat

### Powiadomienia:
- [ ] Email: prowizja zatwierdzona
- [ ] Email: prowizja wypłacona
- [ ] Push: powiadomienie w aplikacji
- [ ] Historia powiadomień

---

## 🎯 GOTOWY DO STARTU?

Wszystko zaplanowane! Powiedz czy:
1. ✅ Zaczynamy od Dashboard Pracownika?
2. ✅ Najpierw Finance Dashboard?
3. ✅ A może wszystko naraz (kompleksowo)?

**Jestem gotowy implementować!** 🚀
