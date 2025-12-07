# 🏗️ ROZBUDOWA SYSTEMU FINANSOWEGO

## 📋 Zakres prac

### ✅ Już działa:
1. Finance Dashboard - wszystkie płatności
2. System płatności - faktury, gotówka, PayPal, krypto
3. System ratalny - harmonogram płatności
4. Saldo prepaid klientów
5. Podstawowy system prowizji (automatyczny)

### 🔨 Do zrobienia:

#### 1. PROWIZJE - ELASTYCZNY SYSTEM
**Problem:** Teraz prowizje są automatycznie wyliczane dla każdej płatności.

**Potrzebne:**
- [ ] Checkbox "💰 Nalicz prowizję" przy tworzeniu płatności (domyślnie: TAK)
- [ ] Wybór stopy prowizji:
  - Domyślna (z ustawień użytkownika)
  - Custom (wprowadź %)
- [ ] Wybór kto dostaje prowizję:
  - Mecenas (lawyer) - domyślnie assigned_to
  - Opiekun klienta (client_manager)
  - Inny pracownik (dropdown)
  - Podział między kilku (np. 50/50)

**Tabela:** `payments` - dodać kolumny:
```sql
ALTER TABLE payments ADD COLUMN enable_commission INTEGER DEFAULT 1;
ALTER TABLE payments ADD COLUMN commission_rate_override DECIMAL(5,2);
ALTER TABLE payments ADD COLUMN commission_recipient_override INTEGER;
```

#### 2. PŁATNOŚCI DLA PRACOWNIKÓW

**Nowa tabela:** `employee_payments`
```sql
CREATE TABLE employee_payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL,
    payment_type VARCHAR(50), -- 'salary', 'bonus', 'commission_payout'
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN',
    description TEXT,
    payment_date DATE,
    month_year VARCHAR(7), -- '2025-11' dla pensji miesięcznych
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, cancelled
    paid_at DATETIME,
    paid_by INTEGER,
    payment_method VARCHAR(50), -- bank_transfer, cash
    reference_id INTEGER, -- ID prowizji jeśli typ = commission_payout
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (paid_by) REFERENCES users(id)
);
```

**Funkcjonalności:**
- [ ] Rejestracja pensji miesięcznych (automatyczne + ręczne)
- [ ] Rejestracja premii
- [ ] Wypłata prowizji (z tabeli lawyer_commissions)
- [ ] Historia płatności pracownika
- [ ] Zestawienie roczne (PIT)

#### 3. WYDATKI FIRMY

**Nowa tabela:** `company_expenses`
```sql
CREATE TABLE company_expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_code VARCHAR(50) UNIQUE,
    category VARCHAR(100) NOT NULL, -- office_rent, utilities, software, marketing, legal, other
    subcategory VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN',
    tax_rate DECIMAL(5,2), -- 23%, 8%, 0%
    tax_amount DECIMAL(10,2),
    net_amount DECIMAL(10,2),
    description TEXT,
    vendor_name VARCHAR(255), -- kontrahent
    vendor_tax_id VARCHAR(50), -- NIP kontrahenta
    invoice_number VARCHAR(100),
    invoice_date DATE,
    payment_date DATE,
    payment_method VARCHAR(50), -- bank_transfer, cash, card
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid, cancelled
    attachment_path TEXT, -- ścieżka do pliku faktury
    assigned_to INTEGER, -- kto odpowiada za wydatek
    approved_by INTEGER,
    approved_at DATETIME,
    paid_by INTEGER,
    paid_at DATETIME,
    notes TEXT,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id),
    FOREIGN KEY (paid_by) REFERENCES users(id)
);
```

**Kategorie wydatków:**
1. 🏢 **Wynajem i utrzymanie biura**
   - Czynsz
   - Media (prąd, woda, gaz)
   - Internet
   - Telefon
   - Ochrona, monitoring

2. 💼 **Pracownicy**
   - Pensje (osobna tabela)
   - ZUS pracodawcy
   - Ubezpieczenia

3. 💻 **Oprogramowanie i narzędzia**
   - Subskrypcje (Office 365, Adobe, etc.)
   - Licencje
   - Hosting, domeny

4. 📚 **Usługi prawne i księgowe**
   - Księgowość
   - Obsługa prawna
   - Ubezpieczenia OC

5. 📢 **Marketing i reklama**
   - Google Ads
   - Strona WWW
   - Social media
   - Ulotki, wizytówki

6. 🚗 **Transport i podróże**
   - Paliwo
   - Bilety
   - Hotele
   - Diety

7. 🖨️ **Materiały biurowe**
   - Papier, tonery
   - Artykuły biurowe
   - Meble

8. 🎓 **Szkolenia i rozwój**
   - Kursy
   - Konferencje
   - Książki

9. 🏦 **Koszty bankowe**
   - Prowizje
   - Opłaty za przelewy
   - Koszty kredytów

10. 🔧 **Inne**
    - Naprawy, serwis
    - Pozostałe

**Funkcjonalności:**
- [ ] Dodawanie wydatku (formularz)
- [ ] Upload faktury (PDF/JPG)
- [ ] Zatwierdzanie wydatku (przez kierownictwo)
- [ ] Rejestracja płatności
- [ ] Raporty:
  - Wydatki według kategorii
  - Wydatki według miesiąca
  - Wydatki według kontrahenta
  - Zestawienie VAT
  - Wykres kosztów

#### 4. INTEGRACJA Z FINANCE DASHBOARD

**Rozszerzenie Finance Dashboard o zakładki:**
1. **💰 Płatności** (już jest)
   - Płatności klientów
   - Raty
   
2. **👥 Prowizje** (NOWE)
   - Do wypłaty
   - Wypłacone
   - Statystyki według pracownika
   
3. **💼 Wypłaty pracowników** (NOWE)
   - Pensje
   - Premie
   - Prowizje wypłacone
   - Zestawienia
   
4. **🏢 Wydatki firmy** (NOWE)
   - Wszystkie wydatki
   - Do zatwierdzenia
   - Do zapłaty
   - Raporty

5. **📊 Podsumowanie** (NOWE)
   - Przychody vs Wydatki
   - Zysk netto
   - Statystyki miesięczne
   - Wykresy

## 🎯 PRIORYTET IMPLEMENTACJI

### Etap 1: Prowizje elastyczne
1. Rozszerzenie tabeli `payments`
2. Modyfikacja formularza płatności
3. Modyfikacja funkcji `calculateCommissionsForPayment`
4. Zakładka "Prowizje" w Finance Dashboard

### Etap 2: Płatności pracowników
1. Utworzenie tabeli `employee_payments`
2. Formularz rejestracji pensji/premii
3. Wypłata prowizji (powiązanie z `lawyer_commissions`)
4. Zakładka "Wypłaty" w Finance Dashboard

### Etap 3: Wydatki firmy
1. Utworzenie tabeli `company_expenses`
2. Formularz dodawania wydatku
3. Upload faktur
4. Zatwierdzanie i płatności
5. Zakładka "Wydatki" w Finance Dashboard

### Etap 4: Raporty i statystyki
1. Przychody vs Wydatki
2. Zysk operacyjny
3. Wykresy
4. Eksport do Excel

## 📊 PRZYKŁAD UŻYCIA

### Scenariusz 1: Płatność z prowizją niestandardową
```
1. Admin tworzy płatność 5,000 PLN
2. ☐ Nalicz prowizję (domyślnie: TAK)
3. Stopa prowizji:
   • Domyślna (10%)
   • Custom: [15%] (wybrał 15%)
4. Prowizja dla:
   • Mecenas: Jan Kowalski
   • Podział: 70% mecenas, 30% opiekun
5. [Utwórz płatność]

Rezultat:
- Płatność: 5,000 PLN
- Prowizja mecenas: 525 PLN (70% z 15%)
- Prowizja opiekun: 225 PLN (30% z 15%)
```

### Scenariusz 2: Płatność BEZ prowizji
```
1. Admin tworzy płatność 1,000 PLN
2. ☐ Nalicz prowizję (ODZNACZ)
3. [Utwórz płatność]

Rezultat:
- Płatność: 1,000 PLN
- Prowizje: BRAK
```

### Scenariusz 3: Wypłata pensji
```
Finance Dashboard → Wypłaty pracowników
1. [Zarejestruj wypłatę]
2. Typ: Pensja miesięczna
3. Pracownik: Jan Kowalski
4. Kwota: 8,000 PLN
5. Miesiąc: Listopad 2025
6. Metoda: Przelew bankowy
7. [Zapisz]
```

### Scenariusz 4: Dodanie wydatku
```
Finance Dashboard → Wydatki firmy
1. [Dodaj wydatek]
2. Kategoria: Oprogramowanie
3. Podkategoria: Subskrypcje
4. Kontrahent: Microsoft
5. Kwota: 500 PLN (netto: 406.50, VAT 23%: 93.50)
6. Faktura: [Upload PDF]
7. [Zapisz i oczekuj na zatwierdzenie]
```

---

**Rozpoczynam od Etapu 1: Prowizje elastyczne** ✅
