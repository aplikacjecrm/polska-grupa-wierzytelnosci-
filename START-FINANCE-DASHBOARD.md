# 🚀 SZYBKI START - FINANCE DASHBOARD

## ⚡ URUCHOMIENIE (5 MINUT):

### 1️⃣ Uruchom migracje:
```powershell
cd C:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app

node backend/scripts/run-012-migration.js
node backend/scripts/run-013-migration.js
```

**Powinno być:**
```
✅ Tabela payment_receipts utworzona
✅ Tabela employee_payments utworzona
```

---

### 2️⃣ Restart serwera:
```powershell
# Jeśli serwer działa - zatrzymaj (Ctrl+C)
# Uruchom ponownie:
npm start
```

**Sprawdź logi:**
```
✅ receipts.js router loaded - Faktury i paragony! 📄
✅ employee-payments.js router loaded - Wypłaty pracowników! 💼
```

---

### 3️⃣ Wyczyść cache przeglądarki:
```
Ctrl + Shift + Delete
→ Zaznacz "Obrazy i pliki w pamięci podręcznej"
→ Zaznacz "Pliki cookie i inne dane witryn"
→ Kliknij "Wyczyść dane"
→ Zamknij CAŁĄ przeglądarkę (wszystkie okna)
→ Otwórz na nowo
```

---

### 4️⃣ Zaloguj się:
```
URL: http://localhost:3500

Jako Admin:
Email: admin@promeritum.pl
Hasło: admin123

LUB jako Finance:
Email: finanse@promeritum.pl
Hasło: Finanse123!@#
```

---

### 5️⃣ Otwórz Finance Dashboard:
```
1. Kliknij "💰 Finanse" w menu bocznym
2. Dashboard się ładuje
3. Sprawdź czy widać 6 zakładek:
   ├── 💰 Płatności
   ├── 👥 Prowizje
   ├── 💼 Wypłaty
   ├── 🏢 Wydatki
   ├── 📄 Faktury
   └── 📊 Raporty
```

---

## 🧪 SZYBKI TEST:

### Test automatycznego paragonu:
```
1. Otwórz jakąkolwiek płatność klienta (z listy płatności)
2. Kliknij "💵 Gotówka"
3. Wpisz: PAR/TEST/001
4. Zatwierdź
5. Wróć do Finance Dashboard → zakładka "📄 Faktury"
6. POWINIEN POJAWIĆ SIĘ nowy paragon! ✅
```

---

## ❓ CO JEŚLI NIE DZIAŁA:

### Błąd: "Cannot find module"
```powershell
npm install
npm start
```

### Błąd: "financeDashboard not found"
```
1. Ctrl + Shift + Delete - wyczyść cache
2. Zamknij CAŁĄ przeglądarkę
3. Otwórz na nowo
4. Zaloguj ponownie
```

### Błąd: "Table already exists"
```
# To OK! Migracja już została uruchomiona wcześniej
# Pomiń ten krok i przejdź dalej
```

### Dashboard nie scrolluje / brak menu
```
1. F12 → Console
2. Sprawdź błędy JavaScript
3. Odśwież (Ctrl + F5)
4. Jeśli dalej problem - wyczyść cache i zamknij przeglądarkę
```

---

## ✅ CO POWINNO DZIAŁAĆ:

### Zakładka "💰 Płatności":
- ✅ Lista płatności klientów
- ✅ Filtry
- ✅ Statystyki
- ✅ Paginacja

### Zakładka "📄 Faktury":
- ✅ Lista faktur i paragonów
- ✅ Automatyczne generowanie po opłaceniu
- ✅ Statystyki

### Zakładka "👥 Prowizje":
- ✅ Lista prowizji do wypłaty
- ✅ Statystyki
- ✅ Przycisk "Wypłać"

### Zakładka "💼 Wypłaty":
- ✅ Lista wypłat pracowników
- ✅ Statystyki
- ✅ Przycisk "Wypłać"

---

## 🎯 GOTOWE!

**System działa!** 🚀

Jeśli masz problem - sprawdź `FINANCE-SYSTEM-COMPLETE.md` dla pełnej dokumentacji.

---

**Data:** 24.11.2025
**Status:** ✅ Production Ready
