#!/usr/bin/env python3
"""
🤖 Render Deploy Agent
Automatyczny agent do zarządzania deploymentami na Render.com
"""

import requests
import time
import os
from datetime import datetime

class RenderDeployAgent:
    def __init__(self, api_key, service_id):
        self.api_key = api_key
        self.service_id = service_id
        self.base_url = "https://api.render.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def get_service_info(self):
        """Pobierz informacje o serwisie"""
        url = f"{self.base_url}/services/{self.service_id}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            service = response.json()
            print(f"✅ Serwis: {service.get('name')}")
            print(f"📍 Region: {service.get('region')}")
            print(f"🔗 URL: {service.get('serviceDetails', {}).get('url')}")
            return service
        else:
            print(f"❌ Błąd pobierania info: {response.status_code}")
            print(response.text)
            return None
    
    def get_deploys(self, limit=5):
        """Pobierz listę ostatnich deploymentów"""
        url = f"{self.base_url}/services/{self.service_id}/deploys"
        params = {"limit": limit}
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            deploys = response.json()
            print(f"\n📋 Ostatnie {len(deploys)} deploymentów:")
            for deploy in deploys:
                status = deploy.get('status')
                created_at = deploy.get('createdAt')
                commit = deploy.get('commit', {}).get('message', 'N/A')[:50]
                
                status_icon = {
                    'live': '✅',
                    'build_failed': '❌',
                    'canceled': '⚠️',
                    'created': '🔄'
                }.get(status, '❓')
                
                print(f"{status_icon} {status} - {created_at} - {commit}")
            return deploys
        else:
            print(f"❌ Błąd pobierania deploymentów: {response.status_code}")
            return []
    
    def trigger_deploy(self, clear_cache=False):
        """Wyzwól nowy deployment"""
        url = f"{self.base_url}/services/{self.service_id}/deploys"
        data = {
            "clearCache": "clear" if clear_cache else "do_not_clear"
        }
        
        print(f"\n🚀 Wyzwalam deploy{'(z czyszczeniem cache)' if clear_cache else ''}...")
        response = requests.post(url, headers=self.headers, json=data)
        
        if response.status_code == 201:
            deploy = response.json()
            deploy_id = deploy.get('id')
            print(f"✅ Deploy wyzwolony! ID: {deploy_id}")
            return deploy_id
        else:
            print(f"❌ Błąd wyzwalania deployu: {response.status_code}")
            print(response.text)
            return None
    
    def get_deploy_status(self, deploy_id):
        """Sprawdź status konkretnego deployu"""
        url = f"{self.base_url}/services/{self.service_id}/deploys/{deploy_id}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            deploy = response.json()
            return deploy.get('status')
        return None
    
    def wait_for_deploy(self, deploy_id, timeout=600):
        """Czekaj na zakończenie deployu"""
        print(f"\n⏳ Czekam na zakończenie deployu {deploy_id}...")
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            status = self.get_deploy_status(deploy_id)
            
            if status == 'live':
                print(f"✅ Deploy zakończony sukcesem!")
                return True
            elif status in ['build_failed', 'canceled', 'deactivated']:
                print(f"❌ Deploy nie powiódł się: {status}")
                return False
            
            print(f"🔄 Status: {status}... (czekam 10s)")
            time.sleep(10)
        
        print(f"⏱️ Timeout! Deploy trwa dłużej niż {timeout}s")
        return False
    
    def update_env_vars(self, env_vars):
        """Zaktualizuj zmienne środowiskowe"""
        url = f"{self.base_url}/services/{self.service_id}/env-vars"
        
        print(f"\n🔐 Aktualizuję zmienne środowiskowe...")
        
        for key, value in env_vars.items():
            data = {
                "key": key,
                "value": value
            }
            response = requests.put(url, headers=self.headers, json=data)
            
            if response.status_code in [200, 201]:
                print(f"✅ {key} zaktualizowane")
            else:
                print(f"❌ Błąd aktualizacji {key}: {response.status_code}")
                print(response.text)
    
    def get_logs(self, limit=100):
        """Pobierz logi serwisu"""
        url = f"{self.base_url}/services/{self.service_id}/logs"
        params = {"limit": limit}
        response = requests.get(url, headers=self.headers, params=params)
        
        if response.status_code == 200:
            logs = response.json()
            print(f"\n📜 Ostatnie logi:")
            for log in logs[-20:]:  # Pokaż ostatnie 20
                print(log.get('message', ''))
            return logs
        else:
            print(f"❌ Błąd pobierania logów: {response.status_code}")
            return []


def main():
    """Główna funkcja agenta"""
    print("🤖 Render Deploy Agent")
    print("=" * 50)
    
    # Pobierz credentials z env variables lub .env
    api_key = os.getenv('RENDER_API_KEY')
    service_id = os.getenv('RENDER_SERVICE_ID')
    
    if not api_key or not service_id:
        print("❌ Brak wymaganych zmiennych środowiskowych!")
        print("\nUstaw:")
        print("  RENDER_API_KEY=rnd_xxxxxxxxxx")
        print("  RENDER_SERVICE_ID=srv-xxxxxxxxxx")
        print("\nLub stwórz plik .env z tymi wartościami")
        return
    
    # Inicjalizuj agenta
    agent = RenderDeployAgent(api_key, service_id)
    
    # Menu interaktywne
    while True:
        print("\n" + "=" * 50)
        print("📋 Menu:")
        print("1. 📊 Pokaż info o serwisie")
        print("2. 📋 Pokaż ostatnie deploymenty")
        print("3. 🚀 Wyzwól nowy deploy")
        print("4. 🗑️  Wyzwól deploy z czyszczeniem cache")
        print("5. 🔐 Zaktualizuj zmienne środowiskowe")
        print("6. 📜 Pokaż logi")
        print("0. 🚪 Wyjdź")
        print("=" * 50)
        
        choice = input("\nWybierz opcję (0-6): ").strip()
        
        if choice == '1':
            agent.get_service_info()
        
        elif choice == '2':
            agent.get_deploys()
        
        elif choice == '3':
            deploy_id = agent.trigger_deploy()
            if deploy_id:
                wait = input("\nCzy chcesz czekać na zakończenie? (t/n): ").lower()
                if wait == 't':
                    agent.wait_for_deploy(deploy_id)
        
        elif choice == '4':
            deploy_id = agent.trigger_deploy(clear_cache=True)
            if deploy_id:
                wait = input("\nCzy chcesz czekać na zakończenie? (t/n): ").lower()
                if wait == 't':
                    agent.wait_for_deploy(deploy_id)
        
        elif choice == '5':
            print("\n🔐 Aktualizacja zmiennych środowiskowych")
            print("Wprowadź zmienne w formacie: KEY=VALUE")
            print("Wpisz 'done' aby zakończyć")
            
            env_vars = {}
            while True:
                line = input("Zmienna: ").strip()
                if line.lower() == 'done':
                    break
                if '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
            
            if env_vars:
                agent.update_env_vars(env_vars)
                print("\n⚠️ Uwaga: Serwis zostanie automatycznie zrestartowany!")
        
        elif choice == '6':
            agent.get_logs()
        
        elif choice == '0':
            print("\n👋 Do zobaczenia!")
            break
        
        else:
            print("❌ Nieprawidłowa opcja!")


if __name__ == "__main__":
    main()
