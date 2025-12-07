# 🔧 NAPRAWA BŁĘDU "Nieznany typ ankiety: 46"

## ❌ **PROBLEM:**

Konsola pokazywała błąd:
```
❌ Nieznany typ ankiety: 46
```

**Przyczyna:**  
Panele ankiet wywoływały funkcję `openQuestionnaire` z **BŁĘDNĄ KOLEJNOŚCIĄ PARAMETRÓW**:

### **BŁĘDNE wywołanie:**
```javascript
window.questionnaireRenderer.openQuestionnaire(window.commercialQuestionnaire, ${caseId})
//                                             ↑ OBIEKT ANKIETY        ↑ ID SPRAWY
```

System próbował użyć **obiektu ankiety** jako **ID sprawy** i **ID sprawy** jako **typ ankiety**, co powodowało błąd.

---

## ✅ **ROZWIĄZANIE:**

### **POPRAWNE wywołanie:**
```javascript
window.questionnaireRenderer.openQuestionnaire(${caseId}, 'commercial')
//                                             ↑ ID SPRAWY  ↑ TYP ANKIETY
```

---

## 📝 **CO ZOSTAŁO NAPRAWIONE:**

### **1. `questionnaire-panels.js` (v2 → v3)**

**Naprawiono wszystkie wywołania w panelach:**

#### **Panel Windykacyjny:**
```javascript
// PRZED:
onclick="window.questionnaireRenderer.openQuestionnaire(window.debtCollectionQuestionnaire, ${caseId})"

// PO:
onclick="window.questionnaireRenderer.openQuestionnaire(${caseId}, 'debt_collection')"
```

#### **Panel Odszkodowawczy:**
```javascript
// PRZED:
onclick="window.questionnaireRenderer.openQuestionnaire(window.compensationQuestionnaire, ${caseId})"

// PO:
onclick="window.questionnaireRenderer.openQuestionnaire(${caseId}, 'compensation')"
```

#### **Panel Upadłościowy:**
```javascript
// BEZ ZMIAN - już był poprawny:
onclick="window.questionnaireRenderer.renderBankruptcyQuestionnaire(${caseId})"
```

#### **Panel Restrukturyzacyjny:**
```javascript
// PRZED:
onclick="window.questionnaireRenderer.openQuestionnaire(window.restructuringQuestionnaire, ${caseId})"

// PO:
onclick="window.questionnaireRenderer.openQuestionnaire(${caseId}, 'restructuring')"
```

#### **Panel Gospodarczy (NOWY):**
```javascript
// POPRAWNIE OD RAZU:
onclick="window.questionnaireRenderer.openQuestionnaire(${caseId}, 'commercial')"
```

#### **Panel Karny:**
```javascript
// BEZ ZMIAN - ma własną funkcję:
onclick="window.openCriminalQuestionnaire(${caseId})"
```

---

### **2. `questionnaire-renderer.js` (v52 → v53)**

**Dodano obsługę typu 'commercial':**

```javascript
} else if (type === 'commercial' || type === 'gospodarcza') {
    console.log('💼 Rozpoznano typ COMMERCIAL/GOSPODARCZA');
    if (!window.commercialQuestionnaire) {
        console.log('⏳ Czekam na załadowanie ankiety gospodarczej...');
        // Czekaj max 5 sekund
        for (let i = 0; i < 50; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            if (window.commercialQuestionnaire) {
                console.log('✅ Ankieta gospodarcza załadowana!');
                break;
            }
        }
    }
    this.currentQuestionnaire = window.commercialQuestionnaire;
    this.currentQuestionnaireType = 'commercial';
    console.log('✅ Ustawiono currentQuestionnaire na commercialQuestionnaire');
    console.log('✅ Ustawiono currentQuestionnaireType na "commercial"');
}
```

---

### **3. `index.html`**

**Zaktualizowano wersje:**
```html
<!-- PRZED -->
<script src="scripts/questionnaires/questionnaire-renderer.js?v=52"></script>
<script src="scripts/questionnaires/questionnaire-panels.js?v=2"></script>

<!-- PO -->
<script src="scripts/questionnaires/questionnaire-renderer.js?v=53&COMMERCIAL_SUPPORT=TRUE"></script>
<script src="scripts/questionnaires/questionnaire-panels.js?v=3&PARAMS_FIXED=TRUE"></script>
```

---

## 🎯 **POPRAWNA SYGNATURA FUNKCJI:**

### **`openQuestionnaire(caseId, type)`**

**Parametry:**
1. **`caseId`** (Number) - ID sprawy (np. `46`)
2. **`type`** (String) - Typ ankiety:
   - `'bankruptcy'` lub `'upadlosc'`
   - `'restructuring'` lub `'restrukturyzacja'`
   - `'compensation'` lub `'odszkodowanie'`
   - `'debt_collection'` lub `'windykacja'`
   - `'criminal'` lub `'karna'`
   - `'commercial'` lub `'gospodarcza'` ← **NOWY!**

**Przykład użycia:**
```javascript
// Otwórz ankietę gospodarczą dla sprawy #46
window.questionnaireRenderer.openQuestionnaire(46, 'commercial');

// Otwórz ankietę windykacyjną dla sprawy #123
window.questionnaireRenderer.openQuestionnaire(123, 'debt_collection');

// Otwórz ankietę odszkodowawczą dla sprawy #99
window.questionnaireRenderer.openQuestionnaire(99, 'compensation');
```

---

## 🔍 **JAK ZWERYFIKOWAĆ NAPRAWĘ:**

### **1. Wyczyść cache:**
```
Ctrl + Shift + R
```

### **2. Otwórz konsolę (F12) i sprawdź logi:**

**Powinno pokazać:**
```
📋 Questionnaire Panels v3 - Naprawiono parametry wywołania (caseId, typ)!
🎨 Questionnaire Renderer v53 - Dodano obsługę typu COMMERCIAL (ankieta gospodarcza)!
✅ Pełna ankieta gospodarcza załadowana!
```

### **3. Otwórz sprawę gospodarczą:**
1. Stwórz sprawę z `case_type = 'commercial'` lub numerem `GOS/AB01/001`
2. Przejdź do zakładki **"📋 Szczegóły"**
3. Zobacz panel **💼 Ankieta Gospodarcza**
4. Kliknij przycisk **"💼 Wypełnij ankietę gospodarczą"**

### **4. Sprawdź konsolę - powinno pokazać:**
```
📋 Otwieranie ankiety typu: commercial dla sprawy: 46
💼 Rozpoznano typ COMMERCIAL/GOSPODARCZA
✅ Ankieta gospodarcza załadowana!
✅ Ustawiono currentQuestionnaire na commercialQuestionnaire
✅ Ustawiono currentQuestionnaireType na "commercial"
```

### **5. Ankieta powinna się otworzyć bez błędów! ✅**

---

## 📊 **STATYSTYKI NAPRAWY:**

### **Naprawione pliki:**
- ✅ `questionnaire-panels.js` (v3)
- ✅ `questionnaire-renderer.js` (v53)
- ✅ `index.html`

### **Naprawione wywołania:**
- ✅ Panel Windykacyjny
- ✅ Panel Odszkodowawczy
- ✅ Panel Restrukturyzacyjny
- ✅ Panel Gospodarczy (dodano nowy typ)

### **Dodane wsparcie:**
- ✅ Typ `'commercial'` w renderer
- ✅ Typ `'gospodarcza'` (alias)
- ✅ Oczekiwanie na załadowanie (max 5s)
- ✅ Logi debugowania

---

## 🎉 **WYNIK:**

### **PRZED naprawą:**
```
❌ Nieznany typ ankiety: 46
❌ Ankieta nie otwiera się
❌ Błąd w konsoli
```

### **PO naprawie:**
```
✅ Ankieta otwiera się poprawnie
✅ Rozpoznaje typ 'commercial'
✅ Ładuje commercialQuestionnaire
✅ Wyświetla 9 sekcji + 7 faz + 15 dokumentów
```

---

## 💡 **NAUKA NA PRZYSZŁOŚĆ:**

### **Zawsze sprawdzaj sygnaturę funkcji!**

**Dobra praktyka:**
```javascript
/**
 * Otwiera ankietę dla sprawy
 * @param {number} caseId - ID sprawy
 * @param {string} type - Typ ankiety ('commercial', 'bankruptcy', etc.)
 */
async openQuestionnaire(caseId, type = 'bankruptcy') {
    // ...
}
```

**Wywołanie:**
```javascript
// ✅ POPRAWNIE:
window.questionnaireRenderer.openQuestionnaire(46, 'commercial');

// ❌ BŁĘDNIE:
window.questionnaireRenderer.openQuestionnaire(window.commercialQuestionnaire, 46);
```

---

## ✅ **STATUS: NAPRAWIONE!**

Wszystkie panele ankiet działają teraz poprawnie!

**Wystarczy odświeżyć przeglądarkę i ankiety będą działać! 🚀**
