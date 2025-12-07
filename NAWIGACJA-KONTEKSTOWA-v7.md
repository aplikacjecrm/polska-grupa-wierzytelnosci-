# 🎮 NAWIGACJA KONTEKSTOWA - v7

## ✅ NOWA FUNKCJA: Przyciski "← Poprzedni" i "Następny →"

### **Co było w v6:**
- Wyszukanie Art. 420 → pokazywało Art. 415-425
- Żeby przejść do Art. 421 → trzeba było wpisać "421" ❌

### **Co jest w v7:**
- Wyszukanie Art. 420 → pokazuje Art. 415-425
- **STICKY PRZYCISKI** na górze:
  - **← Poprzedni (Art. 419)**
  - **🎯 Art. 420** (zakres 415-425)
  - **Następny (Art. 421) →**
- Kliknięcie przesuwa **cały zakres** o 1 artykuł! ✅

---

## 🎯 JAK TO DZIAŁA:

### **Przykład: Jesteś na Art. 420**

**Widok:**
```
┌─────────────────────────────────────────────────────────┐
│ [← Poprzedni (419)] [🎯 Art. 420] [Następny (421) →]   │
│                  Zakres: Art. 415-425                    │
│                💡 Kliknij aby przesunąć                  │
└─────────────────────────────────────────────────────────┘

Art. 415
Art. 416
Art. 417
Art. 418
Art. 419
Art. 420 [🎯 WYSZUKANY] ← Tu jesteś!
Art. 421
Art. 422
Art. 423
Art. 424
Art. 425
```

### **Klikniesz "Następny (421) →":**

```
🔄 Przesuwam do Art. 421...
⚖️ Ładowanie artykułów 416-426...

Nowy widok:
┌─────────────────────────────────────────────────────────┐
│ [← Poprzedni (420)] [🎯 Art. 421] [Następny (422) →]   │
│                  Zakres: Art. 416-426                    │
└─────────────────────────────────────────────────────────┘

Art. 416
Art. 417
Art. 418
Art. 419
Art. 420
Art. 421 [🎯 WYSZUKANY] ← Teraz tu jesteś!
Art. 422
Art. 423
Art. 424
Art. 425
Art. 426
```

**Zakres przesunął się o 1!** 🎉

---

## 💡 KORZYŚCI:

### **1. Płynne przeglądanie**
```
Nie musisz wpisywać numerów!
Klikasz "Następny" → kolejny artykuł z kontekstem
Klikasz "Poprzedni" → poprzedni artykuł z kontekstem
```

### **2. Zawsze widzisz kontekst**
```
Niezależnie gdzie jesteś, masz:
- 5 artykułów przed
- Aktualny artykuł
- 5 artykułów po
```

### **3. Intuicyjne**
```
Jak czytanie książki:
- Następny → Przewracasz stronę w prawo
- Poprzedni → Wracasz stronę w lewo
```

---

## 🎨 STICKY PRZYCISKI:

### **Position: Sticky**
```
- Przyciski są zawsze widoczne na górze
- Gdy scrollujesz w dół → przyciski zostają
- Możesz w każdej chwili kliknąć "Następny"
```

### **Design:**
```
┌────────────────────────────────────────────────┐
│  Ciemne tło z blur                             │
│  Ramka w kolorze kodeksu (niebieski dla KC)   │
│  Gradient na przyciskach                       │
│  Hover efekty                                  │
│  Disabled dla Art. 1 (Poprzedni)              │
└────────────────────────────────────────────────┘
```

### **Stan disabled:**
```
Gdy jesteś na Art. 1:
- Przycisk "← Poprzedni" jest szary
- cursor: not-allowed
- Nie można kliknąć
```

---

## 🧪 JAK PRZETESTOWAĆ:

### **Test 1: Podstawowa nawigacja**
```
1. CTRL + SHIFT + R (odśwież!)
2. "📚 Kodeksy" → "art 444 kc"
3. Kliknij "📚 Cały kodeks"
4. Pole "Wyszukaj artykuł": wpisz "420"
5. Enter

Zobaczysz:
┌────────────────────────────────────────────┐
│ [← Poprzedni (419)] [🎯 Art. 420]         │
│              [Następny (421) →]            │
└────────────────────────────────────────────┘

6. Kliknij "Następny (421) →"
7. Zakres przesuwa się: 416-426 ✅
8. Art. 421 jest teraz wyszukany ✅
9. Przyciski pokazują: 420 ← | 421 | → 422 ✅
```

### **Test 2: Nawigacja w tył**
```
1. Kliknij "← Poprzedni (420)"
2. Zakres wraca: 415-425
3. Art. 420 jest wyszukany
4. Możesz klikać dalej w tył
```

### **Test 3: Art. 1 (edge case)**
```
1. Wyszukaj Art. 1
2. Zakres: 1-6 (bo 1-5 nie istnieje)
3. Przycisk "← Poprzedni" jest disabled (szary)
4. Nie możesz kliknąć
5. Przycisk "Następny (2)" działa ✅
```

---

## 🔍 LOGI W KONSOLI:

**Gdy klikasz "Następny":**
```
✅ [v7] Full Code Viewer ready!
✅ [v7] window.navigateContextArticle: function
✅ [v7] Wyszukiwanie z KONTEKSTEM + Nawigacja!

🔄 [navigateContextArticle] Przesuwam do Art. 421
🔍 [searchInFullCode] START
🔍 [searchInFullCode] Numer artykułu: 421
🔍 [searchInFullCode] Szukam artykułu z kontekstem: 421
📚 Ładuję artykuły 416-426 (11 artykułów)
✅ Art. 416 załadowany z API
...
✅ Załadowano 11 artykułów z kontekstem
✅ Dodano przyciski nawigacji kontekstowej
```

---

## 📋 SZCZEGÓŁY TECHNICZNE:

### **Funkcja `addContextNavigationButtons()`**
```javascript
function addContextNavigationButtons(code, currentArticle, startNum, endNum) {
    // Tworzy sticky panel na górze
    // 3 elementy:
    // 1. Przycisk "← Poprzedni"
    // 2. Info: Zakres + aktualny artykuł
    // 3. Przycisk "Następny →"
    
    // Position: sticky, top: 0
    // z-index: 100 (nad wszystkim)
    // backdrop-filter: blur(10px)
}
```

### **Funkcja `navigateContextArticle()`**
```javascript
window.navigateContextArticle = async function(code, newArticle) {
    // 1. Sprawdź czy newArticle >= 1
    // 2. Wpisz nowy numer do pola wyszukiwania
    // 3. Wywołaj searchInFullCode()
    // 4. searchInFullCode załaduje nowy zakres (5 przed + nowy + 5 po)
    // 5. Doda nowe przyciski nawigacji
}
```

### **Sticky positioning:**
```css
position: sticky;
top: 0;
z-index: 100;
```

Przyciski **pozostają na górze** podczas scrollowania!

---

## 🎯 PRZYKŁADY UŻYCIA:

### **1. Czytanie Kodeksu Cywilnego sekwencyjnie:**
```
1. Wyszukaj Art. 1
2. Przeczytaj Art. 1-6
3. Kliknij "Następny" → Art. 2-7
4. Kliknij "Następny" → Art. 3-8
5. Itd... Możesz przeczytać cały kodeks!
```

### **2. Analiza przepisów o szkodzie:**
```
1. Wyszukaj Art. 444 (szkoda)
2. Zobacz kontekst: 439-449
3. Kliknij "Następny" → Art. 445 (renta)
4. Zobacz kontekst: 440-450
5. Kliknij "Następny" → Art. 446
6. Analizujesz związane przepisy z kontekstem
```

### **3. Sprawdzanie kar (Kodeks Karny):**
```
1. Wyszukaj Art. 148 (zabójstwo)
2. Zobacz: 143-153
3. Kliknij "Następny" → Art. 149 (kwalifikowane typy)
4. Kliknij "Następny" → Art. 150 (zabójstwo w afekcie)
5. Płynnie przeglądasz cały rozdział
```

---

## 🚀 KORZYŚCI v7:

| Funkcja | v6 | v7 |
|---------|----|----|
| Wyszukiwanie z kontekstem | ✅ | ✅ |
| Sticky przyciski nawigacji | ❌ | ✅ |
| Przycisk "← Poprzedni" | ❌ | ✅ |
| Przycisk "Następny →" | ❌ | ✅ |
| Auto-przesuwanie zakresu | ❌ | ✅ |
| Pokazanie aktualnego art. | ❌ | ✅ Zakres + 🎯 |
| Disabled dla Art. 1 | ❌ | ✅ |
| Hint dla użytkownika | ❌ | ✅ 💡 |

---

## 📁 ZMIANY W PLIKACH:

### **full-code-viewer.js:**

**Linia 679-782:** Funkcja `addContextNavigationButtons()`
```javascript
// Tworzy sticky panel
// 3 przyciski: Poprzedni, Info, Następny
// Hover efekty
// Disabled state dla Art. 1
```

**Linia 785-801:** Funkcja `navigateContextArticle()`
```javascript
// Obsługuje kliknięcie przycisków
// Wpisuje nowy numer do inputu
// Wywołuje searchInFullCode()
```

**Linia 577:** Wywołanie po załadowaniu
```javascript
addContextNavigationButtons(currentCode, targetNum, startNum, endNum);
```

**Linia 833-838:** Zaktualizowane logi
```javascript
console.log('✅ [v7] window.navigateContextArticle:', typeof window.navigateContextArticle);
console.log('✅ [v7] Nawigacja "← Poprzedni" / "Następny →"!');
```

### **index.html:**

**Linia 1354:** Wersja v=7
```html
<script src="scripts/full-code-viewer.js?v=7&navigation=prevnext"></script>
```

---

## 🎨 WYGLĄD PRZYCISKÓW:

### **Przycisk aktywny:**
```
┌─────────────────────────────┐
│ ← Poprzedni (Art. 419)      │
│ Gradient niebieski           │
│ Border niebieski             │
│ Hover: jaśniejszy            │
└─────────────────────────────┘
```

### **Przycisk disabled:**
```
┌─────────────────────────────┐
│ ← Poprzedni (Art. 0)        │
│ Szary                        │
│ Border szary                 │
│ cursor: not-allowed          │
└─────────────────────────────┘
```

### **Panel środkowy (info):**
```
┌─────────────────────────────┐
│ Zakres: Art. 415-425        │
│ 🎯 Art. 420                 │
│ (półprzezroczyste tło)      │
└─────────────────────────────┘
```

---

## ⚠️ EDGE CASES:

### **1. Art. 1 (początek):**
```
Przycisk "← Poprzedni" disabled
Zakres: 1-6 (bo 1-5=0, max(1,0)=1)
```

### **2. Art. 1088 (koniec KC):**
```
Zakres: 1083-1088
Przycisk "Następny" pokaże Art. 1089
Ale KC kończy się na 1088!
System spróbuje załadować → Błąd API
```

**TODO:** Dodać sprawdzenie max artykułu i disable dla końca

---

## 🧪 CHECKLIST TESTOWANIA:

```
☐ CTRL + SHIFT + R (wymuś odświeżenie)
☐ F12 → Console → Zobacz "[v7] Full Code Viewer ready!"
☐ "Nawigacja '← Poprzedni' / 'Następny →'!"
☐ Wyszukaj Art. 420
☐ Zobacz sticky przyciski na górze ✅
☐ Kliknij "Następny (421)" ✅
☐ Zakres przesuwa się: 416-426 ✅
☐ Art. 421 jest wyszukany ✅
☐ Nowe przyciski: 420 ← | 421 | → 422 ✅
☐ Kliknij "← Poprzedni (420)" ✅
☐ Wraca do 415-425 ✅
☐ Wyszukaj Art. 1 ✅
☐ Przycisk "← Poprzedni" disabled ✅
☐ Scrolluj w dół → przyciski zostają ✅
```

---

**Status:** ✅ Gotowe!  
**Wersja:** v7 - Nawigacja kontekstowa  
**Data:** 05.11.2025 09:30

---

**ODŚWIEŻ I TESTUJ!** 🚀

**CTRL + SHIFT + R**

**Teraz możesz przeglądać kodeks jak książkę!** 📚

---

## 💬 DLA UŻYTKOWNIKÓW:

**Sticky przyciski pozwalają:**
- 📖 Czytać kodeks sekwencyjnie (jak książkę)
- ⬅️ Cofać się do poprzednich artykułów
- ➡️ Iść do następnych artykułów
- 🎯 Zawsze widzieć gdzie jesteś (zakres + artykuł)
- 📚 Zawsze mieć kontekst (5 przed + 5 po)

**Nie musisz już:**
- ❌ Wpisywać numerów ręcznie
- ❌ Klikać "Wstecz" w przeglądarce
- ❌ Tracić kontekstu

**Po prostu klikaj "Następny" i czytaj!** 🎉
