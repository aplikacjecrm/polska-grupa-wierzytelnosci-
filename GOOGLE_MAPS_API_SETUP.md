# 🗺️ Konfiguracja Google Maps API

## ✅ CO ZOSTAŁO DODANE:

1. **Google Places Autocomplete** - autouzupełnianie adresów
2. **Smart formatting** - automatyczne myślniki w kodach pocztowych (XX-XXX)
3. **API Sądów/Prokuratur** - gotowa infrastruktura
4. **Przyjazny UX** - ikony, podpowiedzi, walidacja

---

## 🔑 JAK UZYSKAĆ GOOGLE MAPS API KEY:

### **Krok 1: Utwórz projekt w Google Cloud**

1. Idź na: https://console.cloud.google.com/
2. Zaloguj się kontem Google
3. Kliknij "Select a project" → "New Project"
4. Nazwa projektu: `Pro Meritum Komunikator`
5. Kliknij "Create"

### **Krok 2: Włącz Places API**

1. W menu po lewej: **APIs & Services** → **Library**
2. Wyszukaj: `Places API`
3. Kliknij na wynik
4. Kliknij **ENABLE**

### **Krok 3: Utwórz API Key**

1. W menu: **APIs & Services** → **Credentials**
2. Kliknij **+ CREATE CREDENTIALS** → **API key**
3. Skopiuj wygenerowany klucz (np. `AIzaSyAbCd1234567890...`)

### **Krok 4: Zabezpiecz API Key**

1. Kliknij na nazwę klucza
2. **Application restrictions**:
   - Wybierz: `HTTP referrers (web sites)`
   - Dodaj: `http://localhost:3500/*`
   - Dodaj: `http://127.0.0.1:3500/*`
3. **API restrictions**:
   - Wybierz: `Restrict key`
   - Zaznacz: `Places API`
4. Kliknij **SAVE**

### **Krok 5: Wklej klucz do aplikacji**

Otwórz plik: `frontend/index.html`

Znajdź linię:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXX&libraries=places&language=pl" async defer></script>
```

Zamień `AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXX` na swój klucz:
```html
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAbCd1234567890&libraries=places&language=pl" async defer></script>
```

---

## 💰 CENNIK (Bezpłatne limity):

Google Maps daje **$200 darmowych kredytów miesięcznie**:
- Places Autocomplete: **$2.83 za 1000 żądań**
- Limit bezpłatny: ~**70,000 żądań/miesiąc**

➡️ **Dla małej kancelarii to wystarczy!**

---

## ✅ JAK TESTOWAĆ:

1. **Zrestartuj przeglądarkę** (tryb INCOGNITO):
   ```
   Ctrl + Shift + N
   http://localhost:3500
   ```

2. **Otwórz sprawę** → zakładka "📅 Wydarzenia"

3. **Dodaj wydarzenie** → pole "📍 Lokalizacja"

4. **Zacznij pisać adres**:
   ```
   Sąd Okręgo...
   ```

5. **Pojawi się lista podpowiedzi** z Google Maps

6. **Wybierz** → adres uzupełni się automatycznie!

---

## 🔧 SMART FORMATTING:

### Automatyczne myślniki w kodach pocztowych:

**Wpisujesz:** `00123 Warszawa`  
**Zamienia się na:** `00-123 Warszawa`  

Działa podczas wpisywania! 🎯

---

## 🏛️ API SĄDÓW/PROKURATUR:

### **Backend gotowy:**

```
GET /api/legal-data/courts          - Lista sądów
GET /api/legal-data/prosecutors     - Lista prokuratur
GET /api/legal-data/judges/search   - Wyszukiwanie sędziów
GET /api/legal-data/court/:id/statistics - Statystyki sądu
```

### **Przykład użycia:**

```javascript
const response = await window.api.request('/legal-data/courts');
console.log(response.courts);
// [
//   {
//     name: 'Sąd Okręgowy w Warszawie',
//     address: 'Al. Solidarności 127, 00-898 Warszawa',
//     departments: ['I Wydział Cywilny', 'II Wydział Cywilny', ...]
//   }
// ]
```

### **⚠️ UWAGA:**

Oficjalne API sądów/prokuratur **NIE ISTNIEJE** w Polsce.

Obecnie zwracane są **mockowane dane**.

### **Możliwe rozszerzenia:**

1. **Portal Orzeczeń**: https://orzeczenia.ms.gov.pl/
   - Scraping danych z wyroków
   - Wyciąganie nazwisk sędziów

2. **API.gov.pl** - publiczne API rządowe (jeśli się pojawi)

3. **Własna baza danych** - ręczne wprowadzanie danych

---

## 🎯 CO DZIAŁA TERAZ:

✅ Google Maps Autocomplete (po dodaniu API Key)  
✅ Automatyczne formatowanie kodów pocztowych  
✅ Backend API dla sądów/prokuratur (mockowane dane)  
✅ 11 typów wydarzeń z dedykowanymi polami  
✅ System załączników  
✅ Numeracja PREFIX/TYP/INICJAŁY/SPRAWA/WYDARZENIE  

---

## 📝 NASTĘPNE KROKI:

1. ✅ Dodaj Google Maps API Key
2. ✅ Testuj w trybie INCOGNITO
3. 🔄 Rozbuduj bazę sądów/prokuratur (opcjonalnie)
4. 🔄 Dodaj scraping Portal Orzeczeń (opcjonalnie)

---

**Gotowe do użycia!** 🚀✨
