# 🔴 RAILWAY PROBLEM - Backend crashuje na produkcji

## ❌ **PROBLEM:**
- ✅ Lokalnie działa
- ❌ Railway crashuje z tym samym błędem

## 🔍 **PRZYCZYNA:**

Railway ma **TEN SAM PROBLEM** co lokalnie przed naprawą:

### **Problematyczny plik w bazie Railway:**
```
Dokument ID: 17
Nazwa: "Zgłoś się do PGW! (1).jpg"
Problem: Polskie znaki → CRASH backend
```

---

## ✅ **ROZWIĄZANIE:**

Railway używa **INNEJ BAZY DANYCH** niż lokalna!

### **Opcja 1: Usuń plik przez Railway CLI**
```bash
# NIE MAMY dostępu do Railway CLI lokalnie
```

### **Opcja 2: Force rebuild Railway**
Railway musi **zrestartować się od nowa** żeby załadować nowy kod.

### **Opcja 3: Dodaj endpoint do usuwania dokumentu**
Stwórz tymczasowy endpoint który usuwa dokument ID: 17.

---

## 🎯 **NAJLEPSZE ROZWIĄZANIE:**

**Dodaj tymczasowy endpoint do usunięcia problematycznego pliku:**

```javascript
// backend/routes/documents.js
router.delete('/cleanup/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  
  // TYLKO ADMIN
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  db.run('DELETE FROM documents WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: `Dokument ${id} usunięty` });
  });
});
```

Potem wywołaj:
```
DELETE https://web-production-7504.up.railway.app/api/documents/cleanup/17
```

---

## 🚀 **ALTERNATYWA: Manual restart Railway**

W Railway dashboard:
1. Wejdź w deployment
2. Kliknij "Redeploy"
3. Zaznacz "Clear build cache"
4. Deploy

---

## 📊 **STATUS:**

| Problem | Lokalnie | Railway |
|---------|----------|---------|
| Kod naprawiony | ✅ | ✅ (w repo) |
| Baza bez pliku | ✅ | ❌ (stara baza) |
| Backend działa | ✅ | ❌ (crashuje) |

---

**ROZWIĄZANIE:** Muszę dodać endpoint cleanup i usunąć plik przez API!
