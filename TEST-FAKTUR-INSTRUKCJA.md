# 🧪 INSTRUKCJA TESTOWANIA SYSTEMU FAKTUR

## ⚠️ **ZRÓB TO NAJPIERW:**

### 1. **TWARDZE ODŚWIEŻENIE PRZEGLĄDARKI**
```
CTRL + SHIFT + R (Windows)
```
**Lub:**
- Otwórz NOWĄ kartę w trybie INCOGNITO: `Ctrl + Shift + N`
- Wejdź na `http://localhost:3500`

---

## 🎯 **TEST 1: ZNAJDŹ PRZYCISKI TESTOWE**

1. **Zaloguj się jako admin**
2. **Zobaczysz DASHBOARD ADMINA**
3. **Przewiń w dół do sekcji "⚡ Szybkie akcje"**
4. **Powinieneś zobaczyć 2 DUŻE ZIELONE/NIEBIESKIE PRZYCISKI:**
   - `📄 WYSTAW FAKTURĘ (TEST)` - zielony
   - `📋 LISTA FAKTUR (TEST)` - niebieski

**Jeśli NIE WIDZISZ:**
- Zrób `Ctrl + F5` (super twarde odświeżenie)
- Sprawdź konsolę (F12) czy są błędy
- Sprawdź czy widzisz log: `🔥🔥🔥 Sales Invoices Module v1.5`

---

## 🧪 **TEST 2: WYSTAW TESTOWĄ FAKTURĘ**

### **Kroki:**

1. **Kliknij przycisk `📄 WYSTAW FAKTURĘ (TEST)`**

2. **Pojawi się modal z formularzem**
   - **Sprawdź:** Czy modal ma scrollbar?
   - **Przewiń w dół** - powinieneś zobaczyć:
     - Checkbox "💳 Płatność ratalna"

3. **Wypełnij formularz:**
   ```
   Klient: Wybierz dowolnego klienta z listy
   Sprawa: (opcjonalnie)
   Usługa/Towar: "Reprezentacja prawna - TEST"
   Kwota netto: 10000
   Stawka VAT: 23%
   Data wystawienia: dzisiejsza
   Termin płatności: za 14 dni
   ```

4. **OPCJONALNIE - Zaznacz płatność ratalną:**
   - ✅ Checkbox "💳 Płatność ratalna"
   - Liczba rat: 6
   - Data pierwszej raty: za 30 dni

5. **Kliknij `✓ Wystaw fakturę`**

---

## 📊 **TEST 3: SPRAWDŹ CO SIĘ DZIEJE**

### **A) Konsola przeglądarki (F12):**

Powinieneś zobaczyć:
```javascript
🔥🔥🔥 SAVE INVOICE CALLED! 🔥🔥🔥
📋 FormData zebrane: {client_id: "1", buyer_name: "Jan Kowalski", ...}
📤 Wysyłam dane do backendu: {...}
🌐 Wywołuję API: POST /sales-invoices
📥 Odpowiedź z backendu: {success: true, invoiceId: 1, ...}
✅ Faktura zapisana pomyślnie!
```

### **B) Konsola backendu (terminal):**

Powinieneś zobaczyć:
```
📨 POST /api/sales-invoices
💰 Faktura: FV/2025/11/001 Klient: 1 Kwota: 12300.00
✅ Faktura FV/2025/11/001 wystawiona! ID: 1
💳 Płatność PAY/CYW/JK/001/001 utworzona automatycznie! ID: 1
```

Jeśli z ratami:
```
📅 Utworzono 6 rat po 2050.00 PLN
```

### **C) Alert w przeglądarce:**

Powinieneś zobaczyć pop-up:
```
✅ Faktura FV/2025/11/001 wystawiona!

💰 Kwota: 12 300,00 zł
💳 Płatność: PAY/CYW/JK/001/001

📅 Płatność ratalna:
6 rat × 2 050,00 zł
Harmonogram rat wygenerowany automatycznie!
```

---

## 📋 **TEST 4: ZOBACZ LISTĘ FAKTUR**

1. **Kliknij przycisk `📋 LISTA FAKTUR (TEST)`**

2. **Powinieneś zobaczyć:**
   - Nagłówek: "📄 Faktury sprzedażowe"
   - Tabelę z fakturami
   - Kolumny: Numer, Klient, Sprawa, Kwota, Data, Status, KSeF, Akcje

3. **Sprawdź czy jest Twoja faktura:**
   - Numer: FV/2025/11/001
   - Status: ⏳ Nieopłacona

---

## 🔍 **TEST 5: SPRAWDŹ W BAZIE DANYCH (OPCJONALNIE)**

### **W konsoli przeglądarki:**

```javascript
// Sprawdź faktury
const invoices = await window.api.request('/sales-invoices');
console.table(invoices.invoices);

// Sprawdź płatności
const payments = await window.api.request('/payments');
console.table(payments);

// Sprawdź raty (jeśli były)
const installments = await window.api.request('/installments');
console.table(installments);
```

---

## ❌ **TYPOWE PROBLEMY I ROZWIĄZANIA:**

### **1. "Nie widzę przycisków testowych"**
**Rozwiązanie:**
```
1. Ctrl + Shift + R (twarde odświeżenie)
2. Sprawdź konsolę F12:
   - Czy widzisz: 🔥🔥🔥 Sales Invoices Module v1.5?
   - Czy są jakieś błędy?
3. Sprawdź czy backend działa (port 3500)
```

### **2. "Modal się nie otwiera"**
**Rozwiązanie:**
```javascript
// W konsoli F12:
salesInvoices.showIssueInvoiceModal()
// Sprawdź czy są błędy
```

### **3. "Nie widzę sekcji płatności ratalnej"**
**Rozwiązanie:**
- Przewiń modal w DÓŁ
- Modal teraz ma scrollbar
- Sekcja jest na samym dole

### **4. "Faktura się nie zapisuje"**
**Rozwiązanie:**
```
1. Sprawdź konsolę przeglądarki (F12)
   - Czy widzisz: 🔥🔥🔥 SAVE INVOICE CALLED?
   - Czy są błędy?

2. Sprawdź konsolę backendu
   - Czy widzisz: 📨 POST /api/sales-invoices?
   - Czy są błędy SQL?

3. Sprawdź czy wypełniłeś wszystkie wymagane pola:
   - Klient *
   - Usługa/Towar *
   - Kwota netto *
   - Stawka VAT *
   - Data wystawienia *
```

### **5. "Backend zwraca błąd"**
**Sprawdź:**
```
1. Czy backend działa? (port 3500)
2. Czy tabela sales_invoices istnieje?
   - Restart backendu tworzy tabele automatycznie
3. Czy są błędy w logach backendu?
```

---

## ✅ **CZEGO OCZEKUJEMY:**

Po poprawnym wystawieniu faktury:

### **Frontend:**
- ✅ Modal się otwiera
- ✅ Formularz jest wypełnialny
- ✅ Sekcja płatności ratalnej jest widoczna (po scrollu)
- ✅ Alert z potwierdzeniem
- ✅ Lista faktur pokazuje nową fakturę

### **Backend:**
- ✅ Tabela `sales_invoices` - nowy wpis
- ✅ Tabela `payments` - nowy wpis (automatycznie)
- ✅ Tabela `installment_payments` - raty (jeśli zaznaczone)
- ✅ Logi w konsoli backendu

### **Konsola przeglądarki:**
```
🔥🔥🔥 SAVE INVOICE CALLED! 🔥🔥🔥
📋 FormData zebrane: {...}
📤 Wysyłam dane do backendu: {...}
🌐 Wywołuję API: POST /sales-invoices
📥 Odpowiedź z backendu: {success: true, ...}
✅ Faktura zapisana pomyślnie!
```

### **Konsola backendu:**
```
📨 POST /api/sales-invoices
✅ Faktura FV/2025/11/001 wystawiona!
💳 Płatność PAY/CYW/JK/001/001 utworzona!
📅 Utworzono 6 rat po 2050.00 PLN (jeśli ratalna)
```

---

## 🚀 **DALSZE TESTY (OPCJONALNIE):**

1. **Wystaw fakturę BEZ rat**
   - Sprawdź czy tworzy się tylko płatność (bez rat)

2. **Wystaw fakturę Z ratami (różne liczby)**
   - 2 raty
   - 12 rat
   - 24 raty

3. **Sprawdź różne metody płatności**
   - Zobacz czy w tabeli `payments` zapisuje się `payment_method`

4. **Zaznacz "Wyślij do KSeF"**
   - Zobacz czy pole `send_to_ksef` jest true

---

## 📝 **RAPORTUJ WYNIKI:**

Po testach napisz:
```
✅ DZIAŁA - faktury się zapisują
❌ NIE DZIAŁA - powód: [opisz problem]
   - Co widzisz w konsoli przeglądarki?
   - Co widzisz w konsoli backendu?
   - Czy są błędy?
```

---

**Powodzenia w testach! 🎯**
