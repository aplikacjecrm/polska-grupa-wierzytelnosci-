#!/usr/bin/env python3
"""
🤖 Autonomiczny Agent Deploy
Automatycznie dodaje zmienne środowiskowe i wdraża backend
"""

import requests
import time
import os
import sys

# Konfiguracja
API_KEY = os.getenv('RENDER_API_KEY')
SERVICE_ID = os.getenv('RENDER_SERVICE_ID')

# Zmienne środowiskowe do dodania
GMAIL_USER = os.getenv('GMAIL_USER', 'info@polska-grupa-wierzytelnosci.pl')
GMAIL_APP_PASSWORD = os.getenv('GMAIL_APP_PASSWORD')
INQUIRY_EMAIL = os.getenv('INQUIRY_EMAIL', 'info@polska-grupa-wierzytelnosci.pl')

BASE_URL = "https://api.render.com/v1"

def check_config():
    """Sprawdź czy wszystkie wymagane zmienne są ustawione"""
    print("🔍 Sprawdzam konfigurację...")
    
    if not API_KEY:
        print("❌ Brak RENDER_API_KEY!")
        print("   Ustaw: $env:RENDER_API_KEY='rnd_xxxxx'")
        return False
    
    if not SERVICE_ID:
        print("❌ Brak RENDER_SERVICE_ID!")
        print("   Ustaw: $env:RENDER_SERVICE_ID='srv-xxxxx'")
        return False
    
    if not GMAIL_APP_PASSWORD:
        print("❌ Brak GMAIL_APP_PASSWORD!")
        print("   Ustaw: $env:GMAIL_APP_PASSWORD='twoje-16-znakowe-haslo'")
        return False
    
    print("✅ Konfiguracja OK!")
    print(f"   API Key: {API_KEY[:10]}...")
    print(f"   Service ID: {SERVICE_ID}")
    print(f"   Gmail User: {GMAIL_USER}")
    print(f"   Inquiry Email: {INQUIRY_EMAIL}")
    return True

def get_service_info():
    """Pobierz informacje o serwisie"""
    print("\n📊 Pobieram informacje o serwisie...")
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    url = f"{BASE_URL}/services/{SERVICE_ID}"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        service = response.json()
        print(f"✅ Serwis: {service.get('name')}")
        print(f"🔗 URL: {service.get('serviceDetails', {}).get('url')}")
        return True
    else:
        print(f"❌ Błąd: {response.status_code}")
        print(f"   {response.text}")
        return False

def update_env_var(key, value):
    """Zaktualizuj pojedynczą zmienną środowiskową"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Najpierw pobierz wszystkie zmienne
    url = f"{BASE_URL}/services/{SERVICE_ID}/env-vars"
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Błąd pobierania env vars: {response.status_code}")
        return False
    
    env_vars = response.json()
    existing_var = None
    
    # Znajdź czy zmienna już istnieje
    for env_var in env_vars:
        if env_var.get('key') == key:
            existing_var = env_var
            break
    
    if existing_var:
        # Aktualizuj istniejącą
        var_id = existing_var.get('id')
        url = f"{BASE_URL}/services/{SERVICE_ID}/env-vars/{var_id}"
        data = {"value": value}
        response = requests.put(url, headers=headers, json=data)
    else:
        # Dodaj nową
        url = f"{BASE_URL}/services/{SERVICE_ID}/env-vars"
        data = {
            "key": key,
            "value": value
        }
        response = requests.post(url, headers=headers, json=data)
    
    if response.status_code in [200, 201]:
        print(f"✅ {key} zaktualizowane")
        return True
    else:
        print(f"❌ Błąd aktualizacji {key}: {response.status_code}")
        print(f"   {response.text}")
        return False

def update_all_env_vars():
    """Zaktualizuj wszystkie zmienne środowiskowe"""
    print("\n🔐 Aktualizuję zmienne środowiskowe...")
    
    env_vars = {
        'GMAIL_USER': GMAIL_USER,
        'GMAIL_APP_PASSWORD': GMAIL_APP_PASSWORD,
        'INQUIRY_EMAIL': INQUIRY_EMAIL
    }
    
    success = True
    for key, value in env_vars.items():
        if not update_env_var(key, value):
            success = False
    
    if success:
        print("✅ Wszystkie zmienne zaktualizowane!")
        print("⚠️  Serwis zostanie automatycznie zrestartowany przez Render")
        return True
    else:
        print("❌ Niektóre zmienne nie zostały zaktualizowane")
        return False

def trigger_deploy(clear_cache=False):
    """Wyzwól deployment"""
    print("\n🚀 Wyzwalam deployment...")
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    url = f"{BASE_URL}/services/{SERVICE_ID}/deploys"
    data = {
        "clearCache": "clear" if clear_cache else "do_not_clear"
    }
    
    response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 201:
        deploy = response.json()
        deploy_id = deploy.get('id')
        print(f"✅ Deploy wyzwolony! ID: {deploy_id}")
        return deploy_id
    else:
        print(f"❌ Błąd wyzwalania deployu: {response.status_code}")
        print(f"   {response.text}")
        return None

def get_deploy_status(deploy_id):
    """Sprawdź status deployu"""
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    url = f"{BASE_URL}/services/{SERVICE_ID}/deploys/{deploy_id}"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        deploy = response.json()
        return deploy.get('status')
    return None

def wait_for_deploy(deploy_id, timeout=600):
    """Czekaj na zakończenie deployu"""
    print(f"\n⏳ Czekam na zakończenie deployu {deploy_id}...")
    print("   (może to zająć 2-5 minut)")
    
    start_time = time.time()
    last_status = None
    
    while time.time() - start_time < timeout:
        status = get_deploy_status(deploy_id)
        
        if status != last_status:
            print(f"🔄 Status: {status}")
            last_status = status
        
        if status == 'live':
            print(f"✅ Deploy zakończony sukcesem!")
            return True
        elif status in ['build_failed', 'canceled', 'deactivated']:
            print(f"❌ Deploy nie powiódł się: {status}")
            return False
        
        time.sleep(10)
    
    print(f"⏱️ Timeout! Deploy trwa dłużej niż {timeout}s")
    return False

def main():
    """Główna funkcja"""
    print("=" * 60)
    print("🤖 AUTONOMICZNY AGENT DEPLOY")
    print("=" * 60)
    
    # 1. Sprawdź konfigurację
    if not check_config():
        print("\n❌ Skonfiguruj wymagane zmienne środowiskowe!")
        sys.exit(1)
    
    # 2. Sprawdź połączenie z serwisem
    if not get_service_info():
        print("\n❌ Nie można połączyć się z serwisem!")
        sys.exit(1)
    
    # 3. Zaktualizuj zmienne środowiskowe
    if not update_all_env_vars():
        print("\n❌ Błąd aktualizacji zmiennych!")
        sys.exit(1)
    
    # 4. Opcjonalnie: Wyzwól deploy
    print("\n" + "=" * 60)
    print("⚠️  Render automatycznie zrestartuje serwis po zmianie env vars")
    print("   Czy chcesz dodatkowo wyzwolić nowy deploy?")
    print("=" * 60)
    
    choice = input("\nWyzwolić deploy? (t/n): ").lower()
    
    if choice == 't':
        clear_cache = input("Wyczyścić cache? (t/n): ").lower() == 't'
        
        deploy_id = trigger_deploy(clear_cache=clear_cache)
        if deploy_id:
            wait_choice = input("\nCzekać na zakończenie? (t/n): ").lower()
            if wait_choice == 't':
                wait_for_deploy(deploy_id)
    
    print("\n" + "=" * 60)
    print("✅ GOTOWE!")
    print("=" * 60)
    print("\n📋 Następne kroki:")
    print("1. Sprawdź logi w Render Dashboard")
    print("2. Zaktualizuj URL API w formularzu na stronie")
    print("3. Wdróż stronę na Netlify")
    print("4. Przetestuj formularz")
    print("\n🔗 Backend URL: https://promeritum-komunikator-v2.onrender.com")
    print("🔗 API Endpoint: https://promeritum-komunikator-v2.onrender.com/api/website-inquiries")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ Przerwano przez użytkownika")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Błąd: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
