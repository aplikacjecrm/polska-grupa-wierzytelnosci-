# 🤖 Render Deploy Agent - Instrukcja użycia

## 📋 Co to jest?

Automatyczny agent Python do zarządzania deploymentami na Render.com bez konieczności logowania się do Dashboard.

## 🔧 Konfiguracja

### Krok 1: Zainstaluj zależności

```bash
pip install requests
```

### Krok 2: Pobierz Render API Key

1. Zaloguj się na: https://dashboard.render.com/
2. Kliknij swoje zdjęcie → **Account Settings**
3. Przewiń do: **API Keys**
4. Kliknij: **Create API Key**
5. Skopiuj klucz (zaczyna się od `rnd_`)

### Krok 3: Pobierz Service ID

1. Wejdź na: https://dashboard.render.com/
2. Kliknij na swój serwis: `promeritum-komunikator-v2`
3. Skopiuj ID z URL:
   ```
   https://dashboard.render.com/web/srv-XXXXXXXXXX
                                        ^^^^^^^^^^^ - to jest Service ID
   ```

### Krok 4: Ustaw zmienne środowiskowe

**Windows (PowerShell):**
```powershell
$env:RENDER_API_KEY="rnd_xxxxxxxxxx"
$env:RENDER_SERVICE_ID="srv-xxxxxxxxxx"
```

**Windows (CMD):**
```cmd
set RENDER_API_KEY=rnd_xxxxxxxxxx
set RENDER_SERVICE_ID=srv-xxxxxxxxxx
```

**Linux/Mac:**
```bash
export RENDER_API_KEY="rnd_xxxxxxxxxx"
export RENDER_SERVICE_ID="srv-xxxxxxxxxx"
```

**LUB stwórz plik `.env`:**
```
RENDER_API_KEY=rnd_xxxxxxxxxx
RENDER_SERVICE_ID=srv-xxxxxxxxxx
```

## 🚀 Użycie

### Uruchomienie agenta:

```bash
python render-deploy-agent.py
```

### Menu opcji:

```
📋 Menu:
1. 📊 Pokaż info o serwisie
2. 📋 Pokaż ostatnie deploymenty
3. 🚀 Wyzwól nowy deploy
4. 🗑️  Wyzwól deploy z czyszczeniem cache
5. 🔐 Zaktualizuj zmienne środowiskowe
6. 📜 Pokaż logi
0. 🚪 Wyjdź
```

## 📝 Przykłady użycia

### Automatyczne wdrożenie z czekaniem:

```python
from render_deploy_agent import RenderDeployAgent

agent = RenderDeployAgent(
    api_key="rnd_xxxxxxxxxx",
    service_id="srv-xxxxxxxxxx"
)

# Wyzwól deploy
deploy_id = agent.trigger_deploy()

# Czekaj na zakończenie
if deploy_id:
    success = agent.wait_for_deploy(deploy_id)
    if success:
        print("✅ Deployment gotowy!")
```

### Aktualizacja zmiennych środowiskowych:

```python
agent.update_env_vars({
    "GMAIL_USER": "info@polska-grupa-wierzytelnosci.pl",
    "GMAIL_APP_PASSWORD": "twoje-haslo-16-znakow",
    "INQUIRY_EMAIL": "info@polska-grupa-wierzytelnosci.pl"
})
```

### Sprawdzenie statusu:

```python
# Informacje o serwisie
agent.get_service_info()

# Ostatnie deploymenty
agent.get_deploys(limit=10)

# Logi
agent.get_logs(limit=100)
```

## 🔄 Scenariusz: Kompletny deployment

```bash
# 1. Wypchnij kod do GitHub
git add .
git commit -m "Nowa funkcja"
git push origin main

# 2. Uruchom agenta
python render-deploy-agent.py

# 3. Wybierz opcję 4 (deploy z czyszczeniem cache)
# 4. Poczekaj na zakończenie
# 5. Sprawdź logi (opcja 6)
```

## 🤖 Automatyzacja z cronem (Linux/Mac)

Dodaj do crontab (`crontab -e`):

```bash
# Deploy co noc o 2:00
0 2 * * * cd /ścieżka/do/backend && python render-deploy-agent.py
```

## 🪟 Automatyzacja z Task Scheduler (Windows)

1. Otwórz **Task Scheduler**
2. **Create Basic Task**
3. Trigger: Daily 2:00 AM
4. Action: Start program
   - Program: `python`
   - Arguments: `render-deploy-agent.py`
   - Start in: `C:\Users\horyz\...\backend`

## 🔐 Bezpieczeństwo

⚠️ **WAŻNE:**
- NIE commituj API Key do repozytorium
- Używaj zmiennych środowiskowych lub `.env`
- Dodaj `.env` do `.gitignore`
- API Key ma pełne uprawnienia - przechowuj bezpiecznie

## 📊 Render API - Dokumentacja

Pełna dokumentacja API:
https://api-docs.render.com/

Endpoints używane przez agenta:
- `GET /services/{serviceId}` - Info o serwisie
- `GET /services/{serviceId}/deploys` - Lista deploymentów
- `POST /services/{serviceId}/deploys` - Wyzwól deploy
- `GET /services/{serviceId}/deploys/{deployId}` - Status deployu
- `PUT /services/{serviceId}/env-vars` - Zaktualizuj env vars
- `GET /services/{serviceId}/logs` - Pobierz logi

## 🆘 Troubleshooting

### Błąd: "401 Unauthorized"
- Sprawdź czy API Key jest poprawny
- Sprawdź czy nie wygasł
- Upewnij się że jest w formacie `rnd_xxxxx`

### Błąd: "404 Not Found"
- Sprawdź Service ID
- Upewnij się że serwis istnieje
- Sprawdź czy API Key ma dostęp do serwisu

### Deploy trwa bardzo długo
- Render Free Tier: pierwsze żądanie po uśpieniu trwa ~30s
- Build może trwać 2-5 minut
- Użyj `wait_for_deploy()` z większym timeout

## 💡 Tips & Tricks

1. **Szybsze buildy:** Użyj cache (opcja 3) zamiast clear cache (opcja 4)
2. **Monitoring:** Uruchom agenta z opcją 6 (logi) po deployu
3. **Batch updates:** Aktualizuj wszystkie env vars naraz (opcja 5)
4. **Status check:** Sprawdzaj status przed deployem (opcja 2)

## 🎯 Następne kroki

Po skonfigurowaniu agenta:

1. ✅ Dodaj zmienne środowiskowe (opcja 5):
   - `GMAIL_USER`
   - `GMAIL_APP_PASSWORD`
   - `INQUIRY_EMAIL`

2. ✅ Wyzwól deploy (opcja 3)

3. ✅ Poczekaj na zakończenie

4. ✅ Sprawdź logi (opcja 6)

5. ✅ Testuj formularz na stronie

---

**Gotowe! Teraz masz pełną kontrolę nad deploymentami bez logowania do Dashboard!** 🚀
