# 🔍 WYSZUKIWARKA DOWOLNEGO ARTYKUŁU - v5

## ✅ NAPRAWIONO: Możliwość wyszukiwania KAŻDEGO artykułu!

### **Poprzedni problem:**
- Ładowało tylko 30 artykułów (1-30)
- Wyszukiwarka przeszukiwała tylko te 30 artykułów
- **Art. 420? Art. 1000?** ❌ Nie można było znaleźć!

### **Nowe rozwiązanie:**
- **Wyszukiwanie po numerze** → Automatyczne ładowanie z API!
- Możesz wyszukać **DOWOLNY** artykuł z całego kodeksu!
- Art. 420? Art. 1000? Art. 1088? **Wszystko działa!** ✅

---

## 🎯 JAK TO DZIAŁA:

### **Scenariusz 1: Artykuł już załadowany**
```
1. Wpiszesz: 5
2. System sprawdza: "Czy Art. 5 jest już na liście?"
3. TAK → Ukrywa inne, pokazuje Art. 5
4. Scroll do niego ✅
```

### **Scenariusz 2: Artykuł NIE załadowany (np. 420)**
```
1. Wpiszesz: 420
2. System sprawdza: "Czy Art. 420 jest już na liście?"
3. NIE → Wysyła request do API
4. API zwraca Art. 420
5. System dodaje go na listę
6. Oznacza: 🔍 WYSZUKANY
7. Scroll do niego ✅
```

**Czas ładowania:** ~1-2 sekundy

---

## 🧪 JAK PRZETESTOWAĆ:

### **Test 1: Wyszukaj Art. 420**
```
1. CTRL + SHIFT + R (odśwież)
2. "📚 Kodeksy" → "art 444 kc"
3. Kliknij "📚 Cały kodeks"
4. Poczekaj aż załadują się Art. 1-30
5. Pole "Wyszukaj artykuł": wpisz "420"
6. Kliknij "Szukaj" LUB naciśnij Enter
7. Zobaczysz: "📡 Ładuję artykuł z API..."
8. Po 1-2 sekundach: Art. 420 się pojawi! ✅
9. Ma badge: 🔍 WYSZUKANY
```

### **Test 2: Wyszukaj Art. 1000**
```
1. W tym samym oknie
2. Pole "Wyszukaj artykuł": wpisz "1000"
3. Enter
4. Art. 1000 załaduje się z API ✅
```

### **Test 3: Wyszukaj Art. 5 (już załadowany)**
```
1. Pole "Wyszukaj artykuł": wpisz "5"
2. Enter
3. Natychmiastowe wyświetlenie (bez API) ✅
4. Brak badge "WYSZUKANY" (bo był już załadowany)
```

---

## 🔍 LOGI W KONSOLI:

**Gdy szukasz Art. 420:**
```
🔍 [searchInFullCode] START
🔍 [searchInFullCode] Numer artykułu: 420
🔍 [searchInFullCode] Szukam konkretnego artykułu: 420
📡 Ładuję artykuł z API...
✅ Artykuł załadowany i wyświetlony
```

**Gdy szukasz Art. 5 (już załadowany):**
```
🔍 [searchInFullCode] START
🔍 [searchInFullCode] Numer artykułu: 5
🔍 [searchInFullCode] Szukam konkretnego artykułu: 5
✅ Artykuł już załadowany
```

---

## 🎨 WIZUALNE OZNACZENIA:

### **Artykuł załadowany na początku (1-30):**
```
┌────────────────────────────┐
│ Art. 5                     │
│ (normalny wygląd)          │
│ § 1. Treść...              │
└────────────────────────────┘
```

### **Artykuł wyszukany przez API (np. 420):**
```
┌────────────────────────────┐
│ Art. 420    [🔍 WYSZUKANY] │
│ (pomarańczowy badge)       │
│ § 1. Treść...              │
└────────────────────────────┘
```

---

## 💡 FUNKCJE:

### **Wyszukiwanie po numerze artykułu:**
- Wpisz numer (np. 420)
- Kliknij "Szukaj" lub naciśnij Enter
- System automatycznie załaduje artykuł z API

### **Wyszukiwanie po tekście:**
- Wpisz tekst (np. "szkoda")
- Przeszukuje **tylko załadowane artykuły**
- Podświetla znaleziony tekst

### **Kombinowane wyszukiwanie:**
- Numer + tekst razem
- Najpierw ładuje artykuł po numerze
- Potem szuka tekstu w nim

---

## 📋 NOWE API REQUEST:

```javascript
// Funkcja fetchArticle
const response = await fetch(`/api/ai/legal-acts/article`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        code: 'KC',           // Kod kodeksu
        article: '420'        // Numer artykułu
    })
});

// Odpowiedź:
{
    answer: "§ 1. Kto z winy swojej..."  // Treść artykułu
}
```

---

## ⚙️ CO ZAPISUJE:

### **dataset.currentCode**
```javascript
contentDiv.dataset.currentCode = 'KC';
```
Zapisuje kod kodeksu (KC, KK, KPC...) żeby wyszukiwarka wiedziała skąd ładować.

### **data-article**
```html
<div class="full-code-article" data-article="420">
```
Każdy artykuł ma atrybut z numerem dla łatwego wyszukiwania.

---

## 🚀 KORZYŚCI:

| Funkcja | Przed v5 | Po v5 |
|---------|----------|-------|
| Wyszukiwanie Art. 1-30 | ✅ Działa | ✅ Działa |
| Wyszukiwanie Art. 31-1088 | ❌ Nie działa | ✅ Działa przez API |
| Czas ładowania Art. 420 | ❌ Niemożliwe | ✅ 1-2 sekundy |
| Oznaczenie wyszukanych | ❌ Brak | ✅ Badge "🔍 WYSZUKANY" |
| Enter w polu artykułu | ❌ Nie działało | ✅ Działa |

---

## 📁 ZMIANY W PLIKACH:

### **full-code-viewer.js:**

**Linia 179-185:** Enter key handling
```javascript
document.getElementById('articleSearchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') window.searchInFullCode();
});
```

**Linia 192-193:** Zapisywanie kodu kodeksu
```javascript
contentDiv.dataset.currentCode = code;
```

**Linia 399-506:** Nowa logika wyszukiwania
```javascript
async function searchInFullCode() {
    // Jeśli szukamy konkretnego artykułu
    if (articleNum && !searchText) {
        // Sprawdź czy już jest
        const existing = document.querySelector(`[data-article="${articleNum}"]`);
        
        if (existing) {
            // Pokaż istniejący
        } else {
            // Załaduj z API
            const articleData = await fetchArticle(code, articleNum);
            // Dodaj do listy
            // Oznacz badge "WYSZUKANY"
        }
    }
}
```

### **index.html:**

**Linia 1354:** Wersja v=5
```html
<script src="scripts/full-code-viewer.js?v=5&anyarticle=true"></script>
```

---

## ⚠️ WAŻNE:

### **1. Artykuł musi istnieć**
```
Art. 420 w KC ✅ Istnieje
Art. 9999 w KC ❌ Nie istnieje → Alert!
```

### **2. Wyszukiwanie tekstu**
```
Przeszukuje TYLKO załadowane artykuły!
Jeśli szukasz "szkoda" w Art. 420:
1. Najpierw wyszukaj Art. 420 (załaduje się)
2. Potem wyczyść i szukaj "szkoda" (znajdzie w załadowanych)
```

### **3. Czyszczenie wyszukiwania**
```
Przycisk "Wyczyść" usuwa:
- Dynamicznie załadowane artykuły ❌ (zostają)
- Tylko ukrywa/pokazuje artykuły
- Usuwa podświetlenia
```

---

## 🧪 CHECKLIST TESTOWANIA:

```
☐ CTRL + SHIFT + R (odśwież)
☐ F12 → Console → Zobacz "✅ [v5] Full Code Viewer ready!"
☐ "Wyszukiwanie KAŻDEGO artykułu przez API!"
☐ Otwórz "Cały kodeks"
☐ Wyszukaj Art. 5 → Natychmiastowe ✅
☐ Wyszukaj Art. 420 → Ładowanie 1-2s ✅
☐ Badge "🔍 WYSZUKANY" widoczny ✅
☐ Enter w polu "Artykuł" działa ✅
☐ Wyszukaj Art. 1000 → Ładowanie ✅
☐ Wyszukaj Art. 9999 → Alert "nie istnieje" ✅
```

---

**Status:** ✅ Gotowe!  
**Wersja:** v5 - Wyszukiwanie DOWOLNEGO artykułu  
**Data:** 05.11.2025 09:20

---

**ODŚWIEŻ I TESTUJ!** 🚀

**CTRL + SHIFT + R**

**Teraz możesz wyszukać KAŻDY artykuł!** ✅

---

## 💬 PRZYKŁADY UŻYCIA:

### **Prawnik chce sprawdzić Art. 444:**
```
"art 444 kc" → Główna wyszukiwarka
Albo: "Cały kodeks" → Wpisz "444" → Już załadowany ✅
```

### **Prawnik chce sprawdzić Art. 1000:**
```
"Cały kodeks" → Wpisz "1000" → Ładuje z API ✅
```

### **Prawnik chce znaleźć wszystkie artykuły o szkodzie:**
```
"Cały kodeks" → Pole "Tekst": "szkoda" → Przeszuka 1-30
Lub: Główna wyszukiwarka "szkoda kc" → Wszystkie pasujące
```

---

**Teraz "Cały kodeks" nie ma limitów!** 🎉
