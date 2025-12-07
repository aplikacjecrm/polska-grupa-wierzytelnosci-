# 🤖 Pro Meritum AI Agent

**Zaawansowany agent AI z Claude Computer Use do automatyzacji zadań.**

## 🎯 Możliwości

- 🌐 **Obsługa Netlify** - dodawanie domen, wdrażanie stron
- 📧 **Wysyłanie emaili** - automatyczne odpowiedzi
- 📱 **Postowanie na Facebook** - publikowanie postów
- 🖥️ **Kontrola przeglądarki** - automatyzacja zadań w Chrome
- 👀 **AI Vision** - "widzi" ekran i podejmuje decyzje
- 🤖 **Autonomiczne działanie** - wykonuje złożone zadania

## 📦 Instalacja

```bash
cd komunikator-app/ai-agent
pip install -r requirements.txt
playwright install chromium
```

## 🔑 Konfiguracja API Keys

**Opcja A: Plik .env (zalecane)**
```
ANTHROPIC_API_KEY=sk-ant-api03-...
GEMINI_API_KEY=...
```

**Opcja B: Zmienna środowiskowa**
```powershell
$env:ANTHROPIC_API_KEY="sk-ant-api03-..."
python agent.py "zadanie"
```

## 🚀 Przykłady użycia

```bash
# Netlify - dodaj domenę
python agent.py "Dodaj domenę kancelaria-pro-meritum.pl do Netlify"

# Email
python agent.py "Wyślij email do klienta@example.com z potwierdzeniem"

# Facebook
python agent.py "Opublikuj post: Nowa usługa prawna dostępna!"

# DNS
python agent.py "Skonfiguruj DNS dla domeny w AAT.host"
```

---

**Pro Meritum Kancelaria Radców Prawnych** 🚀
