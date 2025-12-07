# 🎫 GDZIE SĄ TICKETY HR? - INSTRUKCJA

## ⚡ SZYBKA ODPOWIEDŹ:

### **HR Panel:**
```
http://localhost:3500/hr-panel.html
```

**To jest główne miejsce gdzie HR zarządza wszystkimi wnioskami!**

---

## 📍 SZCZEGÓŁY:

### **1. HR PANEL** ⭐ GŁÓWNE MIEJSCE

**URL:** `http://localhost:3500/hr-panel.html`

**Zakładki:**
- 🏖️ **Wnioski urlopowe** - lista wszystkich wniosków do zatwierdzenia
- 🎓 **Wnioski o szkolenia** - prośby o kursy/certyfikacje
- 📄 **Dokumenty do weryfikacji** - przesłane dyplomy, certyfikaty
- 🎫 **Wszystkie tickety HR** - agregacja wszystkich wniosków

**Dla każdego wniosku urlopowego zobaczysz:**
```
┌─────────────────────────────────────────────┐
│ Jan Kowalski                                │
│ Prawnik • jan@promeritum.pl                 │
│                                             │
│ 📅 Typ: Urlop wypoczynkowy                  │
│ 📆 Od - Do: 20.11.2025 - 27.11.2025        │
│ 🗓️  Liczba dni: 5 dni                      │
│ 📝 Uwagi: Wakacje z rodziną                 │
│                                             │
│ [✓ Zatwierdź]  [✗ Odrzuć]  [🎫 Zobacz ticket] │
└─────────────────────────────────────────────┘
```

---

### **2. SYSTEM TICKETÓW** (jeśli istnieje w aplikacji)

Wnioski HR tworzą tickety z kategoriami:
- `hr_vacation` - Wnioski urlopowe
- `hr_training` - Wnioski o szkolenie
- `hr_document` - Dokumenty do weryfikacji

**Gdzie je znaleźć?**
- Panel ticketów w głównej aplikacji
- Filtruj po kategorii "HR"
- Każdy ticket ma powiązany `ticket_id` w tabelach HR

---

### **3. DIRECT API ENDPOINTS**

**Dla developerów/testowania:**

```javascript
// Lista oczekujących wniosków urlopowych
GET /api/hr-vacations/pending

// Zatwierdź wniosek
POST /api/hr-vacations/:vacationId/approve

// Odrzuć wniosek
POST /api/hr-vacations/:vacationId/reject
Body: { "rejection_reason": "Powód" }

// Wnioski o szkolenia (przez tickety)
GET /api/tickets?category=hr_training

// Dokumenty do weryfikacji
GET /api/tickets?category=hr_document
```

---

## 🔐 KTO MA DOSTĘP?

**HR Panel dostępny dla:**
- ✅ **Admin** (pełny dostęp)
- ✅ **HR** (rola: `hr`)
- ❌ Pracownicy NIE widzą panelu HR

**Logowanie testowe:**
```
Email: hr@promeritum.pl
Hasło: Hr123!@#
```

---

## 🔄 JAK DZIAŁA PRZEPŁYW?

### **KROK 1: Pracownik składa wniosek**
```
Employee Dashboard → 🏖️ Urlopy → ➕ Złóż wniosek
```

### **KROK 2: System tworzy wpisy**
```sql
-- 1. Tworzy ticket w tabeli tickets
INSERT INTO tickets (user_id, title, description, category, status)
VALUES (123, 'Wniosek urlopowy...', '...', 'hr_vacation', 'open')

-- 2. Tworzy wpis w employee_vacations
INSERT INTO employee_vacations (employee_id, ticket_id, status, ...)
VALUES (123, 456, 'pending', ...)
```

### **KROK 3: HR widzi w panelu**
```
HR Panel → 🏖️ Wnioski urlopowe → Lista wniosków "pending"
```

### **KROK 4: HR zatwierdza**
```
Klik "✓ Zatwierdź"
    ↓
UPDATE employee_vacations SET status='approved'
UPDATE tickets SET status='closed'
UPDATE employee_vacation_balance - odejmij dni
    ↓
Pracownik dostaje powiadomienie
```

---

## 📊 PRZYKŁAD UŻYCIA

### **Scenariusz: Jan Kowalski chce urlop**

**1. Jan (pracownik):**
- Otwiera Employee Dashboard
- Zakładka 🏖️ Urlopy
- Klik "➕ Złóż wniosek urlopowy"
- Wypełnia formularz:
  - Od: 20.11.2025
  - Do: 27.11.2025
  - Typ: Urlop wypoczynkowy
  - Uwagi: Wakacje z rodziną
- Klik "✓ Wyślij wniosek"

**2. System:**
- ✅ Tworzy ticket ID: 789
- ✅ Tworzy vacation ID: 456
- ✅ Status: pending
- ✅ Liczy dni: 5 (bez weekendów)

**3. HR (Maria z działu kadr):**
- Otwiera `http://localhost:3500/hr-panel.html`
- Widzi wniosek Jana
- Sprawdza saldo (20 dni dostępnych)
- Klik "✓ Zatwierdź"
- Potwierdza w popup

**4. System:**
- ✅ Status: approved
- ✅ Saldo Jana: 20 → 15 dni
- ✅ Ticket zamknięty
- ✅ Email do Jana: "Twój urlop został zatwierdzony!"

---

## 🚨 TROUBLESHOOTING

### **Problem: "Nie widzę HR Panel"**
**Rozwiązanie:**
1. Sprawdź czy jesteś zalogowany jako HR/Admin
2. Sprawdź URL: `http://localhost:3500/hr-panel.html`
3. Sprawdź konsole błędów (F12)

### **Problem: "Brak wniosków urlopowych"**
**Rozwiązanie:**
1. Pracownik musi złożyć wniosek w Employee Dashboard
2. Sprawdź czy status = 'pending'
3. API: `GET /api/hr-vacations/pending`

### **Problem: "Nie mogę zatwierdzić"**
**Rozwiązanie:**
1. Sprawdź uprawnienia (admin/hr)
2. Sprawdź czy wniosek ma status 'pending'
3. Sprawdź saldo urlopowe pracownika

---

## 📞 WSPARCIE

**Dokumentacja:**
- `HR-PANEL-INSTRUKCJA.md` - Szczegółowa instrukcja
- `SUMMARY-HR-SYSTEM.md` - Podsumowanie całego systemu
- `HR-SYSTEM-POSTEP.md` - Status wdrożenia

**API Dokumentacja:**
- Wszystkie endpointy w `backend/routes/hr-*.js`

**Baza danych:**
- Tabele: `employee_vacations`, `employee_vacation_balance`, `tickets`
- Migracja: `backend/migrations/006-hr-system.sql`
- Integracja: `backend/migrations/007-add-ticket-integration.sql`

---

## ✅ CHECKLIST SZYBKIEGO STARTU

Dla HR:
- [ ] Zaloguj się jako `hr@promeritum.pl`
- [ ] Otwórz `http://localhost:3500/hr-panel.html`
- [ ] Sprawdź zakładkę "🏖️ Wnioski urlopowe"
- [ ] Zatwierdź/odrzuć wnioski
- [ ] (Opcjonalnie) Zobacz powiązany ticket

Dla pracownika:
- [ ] Otwórz Employee Dashboard
- [ ] Zakładka "🏖️ Urlopy"
- [ ] Złóż wniosek urlopowy
- [ ] Czekaj na zatwierdzenie przez HR
