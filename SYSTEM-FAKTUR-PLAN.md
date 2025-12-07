# 📄 SYSTEM FAKTUR I PARAGONÓW - PLAN WDROŻENIA

## 🎯 CEL:
Automatyczne generowanie faktur/paragonów po opłaceniu płatności + pełna integracja finansowa

---

## 📋 CO TRZEBA ZROBIĆ:

### 1. ✅ KOLORY NAPRAWIONE
- Formularz rejestracji gotówką - wszystkie teksty ciemne i wyraźne
- Finance Dashboard - metody płatności kolorowe
- Szczegóły płatności - wszystko widoczne

### 2. 📄 AUTOMATYCZNE FAKTURY/PARAGONY

#### A. Tabela w bazie danych
```sql
CREATE TABLE payment_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER NOT NULL,
    receipt_type VARCHAR(20), -- 'invoice' lub 'receipt'
    receipt_number VARCHAR(50) UNIQUE,
    issue_date DATE,
    client_id INTEGER,
    case_id INTEGER,
    amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'PLN',
    tax_rate DECIMAL(5,2), -- 23%, 8%, 0%
    net_amount DECIMAL(10,2),
    tax_amount DECIMAL(10,2),
    gross_amount DECIMAL(10,2),
    description TEXT,
    pdf_path TEXT, -- ścieżka do PDF
    sent_to_client BOOLEAN DEFAULT 0,
    sent_at DATETIME,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
);
```

#### B. Automatyczne generowanie
**Kiedy:**
- Po opłaceniu płatności gotówką → PARAGON
- Po opłaceniu płatności PayPal/BLIK → FAKTURA
- Po opłaceniu raty → PARAGON za ratę

**Co zawiera:**
```
PARAGON NR: PAR/2025/11/001
Data: 24.11.2025
Klient: Jan Kowalski
Za: Usługi prawne - sprawa ODS/JK/001
Kwota: 2,500.00 PLN
Płatność: Gotówka
Kod płatności: PAY/ODS/JK/001
```

**FAKTURA VAT NR: FV/2025/11/001**
```
Sprzedawca: Kancelaria XYZ
NIP: 123-456-78-90

Nabywca: Jan Kowalski
NIP: (jeśli firma)

Lp | Nazwa usługi      | Netto    | VAT 23% | Brutto
1  | Usługi prawne     | 2,032.52 | 467.48  | 2,500.00
─────────────────────────────────────────────────────
Razem:                   2,032.52   467.48    2,500.00
```

#### C. Backend endpoint
```javascript
POST /api/payments/:id/generate-receipt

Request body:
{
    "receipt_type": "invoice" | "receipt",
    "include_tax": true/false,
    "send_to_client": true/false
}

Response:
{
    "success": true,
    "receipt": {
        "id": 123,
        "receipt_number": "PAR/2025/11/001",
        "pdf_url": "/receipts/PAR-2025-11-001.pdf"
    }
}
```

### 3. 👤 WIDOK DLA KLIENTA

#### Portal klienta - zakładka "📄 Moje faktury"
```
┌────────────────────────────────────────────┐
│ 📄 Moje faktury i paragony                 │
├────────────────────────────────────────────┤
│ ┌──────────┬──────────┬────────┬─────────┐ │
│ │ Numer    │ Data     │ Kwota  │ Akcje   │ │
│ ├──────────┼──────────┼────────┼─────────┤ │
│ │ FV/11/1  │24.11.25  │2500 PLN│📥 Pobierz│ │
│ │ PAR/11/2 │25.11.25  │1000 PLN│📥 Pobierz│ │
│ └──────────┴──────────┴────────┴─────────┘ │
│                                              │
│ [📊 Zestawienie roczne]                      │
└────────────────────────────────────────────┘
```

### 4. 💼 INTEGRACJA Z FINANCE DASHBOARD

#### Obecnie Finance Dashboard ma:
- ✅ Zakładka "💰 Płatności" (działa)
- ⏳ Zakładka "👥 Prowizje" (w budowie)
- ⏳ Zakładka "💼 Wypłaty" (w budowie)
- ⏳ Zakładka "🏢 Wydatki" (w budowie)
- ⏳ Zakładka "📊 Raporty" (w budowie)

#### DODAĆ:
- ✅ "📄 Faktury" - wszystkie wystawione faktury/paragony
  - Lista faktur
  - Generowanie nowej faktury
  - Pobieranie PDF
  - Wysyłka do klienta

### 5. 🔗 POŁĄCZENIE Z ADMIN DASHBOARD

**Admin Dashboard powinien mieć dostęp do:**
```
Admin → 💰 Finanse → Finance Dashboard (5 zakładek)
```

**Obecnie:**
- Admin widzi przycisk "💰 Finanse" ✅
- Finance Dashboard się otwiera ✅
- Wszystko renderuje się poprawnie ✅

**Co sprawdzić:**
- Czy Admin ma te same uprawnienia co Finance? ✅
- Czy może dodawać wydatki? (TODO)
- Czy może wypłacać prowizje? (TODO)

### 6. 📊 DASHBOARD - KOMPLETNA STRUKTURA

```
┌─────────────────────────────────────────────┐
│ 💰 FINANSE (Admin + Finance + Reception)    │
├─────────────────────────────────────────────┤
│                                               │
│ ┌───┬───┬───┬───┬───┬───┐                   │
│ │💰 │👥 │💼 │🏢 │📄 │📊 │ ← 6 ZAKŁADEK     │
│ │Płat│Pro│Wyp│Wyd│Fak│Rap│                   │
│ └───┴───┴───┴───┴───┴───┘                   │
│                                               │
│ 💰 PŁATNOŚCI (istniejące)                    │
│ - Lista płatności klientów                    │
│ - Filtry, paginacja                           │
│ - Szczegóły, raty                             │
│                                               │
│ 👥 PROWIZJE (nowe)                           │
│ - Lista prowizji do wypłaty                   │
│ - Wypłać prowizję                             │
│ - Historia prowizji                           │
│                                               │
│ 💼 WYPŁATY PRACOWNIKÓW (nowe)               │
│ - Pensje miesięczne                           │
│ - Premie                                      │
│ - Wypłata prowizji                            │
│                                               │
│ 🏢 WYDATKI FIRMY (nowe)                      │
│ - Dodaj wydatek                               │
│ - Kategorie (czynsz, media, etc.)             │
│ - Upload faktury                              │
│ - Raporty wydatków                            │
│                                               │
│ 📄 FAKTURY/PARAGONY (nowe)                   │
│ - Wszystkie wystawione dokumenty              │
│ - Generowanie faktury                         │
│ - Pobieranie PDF                              │
│ - Wysyłka do klienta                          │
│                                               │
│ 📊 RAPORTY (nowe)                            │
│ - Przychody vs Wydatki                        │
│ - Zysk netto                                  │
│ - Wykresy                                     │
│ - Eksport do Excel                            │
└─────────────────────────────────────────────┘
```

---

## 🚀 KOLEJNOŚĆ IMPLEMENTACJI:

### Etap 1: ✅ KOLORY (ZAKOŃCZONE)
- Formularz rejestracji gotówką
- Finance Dashboard
- Szczegóły płatności

### Etap 2: 📄 FAKTURY/PARAGONY (NASTĘPNY)
1. Utworzenie tabeli `payment_receipts`
2. Endpoint generowania dokumentów
3. Generator PDF (node-html-pdf lub puppeteer)
4. Automatyczne generowanie po opłaceniu
5. Zakładka "📄 Faktury" w Finance Dashboard
6. Widok dla klienta na portalu

### Etap 3: 👥 PROWIZJE
1. Implementacja zakładki "Prowizje"
2. Lista prowizji do wypłaty
3. Przycisk "Wypłać"
4. Integracja z wypłatami

### Etap 4: 💼 WYPŁATY PRACOWNIKÓW
1. Tabela `employee_payments`
2. Formularz rejestracji pensji
3. Formularz premii
4. Historia wypłat

### Etap 5: 🏢 WYDATKI FIRMY
1. Tabela `company_expenses`
2. Formularz dodawania wydatków
3. Kategorie wydatków
4. Upload faktur

### Etap 6: 📊 RAPORTY
1. Przychody vs Wydatki
2. Wykresy
3. Eksport

---

## 📝 STATUS OBECNY:

✅ Finance Dashboard istnieje
✅ Admin widzi przycisk "Finanse"
✅ 5 zakładek utworzonych (Płatności działa, reszta placeholder)
✅ Kolory naprawione
✅ System płatności działa
✅ System ratalny działa

⏳ DO ZROBIENIA:
- Tabela payment_receipts
- Generowanie faktur/paragonów
- Widok faktur dla klienta
- Implementacja prowizji
- Implementacja wypłat
- Implementacja wydatków
- Raporty

---

**NASTĘPNY KROK:** Utworzenie tabeli `payment_receipts` i endpointu generowania dokumentów
