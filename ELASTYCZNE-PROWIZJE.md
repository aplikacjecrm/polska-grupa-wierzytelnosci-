# 💰 ELASTYCZNY SYSTEM PROWIZJI

## 🎯 PROBLEM (NAPRAWIONY):

**PRZED:** Prowizje były automatycznie naliczane dla **KAŻDEJ** płatności.

**TERAZ:** Prowizje są **ELASTYCZNE** - można:
- ✅ Wyłączyć prowizję dla konkretnej płatności
- ✅ Nadpisać stawkę prowizji (custom %)
- ✅ Wybrać innego odbiorcę prowizji

---

## 📊 NOWE KOLUMNY W BAZIE:

### Tabela `payments`:
```sql
enable_commission INTEGER DEFAULT 1
  ↳ 1 = Nalicz prowizję (domyślnie TAK)
  ↳ 0 = Nie naliczaj prowizji

commission_rate_override DECIMAL(5,2)
  ↳ NULL = Użyj domyślnej stawki
  ↳ 15.50 = Nadpisz na 15.5%

commission_recipient_override INTEGER
  ↳ NULL = Użyj domyślnego odbiorcy (mecenas/opiekun)
  ↳ 123 = Przypisz prowizję do user_id 123
```

---

## 🚀 WDROŻENIE:

### 1. Uruchom migrację:
```powershell
cd c:\Users\horyz\CascadeProjects\windsurf-project\kancelaria\komunikator-app

node backend/scripts/run-014-migration.js
```

**Powinieneś zobaczyć:**
```
✅ Kolumna enable_commission dodana (domyślnie: TAK)
✅ Kolumna commission_rate_override dodana
✅ Kolumna commission_recipient_override dodana
✅ Migracja zakończona - prowizje są teraz elastyczne!
```

### 2. Restart serwera:
```powershell
# Ctrl+C (zatrzymaj)
npm start
```

---

## 🔧 JAK DZIAŁA:

### Backend (GOTOWE ✅):
```javascript
// W backend/routes/payments.js

async function calculateCommissionsForPayment(db, paymentId, ...) {
    // 1. Sprawdź czy prowizja włączona
    const payment = await db.get('SELECT enable_commission FROM payments WHERE id = ?', [paymentId]);
    
    if (payment.enable_commission === 0) {
        console.log('⏭️ Prowizja wyłączona - pomijam');
        return []; // NIE TWORZY PROWIZJI!
    }
    
    // 2. Jeśli włączona - twórz jak zwykle
    console.log('✅ Prowizja włączona - wyliczam...');
    // ... reszta logiki
}
```

### Frontend (DO ZROBIENIA 🔨):

Trzeba dodać do formularza rejestracji płatności:

```html
<!-- Checkbox prowizji -->
<div style="margin-top: 15px; padding: 10px; background: #f0f9ff; border-radius: 8px;">
    <label style="display: flex; align-items: center; cursor: pointer;">
        <input type="checkbox" 
               id="enableCommission" 
               checked 
               style="width: 18px; height: 18px; margin-right: 10px;">
        <span style="font-weight: 600; color: #1a2332;">
            💰 Nalicz prowizję dla tej płatności
        </span>
    </label>
    <p style="margin: 5px 0 0 28px; font-size: 0.85rem; color: #64748b;">
        Domyślnie prowizja jest naliczana według ustawień pracownika
    </p>
</div>
```

---

## 🧪 TESTOWANIE:

### Test 1: Prowizja WŁĄCZONA (domyślnie)
```
1. Utwórz nową płatność
2. Checkbox "Nalicz prowizję" = ✅ zaznaczony
3. Zapisz
4. Sprawdź w Finance Dashboard → Prowizje
5. ✅ Powinna być prowizja
```

### Test 2: Prowizja WYŁĄCZONA
```
1. Utwórz nową płatność
2. Checkbox "Nalicz prowizję" = ❌ odznacz
3. Zapisz
4. Sprawdź w Finance Dashboard → Prowizje
5. ✅ NIE powinno być prowizji
```

### Test 3: Stare płatności
```
1. Wszystkie STARE płatności mają enable_commission = 1 (TAK)
2. Dla nich prowizje działają jak wcześniej
3. ✅ Kompatybilność wsteczna zachowana
```

---

## 📋 STATUS IMPLEMENTACJI:

- ✅ **Migracja bazy** - GOTOWE
- ✅ **Backend logic** - GOTOWE  
- ⏳ **Frontend checkbox** - DO ZROBIENIA
- ⏳ **Frontend custom stawka** - DO ZROBIENIA (opcjonalnie)
- ⏳ **Frontend wybór odbiorcy** - DO ZROBIENIA (opcjonalnie)

---

## 💡 PRZYKŁADY UŻYCIA:

### Kiedy WYŁĄCZYĆ prowizję?
- Płatność testowa
- Płatność zwrotna/korekta
- Wewnętrzne rozliczenia
- Specjalne umowy (już zapłacona prowizja)

### Kiedy NADPISAĆ stawkę?
- Specjalna umowa z klientem
- Promocja (niższa prowizja)
- Premiowanie pracownika (wyższa prowizja)

### Kiedy ZMIENIĆ odbiorcę?
- Pracownik zastępczy
- Podział prowizji między kilku
- Przekierowanie do innego zespołu

---

## ✅ PODSUMOWANIE:

**System prowizji jest teraz ELASTYCZNY!**

Domyślnie działa jak wcześniej (enable_commission = 1), ale daje pełną kontrolę nad tym:
- Czy naliczać prowizję
- Jaka stawka
- Kto dostaje

**Backend GOTOWY** ✅  
**Frontend** - wymaga dodania checkboxa do formularza płatności

---

**Data:** 24.11.2025
**Status:** Backend ✅ | Frontend ⏳
