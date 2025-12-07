# 📋 ETAP 2: ORZECZENIA, INTERPRETACJE, AKTY WYKONAWCZE

## 🎯 CEL
Dodanie **NADBUDOWY** nad podstawowymi tekstami ustaw:
- ✅ Orzeczenia TK, SN, NSA
- ✅ Interpretacje ministerialne
- ✅ Akty wykonawcze (rozporządzenia)
- ✅ Teksty jednolite (obwieszczenia)
- ✅ Historia zmian

---

## 📊 STRATEGIA: NAJPIERW USTAWY, POTEM NADBUDOWA

### **DLACZEGO W 2 ETAPACH?**

```
ETAP 1: PODSTAWA (TERAZ)
├─ Art. 444 KC
├─ Art. 445 KC  
├─ Art. 446 KC
└─ ...1088 artykułów

ETAP 2: NADBUDOWA (POTEM)
├─ Art. 444 KC
│   ├─ TK K 1/20 (2021) - orzeczenie
│   ├─ SN III CZP 45/19 - wyrok
│   ├─ Minister Sprawiedliwości - interpretacja
│   ├─ Dz.U. 2020 poz. 123 - zmiana w art. 444
│   └─ Rozporządzenie o wysokości renty
└─ ...
```

**POWÓD:** Trzeba mieć artykuły w bazie, żeby móc do nich przypisać orzeczenia!

---

## 🗄️ STRUKTURA BAZY (już gotowa!)

### **Tabele utworzone:**
1. ✅ `court_decisions` - Orzeczenia TK/SN/NSA
2. ✅ `decision_articles` - Powiązania orzeczenia ↔ artykuły
3. ✅ `interpretations` - Interpretacje ministerialne
4. ✅ `interpretation_articles` - Powiązania interpretacje ↔ artykuły
5. ✅ `amendments` - Zmiany w ustawach
6. ✅ `announcements` - Obwieszczenia (teksty jednolite)
7. ✅ `implementing_provisions` - Przepisy wprowadzające
8. ✅ `cross_references` - Odnośniki między artykułami

**STATUS:** ✅ GOTOWE - można importować!

---

## 📚 CO BĘDZIEMY IMPORTOWAĆ (Etap 2)

### **1. ORZECZENIA TRYBUNAŁU KONSTYTUCYJNEGO** ⚖️

#### Źródła:
- **trybunal.gov.pl** - oficjalna strona TK
- **OTK** (Orzecznictwo Trybunału Konstytucyjnego)
- **API SAOS** - automatyczne pobieranie

#### Przykłady dla KC:
```
TK K 1/20 (2021-05-10)
├─ Dotyczy: Art. 444 KC
├─ Wynik: Konstytucyjny
└─ Streszczenie: § 2 jest zgodny z Konstytucją

TK SK 2/18 (2019-03-15)
├─ Dotyczy: Art. 415 KC
├─ Wynik: Niekonstytucyjny częściowo
└─ Streszczenie: Odpowiedzialność solidarna...
```

#### Plan importu:
1. Scraper dla trybunal.gov.pl
2. Parser orzeczeń (numer, data, wynik)
3. Automatyczne linkowanie z artykułami
4. Import historyczny (od 1997)

---

### **2. ORZECZENIA SĄDU NAJWYŻSZEGO** 👨‍⚖️

#### Źródła:
- **saos.org.pl** - System Analizy Orzeczeń Sądowych (**MA API!**)
- **sn.pl** - oficjalna strona SN
- **Baza orzeczeń SN**

#### API SAOS:
```javascript
// GOTOWE API!
fetch('https://saos.org.pl/api/search/judgments?legalBase=art. 444 kc')
  .then(res => res.json())
  .then(data => {
    // Automatycznie parsuje:
    // - Sygnaturę
    // - Datę
    // - Treść
    // - Podstawę prawną
  });
```

#### Przykłady:
```
SN III CZP 45/19 (2020-01-15)
├─ Dotyczy: Art. 444 KC
├─ Rodzaj: Wyrok
└─ Teza: Rozstrój zdrowia obejmuje...

SN I CSK 123/20 (2021-06-10)
├─ Dotyczy: Art. 415 KC, Art. 444 KC
├─ Rodzaj: Wyrok
└─ Teza: Odpowiedzialność na zasadzie ryzyka...
```

#### Plan importu:
1. ✅ **Automatyczny scraper SAOS API**
2. Parser JSON z API
3. Linkowanie z artykułami
4. Import masowy (tysiące orzeczeń)

---

### **3. ORZECZENIA NSA (Naczelny Sąd Administracyjny)** 🏛️

#### Źródła:
- **orzeczenia.nsa.gov.pl**
- **API SAOS** (ma też NSA!)

#### Przykłady:
```
NSA II GSK 123/18 (2019-05-20)
├─ Dotyczy: Art. 15 KPA
├─ Rodzaj: Wyrok
└─ Teza: Obowiązek uzasadnienia decyzji...
```

---

### **4. INTERPRETACJE MINISTERIALNE** 💼

#### Źródła:
- **Ministerstwo Sprawiedliwości** - interpretacje KC
- **Ministerstwo Finansów** - interpretacje podatkowe
- **KNF** - interpretacje bankowe/ubezpieczeniowe
- **GIF** - interpretacje farmaceutyczne

#### Przykłady:
```
Minister Sprawiedliwości (2023-01-15)
├─ Numer: MS-I-021-234/23
├─ Dotyczy: Art. 444 KC
└─ Treść: Zakres odszkodowania obejmuje...

Minister Finansów (2022-06-10)
├─ Numer: MF-021-123/22
├─ Dotyczy: Ordynacja podatkowa Art. 15
└─ Treść: Termin przedawnienia...
```

#### Plan importu:
1. Scrapery dla stron ministerstw
2. Parser dokumentów PDF/HTML
3. Linkowanie z artykułami
4. Kategorie: podatkowe, cywilne, karne...

---

### **5. AKTY WYKONAWCZE (Rozporządzenia)** 📜

#### Co to?
Rozporządzenia wydane na podstawie ustaw.

#### Przykłady:
```
Rozporządzenie Ministra Sprawiedliwości (2020)
├─ Podstawa: Art. 444 KC
├─ Tytuł: w sprawie wysokości renty...
├─ Dz.U. 2020 poz. 1234
└─ Treść: § 1. Renta powinna uwzględniać...

Rozporządzenie Rady Ministrów (2021)
├─ Podstawa: Kodeks pracy Art. 15
├─ Tytuł: w sprawie wynagrodzenia minimalnego
└─ Dz.U. 2021 poz. 567
```

#### Plan importu:
1. Scraper ISAP (ma rozporządzenia)
2. Linkowanie z artykułami podstawowymi
3. Śledzenie zmian

---

### **6. TEKSTY JEDNOLITE (Obwieszczenia)** 📋

#### Co to?
Marszałek Sejmu publikuje "tekst jednolity" z wszystkimi zmianami.

#### Przykłady:
```
Obwieszczenie Marszałka Sejmu (2023-06-15)
├─ Dotyczy: Kodeks cywilny
├─ Dz.U. 2023 poz. 1234
└─ Treść: Tekst jednolity uwzględniający:
    - Zmianę z 2021 (Dz.U. 2021 poz. 567)
    - Zmianę z 2022 (Dz.U. 2022 poz. 890)
    - Zmianę z 2023 (Dz.U. 2023 poz. 123)
```

#### Plan importu:
1. Scraper ISAP (sekcja obwieszczenia)
2. Parser zmian
3. Tracking wersji
4. Diff między wersjami

---

### **7. HISTORIA ZMIAN** 📅

#### Co śledzić:
- **Nowelizacje** - które artykuły zmieniono
- **Daty wejścia w życie** - kiedy zmiana zaczęła obowiązywać
- **Stara vs nowa treść** - porównanie
- **Powód zmiany** - uzasadnienie

#### Przykład:
```
Art. 444 KC - Historia zmian:

2025-01-15: Zmiana § 2
├─ Ustawa zmieniająca: Dz.U. 2024 poz. 1234
├─ Stara treść: "może on żądać..."
├─ Nowa treść: "powinien on otrzymać..."
└─ Powód: Orzeczenie TK K 1/20

2020-06-01: Dodanie § 4
├─ Ustawa zmieniająca: Dz.U. 2020 poz. 567
└─ Powód: Implementacja dyrektywy UE

2010-03-15: Zmiana § 1
└─ Ustawa zmieniająca: Dz.U. 2010 poz. 123

1964-04-23: Uchwalenie
└─ Dz.U. 1964 nr 16 poz. 93
```

---

## 🚀 PLAN REALIZACJI ETAPU 2

### **FAZA 1: Orzeczenia TK (tydzień 1-2)**
- [ ] Scraper trybunal.gov.pl
- [ ] Parser orzeczeń
- [ ] Import historyczny
- [ ] Linkowanie z artykułami
- [ ] Test: 50 orzeczeń dla KC

### **FAZA 2: Orzeczenia SN via SAOS (tydzień 2-3)**
- [ ] Integracja SAOS API
- [ ] Parser JSON
- [ ] Import masowy
- [ ] Test: 500 orzeczeń

### **FAZA 3: Interpretacje (tydzień 3-4)**
- [ ] Scrapery ministerstw
- [ ] Parser PDF/HTML
- [ ] Kategorie
- [ ] Test: 100 interpretacji

### **FAZA 4: Akty wykonawcze (tydzień 4-5)**
- [ ] Scraper rozporządzeń ISAP
- [ ] Linkowanie z artykułami
- [ ] Test: 50 rozporządzeń

### **FAZA 5: Teksty jednolite (tydzień 5-6)**
- [ ] Scraper obwieszczeń
- [ ] System wersjonowania
- [ ] Diff między wersjami
- [ ] Test: 10 tekstów jednolitych

### **FAZA 6: Historia zmian (tydzień 6-7)**
- [ ] Parser zmian z ISAP
- [ ] Timeline zmian
- [ ] Stara vs nowa treść
- [ ] Test: Historia KC od 1964

---

## 🎨 FRONTEND - NOWE FUNKCJE (po Etapie 2)

### **1. Panel "Orzecznictwo"**
```
Art. 444 KC
├─ [TAB] Treść artykułu
├─ [TAB] Orzecznictwo ⭐ NOWE
│   ├─ TK K 1/20 (2021)
│   ├─ SN III CZP 45/19 (2020)
│   └─ SN I CSK 123/20 (2021)
├─ [TAB] Interpretacje ⭐ NOWE
│   └─ Minister Sprawiedliwości (2023)
└─ [TAB] Historia zmian ⭐ NOWE
    ├─ 2025-01-15: Zmiana § 2
    └─ 2020-06-01: Dodanie § 4
```

### **2. Timeline interaktywny**
```
════════════════════════════════════════
1964       2010       2020       2025
  │          │          │          │
  ○──────────●──────────●──────────●
  Uchwalenie Zmiana §1  Dodanie §4 Zmiana §2
```

### **3. Diff wersji**
```
┌─ STARA WERSJA (do 2025-01-14) ─────┐
│ § 2. Jeżeli poszkodowany utracił   │
│ może on żądać...                    │
└─────────────────────────────────────┘

┌─ NOWA WERSJA (od 2025-01-15) ──────┐
│ § 2. Jeżeli poszkodowany utracił   │
│ powinien on otrzymać...             │
└─────────────────────────────────────┘
```

### **4. Filtry zaawansowane**
```
[🔍 Szukaj] art 444 kc

Filtruj:
☑ Pokaż orzeczenia TK
☑ Pokaż orzeczenia SN
☐ Pokaż interpretacje
☐ Pokaż akty wykonawcze
☑ Tylko aktualną wersję
☐ Pokaż historię
```

---

## 💡 KIEDY STARTUJEMY ETAP 2?

### **Warunek:**
✅ Wszystkie 30 najważniejszych ustaw zaimportowane (Etap 1)

### **Kolejność Etap 2:**
1. Orzeczenia TK dla KC
2. Orzeczenia SN dla KC (via SAOS)
3. Teksty jednolite KC
4. Historia zmian KC
5. Interpretacje KC
6. **POTEM** to samo dla KPC, KK, KP...

---

## 🎯 SUCCESS METRICS (Etap 2)

Po zakończeniu Etapu 2 będziemy mieć:
- ✅ 1000+ orzeczeń TK
- ✅ 5000+ orzeczeń SN
- ✅ 1000+ orzeczeń NSA
- ✅ 500+ interpretacji
- ✅ 200+ aktów wykonawczych
- ✅ 50+ tekstów jednolitych
- ✅ Pełną historię zmian od 1964

---

## 📋 CHECKLIST STARTU ETAPU 2

- [ ] Wszystkie TOP 30 ustaw zaimportowane
- [ ] Baza danych gotowa
- [ ] SAOS API key (jeśli potrzebny)
- [ ] Testy scrapera TK
- [ ] Frontend prototyp (panel orzecznictwa)
- [ ] **GO!**

---

**CURRENT STATUS:** Etap 1 w toku - importujemy ustawy! 🚀
**NEXT:** Dashboard + import kolejnych ustaw
**LATER:** Start Etap 2 (orzeczenia, interpretacje...)
