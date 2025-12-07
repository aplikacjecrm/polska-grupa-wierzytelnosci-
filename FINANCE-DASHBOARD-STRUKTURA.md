# 🏢 FINANCE DASHBOARD - KOMPLETNA STRUKTURA

## ✅ TAK! Wszystko będzie połączone w jednym Dashboard!

**Finance Dashboard v2.0** to **JEDEN centralny panel** dla całego zarządzania finansami firmy.

---

## 📊 STRUKTURA ZAKŁADEK

### 1. 💰 **PŁATNOŚCI** (już działa)
**Płatności od klientów**

✅ **Co jest:**
- Lista wszystkich płatności ze wszystkich spraw
- Filtry: status, metoda, daty, klient
- Statystyki: opłacone, oczekujące, przeterminowane
- Paginacja
- Szczegóły płatności + harmonogram rat

**Co dodamy:**
- Wykres przychodów (linia czasu)
- Eksport do Excel
- Prognozy przychodów

---

### 2. 👥 **PROWIZJE** (w budowie)
**Prowizje dla pracowników (mecenasi, opiekunowie)**

📋 **Co będzie:**
- **Do wypłaty:**
  - Lista prowizji oczekujących
  - Suma do wypłaty
  - Filtr po pracowniku
  - Przycisk "Wypłać wszystkie"

- **Wypłacone:**
  - Historia wypłaconych prowizji
  - Filtr: pracownik, okres, metoda

- **Statystyki:**
  - Prowizje według pracownika
  - Prowizje według miesiąca
  - Średnia prowizja
  - Top earners

- **Ustawienia:**
  - Stopy prowizji (domyślne)
  - Niestandardowe stawki per pracownik
  - Niestandardowe stawki per sprawa

**Funkcje:**
- Zatwierdzanie prowizji
- Grupowa wypłata
- Eksport zestawienia
- Integracja z wypłatami pracowników

---

### 3. 💼 **WYPŁATY PRACOWNIKÓW** (w budowie)
**Pensje, premie, prowizje**

📋 **Co będzie:**
- **Pensje miesięczne:**
  - Automatyczna lista pracowników
  - Wprowadź kwoty
  - Status: oczekująca/wypłacona
  - Historia pensji
  - Zestawienie roczne

- **Premie:**
  - Dodaj premię dla pracownika
  - Powód premii
  - Kwota
  - Status: oczekująca/wypłacona

- **Wypłata prowizji:**
  - Powiązanie z zakładką "Prowizje"
  - Masowa wypłata wybranych prowizji
  - Historia wypłat

- **Statystyki:**
  - Suma wypłat w miesiącu
  - Wypłaty według pracownika
  - Wykres pensji w czasie
  - PIT (zestawienie roczne)

**Funkcje:**
- Generowanie list płac
- Import/eksport
- Powiadomienia o wypłatach
- Integracja z ZUS/US (opcjonalnie)

---

### 4. 🏢 **WYDATKI FIRMY** (w budowie)
**Wszystkie koszty operacyjne**

📋 **Co będzie:**

#### **Lista wydatków:**
```
┌──────────────┬────────────┬──────────────┬─────────┬────────┬──────────┐
│ Data         │ Kategoria  │ Kontrahent   │ Kwota   │ Status │ Akcje    │
├──────────────┼────────────┼──────────────┼─────────┼────────┼──────────┤
│ 01.11.2025   │ Czynsz     │ Wynajmujący  │ 5000 zł │ ✅ Zap.│ 👁️ Detal│
│ 05.11.2025   │ Media      │ Energa       │  300 zł │ ⏳ Ocz.│ 💳 Zapłać│
│ 10.11.2025   │ Software   │ Microsoft    │  500 zł │ ⏳ Ocz.│ 💳 Zapłać│
└──────────────┴────────────┴──────────────┴─────────┴────────┴──────────┘
```

#### **Kategorie:**
1. 🏢 Wynajem i utrzymanie (czynsz, media, internet)
2. 💼 Pracownicy (pensje - osobna zakładka, ZUS)
3. 💻 Oprogramowanie (licencje, subskrypcje)
4. 📚 Usługi prawne/księgowe
5. 📢 Marketing (reklama, social media)
6. 🚗 Transport (paliwo, bilety)
7. 🖨️ Materiały biurowe
8. 🎓 Szkolenia
9. 🏦 Koszty bankowe
10. 🔧 Inne

#### **Formularz dodawania:**
```
[Dodaj wydatek]
┌─────────────────────────────────────┐
│ Kategoria: [Oprogramowanie ▼]      │
│ Kontrahent: Microsoft               │
│ NIP: 123-456-78-90                  │
│ Faktura nr: FV/2025/11/001          │
│ Data faktury: 01.11.2025            │
│ Kwota netto: 406.50 zł              │
│ VAT (23%): 93.50 zł                 │
│ Kwota brutto: 500.00 zł             │
│ Termin płatności: 15.11.2025        │
│ Upload faktury: [📎 Wybierz plik]   │
│ Notatka: _____________________      │
│ [💾 Zapisz]  [❌ Anuluj]           │
└─────────────────────────────────────┘
```

#### **Raporty:**
- Wydatki według kategorii
- Wydatki według miesiąca
- Wydatki według kontrahenta
- Zestawienie VAT (naliczony/odliczony)
- Wykres kosztów
- Top wydatki
- Porównanie rok do roku

---

### 5. 📊 **RAPORTY** (w budowie)
**Podsumowania finansowe**

📋 **Co będzie:**

#### **Przychody vs Wydatki:**
```
┌─────────────────────────────────────────┐
│ LISTOPAD 2025                           │
├─────────────────────────────────────────┤
│ Przychody (płatności):    125,000 zł ↑  │
│ Wydatki firmy:            -45,000 zł    │
│ Wypłaty pracowników:      -35,000 zł    │
│ ─────────────────────────────────────── │
│ Zysk operacyjny:           45,000 zł    │
│ Marża:                         36%      │
└─────────────────────────────────────────┘
```

#### **Wykresy:**
- 📈 Przychody w czasie (linia)
- 📊 Wydatki według kategorii (pie chart)
- 💰 Zysk netto (bar chart)
- 📉 Trendy miesięczne

#### **Statystyki:**
- Średni przychód per sprawa
- Średni koszt per pracownik
- ROI (zwrot z inwestycji)
- Cash flow (przepływ środków)

#### **Eksport:**
- Excel
- PDF
- CSV
- Wysyłka email

---

## 🔄 JAK TO DZIAŁA - PRZEPŁYW

### Scenariusz 1: Pełny cykl płatności
```
1. Admin tworzy płatność 10,000 zł
   → Zakładka "Płatności"
   
2. System automatycznie liczy prowizje
   → Prowizja mecenasa: 1,000 zł (10%)
   → Zakładka "Prowizje" → Status: Oczekująca
   
3. Klient płaci
   → Zakładka "Płatności" → Status: Opłacona
   
4. Finance wypłaca prowizję
   → Zakładka "Prowizje" → [Wypłać]
   → Zakładka "Wypłaty pracowników" → Nowy wpis
   
5. Raport pokazuje wszystko
   → Zakładka "Raporty"
   → Przychód: +10,000 zł
   → Wypłata: -1,000 zł
   → Zysk: 9,000 zł
```

### Scenariusz 2: Dodanie wydatku
```
1. Finance dodaje fakturę za czynsz
   → Zakładka "Wydatki" → [Dodaj wydatek]
   → Kategoria: Wynajem
   → Kwota: 5,000 zł
   
2. Admin zatwierdza
   → Status: Zatwierdzona
   
3. Finance rejestruje płatność
   → Status: Zapłacona
   
4. Raport aktualizuje się
   → Zakładka "Raporty"
   → Wydatki: +5,000 zł
   → Zysk: -5,000 zł
```

---

## 🎯 DOSTĘP

| Rola | Płatności | Prowizje | Wypłaty | Wydatki | Raporty |
|------|-----------|----------|---------|---------|---------|
| **Admin** | ✅ Pełny | ✅ Pełny | ✅ Pełny | ✅ Pełny | ✅ Pełny |
| **Finance** | ✅ Pełny | ✅ Pełny | ✅ Pełny | ✅ Pełny | ✅ Pełny |
| **Reception** | ✅ Odczyt | ❌ | ❌ | ❌ | ✅ Odczyt |
| **Lawyer** | ✅ Sprawy | ✅ Swoje | ❌ | ❌ | ❌ |

---

## 📱 WIDOK

```
┌─────────────────────────────────────────────────────────────┐
│ 💰 Dashboard Finansowy                                      │
│ Kompletny system zarządzania finansami                      │
├─────────────────────────────────────────────────────────────┤
│ ┌─────┬─────┬─────┬─────┬─────┐                           │
│ │ 💰  │ 👥  │ 💼  │ 🏢  │ 📊  │  ← ZAKŁADKI               │
│ │Płat.│Prow.│Wypł.│Wyd. │Rap. │                           │
│ └─────┴─────┴─────┴─────┴─────┘                           │
│                                                              │
│ [Zawartość aktywnej zakładki]                               │
│                                                              │
│ - Statystyki                                                │
│ - Filtry                                                    │
│ - Tabela danych                                             │
│ - Akcje (dodaj, edytuj, usuń, eksportuj)                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ PODSUMOWANIE

**TAK! Wszystko w jednym miejscu:**
- ✅ Jedno menu: "💰 Finanse"
- ✅ Jeden dashboard
- ✅ 5 zakładek
- ✅ Wszystkie dane finansowe
- ✅ Pełna integracja
- ✅ Spójny design

**Żadnych osobnych dashboardów! Wszystko razem!** 🚀

---

**Status:** Zakładki stworzone ✅  
**Następny krok:** Implementacja prowizji elastycznych
