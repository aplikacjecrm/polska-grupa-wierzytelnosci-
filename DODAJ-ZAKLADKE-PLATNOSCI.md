# 💰 JAK DODAĆ ZAKŁADKĘ PŁATNOŚCI

## ✅ ROZWIĄZANIE 1: Dodaj przez konsolę przeglądarki (SZYBKIE)

1. **Otwórz aplikację** w przeglądarce
2. **Kliknij F12** aby otworzyć DevTools
3. **Przejdź do zakładki Console**
4. **Wklej ten kod i naciśnij ENTER:**

```javascript
// Dodaj zakładkę płatności do widoku sprawy
(function() {
    // Nadpisz oryginalną funkcję loadCaseTabContent
    const original = window.crmManager.loadCaseTabContent.bind(window.crmManager);
    
    window.crmManager.loadCaseTabContent = async function(caseId, tabName) {
        console.log('💰 Ładuję zakładkę:', tabName);
        
        // Jeśli to zakładka płatności
        if (tabName === 'payments') {
            const container = document.getElementById('caseTabContentArea');
            if (!container) {
                console.error('❌ Brak kontenera caseTabContentArea');
                return;
            }
            
            // Wywołaj moduł płatności
            if (window.paymentsModule) {
                await window.paymentsModule.renderPaymentsTab(caseId);
            } else {
                container.innerHTML = `
                    <div style="padding: 40px; text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">💰</div>
                        <h2>Moduł Płatności</h2>
                        <p style="color: #999;">Moduł płatności nie został załadowany.</p>
                        <p style="color: #999;">Sprawdź czy plik <code>payments-module.js</code> jest zaimportowany w <code>index.html</code></p>
                    </div>
                `;
            }
            return;
        }
        
        // Dla innych zakładek wywołaj oryginalną funkcję
        return original(caseId, tabName);
    };
    
    console.log('✅ Funkcja loadCaseTabContent została rozszerzona o obsługę płatności!');
})();
```

5. **Odśwież widok sprawy**
6. **Zakładka "💰 Płatności" powinna działać**

---

## ✅ ROZWIĄZANIE 2: Dodaj bezpośrednio do HTML (STAŁE)

### Znajdź plik gdzie renderowany jest widok sprawy:

Szukaj w `frontend/scripts/crm-case-tabs.js` lub `frontend/scripts/crm-clean.js` miejsca gdzie są przyciski zakładek.

Szukaj fragmentu podobnego do:

```html
<button class="tab-btn active" onclick="...loadCaseTabContent(..., 'details')">📋 Szczegóły</button>
<button class="tab-btn" onclick="...loadCaseTabContent(..., 'events')">📅 Wydarzenia</button>
<button class="tab-btn" onclick="...loadCaseTabContent(..., 'documents')">📄 Dokumenty</button>
```

### Dodaj między nimi:

```html
<button class="tab-btn" onclick="crmManager.loadCaseTabContent(${caseId}, 'payments')">💰 Płatności</button>
```

---

## ✅ ROZWIĄZANIE 3: Dodaj przez kod bezpośrednio (UNIVERSAL)

Otwórz konsolę przeglądarki (F12) i wklej:

```javascript
// Znajdź wszystkie przyciski zakładek
const tabs = document.querySelectorAll('.tab-btn');
const lastTab = tabs[tabs.length - 1];

if (lastTab && lastTab.parentElement) {
    // Utwórz nowy przycisk
    const paymentBtn = document.createElement('button');
    paymentBtn.className = 'tab-btn';
    paymentBtn.textContent = '💰 Płatności';
    paymentBtn.onclick = function() {
        // Znajdź ID sprawy z pierwszego przycisku
        const firstBtn = document.querySelector('.tab-btn');
        const onclickCode = firstBtn.getAttribute('onclick');
        const caseId = onclickCode.match(/\d+/)[0];
        
        // Wywołaj
        window.crmManager.loadCaseTabContent(parseInt(caseId), 'payments');
        
        // Oznacz jako aktywny
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        paymentBtn.classList.add('active');
    };
    
    // Wstaw przed ostatnim (Historia)
    lastTab.parentElement.insertBefore(paymentBtn, lastTab);
    
    console.log('✅ Dodano zakładkę "💰 Płatności"!');
}
```

---

## 🔍 JAK SPRAWDZIĆ CZY DZIAŁA:

1. Otwórz sprawę w CRM
2. Powinieneś zobaczyć zakładkę "💰 Płatności"
3. Kliknij na nią
4. Powinien pojawić się widok płatności lub komunikat o braku modułu

---

## ⚠️ JEŚLI NIE WIDZISZ ZAKŁADKI:

### Sprawdź w konsoli czy moduł jest załadowany:

```javascript
console.log('Moduł płatności:', window.paymentsModule);
console.log('CRM Manager:', window.crmManager);
```

### Jeśli `paymentsModule` jest `undefined`:

1. Sprawdź czy w `index.html` jest:
```html
<script src="scripts/modules/payments-module.js?v=2.0&MULTI_PAYMENT=TRUE"></script>
```

2. Odśwież stronę z `Ctrl + Shift + R` (hard refresh)

---

## 📁 GDZIE SZUKAĆ KODU ZAKŁADEK:

Prawdopodobne lokalizacje:

1. `frontend/scripts/crm-case-tabs.js` - funkcja renderująca zakładki sprawy
2. `frontend/scripts/crm-clean.js` - funkcja `viewCase()` lub `loadCaseTabContent()`
3. `frontend/index.html` - jeśli zakładki są statyczne w HTML

---

## 💡 TIP:

Użyj wyszukiwarki w plikach (Ctrl + Shift + F) i szukaj:
- `Szczegóły.*Wydarzenia.*Dokumenty`
- `tab-btn`
- `loadCaseTabContent`

---

**GOTOWE!** Zakładka płatności powinna działać! 🎉
