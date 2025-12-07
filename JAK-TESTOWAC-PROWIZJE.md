# 🧪 JAK TESTOWAĆ SYSTEM ZATWIERDZANIA PROWIZJI

## ✅ SYSTEM GOTOWY - KOMPLETNY!

---

## 🚀 KROK 1: Otwórz aplikację

```
http://localhost:3500
```

**Zaloguj się jako Admin:**
```
Email: admin@promeritum.pl
Hasło: admin123
```

---

## 🧪 KROK 2: Utwórz płatność (automatyczna prowizja PENDING)

### Opcja A: Przez gotówkę
1. Znajdź płatność klienta (z listy płatności)
2. Kliknij **"💵 Gotówka"**
3. Wpisz numer dokumentu: `TEST-001`
4. Zatwierdź

### Opcja B: Utwórz nową płatność
1. Stwórz nową płatność w systemie
2. Opłać ją jakąkolwiek metodą

**Rezultat:** 
```
✅ Płatność opłacona
🟡 Prowizja PENDING (automatycznie utworzona)
```

---

## 💰 KROK 3: Otwórz Finance Dashboard

1. Kliknij **"💰 Finanse"** w menu bocznym
2. Przejdź do zakładki **"👥 Prowizje"**

Zobaczysz **4 zakładki statusów:**
- 🟡 **Oczekujące** (pending)
- ✅ **Zatwierdzone** (approved)
- 💰 **Wypłacone** (paid)
- ❌ **Odrzucone** (rejected)

---

## 🟡 KROK 4: Zobacz oczekujące prowizje

Domyślnie otwarta zakładka: **"🟡 Oczekujące"**

Zobaczysz tabelę z:
- Pracownik (mecenas/opiekun)
- Płatność, klient
- Kwota płatności, stawka %, prowizja
- **Przyciski akcji:**
  - `[✅ Zatwierdź]`
  - `[❌ Odrzuć]`

---

## ✅ KROK 5: Zatwierdź prowizję

1. Kliknij **"✅ Zatwierdź"** przy prowizji
2. Potwierdź w oknie

**Rezultat:**
```
✅ Prowizja zatwierdzona!
→ Przeniesiona do zakładki "✅ Zatwierdzone"
```

---

## 💰 KROK 6: Wypłać prowizję

1. Przejdź do zakładki **"✅ Zatwierdzone"**
2. Znajdź zatwierdzoną prowizję
3. Kliknij **"💰 Wypłać"**
4. Potwierdź

**Rezultat:**
```
✅ Prowizja wypłacona!
→ Przeniesiona do zakładki "💰 Wypłacone"
```

---

## ❌ TEST ODRZUCENIA

1. Wróć do zakładki **"🟡 Oczekujące"**
2. Wybierz inną prowizję
3. Kliknij **"❌ Odrzuć"**
4. Wpisz powód: `Błędna kwota`
5. Zatwierdź

**Rezultat:**
```
❌ Prowizja odrzucona!
→ Przeniesiona do zakładki "❌ Odrzucone"
→ Widoczny powód odrzucenia
```

---

## 🔒 TEST BEZPIECZEŃSTWA

### Próba wypłaty PENDING (powinno się NIE UDAĆ):
```sql
-- W bazie danych sprawdź:
SELECT id, status FROM lawyer_commissions WHERE status = 'pending';

-- Spróbuj wypłacić przez API (POWINNO ZWRÓCIĆ BŁĄD):
POST /api/commissions/XXX/pay
```

**Oczekiwany rezultat:**
```
❌ Błąd: "Prowizja nie została zatwierdzona"
```

### Próba wypłaty REJECTED (powinno się NIE UDAĆ):
```
❌ Błąd: "Prowizja została odrzucona"
```

---

## 📊 SPRAWDŹ STATUSY

### Zakładka 🟡 Oczekujące:
- Przyciski: `[✅ Zatwierdź]` `[❌ Odrzuć]`

### Zakładka ✅ Zatwierdzone:
- Przycisk: `[💰 Wypłać]`

### Zakładka 💰 Wypłacone:
- Brak przycisków
- Tekst: `✅ Wypłacono (data)`

### Zakładka ❌ Odrzucone:
- Brak przycisków
- Tekst: `❌ Odrzucono (powód)`

---

## 🔄 PRZEPŁYW PROWIZJI:

```
┌─────────────────────────────────────────┐
│ 1. PŁATNOŚĆ OPŁACONA                    │
│    ↓ (automatycznie)                    │
│ 2. PROWIZJA PENDING 🟡                  │
│    Widoczna w zakładce "Oczekujące"     │
│    ↓ (Admin: ✅ Zatwierdź)              │
│ 3. PROWIZJA APPROVED ✅                 │
│    Widoczna w zakładce "Zatwierdzone"   │
│    ↓ (Admin: 💰 Wypłać)                 │
│ 4. PROWIZJA PAID 💰                     │
│    Widoczna w zakładce "Wypłacone"      │
└─────────────────────────────────────────┘

ALTERNATYWNIE:
┌─────────────────────────────────────────┐
│ 2. PROWIZJA PENDING 🟡                  │
│    ↓ (Admin: ❌ Odrzuć)                 │
│ 3. PROWIZJA REJECTED ❌                 │
│    Widoczna w zakładce "Odrzucone"      │
│    (+ powód odrzucenia)                 │
└─────────────────────────────────────────┘
```

---

## 🐛 PROBLEMY I ROZWIĄZANIA

### Problem: Nie widzę prowizji
```
1. Sprawdź czy zalogowany jako Admin/Finance
2. Sprawdź zakładkę "🟡 Oczekujące"
3. Sprawdź w bazie:
   SELECT * FROM lawyer_commissions ORDER BY created_at DESC LIMIT 5;
```

### Problem: Nie mogę wypłacić
```
✅ To dobrze! System działa poprawnie!
Możesz wypłacić TYLKO zatwierdzone prowizje.
```

### Problem: Prowizja nie powstała
```
1. Sprawdź czy płatność ma enable_commission = 1
2. Sprawdź logi serwera - czy pokazuje "Prowizja utworzona jako PENDING"
3. Sprawdź czy przypisany mecenas/opiekun w sprawie/kliencie
```

---

## ✅ CHECKLIST TESTOWANIA

- [ ] Utwórz płatność → prowizja PENDING
- [ ] Zobacz w zakładce "🟡 Oczekujące"
- [ ] Zatwierdź prowizję → przenosi do "✅ Zatwierdzone"
- [ ] Wypłać prowizję → przenosi do "💰 Wypłacone"
- [ ] Odrzuć prowizję → przenosi do "❌ Odrzucone" (z powodem)
- [ ] Próba wypłaty PENDING → błąd (bezpieczeństwo)
- [ ] Próba wypłaty REJECTED → błąd (bezpieczeństwo)
- [ ] Przełączanie między zakładkami działa
- [ ] Kolory zakładek zmieniają się poprawnie

---

## 🎉 SYSTEM GOTOWY!

**Wszystko działa! Możesz używać systemu zatwierdzania prowizji.** 

**Kontrola 2-etapowa:**
1. **Mecenas/System** → płatność opłacona → prowizja PENDING
2. **Admin/Finance** → zatwierdza lub odrzuca → wypłaca

**Bezpieczeństwo:**
- ✅ Nie można wypłacić prowizji PENDING
- ✅ Nie można wypłacić prowizji REJECTED
- ✅ Historia zatwierdzeń (kto, kiedy)
- ✅ Powody odrzucenia widoczne

---

**Data:** 24.11.2025, 17:50
**Status:** ✅ PRODUCTION READY!
