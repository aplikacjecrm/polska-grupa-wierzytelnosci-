# 🔧 FIX: DOKUMENTY COMPENSATION NIE WIDAĆ - NAPRAWIONE!

## 🐛 **PROBLEM:**
Po odświeżeniu przeglądarki nie widać 22 dokumentów w ankiecie odszkodowawczej.

---

## ✅ **ROZWIĄZANIE:**

### **1. DODANO AKTYWNE CZEKANIE**
Renderer teraz czeka max 5 sekund na załadowanie ankiety compensation:

```javascript
// W questionnaire-renderer.js
if (!window.compensationQuestionnaire) {
    console.log('⏳ Czekam na załadowanie ankiety compensation...');
    for (let i = 0; i < 50; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        if (window.compensationQuestionnaire) {
            console.log('✅ Ankieta compensation załadowana!');
            break;
        }
    }
}
```

### **2. LEPSZE LOGI BŁĘDÓW**
Jeśli ankieta się nie załaduje, zobaczysz dokładnie co:

```javascript
console.error('❌ Ankieta nie załadowana!', {
    type: type,
    bankruptcy: !!window.bankruptcyQuestionnaire,
    restructuring: !!window.restructuringQuestionnaire,
    compensation: !!window.compensationQuestionnaire
});
```

### **3. DEBUG DOKUMENTÓW**
Teraz przy ładowaniu zobaczysz listę wszystkich 22 dokumentów:

```javascript
console.log('📄 Lista dokumentów:', [
    '📋 Pełnomocnictwo',
    '📄 Wniosek o wypłatę odszkodowania',
    '⚠️ Wezwanie przedsądowe',
    // ... i 19 więcej
]);
```

---

## 🧪 **JAK PRZETESTOWAĆ:**

### **KROK 1: Hard Refresh**
```
Ctrl + Shift + R
```

### **KROK 2: Otwórz Console (F12)**
Sprawdź logi:

```javascript
// Powinno być:
✅ Pełna ankieta odszkodowawcza załadowana!
📊 Statystyki ankiety:
   - Sekcje: 10
   - Fazy procedury: 8
   - Dokumenty: 22
📄 Lista dokumentów: [22 elementy]
```

### **KROK 3: Sprawdź ręcznie**
W konsoli wpisz:

```javascript
// Sprawdź czy ankieta istnieje
console.log(window.compensationQuestionnaire);

// Sprawdź ile dokumentów
console.log(window.compensationQuestionnaire.requiredDocuments.length);
// Powinno być: 22

// Zobacz listę dokumentów
console.log(window.compensationQuestionnaire.requiredDocuments.map(d => d.name));
```

### **KROK 4: Otwórz ankietę**
```
1. Dodaj sprawę typu "compensation"
2. Otwórz sprawę
3. Kliknij "💰 Wypełnij ankietę odszkodowawczą"
4. Przejdź do zakładki "📄 Dokumenty"
```

### **KROK 5: Sprawdź co widzisz**

**Powinno być:**
```
✅ Fioletowy checklist na górze:
   📄 22 Wszystkich
   ⭐ 2 Wymaganych
   📎 20 Opcjonalnych
   ✅ 0 Załączonych
   
✅ 22 dokumenty poniżej:
   1. 📋 Pełnomocnictwo
   2. 📄 Wniosek o wypłatę
   3. ⚠️ Wezwanie przedsądowe
   ... (i 19 więcej)
```

---

## 🔍 **MOŻLIWE PROBLEMY I ROZWIĄZANIA:**

### **Problem 1: "Brak zdefiniowanych dokumentów"**
**Przyczyna:** Ankieta się nie załadowała  
**Rozwiązanie:**
```javascript
// Sprawdź console:
console.log(window.compensationQuestionnaire_Part2);
console.log(window.compensationQuestionnaire_Part2.requiredDocuments);

// Jeśli undefined → skrypty nie załadowały się
// Ctrl + Shift + R
```

### **Problem 2: "Ankieta nie została załadowana"**
**Przyczyna:** Timeout 5 sekund minął  
**Rozwiązanie:**
```javascript
// Sprawdź czy części istnieją:
console.log(window.compensationQuestionnaire_Part1); // Powinno być obiekt
console.log(window.compensationQuestionnaire_Part2); // Powinno być obiekt

// Jeśli któryś undefined → problem z ładowaniem
// Sprawdź Network tab (F12 → Network)
// Poszukaj czerwonych błędów przy compensation-questionnaire-*.js
```

### **Problem 3: Widać tylko 11 dokumentów zamiast 22**
**Przyczyna:** Ładuje się zła ankieta (bankruptcy zamiast compensation)  
**Rozwiązanie:**
```javascript
// Sprawdź typ w console:
console.log(window.questionnaireRenderer.currentQuestionnaireType);
// Powinno być: 'compensation'

// Sprawdź czy typ sprawy jest dobry:
// W CRM sprawdź czy case_type = 'compensation'
```

---

## 📊 **PEŁNA LISTA 22 DOKUMENTÓW:**

### **WYMAGANE (2):**
1. 📋 Pełnomocnictwo
2. 📄 Wniosek o wypłatę odszkodowania

### **OPCJONALNE (20):**
3. ⚠️ Wezwanie przedsądowe
4. ⚖️ Pozew o zapłatę odszkodowania
5. 🚓 Protokół policji
6. 📸 Zdjęcia miejsca/pojazdu/obrażeń
7. 🛠️ Kosztorys naprawy
8. 📑 Opinia rzeczoznawcy samochodowego
9. 🚙 Dowód rejestracyjny
10. 📜 Polisa OC/AC
11. 🏥 Dokumentacja medyczna
12. 💊 Recepty i paragony za leczenie
13. 🩺 Opinia medyczna o uszczerbku
14. 📋 Zaświadczenie o niezdolności do pracy
15. 💰 Zaświadczenie o dochodach
16. 👥 Zeznania świadków
17. 📹 Nagrania
18. 📊 Wyciągi bankowe
19. 🧾 Faktury za koszty
20. 📧 Korespondencja z TU
21. 📄 Decyzja TU
22. 📎 Inne dowody

---

## 🚨 **JEŚLI NADAL NIE DZIAŁA:**

### **Metoda 1: Wymuś załadowanie**
```javascript
// W console wpisz:
initCompensationQuestionnaire();

// Powinno pokazać:
✅ Pełna ankieta odszkodowawcza załadowana!
```

### **Metoda 2: Sprawdź kolejność skryptów**
Otwórz `index.html` i sprawdź czy jest:
```html
<script src=".../compensation-questionnaire-part1.js"></script>
<script src=".../compensation-questionnaire-part2.js"></script>
<script src=".../compensation-questionnaire.js"></script>
<script src=".../questionnaire-renderer.js"></script>
```
**Ważne:** Części PRZED głównym plikiem!

### **Metoda 3: Cache przeglądarki**
```
1. Otwórz DevTools (F12)
2. Kliknij prawym na przycisku Odśwież
3. Wybierz "Wyczyść pamięć podręczną i wymuś odświeżenie"
```

### **Metoda 4: Incognito**
```
Ctrl + Shift + N
http://localhost:3500
```

---

## 📁 **ZMODYFIKOWANE PLIKI:**

### **1. questionnaire-renderer.js (v26→v27)**
- Dodano aktywne czekanie na compensation (5s max)
- Lepsze logi błędów z informacją o wszystkich ankietach
- Alert z instrukcją odświeżenia

### **2. compensation-questionnaire.js (v2→v3)**
- Dodano log z pełną listą nazw dokumentów
- Łatwiejsze debugowanie

### **3. index.html**
- Zaktualizowane wersje (v27, v3)

---

## ✅ **WERYFIKACJA:**

Po naprawie sprawdź:

```
✅ Console: "✅ Pełna ankieta odszkodowawcza załadowana!"
✅ Console: "Dokumenty: 22"
✅ Console: Lista 22 nazw dokumentów
✅ Zakładka Dokumenty: Fioletowy checklist
✅ Zakładka Dokumenty: 22 dokumenty widoczne
✅ Każdy dokument: 3 przyciski (AI/CRM/Załącz)
```

---

## 🎯 **PODSUMOWANIE NAPRAWY:**

**Co było:**
- ❌ Renderer otwierał ankietę zanim się załadowała
- ❌ Brak czekania na załadowanie
- ❌ Słabe logi błędów

**Co jest teraz:**
- ✅ Aktywne czekanie max 5 sekund
- ✅ Szczegółowe logi w console
- ✅ Lista wszystkich 22 dokumentów
- ✅ Instrukcja w alertach

---

**Wersje:**
- questionnaire-renderer.js: v27 (`WAIT_FOR_COMPENSATION`)
- compensation-questionnaire.js: v3 (`DEBUG_LOGS`)

**Data:** 2025-11-08 13:49  
**Status:** ✅ **NAPRAWIONE!**

**ODŚWIEŻ (Ctrl+Shift+R) I SPRAWDŹ CONSOLE!** 🔧✨
