# 🤖 JAK DODAĆ PRZYCISK AI W MODALU SPRAWY

## ✅ CO JUŻ JEST GOTOWE:

Stworzyłem funkcję `showAISearchFromCase(caseData)` która:
- ✅ Otwiera AI Search
- ✅ Automatycznie ustawia kontekst sprawy
- ✅ Zaznacza checkbox kontekstu
- ✅ Przełącza na tryb "Analiza sprawy"

---

## 📝 CO MUSISZ ZROBIĆ:

### Znajdź modal szczegółów sprawy w pliku:
`frontend/scripts/crm-clean.js` lub `crm-case-tabs.js`

### Szukaj fragmentu z nagłówkiem modala:
```javascript
// Przykład jak może wyglądać:
<div class="modal-header">
    <h2>Szczegóły sprawy</h2>
    <button onclick="closeModal()">×</button>
</div>
```

### Dodaj przycisk AI obok przycisku zamknięcia:
```javascript
<div class="modal-header" style="display: flex; justify-content: space-between; align-items: center;">
    <h2>Szczegóły sprawy: ${caseData.case_number}</h2>
    <div style="display: flex; gap: 10px;">
        <!-- NOWY PRZYCISK AI -->
        <button onclick="showAISearchFromCase(${JSON.stringify(caseData).replace(/"/g, '&quot;')})" 
                style="padding: 8px 16px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;"
                title="Zapytaj AI o tę sprawę">
            🤖 Zapytaj AI
        </button>
        
        <button onclick="closeModal()" style="...">×</button>
    </div>
</div>
```

---

## 🎨 ALTERNATYWNIE - PROSTSZA WERSJA:

Jeśli nie możesz znaleźć modala, dodaj przycisk w panelu akcji sprawy:

```javascript
// Gdzieś w szczegółach sprawy, dodaj:
<div class="case-actions" style="margin: 20px 0;">
    <button onclick="showAISearchFromCase(window.crmManager.currentCaseData)" 
            style="width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer;">
        🤖 Zapytaj AI o tę sprawę
    </button>
</div>
```

---

## 🧪 JAK PRZETESTOWAĆ:

### 1. Odśwież stronę
```
Ctrl + Shift + R
```

### 2. Otwórz sprawę
Kliknij **👁️ Otwórz** przy dowolnej sprawie

### 3. Kliknij "🤖 Zapytaj AI"
Powinno:
- ✅ Otworzyć AI Search
- ✅ Automatycznie zaznaczył kontekst
- ✅ Wybrał tryb "Analiza sprawy"

### 4. Zadaj pytanie
```
Jakie dokumenty powinienem przygotować?
```

---

## 🔧 JEŚLI NIE MOŻESZ ZNALEŹĆ MODALA:

### Opcja tymczasowa - dodaj przycisk globalnie:

Edytuj `frontend/index.html` i znajdź element z id sprawy, dodaj tam:

```html
<!-- Gdzieś w sekcji szczegółów sprawy -->
<button id="aiSearchFromCaseBtn" 
        onclick="showAISearchFromCase(window.crmManager?.currentCaseData)" 
        style="position: fixed; bottom: 80px; right: 20px; z-index: 9999; padding: 15px 20px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 50px; box-shadow: 0 4px 15px rgba(102,126,234,0.4); cursor: pointer; font-weight: 600; display: none;">
    🤖 Zapytaj AI
</button>

<script>
// Pokaż przycisk tylko gdy sprawa jest otwarta
setInterval(() => {
    const btn = document.getElementById('aiSearchFromCaseBtn');
    const caseModal = document.querySelector('.case-details-modal'); // Dostosuj selektor!
    
    if (btn && caseModal && window.getComputedStyle(caseModal).display !== 'none') {
        btn.style.display = 'block';
    } else if (btn) {
        btn.style.display = 'none';
    }
}, 500);
</script>
```

---

## 📍 GDZIE SZUKAĆ MODALA:

### W pliku `crm-clean.js` lub `crm-case-tabs.js` szukaj:

1. Funkcji `renderCaseDetails`
2. Funkcji `showCaseModal`  
3. Funkcji `openCase`
4. Zmiennej z HTML modala
5. `<div class="modal"` lub `<div id="caseModal"`

### Przykładowe nazwy funkcji:
```javascript
function renderCaseDetails(caseData) { ... }
function showCaseDetailsModal(caseId) { ... }
async loadCaseDetails(caseId) { ... }
```

---

## ✅ PO DODANIU PRZYCISKU:

1. **Restart backendu** (już działa)
2. **Odśwież frontend** `Ctrl + Shift + R`
3. **Otwórz sprawę**
4. **Kliknij "🤖 Zapytaj AI"**
5. **AI Search otworzy się z kontekstem!**

---

## 🚀 FUNKCJA JEST GOTOWA!

Wystarczy dodać przycisk wywołujący:
```javascript
showAISearchFromCase(caseData)
```

Funkcja automatycznie:
- Ustawi `currentCaseData`
- Otworzy AI Search  
- Zaznaczy kontekst
- Wybierze tryb analizy

---

**Powiedz mi jeśli nie możesz znaleźć gdzie dodać przycisk - pomogę w inny sposób!** 🔧
