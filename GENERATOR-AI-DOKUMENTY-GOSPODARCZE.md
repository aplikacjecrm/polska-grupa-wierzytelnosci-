# ✨ GENERATOR DOKUMENTÓW AI - ANKIETA GOSPODARCZA

## 🎉 **CO DODANO:**

Dodano **przycisk "✨ Generuj AI"** do zakładki **📄 Dokumenty** w ankiecie gospodarczej!

---

## 🤖 **DOKUMENTY Z GENERATOREM AI:**

### **4 dokumenty mają przycisk "✨ Generuj AI":**

1. ✅ **Pozew o zapłatę** (`commercial_lawsuit`)
   - 🤖 AI wygeneruje pełny pozew na podstawie ankiety
   - Główne żądanie + uzasadnienie prawne
   - Automatycznie pobiera dane z sekcji 1-9

2. ✅ **Wezwanie do zapłaty** (`payment_demand`)
   - 🤖 AI wygeneruje wezwanie przedsądowe
   - Profesjonalny ton, terminy, konsekwencje
   - Dane z sekcji "Strona przeciwna" + "Roszczenie"

3. ✅ **Pełnomocnictwo procesowe** (`power_of_attorney`)
   - 🤖 AI wygeneruje pełnomocnictwo dla prawnika
   - Reprezentacja w postępowaniu sądowym
   - Dane klienta + dane mecenasa

4. ✅ **Wniosek o zabezpieczenie** (`security_request`)
   - 🤖 AI wygeneruje wniosek o zabezpieczenie roszczenia
   - 🚨 Zamrożenie majątku przed wyrokiem
   - Uzasadnienie + wysokość zabezpieczenia

---

## 🎨 **JAK WYGLĄDA PRZYCISK:**

### **W zakładce "📄 Dokumenty":**

```
┌─────────────────────────────────────────┐
│ Pozew o zapłatę                    *    │
│ 🤖 AI wygeneruje pozew na podstawie     │
│ ankiety - główne żądanie + uzasadnienie │
├─────────────────────────────────────────┤
│ [✨ Generuj AI]  [🗂️ Wybierz z CRM]    │
└─────────────────────────────────────────┘
```

**Przycisk:**
- 🟢 Zielony gradient: `#27ae60` → `#229954`
- ✨ Tekst: **"✨ Generuj AI"**
- 💬 Tooltip: "🤖 AI wygeneruje dokument na podstawie ankiety"
- 🎯 Hover animacja: powiększenie + cień

---

## 📊 **STATYSTYKI DOKUMENTÓW:**

### **Wszystkich:** 15 dokumentów
- ✅ **Wymaganych:** 6
- 📎 **Opcjonalnych:** 9
- 🤖 **Z generatorem AI:** 4

### **Kategorie:**
- ⚖️ **Sądowe (court):** 6 docs
- 📋 **Dowody (evidence):** 7 docs
- 🆔 **Identyfikacja (identification):** 1 doc
- 🔨 **Egzekucja (execution):** 1 doc

---

## 🛠️ **CO ZOSTAŁO ZMIENIONE:**

### **1. `commercial-questionnaire-part3.js` (v1 → v2)**

**Przed:**
```javascript
{ 
    id: 1, 
    name: 'Pozew o zapłatę',
    auto_generate: true  // ❌ Zła właściwość
}
```

**Po:**
```javascript
{ 
    id: 'commercial_lawsuit', 
    name: 'Pozew o zapłatę',
    canGenerate: true,  // ✅ Poprawna właściwość
    description: '🤖 AI wygeneruje pozew na podstawie ankiety...'
}
```

**Zmiany:**
- ✅ ID zmienione z liczb na stringi (łatwiejsze debugowanie)
- ✅ `auto_generate` → `canGenerate` (zgodne z renderer)
- ✅ Dodano ikony 🤖 w opisach
- ✅ Rozbudowano opisy wszystkich dokumentów
- ✅ Dodano szczegóły (np. "min. 30 zł, maks. 100,000 PLN")

---

### **2. `questionnaire-renderer.js` (v54 → v55)**

**Dodano tytuł dla typu `commercial`:**
```javascript
const titles = {
    bankruptcy: 'złożenia wniosku o ogłoszenie upadłości',
    restructuring: 'przeprowadzenia restrukturyzacji',
    compensation: 'dochodzenia odszkodowania',
    debt_collection: 'windykacji należności',
    commercial: 'dochodzenia należności gospodarczych (spór B2B)'  // ✅ NOWY!
};
```

**Efekt:**
```
📄 Dokumenty wymagane
Lista dokumentów potrzebnych do dochodzenia należności gospodarczych (spór B2B).
Do każdego dokumentu masz instrukcję krok po kroku jak go przygotować.
```

---

### **3. `index.html`**

**Zaktualizowano wersje:**
```html
<!-- PRZED -->
<script src="scripts/questionnaires/commercial-questionnaire-part3.js?v=1"></script>
<script src="scripts/questionnaires/questionnaire-renderer.js?v=54"></script>

<!-- PO -->
<script src="scripts/questionnaires/commercial-questionnaire-part3.js?v=2&AI_GENERATOR=TRUE"></script>
<script src="scripts/questionnaires/questionnaire-renderer.js?v=55&COMMERCIAL_DOCS_TITLE=TRUE"></script>
```

---

## 🎯 **JAK DZIAŁA GENERATOR AI:**

### **Krok 1: Użytkownik wypełnia ankietę**
```
📝 9 Sekcji:
1. Nasza Firma (Powód)
2. Strona Przeciwna (Pozwany)
3. Przedmiot Sporu
4. Umowa i Podstawa Prawna
5. Wysokość Roszczenia
... itd
```

### **Krok 2: Przechodzi do zakładki "📄 Dokumenty"**
Widzi checklist:
```
┌─────────────────────────────────────────┐
│ 📋 CHECKLIST DOKUMENTÓW                 │
├─────────────────────────────────────────┤
│ 📄 15 Wszystkich                        │
│ ⭐ 6 Wymaganych                         │
│ 📎 9 Opcjonalnych                       │
│ ✅ 0 Załączonych                        │
├─────────────────────────────────────────┤
│ [████████░░░░░░░░░░░] 0%              │
└─────────────────────────────────────────┘
```

### **Krok 3: Klika "✨ Generuj AI"**
System wywołuje:
```javascript
window.questionnaireRenderer.generateDocument('commercial_lawsuit')
```

### **Krok 4: AI generuje dokument**
```
🤖 Analizuję dane z ankiety...
📝 Tworzę pozew o zapłatę...
⚖️ Dodaję podstawy prawne...
💰 Wyliczam wysokość roszczenia...
✅ Dokument gotowy!
```

### **Krok 5: Dokument gotowy do pobrania**
```
┌─────────────────────────────────────────┐
│ ✅ Załączone dokumenty:                 │
│ 📄 Pozew o zapłatę - GOS_AB01_001.pdf  │
│ [📥 Pobierz] [👁️ Podgląd] [🗑️ Usuń]    │
└─────────────────────────────────────────┘
```

---

## 🔍 **LOGIKA RENDEROWANIA:**

### **W `questionnaire-renderer.js` linia 1379-1397:**

```javascript
${doc.canGenerate ? `
    <button 
        onclick="window.questionnaireRenderer.generateDocument('${doc.id}')"
        style="
            padding: 12px 20px;
            background: linear-gradient(135deg, #27ae60, #229954);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-size: 0.95rem;
            box-shadow: 0 2px 8px rgba(39,174,96,0.3);
            white-space: nowrap;
        "
        title="🤖 AI wygeneruje dokument na podstawie ankiety"
    >
        ✨ Generuj AI
    </button>
` : ''}
```

**Warunek:** `doc.canGenerate === true`

---

## 📝 **PEŁNA LISTA DOKUMENTÓW GOSPODARCZYCH:**

### **⚖️ Sądowe (6):**
1. ✅ **Pozew o zapłatę** ⭐ 🤖
2. ✅ **Pełnomocnictwo procesowe** ⭐ 🤖
3. ✅ **Dowód uiszczenia opłaty sądowej** ⭐
4. **Wniosek o zabezpieczenie** 🤖

### **📋 Dowody (7):**
1. ✅ **Umowa (kopia)** ⭐
2. ✅ **Faktury VAT** ⭐
3. ✅ **Wezwanie do zapłaty** ⭐ 🤖
4. **Korespondencja email/listy**
5. **Dokumenty WZ/CMR**
6. **Zeznania świadków**
7. **Opinie ekspertów/biegłych**

### **💰 Pozostałe (2):**
1. **Odpis z KRS przeciwnika** (identification)
2. **Dokumentacja księgowa** (evidence)
3. **Potwierdzenia przelewów** (evidence)
4. **Tytuł wykonawczy** (execution)

**Legenda:**
- ⭐ = Wymagane (`required: true`)
- 🤖 = Generator AI (`canGenerate: true`)

---

## 🚀 **JAK PRZETESTOWAĆ:**

### **Krok 1: Wyczyść cache**
```
Ctrl + Shift + R
```

### **Krok 2: Otwórz sprawę GOS/**
1. Stwórz sprawę `case_type = 'commercial'`
2. Lub numer `GOS/AB01/001`

### **Krok 3: Wypełnij ankietę**
1. Kliknij **"💼 Wypełnij ankietę gospodarczą"**
2. Wypełnij 9 sekcji (chociaż podstawowe)

### **Krok 4: Przejdź do zakładki "📄 Dokumenty"**

### **Krok 5: Zobacz przyciski AI!**
```
Pozew o zapłatę
[✨ Generuj AI] [🗂️ Wybierz z CRM]

Wezwanie do zapłaty  
[✨ Generuj AI] [🗂️ Wybierz z CRM]

Pełnomocnictwo procesowe
[✨ Generuj AI] [🗂️ Wybierz z CRM]

Wniosek o zabezpieczenie
[✨ Generuj AI] [🗂️ Wybierz z CRM]
```

### **Krok 6: Kliknij "✨ Generuj AI"**
AI wygeneruje dokument! 🎉

---

## ✅ **PODSUMOWANIE:**

- ✅ **4 dokumenty** z generatorem AI
- ✅ **15 dokumentów** łącznie
- ✅ **Stringowe ID** (lepsze debugowanie)
- ✅ **Ikony 🤖** w opisach
- ✅ **Rozbudowane opisy** wszystkich docs
- ✅ **Tytuł commercial** w renderer
- ✅ **Styl jednolity** z innymi ankietami

---

**GENERATOR AI GOTOWY! 🤖✨🚀**
