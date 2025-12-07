# ✅ SYSTEM "POTRZEBUJĘ POMOCY DORADCY"

## 🎯 **PROBLEM:**

Klienci wypełniając ankietę upadłościową często:
- ❌ Nie wiedzą jak odpowiedzieć na pytania prawne/finansowe
- ❌ Blokują się na obowiązkowych polach
- ❌ Nie mogą przejść dalej bez wypełnienia
- ❌ Frustrują się i porzucają ankietę

---

## 💡 **ROZWIĄZANIE:**

**Checkbox przy KAŻDYM pytaniu:**
```
❓ Nie wiem - potrzebuję pomocy mojego doradcy z tym pytaniem
```

### **Jak działa:**

1. **Klient zaznacza checkbox:**
   - ✅ Pole przestaje być wymagane (może pominąć)
   - ✅ Tło pola zmienia się na żółte (#fffbf0)
   - ✅ Border zmienia się na pomarańczowy (#ffc107)
   - ✅ Placeholder: "❓ Pytanie przekazane do doradcy - możesz pominąć"
   - ✅ Może przejść dalej

2. **Progres ankiety:**
   - ✅ Pytanie z "potrzebuję pomocy" = pytanie odpowiedziane
   - ✅ Progress bar się zwiększa
   - ✅ Sekcja jest ukończona

3. **Zapis ankiety:**
   - ✅ Zapisuje się `${fieldId}_needsAdvice: 'true'`
   - ✅ Ankieta jest kompletna (można zapisać)

4. **Mecenas widzi raport:**
   - ✅ Przy generowaniu dokumentów → alert z listą pytań wymagających pomocy
   - ✅ "Skontaktuj się z klientem przed wygenerowaniem dokumentów"

---

## 📊 **PRZYKŁAD:**

### **Pytanie:**
```
💵 Suma wymagalnych zobowiązań pieniężnych (PLN) *
[__________________________]

❓ Nie wiem - potrzebuję pomocy mojego doradcy z tym pytaniem [ ]
```

### **Klient zaznacza checkbox:**
```
💵 Suma wymagalnych zobowiązań pieniężnych (PLN) *
[❓ Pytanie przekazane do doradcy - możesz pominąć] ← żółte tło

✅ Nie wiem - potrzebuję pomocy mojego doradcy z tym pytaniem [✓]
```

---

## 🎨 **WYGLĄD:**

### **Normalny checkbox (żółty panel):**
```html
<div style="
    margin-top: 12px; 
    padding: 10px; 
    background: #fff3cd; 
    border-left: 4px solid #ffc107; 
    border-radius: 4px;
">
    <label style="display: flex; align-items: center; gap: 8px;">
        <input type="checkbox" ... />
        <span style="color: #856404; font-weight: 600;">
            ❓ Nie wiem - potrzebuję pomocy mojego doradcy z tym pytaniem
        </span>
    </label>
</div>
```

### **Pole po zaznaczeniu:**
```css
background: #fffbf0;  /* Jasnożółte */
border-color: #ffc107; /* Pomarańczowy */
placeholder: "❓ Pytanie przekazane do doradcy - możesz pominąć"
```

---

## 🔧 **TECHNICZNE SZCZEGÓŁY:**

### **1. Funkcja toggleNeedsAdvice():**

```javascript
toggleNeedsAdvice(fieldId, checked) {
    // Zapisz w answers
    this.answers[`${fieldId}_needsAdvice`] = checked ? 'true' : 'false';
    
    const field = document.getElementById(fieldId);
    
    if (checked) {
        // ZAZNACZONO:
        field.removeAttribute('required');
        field.placeholder = '❓ Pytanie przekazane do doradcy - możesz pominąć';
        field.style.background = '#fffbf0';
        field.style.borderColor = '#ffc107';
    } else {
        // ODZNACZONO:
        // Przywróć required, placeholder, kolory
    }
    
    this.updateProgress();
}
```

### **2. Zapis do answers:**

```javascript
answers: {
    "personal_situation_monthly_income": "3500",
    "personal_situation_monthly_income_needsAdvice": "false",
    
    "insolvency_total_debt": "",
    "insolvency_total_debt_needsAdvice": "true",  // ← Potrzebuje pomocy!
    
    "creditors_creditor_name": "Bank ABC",
    "creditors_creditor_name_needsAdvice": "false"
}
```

### **3. Progress - pytanie OK jeśli:**

```javascript
const hasAnswer = this.answers[fieldId] && this.answers[fieldId].length > 0;
const needsAdvice = this.answers[`${fieldId}_needsAdvice`] === 'true';

return hasAnswer || needsAdvice; // ← JEDNO Z DWÓCH!
```

### **4. Raport dla mecenasa:**

```javascript
getQuestionsNeedingAdvice() {
    const needsAdviceList = [];
    
    Object.keys(this.answers).forEach(key => {
        if (key.endsWith('_needsAdvice') && this.answers[key] === 'true') {
            // Znajdź szczegóły pytania
            needsAdviceList.push({
                section: "💭 TWOJA SYTUACJA OSOBISTA",
                question: "💵 Suma zobowiązań pieniężnych",
                fieldId: "insolvency_total_debt",
                currentAnswer: "(brak odpowiedzi)"
            });
        }
    });
    
    return needsAdviceList;
}
```

### **5. Alert przy generowaniu dokumentów:**

```javascript
const needsAdvice = this.getQuestionsNeedingAdvice();

if (needsAdvice.length > 0) {
    alert(`
        ⚠️ UWAGA: Klient potrzebuje pomocy z 3 pytaniami:
        
        1. 💭 TWOJA SYTUACJA OSOBISTA → Suma zobowiązań
        2. 💰 NIEWYPŁACALNOŚĆ → Data niewypłacalności
        3. 👥 WIERZYCIELE → Wysokość zobowiązania
        
        ✅ Skontaktuj się z klientem przed wygenerowaniem dokumentów!
    `);
}
```

---

## 🧪 **JAK PRZETESTOWAĆ:**

### **1. Hard refresh:**
```
Ctrl + Shift + F5
```

### **2. Otwórz ankietę upadłościową**

### **3. Test checkboxa:**

1. Wybierz "Konsument"
2. Znajdź pytanie: **"💵 Miesięczny dochód netto (PLN) *"**
3. NIE WYPEŁNIAJ pola
4. Zaznacz: **"❓ Nie wiem - potrzebuję pomocy"**
5. **Sprawdź:**
   - ✅ Pole zmienia kolor na żółty
   - ✅ Border pomarańczowy
   - ✅ Placeholder: "❓ Pytanie przekazane..."
   - ✅ Progress bar się zwiększa
   - ✅ Możesz przejść dalej

### **4. Test raportu:**

1. Zaznacz "potrzebuję pomocy" przy 2-3 pytaniach
2. Wypełnij resztę ankiety
3. Kliknij **"📄 Generuj dokumenty"**
4. **Sprawdź:**
   - ✅ Alert: "Klient potrzebuje pomocy z 3 pytaniami"
   - ✅ Lista pytań wyświetla się
   - ✅ "Skontaktuj się z klientem..."

---

## 📋 **KORZYŚCI:**

### **Dla klienta:**
- ✅ Nie blokuje się na trudnych pytaniach
- ✅ Może dokończyć ankietę
- ✅ Nie frustruje się
- ✅ Wie że doradca mu pomoże

### **Dla mecenasa:**
- ✅ Widzi które pytania wymagają konsultacji
- ✅ Może przygotować się do rozmowy
- ✅ Nie generuje dokumentów z lukami
- ✅ Lepszy kontakt z klientem

### **Dla systemu:**
- ✅ Więcej ukończonych ankiet
- ✅ Lepsza jakość danych
- ✅ Mniej porzuconych formularzy
- ✅ Lepsze UX

---

## 💾 **ZAPIS DO BAZY:**

### **Backend zapisuje:**

```json
{
  "case_id": 123,
  "questionnaire_type": "bankruptcy",
  "answers": {
    "debtor_type_entity_type": "consumer",
    "personal_situation_monthly_income": "3500",
    "personal_situation_monthly_income_needsAdvice": "false",
    "insolvency_total_debt": "",
    "insolvency_total_debt_needsAdvice": "true",
    "creditors_creditor_name": "Bank XYZ",
    "creditors_creditor_name_needsAdvice": "false"
  },
  "completed": true,
  "created_at": "2025-11-08 11:06:00"
}
```

### **Mecenas może wyciągnąć:**

```sql
SELECT answers FROM case_questionnaires WHERE case_id = 123;

-- Parsuje JSON i szuka:
-- *_needsAdvice: "true"
```

---

## 🎯 **PRZYSZŁE ROZSZERZENIA:**

### **1. Email do mecenasa:**
```
📧 Subject: Klient potrzebuje pomocy z ankietą

Sprawa: #123 - Jan Kowalski
Typ: Upadłość konsumencka

Klient potrzebuje pomocy z 3 pytaniami:
1. Suma zobowiązań pieniężnych
2. Data niewypłacalności  
3. Wysokość zobowiązania u wierzyciela "Bank ABC"

[Otwórz ankietę] [Skontaktuj się z klientem]
```

### **2. Panel mecenasa - lista pytań:**
```
┌──────────────────────────────────────┐
│ ❓ PYTANIA WYMAGAJĄCE POMOCY (3)    │
├──────────────────────────────────────┤
│ Jan Kowalski - Upadłość #123        │
│ • Suma zobowiązań                    │
│ • Data niewypłacalności              │
│ • Wierzyciel #1 - wysokość           │
│                  [Pomóż klientowi]   │
└──────────────────────────────────────┘
```

### **3. Automatyczne przypomnienie:**
```
Po 24h jeśli klient zaznaczył "potrzebuję pomocy":
→ SMS/Email: "Mecenas Jan Kowalski skontaktuje się z Tobą w sprawie ankiety"
```

---

## 📊 **STATYSTYKI (możliwe):**

- Ile % pytań wymaga pomocy?
- Które pytania są najtrudniejsze?
- Czy klienci kończą ankietę częściej z tą opcją?

---

## ✅ **STATUS: GOTOWE DO UŻYCIA!**

**Każde pytanie ma teraz checkbox "Potrzebuję pomocy"!**

**ODŚWIEŻ I TESTUJ!** 🚀🎉

---

**Wersja:** v1.0  
**Data:** 2025-11-08 11:06  
**Plik:** `questionnaire-renderer.js` v6
