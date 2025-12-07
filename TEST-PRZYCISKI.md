# 🧪 TEST PRZYCISKÓW - INSTRUKCJA DEBUGOWANIA

## ⚠️ PROBLEM:
- Przyciski "← Poprzedni" i "Następny →" nie działają
- Przycisk "📚 Cały kodeks" nie działa

---

## 🔍 JAK SPRAWDZIĆ CO SIĘ DZIEJE:

### **Krok 1: ODŚWIEŻ STRONĘ**
```
CTRL + SHIFT + R
```
**WAŻNE!** Wymuś przeładowanie bez cache!

---

### **Krok 2: OTWÓRZ KONSOLĘ**
```
1. Naciśnij F12
2. Zakładka "Console"
3. Zostaw otwartą
```

---

### **Krok 3: SPRAWDŹ CZY FUNKCJE ISTNIEJĄ**

W konsoli wpisz i naciśnij Enter:
```javascript
typeof window.navigateArticle
```

**Powinno być:** `"function"` ✅  
**Jeśli jest:** `"undefined"` ❌ - funkcja nie została załadowana!

Sprawdź też:
```javascript
typeof window.showFullCode
```

**Powinno być:** `"function"` ✅  
**Jeśli jest:** `"undefined"` ❌ - funkcja nie została załadowana!

---

### **Krok 4: SPRAWDŹ BŁĘDY**

W konsoli szukaj czerwonych błędów:
```
❌ Uncaught ReferenceError: ...
❌ Uncaught TypeError: ...
❌ Failed to load resource: ...
```

**Zrób screenshot jeśli widzisz błędy!**

---

### **Krok 5: SPRAWDŹ ŁADOWANIE SKRYPTÓW**

W konsoli zakładka "Network":
```
1. F12 → Network
2. Filtr: JS
3. Odśwież stronę (CTRL + SHIFT + R)
4. Szukaj:
   - legal-library.js?v=15
   - full-code-viewer.js?v=1
```

**Status powinien być:** 200 (OK) ✅  
**Jeśli jest:** 404 (Not Found) ❌ - plik nie istnieje!

---

### **Krok 6: TEST RĘCZNY**

W konsoli spróbuj wywołać funkcję ręcznie:
```javascript
window.navigateArticle('KC', 445)
```

**Co się dzieje?**
- Jeśli działa → Problem z przyciskami HTML
- Jeśli błąd → Problem z funkcją
- Jeśli "undefined" → Funkcja nie została załadowana

---

## 📋 CHECKLIS TA - WYŚLIJ MI TE INFORMACJE:

```
☐ typeof window.navigateArticle = ?
☐ typeof window.showFullCode = ?
☐ Czy są czerwone błędy w konsoli? (screenshot)
☐ Czy legal-library.js?v=15 załadował się (200 OK)?
☐ Czy full-code-viewer.js?v=1 załadował się (200 OK)?
☐ Co się dzieje gdy wpisujesz: window.navigateArticle('KC', 445)
```

---

## 🔧 MOŻLIWE PRZYCZYNY:

### **1. Cache przeglądarki**
```
Rozwiązanie: CTRL + SHIFT + R (wymuś przeładowanie)
```

### **2. Skrypt się nie załadował**
```
Network → JS → Sprawdź status (200 = OK, 404 = błąd)
```

### **3. Błąd JavaScript**
```
Console → Czerwone błędy → Zrób screenshot
```

### **4. Funkcja w złym scope**
```
typeof window.navigateArticle → Powinno być "function"
```

### **5. Kolejność ładowania**
```
legal-library.js musi być przed użyciem funkcji
```

---

## 🆘 JEŚLI NADAL NIE DZIAŁA:

**Wyślij mi:**
1. Screenshot konsoli (F12 → Console)
2. Screenshot Network (F12 → Network → JS)
3. Wyniki z checklisty powyżej

**Wtedy będę wiedział co naprawić!**

---

**PAMIĘTAJ: CTRL + SHIFT + R przed testem!** 🔄
