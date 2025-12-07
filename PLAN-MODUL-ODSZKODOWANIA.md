# 💰 PLAN MODUŁU ODSZKODOWAŃ - DO POTWIERDZENIA

## 🎯 **CEL MODUŁU:**
System do kompleksowej obsługi spraw odszkodowawczych, szczególnie z towarzystwami ubezpieczeniowymi.

---

## 📋 **TYPY ODSZKODOWAŃ:**

### **1. ODSZKODOWANIA OD TOWARZYSTW UBEZPIECZENIOWYCH (główny focus):**

#### **A. Komunikacyjne:**
- 🚗 **Szkody majątkowe w pojazdach** (AC, OC sprawcy)
- 🏥 **Obrażenia ciała w wypadkach** (OC sprawcy)
- ⚰️ **Śmierć osoby bliskiej** (zadośćuczynienie + odszkodowanie)
- ♿ **Trwały uszczerbek na zdrowiu** (renta, zadośćuczynienie)
- 🛠️ **Utrata wartości pojazdu** (OC sprawcy)

#### **B. Ubezpieczenia majątkowe:**
- 🏠 **Szkody w nieruchomościach** (pożar, zalanie, kradzież)
- 💼 **Szkody w działalności gospodarczej**
- 📦 **Ubezpieczenia cargo** (transport)
- 🌊 **OC komunikacyjne** (sprawca wypadku)

#### **C. Ubezpieczenia zdrowotne/życiowe:**
- 🏥 **Błędy medyczne** (OC szpitala, lekarza)
- 💊 **Szkody iatrogenne** (powikłania po zabiegach)
- 🏋️ **Wypadki przy pracy**
- ⚡ **Wypadki w życiu prywatnym** (NNW)

### **2. ODSZKODOWANIA PRYWATNE (bez ubezpieczeń):**

- 👤 **Szkody osobowe** (pobicie, uszczerbek)
- 🏚️ **Szkody w nieruchomościach** (zalanie od sąsiada)
- 🐕 **Szkody wyrządzone przez zwierzęta**
- 🌳 **Szkody w ogrodach/uprawach**
- 💸 **Bezprawne wzbogacenie**

### **3. ODSZKODOWANIA OD PAŃSTWA/SAMORZĄDU:**

- 🚧 **Szkody drogowe** (dziury, nieodśnieżone)
- 🏛️ **Niesłuszne aresztowanie**
- ⚖️ **Przewlekłość postępowania**
- 📜 **Wadliwe decyzje administracyjne**

---

## 📝 **STRUKTURA ANKIETY (8-10 SEKCJI):**

### **SEKCJA 1: 🎯 Typ sprawy**
```javascript
questions: [
    { 
        id: 'claim_type', 
        label: 'Jakiego typu jest odszkodowanie?', 
        type: 'select',
        options: [
            { value: 'car_accident', label: '🚗 Wypadek komunikacyjny' },
            { value: 'medical_error', label: '🏥 Błąd medyczny' },
            { value: 'property_damage', label: '🏠 Szkoda majątkowa' },
            { value: 'bodily_injury', label: '🤕 Obrażenia ciała' },
            { value: 'death', label: '⚰️ Śmierć osoby bliskiej' },
            { value: 'work_accident', label: '🏭 Wypadek przy pracy' },
            { value: 'other', label: '📋 Inne' }
        ]
    },
    {
        id: 'has_insurance',
        label: 'Czy sprawa dotyczy towarzystwa ubezpieczeniowego?',
        type: 'radio',
        options: [
            { value: 'yes', label: 'Tak - ubezpieczyciel jest stroną' },
            { value: 'no', label: 'Nie - sprawa prywatna' }
        ]
    }
]
```

### **SEKCJA 2: 👤 Poszkodowany**
```javascript
questions: [
    { id: 'victim_name', label: 'Imię i nazwisko poszkodowanego', type: 'text' },
    { id: 'victim_pesel', label: 'PESEL', type: 'text' },
    { id: 'victim_address', label: 'Adres zamieszkania', type: 'text' },
    { id: 'victim_phone', label: 'Telefon', type: 'text' },
    { id: 'victim_email', label: 'Email', type: 'email' },
    { id: 'is_represented', label: 'Czy poszkodowany ma pełnomocnika?', type: 'radio' },
    { id: 'relation_to_client', label: 'Kim jest poszkodowany dla klienta?', type: 'select',
      options: ['Sam klient', 'Małżonek', 'Dziecko', 'Rodzic', 'Inny'] }
]
```

### **SEKCJA 3: 🚗 Zdarzenie (dynamiczne w zależności od typu)**

#### **Dla wypadku komunikacyjnego:**
```javascript
questions: [
    { id: 'accident_date', label: 'Data wypadku', type: 'date' },
    { id: 'accident_place', label: 'Miejsce wypadku', type: 'text' },
    { id: 'accident_description', label: 'Opis przebiegu wypadku', type: 'textarea' },
    { id: 'police_called', label: 'Czy była policja?', type: 'radio' },
    { id: 'police_report_number', label: 'Numer protokołu', type: 'text' },
    { id: 'ambulance_called', label: 'Czy wezwano karetkę?', type: 'radio' },
    { id: 'witnesses', label: 'Świadkowie (imiona, adresy)', type: 'textarea' }
]
```

#### **Dla błędu medycznego:**
```javascript
questions: [
    { id: 'hospital_name', label: 'Nazwa szpitala/placówki', type: 'text' },
    { id: 'treatment_date', label: 'Data zabiegu/leczenia', type: 'date' },
    { id: 'doctor_name', label: 'Imię i nazwisko lekarza', type: 'text' },
    { id: 'medical_error_description', label: 'Opis błędu', type: 'textarea' },
    { id: 'diagnosis', label: 'Rozpoznanie/Diagnoza', type: 'text' },
    { id: 'complications', label: 'Powikłania', type: 'textarea' }
]
```

### **SEKCJA 4: 🏢 Towarzystwo ubezpieczeniowe (jeśli ma zastosowanie)**
```javascript
questions: [
    { id: 'insurance_company', label: 'Nazwa TU', type: 'select',
      options: ['PZU', 'Warta', 'Ergo Hestia', 'Allianz', 'Generali', 'Link4', 'Inne'] },
    { id: 'policy_number', label: 'Numer polisy', type: 'text' },
    { id: 'claim_number', label: 'Numer szkody/roszczenia', type: 'text' },
    { id: 'insurance_decision', label: 'Czy TU wydało decyzję?', type: 'radio' },
    { id: 'insurance_decision_date', label: 'Data decyzji', type: 'date' },
    { id: 'insurance_offered_amount', label: 'Kwota zaproponowana przez TU', type: 'number' },
    { id: 'insurance_decision_text', label: 'Treść decyzji/uzasadnienie', type: 'textarea' },
    { id: 'claim_reported_date', label: 'Kiedy zgłoszono szkodę?', type: 'date' }
]
```

### **SEKCJA 5: 💰 Szkoda i roszczenie**
```javascript
questions: [
    { id: 'damage_type', label: 'Rodzaj szkody', type: 'checkbox',
      options: [
        'Uszkodzenie pojazdu', 
        'Obrażenia ciała', 
        'Utrata dochodów',
        'Koszty leczenia',
        'Ból i cierpienie (zadośćuczynienie)',
        'Utrata możliwości zarobkowania',
        'Koszty pogrzebu',
        'Inne'
      ]
    },
    { id: 'claimed_amount', label: 'Żądana kwota odszkodowania', type: 'number' },
    { id: 'repair_cost', label: 'Koszt naprawy (jeśli znany)', type: 'number' },
    { id: 'lost_income', label: 'Utracone dochody', type: 'number' },
    { id: 'medical_costs', label: 'Koszty leczenia', type: 'number' },
    { id: 'compensation_pain', label: 'Zadośćuczynienie (szacunek)', type: 'number' }
]
```

### **SEKCJA 6: 🏥 Obrażenia/Uszczerbek (jeśli dotyczy)**
```javascript
questions: [
    { id: 'injuries_description', label: 'Opis obrażeń', type: 'textarea' },
    { id: 'hospitalization', label: 'Czy była hospitalizacja?', type: 'radio' },
    { id: 'hospital_days', label: 'Ile dni w szpitalu?', type: 'number' },
    { id: 'permanent_injury', label: 'Czy jest trwały uszczerbek?', type: 'radio' },
    { id: 'injury_percentage', label: '% uszczerbku (jeśli ustalono)', type: 'number' },
    { id: 'medical_opinion', label: 'Czy jest opinia lekarska?', type: 'radio' },
    { id: 'rehabilitation', label: 'Czy potrzebna rehabilitacja?', type: 'radio' },
    { id: 'future_costs', label: 'Szacowane przyszłe koszty leczenia', type: 'number' }
]
```

### **SEKCJA 7: 📄 Status sprawy**
```javascript
questions: [
    { id: 'stage', label: 'Na jakim etapie jest sprawa?', type: 'select',
      options: [
        'Zgłoszenie do TU',
        'Odmowa TU',
        'Negocjacje',
        'Wezwanie przedsądowe',
        'Pozew złożony',
        'Postępowanie sądowe',
        'Wyrok',
        'Inne'
      ]
    },
    { id: 'lawsuit_filed', label: 'Czy złożono pozew?', type: 'radio' },
    { id: 'lawsuit_date', label: 'Data złożenia pozwu', type: 'date' },
    { id: 'court_name', label: 'Nazwa sądu', type: 'text' },
    { id: 'case_signature', label: 'Sygnatura sprawy', type: 'text' }
]
```

### **SEKCJA 8: 👥 Strona przeciwna**
```javascript
questions: [
    { id: 'defendant_name', label: 'Nazwa/Imię pozwanego', type: 'text' },
    { id: 'defendant_address', label: 'Adres', type: 'text' },
    { id: 'defendant_insurance', label: 'TU pozwanego (jeśli znane)', type: 'text' },
    { id: 'defendant_policy', label: 'Numer polisy pozwanego', type: 'text' },
    { id: 'defendant_lawyer', label: 'Czy pozwany ma pełnomocnika?', type: 'radio' },
    { id: 'defendant_lawyer_name', label: 'Nazwa kancelarii', type: 'text' }
]
```

### **SEKCJA 9: 📎 Dowody**
```javascript
questions: [
    { id: 'has_photos', label: 'Czy są zdjęcia?', type: 'radio' },
    { id: 'has_witnesses', label: 'Czy są świadkowie?', type: 'radio' },
    { id: 'has_medical_docs', label: 'Czy są dokumenty medyczne?', type: 'radio' },
    { id: 'has_receipts', label: 'Czy są faktury/rachunki?', type: 'radio' },
    { id: 'has_expert_opinion', label: 'Czy jest opinia biegłego?', type: 'radio' }
]
```

### **SEKCJA 10: 🆘 Cele i oczekiwania**
```javascript
questions: [
    { id: 'client_goal', label: 'Co jest najważniejsze dla klienta?', type: 'checkbox',
      options: [
        'Najwyższa możliwa kwota',
        'Szybkie zakończenie',
        'Ugoda polubowna',
        'Proces sądowy',
        'Zadośćuczynienie moralne',
        'Przyznanie odpowiedzialności'
      ]
    },
    { id: 'urgency', label: 'Pilność sprawy', type: 'select',
      options: ['Bardzo pilna', 'Pilna', 'Normalna', 'Niska'] },
    { id: 'additional_info', label: 'Dodatkowe informacje', type: 'textarea' }
]
```

---

## 📅 **PROCEDURA (8 FAZ):**

### **FAZA 1: 📋 ZGŁOSZENIE I ANALIZA (1-7 dni)**
```javascript
tasks: [
    { name: 'Zebranie dokumentów od klienta', critical: true },
    { name: 'Analiza szans powodzenia' },
    { name: 'Wstępna wycena roszczenia' },
    { name: 'Identyfikacja strony odpowiedzialnej' },
    { name: 'Sprawdzenie polis ubezpieczeniowych' }
]
```

### **FAZA 2: 🔍 POSTĘPOWANIE LIKWIDACYJNE (30-90 dni)**
```javascript
tasks: [
    { name: 'Zgłoszenie szkody do TU (jeśli nie zgłoszone)', critical: true },
    { name: 'Monitorowanie postępowania TU' },
    { name: 'Dostarczanie dokumentów na żądanie TU' },
    { name: 'Uzyskanie opinii rzeczoznawcy TU' },
    { name: 'Oczekiwanie na decyzję TU', help: 'TU ma 30 dni na decyzję' }
]
```

### **FAZA 3: 📝 NEGOCJACJE Z TU (30-60 dni)**
```javascript
tasks: [
    { name: 'Analiza decyzji TU' },
    { name: 'Przygotowanie kontrargumentów', critical: true },
    { name: 'Rozmowy z likwidatorem' },
    { name: 'Przedstawienie własnej wyceny' },
    { name: 'Negocjacje kwoty' },
    { name: 'Próba ugody pozasądowej' }
]
```

### **FAZA 4: ⚠️ WEZWANIE PRZEDSĄDOWE (14-30 dni)**
```javascript
tasks: [
    { name: 'Przygotowanie wezwania do zapłaty', critical: true },
    { name: 'Wysłanie wezwania listem poleconym' },
    { name: 'Wyznaczenie terminu odpowiedzi (14 dni)' },
    { name: 'Oczekiwanie na odpowiedź' },
    { name: 'Ostateczne negocjacje' }
]
```

### **FAZA 5: ⚖️ POZEW I POSTĘPOWANIE SĄDOWE (6-18 miesięcy)**
```javascript
tasks: [
    { name: 'Przygotowanie pozwu', critical: true },
    { name: 'Zebranie dowodów' },
    { name: 'Złożenie pozwu w sądzie' },
    { name: 'Opłata sądowa (5% wartości)' },
    { name: 'Oczekiwanie na termin rozprawy' },
    { name: 'Udział w rozprawach' },
    { name: 'Opinia biegłego (jeśli potrzebna)' }
]
```

### **FAZA 6: 💡 DOWODY I OPINIE (3-6 miesięcy)**
```javascript
tasks: [
    { name: 'Zeznania świadków' },
    { name: 'Opinia biegłego z zakresu medycyny' },
    { name: 'Opinia biegłego rzeczoznawcy (pojazdy)' },
    { name: 'Dokumentacja fotograficzna' },
    { name: 'Dokumentacja medyczna' }
]
```

### **FAZA 7: 📜 WYROK (1-3 miesiące)**
```javascript
tasks: [
    { name: 'Oczekiwanie na wyrok' },
    { name: 'Analiza wyroku', critical: true },
    { name: 'Decyzja o apelacji (14 dni)' },
    { name: 'Uzasadnienie pisemne' },
    { name: 'Klauzula wykonalności' }
]
```

### **FAZA 8: 💰 EGZEKUCJA (3-12 miesięcy)**
```javascript
tasks: [
    { name: 'Wezwanie do dobrowolnej zapłaty' },
    { name: 'Wniosek o egzekucję komorniczą', critical: true },
    { name: 'Zajęcie rachunków bankowych' },
    { name: 'Zajęcie wynagrodzenia' },
    { name: 'Ściągnięcie należności' }
]
```

---

## 📄 **DOKUMENTY WYMAGANE (15-20 dokumentów):**

### **PODSTAWOWE (dla każdej sprawy):**
1. 📋 **Pełnomocnictwo**
2. 📄 **Wniosek o wypłatę odszkodowania** (do TU)
3. 💼 **Wezwanie przedsądowe**
4. ⚖️ **Pozew o zapłatę**

### **WYPADKI KOMUNIKACYJNE:**
5. 🚗 **Protokół policji** (jeśli był)
6. 📸 **Zdjęcia pojazdu/miejsca wypadku**
7. 🛠️ **Kosztorys naprawy**
8. 📑 **Opinia rzeczoznawcy**
9. 🚙 **Dowód rejestracyjny**
10. 📜 **Polisa OC/AC**

### **OBRAŻENIA CIAŁA:**
11. 🏥 **Dokumentacja medyczna** (karty szpitalne, wyniki badań)
12. 💊 **Recepty i paragony** (leczenie)
13. 🩺 **Opinia medyczna** (uszczerbek %)
14. 📋 **Zaświadczenie o niezdolności do pracy**
15. 💰 **Zaświadczenie o dochodach**

### **BŁĘDY MEDYCZNE:**
16. 🏥 **Historia choroby**
17. 📋 **Dokumentacja zabiegów**
18. 🩺 **Opinia biegłego medyka**
19. 📑 **Korespondencja ze szpitalem**

### **DODATKOWE:**
20. 👥 **Zeznania świadków**
21. 📹 **Nagrania (jeśli są)**
22. 📊 **Wyciągi bankowe** (koszty)
23. 🧾 **Faktury za leczenie**
24. 📎 **Inne dowody**

---

## 🎨 **KOLORYSTYKA:**

```css
/* Moduł odszkodowań - niebieski */
Primary:   #3498db (niebieski - zaufanie, profesjonalizm)
Secondary: #2980b9 (ciemniejszy niebieski)
Gradient:  linear-gradient(135deg, #3498db, #2980b9)
```

**Dlaczego niebieski?**
- ✅ Zaufanie i bezpieczeństwo
- ✅ Profesjonalizm (sprawy sądowe)
- ✅ Spokój (w przeciwieństwie do stresu klienta)
- ✅ Odróżnienie od upadłości (🟠) i restrukturyzacji (🟢)

---

## 🔧 **FUNKCJE SPECJALNE:**

### **1. Kalkulator odszkodowania**
```javascript
calculateCompensation() {
    // Automatyczna wycena na podstawie:
    - Typ szkody
    - Uszczerbek %
    - Czas niezdolności do pracy
    - Dochody
    - Orzecznictwo sądowe
    - Stawki rynkowe
}
```

### **2. Baza orzecznictwa**
```javascript
// Sugestie kwot na podstawie podobnych spraw
findSimilarCases(injuryType, injuryPercentage) {
    return cases.filter(c => 
        c.type === injuryType && 
        c.percentage >= injuryPercentage - 5 &&
        c.percentage <= injuryPercentage + 5
    );
}
```

### **3. Tracker TU**
```javascript
// Monitorowanie terminów TU
trackInsuranceDeadline(claimDate) {
    const deadline = claimDate + 30 days;
    if (today > deadline) {
        alert("TU przekroczyło termin! Możliwe dodatkowe roszczenie!");
    }
}
```

### **4. Generator pism**
```javascript
// Automatyczne generowanie:
- Wezwanie przedsądowe
- Pozew
- Pismo uzupełniające
- Apelacja
```

---

## 📊 **STATYSTYKI I RAPORTY:**

### **Dashboard klienta:**
- 📅 Timeline sprawy (gdzie jesteśmy)
- 💰 Żądana kwota vs. oferowana przez TU
- ⏱️ Czas trwania sprawy
- 📈 Szanse powodzenia (%)
- 📋 Status dokumentów

### **Dla mecenasa:**
- 📊 Statystyki wygranych spraw
- 💵 Średnie kwoty uzyskane
- ⏱️ Średni czas sprawy
- 🏢 Ranking TU (które najszybciej płacą)
- 📈 Trend orzeczeń sądowych

---

## 🚀 **INTEGRACJE:**

### **1. Bazy danych:**
- 🚗 **CEPiK** - dane pojazdów
- 🏥 **NFZ** - dokumentacja medyczna (jeśli zgoda)
- ⚖️ **Orzeczenia sądów** - podobne sprawy

### **2. Zewnętrzne API:**
- 📧 **Email** - powiadomienia dla klienta
- 📱 **SMS** - przypomnienia o terminach
- 📄 **e-Sąd** - składanie pism elektronicznie

### **3. AI i automatyzacja:**
- 🤖 **Wycena odszkodowania** (ML model)
- 📝 **Generowanie pism** (GPT)
- 📊 **Analiza orzecznictwa** (podobne sprawy)
- 🎯 **Prognoza wyniku** (szanse powodzenia)

---

## ⚠️ **SZCZEGÓLNE UWAGI:**

### **Dla spraw z TU:**
1. ⏱️ **Terminy są KRYTYCZNE** - TU ma 30 dni
2. 📋 **Dokumentacja musi być KOMPLETNA**
3. 💰 **Pierwsze oferty TU są ZAWSZE za niskie**
4. 📞 **Komunikacja na piśmie** (email, listy)
5. 🎯 **Negocjacje są kluczowe** (80% spraw kończy się ugodą)

### **Dla obrażeń ciała:**
1. 🏥 **Opinia medyczna KLUCZOWA**
2. 📊 **Dokumentuj WSZYSTKO** (wizyty, leki, koszty)
3. ⏱️ **Uszczerbek trwały ≠ uszczerbek czasowy**
4. 💰 **Zadośćuczynienie** to osobna pozycja
5. 📈 **Renta może być dożywotnia**

---

## 📋 **PYTANIA DO POTWIERDZENIA:**

### **1. STRUKTURA ANKIETY:**
❓ Czy 10 sekcji jest OK? Może więcej/mniej?
❓ Czy podział na typy szkód (komunikacyjne/medyczne/majątkowe) jest jasny?
❓ Czy sekcja o TU ma wszystkie istotne pola?

### **2. PROCEDURA:**
❓ Czy 8 faz wystarczy?
❓ Czy faza negocjacji jest wystarczająco szczegółowa?
❓ Czy dodać fazę "odwołanie do rzecznika"?

### **3. DOKUMENTY:**
❓ Czy 24 dokumenty to odpowiednia liczba?
❓ Czy wszystkie typy szkód są pokryte?
❓ Czy dodać szablony pism?

### **4. FUNKCJE:**
❓ Czy kalkulator odszkodowania jest potrzebny?
❓ Czy tracker terminów TU jest przydatny?
❓ Czy integracja z bazami orzeczeń?

### **5. KOLORYSTYKA:**
❓ Niebieski OK? Czy inny kolor?
❓ Gradient: #3498db → #2980b9?

---

## 🎯 **PODSUMOWANIE PLANU:**

```
✅ 10 SEKCJI ankiety
✅ 8 FAZ procedury
✅ 24 DOKUMENTY
✅ 4 FUNKCJE SPECJALNE
✅ Kolor NIEBIESKI
✅ Focus na TU (70% czasu dev)
✅ Obsługa prywatnych (20%)
✅ State/samorząd (10%)
```

---

## 🤔 **CZEKAM NA POTWIERDZENIE:**

**ZATWIERDŹ LUB ZMIEŃ:**
1. ✅ / ❌ Struktura ankiety (10 sekcji)
2. ✅ / ❌ Procedura (8 faz)
3. ✅ / ❌ Dokumenty (24)
4. ✅ / ❌ Funkcje (kalkulator, tracker, AI)
5. ✅ / ❌ Kolorystyka (niebieski)

**DODATKOWE SUGESTIE:**
- Co dodać?
- Co usunąć?
- Co zmienić?

---

**Status:** ⏳ CZEKAM NA TWOJE OK!  
**Po zatwierdzeniu:** Zacznę kodować moduł!

**PRZECZYTAJ I DAJ FEEDBACK!** 💰📋✨

