# 🏢 SYSTEM HR + FINANCE + PROWIZJE - KOMPLETNA INTEGRACJA

## 🎯 PODZIAŁ ODPOWIEDZIALNOŚCI:

```
┌─────────────────────────────────────────────────────┐
│                  🏢 SYSTEM WYNAGRODZEŃ              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  👥 DZIAŁ HR                                        │
│  ├─ Ustala stawki wynagrodzeń                      │
│  ├─ Ustala stawki prowizji                         │
│  ├─ Tworzy wnioski o zmiany stawek                 │
│  ├─ Prowadzi dokumentację pracowniczą              │
│  └─ Monitoruje wyniki pracowników                  │
│                  ↓                                   │
│             [WNIOSEK]                               │
│                  ↓                                   │
│  👔 ADMIN                                           │
│  ├─ Zatwierdza wnioski HR                          │
│  ├─ Odrzuca wnioski z powodem                      │
│  ├─ Może bezpośrednio zmieniać stawki             │
│  └─ Pełna kontrola nad systemem                    │
│                  ↓                                   │
│         [ZATWIERDZONE]                              │
│                  ↓                                   │
│  💰 DZIAŁ FINANSOWY                                 │
│  ├─ Wypłaca wynagrodzenia                          │
│  ├─ Wypłaca prowizje                               │
│  ├─ Prowadzi rozliczenia                           │
│  └─ Generuje raporty finansowe                     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 📊 TABELE BAZY DANYCH:

### 1. **employee_compensation** - Konfiguracja wynagrodzeń
```sql
CREATE TABLE employee_compensation (
    id INTEGER PRIMARY KEY,
    user_id INTEGER UNIQUE,           -- Pracownik
    base_salary DECIMAL(10,2),        -- Wynagrodzenie podstawowe
    currency VARCHAR(10),              -- Waluta (PLN)
    employment_type VARCHAR(50),       -- full_time, part_time, contract
    contract_type VARCHAR(50),         -- employment, b2b, mandate
    commission_enabled INTEGER,        -- Czy prowizje włączone
    default_commission_rate DECIMAL(5,2), -- Domyślna stawka prowizji
    bonus_eligible INTEGER,            -- Czy przysługują premie
    hr_notes TEXT,                     -- Notatki HR
    last_review_date DATE,             -- Ostatnia ocena
    next_review_date DATE,             -- Następna ocena
    created_by INTEGER,
    updated_by INTEGER,
    created_at DATETIME,
    updated_at DATETIME
)
```

### 2. **commission_rate_changes** - Historia zmian stawek prowizji
```sql
CREATE TABLE commission_rate_changes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,                   -- Pracownik
    user_role VARCHAR(50),             -- Rola (lawyer, case_manager...)
    old_rate DECIMAL(5,2),             -- Stara stawka
    new_rate DECIMAL(5,2),             -- Nowa stawka
    change_reason TEXT,                -- Powód zmiany
    comment TEXT,                      -- Komentarz
    changed_by INTEGER,                -- Kto zmienił (HR/Admin)
    changed_by_department VARCHAR(50), -- Dział (hr/admin)
    approved_by INTEGER,               -- Kto zatwierdził
    approved_at DATETIME,              -- Kiedy zatwierdzone
    status VARCHAR(20),                -- pending, approved, rejected
    effective_date DATE,               -- Data wejścia w życie
    created_at DATETIME
)
```

### 3. **salary_changes** - Historia zmian wynagrodzeń
```sql
CREATE TABLE salary_changes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    old_salary DECIMAL(10,2),
    new_salary DECIMAL(10,2),
    change_reason TEXT,
    comment TEXT,
    changed_by INTEGER,
    changed_by_department VARCHAR(50),
    approved_by INTEGER,
    approved_at DATETIME,
    status VARCHAR(20),
    effective_date DATE,
    created_at DATETIME
)
```

---

## 🔧 API ENDPOINTS:

### **GET /api/hr-compensation/employees**
Lista pracowników z aktualnymi stawkami
- **Uprawnienia:** Admin, HR, Finance
- **Response:**
```json
{
  "success": true,
  "employees": [
    {
      "id": 2,
      "name": "Jan Kowalski",
      "email": "jan@promeritum.pl",
      "user_role": "lawyer",
      "base_salary": 8000.00,
      "currency": "PLN",
      "employment_type": "full_time",
      "contract_type": "employment",
      "commission_enabled": 1,
      "default_commission_rate": 15.00,
      "bonus_eligible": 1,
      "last_review_date": "2025-01-15",
      "next_review_date": "2025-07-15",
      "hr_notes": "Bardzo dobry pracownik",
      "updated_at": "2025-11-24 19:00:00"
    }
  ],
  "count": 5
}
```

---

### **GET /api/hr-compensation/employees/:userId**
Szczegóły pracownika + historia zmian
- **Uprawnienia:** Admin, HR, Finance
- **Response:**
```json
{
  "success": true,
  "employee": { /* dane pracownika */ },
  "commissionHistory": [
    {
      "id": 1,
      "user_id": 2,
      "user_role": "lawyer",
      "old_rate": 15.00,
      "new_rate": 18.00,
      "change_reason": "Awans na seniora",
      "comment": "Doskonałe wyniki w Q4 2024",
      "changed_by": 5,
      "changed_by_name": "Maria HR",
      "changed_by_department": "hr",
      "approved_by": 1,
      "approved_by_name": "Admin",
      "approved_at": "2025-11-24 18:30:00",
      "status": "approved",
      "effective_date": "2025-12-01",
      "created_at": "2025-11-24 18:00:00"
    }
  ],
  "salaryHistory": [ /* historia wynagrodzeń */ ]
}
```

---

### **POST /api/hr-compensation/employees/:userId/commission-rate**
Zmiana stawki prowizji (HR tworzy wniosek, Admin zatwierdza od razu)
- **Uprawnienia:** Admin, HR
- **Body:**
```json
{
  "new_rate": 18.00,
  "change_reason": "Awans na seniora",
  "comment": "Doskonałe wyniki w Q4 2024. Zwiększona odpowiedzialność.",
  "effective_date": "2025-12-01"
}
```
- **Response (HR - wniosek):**
```json
{
  "success": true,
  "message": "Wniosek o zmianę stawki został wysłany do zatwierdzenia",
  "change_id": 1,
  "status": "pending",
  "old_rate": 15.00,
  "new_rate": 18.00
}
```
- **Response (Admin - zatwierdzone od razu):**
```json
{
  "success": true,
  "message": "Stawka prowizji zmieniona pomyślnie",
  "change_id": 1,
  "status": "approved",
  "old_rate": 15.00,
  "new_rate": 18.00
}
```

---

### **GET /api/hr-compensation/rate-changes/pending**
Oczekujące zmiany stawek (do zatwierdzenia)
- **Uprawnienia:** Admin
- **Response:**
```json
{
  "success": true,
  "pendingChanges": [
    {
      "id": 1,
      "user_id": 2,
      "user_name": "Jan Kowalski",
      "user_email": "jan@promeritum.pl",
      "user_role": "lawyer",
      "old_rate": 15.00,
      "new_rate": 18.00,
      "change_reason": "Awans na seniora",
      "comment": "Doskonałe wyniki w Q4 2024",
      "changed_by": 5,
      "changed_by_name": "Maria HR",
      "changed_by_department": "hr",
      "status": "pending",
      "effective_date": "2025-12-01",
      "created_at": "2025-11-24 18:00:00"
    }
  ],
  "count": 1
}
```

---

### **POST /api/hr-compensation/rate-changes/:changeId/approve**
Zatwierdzenie zmiany stawki
- **Uprawnienia:** Admin
- **Response:**
```json
{
  "success": true,
  "message": "Zmiana stawki prowizji zatwierdzona",
  "old_rate": 15.00,
  "new_rate": 18.00
}
```

---

### **POST /api/hr-compensation/rate-changes/:changeId/reject**
Odrzucenie zmiany stawki
- **Uprawnienia:** Admin
- **Body:**
```json
{
  "rejection_reason": "Brak budżetu w tym kwartale"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Zmiana stawki odrzucona"
}
```

---

## 🔄 PRZEPŁYW PRACY:

### **SCENARIUSZ 1: HR zmienia stawkę prowizji**

```
1. HR otwiera panel pracownika Jan Kowalski
   Aktualna stawka: 15%

2. HR klika "Zmień stawkę prowizji"
   Nowa stawka: 18%
   Powód: "Awans na seniora"
   Komentarz: "Doskonałe wyniki w Q4 2024. Zwiększona odpowiedzialność."
   Data wejścia: 2025-12-01
   
3. HR zapisuje → STATUS: PENDING
   
4. Admin dostaje powiadomienie o nowym wniosku
   
5. Admin otwiera "Oczekujące zmiany"
   Widzi wniosek HR z pełnym uzasadnieniem
   
6. Admin zatwierdza:
   ✅ Stawka zmieniona: 15% → 18%
   ✅ Wejdzie w życie: 2025-12-01
   ✅ Historia zapisana
   
7. Finance widzi zaktualizowaną stawkę
   Następne prowizje będą wyliczane po 18%
```

---

### **SCENARIUSZ 2: Admin zmienia stawkę bezpośrednio**

```
1. Admin otwiera panel pracownika
   
2. Admin zmienia stawkę: 15% → 20%
   Powód: "Wyjątkowe osiągnięcia"
   
3. Stawka zmieniona NATYCHMIAST
   STATUS: APPROVED (auto)
   Bez oczekiwania na zatwierdzenie
```

---

### **SCENARIUSZ 3: Finance wypłaca prowizję**

```
1. Płatność opłacona → prowizja PENDING
   
2. Finance otwiera Finance Dashboard
   Zakładka "🟡 Oczekujące prowizje"
   
3. Finance widzi:
   - Pracownik: Jan Kowalski
   - Stawka: 18% (zatwierdzona przez Admin)
   - Kwota: 1800 PLN
   
4. Finance klika [✅ Zatwierdź]
   
5. Finance klika [💰 Wypłać]
   
6. Prowizja wypłacona
   Historia zapisana
```

---

## 💡 PRZYKŁADY UŻYCIA:

### **Przykład 1: Podwyżka dla mecenasa**
```
Pracownik: Jan Kowalski (Mecenas)
Obecna stawka: 15%
Nowa stawka: 18%
Powód: Awans na seniora
Komentarz: Doskonałe wyniki, zwiększona odpowiedzialność
Data wejścia: 01.12.2025

HR tworzy wniosek → Admin zatwierdza → Stawka 18% od 01.12.2025
```

### **Przykład 2: Obniżka za słabe wyniki**
```
Pracownik: Piotr Nowak (Opiekun sprawy)
Obecna stawka: 10%
Nowa stawka: 7%
Powód: Słabe wyniki w Q3
Komentarz: Trzy skargi klientów, niezrealizowane cele
Data wejścia: 01.01.2026

HR tworzy wniosek → Admin zatwierdza → Stawka 7% od 01.01.2026
```

### **Przykład 3: Tymczasowa podwyżka**
```
Pracownik: Anna Kowalska
Obecna stawka: 10%
Nowa stawka: 15%
Powód: Zastępstwo za szefa działu
Komentarz: Podwyżka na czas urlopu szefa (3 miesiące)
Data wejścia: 01.12.2025

Po 3 miesiącach HR tworzy kolejny wniosek o powrót do 10%
```

---

## 🔐 BEZPIECZEŃSTWO I UPRAWNIENIA:

| Akcja | HR | Admin | Finance |
|-------|:--:|:-----:|:-------:|
| Przeglądanie listy pracowników | ✅ | ✅ | ✅ |
| Tworzenie wniosku o zmianę stawki | ✅ | ✅ | ❌ |
| Bezpośrednia zmiana stawki | ❌ | ✅ | ❌ |
| Zatwierdzanie wniosków | ❌ | ✅ | ❌ |
| Odrzucanie wniosków | ❌ | ✅ | ❌ |
| Wypłacanie prowizji | ❌ | ✅ | ✅ |
| Przeglądanie historii zmian | ✅ | ✅ | ✅ |

---

## 📝 HISTORIA I AUDYT:

Każda zmiana stawki zapisywana jest w tabeli `commission_rate_changes`:

```
ZMIANA #1:
- Pracownik: Jan Kowalski
- Stara stawka: 15%
- Nowa stawka: 18%
- Zmienił: Maria HR (hr@promeritum.pl)
- Zatwierdził: Admin (admin@promeritum.pl)
- Powód: Awans na seniora
- Komentarz: Doskonałe wyniki w Q4 2024
- Status: approved
- Data wejścia: 2025-12-01
- Data utworzenia: 2025-11-24 18:00:00
- Data zatwierdzenia: 2025-11-24 18:30:00
```

**PEŁNA PRZEJRZYSTOŚĆ:**
- Kto zmienił?
- Kiedy zmienił?
- Dlaczego zmienił?
- Kto zatwierdził?
- Kiedy zatwierdził?

---

## 🎯 INTEGRACJA Z SYSTEMEM PROWIZJI:

```
┌──────────────────────────────────────────────────┐
│  1. PŁATNOŚĆ OPŁACONA (10 000 PLN)              │
│     ↓                                             │
│  2. SPRAWDŹ STAWKI W employee_compensation        │
│     Jan Kowalski (lawyer): 18% ✅                │
│     ↓                                             │
│  3. OBLICZ PROWIZJĘ                              │
│     10 000 * 18% = 1 800 PLN                     │
│     ↓                                             │
│  4. UTWÓRZ PROWIZJĘ (status: PENDING)            │
│     ↓                                             │
│  5. FINANCE ZATWIERDZA                           │
│     PENDING → APPROVED                           │
│     ↓                                             │
│  6. FINANCE WYPŁACA                              │
│     APPROVED → PAID                              │
│     ↓                                             │
│  7. HISTORIA ZAPISANA                            │
│     Jan Kowalski otrzymał 1 800 PLN              │
└──────────────────────────────────────────────────┘
```

---

## ✅ PODSUMOWANIE:

**ZBUDOWANO KOMPLETNY SYSTEM:**

1. ✅ **HR** - ustala stawki, tworzy wnioski, prowadzi dokumentację
2. ✅ **Admin** - zatwierdza wnioski, pełna kontrola
3. ✅ **Finance** - wypłaca na podstawie zatwierdzonych stawek
4. ✅ **Historia zmian** - pełna przejrzystość i audyt
5. ✅ **Komentarze** - uzasadnienie każdej zmiany
6. ✅ **Zatwierdzanie** - dwustopniowa kontrola
7. ✅ **Integracja** - HR + Finance + Prowizje działają razem

**GOTOWE DO UŻYCIA!** ✅

---

**Data:** 24.11.2025, 19:30  
**Status:** ✅ PRODUCTION READY - KOMPLETNA INTEGRACJA!
