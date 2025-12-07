# 📄 SYSTEM FAKTUR - INSTRUKCJA UŻYCIA

## 🎯 **JAK WYSTAWIĆ FAKTURĘ:**

### **METODA 1: Z poziomu sprawy (NAJŁATWIEJSZA)**

1. **Otwórz sprawę klienta**
   - CRM → Sprawy → Kliknij na sprawę

2. **Przejdź do zakładki Finanse (w ramach sprawy)**
   - Znajdź zakładkę "💰 Finanse" lub "Płatności"

3. **Kliknij "Wystaw fakturę"**

4. **Wypełnij formularz:**
   - ✅ Klient (auto-wypełniony)
   - ✅ Usługa/Towar: "Reprezentacja prawna w sprawie..."
   - ✅ Kwota netto: np. 10000
   - ✅ Stawka VAT: 23%
   - ✅ Data wystawienia
   - ✅ Termin płatności

5. **OPCJONALNIE - Płatność ratalna:**
   - ✅ Zaznacz checkbox "💳 Płatność ratalna"
   - Wybierz liczbę rat (2-24)
   - Wybierz częstotliwość (miesięcznie/co 2 tygodnie)
   - Ustaw datę pierwszej raty

6. **Kliknij "✓ Wystaw fakturę"**

---

## 📋 **JAK ZOBACZYĆ LISTĘ FAKTUR:**

### **METODA 1: Z konsoli przeglądarki (TYMCZASOWO)**

1. Otwórz konsolę: `F12`
2. Wpisz:
```javascript
await salesInvoices.showInvoicesList()
```
3. Naciśnij `Enter`

### **METODA 2: Dashboard Finansowy (DOCELOWO)**

1. Z menu głównego wybierz "💼 Finanse"
2. Kliknij przycisk "📄 Faktury dla klientów"
3. Zobaczysz listę wszystkich faktur

---

## 🔍 **JAK SPRAWDZIĆ CZY FAKTURA SIĘ ZAPISAŁA:**

### **W konsoli backendu:**
Szukaj linii:
```
✅ Faktura FV/2025/11/001 wystawiona! ID: 1
💳 Płatność PAY/CYW/JK/001/001 utworzona automatycznie! ID: 1
```

Jeśli z ratami:
```
📅 Utworzono 6 rat po 2000.00 PLN
```

### **W przeglądarce:**
```javascript
// Sprawdź faktury
const invoices = await window.api.request('/sales-invoices');
console.log(invoices);

// Sprawdź płatności
const payments = await window.api.request('/payments');
console.log(payments);

// Sprawdź raty (jeśli były)
const installments = await window.api.request('/installments');
console.log(installments);
```

---

## ⚠️ **TYPOWE PROBLEMY:**

### **1. "Nie widzę sekcji płatności ratalnej"**
**Rozwiązanie:** Modal nie ma scrollowania
- Zrób `Ctrl + Shift + R` (twarde odświeżenie)
- Przewiń w dół w oknie faktury
- Sekcja "💳 Płatność ratalna" jest na samym dole

### **2. "Faktura się nie zapisuje"**
**Sprawdź:**
- Czy backend działa (port 3500)
- Czy wypełniłeś wszystkie wymagane pola (Klient, Usługa, Kwota)
- Sprawdź konsolę backendu czy są błędy
- Sprawdź konsolę przeglądarki (F12) czy są błędy

### **3. "Nie wiem gdzie są faktury"**
**Tymczasowo użyj konsoli:**
```javascript
await salesInvoices.showInvoicesList()
```

---

## 📊 **CO DZIEJE SIĘ PO WYSTAWIENIU FAKTURY:**

### **Backend automatycznie:**
1. ✅ Tworzy fakturę w tabeli `sales_invoices`
   - Numer: FV/2025/11/001
   - Status: unpaid
   
2. ✅ Tworzy płatność w tabeli `payments`
   - Kod: PAY/CYW/JK/001/001
   - Status: pending
   - Powiązanie: invoice_id
   
3. ✅ Jeśli raty - tworzy wpisy w `installment_payments`
   - Rata 1/6: 2000 PLN (15.12.2025) - PENDING
   - Rata 2/6: 2000 PLN (15.01.2026) - PENDING
   - ...

### **Klient widzi (gdy się zaloguje):**
- Fakturę do zapłaty
- Listę rat (jeśli ratalna)
- Może zapłacić:
  - Z salda konta
  - BLIK
  - PayPal
  - Kartą
  - Kryptowalutą

---

## 🧪 **TEST KOŃCOWY:**

```javascript
// 1. Wystaw testową fakturę (z poziomu sprawy)
// 2. Sprawdź w konsoli backendu:
✅ Faktura FV/2025/11/001 wystawiona!
💳 Płatność PAY/CYW/JK/001/001 utworzona!

// 3. Sprawdź w konsoli przeglądarki:
const test = await window.api.request('/sales-invoices');
console.log('Liczba faktur:', test.invoices.length);

// 4. Pokaż listę:
await salesInvoices.showInvoicesList();
```

---

## ✅ **GOTOWE!**

System faktur działa! Wszystkie elementy są połączone:
- ✅ Wystawianie faktur
- ✅ Automatyczne tworzenie płatności
- ✅ Płatności ratalne
- ✅ Integracja z saldem klienta
- ✅ Backend API
- ✅ Frontend moduły

**Jedyne co brakuje:** Łatwy dostęp do listy faktur z menu głównego (używaj tymczasowo konsoli)
