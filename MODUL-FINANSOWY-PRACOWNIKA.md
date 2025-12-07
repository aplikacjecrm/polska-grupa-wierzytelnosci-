# 💰 Moduł Finansowy Pracownika - Instrukcja

## 📋 Opis modułu

Moduł finansowy pozwala na kompleksowe zarządzanie danymi finansowymi pracowników oraz historią ich wypłat. Dostęp do edycji mają tylko użytkownicy z rolami: **Admin**, **HR** i **Finance**.

---

## 🎯 Funkcjonalności

### 1. **Dane Kontraktowe Pracownika**

Przechowywane informacje:
- 💵 **Pensja miesięczna** (brutto)
- 🏦 **Numer konta bankowego**
- 📄 **Typ umowy** (UoP, Zlecenie, B2B, Dzieło)
- 📅 **Daty umowy** (rozpoczęcie, zakończenie)
- 🏛️ **Urząd skarbowy**
- 🆔 **NIP** (dla B2B)
- 🏥 **Rodzaj ubezpieczenia**
- 🕐 **Wymiar czasu pracy** (godziny/tydzień)
- 📝 **Uwagi finansowe**

### 2. **Historia Wypłat**

Automatyczne wyświetlanie:
- 📊 **Statystyki wypłat**:
  - Łącznie wypłacono (brutto i netto)
  - Średnia pensja
  - Liczba wypłat
- 📋 **Tabela wszystkich wypłat**:
  - Miesiąc i rok
  - Kwoty (brutto i netto)
  - Status wypłaty
  - Data wypłaty
  - Kto wypłacił

---

## 🚀 Jak korzystać?

### **Dla HR i Finance:**

#### **1. Otwórz profil pracownika**
1. Zaloguj się jako HR (`hr@promeritum.pl`) lub Finance (`finanse@promeritum.pl`)
2. Kliknij ikonę **👥 Pracownicy** w menu
3. Wybierz pracownika z listy

#### **2. Przejdź do zakładki Finanse**
1. W profilu pracownika kliknij zakładkę **💰 Finanse**
2. System automatycznie załaduje:
   - Dane kontraktowe pracownika
   - Historię wypłat ze statystykami

#### **3. Edytuj dane finansowe**
1. Kliknij przycisk **✏️ Edytuj dane**
2. Wypełnij formularz:
   ```
   💵 Pensja miesięczna: 8000.00
   🏦 Konto bankowe: 26 1234 5678 9012 3456 7890 1234
   📄 Typ umowy: Umowa o pracę
   🕐 Wymiar czasu: 40 h/tydzień
   📅 Data rozpoczęcia: 2024-01-01
   🏛️ US: Urząd Skarbowy Warszawa-Śródmieście
   🏥 Ubezpieczenie: ZUS pełny
   ```
3. Kliknij **💾 Zapisz dane finansowe**
4. System automatycznie odświeży widok

#### **4. Wypłata pensji z automatyczną listą**
1. Przejdź do **Finance Dashboard** (💼)
2. Kliknij **💰 Pensje** → **➕ Wypłać pensję**
3. Z **dropdownu wybierz pracownika** (lista automatyczna!)
4. System automatycznie wypełni:
   - Imię i nazwisko
   - Domyślną pensję (jeśli ustawiona)
5. Uzupełnij:
   - Miesiąc i rok
   - Kwoty (brutto i netto)
   - Status wypłaty
   - Uwagi
6. Zapisz - **wypłata automatycznie zostanie połączona z pracownikiem!**

---

## 🔐 Uprawnienia

| Rola | Dostęp do zakładki Finanse | Edycja danych | Wypłata pensji |
|------|---------------------------|---------------|----------------|
| **Admin** | ✅ Tak | ✅ Tak | ✅ Tak |
| **HR** | ✅ Tak | ✅ Tak | ❌ Nie (tylko viewing) |
| **Finance** | ✅ Tak | ✅ Tak | ✅ Tak |
| **Lawyer/Manager** | ✅ Tak | ❌ Nie | ❌ Nie |
| **Pracownik** | ✅ Tak (własny profil) | ❌ Nie | ❌ Nie |

### **Uwaga:** 
- HR może edytować dane kontraktowe, ale **nie może wypłacać pensji**
- Finance może edytować dane kontraktowe **i wypłacać pensje**
- Pracownicy widzą tylko swoje dane (read-only)

---

## 📊 Statystyki w zakładce Finanse

Automatycznie obliczane:
```
┌─────────────────────────────────────────┐
│ 💵 Łącznie wypłacono (brutto): 96,000 zł │
│ 💚 Łącznie wypłacono (netto):  65,280 zł │
│ 📊 Średnia pensja (brutto):     8,000 zł │
│ 🔢 Liczba wypłat:                    12  │
└─────────────────────────────────────────┘
```

---

## 🛠️ Techniczne informacje

### **Backend Endpoints:**

```javascript
// Pobierz historię wypłat pracownika
GET /api/employees/:userId/salary-history
Response: { success, salaries: [...], stats: {...} }

// Aktualizuj dane finansowe
PUT /api/employees/:userId/financial-data
Body: { monthly_salary, bank_account, contract_type, ... }
Response: { success, message }
```

### **Baza danych:**

**Tabela `employee_profiles` - nowe kolumny:**
```sql
monthly_salary REAL           -- Miesięczna pensja brutto
bank_account TEXT             -- Numer konta bankowego
contract_type TEXT            -- Typ umowy (uop/uz/b2b/uod)
contract_start_date DATE      -- Data rozpoczęcia umowy
contract_end_date DATE        -- Data zakończenia (opcjonalnie)
tax_office TEXT               -- Urząd skarbowy
nip TEXT                      -- NIP (dla B2B)
insurance_type TEXT           -- Rodzaj ubezpieczenia
work_hours_per_week INTEGER   -- Wymiar czasu pracy
financial_notes TEXT          -- Uwagi finansowe
```

**Tabela `employee_salaries` - połączenie z pracownikiem:**
```sql
employee_id INTEGER  -- Foreign key do users.id
-- ... reszta kolumn (gross_amount, net_amount, etc.)
```

---

## 🎬 Przykładowy workflow

### **Scenariusz: Nowy pracownik**

1. **HR tworzy konto pracownika**
   - Admin Dashboard → Użytkownicy → Dodaj użytkownika
   - Wypełnij dane: email, hasło, imię, rola

2. **HR uzupełnia dane kontraktowe**
   - Pracownicy → Wybierz nowego pracownika
   - Zakładka 💰 Finanse → ✏️ Edytuj dane
   - Wypełnij: pensja, konto, typ umowy, daty, etc.

3. **Finance wypłaca pierwszą pensję**
   - Finance Dashboard → 💰 Pensje → ➕ Wypłać pensję
   - Wybierz pracownika z dropdownu (automatyczna lista!)
   - Wypełnij kwoty i zapisz

4. **Pracownik widzi swoją historię**
   - Pracownik loguje się → Własny profil
   - Zakładka 💰 Finanse
   - Widzi wszystkie swoje wypłaty i statystyki

---

## 🐛 Rozwiązywanie problemów

### **Problem: Nie widzę zakładki Finanse**
✅ **Rozwiązanie:** 
- Upewnij się że masz uprawnienia (admin/hr/finance/lawyer/manager)
- Wyloguj się i zaloguj ponownie
- Wyczyść cache przeglądarki (Ctrl+Shift+Del)

### **Problem: Historia wypłat jest pusta**
✅ **Rozwiązanie:**
- Sprawdź czy w Finance Dashboard wypłacano pensje z zaznaczonym pracownikiem
- Stare wypłaty (bez employee_id) nie będą widoczne
- Tylko wypłaty od dzisiaj będą automatycznie połączone

### **Problem: Przycisk "Edytuj dane" nie działa**
✅ **Rozwiązanie:**
- Sprawdź czy masz uprawnienia (admin/hr/finance)
- Otwórz konsolę przeglądarki (F12) i sprawdź błędy
- Upewnij się że serwer działa (`node backend/server.js`)

### **Problem: Po zapisie nie widzę zmian**
✅ **Rozwiązanie:**
- Przeładuj stronę (F5)
- Sprawdź czy serwer nie zwrócił błędu (konsola przeglądarki F12)
- Sprawdź logi serwera w terminalu

---

## 📞 Wsparcie

Jeśli masz problemy:
1. Sprawdź logi serwera (`backend/server.js`)
2. Sprawdź konsolę przeglądarki (F12)
3. Sprawdź uprawnienia użytkownika
4. Zrestartuj serwer
5. Wyczyść cache przeglądarki

---

## 🔄 Aktualizacje

**Wersja:** 1.0  
**Data:** 2025-11-23  
**Migracja bazy:** `006-employee-financial-data.js` (wykonana automatycznie)  
**Frontend:** `employee-dashboard.js v6.0`

---

## 📚 Powiązane pliki

- `backend/routes/employees.js` - endpointy API
- `backend/migrations/006-employee-financial-data.js` - migracja bazy
- `frontend/scripts/dashboards/employee-dashboard.js` - interfejs
- `backend/middleware/permissions.js` - kontrola dostępu
- `KONTA-HR-FINANCE.md` - instrukcja logowania

---

**🎉 Gotowe! Teraz możesz zarządzać danymi finansowymi pracowników w pełni zintegrowany sposób!**
