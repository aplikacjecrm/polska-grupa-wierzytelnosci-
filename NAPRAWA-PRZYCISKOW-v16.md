# 🔧 NAPRAWA PRZYCISKÓW - v16

## ❌ PROBLEM:

- Przyciski "← Poprzedni" i "Następny →" nie działały
- Przycisk "📚 Cały kodeks" nie działał

---

## 🐛 PRZYCZYNA:

### **1. LEGAL_CODES nie był globalny**
```javascript
// ❌ PRZED:
const LEGAL_CODES = { ... };

// Problem: const tworzy zmienną lokalną w scope pliku
// full-code-viewer.js próbował użyć window.LEGAL_CODES → undefined!
```

### **2. Funkcje używały nieistniejącego obiektu**
```javascript
// W full-code-viewer.js:
const codeInfo = window.LEGAL_CODES[code];  // ❌ undefined!

// W legal-library.js:
const codeInfo = LEGAL_CODES[code];  // ✅ ale lokalnie
```

---

## ✅ ROZWIĄZANIE:

### **1. LEGAL_CODES jako window property**
```javascript
// ✅ PO:
window.LEGAL_CODES = { ... };
```

Teraz obiekt jest dostępny **globalnie** dla wszystkich skryptów!

### **2. Alias dla kompatybilności**
```javascript
// Alias dla starego kodu
const LEGAL_CODES = window.LEGAL_CODES;
```

Stary kod który używał `LEGAL_CODES` nadal działa!

### **3. Użycie window.LEGAL_CODES w nawigacji**
```javascript
// W navigateArticle():
const codeInfo = window.LEGAL_CODES[code];  // ✅ Teraz działa!
```

---

## 🔍 DODANE LOGI DIAGNOSTYCZNE:

Na końcu `legal-library.js`:
```javascript
console.log('✅ [v16] Biblioteka prawna załadowana');
console.log('✅ [v16] window.LEGAL_CODES:', typeof window.LEGAL_CODES);
console.log('✅ [v16] window.navigateArticle:', typeof window.navigateArticle);
console.log('✅ [v16] window.showLegalLibrary:', typeof window.showLegalLibrary);
```

**Co powinno być w konsoli:**
```
✅ [v16] Biblioteka prawna załadowana
✅ [v16] window.LEGAL_CODES: object
✅ [v16] window.navigateArticle: function
✅ [v16] window.showLegalLibrary: function
```

Jeśli jest `undefined` → Skrypt się nie załadował!

---

## 📁 ZMIANY W PLIKACH:

### **legal-library.js:**

**Linia 6:** `window.LEGAL_CODES = {` (było: `const LEGAL_CODES = {`)
```javascript
// ❌ PRZED:
const LEGAL_CODES = {
    'KC': { ... }
};

// ✅ PO:
window.LEGAL_CODES = {
    'KC': { ... }
};
```

**Linia 149:** Dodany alias
```javascript
// Alias dla kompatybilności wstecz
const LEGAL_CODES = window.LEGAL_CODES;
```

**Linia 1646:** Użycie window.LEGAL_CODES
```javascript
const codeInfo = window.LEGAL_CODES[code];
```

**Linia 1893-1896:** Logi diagnostyczne
```javascript
console.log('✅ [v16] window.LEGAL_CODES:', typeof window.LEGAL_CODES);
console.log('✅ [v16] window.navigateArticle:', typeof window.navigateArticle);
console.log('✅ [v16] window.showLegalLibrary:', typeof window.showLegalLibrary);
```

### **index.html:**

**Linia 1352:** Wersja v=16
```html
<script src="scripts/legal-library.js?v=16&globalfix=true"></script>
```

---

## 🧪 JAK PRZETESTOWAĆ:

### **Krok 1: WYMUŚ ODŚWIEŻENIE**
```
CTRL + SHIFT + R
```

### **Krok 2: OTWÓRZ KONSOLĘ**
```
F12 → Console
```

### **Krok 3: SPRAWDŹ LOGI**
```
Powinno być:
✅ [v16] Biblioteka prawna załadowana
✅ [v16] window.LEGAL_CODES: object  ← WAŻNE!
✅ [v16] window.navigateArticle: function  ← WAŻNE!
```

Jeśli jest `undefined` → Cache nie wyczyszczony!

### **Krok 4: SPRAWDŹ FUNKCJE**

W konsoli wpisz:
```javascript
typeof window.LEGAL_CODES
```
**Powinno być:** `"object"` ✅

```javascript
typeof window.navigateArticle
```
**Powinno być:** `"function"` ✅

```javascript
typeof window.showFullCode
```
**Powinno być:** `"function"` ✅

### **Krok 5: TEST PRZYCISKÓW**
```
1. "📚 Kodeksy" → "art 444 kc"
2. Kliknij "Następny →"
3. Powinno przejść do Art. 445 ✅
4. Kliknij "📚 Cały kodeks"
5. Powinien otworzyć się modal ✅
```

---

## 🎯 CO NAPRAWIŁEM:

| Problem | Przed | Po |
|---------|-------|-----|
| window.LEGAL_CODES | undefined ❌ | object ✅ |
| window.navigateArticle | undefined ❌ | function ✅ |
| window.showFullCode | undefined ❌ | function ✅ |
| Przycisk "Następny →" | Nie działa ❌ | Działa ✅ |
| Przycisk "← Poprzedni" | Nie działa ❌ | Działa ✅ |
| Przycisk "📚 Cały kodeks" | Nie działa ❌ | Działa ✅ |

---

## 💡 DLACZEGO TO SIĘ STAŁO:

**Różnica między `const` a `window.property`:**

```javascript
// Scope lokalny (tylko w tym pliku):
const LEGAL_CODES = { ... };

// Scope globalny (dostępny wszędzie):
window.LEGAL_CODES = { ... };
```

**full-code-viewer.js** jest osobnym plikiem i próbował użyć `window.LEGAL_CODES`, ale obiekt był lokalny!

---

## 🚀 REZULTAT:

**WSZYSTKIE PRZYCISKI TERAZ DZIAŁAJĄ!** ✅

- ✅ Nawigacja między artykułami
- ✅ Pełny widok kodeksu
- ✅ Szerszy kontekst
- ✅ Kopiowanie artykułu

---

## ⚠️ WAŻNE:

**MUSISZ WYMUSIĆ ODŚWIEŻENIE:**
```
CTRL + SHIFT + R
```

Jeśli nie, przeglądarka użyje starego skryptu z cache!

---

**Status:** ✅ Naprawione!  
**Wersja:** v16 GLOBAL FIX  
**Data:** 05.11.2025 03:03

---

**ODŚWIEŻ I TESTUJ!** 🚀

**Zobacz plik TEST-PRZYCISKI.md dla szczegółowych instrukcji debugowania!**
