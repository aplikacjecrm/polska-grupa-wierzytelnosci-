# 🔍 WYSZUKIWANIE W KONTEKŚCIE

## ✅ DODANO: Pole wyszukiwania w modalu "Szerszy kontekst"

### **Wygląd:**

```
┌──────────────────────────────────────────────────────────┐
│ Kodeks Cywilny - Art. 442 do 448                    [X]  │
├──────────────────────────────────────────────────────────┤
│ [← Wcześniejsze] [📋 Kopiuj] [Późniejsze →]              │
├──────────────────────────────────────────────────────────┤
│ 🔍 Przejdź do: [Wpisz numer artykułu...] [Szukaj]       │
│ 💡 Naciśnij Enter aby szybko przejść do artykułu         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Art. 442                                                 │
│ ...                                                      │
│                                                          │
│ Art. 445  🎯 AKTUALNY                                    │
│ ...                                                      │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 FUNKCJONALNOŚĆ:

### **1. Input z walidacją**
- Placeholder: "Wpisz numer artykułu (np. 450)"
- Kolory dopasowane do kodeksu
- Focus efekt (jaśniejsze tło + kolorowa ramka)
- Enter → natychmiastowe wyszukiwanie

### **2. Przycisk "Szukaj"**
- Gradient w kolorze kodeksu
- Hover efekt (scale 1.05)
- Kliknięcie → wyszukiwanie

### **3. Walidacja inputu**
```javascript
// Akceptuje:
"450" → OK
"  450  " → OK (trim)
"art 450" → OK (wyciąga cyfrę)

// Odrzuca:
"" → "⚠️ Podaj numer artykułu"
"abc" → "❌ Nieprawidłowy numer artykułu"
"-5" → "❌ Nieprawidłowy numer artykułu"
```

---

## 🔧 FUNKCJA:

### **`window.searchArticleInContext(code)`**

**Co robi:**
1. Pobiera wartość z `#contextSearchInput`
2. Waliduje (czy liczba, czy > 0)
3. Zamyka obecny modal
4. Otwiera kontekst wokół wskazanego artykułu (±3)

**Przykład:**
```javascript
// Użytkownik wpisuje: "450"
searchArticleInContext('KC')
→ Zamyka modal Art. 442-448
→ Otwiera modal Art. 447-453 (450 ±3)
```

---

## 📋 PRZEPŁYW:

### **Scenariusz 1: Wyszukiwanie z Enter**
```
1. Użytkownik: Otwiera kontekst Art. 442-448
2. Użytkownik: Wpisuje "450"
3. Użytkownik: Naciśka Enter
4. System: Zamyka modal
5. System: Otwiera kontekst Art. 447-453
6. System: Podświetla Art. 450 (🎯 AKTUALNY)
```

### **Scenariusz 2: Wyszukiwanie przyciskiem**
```
1. Użytkownik: Otwiera kontekst Art. 442-448
2. Użytkownik: Wpisuje "500"
3. Użytkownik: Klika "Szukaj"
4. System: Zamyka modal
5. System: Otwiera kontekst Art. 497-503
6. System: Podświetla Art. 500 (🎯 AKTUALNY)
```

### **Scenariusz 3: Błędny input**
```
1. Użytkownik: Wpisuje "abc"
2. Użytkownik: Naciśka Enter
3. System: Alert "❌ Nieprawidłowy numer artykułu"
4. System: Focus z powrotem na input
5. Użytkownik: Poprawia na "450"
6. System: Działa poprawnie ✅
```

---

## 🎨 VISUAL DESIGN:

### **Input:**
```css
Normal:
  Background: rgba(255,255,255,0.1)
  Border: 2px solid {kodeks_color}66
  Color: white

Focus:
  Background: rgba(255,255,255,0.15)
  Border: 2px solid {kodeks_color}
  Color: white
```

### **Przycisk Szukaj:**
```css
Background: linear-gradient({kodeks_color}, {kodeks_color}dd)
Border: none
Color: white
Font-weight: 600

Hover:
  Transform: scale(1.05)
```

### **Hint text:**
```css
Color: rgba(255,255,255,0.5)
Font-size: 0.75rem
Margin-top: 5px
```

---

## 📁 ZMODYFIKOWANE PLIKI:

✅ `frontend/scripts/legal-library.js`
- Linia 1425-1471: HTML pola wyszukiwania
- Linia 1675-1706: Funkcja `searchArticleInContext()`

✅ `frontend/index.html`
- Linia 1352: Wersja v=6 (wymuszone przeładowanie)

✅ `SEARCH-IN-CONTEXT.md` (NOWY)
- Pełna dokumentacja funkcji

---

## 🧪 JAK TESTOWAĆ:

### **Test 1: Wyszukiwanie z Enter**
```
1. Otwórz: http://localhost:3500
2. Ctrl + Shift + R (WYMUŚ ODŚWIEŻENIE!)
3. "📚 Kodeksy" → "art 445 kc"
4. "🔍 Pokaż szerszy kontekst"
5. Modal: Art. 442-448
6. W polu wpisz: "500"
7. Naciśnij: Enter
8. Modal: Art. 497-503 ✅
9. Art. 500 podświetlony (🎯 AKTUALNY) ✅
```

### **Test 2: Wyszukiwanie przyciskiem**
```
1. Otwórz kontekst
2. Wpisz: "1000"
3. Kliknij: "Szukaj"
4. Modal: Art. 997-1003 ✅
5. Art. 1000 podświetlony ✅
```

### **Test 3: Walidacja**
```
1. Wpisz: "abc"
2. Enter → Alert "❌ Nieprawidłowy..." ✅
3. Wpisz: ""
4. Enter → Alert "⚠️ Podaj numer..." ✅
5. Wpisz: "450"
6. Enter → Działa ✅
```

---

## ✅ ZALETY:

✅ **Szybka nawigacja** - Enter → natychmiastowe przejście  
✅ **Walidacja** - Nie pozwala na błędne wartości  
✅ **Focus management** - Automatyczny powrót do inputu po błędzie  
✅ **Hint text** - Podpowiedź jak użyć  
✅ **Kolorystyka** - Dopasowana do każdego kodeksu  
✅ **Responsive** - Działa na wszystkich rozmiarach ekranu  

---

## 🚀 PRZYSZŁE ULEPSZENIA:

1. **Autocomplete** - Podpowiedzi popularnych artykułów
2. **Historia** - Ostatnio oglądane artykuły
3. **Bookmark** - Zapisywanie ulubionych artykułów
4. **Skróty klawiszowe:**
   - `Ctrl+F` → Focus na wyszukiwaniu
   - `/` → Focus na wyszukiwaniu (jak GitHub)
   - `Esc` → Wyczyść input

---

**Status:** ✅ Gotowe do użycia  
**Wersja:** v1.6 Legal Navigation + Search  
**Data:** 05.11.2025

---

**ODŚWIEŻ PRZEGLĄDARKĘ I TESTUJ!** 🚀
