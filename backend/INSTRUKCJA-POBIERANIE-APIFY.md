# 📥 JAK POBRAĆ WYNIKI Z APIFY CONSOLE

## METODA 1: Przez przeglądarkę (NAJŁATWIEJSZA)

### KROK 1: Otwórz Run Details
1. Idź do: https://console.apify.com/actors/runs
2. Kliknij na successful run (zielony checkmark ✅)

### KROK 2: Pobierz JSON
1. W szczegółach run kliknij zakładkę **"Dataset"**
2. Kliknij przycisk **"Export"** (góra po prawej)
3. Wybierz **"JSON"**
4. Kliknij **"Download"**

### KROK 3: Zapisz plik
1. Zapisz jako: `apify-data.json`
2. Przenieś do: `backend/apify-results/`

### KROK 4: Użyj w systemie
```powershell
node use-saved-results.js
```

---

## METODA 2: Przez API (z kodem)

### KROK 1: Znajdź prawidłowy Run ID

**W URL po kliknięciu na run:**
```
https://console.apify.com/actors/runs/[TO_JEST_RUN_ID]
```

**Przykład:**
```
https://console.apify.com/actors/runs/2oFEhMBtOxfepSA1d
                                      ↑
                                  RUN ID
```

### KROK 2: Pobierz
```powershell
node download-apify-results.js <PEŁNY_RUN_ID>
```

---

## ⚠️ UWAGA:

### Run ID vs Dataset ID:
- **Run ID** - identyfikator uruchomienia actora
- **Dataset ID** - identyfikator wynikowego datasetu

**Oba działają!** Możesz użyć któregokolwiek.

### Format:
```
Run ID:     fmudHghj3gnQMaZ5C
Dataset ID: mqwPfNuBHrvt12345
```

---

## 🎯 JEŚLI DALEJ NIE DZIAŁA:

### Pobierz manualnie:

1. **Otwórz run w przeglądarce**
2. **Zakładka "Dataset"**
3. **Export → JSON → Download**
4. **Zapisz w:** `backend/apify-results/manual-data.json`

---

## 💡 ALTERNATYWA - Użyj Dataset ID:

Jeśli masz **Dataset ID** zamiast Run ID:

```javascript
// W download-apify-results.js zmień:
// Z:
`https://api.apify.com/v2/actor-runs/${runId}/dataset/items`

// Na:
`https://api.apify.com/v2/datasets/${datasetId}/items`
```

---

## 📞 POMOC:

Jeśli nic nie działa:
1. Zrób screenshot szczegółów run
2. Pokaż mi - pomogę!
