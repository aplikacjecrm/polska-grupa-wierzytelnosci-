# 🔄 JAK WYMUSIĆ PEŁNE ODŚWIEŻENIE

## ❌ PROBLEM:
Przyciski "← Poprzedni" i "Następny →" nie działają

## ✅ ROZWIĄZANIE:

### **Krok 1: Wymuś pełne odświeżenie**
```
1. CTRL + SHIFT + R  (wymusza pełne odświeżenie)
   LUB
2. F5 + SHIFT        (to samo)
   LUB
3. F12 → Zakładka "Network" → Kliknij prawym "Clear cache" → Odśwież
```

### **Krok 2: Sprawdź wersję w konsoli**
```
1. F12 → Console
2. Szukaj: "[v10] Full Code Viewer ready!"
3. Powinno być: "Z-INDEX: 10000000"
```

### **Krok 3: Test przycisków**
```
1. Kliknij "📚 Kodeksy"
2. Wybierz "📘 Kodeks Cywilny"
3. Wyszukaj "art 420"
4. Kliknij "📚 Cały kodeks"
5. Poczekaj aż się załaduje
6. KLIKNIJ "Następny (Art. 421) →"

Sprawdź w konsoli:
🔄 [navigateContextArticle] Przesuwam do Art. 421
🔍 [searchInFullCode] START
🔍 [searchInFullCode] Numer artykułu: 421
📚 Ładuję artykuły 416-426 (11 artykułów)
✅ Załadowano 11 artykułów z kontekstem
```

### **Krok 4: Jeśli nadal nie działa - Hard Reset**
```
1. Zamknij całkowicie przeglądarkę
2. Otwórz ponownie
3. CTRL + SHIFT + DELETE
4. Wyczyść "Cached images and files"
5. Zamknij okno
6. Wejdź na http://localhost:3500
7. Zaloguj się
8. Spróbuj ponownie
```

---

## 🔍 DEBUGOWANIE:

### **Jeśli przyciski NIE KLIKAJĄ SIĘ:**

1. **F12 → Elements**
2. **Znajdź przycisk "Następny"**
3. **Sprawdź czy ma:**
   ```html
   onclick="window.navigateContextArticle('KC', 421)"
   ```
4. **Kliknij prawym → "Break on" → "attribute modifications"**
5. **Kliknij przycisk**
6. **Zobacz co się dzieje w debuggerze**

### **Sprawdź w konsoli:**
```javascript
// Wpisz:
typeof window.navigateContextArticle

// Powinno być:
"function"

// Jeśli jest "undefined" - skrypt się nie załadował!
```

---

## 💡 NAJCZĘSTSZE PRZYCZYNY:

| Problem | Przyczyna | Rozwiązanie |
|---------|-----------|-------------|
| Przyciski nie klikają | Cache | CTRL + SHIFT + R |
| "undefined" w konsoli | Skrypt nie załadowany | Sprawdź index.html |
| Brak v10 w konsoli | Stara wersja | Wyczyść cache całkowicie |
| Przyciski są, ale nic się nie dzieje | JavaScript error | F12 → Console → szukaj błędów |

---

## ✅ CO POWINNO DZIAŁAĆ (po odświeżeniu):

```
1. Kliknij "Następny (Art. 421) →"
   ↓
2. Konsola: "🔄 [navigateContextArticle] Przesuwam do Art. 421"
   ↓
3. Konsola: "📚 Ładuję artykuły 416-426"
   ↓
4. Artykuły się ładują (progress bar)
   ↓
5. Art. 421 FLASH + GLOW (podświetlony)
   ↓
6. Nowe przyciski: "← Poprzedni (420)" i "Następny (422) →"
   ↓
7. Scroll do Art. 421
```

**Wszystko powinno działać płynnie!** ✅

---

## 🚨 JEŚLI NADAL NIE DZIAŁA:

### **Sprawdź backend:**
```bash
# Terminal:
cd backend
node server.js

# Powinno być:
✅ Serwer działa na http://localhost:3500
✅ Endpoint: POST /api/ai/legal-acts/article
```

### **Sprawdź czy endpoint działa:**
```javascript
// Konsola (F12):
fetch('http://localhost:3500/api/ai/legal-acts/article', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({ code: 'KC', article: '421' })
})
.then(r => r.json())
.then(d => console.log('✅ API działa:', d))
.catch(e => console.error('❌ API nie działa:', e));
```

---

## 📞 OSTATECZNOŚĆ:

Jeśli NIC nie pomaga:

1. **Backend:**
   ```bash
   cd backend
   npm install
   node server.js
   ```

2. **Frontend:**
   ```
   CTRL + SHIFT + R (x3 razy!)
   Zamknij przeglądarkę
   Otwórz ponownie
   ```

3. **Sprawdź:**
   - ✅ Backend działa? `http://localhost:3500`
   - ✅ Console pokazuje v10? "Z-INDEX: 10000000"
   - ✅ Funkcja istnieje? `typeof window.navigateContextArticle`
   - ✅ Przyciski mają onclick? (F12 → Elements → sprawdź)

---

**W 99% przypadków pomaga: CTRL + SHIFT + R** ✅

**Wymuś pełne odświeżenie i będzie działać!** 🚀
