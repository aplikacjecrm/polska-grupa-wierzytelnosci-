# 🔧 INSTRUKCJA: Naprawa Railway (usunięcie crashującego dokumentu)

## 🎯 **PROBLEM:**
Railway crashuje bo ma w bazie dokument z polskimi znakami który powoduje błąd serwera.

## ✅ **ROZWIĄZANIE (3 kroki):**

---

### **KROK 1: Poczekaj na Railway deployment (2-3 minuty)**

Właśnie wysłałem nowy kod z endpointem cleanup.

Railway musi się zdeployować: https://railway.app

✅ Gdy deployment się skończy → przejdź do kroku 2

---

### **KROK 2: Zaloguj się na Railway**

1. Otwórz: https://web-production-7504.up.railway.app
2. Zaloguj się jako **ADMIN** (twoje konto admin)
3. Zaczekaj aż się załaduje (może być wolno/błędy - to OK)

---

### **KROK 3: Usuń crashujący dokument przez DevTools**

1. **Naciśnij F12** (otwórz DevTools)
2. **Przejdź do zakładki "Console"**
3. **Wklej i uruchom** ten kod:

```javascript
// Usuń dokument ID: 17 który crashuje backend
fetch('/api/documents/emergency-cleanup/17', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('✅ SUKCES:', data);
  alert('Dokument usunięty! Teraz odśwież stronę (F5)');
})
.catch(err => {
  console.error('❌ BŁĄD:', err);
  alert('Błąd: ' + err.message);
});
```

4. **Naciśnij Enter**
5. Poczekaj na komunikat "Dokument usunięty!"
6. **Odśwież stronę: F5**

---

## ✅ **CO SIĘ STANIE:**

1. ✅ Endpoint usunie dokument ID: 17 z bazy Railway
2. ✅ Backend przestanie crashować
3. ✅ Wszystko zacznie działać!

---

## 🎯 **ALTERNATYWA (jeśli console nie działa):**

Użyj Postman lub curl:

```bash
curl -X DELETE \
  https://web-production-7504.up.railway.app/api/documents/emergency-cleanup/17 \
  -H "Authorization: Bearer TWOJ_TOKEN"
```

Token znajdziesz w:
- DevTools → Application → Local Storage → token

---

## 📊 **JAK SPRAWDZIĆ CZY ZADZIAŁAŁO:**

1. Odśwież Railway (F5)
2. Otwórz sprawę → Dokumenty
3. ✅ Nie powinno crashować!
4. ✅ Możesz dodawać załączniki!

---

## 🚀 **GOTOWE!**

Po wykonaniu tych kroków Railway będzie działać tak samo jak lokalnie! 🎉
