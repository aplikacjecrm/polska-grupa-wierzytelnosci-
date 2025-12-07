# ✅ ANKIETA ROZBUDOWANA v4.0 - WSZYSTKIE USPRAWNIENIA!

## 🎯 **NOWE FUNKCJE:**

---

## 1️⃣ **📱 PYTANIE O URZĄDZENIE**

### **Gdzie:**
- **Pierwsza sekcja** "👤 KTO JEST DŁUŻNIKIEM?"
- **Pierwsze pytanie** przed wyborem typu dłużnika

### **Pytanie:**
```
📱 Wypełniasz tę ankietę na:
( ) 💻 Komputerze / Laptopie
( ) 📱 Tablecie
( ) 📱 Telefonie
```

### **Po co:**
- ✅ **Optymalizacja interfejsu** - możemy dostosować rozmiar przycisków
- ✅ **Statystyki** - wiemy jak klienci wypełniają ankiety
- ✅ **UX** - jeśli tablet → większe przyciski, lepsze spacing
- ✅ **Wsparcie techniczne** - wiemy z czego korzystają

### **Zapis:**
```javascript
answers: {
    "debtor_type_device_type": "tablet"  // lub "computer" lub "phone"
}
```

---

## 2️⃣ **🌐 STRONA INTERNETOWA WIERZYCIELA**

### **Gdzie:**
- **Sekcja:** "👥 WIERZYCIELE"
- **Nowe pole** po nazwie wierzyciela, przed NIP

### **Pytanie:**
```
🌐 Strona internetowa wierzyciela
[_______________________________________]
np. https://www.bank.pl

💡 Podaj stronę www - automatycznie pobierzemy 
   dane wierzyciela (adres, NIP, telefon)
```

### **Po co:**
- ✅ **Automatyczne pobieranie danych** - system może zescrapować dane
- ✅ **Weryfikacja wierzyciela** - sprawdzamy czy firma istnieje
- ✅ **Oszczędność czasu** - klient nie musi przepisywać adresu
- ✅ **Dokładność** - dane z oficjalnej strony są pewniejsze

### **Przyszłość (TODO):**
```javascript
// Backend będzie mógł:
async function fetchCreditorData(website) {
    // 1. Otwórz stronę www
    const page = await scraper.visit(website);
    
    // 2. Znajdź NIP (zazwyczaj w stopce)
    const nip = page.find('footer', 'NIP:');
    
    // 3. Znajdź adres
    const address = page.find('kontakt', 'adres');
    
    // 4. Zwróć dane
    return { nip, address, phone, email };
}
```

### **Zapis:**
```javascript
answers: {
    "creditors_creditor_name": "Bank ABC",
    "creditors_creditor_website": "https://www.bankabc.pl",
    "creditors_creditor_nip": "1234567890",  // Auto-wypełnione!
    "creditors_creditor_address": "ul. Bankowa 1..."  // Auto-wypełnione!
}
```

---

## 3️⃣ **❌ UKRYTO SEKCJĘ RESTRUKTURYZACJI DLA KONSUMENTA**

### **Co się zmieniło:**

**PRZED (błąd):**
- Konsument widział sekcję: "🔄 HISTORIA RESTRUKTURYZACJI"
- Pytania o przyspieszone/zwykłe postępowanie układowe
- **NIE DOTYCZY** konsumenta!

**PO (naprawione):**
```javascript
{
    id: 'restructuring_history',
    title: '🔄 HISTORIA RESTRUKTURYZACJI',
    showIf: ['entrepreneur', 'sp_zoo', 'sp_akcyjna', 'prosta_sa', 'partner'], // ← DODANE!
    questions: [...]
}
```

### **Kto widzi:**
- ✅ **Przedsiębiorca** - TAK
- ✅ **Sp. z o.o.** - TAK
- ✅ **S.A.** - TAK
- ✅ **Wspólnik** - TAK
- ❌ **Konsument** - NIE (nie dotyczy!)

### **Po co:**
- ✅ **Konsument nie męczy się** niepotrzebnymi pytaniami
- ✅ **Mniej zamieszania** - tylko firmy mają restrukturyzację
- ✅ **Szybsze wypełnianie** - krótsza ankieta dla konsumenta

---

## 4️⃣ **👔 SZCZEGÓŁOWE PYTANIA O PRACĘ (KONSUMENT)**

### **Nowe pytania w sekcji** "💭 TWOJA SYTUACJA OSOBISTA":

#### **1. Czy obecnie pracujesz?**
```
( ) Tak, pracuję
( ) Nie, jestem bezrobotny/a
( ) Jestem na emeryturze/rencie
```

#### **2. Twoje stanowisko/zawód** (jeśli pracujesz)
```
[_______________________________________]
np. sprzedawca, kierowca, księgowa
```

#### **3. Ile lat w sumie pracowałeś/aś w życiu?**
```
[____] lat (0-60)

💡 Pomaga zrozumieć Twoją sytuację życiową 
   i stabilność zawodową
```

#### **4. Ile lat pracujesz u obecnego pracodawcy?** (jeśli pracujesz)
```
[____] lat
```

#### **5. Jak oceniasz stabilność swojego zatrudnienia?** (jeśli pracujesz)
```
( ) Stabilne - umowa na czas nieokreślony
( ) Czasowe - umowa na czas określony
( ) Niepewne - umowy zlecenia/dzieło
( ) Sezonowe
```

#### **6. Czy w przeszłości utraciłeś/aś pracę?**
```
( ) Tak
( ) Nie
```

#### **7. Kiedy utraciłeś/aś pracę?** (jeśli tak)
```
[__/__/____]
```

#### **8. Z jakiego powodu straciłeś/aś pracę?** (jeśli tak)
```
[_______________________________________]
np. likwidacja stanowiska, zwolnienie grupowe, 
    pandemia, problemy zdrowotne
```

### **Po co te pytania:**

✅ **Poznanie sytuacji życiowej:**
- Czy osoba jest stabilnie zatrudniona?
- Czy ma długi staż pracy (wiarygodność)?
- Czy często zmienia pracę (czerwona flaga)?

✅ **Ocena zdolności spłaty:**
- Czy ma stałe dochody?
- Czy zatrudnienie jest pewne?
- Czy może być podstawa do układu (plan spłaty)?

✅ **Przygotowanie strategii:**
- Jeśli stabilna praca → plan spłaty 3-7 lat
- Jeśli brak pracy → umorzenie bez spłaty
- Jeśli emerytura → minimalna spłata

✅ **Argumentacja w sądzie:**
- "Klient pracował 20 lat, teraz bez pracy z powodu pandemii"
- "Klient ma stabilne zatrudnienie, może spłacać 500 zł/mies"

---

## 📊 **PORÓWNANIE: PRZED vs PO**

### **KONSUMENT - Sekcja "SYTUACJA OSOBISTA":**

| PRZED | PO |
|-------|-----|
| 9 pytań | **17 pytań** |
| Podstawowe info | Szczegółowa analiza |
| Czy utraciłeś pracę? (TAK/NIE) | Kiedy? Dlaczego? Jak długo pracowałeś? |
| Brak info o stabilności | Typ umowy, staż, zawód |
| ❌ Sekcja restrukturyzacji widoczna | ✅ Ukryta (nie dotyczy) |

### **WSZYSCY - Początek ankiety:**

| PRZED | PO |
|-------|-----|
| Od razu typ dłużnika | **Pytanie o urządzenie** (tablet/PC) |
| Brak info technicznej | Możliwość optymalizacji UX |

### **WIERZYCIELE:**

| PRZED | PO |
|-------|-----|
| Ręczne przepisywanie | **Strona www → auto-scraping** (TODO) |
| Nazwa, adres, NIP manualnie | Podaj link → system wypełni |

---

## 🎯 **PRZYKŁAD UŻYCIA:**

### **Scenariusz 1: Konsument na tablecie**

1. **Pytanie 1:** Wypełniasz na: `📱 Tablecie` ✅
2. **Pytanie 2:** Rodzaj dłużnika: `Konsument` ✅
3. System **ukrywa:**
   - ❌ NIP, REGON (nie dotyczy)
   - ❌ Sekcję restrukturyzacji (nie dotyczy)
4. System **pokazuje:**
   - ✅ Sekcję "💭 TWOJA SYTUACJA OSOBISTA"
   - ✅ 17 pytań o pracę, życie, dochody
5. Klient wypełnia:
   - Pracował 15 lat
   - Obecnie bezrobotny od 6 miesięcy (pandemia)
   - Wcześniej umowa na czas nieokreślony
6. **Mecenas widzi pełny obraz:**
   - Stabilna osoba (15 lat pracy)
   - Tymczasowe problemy (COVID)
   - Dobra podstawa do układu

### **Scenariusz 2: Firma - wierzyciel Bank ABC**

1. Sekcja wierzycieli
2. Nazwa: `Bank ABC S.A.`
3. **Strona www:** `https://www.bankabc.pl` ← NOWE!
4. System (TODO):
   - Otwiera stronę
   - Znajduje NIP: `1234567890`
   - Znajduje adres: `ul. Bankowa 1, Warszawa`
   - **Auto-wypełnia** pola!
5. Klient tylko weryfikuje: ✅ Zgadza się!

---

## 📋 **LISTA ZMIAN:**

### **bankruptcy-questionnaire.js:**

1. ✅ Dodano pytanie o urządzenie (device_type)
2. ✅ Dodano pole "creditor_website" w sekcji wierzycieli
3. ✅ Ukryto sekcję "restructuring_history" dla konsumenta
4. ✅ Dodano 8 nowych pytań o pracę dla konsumenta:
   - current_employment
   - current_job_title
   - years_worked_total
   - years_current_employer
   - job_stability
   - job_loss (zmieniono label)
   - job_loss_when
   - job_loss_reason

### **index.html:**
- ✅ Wersja v7 (`ENHANCED_QUESTIONS=TRUE`)

---

## 🧪 **JAK PRZETESTOWAĆ:**

```
Ctrl + Shift + F5
```

### **Test 1: Pytanie o urządzenie**
1. Otwórz ankietę
2. **Pierwsze pytanie:** "📱 Wypełniasz tę ankietę na:"
3. Wybierz: Tablecie
4. ✅ Zapisane w `device_type`

### **Test 2: Konsument - ukryta restrukturyzacja**
1. Wybierz: **Konsument**
2. Przejrzyj wszystkie sekcje
3. ✅ NIE MA sekcji "🔄 HISTORIA RESTRUKTURYZACJI"

### **Test 3: Szczegółowe pytania o pracę**
1. Wybierz: **Konsument**
2. Sekcja: **"💭 TWOJA SYTUACJA OSOBISTA"**
3. Znajdź pytania:
   - "Czy obecnie pracujesz?"
   - "Ile lat w sumie pracowałeś/aś?"
   - "Jak oceniasz stabilność zatrudnienia?"
4. ✅ Wszystkie widoczne!

### **Test 4: Strona www wierzyciela**
1. Sekcja: **"👥 WIERZYCIELE"**
2. Wypełnij: Nazwa
3. **Nowe pole:** "🌐 Strona internetowa wierzyciela"
4. Wpisz: `https://www.pkobp.pl`
5. ✅ Pole zapisane!

---

## 🚀 **CO DALEJ (TODO):**

### **1. Auto-scraping danych wierzyciela:**
```javascript
// Backend - gdy klient poda www:
app.post('/api/creditors/scrape', async (req, res) => {
    const { website } = req.body;
    
    // Scraping
    const data = await scrapeWebsite(website);
    
    // Zwróć: NIP, adres, telefon, email
    res.json(data);
});
```

### **2. Dostosowanie UI do urządzenia:**
```javascript
// Frontend - jeśli tablet:
if (answers.device_type === 'tablet') {
    // Większe przyciski
    buttonSize = '60px';
    fontSize = '1.2rem';
    spacing = '20px';
}
```

### **3. Statystyki urządzeń:**
```sql
SELECT 
    device_type,
    COUNT(*) as count,
    AVG(completion_time) as avg_time
FROM case_questionnaires
GROUP BY device_type;

-- Wynik:
-- computer: 45%, avg 15 min
-- tablet: 35%, avg 18 min
-- phone: 20%, avg 22 min
```

---

## ✅ **PODSUMOWANIE:**

| Funkcja | Status |
|---------|--------|
| Pytanie o urządzenie | ✅ DODANE |
| Strona www wierzyciela | ✅ DODANE |
| Ukryto restrukturyzację (konsument) | ✅ NAPRAWIONE |
| Szczegółowe pytania o pracę | ✅ DODANE (8 pytań) |
| Auto-scraping danych | ⏳ TODO |
| Dostosowanie UI do urządzenia | ⏳ TODO |

---

**Wersja:** v4.0  
**Data:** 2025-11-08 11:12  
**Plik:** `bankruptcy-questionnaire.js` v7  
**Status:** ✅ GOTOWE DO TESTOWANIA!

**ODŚWIEŻ I ZOBACZ ZMIANY!** 🎉🚀
