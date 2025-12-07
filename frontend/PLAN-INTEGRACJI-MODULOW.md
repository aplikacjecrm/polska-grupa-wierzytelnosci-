# 📋 PLAN INTEGRACJI MODUŁÓW - Strona Przeciwna

## 🎯 CEL:
Połączyć **STARY MODUŁ** (guided workflow + smart start) z **NOWYM MODUŁEM** (wyszukiwarki API)

---

## 📊 CO MAMY:

### **STARY MODUŁ** (`opposing-analysis-module.js`):
✅ **Guided Workflow** - 7 kroków prowadzących użytkownika:
1. **Krok 1:** Identyfikacja (nazwa, NIP, REGON, KRS)
2. **Krok 2:** Sytuacja finansowa
3. **Krok 3:** Social Media
4. **Krok 4:** Historia i poprzednie sprawy
5. **Krok 5:** Znane taktyki
6. **Krok 6:** Pełnomocnik prawny
7. **Krok 7:** Podsumowanie

✅ **Smart Start**:
- Modal z auto-wykrywaniem NIP/REGON/KRS
- Automatyczne pobieranie danych przy starcie
- Wypełnia formularz w tle

✅ **Evidence Bank**:
- Screenshoty i załączniki w każdym kroku
- Galeria dowodów

✅ **Smart Buttons**:
- Auto-otwieranie KRS, CEIDG, Google w nowych kartach

---

### **NOWY MODUŁ** (`opposing-party-module.js`):
✅ **6 Wyszukiwarek API** z pełnymi danymi:
1. **CEIDG** - wyszukiwanie po NIP (pełne dane firmy)
2. **KRS** - wyszukiwanie po numerze KRS (zarząd, kapitał)
3. **CEPiK** - wyszukiwanie po nr rejestracyjnym pojazdu
4. **UFG** - wyszukiwanie ubezpieczonych
5. **Social Searcher** - wyszukiwanie w social media
6. **Facebook Groups** - wyszukiwanie w grupach FB (Apify)

✅ **Funkcje gotowe**:
- `searchKRS()`
- `searchCEIDG()`
- `searchCEPiK()`
- `searchUFG()`
- `searchSocial()`
- `searchFacebookGroups()`

---

## 🔧 PLAN POŁĄCZENIA:

### **ETAP 1: Dodaj wyszukiwarki API do każdego kroku**

#### **Krok 1 (Identyfikacja):**
```
┌─────────────────────────────────────┐
│ 🔍 WERYFIKACJA STRONY PRZECIWNEJ    │ ← NOWA SEKCJA
├─────────────────────────────────────┤
│ 🏢 Wyszukaj w KRS (numer KRS)       │
│ [Input] [Szukaj] → wyniki KRS       │
│                                      │
│ 🔍 Wyszukaj w CEIDG (NIP)            │
│ [Input] [Szukaj] → wyniki CEIDG     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📝 FORMULARZ PODSTAWOWY              │ ← STARY FORMULARZ
├─────────────────────────────────────┤
│ Nazwa: [_______]                    │
│ NIP: [_______]                      │
│ REGON: [_______]                    │
└─────────────────────────────────────┘
```

#### **Krok 2 (Finanse):**
```
┌─────────────────────────────────────┐
│ 🏦 UFG - Sprawdź ubezpieczenia       │ ← NOWA SEKCJA
├─────────────────────────────────────┤
│ [Input] [Szukaj] → wyniki UFG       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 💰 Sytuacja finansowa (formularz)   │ ← STARY FORMULARZ
└─────────────────────────────────────┘
```

#### **Krok 3 (Social Media):**
```
┌─────────────────────────────────────┐
│ 📱 WYSZUKIWARKI SOCIAL MEDIA         │ ← NOWA SEKCJA
├─────────────────────────────────────┤
│ 🌐 Social Searcher                   │
│ [Input] [Szukaj] → wyniki           │
│                                      │
│ 👥 Facebook Groups (Apify)           │
│ [Input] [Szukaj] → grupy FB         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📝 Notatki Social Media (formularz)  │ ← STARY FORMULARZ
└─────────────────────────────────────┘
```

#### **Dodatkowy przycisk:**
```
┌─────────────────────────────────────┐
│ 🚗 CEPiK - Sprawdź pojazdy           │ ← NOWY PRZYCISK
├─────────────────────────────────────┤
│ [Input] [Szukaj] → info o pojeździe │
└─────────────────────────────────────┘
```

---

### **ETAP 2: Integracja funkcji**

**Skopiować z NOWEGO modułu do STAREGO:**
```javascript
// Do opposing-analysis-module.js dodać:

// 1. Funkcje wyszukiwania
searchKRS: async function() { ... },
searchCEIDG: async function() { ... },
searchCEPiK: async function() { ... },
searchUFG: async function() { ... },
searchSocial: async function() { ... },
searchFacebookGroups: async function() { ... },

// 2. HTML wyszukiwarek do odpowiednich kroków
renderStep1_Identification() {
    return `
        ${this.renderAPISearchSection_Step1()}  ← NOWA SEKCJA
        ${this.renderBasicForm_Step1()}         ← STARY FORMULARZ
    `;
}
```

---

### **ETAP 3: Auto-fill z API do formularza**

**Po udanym wyszukiwaniu API → automatycznie wypełnij formularz:**
```javascript
// Przykład dla CEIDG:
searchCEIDG: async function() {
    const data = await fetch(...);
    if (data.success) {
        // Pokaż wyniki
        this.displayCEIDGResults(data);
        
        // Auto-fill formularza
        document.getElementById('opposing_name').value = data.data.nazwa;
        document.getElementById('opposing_nip').value = data.data.nip;
        document.getElementById('opposing_address').value = data.data.adres;
        // ...
    }
}
```

---

## 📁 PLIK WYNIKOWY:

**Nazwa:** `opposing-party-module-UNIFIED.js`

**Struktura:**
```javascript
window.opposingPartyModule = {
    // ========================================
    // STARY MODUŁ - Guided Workflow (7 kroków)
    // ========================================
    currentStep: 0,
    data: {},
    
    render(caseId) { ... },
    renderStartScreen() { ... },
    renderWorkflow() { ... },
    
    renderStep1_Identification() {
        return `
            ${this.renderAPISearchSection_Step1()}  // ← NOWY
            ${this.renderBasicForm_Step1()}         // ← STARY
        `;
    },
    
    renderStep2_Financial() {
        return `
            ${this.renderUFGSearch()}               // ← NOWY
            ${this.renderFinancialForm()}           // ← STARY
        `;
    },
    
    renderStep3_SocialMedia() {
        return `
            ${this.renderSocialSearches()}          // ← NOWY
            ${this.renderSocialForm()}              // ← STARY
        `;
    },
    
    // ... pozostałe kroki ...
    
    // ========================================
    // NOWY MODUŁ - API Search Functions
    // ========================================
    searchKRS: async function() { ... },
    searchCEIDG: async function() { ... },
    searchCEPiK: async function() { ... },
    searchUFG: async function() { ... },
    searchSocial: async function() { ... },
    searchFacebookGroups: async function() { ... },
    
    // ========================================
    // RENDERING API SECTIONS
    // ========================================
    renderAPISearchSection_Step1() {
        return `
            <div class="api-search-panel">
                <h3>🔍 WERYFIKACJA STRONY PRZECIWNEJ</h3>
                
                <!-- KRS Search -->
                <div class="krs-search">...</div>
                
                <!-- CEIDG Search -->
                <div class="ceidg-search">...</div>
            </div>
        `;
    }
};
```

---

## ✅ ZALETY TEGO ROZWIĄZANIA:

1. **Zachowujemy workflow** - użytkownik jest prowadzony krok po kroku
2. **Dodajemy API** - automatyczne pobieranie danych w każdym kroku
3. **Auto-fill formularzy** - API wypełnia pola automatycznie
4. **Smart Start pozostaje** - nadal działa auto-lookup przy starcie
5. **Evidence Bank pozostaje** - screenshoty i załączniki działają
6. **Jeden zunifikowany moduł** - łatwiejsze utrzymanie

---

## 🚀 KROKI IMPLEMENTACJI:

1. ✅ **Przeczytałem oba moduły** - zrozumiałem strukturę
2. ⏳ **Stworzę nowy plik** - `opposing-party-module-UNIFIED.js`
3. ⏳ **Skopiuję workflow** ze starego modułu
4. ⏳ **Dodam funkcje API** z nowego modułu
5. ⏳ **Zintegruje w krokach** - sekcje API + formularze
6. ⏳ **Dodam auto-fill** - API → formularz
7. ⏳ **Zaktualizuję index.html** - zmienię import na nowy plik
8. ⏳ **Przetestuję** - czy wszystko działa

---

## 📊 WYNIK:

**Użytkownik zobaczy:**
```
🎯 Start Screen (Smart Start - auto-lookup)
    ↓
📝 Krok 1: Identyfikacja
    🔍 Wyszukaj w KRS/CEIDG → automatycznie wypełni formularz
    📝 Formularz (nazwa, NIP, REGON, adres...)
    📸 Evidence Bank (załącz screenshoty)
    ↓
💰 Krok 2: Finanse
    🏦 Wyszukaj w UFG
    📝 Formularz (sytuacja finansowa...)
    ↓
📱 Krok 3: Social Media
    🌐 Social Searcher + Facebook Groups
    📝 Formularz (notatki social media...)
    ↓
... (pozostałe kroki)
    ↓
✅ Krok 7: Podsumowanie + Dashboard
```

---

**CZY MAM ROZPOCZĄĆ IMPLEMENTACJĘ?** 🚀
