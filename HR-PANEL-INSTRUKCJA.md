# 📋 HR PANEL - Instrukcja dla działu HR

## 🎯 Jak zarządzać wnioskami pracowników?

### **KROK 1: Otwórz HR Panel**

Przejdź do:
```
http://localhost:3500/hr-panel.html
```

Lub kliknij link w głównym panelu aplikacji (jeśli jesteś zalogowany jako HR/Admin).

---

## 🏖️ WNIOSKI URLOPOWE

### **Gdzie je znaleźć?**
- Zakładka **"🏖️ Wnioski urlopowe"** w HR Panel
- Endpoint API: `GET /api/hr-vacations/pending`

### **Co zobaczysz?**
Dla każdego wniosku:
- ✅ **Pracownik** - imię, nazwisko, stanowisko, email
- ✅ **Typ urlopu** - wypoczynkowy, na żądanie, zwolnienie, etc.
- ✅ **Daty** - od kiedy do kiedy
- ✅ **Liczba dni** - automatycznie policzone (bez weekendów)
- ✅ **Uwagi** - jeśli pracownik coś dodał
- ✅ **Ticket ID** - powiązany ticket w systemie

### **Jak zatwierdzić/odrzucić?**

#### **Zatwierdzenie:**
1. Kliknij przycisk **"✓ Zatwierdź"**
2. Potwierdź w popup
3. System:
   - Zmienia status na `approved`
   - Odejmuje dni z salda urlopowego pracownika
   - Zamyka powiązany ticket (jeśli istnieje)

#### **Odrzucenie:**
1. Kliknij przycisk **"✗ Odrzuć"**
2. Wpisz powód odrzucenia
3. System:
   - Zmienia status na `rejected`
   - Zapisuje powód odrzucenia
   - Zamyka powiązany ticket z informacją

---

## 🎓 WNIOSKI O SZKOLENIA

### **Gdzie je znaleźć?**
- Zakładka **"🎓 Wnioski o szkolenia"** w HR Panel
- Endpoint API: Dostępny w systemie ticketów z kategorią `hr_training`

### **Co zobaczysz?**
- Nazwa szkolenia
- Dostawca/organizator
- Szacowany koszt
- Data rozpoczęcia
- Czas trwania
- Uzasadnienie pracownika

### **Jak zatwierdzić?**
1. Zobacz szczegóły w tickecie
2. Zatwierdź/odrzuć ticket
3. Jeśli zatwierdzony - szkolenie zostanie dodane do profilu pracownika

---

## 📄 DOKUMENTY DO WERYFIKACJI

### **Gdzie je znaleźć?**
- Zakładka **"📄 Dokumenty do weryfikacji"** w HR Panel
- Pracownicy mogą przesyłać: dyplomy, certyfikaty, badania lekarskie

### **Co zobaczysz?**
- Typ dokumentu
- Nazwa pliku
- Data przesłania
- Przycisk do pobrania i weryfikacji

---

## 🎫 WSZYSTKIE TICKETY HR

### **Kategorie ticketów:**
- `hr_vacation` - Wnioski urlopowe
- `hr_training` - Wnioski o szkolenie  
- `hr_document` - Dokumenty do weryfikacji
- `hr_benefit` - Wnioski o benefity
- `hr_salary` - Sprawy wynagrodzeń

---

## 📊 STATYSTYKI

Panel pokazuje:
- ⏳ **Oczekujące** - liczba wniosków do rozpatrzenia
- ✅ **Zatwierdzone** - suma zatwierdzonych wniosków
- ❌ **Odrzucone** - suma odrzuconych wniosków

---

## 🔐 UPRAWNIENIA

Dostęp mają tylko:
- **Admin** (pełny dostęp)
- **HR** (rola: `hr`)

Sprawdzanie: `req.user.role === 'hr' || req.user.role === 'admin'`

---

## 🚀 SZYBKI START

### **Dla HR:**
1. Zaloguj się jako `hr@promeritum.pl` (hasło: `Hr123!@#`)
2. Otwórz `http://localhost:3500/hr-panel.html`
3. Zobacz wnioski urlopowe w pierwszej zakładce
4. Kliknij **"✓ Zatwierdź"** lub **"✗ Odrzuć"**

### **Dla pracownika:**
1. Zaloguj się jako pracownik
2. Otwórz Employee Dashboard
3. Zakładka **🏖️ Urlopy**
4. Kliknij **"➕ Złóż wniosek urlopowy"**
5. Wypełnij formularz → **Automatycznie tworzy ticket!**

---

## 🔗 POWIĄZANIE Z TICKETAMI

**Dlaczego tickety?**
- ✅ Scentralizowana komunikacja
- ✅ Historia zmian i komentarzy
- ✅ Powiadomienia dla pracownika
- ✅ Jeden system do wszystkich wniosków

**Jak działa przepływ?**
```
Pracownik składa wniosek
    ↓
Tworzy się TICKET (kategoria: hr_vacation)
    ↓
Tworzy się wpis w employee_vacations (status: pending)
    ↓
HR widzi w HR Panel
    ↓
HR zatwierdza → ticket zamknięty, status: approved
```

---

## 📞 KONTAKT

Jeśli masz problemy:
1. Sprawdź konsole błędów (F12)
2. Sprawdź czy backend działa (`http://localhost:3500`)
3. Sprawdź uprawnienia użytkownika

---

## ✅ CHECKLIST DLA HR

**Codziennie:**
- [ ] Sprawdź nowe wnioski urlopowe
- [ ] Zatwierdź/odrzuć oczekujące wnioski
- [ ] Odpowiedz na tickety HR

**Co tydzień:**
- [ ] Przejrzyj wnioski o szkolenia
- [ ] Zweryfikuj przesłane dokumenty
- [ ] Sprawdź wygasające certyfikaty (`/api/hr-training/expiring`)

**Co miesiąc:**
- [ ] Przegląd sald urlopowych
- [ ] Raport z zatwierdzonych wniosków
- [ ] Planowanie szkoleń na następny miesiąc
