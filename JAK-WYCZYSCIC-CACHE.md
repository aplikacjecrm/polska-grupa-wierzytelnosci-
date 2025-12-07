# 🔄 JAK WYCZYŚCIĆ CACHE I ZOBACZYĆ ZMIANY

## ⚠️ PROBLEM: Nie widzisz zmian w aplikacji?

To prawdopodobnie **problem z cache przeglądarki**!

---

## ✅ ROZWIĄZANIE - 3 KROKI:

### **Krok 1: CTRL + SHIFT + R**
```
Windows/Linux: CTRL + SHIFT + R
Mac: CMD + SHIFT + R
```
To **wymuś przeładowanie** strony bez cache.

---

### **Krok 2: Sprawdź konsolę**
```
1. Naciśnij F12
2. Zakładka "Console"
3. Szukaj:
   🔥 COURT DECISIONS VIEWER v9 LOADED - 05.11.2025 02:32!
```

**Jeśli widzisz v9 → OK!** ✅  
**Jeśli widzisz starszą wersję → Cache problem!** ❌

---

### **Krok 3: Wyczyść cache całkowicie**

#### **Chrome/Edge:**
```
1. F12 (otwórz DevTools)
2. Kliknij prawym na przycisk "Odśwież" (obok paska adresu)
3. Wybierz: "Wyczyść pamięć podręczną i wymuś odświeżenie"
```

#### **Firefox:**
```
1. CTRL + SHIFT + DELETE
2. Zaznacz: "Cache"
3. Zakres: "Wszystko"
4. Kliknij: "Wyczyść teraz"
```

#### **Ostateczność:**
```
1. CTRL + SHIFT + DELETE
2. Zaznacz WSZYSTKO
3. Wyczyść
4. Zamknij przeglądarkę
5. Otwórz ponownie
```

---

## 🧪 JAK SPRAWDZIĆ CZY DZIAŁA:

### **Test 1: Konsola**
```bash
1. F12 → Console
2. Zobacz: "🔥 COURT DECISIONS VIEWER v9 LOADED"
3. Jeśli widzisz v9 → Cache wyczyszczony! ✅
```

### **Test 2: Orzeczenia**
```bash
1. "📚 Kodeksy" → "art 444 kc"
2. "⚖️ Orzeczenia sądów"
3. Zobacz kartę orzeczenia:
   - "📋 STRESZCZENIE:" ✅
   - "Zastosowanie artykułu: Art. 444 KC" ✅
   - "[🔗 Pełny wyrok]" ✅
```

### **Test 3: Modal**
```bash
1. Kliknij w kartę orzeczenia
2. Modal powinien pokazać:
   - Treść orzeczenia ✅
   - Link na dole ✅
```

---

## 💡 DLACZEGO TO SIĘ DZIEJE?

**Przeglądarka cachuje (zapisuje) pliki JavaScript aby przyspieszyć ładowanie.**

Problem:
```
Gdy zmieniam kod → Przeglądarka używa STAREJ wersji z cache
```

Rozwiązanie:
```
1. Zmieniam wersję w index.html (v=8 → v=9)
2. Dodaję timestamp (&t=20251105023200)
3. Przeglądarka musi pobrać NOWĄ wersję
```

---

## 🔍 DEBUGOWANIE:

### **Problem: "Nie widzę v9 w konsoli"**
```
→ Cache nie został wyczyszczony
→ Wykonaj "Krok 3: Wyczyść cache całkowicie"
```

### **Problem: "Widzę v9 ale nie ma zmian"**
```
→ Sprawdź w bazie danych czy są linki
→ node backend/scripts/check-decision-data.js
```

### **Problem: "Link nie działa"**
```
→ Sprawdź czy link jest poprawny w bazie
→ Powinien zaczynać się od: https://www.saos.org.pl/
→ NIE: https://www.saos.org.plhttps://...
```

---

## ✅ CHECKLIST:

- [ ] CTRL + SHIFT + R wykonane
- [ ] F12 → Console otworzona
- [ ] "v9 LOADED" widoczne w konsoli
- [ ] Cache wyczyszczony (jeśli potrzeba)
- [ ] Przeglądarka zrestartowana (jeśli potrzeba)
- [ ] Zmiany widoczne

---

## 🆘 JEŚLI NADAL NIE DZIAŁA:

**Opcja 1: Tryb incognito**
```
CTRL + SHIFT + N (Chrome/Edge)
CTRL + SHIFT + P (Firefox)
```
Tryb incognito nie używa cache.

**Opcja 2: Inna przeglądarka**
```
Jeśli używasz Chrome → Spróbuj Firefox
Jeśli używasz Firefox → Spróbuj Chrome
```

**Opcja 3: Sprawdź DevTools Network**
```
1. F12 → Network
2. Odśwież stronę (F5)
3. Znajdź: court-decisions-viewer.js
4. Sprawdź:
   - Status: 200 (OK)
   - Size: Nie powinno być "(from cache)"
```

---

## 📝 PODSUMOWANIE:

✅ **Najprostsze:** CTRL + SHIFT + R  
✅ **Pewne:** Wyczyść cache całkowicie  
✅ **Sprawdzenie:** F12 → Console → "v9 LOADED"  

---

**Data aktualizacji:** 05.11.2025 02:32  
**Wersja skryptu:** v9
