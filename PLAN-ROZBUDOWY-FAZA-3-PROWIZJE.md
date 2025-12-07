# 💵 FAZA 3: PROWIZJE I DASHBOARD PRACOWNIKA
**Priorytet:** ⚡ WYSOKI  
**Czas:** 3-4 dni  

---

## 📋 ZADANIA DO WYKONANIA

### 3.1 Integracja Prowizji z Dashboard Pracownika

**Obecna tabela:** `employee_commissions` (już istnieje)

**Nowa sekcja w Employee Dashboard:**
```
┌────────────────────────────────────────────┐
│ 💰 MOJE PROWIZJE - LISTOPAD 2025          │
├────────────────────────────────────────────┤
│ ZAROBIONE:     4,500 PLN                  │
│ WYPŁACONE:     3,000 PLN                  │
│ DO WYPŁATY:    1,500 PLN                  │
│                                            │
│ SZCZEGÓŁY:                                 │
│ • ODS/TN01: 1,500 PLN ✅ Wypłacone        │
│ • DLU/TS01: 1,500 PLN ⏳ Oczekująca       │
│                                            │
│ [📊 Historia] [📄 Raport PDF]             │
└────────────────────────────────────────────┘
```

**API:**
```
GET /api/employees/:id/commissions
GET /api/employees/:id/commission-history
GET /api/employees/:id/commission-summary?month=2025-11
POST /api/employees/:id/commission-report (generuje PDF)
```

---

### 3.2 Rozliczanie Kosztów Pracowników

**Nowa tabela:**
```sql
CREATE TABLE employee_expenses (
    id INTEGER PRIMARY KEY,
    employee_id INTEGER REFERENCES users(id),
    
    -- Typ kosztu
    expense_category TEXT, -- travel, materials, representation, other
    
    -- Dane
    description TEXT,
    amount REAL,
    currency TEXT DEFAULT 'PLN',
    expense_date DATE,
    
    -- Dokumenty
    receipt_file TEXT,
    
    -- Status
    status TEXT DEFAULT 'pending', -- pending, approved, rejected, paid
    approved_by INTEGER REFERENCES users(id),
    approved_at DATETIME,
    rejection_reason TEXT,
    paid_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Widok:**
```
┌────────────────────────────────────────────┐
│ 💸 KOSZTY DO ROZLICZENIA                   │
├────────────────────────────────────────────┤
│                                            │
│ DO ZATWIERDZENIA: 250 PLN                 │
│                                            │
│ • 24.11 - Dojazd do klienta: 100 PLN      │
│   Status: ⏳ Oczekuje                      │
│   [📄 Paragon] [✏️ Edytuj] [🗑️ Usuń]     │
│                                            │
│ • 20.11 - Zakup materiałów: 150 PLN       │
│   Status: ✅ Zatwierdzone                 │
│                                            │
│ [➕ Dodaj koszt] [📊 Historia]             │
└────────────────────────────────────────────┘
```

**Kategorie kosztów:**
- 🚗 Dojazd (delegacje)
- 📚 Materiały biurowe
- ☕ Wydatki reprezentacyjne
- 📱 Telefon służbowy
- 💻 Sprzęt IT
- 📄 Inne

**Proces zatwierdzania:**
1. Pracownik dodaje koszt + paragon
2. Przełożony/Admin zatwierdza
3. Finance przelewa zwrot
4. Koszt trafia do księgowości

---

### 3.3 Zintegrowany Dashboard Pracownika

**Główne sekcje:**
```
┌────────────────────────────────────────────────────┐
│ 👤 DASHBOARD - Jan Kowalski                       │
├────────────────────────────────────────────────────┤
│                                                    │
│ 📊 DZISIAJ (24.11.2025)                           │
│ ├─ Zalogowano: 08:30 (7h 45min)                  │
│ ├─ Sprawy do załatwienia: 5                       │
│ └─ Zadania pilne: 3                               │
│                                                    │
│ 💰 FINANSE                                         │
│ ├─ Prowizje do wypłaty: 1,500 PLN                │
│ └─ Koszty do rozliczenia: 250 PLN                │
│                                                    │
│ 🏖️ URLOPY                                          │
│ ├─ Pozostało: 12 dni                              │
│ └─ Wnioski oczekujące: 1                          │
│                                                    │
│ 📚 ROZWÓJ                                          │
│ ├─ Szkolenia w miesiącu: 1                        │
│ └─ Certyfikaty do odnowienia: 0                   │
│                                                    │
│ ⚠️ POWIADOMIENIA (5)                              │
│ • Nowe zadanie: ODS/TN01/001                      │
│ • Prowizja zatwierdzona: 1,500 PLN               │
│ • Przypomnienie: szkolenie jutro 10:00           │
│                                                    │
└────────────────────────────────────────────────────┘
```

**Zakładki:**
1. 🏠 **Główna** - podsumowanie
2. 📁 **Sprawy** - moje sprawy
3. ✅ **Zadania** - todo list
4. 💰 **Prowizje** - zarobki
5. 💸 **Koszty** - wydatki
6. 🏖️ **Urlopy** - wnioski
7. 📚 **Rozwój** - szkolenia
8. ⏰ **Czas pracy** - raport
9. 📊 **Statystyki** - miesięczne
10. ⚙️ **Ustawienia** - profil

---

### 3.4 Automatyczne Powiadomienia

**Kiedy powiadamiać:**
- ✅ Prowizja zatwierdzona
- ✅ Prowizja wypłacona
- ✅ Koszt zatwierdzony/odrzucony
- ✅ Nowe zadanie przypisane
- ✅ Zbliżający się deadline
- ✅ Zatwierdzony urlop
- ✅ Nowe szkolenie
- ✅ Certyfikat wygasa (30 dni wcześniej)

**Kanały:**
- 🔔 W aplikacji (badge na ikonie)
- 📧 Email (opcjonalnie)
- 📱 Push notification (przyszłość)

---

## 🚀 KOLEJNOŚĆ IMPLEMENTACJI

1. **Dzień 1:** Integracja prowizji z dashboard
2. **Dzień 2:** System kosztów + zatwierdzanie
3. **Dzień 3:** Zintegrowany dashboard + zakładki
4. **Dzień 4:** Powiadomienia + testy
