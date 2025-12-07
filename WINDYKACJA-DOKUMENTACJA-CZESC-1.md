# 📜 MODUŁ WINDYKACJI NALEŻNOŚCI - CZĘŚĆ 1: ANKIETA

## 🎯 **PRZEZNACZENIE**
System do profesjonalnego dochodzenia należności cywilnych.

## 📊 **STATYSTYKI**
- **12 sekcji** ankiety
- **9 faz** procedury  
- **20 dokumentów** z wzorami
- **Kolor:** 🔴 Czerwony (#e74c3c)

---

## 📋 **ANKIETA (12 SEKCJI)**

### **1. TYP NALEŻNOŚCI** 🎯
- Faktury B2B/B2C
- Umowy cywilne
- Pożyczki
- Czynsz
- Szkoda/odszkodowanie

### **2. WIERZYCIEL** 👤
- Osoba/Przedsiębiorca/Firma
- PESEL, NIP, REGON, KRS
- Dane kontaktowe

### **3. DŁUŻNIK** 🎯
- Pełne/częściowe dane
- Wielkość (dla firm)
- Kontakt

### **4. PODSTAWA PRAWNA** 📄
- Rodzaj umowy (pisemna/ustna/brak)
- Przedmiot
- Warunki płatności
- Dowód wykonania

### **5. WYSOKOŚĆ** 💰
- Kwota główna
- Odsetki (ustawowe/umowne)
- Dodatkowe koszty
- SUMA

### **6. TERMIN** ⏰
- Data wymagalności
- Dni opóźnienia
- Przedłużenia
- Status płatności

### **7. DOWODY** 📎
**Mocne:**
- Umowa pisemna ✅
- Faktura VAT ✅
- Potwierdzenia ✅

**Słabe:**
- Umowa ustna
- SMS/Email
- Świadkowie

**AI Ocena:**
```
Siła: 75%
Szansa: WYSOKA
Rekomendacja: POZEW
```

### **8. KONTAKT** 📞
- Historia komunikacji
- Reakcje dłużnika
- Obietnice płatności
- Wymówki

### **9. PRÓBY ODZYSKANIA** 🔄
- Wezwania (ile, kiedy)
- Negocjacje
- Ugody
- Firma windykacyjna

### **10. SYTUACJA DŁUŻNIKA** 💼
- Czy działa?
- Majątek (lista)
- Dochody
- Inni wierzyciele
- Ryzyko niewypłacalności

### **11. STRATEGIA** 🎯
**Priorytety:**
- ⚡ Szybka ugoda
- 💰 Maksymalna kwota
- ⚖️ Wyrok
- 🤝 Ugoda sądowa

**Gotowość:**
- Negocjacje?
- Sąd?
- Budżet?

### **12. SPECJALNE** ⚠️
- Oszustwo?
- Ukrywa się?
- Groźby?
- Fałszywe dane?

---

## 💡 **KLUCZOWE WSKAZÓWKI**

### **MOCNE vs SŁABE DOWODY**

| MOCNE ✅ | SŁABE ❌ |
|---------|---------|
| Umowa pisemna | Umowa ustna |
| Faktura VAT | Brak faktury |
| Potwierdzenia | "Słowo przeciw słowu" |
| Email z potwierdzeniem | Brak dokumentów |

### **JAK WZMOCNIĆ SŁABE?**

**Brak umowy pisemnej:**
→ Znajdź świadków + korespondencję

**Umowa ustna:**
→ Żądanie wyjaśnień (email) + świadkowie

**Brak faktury:**
→ Wyciąg bankowy + historia współpracy

---

## 📁 **PLIKI ANKIETY**

```
debt-collection-questionnaire-part1.js  (sekcje 1-6)
debt-collection-questionnaire-part2.js  (sekcje 7-12)
debt-collection-questionnaire.js        (łącznik)
```

---

## 🎨 **UŻYCIE W CRM**

### **Warunek wyświetlenia:**
```javascript
case_type === 'debt_collection' || 
case_type === 'windykacja'
```

### **Box w szczegółach sprawy:**
- Gradient: czerwony (#e74c3c → #c0392b)
- Ikona: 📜
- Przycisk: "📜 Wypełnij ankietę windykacyjną"

### **Statystyki:**
- 12 Sekcji
- 9 Faz procedury
- 20 Dokumentów
- E-Sąd ready

---

**Przejdź do CZĘŚĆ 2:** Procedura + Dokumenty
