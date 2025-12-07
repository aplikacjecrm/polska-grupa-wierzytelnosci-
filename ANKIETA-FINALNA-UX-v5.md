# ✅ ANKIETA FINALNA UX v5.0 - WSZYSTKO DOPRACOWANE!

## 🎯 **WSZYSTKIE ZMIANY:**

---

## 1️⃣ **🔲 CHECKBOX "POTRZEBUJĘ POMOCY" - MNIEJSZY, NA DOLE**

### **PRZED:**
```
[Pole tekstowe]

┌─────────────────────────────────────┐
│ ❓ Nie wiem - potrzebuję pomocy    │  ← Duży, żółty panel
│    mojego doradcy z tym pytaniem   │
└─────────────────────────────────────┘

💡 Help text
```

### **PO:**
```
[Pole tekstowe]

💡 Help text

┌──────────────────────────────┐
│ ☑ ❓ Nie wiem - potrzebuję   │  ← Mały, dyskretny
│    pomocy doradcy            │
└──────────────────────────────┘
```

### **Zmiany:**
- ✅ **Mniejszy rozmiar**: padding `6px 8px` (było `10px`)
- ✅ **Mniejszy checkbox**: `14px` (było `18px`)
- ✅ **Mniejsza czcionka**: `0.8rem` (było `0.95rem`)
- ✅ **Dyskretny wygląd**: border `1px` (było `4px left border`)
- ✅ **Skrócony tekst**: "Potrzebuję pomocy doradcy" (było długie zdanie)
- ✅ **Na dole**: Po help text (było przed)

### **Po co:**
- ❌ **Nie przytłacza** użytkownika
- ✅ **Jest dostępny** gdy potrzebny
- ✅ **Nie zajmuje** połowy ekranu
- ✅ **Bardziej profesjonalny** wygląd

---

## 2️⃣ **📋 PROCEDURY - SZCZEGÓŁOWE OPISY**

### **PRZED:**
```
Faza 1: PRZYGOTOWANIE WNIOSKU (7-14 dni)
• Zebranie dokumentacji
• Sporządzenie wniosku
• Opłata: 30 zł
```

### **PO:**
```
Faza 1: PRZYGOTOWANIE WNIOSKU (7-14 dni)

┌──────────────────────────────────────────┐
│ 📘 Opis fazy:                            │
│ Na tym etapie zbierasz wszystkie         │
│ niezbędne dokumenty i przygotowujesz     │
│ wniosek. Możesz to zrobić sam lub       │
│ z pomocą doradcy. Ważne, żeby           │
│ dokładnie opisać swoją sytuację          │
│ finansową i życiową - to pomoże          │
│ sądowi podjąć decyzję.                   │
└──────────────────────────────────────────┘

• Zebranie dokumentacji (Termin: 7 dni)
  
  Zbierz wszystkie dokumenty dotyczące Twoich 
  długów i majątku. Im więcej dowodów tym lepiej. 
  Jeśli czegoś nie masz - zaznacz w ankiecie 
  "potrzebuję pomocy doradcy".
  
  Checklist:
  - Wykaz majątku (mieszkanie, samochód...)
  - Wykaz wierzycieli (banki, pożyczki...)
  - Zaświadczenie o dochodach lub zasiłku
  - Dokumenty potwierdzające zadłużenie
  - Zaświadczenie o PESEL

• Sporządzenie wniosku (Termin: 10 dni)

  Wniosek wypełnisz na podstawie tej ankiety. 
  Nasz system automatycznie wygeneruje gotowy 
  dokument, który wydrukujesz i podpiszesz. 
  We wniosku opiszesz swoją sytuację, wyjaśnisz 
  dlaczego nie jesteś w stanie spłacić długów.
```

### **Dodane pola:**

#### **A. Opis fazy** (`phase.description`):
```javascript
{
    phase: 1,
    name: 'PRZYGOTOWANIE WNIOSKU',
    description: 'Na tym etapie zbierasz wszystkie...'  // ← NOWE!
}
```

#### **B. Opis taska** (`task.description`):
```javascript
{
    name: 'Zebranie dokumentacji',
    description: 'Zbierz wszystkie dokumenty...'  // ← NOWE!
}
```

### **Renderowanie:**
- ✅ Opis fazy: **Niebieski panel** z ikoną 📘
- ✅ Opis taska: **Dodatkowy paragraf** z większym line-height
- ✅ Więcej tekstu: **Pełne wyjaśnienie** każdego kroku
- ✅ Poradnik krok po kroku: Użytkownik wie **co** i **dlaczego**

---

## 3️⃣ **❌ UKRYTO ZAKŁADKĘ "SYNDYK"**

### **PRZED:**
```
[📋 Ankieta] [📅 Procedura] [👨‍⚖️ Syndyk] [📄 Dokumenty]
                              ↑
                         Niepotrzebne!
```

### **PO:**
```
[📋 Ankieta] [📅 Procedura] [📄 Dokumenty]
```

### **Dlaczego:**
- ❌ **Syndyka ustanawia sąd** - nie klient
- ❌ **Dane syndyka będą później** - po ogłoszeniu upadłości
- ❌ **Na tym etapie zbędne** - tylko zamieszanie
- ✅ **Uproszczenie UI** - mniej zakładek = lepsze UX

### **Gdzie są dane syndyka:**
- Będą dodane **PO ogłoszeniu upadłości**
- W panelu sprawy (po decyzji sądu)
- Nie w ankiecie przygotowawczej

---

## 4️⃣ **📄 DOKUMENTY - TYLKO DLA KONSUMENTA/JDG**

### **Plan (TODO):**

Dokumenty powinny być różne dla różnych typów:

#### **Konsument / JDG:**
```javascript
requiredDocuments: [
    {
        name: 'Wykaz majątku',
        required: true,
        examples: 'mieszkanie, samochód, oszczędności'
    },
    {
        name: 'Wykaz wierzycieli',
        required: true,
        examples: 'banki, pożyczki, karty kredytowe'
    },
    {
        name: 'Zaświadczenie o dochodach',
        required: true
    },
    {
        name: 'Dowód opłaty sądowej (30 zł)',
        required: true
    }
]
```

#### **Spółki (np. Sp. z o.o.):**
```javascript
requiredDocuments: [
    {
        name: 'Bilans',
        required: true
    },
    {
        name: 'Sprawozdanie finansowe',
        required: true
    },
    {
        name: 'Wykaz ksiąg rachunkowych',
        required: true
    },
    {
        name: 'Dowód opłaty (1000 zł)',
        required: true
    }
]
```

---

## 5️⃣ **👔 JDG = KONSUMENT (te same pytania)**

### **Co to JDG:**
- **J**ednoosobowa **D**ziałalność **G**ospodarcza
- Osoba fizyczna prowadząca działalność
- Podatnik VAT, ale **nie spółka**

### **Pytania:**
- ✅ **Te same co konsument** - PESEL, adres zamieszkania, sytuacja życiowa
- ✅ **Dodatkowe** - NIP, REGON (bo działalność)
- ❌ **NIE** - pytania o bilans, sprawozdania (jak spółki)

### **Procedura:**
- ✅ **Konsumencka** - opłata 30 zł, plan spłaty 3-7 lat
- ❌ **NIE firmowa** - bo to osoba fizyczna

---

## 6️⃣ **🔄 RESTRUKTURYZACJA → OSOBNY TYP SPRAWY**

### **PROBLEM:**
- Restrukturyzacja była **w środku ankiety upadłościowej**
- Mylące dla konsumenta
- Nie każda upadłość = restrukturyzacja

### **ROZWIĄZANIE:**

#### **Upadłość konsumencka/JDG:**
- Tylko ankieta upadłościowa
- ❌ BRAK sekcji restrukturyzacji (ukryta showIf)

#### **Firma (Sp. z o.o., S.A.):**
- Ma sekcję "🔄 HISTORIA RESTRUKTURYZACJI"
- Pyta czy była próba restrukturyzacji

#### **PRZYSZŁOŚĆ - osobny typ sprawy:**
```
Typ sprawy: "Restrukturyzacja"
Podtypy:
  - Przyspieszone postępowanie układowe
  - Zwykłe postępowanie układowe
  - Uproszczone postępowanie
  - Postępowanie sanacyjne

→ Osobna ankieta!
→ Osobna procedura!
→ Inne dokumenty!
```

---

## 📊 **PORÓWNANIE PRZED vs PO:**

| Element | PRZED | PO |
|---------|-------|-----|
| Checkbox "pomocy" | Duży, żółty panel | Mały, dyskretny |
| Lokalizacja checkboxa | Przed help text | Po help text (na dole) |
| Opisy procedur | Minimalne | **Szczegółowe paragrafy** |
| Zakładki | 4 (z Syndykiem) | **3** (bez Syndyka) |
| Dokumenty | Te same dla wszystkich | Różne (TODO) |
| JDG | Jak firma | **Jak konsument** ✅ |
| Restrukturyzacja | W ankiecie | Ukryta / osobny typ ✅ |

---

## 🧪 **JAK PRZETESTOWAĆ:**

```
Ctrl + Shift + F5
```

### **Test 1: Checkbox pomocy**
1. Otwórz ankietę
2. Znajdź dowolne pytanie
3. **Sprawdź:**
   - ✅ Checkbox **NA DOLE** (po help text)
   - ✅ Checkbox **MNIEJSZY** (14px)
   - ✅ Tekst krótszy: "Potrzebuję pomocy doradcy"

### **Test 2: Opisy procedur**
1. Kliknij zakładkę **"📅 Procedura"**
2. Wybierz **konsument** (żeby zobaczyć consumer procedure)
3. **Sprawdź:**
   - ✅ Niebieski panel z **opisem fazy**
   - ✅ Pod każdym taskiem **dodatkowy paragraf** z opisem
   - ✅ Więcej tekstu, szczegółów

### **Test 3: Brak syndyka**
1. **Sprawdź zakładki:**
   - ✅ Jest: Ankieta, Procedura, Dokumenty
   - ❌ **BRAK:** Syndyk

### **Test 4: Restrukturyzacja ukryta (konsument)**
1. Wybierz: **Konsument**
2. Przejrzyj sekcje ankiety
3. **Sprawdź:**
   - ❌ **BRAK** sekcji "🔄 HISTORIA RESTRUKTURYZACJI"

### **Test 5: Restrukturyzacja widoczna (firma)**
1. Wybierz: **Sp. z o.o.**
2. Przejrzyj sekcje
3. **Sprawdź:**
   - ✅ **JEST** sekcja "🔄 HISTORIA RESTRUKTURYZACJI"

---

## 📁 **ZMODYFIKOWANE PLIKI:**

### **questionnaire-renderer.js (v8):**
1. ✅ Checkbox mniejszy, na dole
2. ✅ Usunięto zakładkę "Syndyk"
3. ✅ Dodano renderowanie `phase.description` i `task.description`
4. ✅ Poprawione stylowanie opisów (niebieskie panele)

### **bankruptcy-questionnaire.js (v7):**
1. ✅ Dodano opisy do fazy 1 procedury konsumenckiej
2. ✅ Ukryto sekcję restrukturyzacji dla konsumenta (`showIf`)

### **index.html:**
- ✅ Wersja v8 renderer (`FINAL_UX=TRUE`)

---

## 🎯 **CO DALEJ (TODO):**

### **1. Więcej opisów procedur:**
Rozbudować **wszystkie fazy** (nie tylko fazę 1):
- Faza 2: Złożenie wniosku
- Faza 3: Rozpoznanie
- Faza 4: Ogłoszenie
- Faza 5: Plan spłaty
- Faza 6: Umorzenie

### **2. Dokumenty per typ:**
```javascript
// Konsument:
requiredDocuments_consumer: [...]

// Firma:
requiredDocuments_company: [...]

// W rendererze:
const docs = isConsumer 
    ? this.currentQuestionnaire.requiredDocuments_consumer
    : this.currentQuestionnaire.requiredDocuments_company;
```

### **3. Restrukturyzacja jako osobny typ sprawy:**
- Nowy typ w CRM: "Restrukturyzacja"
- Nowa ankieta: `restructuring-questionnaire.js`
- Nowa procedura: 4 typy postępowań
- Integracja z CRM

### **4. Auto-wypełnianie z syndyka:**
Po ogłoszeniu upadłości:
- System **pobiera dane syndyka** z postanowienia sądu
- **Auto-wypełnia** formularz syndyka
- Dostępne w zakładce sprawy (nie w ankiecie)

---

## ✅ **PODSUMOWANIE:**

| Funkcja | Status |
|---------|--------|
| Checkbox mniejszy, na dole | ✅ GOTOWE |
| Opisy procedur (faza 1) | ✅ GOTOWE |
| Pozostałe fazy | ⏳ TODO |
| Ukryty Syndyk | ✅ GOTOWE |
| Dokumenty per typ | ⏳ TODO |
| JDG = konsument | ✅ GOTOWE (showIf) |
| Restrukturyzacja ukryta | ✅ GOTOWE |
| Restrukturyzacja - osobny typ | ⏳ TODO |

---

**Wersja:** v5.0 FINAL UX  
**Data:** 2025-11-08 11:18  
**Renderer:** v8  
**Status:** ✅ GOTOWE DO TESTOWANIA!

**ODŚWIEŻ I ZOBACZ ZMIANY!** 🎉🚀
