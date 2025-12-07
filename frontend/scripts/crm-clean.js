// Globalna funkcja do dynamicznego URL API
window.getApiBaseUrl = function() {
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3500/api'
        : 'https://web-production-7504.up.railway.app/api';
};

class CRMManager {
    constructor() {
        this.clients = [];
        this.cases = [];
        this.currentClient = null;
        this.currentCase = null;
        this.lawyers = [];
        this.caseManagers = [];
        this.reception = [];
        this.initialized = false;
        
        // Nasłuchuj eventów
        this.setupEventListeners();
    }
    
    // Metoda pomocnicza do pobierania API URL
    getApiUrl() {
        return window.getApiBaseUrl();
    }
    
    // Metoda do bezpiecznego renderowania HTML opisu (usuwa tagi HTML i zwraca czysty tekst)
    stripHtmlTags(html) {
        if (!html) return '';
        // Utwórz tymczasowy element do parsowania HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        // Zwróć tylko tekst bez tagów
        return temp.textContent || temp.innerText || '';
    }
    
    // Metoda do skracania opisu z zachowaniem czystego tekstu
    getDescriptionPreview(description, maxLength = 150) {
        if (!description) return '';
        const cleanText = this.stripHtmlTags(description);
        if (cleanText.length <= maxLength) return cleanText;
        return cleanText.substring(0, maxLength) + '...';
    }
    
    // 🚀 Szybki loading overlay
    showQuickLoading(message = 'Ładowanie...') {
        // Usuń poprzedni loading jeśli istnieje
        this.hideQuickLoading();
        
        const loader = document.createElement('div');
        loader.id = 'quickLoadingOverlay';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(26, 35, 50, 0.85);
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.1s ease;
        `;
        loader.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="width: 50px; height: 50px; border: 4px solid rgba(255,215,0,0.3); border-top: 4px solid #FFD700; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 15px;"></div>
                <div style="font-size: 1.1rem; font-weight: 600;">${message}</div>
            </div>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>
        `;
        document.body.appendChild(loader);
    }
    
    hideQuickLoading() {
        const loader = document.getElementById('quickLoadingOverlay');
        if (loader) loader.remove();
    }
    
    setupEventListeners() {
        if (window.eventBus) {
            // Odświeżaj listę klientów gdy dodano nowego
            window.eventBus.on('client:created', () => {
                console.log('🔄 CRM: Odświeżam listę klientów po dodaniu nowego');
                // Sprawdź czy jesteśmy w widoku klientów
                const clientsView = document.getElementById('clientsView');
                if (clientsView && clientsView.style.display !== 'none') {
                    this.loadClients();
                }
            });
        }
    }
    
    // Custom Alert - piękny modal na środku ekranu
    customAlert(message, type = 'info') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: rgba(0,0,0,0.5);
                z-index: 99999;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.2s ease;
            `;
            
            const colors = {
                success: { bg: '#d4edda', border: '#28a745', icon: '✅', text: '#155724' },
                error: { bg: '#f8d7da', border: '#dc3545', icon: '❌', text: '#721c24' },
                warning: { bg: '#fff3cd', border: '#ffc107', icon: '⚠️', text: '#856404' },
                info: { bg: '#d1ecf1', border: '#17a2b8', icon: 'ℹ️', text: '#0c5460' }
            };
            
            const color = colors[type] || colors.info;
            
            modal.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    max-width: 450px;
                    width: 90%;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                    border-top: 5px solid ${color.border};
                    animation: slideIn 0.3s ease;
                ">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                        <div style="
                            font-size: 40px;
                            width: 60px;
                            height: 60px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: ${color.bg};
                            border-radius: 50%;
                        ">
                            ${color.icon}
                        </div>
                        <div style="flex: 1; color: ${color.text}; font-size: 16px; line-height: 1.5;">
                            ${message}
                        </div>
                    </div>
                    <div style="display: flex; justify-content: flex-end;">
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                            padding: 10px 30px;
                            background: linear-gradient(135deg, ${color.border}, ${color.border});
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            transition: transform 0.2s;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            OK
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('button').addEventListener('click', () => {
                modal.remove();
                resolve();
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve();
                }
            });
        });
    }
    
    // Custom Confirm - pytanie z przyciskami TAK/NIE
    customConfirm(message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: rgba(0,0,0,0.5);
                z-index: 99999;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.2s ease;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    max-width: 450px;
                    width: 90%;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                    border-top: 5px solid #ffc107;
                    animation: slideIn 0.3s ease;
                ">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px;">
                        <div style="
                            font-size: 40px;
                            width: 60px;
                            height: 60px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: #fff3cd;
                            border-radius: 50%;
                        ">
                            ❓
                        </div>
                        <div style="flex: 1; color: #856404; font-size: 16px; line-height: 1.5;">
                            ${message}
                        </div>
                    </div>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="cancelBtn" style="
                            padding: 10px 25px;
                            background: #6c757d;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            transition: transform 0.2s;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            Anuluj
                        </button>
                        <button id="confirmBtn" style="
                            padding: 10px 25px;
                            background: linear-gradient(135deg, #FFD700, #FFA500);
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            transition: transform 0.2s;
                            box-shadow: 0 4px 12px rgba(255,215,0,0.3);
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            Tak, potwierdź
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('#confirmBtn').addEventListener('click', () => {
                modal.remove();
                resolve(true);
            });
            
            modal.querySelector('#cancelBtn').addEventListener('click', () => {
                modal.remove();
                resolve(false);
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    resolve(false);
                }
            });
        });
    }
    
    // Custom Prompt - wprowadzanie tekstu (np. hasła)
    customPrompt(message, type = 'text') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: rgba(0,0,0,0.5);
                z-index: 99999;
                display: flex;
                justify-content: center;
                align-items: center;
                animation: fadeIn 0.2s ease;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    max-width: 450px;
                    width: 90%;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                    border-top: 5px solid #dc3545;
                    animation: slideIn 0.3s ease;
                ">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                        <div style="
                            font-size: 40px;
                            width: 60px;
                            height: 60px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: #f8d7da;
                            border-radius: 50%;
                        ">
                            🔒
                        </div>
                        <div style="flex: 1; color: #721c24; font-size: 16px; line-height: 1.5;">
                            ${message}
                        </div>
                    </div>
                    <input 
                        type="${type}" 
                        id="promptInput" 
                        placeholder="Wpisz hasło..."
                        style="
                            width: 100%;
                            padding: 12px;
                            border: 2px solid #dc3545;
                            border-radius: 6px;
                            font-size: 16px;
                            margin-bottom: 20px;
                            box-sizing: border-box;
                        "
                    />
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="cancelPromptBtn" style="
                            padding: 10px 25px;
                            background: #6c757d;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            transition: transform 0.2s;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            Anuluj
                        </button>
                        <button id="confirmPromptBtn" style="
                            padding: 10px 25px;
                            background: linear-gradient(135deg, #dc3545, #c82333);
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            transition: transform 0.2s;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            Potwierdź
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const input = modal.querySelector('#promptInput');
            input.focus();
            
            const handleConfirm = () => {
                const value = input.value;
                modal.remove();
                resolve(value);
            };
            
            const handleCancel = () => {
                modal.remove();
                resolve(null);
            };
            
            modal.querySelector('#confirmPromptBtn').addEventListener('click', handleConfirm);
            modal.querySelector('#cancelPromptBtn').addEventListener('click', handleCancel);
            
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleConfirm();
                }
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    handleCancel();
                }
            });
        });
    }
    
    // 🔐 Modal z hasłem dostępu do sprawy
    showCasePasswordModal(caseNumber, accessPassword, caseId) {
        const modal = document.createElement('div');
        modal.id = 'casePasswordModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.7);
            z-index: 99999;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.3s ease;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                padding: 40px;
                max-width: 550px;
                width: 90%;
                box-shadow: 0 15px 50px rgba(0,0,0,0.4);
                border-top: 6px solid #28a745;
                animation: slideIn 0.4s ease;
            ">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 60px; margin-bottom: 15px;">🔐</div>
                    <h2 style="color: #1a2332; margin: 0 0 10px 0; font-size: 24px;">
                        Sprawa utworzona pomyślnie!
                    </h2>
                    <p style="color: #666; margin: 0; font-size: 16px;">
                        Numer sprawy: <strong style="color: #28a745;">${this.escapeHtml(caseNumber)}</strong>
                    </p>
                </div>
                
                <div style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border: 2px dashed #28a745; border-radius: 12px; padding: 25px; margin-bottom: 25px; text-align: center;">
                    <div style="color: #1b5e20; font-size: 14px; font-weight: 600; margin-bottom: 10px; letter-spacing: 0.5px;">
                        🔑 HASŁO DOSTĘPU DO SPRAWY
                    </div>
                    <div style="background: white; padding: 15px 20px; border-radius: 8px; font-size: 24px; font-weight: 700; color: #28a745; letter-spacing: 2px; font-family: 'Courier New', monospace; border: 2px solid #28a745; user-select: all; cursor: pointer;" 
                         onclick="this.select(); document.execCommand('copy');" title="Kliknij aby skopiować">
                        ${this.escapeHtml(accessPassword)}
                    </div>
                    <div style="color: #2e7d32; font-size: 12px; margin-top: 10px; font-style: italic;">
                        💡 Kliknij hasło aby skopiować
                    </div>
                </div>
                
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 6px; margin-bottom: 25px; font-size: 14px; color: #856404; line-height: 1.6;">
                    <strong>⚠️ WAŻNE:</strong><br>
                    • To hasło pozwala na dostęp do szczegółów sprawy<br>
                    • Wszyscy pracownicy otrzymają powiadomienie na czat firmowy<br>
                    • Hasło można zmienić w szczegółach sprawy<br>
                    • Zachowaj hasło w bezpiecznym miejscu
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="
                        const textArea = document.createElement('textarea');
                        textArea.value = '${accessPassword}';
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                        this.textContent = '✅ Skopiowano!';
                        this.style.background = '#28a745';
                        setTimeout(() => { this.textContent = '📋 Skopiuj hasło'; this.style.background = 'linear-gradient(135deg, #007bff, #0056b3)'; }, 2000);
                    " style="padding: 12px 25px; background: linear-gradient(135deg, #007bff, #0056b3); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 15px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,123,255,0.3);">
                        📋 Skopiuj hasło
                    </button>
                    
                    <button onclick="crmManager.sendPasswordToChat('${caseNumber}', '${accessPassword}', ${caseId})" style="padding: 12px 25px; background: linear-gradient(135deg, #6f42c1, #5a32a3); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 15px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(111,66,193,0.3);">
                        💬 Wyślij na czat firmowy
                    </button>
                    
                    <button onclick="document.getElementById('casePasswordModal').remove()" style="padding: 12px 25px; background: linear-gradient(135deg, #FFD700, #FFA500); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 15px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(255,215,0,0.3);">
                        ✅ OK, rozumiem
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    // 💬 Wyślij hasło na czat firmowy
    async sendPasswordToChat(caseNumber, accessPassword, caseId) {
        try {
            console.log('💬 Wysyłanie hasła na czat firmowy:', { caseNumber, accessPassword, caseId });
            
            // Pobierz tytuł sprawy z aktualnych danych
            const caseTitle = this.currentCase ? this.currentCase.title : null;
            
            // Wyślij request do API
            const response = await window.api.request('/chat/broadcast-case-password', {
                method: 'POST',
                body: JSON.stringify({
                    caseNumber,
                    accessPassword,
                    caseId,
                    caseTitle
                })
            });
            
            if (response.success) {
                console.log(`✅ Hasło wysłane do ${response.count} pracowników:`, response.sentTo);
                
                // Zamknij modal z hasłem
                const modal = document.getElementById('casePasswordModal');
                if (modal) modal.remove();
                
                // Pokaż sukces
                await this.customAlert(
                    `Hasło wysłane pomyślnie!\n\n` +
                    `Wiadomość otrzymało ${response.count} pracowników:\n` +
                    response.sentTo.slice(0, 5).join(', ') +
                    (response.sentTo.length > 5 ? ` i ${response.sentTo.length - 5} innych...` : ''),
                    'success'
                );
            }
        } catch (error) {
            console.error('❌ Błąd wysyłania na czat:', error);
            await this.customAlert('Błąd wysyłania wiadomości na czat: ' + error.message, 'error');
        }
    }

    async init() {
        if (this.initialized) return;
        this.initialized = true;
        
        await this.loadClients();
        await this.loadCases();
        await this.loadLawyers();
        this.setupEventListeners();
        this.setupGlobalEventListeners();
    }
    
    setupGlobalEventListeners() {
        // Nasłuchuj na utworzenie nowego użytkownika (z Admin Dashboard)
        if (window.eventBus) {
            eventBus.on('user:created', async (data) => {
                console.log('✅ CRM: Odebrano event user:created', data);
                // Odśwież listę lawyers i case managers
                await this.loadLawyers();
                console.log('✅ CRM: Listy użytkowników odświeżone');
            });
        }
    }

    async loadLawyers() {
        try {
            // Ładuj wszystkich użytkowników (lawyers, case_managers, reception)
            const response = await window.api.request('/users');
            const allUsers = response.users || [];
            
            this.lawyers = allUsers.filter(u => u.role === 'lawyer' || u.user_role === 'lawyer');
            this.caseManagers = allUsers.filter(u => u.role === 'case_manager' || u.user_role === 'case_manager');
            this.reception = allUsers.filter(u => u.role === 'reception' || u.user_role === 'reception');
            
            console.log('✅ Użytkownicy załadowani:', {
                lawyers: this.lawyers.length,
                caseManagers: this.caseManagers.length,
                reception: this.reception.length
            });
        } catch (error) {
            console.error('Error loading lawyers:', error);
            this.lawyers = [];
            this.caseManagers = [];
            this.reception = [];
        }
    }

    async loadClients(status = '') {
        try {
            let url = '/clients';
            if (status) {
                url += `?status=${status}`;
            }
            const response = await window.api.request(url);
            this.clients = response.clients || [];
            this.renderClients();
        } catch (error) {
            console.error('Error loading clients:', error);
        }
    }

    async loadCases(status = '') {
        try {
            console.log('🔍 Loading cases with status:', status || 'all');
            let url = '/cases';
            if (status) {
                url += `?status=${status}`;
            }
            const response = await window.api.request(url);
            console.log('✅ Cases response:', response);
            console.log('Cases type:', typeof response.cases);
            console.log('Cases isArray:', Array.isArray(response.cases));
            
            // NAPRAW: Zawsze ustaw jako tablicę
            if (Array.isArray(response.cases)) {
                this.cases = response.cases;
            } else if (Array.isArray(response)) {
                this.cases = response;
            } else {
                console.error('❌ Backend nie zwrócił tablicy! Otrzymano:', response);
                this.cases = [];
            }
            
            console.log('Final this.cases length:', this.cases.length);
            this.renderCases();
        } catch (error) {
            console.error('❌ Error loading cases:', error);
            this.cases = [];
            this.renderCases();
        }
    }

    setupEventListeners() {
        // Zakładki
        document.querySelectorAll('.crm-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                
                document.querySelectorAll('.crm-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.crm-tab-content').forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(target + 'Tab').classList.add('active');
            });
        });

        // Filtrowanie statusu klientów
        document.getElementById('clientStatusFilter')?.addEventListener('change', (e) => {
            const status = e.target.value;
            console.log('🔄 Filtrowanie klientów po statusie:', status || 'wszyscy');
            this.loadClients(status);
        });

        // Filtrowanie statusu spraw
        document.getElementById('caseStatusFilter')?.addEventListener('change', (e) => {
            const status = e.target.value;
            console.log('🔄 Filtrowanie spraw po statusie:', status || 'wszystkie');
            this.loadCases(status);
        });

        // Wyszukiwanie
        document.getElementById('clientSearch')?.addEventListener('input', (e) => {
            this.filterClients(e.target.value);
        });

        document.getElementById('caseSearch')?.addEventListener('input', (e) => {
            this.filterCases(e.target.value);
        });
        
        // Przyciski dodawania - Sprawdź czy istnieją przed podpięciem
        const newClientBtn = document.getElementById('newClientBtn');
        const newCaseBtn = document.getElementById('newCaseBtn');
        
        if (newClientBtn) {
            newClientBtn.addEventListener('click', () => {
                console.log('🆕 Kliknięto Nowy klient');
                this.showAddClient();
            });
            console.log('✅ Event listener podpięty dla newClientBtn');
        } else {
            console.warn('⚠️ Element #newClientBtn nie znaleziony w DOM');
        }

        if (newCaseBtn) {
            newCaseBtn.addEventListener('click', () => {
                console.log('🆕 Kliknięto Nowa sprawa');
                this.showAddCase();
            });
            console.log('✅ Event listener podpięty dla newCaseBtn');
        } else {
            console.warn('⚠️ Element #newCaseBtn nie znaleziony w DOM');
        }
    }

    renderClients() {
        const container = document.getElementById('clientsList');
        if (!container) return;

        if (this.clients.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Brak klientów</p>';
            return;
        }

        // Sprawdź czy użytkownik jest adminem
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('user') || '{}');
        const isAdmin = currentUser.role === 'admin' || currentUser.user_role === 'admin';

        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Imię i nazwisko</th>
                        <th>Firma</th>
                        <th>Email</th>
                        <th>Telefon</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.clients.map(client => `
                        <tr>
                            <td><strong>${this.escapeHtml(client.first_name)} ${this.escapeHtml(client.last_name)}</strong></td>
                            <td>${this.escapeHtml(client.company_name || '-')}</td>
                            <td>${this.escapeHtml(client.email || '-')}</td>
                            <td>${this.escapeHtml(client.phone || '-')}</td>
                            <td>
                                <button class="btn-small" style="background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; font-weight: 600; border: 2px solid #d4af37;" onclick="crmManager.showClientDetails(${client.id})">👁️ Szczegóły</button>
                                ${isAdmin ? `<button class="btn-small" onclick="crmManager.editClient(${client.id})">Edytuj</button>` : ''}
                                <button class="btn-small" onclick="crmManager.viewClientCases(${client.id})">Sprawy</button>
                                ${isAdmin ? `<button class="btn-small" style="background: #e74c3c; color: white;" onclick="crmManager.deleteClient(${client.id})">🗑️ Usuń</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderCases() {
        const container = document.getElementById('casesList');
        if (!container) return;

        // NAPRAW: Sprawdź czy this.cases jest tablicą
        if (!Array.isArray(this.cases)) {
            console.error('❌ this.cases is not an array!', this.cases);
            this.cases = [];
        }

        if (this.cases.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Brak spraw</p>';
            return;
        }

        // Sprawdź czy użytkownik jest adminem
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('user') || '{}');
        const isAdmin = currentUser.role === 'admin' || currentUser.user_role === 'admin';

        // Tłumaczenia typów spraw
        const caseTypeTranslations = {
            'compensation': 'Odszkodowanie',
            'contract': 'Umowa',
            'family': 'Rodzinne',
            'property': 'Majątkowe',
            'inheritance': 'Spadkowe',
            'debt': 'Windykacja',
            'assault': 'Pobicie',
            'theft': 'Kradzież',
            'fraud': 'Oszustwo',
            'traffic': 'Drogowe',
            'drugs': 'Narkotyki',
            'building': 'Budowlane',
            'tax': 'Podatkowe',
            'zoning': 'Zagospodarowanie',
            'business': 'Gospodarcze',
            'bankruptcy': 'Upadłość',
            'restructuring': 'Restrukturyzacja',
            'international': 'Międzynarodowe',
            'european': 'Europejskie',
            'arbitration': 'Arbitraż',
            'maritime': 'Morskie',
            'energy': 'Energetyczne',
            'renewable': 'OZE',
            'aviation': 'Lotnicze',
            'it': 'IT',
            'civil': 'Cywilne',
            'other': 'Inne'
        };

        // Tłumaczenia statusów
        const statusTranslations = {
            'open': 'Otwarta',
            'in_progress': 'W toku',
            'closed': 'Zamknięta'
        };

        const statusColors = {
            open: '🟢',
            in_progress: '🟡',
            closed: '🔴'
        };

        // Tłumaczenia priorytetów
        const priorityTranslations = {
            'low': 'Niski',
            'medium': 'Średni',
            'high': 'Wysoki'
        };

        const priorityColors = {
            low: '🔵',
            medium: '🟡',
            high: '🔴'
        };

        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Numer</th>
                        <th>Tytuł</th>
                        <th>Klient</th>
                        <th>Typ</th>
                        <th>Status</th>
                        <th>Priorytet</th>
                        <th>Akcje</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.cases.map(c => `
                        <tr>
                            <td><strong>${this.escapeHtml(c.case_number)}</strong></td>
                            <td>${this.escapeHtml(c.title)}</td>
                            <td>${this.escapeHtml(c.first_name)} ${this.escapeHtml(c.last_name)}</td>
                            <td>${caseTypeTranslations[c.case_type] || this.escapeHtml(c.case_type)}</td>
                            <td>${statusColors[c.status] || ''} ${statusTranslations[c.status] || c.status}</td>
                            <td>${priorityColors[c.priority] || ''} ${priorityTranslations[c.priority] || c.priority}</td>
                            <td>
                                <button class="btn-small" style="background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; font-weight: 600; border: 2px solid #d4af37;" onclick="crmManager.viewCase(${c.id})">👁️ Otwórz</button>
                                ${isAdmin ? `<button class="btn-small" style="background: #e74c3c; color: white;" onclick="crmManager.deleteCase(${c.id}, '${this.escapeHtml(c.case_number)}')">🗑️ Usuń</button>` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    filterClients(query) {
        const items = document.querySelectorAll('#clientsList tbody tr');
        const lowerQuery = query.toLowerCase();

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(lowerQuery) ? '' : 'none';
        });
    }

    filterCases(query) {
        const items = document.querySelectorAll('#casesList tbody tr');
        const lowerQuery = query.toLowerCase();

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(lowerQuery) ? '' : 'none';
        });
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // KROK 2-3: Panel szczegółów klienta (slide-in z prawej) - PEŁNA WERSJA
    async showClientDetails(clientId) {
        try {
            // Pobierz dane klienta
            const response = await window.api.request(`/clients/${clientId}`);
            const client = response.client;
            
            // Pobierz sprawy klienta
            const casesResponse = await window.api.request(`/cases?client_id=${clientId}`);
            const clientCases = casesResponse.cases || [];
            
            // Pobierz pliki klienta
            let clientFiles = [];
            try {
                console.log('📎 Pobieram pliki dla klienta:', clientId);
                const filesResponse = await window.api.request(`/clients/${clientId}/files`);
                console.log('📎 Odpowiedź z plikami:', filesResponse);
                clientFiles = Array.isArray(filesResponse.files) ? filesResponse.files : [];
                console.log('📎 Liczba plików:', clientFiles.length);
            } catch (error) {
                console.error('❌ Error loading client files:', error);
                clientFiles = []; // Zawsze tablica
            }
            
            // Pobierz notatki o kliencie
            let clientNotes = [];
            try {
                console.log('📝 Pobieram notatki dla klienta:', clientId);
                const notesResponse = await window.api.request(`/clients/${clientId}/notes`);
                console.log('📝 Odpowiedź z notatkami:', notesResponse);
                clientNotes = Array.isArray(notesResponse.notes) ? notesResponse.notes : [];
                console.log('📝 Liczba notatek:', clientNotes.length);
            } catch (error) {
                console.error('❌ Error loading client notes:', error);
                clientNotes = []; // Zawsze tablica
            }
            
            // Utwórz panel (jeśli nie istnieje)
            let panel = document.getElementById('clientDetailsPanel');
            if (!panel) {
                panel = document.createElement('div');
                panel.id = 'clientDetailsPanel';
                panel.style.cssText = `
                    position: fixed;
                    top: 0;
                    right: -650px;
                    width: 650px;
                    height: 100vh;
                    background: white;
                    box-shadow: -5px 0 15px rgba(0,0,0,0.3);
                    z-index: 9999;
                    transition: right 0.3s ease;
                    overflow-y: auto;
                `;
                document.body.appendChild(panel);
            }
            
            // Wypełnij dane
            panel.innerHTML = `
                <div style="position: sticky; top: 0; background: white; z-index: 10; padding: 20px; border-bottom: 2px solid #FFD700;">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 2px solid #eee;">
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                <h2 style="margin: 0; color: #1a2332;">${this.escapeHtml(client.first_name)} ${this.escapeHtml(client.last_name)}</h2>
                                <span id="statusBadge_${client.id}" style="padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; ${client.status === 'active' ? 'background: #d4edda; color: #155724;' : 'background: #e0e0e0; color: #666;'}">
                                    ${client.status === 'active' ? '🟢 Aktywny' : '⚫ Nieaktywny'}
                                </span>
                            </div>
                            <p style="margin: 5px 0; color: #666;">${this.escapeHtml(client.company_name || 'Klient indywidualny')}</p>
                            <button onclick="crmManager.toggleClientStatus(${client.id}, '${client.status}')" style="margin-top: 8px; padding: 6px 12px; background: ${client.status === 'active' ? '#6c757d' : '#28a745'}; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600;">
                                ${client.status === 'active' ? '📦 Archiwizuj' : '✅ Aktywuj'}
                            </button>
                        </div>
                        <button onclick="crmManager.closeClientPanel()" style="background: #e74c3c; color: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 20px;">✕</button>
                    </div>
                    
                    <!-- Przyciski kontaktu -->
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 15px;">
                        <button onclick="crmManager.callClient('${this.escapeHtml(client.phone || '')}')" ${!client.phone ? 'disabled' : ''} style="padding: 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; ${!client.phone ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                            📞 Zadzwoń
                        </button>
                        <button onclick="crmManager.whatsappClient('${this.escapeHtml(client.phone || '')}')" ${!client.phone ? 'disabled' : ''} style="padding: 8px; background: #25D366; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; ${!client.phone ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                            💬 WhatsApp
                        </button>
                        <button onclick="crmManager.emailClient('${this.escapeHtml(client.email || '')}')" ${!client.email ? 'disabled' : ''} style="padding: 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; ${!client.email ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                            📧 Email
                        </button>
                        <button onclick="crmManager.chatWithClient(${client.id}, '${this.escapeHtml(client.first_name)} ${this.escapeHtml(client.last_name)}')" style="padding: 8px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                            💬 Czat
                        </button>
                    </div>
                </div>
                
                <div style="padding: 20px;">
                    <!-- Dane podstawowe -->
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #1a2332; margin: 0 0 15px 0; font-size: 1.1rem;">👤 Dane podstawowe</h3>
                        <div style="display: grid; grid-template-columns: 1fr; gap: 10px; font-size: 0.95rem; color: #1a2332;">
                            <div><strong style="color: #1a2332;">Imię i nazwisko:</strong> ${this.escapeHtml(client.first_name)} ${this.escapeHtml(client.last_name)}</div>
                            ${client.company_name ? `<div><strong style="color: #1a2332;">Firma:</strong> ${this.escapeHtml(client.company_name)}</div>` : ''}
                            ${client.assigned_to_name ? `
                                <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); color: white; padding: 10px; border-radius: 6px; margin-top: 5px; border: 2px solid #FFD700;">
                                    <strong>👨‍⚖️ Opiekun / Mecenas:</strong> ${this.escapeHtml(client.assigned_to_name)}
                                    ${client.assigned_to_email ? ` (${this.escapeHtml(client.assigned_to_email)})` : ''}
                                </div>
                            ` : ''}
                            <div><strong style="color: #1a2332;">Email:</strong> ${this.escapeHtml(client.email || '-')}</div>
                            <div><strong style="color: #1a2332;">Telefon:</strong> ${this.escapeHtml(client.phone || '-')}</div>
                            <div><strong style="color: #1a2332;">Adres:</strong> ${this.escapeHtml(client.address || '-')}</div>
                            ${client.city ? `<div><strong style="color: #1a2332;">Miasto:</strong> ${this.escapeHtml(client.city)}</div>` : ''}
                            ${client.postal_code ? `<div><strong style="color: #1a2332;">Kod pocztowy:</strong> ${this.escapeHtml(client.postal_code)}</div>` : ''}
                            ${client.nip ? `<div><strong style="color: #1a2332;">NIP:</strong> ${this.escapeHtml(client.nip)}</div>` : ''}
                            ${client.regon ? `<div><strong style="color: #1a2332;">REGON:</strong> ${this.escapeHtml(client.regon)}</div>` : ''}
                            ${client.pesel ? `<div><strong style="color: #1a2332;">PESEL:</strong> ${this.escapeHtml(client.pesel)}</div>` : ''}
                        </div>
                        
                        <!-- Historia zmian -->
                        ${client.updated_at ? `
                            <div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 6px; border-left: 3px solid #2196f3;">
                                <div style="font-size: 0.85rem; color: #1565c0;">
                                    <strong>📝 Ostatnia aktualizacja:</strong> ${new Date(client.updated_at).toLocaleString('pl-PL')}
                                    ${client.updated_by_name ? ` przez ${this.escapeHtml(client.updated_by_name)}` : ''}
                                </div>
                                <div style="font-size: 0.8rem; color: #666; margin-top: 5px;">
                                    <strong>Utworzono:</strong> ${new Date(client.created_at).toLocaleString('pl-PL')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                    
                    <!-- Prowadzone sprawy klienta -->
                    <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
                        <h3 style="color: #1a2332; margin: 0 0 15px 0; font-size: 1.1rem;">⚖️ Prowadzone sprawy (${clientCases.length})</h3>
                        ${clientCases.length > 0 ? `
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                ${clientCases.slice(0, 3).map(c => `
                                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e0e0e0;">
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <strong style="color: #1a2332;">${this.escapeHtml(c.case_number)}</strong>
                                            <span style="padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; background: ${c.status === 'open' ? '#d4edda' : c.status === 'in_progress' ? '#fff3cd' : '#f8d7da'}; color: ${c.status === 'open' ? '#155724' : c.status === 'in_progress' ? '#856404' : '#721c24'};">
                                                ${c.status === 'open' ? '🟢 Otwarta' : c.status === 'in_progress' ? '🟡 W toku' : '🔴 Zamknięta'}
                                            </span>
                                        </div>
                                        <p style="margin: 8px 0 0 0; color: #666; font-size: 0.9rem;">${this.escapeHtml(c.title)}</p>
                                        <p style="margin: 5px 0 0 0; color: #999; font-size: 0.85rem;">${this.escapeHtml(c.case_type || 'Nie określono typu')}</p>
                                        <button onclick="crmManager.viewCase(${c.id})" style="margin-top: 10px; padding: 6px 12px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">
                                            👁️ Otwórz sprawę
                                        </button>
                                    </div>
                                `).join('')}
                                
                                <div id="allCases_${clientId}" style="display: none; flex-direction: column; gap: 10px;">
                                    ${clientCases.slice(3).map(c => `
                                        <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e0e0e0;">
                                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                                <strong style="color: #1a2332;">${this.escapeHtml(c.case_number)}</strong>
                                                <span style="padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; background: ${c.status === 'open' ? '#d4edda' : c.status === 'in_progress' ? '#fff3cd' : '#f8d7da'}; color: ${c.status === 'open' ? '#155724' : c.status === 'in_progress' ? '#856404' : '#721c24'};">
                                                    ${c.status === 'open' ? '🟢 Otwarta' : c.status === 'in_progress' ? '🟡 W toku' : '🔴 Zamknięta'}
                                                </span>
                                            </div>
                                            <p style="margin: 8px 0 0 0; color: #666; font-size: 0.9rem;">${this.escapeHtml(c.title)}</p>
                                            <p style="margin: 5px 0 0 0; color: #999; font-size: 0.85rem;">${this.escapeHtml(c.case_type || 'Nie określono typu')}</p>
                                            <button onclick="crmManager.viewCase(${c.id})" style="margin-top: 10px; padding: 6px 12px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">
                                                👁️ Otwórz sprawę
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                                
                                ${clientCases.length > 3 ? `
                                    <button 
                                        id="toggleCases_${clientId}" 
                                        onclick="crmManager.toggleAllCases(${clientId})"
                                        style="padding: 8px 16px; background: linear-gradient(135deg, #4caf50, #388e3c); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; margin-top: 5px;"
                                    >
                                        ⚖️ Pokaż wszystkie sprawy (${clientCases.length})
                                    </button>
                                ` : ''}
                            </div>
                        ` : '<p style="color: #999; margin: 0;">Brak przypisanych spraw</p>'}
                    </div>
                    
                    <!-- Saldo i płatności klienta -->
                    <div id="clientBalanceSection" style="margin-bottom: 20px;">
                        <!-- Sekcja ładuje się dynamicznie -->
                    </div>
                    
                    <!-- Pliki klienta -->
                    <div style="background: #fff9e6; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f39c12;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="color: #1a2332; margin: 0; font-size: 1.1rem;">📎 Pliki (${clientFiles.length})</h3>
                            <button onclick="crmManager.showAddClientFile(${clientId})" style="padding: 6px 12px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">
                                + Dodaj plik
                            </button>
                        </div>
                        ${clientFiles.length > 0 ? `
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                ${clientFiles.slice(0, 3).map(f => `
                                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                            <div style="flex: 1;">
                                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                                                    <span style="padding: 4px 10px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 6px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.5px;">
                                                        ${this.escapeHtml(f.document_number || 'BRAK NUMERU')}
                                                    </span>
                                                    ${f.category ? `
                                                        <span style="padding: 4px 8px; background: #f0f0f0; color: #666; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">
                                                            ${this.escapeHtml(f.category)}
                                                        </span>
                                                    ` : ''}
                                                </div>
                                                <div style="font-weight: 600;">📄 ${this.escapeHtml(f.title || f.original_name || 'Bez nazwy')}</div>
                                                ${f.description ? `<div style="font-size: 0.85rem; color: #555; margin-top: 4px;">💬 ${this.escapeHtml(f.description)}</div>` : ''}
                                                ${f.case_number ? `<div style="font-size: 0.8rem; color: #007bff; margin-top: 3px;">📁 Sprawa: ${this.escapeHtml(f.case_number)}</div>` : ''}
                                                <div style="font-size: 0.8rem; color: #999; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${this.formatFileSize(f.file_size)} • 📅 ${new Date(f.uploaded_at).toLocaleDateString('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit' })} ${new Date(f.uploaded_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}${f.uploaded_by_name ? ` • 👤 ${this.escapeHtml(f.uploaded_by_name)}` : ''}</div>
                                            </div>
                                            <div style="display: flex; gap: 8px;">
                                                ${['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'].includes(f.file_type) ? `
                                                    <button onclick="crmManager.previewFile(${clientId}, ${f.id}, '${this.escapeHtml(f.file_type)}')" style="padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                                        👁️ Podgląd
                                                    </button>
                                                ` : ''}
                                                <button onclick="crmManager.downloadFile(${clientId}, ${f.id})" style="padding: 6px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                                    ⬇️ Pobierz
                                                </button>
                                                <button onclick="crmManager.deleteFile(${clientId}, ${f.id})" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                                    🗑️ Usuń
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                                
                                <div id="allFiles_${clientId}" style="display: none; flex-direction: column; gap: 8px;">
                                    ${clientFiles.slice(3).map(f => `
                                        <div style="background: white; padding: 10px; border-radius: 6px; border: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
                                            <div style="flex: 1;">
                                                <div style="font-weight: 600;">📄 ${this.escapeHtml(f.title || f.original_name || 'Bez nazwy')}</div>
                                                ${f.description ? `<div style="font-size: 0.85rem; color: #555; margin-top: 4px;">💬 ${this.escapeHtml(f.description)}</div>` : ''}
                                                ${f.case_number ? `<div style="font-size: 0.8rem; color: #007bff; margin-top: 3px;">📁 Sprawa: ${this.escapeHtml(f.case_number)}</div>` : ''}
                                                <div style="font-size: 0.8rem; color: #999; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${f.category} • ${this.formatFileSize(f.file_size)} • 📅 ${new Date(f.uploaded_at).toLocaleDateString('pl-PL', { year: 'numeric', month: '2-digit', day: '2-digit' })} ${new Date(f.uploaded_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}${f.uploaded_by_name ? ` • 👤 ${this.escapeHtml(f.uploaded_by_name)}` : ''}</div>
                                            </div>
                                            <div style="display: flex; gap: 8px;">
                                                ${['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'].includes(f.file_type) ? `
                                                    <button onclick="crmManager.previewFile(${clientId}, ${f.id}, '${this.escapeHtml(f.file_type)}')" style="padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                                        👁️ Podgląd
                                                    </button>
                                                ` : ''}
                                                <button onclick="crmManager.downloadFile(${clientId}, ${f.id})" style="padding: 6px 12px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                                    ⬇️ Pobierz
                                                </button>
                                                <button onclick="crmManager.deleteFile(${clientId}, ${f.id})" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                                    🗑️ Usuń
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                
                                ${clientFiles.length > 3 ? `
                                    <button 
                                        id="toggleFiles_${clientId}" 
                                        onclick="crmManager.toggleAllFiles(${clientId})"
                                        style="padding: 8px 16px; background: linear-gradient(135deg, #f39c12, #e67e22); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; margin-top: 5px;"
                                    >
                                        📁 Pokaż wszystkie (${clientFiles.length})
                                    </button>
                                ` : ''}
                            </div>
                        ` : '<p style="color: #999; margin: 0;">Brak plików. Kliknij "Dodaj plik" aby uploadować dokumenty.</p>'}
                    </div>
                    
                    <!-- Notatki o kliencie -->
                    <div style="background: #f3e5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #9c27b0;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                            <h3 style="color: #1a2332; margin: 0; font-size: 1.1rem;">📝 Notatki (${clientNotes.length})</h3>
                            <button onclick="crmManager.showAddClientNote(${clientId})" style="padding: 6px 12px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.85rem;">
                                + Dodaj notatkę
                            </button>
                        </div>
                        ${clientNotes.length > 0 ? `
                            <div style="display: flex; flex-direction: column; gap: 10px;">
                                ${clientNotes.slice(0, 3).map(n => `
                                    <div id="note_${n.id}" style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e0e0e0;">
                                        <p style="margin: 0 0 8px 0; color: #333;">${this.escapeHtml(n.content)}</p>
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                            <small style="color: #999;">${this.escapeHtml(n.author_name || 'Nieznany')} - ${new Date(n.created_at).toLocaleString('pl-PL')}</small>
                                            <button id="toggleComments_${n.id}" onclick="crmManager.toggleNoteComments(${n.id})" style="padding: 4px 10px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                                💬 Komentarze
                                            </button>
                                        </div>
                                        <div id="comments_${n.id}" style="display: none; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #9c27b0;">
                                            <div id="commentsList_${n.id}" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px;">
                                                <!-- Komentarze załadują się dynamicznie -->
                                            </div>
                                            <form id="commentForm_${n.id}" style="display: flex; gap: 8px;">
                                                <textarea name="comment" required placeholder="Dodaj komentarz..." style="flex: 1; min-height: 60px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; font-family: inherit; font-size: 0.85rem;"></textarea>
                                                <button type="submit" style="padding: 8px 16px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; white-space: nowrap;">
                                                    💬 Dodaj
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                `).join('')}
                                
                                <div id="allNotes_${clientId}" style="display: none; flex-direction: column; gap: 10px;">
                                    ${clientNotes.slice(3).map(n => `
                                        <div id="note_${n.id}" style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #e0e0e0;">
                                            <p style="margin: 0 0 8px 0; color: #333;">${this.escapeHtml(n.content)}</p>
                                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                                <small style="color: #999;">${this.escapeHtml(n.author_name || 'Nieznany')} - ${new Date(n.created_at).toLocaleString('pl-PL')}</small>
                                                <button id="toggleComments_${n.id}" onclick="crmManager.toggleNoteComments(${n.id})" style="padding: 4px 10px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                                                    💬 Komentarze
                                                </button>
                                            </div>
                                            <div id="comments_${n.id}" style="display: none; margin-top: 10px; padding-top: 10px; border-top: 1px dashed #9c27b0;">
                                                <div id="commentsList_${n.id}" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px;">
                                                    <!-- Komentarze załadują się dynamicznie -->
                                                </div>
                                                <form id="commentForm_${n.id}" style="display: flex; gap: 8px;">
                                                    <textarea name="comment" required placeholder="Dodaj komentarz..." style="flex: 1; min-height: 60px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; font-family: inherit; font-size: 0.85rem;"></textarea>
                                                    <button type="submit" style="padding: 8px 16px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; white-space: nowrap;">
                                                        💬 Dodaj
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                                
                                ${clientNotes.length > 3 ? `
                                    <button 
                                        id="toggleNotes_${clientId}" 
                                        onclick="crmManager.toggleAllNotes(${clientId})"
                                        style="padding: 8px 16px; background: linear-gradient(135deg, #9c27b0, #7b1fa2); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; margin-top: 5px;"
                                    >
                                        📝 Pokaż wszystkie notatki (${clientNotes.length})
                                    </button>
                                ` : ''}
                            </div>
                        ` : '<p style="color: #999; margin: 0;">Brak notatek. Kliknij "Dodaj notatkę" aby dodać uwagę o kliencie.</p>'}
                    </div>
                </div>
            `;
            
            // Pokaż panel (slide in)
            setTimeout(() => {
                panel.style.right = '0';
            }, 10);
            
            // Załaduj sekcję salda i płatności
            setTimeout(async () => {
                try {
                    if (window.clientBalanceModule) {
                        const balanceSection = document.getElementById('clientBalanceSection');
                        if (balanceSection) {
                            balanceSection.innerHTML = await window.clientBalanceModule.renderBalanceSection(clientId);
                        }
                    }
                } catch (error) {
                    console.error('Błąd ładowania salda klienta:', error);
                }
            }, 100);
            
            // Dodaj overlay (przyciemnione tło)
            this.showOverlay();
            
        } catch (error) {
            alert('Błąd ładowania danych klienta: ' + error.message);
            console.error(error);
        }
    }

    closeClientPanel() {
        const panel = document.getElementById('clientDetailsPanel');
        if (panel) {
            panel.style.right = '-650px';
            setTimeout(() => {
                this.hideOverlay();
            }, 300);
        }
    }

    showOverlay() {
        let overlay = document.getElementById('panelOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'panelOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: rgba(0,0,0,0.5);
                z-index: 9998;
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            overlay.onclick = () => this.closeClientPanel();
            document.body.appendChild(overlay);
        }
        setTimeout(() => {
            overlay.style.opacity = '1';
        }, 10);
    }

    hideOverlay() {
        const overlay = document.getElementById('panelOverlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    async viewCase(caseId) {
        try {
            // Walidacja caseId - zatrzymaj jeśli nieprawidłowe
            if (!caseId || caseId === 'null' || caseId === 'undefined' || caseId === undefined) {
                console.warn('⚠️ Nieprawidłowe ID sprawy:', caseId);
                console.log('💡 Pomijam ładowanie - nie wybrano sprawy');
                return;
            }
            
            // 🚀 SZYBKIE ŁADOWANIE: Pokaż loading od razu
            this.showQuickLoading('Ładowanie sprawy...');
            
            // Pobierz dane sprawy
            const response = await window.api.request(`/cases/${caseId}`);
            const caseData = response.case;
            
            console.log('📋 Szczegóły sprawy:', caseData);
            
            // ✅ NOWE: Zapisz dane sprawy globalnie
            window.crmManager.currentCaseData = caseData;
            
            // ✅ NOWE: Emit event przez Event Bus
            if (window.eventBus) {
                window.eventBus.emit('case:opened', { caseId, caseData });
            }
            
            // 🚀 Pobierz dokumenty w tle (nie blokuj UI)
            let caseDocuments = [];
            const docsPromise = window.api.request(`/cases/${caseId}/documents`).then(docsResponse => {
                caseDocuments = Array.isArray(docsResponse.documents) ? docsResponse.documents : [];
                console.log('📎 Dokumenty sprawy:', caseDocuments.length);
                // Zaktualizuj licznik dokumentów w zakładce
                const docsTab = document.getElementById('caseTab_documents');
                if (docsTab) {
                    docsTab.innerHTML = `📎 Dokumenty (${caseDocuments.length})`;
                }
            }).catch(error => {
                console.error('❌ Error loading case documents:', error);
            });
            
            // Ukryj loading
            this.hideQuickLoading();
            
            // Mapowanie statusów
            const statusConfig = {
                open: { label: 'Otwarta', color: '#28a745', emoji: '🟢' },
                in_progress: { label: 'W toku', color: '#ffc107', emoji: '🟡' },
                closed: { label: 'Zamknięta', color: '#dc3545', emoji: '🔴' }
            };
            
            const currentStatus = statusConfig[caseData.status] || statusConfig.open;
            
            // ✅ Sprawdź czy wyświetlić przycisk "Oddaj sprawę"
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('user') || '{}');
            const showReleaseCaseButton = caseData.assigned_to && (
                parseInt(currentUser.id) === parseInt(caseData.assigned_to) || 
                currentUser.role === 'admin'
            );
            
            // ✅ NOWE: Generuj zakładki dynamicznie
            let tabsHTML = '';
            if (window.crmManager.renderDynamicCaseTabs) {
                tabsHTML = window.crmManager.renderDynamicCaseTabs(caseData);
            } else {
                // Fallback do statycznych zakładek
                console.warn('⚠️ renderDynamicCaseTabs nie jest dostępne, używam domyślnych zakładek');
                tabsHTML = `
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'details')" id="caseTab_details" class="case-tab" style="flex: 1; padding: 12px; background: white; border: none; border-bottom: 3px solid #667eea; cursor: pointer; font-weight: 600; color: #667eea;">
                        📋 Szczegóły
                    </button>
                    ${caseData.case_type === 'civil' ? `
                        <button onclick="window.crmManager.switchCaseTab(${caseId}, 'civil_details')" id="caseTab_civil_details" class="case-tab" style="flex: 1; padding: 12px; background: transparent; border: none; cursor: pointer; font-weight: 600; color: #666;">
                            📄 Szczegóły cywilne
                        </button>
                    ` : ''}
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'documents')" id="caseTab_documents" class="case-tab" style="flex: 1; padding: 12px; background: transparent; border: none; cursor: pointer; font-weight: 600; color: #666;">
                        📎 Dokumenty (...)
                    </button>
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'events')" id="caseTab_events" class="case-tab" style="flex: 1; padding: 12px; background: transparent; border: none; cursor: pointer; font-weight: 600; color: #666;">
                        📅 Wydarzenia
                    </button>
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'witnesses')" id="caseTab_witnesses" class="case-tab" style="flex: 1; padding: 12px; background: transparent; border: none; cursor: pointer; font-weight: 600; color: #666;">
                        👥 Świadkowie
                    </button>
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'comments')" id="caseTab_comments" class="case-tab" style="flex: 1; padding: 12px; background: transparent; border: none; cursor: pointer; font-weight: 600; color: #666;">
                        💬 Komentarze
                    </button>
                    <button onclick="window.crmManager.switchCaseTab(${caseId}, 'permissions')" id="caseTab_permissions" class="case-tab" style="flex: 1; padding: 12px; background: transparent; border: none; cursor: pointer; font-weight: 600; color: #666;">
                        🔐 Uprawnienia
                    </button>
                `;
            }
            
            // Stwórz modal ze szczegółami - NOWY LAYOUT
            const modal = this.createModal('', `
                <div style="display: flex; height: 100vh;">
                    <!-- Główny obszar z zakładkami -->
                    <div style="flex: 1; display: flex; flex-direction: column;">
                        <!-- Nagłówek z podstawowymi info -->
                        <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center; position: relative; border-bottom: 3px solid #FFD700;">
                            <div>
                                <h3 style="margin: 0; font-size: 1.3rem;">📋 ${this.escapeHtml(caseData.case_number)}</h3>
                                <p style="margin: 5px 0 0 0; opacity: 0.9;">Klient: ${this.escapeHtml(caseData.first_name)} ${this.escapeHtml(caseData.last_name)} • Typ: ${this.escapeHtml(caseData.case_type)}${caseData.is_collective ? ' • <strong>👥 SPRAWA ZBIOROWA</strong>' : ''}</p>
                            </div>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <button onclick="crmManager.closeModal()" style="padding: 8px 16px; background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.5); border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                                    ✕ Zamknij
                                </button>
                            </div>
                        </div>
                        
                        <!-- Zakładki DYNAMICZNE -->
                        <div style="display: flex; justify-content: center; background: #f0f0f0; border-bottom: 2px solid #ddd; flex-wrap: wrap; gap: 2px; padding: 4px; overflow-x: auto;">
                            ${tabsHTML}
                        </div>
                        
                        <!-- Zawartość zakładek -->
                        <div id="caseTabContent" style="flex: 1; overflow-y: auto; padding: 20px; background: white;">
                            <p style="text-align: center; color: #999;">Ładowanie szczegółów...</p>
                        </div>
                    </div>
                    
                    <!-- Aktywator panelu w prawym górnym rogu -->
                    <div id="panelTrigger" style="position: fixed; top: 80px; right: 0; width: 50px; height: 50px; background: linear-gradient(135deg, #FFD700, #d4af37); border-radius: 8px 0 0 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: -2px 2px 10px rgba(255,215,0,0.4); z-index: 9999; border: 2px solid #1a2332;">
                        <span style="font-size: 1.5rem; color: white;">⚡</span>
                    </div>
                    
                    <!-- Panel akcji - CAŁKOWICIE UKRYTY -->
                    <div id="actionsPanel" style="position: fixed; top: 80px; right: -280px; width: 280px; height: calc(100vh - 80px); background: #f9f9f9; padding: 20px; box-shadow: -5px 0 15px rgba(0,0,0,0.3); transition: right 0.3s ease; z-index: 9998; overflow-y: auto;">
                        <h4 style="margin: 0 0 20px 0; color: #1a2332; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                            ⚡ Szybkie akcje
                        </h4>
                        
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <button onclick="showEditCaseModalEnhanced(${caseId})" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.9rem; text-align: left; box-shadow: 0 2px 8px rgba(212,175,55,0.3);">
                                🔄 Aktualizuj informacje
                            </button>
                            ${showReleaseCaseButton ? `
                                <button onclick="window.crmManager.releaseCase(${caseId})" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #ff6b6b, #ee5a6f); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.9rem; text-align: left; box-shadow: 0 2px 8px rgba(255,107,107,0.3);">
                                    ↩️ Oddaj sprawę
                                </button>
                            ` : ''}
                            <button onclick="crmManager.showAddCaseDocument(${caseId})" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; text-align: left; box-shadow: 0 2px 8px rgba(212,175,55,0.3);">
                                📄 Dodaj dokument
                            </button>
                            <button onclick="window.showEnhancedEventForm(${caseId})" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; text-align: left; box-shadow: 0 2px 8px rgba(212,175,55,0.3);">
                                📅 Dodaj wydarzenie
                            </button>
                            <button onclick="crmManager.showAddCaseComment(${caseId})" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; text-align: left; box-shadow: 0 2px 8px rgba(212,175,55,0.3);">
                                💬 Dodaj komentarz
                            </button>
                            <button onclick="aiAssistant.openAIAnalysis(${caseId}, '${this.escapeHtml(caseData.title)}')" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #1a2332, #FFD700); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; text-align: left; box-shadow: 0 2px 8px rgba(255,215,0,0.3);">
                                🤖 AI Asystent
                            </button>
                        </div>
                        
                        <!-- Kod dostępu unikatowy -->
                        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid rgba(255,215,0,0.3);">
                            <div style="background: linear-gradient(135deg, #FFD700, #d4af37); padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 8px rgba(212,175,55,0.3);">
                                <div style="font-size: 0.75rem; color: #1a2332; margin-bottom: 8px; font-weight: 700;">🔐 KOD DOSTĘPU DO SPRAWY</div>
                                <div id="quickAccessCode_${caseId}" style="font-size: 1.5rem; font-weight: 900; color: #1a2332; letter-spacing: 3px; font-family: 'Courier New', monospace; background: rgba(26,35,50,0.1); padding: 10px; border-radius: 6px; margin-bottom: 8px;">${window.generateTodayPassword ? window.generateTodayPassword(caseData.case_number) : 'XXX-000'}</div>
                                <div style="font-size: 0.7rem; color: #1a2332; opacity: 0.85;">
                                    <strong>Unikatowy dla tej sprawy</strong><br/>
                                    <em style="font-size: 0.65rem;">Dostęp bez przypisania</em>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            
            // Załaduj domyślnie zakładkę "Szczegóły" i podłącz panel szybkich akcji
            setTimeout(() => {
                if (window.crmManager && window.crmManager.switchCaseTab) {
                    window.crmManager.switchCaseTab(caseId, 'details');
                }

                // Panel szybkich akcji wysuwany z prawej strony
                const trigger = document.getElementById('panelTrigger');
                const panel = document.getElementById('actionsPanel');
                if (trigger && panel) {
                    const openPanel = () => {
                        panel.style.right = '0';
                    };
                    const closePanel = () => {
                        panel.style.right = '-280px';
                    };

                    trigger.addEventListener('mouseenter', openPanel);
                    trigger.addEventListener('click', openPanel);
                    panel.addEventListener('mouseenter', openPanel);
                    panel.addEventListener('mouseleave', closePanel);
                }

                // Wygeneruj hasło dostępu
                if (window.generateTodayPassword && caseData.case_number) {
                    const passwordElement = document.getElementById('currentCasePassword');
                    if (passwordElement) {
                        const password = window.generateTodayPassword(caseData.case_number);
                        passwordElement.textContent = password;
                        console.log('🔐 Hasło dostępu wygenerowane:', password);
                    }
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ Błąd pobierania sprawy:', error);
            await this.customAlert('Błąd pobierania szczegółów sprawy: ' + error.message, 'error');
        }
    }
    
    async changeCaseStatus(caseId, newStatus) {
        try {
            console.log('🔄 Zmiana statusu sprawy:', caseId, '→', newStatus);
            
            const response = await window.api.request(`/cases/${caseId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            
            if (!response.success) {
                throw new Error(response.message || 'Błąd zmiany statusu');
            }
            
            // Odśwież modal
            this.closeModal();
            await this.viewCase(caseId);
            
            // Odśwież listę spraw
            await this.loadCases();
        } catch (error) {
            console.error('❌ Błąd zmiany statusu:', error);
            await this.customAlert('Błąd zmiany statusu: ' + error.message, 'error');
        }
    }

    // Funkcja do odświeżania tylko listy dokumentów w otwartym modalu sprawy
    async loadCaseDocuments(caseId) {
        try {
            console.log('🔄 Odświeżanie dokumentów dla sprawy:', caseId);
            
            // Pobierz dokumenty sprawy
            const docsResponse = await window.api.request(`/cases/${caseId}/documents`);
            const caseDocuments = Array.isArray(docsResponse.documents) ? docsResponse.documents : [];
            
            console.log('📎 Pobrano dokumentów:', caseDocuments.length);
            
            // Pobierz dane sprawy żeby znać client_id
            const caseResponse = await window.api.request(`/cases/${caseId}`);
            const clientId = caseResponse.case?.client_id;
            
            // Jeśli panel klienta jest otwarty, odśwież też jego pliki
            if (clientId) {
                const clientPanel = document.getElementById('clientDetailsPanel');
                if (clientPanel && clientPanel.style.right === '0px') {
                    console.log('🔄 Odświeżanie plików klienta:', clientId);
                    await this.showClientDetails(clientId);
                }
            }
            
            // Znajdź sekcję dokumentów w modalu i zaktualizuj HTML
            const modal = document.getElementById('crmModal');
            if (!modal) {
                console.warn('⚠️ Modal nie jest otwarty');
                return;
            }
            
            // Znajdź sekcję dokumentów po nagłówku h4
            const documentHeaders = Array.from(modal.querySelectorAll('h4')).filter(h => h.textContent.includes('📎 Dokumenty'));
            
            if (documentHeaders.length === 0) {
                console.warn('⚠️ Nie znaleziono sekcji dokumentów w modalu');
                return;
            }
            
            const documentSection = documentHeaders[0].parentElement;
            
            // Zaktualizuj zawartość sekcji
            documentSection.innerHTML = `
                <h4 style="margin: 0 0 15px 0; color: #1a2332;">📎 Dokumenty (${caseDocuments.length})</h4>
                
                ${caseDocuments.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
                        ${caseDocuments.map(doc => `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: white; border-radius: 6px; border: 1px solid #ddd; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <div style="flex: 1;">
                                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                                        ${(doc.attachment_code || doc.document_number) ? `
                                            <span style="padding: 6px 12px; background: linear-gradient(135deg, #1abc9c, #16a085); color: white; border-radius: 8px; font-size: 0.85rem; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(26, 188, 156, 0.3); white-space: nowrap;">
                                                🔢 ${this.escapeHtml(doc.attachment_code || doc.document_number)}
                                            </span>
                                        ` : `
                                            <span style="padding: 4px 10px; background: #95a5a6; color: white; border-radius: 6px; font-size: 0.75rem; font-style: italic;">
                                                ⚠️ Brak kodu
                                            </span>
                                        `}
                                        ${doc.category && doc.category !== 'general' ? `
                                            <span style="padding: 4px 8px; background: #f0f0f0; color: #666; border-radius: 4px; font-size: 0.7rem; font-weight: 600;">
                                                ${this.escapeHtml(doc.category)}
                                            </span>
                                        ` : ''}
                                    </div>
                                    <div style="font-weight: 600; color: #1a2332; margin-bottom: 3px;">${this.escapeHtml(doc.title)}</div>
                                    <div style="font-size: 0.8rem; color: #999;">
                                        📅 ${new Date(doc.uploaded_at).toLocaleString('pl-PL')} • 📄 ${this.escapeHtml(doc.filename)}
                                        ${doc.uploaded_by_name ? ` • 👤 ${this.escapeHtml(doc.uploaded_by_name)}` : ''}
                                    </div>
                                </div>
                                <div style="display: flex; gap: 5px;">
                                    <button onclick="crmManager.viewDocument(${doc.id}, ${doc.case_id || caseId})" style="padding: 6px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600; margin-right: 5px;">
                                        👁️ Pokaż
                                    </button>
                                    <button onclick="crmManager.downloadDocument(${doc.id}, '${this.escapeHtml(doc.filename)}', ${doc.case_id || caseId})" style="padding: 6px 12px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                        📥 Pobierz
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: #999; text-align: center; padding: 20px;">Brak dokumentów</p>'}
                
                <button onclick="crmManager.showAddCaseDocument(${caseId})" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #f39c12, #e67e22); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    📎 Dodaj dokument
                </button>
            `;
            
            console.log('✅ Dokumenty odświeżone');
            
        } catch (error) {
            console.error('❌ Błąd odświeżania dokumentów:', error);
        }
    }

    showAddClient() {
        const modal = this.createModal('➕ Nowy klient', `
            <form id="addClientForm" style="display: flex; flex-direction: column; gap: 15px; max-width: 90vw; margin: 0 auto;">
                <!-- Dane osobowe -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">Imię *</label>
                        <input type="text" id="firstName" name="first_name" required placeholder="Jan" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">Nazwisko *</label>
                        <input type="text" id="lastName" name="last_name" required placeholder="Kowalski" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">Firma</label>
                        <input type="text" name="company_name" placeholder="Nazwa firmy" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                </div>
                
                <!-- Kontakt -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📧 Email</label>
                        <input type="email" name="email" placeholder="jan@example.com" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📱 Telefon</label>
                        <input type="text" id="phoneInput" name="phone" placeholder="Wpisz: +48 123 456 789" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                </div>
                
                <!-- Adres -->
                <div style="display: grid; grid-template-columns: 2fr 1fr 1.5fr 0.8fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">🏠 Ulica</label>
                        <input type="text" name="street" placeholder="ul. Piękna" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">Nr domu/lok.</label>
                        <input type="text" name="house_number" placeholder="10/5" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">🏙️ Miasto</label>
                        <input type="text" name="city" placeholder="Warszawa" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📮 Kod pocztowy</label>
                        <input type="text" id="postalInput" name="postal_code" placeholder="00-000" maxlength="6" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                </div>
                
                <!-- NIP, REGON, PESEL -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">🔢 NIP</label>
                        <input type="text" id="nipInput" name="nip" placeholder="123-456-78-90" maxlength="13" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">🔢 REGON</label>
                        <input type="text" id="regonInput" name="regon" placeholder="123456789" maxlength="9" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">🔢 PESEL</label>
                        <input type="text" id="peselInput" name="pesel" placeholder="12345678901" maxlength="11" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                </div>
                
                <!-- Opiekun klienta -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">👤 Opiekun klienta *</label>
                    <select id="caretakerSelect" name="assigned_to" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                        <option value="">-- Wybierz opiekuna --</option>
                    </select>
                    <small style="color: #666; font-size: 0.85rem;">Wymagane: Każdy klient musi mieć przypisanego opiekuna</small>
                </div>
                
                <!-- Notatki i dokumenty w jednym rzędzie -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📝 Notatki</label>
                        <textarea name="notes" rows="3" placeholder="Dodatkowe informacje..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; font-size: 1rem;"></textarea>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📎 Dokumenty</label>
                        <input type="file" id="clientDocuments" multiple accept="*/*" style="width: 100%; padding: 10px; border: 2px dashed #f39c12; border-radius: 4px; background: #fff9f0; cursor: pointer; font-size: 0.95rem;">
                        <div id="selectedFilesPreview" style="margin-top: 8px; display: none;">
                            <div id="filesList" style="display: flex; flex-direction: column; gap: 5px; max-height: 80px; overflow-y: auto;"></div>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 15px; border-top: 1px solid #eee;">
                    <button type="button" onclick="crmManager.closeModal()" style="padding: 10px 25px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                        Anuluj
                    </button>
                    <button type="submit" style="padding: 10px 25px; background: linear-gradient(135deg, #FFD700, #FFA500); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 1rem; box-shadow: 0 4px 15px rgba(255,215,0,0.3);">
                        ➕ Dodaj klienta
                    </button>
                </div>
            </form>
        `);
        
        // Auto-formatowanie pól
        this.setupAutoFormatting();
        
        // Załaduj listę opiekunów (caretakers)
        this.loadCaretakersToSelect('caretakerSelect');
        
        // Podgląd wybranych plików
        const filesInput = document.getElementById('clientDocuments');
        if (filesInput) {
            filesInput.addEventListener('change', (e) => {
                const preview = document.getElementById('selectedFilesPreview');
                const filesList = document.getElementById('filesList');
                
                if (e.target.files.length > 0) {
                    preview.style.display = 'block';
                    filesList.innerHTML = '';
                    
                    Array.from(e.target.files).forEach(file => {
                        const fileDiv = document.createElement('div');
                        fileDiv.style.cssText = 'padding: 6px 10px; background: white; border-radius: 4px; border: 1px solid #ddd; font-size: 0.9rem;';
                        fileDiv.innerHTML = `📄 ${this.escapeHtml(file.name)} (${this.formatFileSize(file.size)})`;
                        filesList.appendChild(fileDiv);
                    });
                } else {
                    preview.style.display = 'none';
                }
            });
        }
        
        document.getElementById('addClientForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveClient(e.target);
        });
    }
    
    setupAutoFormatting() {
        // Kod pocztowy: 00-000
        const postalInput = document.getElementById('postalInput');
        if (postalInput) {
            postalInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, ''); // Tylko cyfry
                if (value.length > 2) {
                    value = value.substring(0, 2) + '-' + value.substring(2, 5);
                }
                e.target.value = value;
            });
        }
        
        // NIP: 123-456-78-90
        const nipInput = document.getElementById('nipInput');
        if (nipInput) {
            nipInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, ''); // Tylko cyfry
                if (value.length > 3 && value.length <= 6) {
                    value = value.substring(0, 3) + '-' + value.substring(3);
                } else if (value.length > 6 && value.length <= 8) {
                    value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6);
                } else if (value.length > 8) {
                    value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6, 8) + '-' + value.substring(8, 10);
                }
                e.target.value = value;
            });
        }
        
        // Telefon: tylko formatowanie spacji, NIE dodawaj auto +48
        const phoneInput = document.getElementById('phoneInput');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                let value = e.target.value;
                
                // Usuń wszystkie spacje
                value = value.replace(/\s/g, '');
                
                // Zachowaj + na początku jeśli jest
                const hasPlus = value.startsWith('+');
                const digitsOnly = value.replace(/[^\d]/g, '');
                
                if (hasPlus && digitsOnly.length > 0) {
                    // Format: +XX XXX XXX XXX
                    let formatted = '+';
                    
                    if (digitsOnly.length > 2) {
                        formatted += digitsOnly.substring(0, 2) + ' ';
                        
                        if (digitsOnly.length > 5) {
                            formatted += digitsOnly.substring(2, 5) + ' ';
                            
                            if (digitsOnly.length > 8) {
                                formatted += digitsOnly.substring(5, 8) + ' ';
                                formatted += digitsOnly.substring(8, 11);
                            } else {
                                formatted += digitsOnly.substring(5);
                            }
                        } else {
                            formatted += digitsOnly.substring(2);
                        }
                    } else {
                        formatted += digitsOnly;
                    }
                    
                    value = formatted;
                } else {
                    // Bez +, pozostaw jak jest
                    value = hasPlus ? '+' : value;
                }
                
                e.target.value = value;
            });
        }
        
        // REGON: tylko cyfry, max 9
        const regonInput = document.getElementById('regonInput');
        if (regonInput) {
            regonInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 9);
            });
        }
        
        // PESEL: tylko cyfry, max 11
        const peselInput = document.getElementById('peselInput');
        if (peselInput) {
            peselInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substring(0, 11);
            });
        }
    }
    
    async saveClient(form) {
        try {
            const formData = new FormData(form);
            
            // Połącz ulicę i numer domu
            const street = formData.get('street') || '';
            const houseNumber = formData.get('house_number') || '';
            const fullAddress = street && houseNumber ? `${street} ${houseNumber}` : (street || houseNumber || null);
            
            const clientData = {
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                company_name: formData.get('company_name') || null,
                email: formData.get('email') || null,
                phone: formData.get('phone') || null,
                address_street: fullAddress,
                address_city: formData.get('city') || null,
                address_postal: formData.get('postal_code') || null,
                address_country: 'Polska',
                nip: formData.get('nip') || null,
                pesel: formData.get('pesel') || null,
                notes: formData.get('notes') || null,
                assigned_to: formData.get('assigned_to') || null
            };
            
            console.log('💾 Zapisywanie klienta:', clientData);
            
            const response = await window.api.request('/clients', {
                method: 'POST',
                body: JSON.stringify(clientData)
            });
            
            if (!response.success) {
                throw new Error(response.message || 'Błąd dodawania klienta');
            }
            
            const clientId = response.clientId;
            console.log('✅ Klient dodany, ID:', clientId);
            
            // Upload dokumentów jeśli są
            const filesInput = document.getElementById('clientDocuments');
            if (filesInput && filesInput.files.length > 0) {
                console.log('📎 Uploading', filesInput.files.length, 'plików...');
                
                for (const file of filesInput.files) {
                    try {
                        const fileFormData = new FormData();
                        fileFormData.append('file', file);
                        fileFormData.append('category', 'identity'); // Domyślna kategoria
                        
                        await fetch(`https://web-production-7504.up.railway.app/api/clients/${clientId}/files`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: fileFormData
                        });
                        
                        console.log('✅ Plik dodany:', file.name);
                    } catch (error) {
                        console.error('❌ Błąd uploadu pliku:', file.name, error);
                    }
                }
            }
            
            this.closeModal();
            
            // Odśwież listę klientów
            await this.loadClients();
            
            // Emit event dla dashboardu
            if (window.eventBus) {
                window.eventBus.emit('client:created', { clientId: clientId });
            }
        } catch (error) {
            console.error('❌ Błąd zapisywania klienta:', error);
            await this.customAlert('Błąd dodawania klienta: ' + error.message, 'error');
        }
    }

    async editClient(clientId) {
        alert('Edycja klienta - TODO');
    }

    async viewClientCases(clientId) {
        alert('Sprawy klienta - TODO');
    }

    async deleteClient(clientId) {
        alert('Usuwanie klienta - TODO');
    }
    
    // Dodawanie nowej sprawy
    showAddCase() {
        // Otwórz modal z index.html zamiast tworzyć nowy
        const modal = document.getElementById('caseModal');
        if (modal) {
            modal.classList.add('active');
            
            // Załaduj klientów do selecta
            const clientSelect = document.getElementById('caseClientId');
            if (clientSelect && this.clients) {
                clientSelect.innerHTML = '<option value="">Wybierz klienta...</option>';
                this.clients.forEach(c => {
                    const option = document.createElement('option');
                    option.value = c.id;
                    option.textContent = `${c.first_name} ${c.last_name}${c.company_name ? ' - ' + c.company_name : ''}`;
                    option.dataset.caretaker = c.assigned_to || '';
                    clientSelect.appendChild(option);
                });
                
                // Listener - pokaż opiekuna klienta po wyborze
                clientSelect.addEventListener('change', async (e) => {
                    const selectedOption = e.target.selectedOptions[0];
                    const caretakerId = selectedOption?.dataset.caretaker;
                    const caretakerInput = document.getElementById('caseClientCaretaker');
                    
                    if (caretakerId && caretakerInput) {
                        try {
                            const response = await window.api.request(`/users/${caretakerId}`);
                            if (response.user) {
                                caretakerInput.value = `${response.user.name} (${response.user.email})`;
                            }
                        } catch (error) {
                            caretakerInput.value = 'Nieznany';
                        }
                    } else if (caretakerInput) {
                        caretakerInput.value = '';
                    }
                });
            }
            
            // Załaduj typy spraw do selecta
            if (window.loadCaseTypeOptions) {
                setTimeout(() => {
                    window.loadCaseTypeOptions();
                }, 100);
            }
            
            // Załaduj mecenasów do selecta "Mecenas prowadzący"
            this.loadLawyersToSelect('caseLawyerId');
            
            // Załaduj opiekunów SPRAW do selecta "Dodatkowy opiekun sprawy"
            this.loadCaseManagersToSelect('caseAdditionalCaretaker');
            
            // Wyczyść formularz
            document.getElementById('caseForm')?.reset();
            document.getElementById('caseNumber').value = '';
            
            // ✨ DODAJ EVENT LISTENER DLA FORMULARZA (jeśli jeszcze nie ma)
            const caseForm = document.getElementById('caseForm');
            if (caseForm && !caseForm.dataset.listenerAdded) {
                caseForm.dataset.listenerAdded = 'true';
                caseForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    console.log('📝 Formularz sprawy wysłany!');
                    await this.saveCaseFromModal();
                });
                console.log('✅ Dodano listener do formularza #caseForm');
            }
            
            // 📝 Inicjalizuj Rich Text Editor dla opisu sprawy (modal z index.html)
            if (window.RichTextEditor) {
                setTimeout(() => {
                    const descField = document.getElementById('caseDescription');
                    if (descField) {
                        window.RichTextEditor.init('caseDescription', '');
                        console.log('✅ Rich Text Editor zainicjalizowany dla nowej sprawy (modal z index.html)');
                    }
                }, 300);
            }
            
            return;
        }
        
        // FALLBACK - stary modal (jeśli #caseModal nie istnieje)
        const customModal = this.createModal('📋 Nowa sprawa', `
            <form id="addCaseForm" style="display: flex; flex-direction: column; gap: 15px; max-width: 90vw; margin: 0 auto;">
                <!-- Klient -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">👤 Klient *</label>
                    <select name="client_id" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                        <option value="">Wybierz klienta...</option>
                        ${this.clients.map(c => `
                            <option value="${c.id}">${this.escapeHtml(c.first_name)} ${this.escapeHtml(c.last_name)}${c.company_name ? ' - ' + this.escapeHtml(c.company_name) : ''}</option>
                        `).join('')}
                    </select>
                </div>
                
                <!-- Tytuł i typ -->
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📝 Tytuł sprawy *</label>
                        <input type="text" name="title" required placeholder="np. Sprawa o odszkodowanie" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📁 Typ sprawy *</label>
                        <small style="display: block; margin-bottom: 5px; color: #666; font-style: italic;">(WYBIERZ PODTYP - główny typ zostanie automatycznie przypisany)</small>
                        <select name="case_type" id="caseTypeAddForm" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                            <option value="">Wybierz...</option>
                        </select>
                    </div>
                </div>
                
                <!-- Opis -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📄 Opis sprawy</label>
                    <textarea id="newCaseDescription" name="description" rows="3" placeholder="Szczegółowy opis sprawy..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; font-size: 1rem;"></textarea>
                </div>
                
                <!-- Priorytet i wartość -->
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">🔥 Priorytet</label>
                        <select name="priority" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                            <option value="low">🔵 Niski</option>
                            <option value="medium" selected>🟡 Średni</option>
                            <option value="high">🔴 Wysoki</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">💰 Wartość przedmiotu sporu</label>
                        <input type="number" name="value_amount" placeholder="0.00" step="0.01" min="0" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">Waluta</label>
                        <select name="value_currency" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                            <option value="PLN">PLN</option>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>
                </div>
                
                <!-- Sąd i sygnatura -->
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">🏛️ Sąd</label>
                        <input type="text" name="court_name" placeholder="np. Sąd Okręgowy w Warszawie" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📋 Sygnatura akt</label>
                        <input type="text" name="court_signature" placeholder="np. I C 123/2025" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                </div>
                
                <!-- Strona przeciwna -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">⚔️ Strona przeciwna</label>
                    <input type="text" name="opposing_party" placeholder="Imię i nazwisko / Nazwa firmy strony przeciwnej" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                </div>
                
                <!-- Mecenas prowadzący sprawę -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">👨‍⚖️ Mecenas prowadzący sprawę</label>
                    <select id="lawyerSelect" name="lawyer_id" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                        <option value="">-- Brak (opcjonalnie) --</option>
                    </select>
                    <small style="color: #666; font-size: 0.85rem;">Opcjonalne: Klient ma opiekuna, mecenas może być przypisany później</small>
                </div>
                
                <!-- Dokumenty początkowe -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📎 Dokumenty początkowe sprawy</label>
                    <input type="file" id="caseDocuments" multiple accept="*/*" style="width: 100%; padding: 10px; border: 2px dashed #FFD700; border-radius: 4px; background: #fffef0; cursor: pointer; font-size: 0.95rem;">
                    <div id="selectedCaseFilesPreview" style="margin-top: 8px; display: none;">
                        <div id="caseFilesList" style="display: flex; flex-direction: column; gap: 5px; max-height: 80px; overflow-y: auto;"></div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 15px; border-top: 1px solid #eee;">
                    <button type="button" onclick="crmManager.closeModal()" style="padding: 10px 25px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                        Anuluj
                    </button>
                    <button type="submit" style="padding: 10px 25px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                        📋 Dodaj sprawę
                    </button>
                </div>
            </form>
        `);
        
        // Podgląd wybranych plików
        const filesInput = document.getElementById('caseDocuments');
        if (filesInput) {
            filesInput.addEventListener('change', (e) => {
                const preview = document.getElementById('selectedCaseFilesPreview');
                const filesList = document.getElementById('caseFilesList');
                
                if (e.target.files.length > 0) {
                    preview.style.display = 'block';
                    filesList.innerHTML = '';
                    
                    Array.from(e.target.files).forEach(file => {
                        const fileDiv = document.createElement('div');
                        fileDiv.style.cssText = 'padding: 6px 10px; background: white; border-radius: 4px; border: 1px solid #ddd; font-size: 0.9rem;';
                        fileDiv.innerHTML = `📄 ${this.escapeHtml(file.name)} (${this.formatFileSize(file.size)})`;
                        filesList.appendChild(fileDiv);
                    });
                } else {
                    preview.style.display = 'none';
                }
            });
        }
        
        document.getElementById('addCaseForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveCase(e.target);
        });
        
        // ✨ NOWE: Wypełnij select typami spraw z config
        if (window.loadCaseTypeOptions) {
            setTimeout(() => {
                window.loadCaseTypeOptions();
            }, 100);
        }
        
        // Załaduj listę mecenasów do selecta
        this.loadLawyersToSelect('lawyerSelect');
        
        // 📝 Inicjalizuj Rich Text Editor dla opisu sprawy
        if (window.RichTextEditor) {
            setTimeout(() => {
                // Index.html używa ID "caseDescription", nie "newCaseDescription"
                const descField = document.getElementById('caseDescription');
                if (descField) {
                    window.RichTextEditor.init('caseDescription', '');
                    console.log('✅ Rich Text Editor zainicjalizowany dla nowej sprawy (index.html)');
                } else {
                    // Fallback dla starego modala w crm-clean.js
                    const oldDescField = document.getElementById('newCaseDescription');
                    if (oldDescField) {
                        window.RichTextEditor.init('newCaseDescription', '');
                        console.log('✅ Rich Text Editor zainicjalizowany dla nowej sprawy (crm-clean.js)');
                    }
                }
            }, 200);
        }
    }
    
    // ✨ NOWA METODA: Zapisz sprawę z modala w index.html
    async saveCaseFromModal() {
        try {
            const clientId = document.getElementById('caseClientId').value;
            const caseType = document.getElementById('caseType').value;
            const title = document.getElementById('caseTitle').value;
            
            if (!clientId || !caseType || !title) {
                await this.customAlert('Wypełnij wszystkie wymagane pola!', 'error');
                return;
            }
            
            console.log('🔢 Generowanie numeru sprawy dla klienta:', clientId, 'typ:', caseType);
            
            // 1. Wygeneruj numer sprawy
            const numberResponse = await window.api.request('/cases/generate-number', {
                method: 'POST',
                body: JSON.stringify({
                    client_id: clientId,
                    case_type: caseType
                })
            });
            
            if (!numberResponse.caseNumber) {
                throw new Error('Nie udało się wygenerować numeru sprawy');
            }
            
            const caseNumber = numberResponse.caseNumber;
            console.log('✅ Wygenerowany numer sprawy:', caseNumber);
            
            // 2. Przygotuj dane sprawy
            const caseData = {
                client_id: parseInt(clientId),
                case_number: caseNumber,
                title: title,
                description: document.getElementById('caseDescription')?.value || null,
                case_type: caseType,
                priority: document.getElementById('casePriority')?.value || 'medium',
                status: document.getElementById('caseStatus')?.value || 'open',
                court_name: document.getElementById('caseCourtName')?.value || null,
                court_signature: document.getElementById('caseCourtSignature')?.value || null,
                opposing_party: document.getElementById('caseOpposingParty')?.value || null,
                value_amount: document.getElementById('caseValue')?.value || null,
                assigned_to: document.getElementById('caseLawyerId')?.value || null, // Mecenas prowadzący
                additional_caretaker: document.getElementById('caseAdditionalCaretaker')?.value || null // Dodatkowy opiekun
            };
            
            console.log('💾 Zapisywanie sprawy:', caseData);
            
            // 3. Zapisz sprawę
            const response = await window.api.request('/cases', {
                method: 'POST',
                body: JSON.stringify(caseData)
            });
            
            if (!response.success) {
                throw new Error(response.error || 'Błąd zapisu sprawy');
            }
            
            console.log('✅ Sprawa zapisana! ID:', response.caseId);
            
            // 4. Upload dokumentów jeśli są
            const filesInput = document.getElementById('caseFiles');
            if (filesInput && filesInput.files.length > 0) {
                console.log(`📎 Uploading ${filesInput.files.length} plików...`);
                for (const file of filesInput.files) {
                    try {
                        const fileFormData = new FormData();
                        fileFormData.append('file', file);
                        fileFormData.append('title', file.name);
                        fileFormData.append('category', 'case_document');
                        
                        await fetch(`${window.getApiBaseUrl()}/cases/${response.caseId}/documents`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: fileFormData
                        });
                        console.log(`✅ Plik dodany: ${file.name}`);
                    } catch (error) {
                        console.error(`❌ Błąd uploadu: ${file.name}`, error);
                    }
                }
            }
            
            // 5. Zamknij modal i odśwież
            document.getElementById('caseModal').classList.remove('active');
            document.getElementById('caseForm').reset();
            await this.loadCases();
            await this.customAlert('Sprawa dodana pomyślnie!', 'success');
            
        } catch (error) {
            console.error('❌ Błąd zapisywania sprawy:', error);
            await this.customAlert('Błąd: ' + error.message, 'error');
        }
    }
    
    async saveCase(form) {
        try {
            const formData = new FormData(form);
            
            const clientId = formData.get('client_id');
            const caseType = formData.get('case_type');
            
            // 1. Najpierw wygeneruj unikalny numer sprawy
            console.log('🔢 Generowanie numeru sprawy dla klienta:', clientId, 'typ:', caseType);
            
            const numberResponse = await window.api.request('/cases/generate-number', {
                method: 'POST',
                body: JSON.stringify({
                    client_id: clientId,
                    case_type: caseType
                })
            });
            
            if (!numberResponse.caseNumber) {
                throw new Error('Nie udało się wygenerować numeru sprawy');
            }
            
            const caseNumber = numberResponse.caseNumber;
            console.log('✅ Wygenerowany numer sprawy:', caseNumber);
            
            const caseData = {
                client_id: clientId,
                case_number: caseNumber,
                title: formData.get('title'),
                description: formData.get('description') || null,
                case_type: caseType,
                priority: formData.get('priority') || 'medium',
                court_name: formData.get('court_name') || null,
                court_signature: formData.get('court_signature') || null,
                opposing_party: formData.get('opposing_party') || null,
                value_amount: formData.get('value_amount') || null,
                value_currency: formData.get('value_currency') || 'PLN',
                // Prokuratura
                prosecutor_office: formData.get('prosecutor_office') || null,
                prosecutor_name: formData.get('prosecutor_name') || null,
                prosecutor_address: formData.get('prosecutor_address') || null,
                prosecutor_phone: formData.get('prosecutor_phone') || null,
                prosecutor_email: formData.get('prosecutor_email') || null,
                prosecutor_website: formData.get('prosecutor_website') || null,
                prosecutor_id: formData.get('prosecutor_id') || null,
                indictment_number: formData.get('indictment_number') || null,
                auxiliary_prosecutor: formData.get('auxiliary_prosecutor') || null,
                // Policja
                investigation_authority: formData.get('investigation_authority') || null,
                police_case_number: formData.get('police_case_number') || null,
                police_id: formData.get('police_id') || null,
                police_address: formData.get('police_address') || null,
                police_phone: formData.get('police_phone') || null,
                police_email: formData.get('police_email') || null,
                police_website: formData.get('police_website') || null,
                status: 'open',
                assigned_to: formData.get('lawyer_id') || null
            };
            
            console.log('💾 Dane policji do zapisu:', {
                police_id: caseData.police_id,
                investigation_authority: caseData.investigation_authority,
                police_address: caseData.police_address,
                police_phone: caseData.police_phone,
                police_email: caseData.police_email,
                police_website: caseData.police_website
            });
            
            console.log('💾 Zapisywanie sprawy:', caseData);
            
            const response = await window.api.request('/cases', {
                method: 'POST',
                body: JSON.stringify(caseData)
            });
            
            if (!response.success) {
                throw new Error(response.message || 'Błąd dodawania sprawy');
            }
            
            const caseId = response.caseId;
            console.log('✅ Sprawa zapisana, ID:', caseId);
            const accessPassword = response.access_password; // 🔑 HASŁO DOSTĘPU!
            console.log('🔑 Hasło dostępu do sprawy:', accessPassword);
            
            // Zapisz aktualną sprawę (potrzebne dla sendPasswordToChat)
            this.currentCase = {
                id: caseId,
                case_number: caseNumber,
                title: caseData.title,
                ...caseData
            };
            
            // Upload plików jeśli są wybrane
            const filesInput = document.getElementById('caseDocuments');
            if (filesInput && filesInput.files.length > 0) {
                console.log('📎 Uploading', filesInput.files.length, 'plików do sprawy', caseId);
                
                for (const file of filesInput.files) {
                    try {
                        const fileFormData = new FormData();
                        fileFormData.append('file', file);
                        fileFormData.append('title', file.name); // Dodaj tytuł!
                        fileFormData.append('description', 'Dokument początkowy sprawy');
                        fileFormData.append('category', 'initial_document');
                        
                        const token = localStorage.getItem('token');
                        const uploadResponse = await fetch(`${window.getApiBaseUrl()}/cases/${caseId}/documents`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            body: fileFormData
                        });
                        
                        const uploadResult = await uploadResponse.json();
                        
                        if (!uploadResult.success) {
                            console.error('❌ Błąd uploadu pliku:', file.name, uploadResult.message);
                        } else {
                            console.log('✅ Plik uploadowany:', file.name);
                        }
                    } catch (uploadError) {
                        console.error('❌ Błąd uploadu pliku:', file.name, uploadError);
                    }
                }
            }
            
            this.closeModal();
            
            // Odśwież listę spraw
            await this.loadCases();
            
            // 🔐 POKAŻ HASŁO DOSTĘPU DO SPRAWY
            if (accessPassword) {
                this.showCasePasswordModal(caseNumber, accessPassword, caseId);
            }
        } catch (error) {
            console.error('❌ Błąd zapisywania sprawy:', error);
            await this.customAlert('Błąd dodawania sprawy: ' + error.message, 'error');
        }
    }

    async deleteCase(caseId, caseNumber) {
        try {
            // Sprawdź czy użytkownik jest adminem
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || localStorage.getItem('user') || '{}');
            const isAdmin = currentUser.role === 'admin' || currentUser.user_role === 'admin';
            
            if (!isAdmin) {
                await this.customAlert('❌ Brak uprawnień! Tylko administrator może usuwać sprawy.', 'error');
                return;
            }
            
            // Pobierz dane sprawy
            const caseResponse = await window.api.request(`/cases/${caseId}`);
            const caseData = caseResponse.case;
            
            if (!caseData) {
                await this.customAlert('Nie znaleziono sprawy', 'error');
                return;
            }
            
            // Potwierdzenie usunięcia
            const confirmed = await this.customConfirm(
                `Czy na pewno chcesz usunąć sprawę:\n\n${caseNumber}\n${caseData.title}\n\nKlient: ${caseData.first_name} ${caseData.last_name}\n\n⚠️ Ta operacja jest nieodwracalna!`
            );
            
            if (!confirmed) {
                return;
            }
            
            // Zapytaj o hasło administratora
            const password = await this.customPrompt('Wprowadź hasło administratora aby potwierdzić usunięcie:', 'password');
            
            if (!password) {
                await this.customAlert('Usuwanie anulowane', 'info');
                return;
            }
            
            console.log('🗑️ Usuwanie sprawy:', caseId);
            
            // Wyślij request z hasłem w nagłówku
            const response = await window.api.request(`/cases/${caseId}`, {
                method: 'DELETE',
                headers: {
                    'X-Admin-Password': password
                }
            });
            
            if (!response.success) {
                throw new Error(response.error || 'Błąd usuwania sprawy');
            }
            
            await this.customAlert(`✅ Sprawa ${caseNumber} została usunięta`, 'success');
            
            // Odśwież listę spraw
            await this.loadCases();
            
        } catch (error) {
            console.error('❌ Błąd usuwania sprawy:', error);
            
            if (error.message.includes('401')) {
                await this.customAlert('❌ Nieprawidłowe hasło administratora!', 'error');
            } else if (error.message.includes('403')) {
                await this.customAlert('❌ Brak uprawnień! Tylko administrator może usuwać sprawy.', 'error');
            } else {
                await this.customAlert('❌ Błąd usuwania sprawy: ' + error.message, 'error');
            }
        }
    }
    
    // Funkcje dokumentów spraw
    showAddCaseDocument(caseId) {
        // Usuń stary modal dokumentu jeśli istnieje
        const oldDocModal = document.getElementById('addDocumentModal');
        if (oldDocModal) oldDocModal.remove();
        
        const modal = document.createElement('div');
        modal.id = 'addDocumentModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.7); z-index: 10002; display: flex; justify-content: center; align-items: center; padding: 20px;';
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; width: 90vw; max-width: 700px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <div style="padding: 20px; border-bottom: 2px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #f39c12, #e67e22); border-radius: 12px 12px 0 0;">
                    <h3 style="margin: 0; color: white;">📎 Dodaj dokument do sprawy</h3>
                    <button onclick="document.getElementById('addDocumentModal').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2rem;">✕</button>
                </div>
                <div style="padding: 20px;">`
        
        + `
            <form id="addCaseDocumentForm" style="display: flex; flex-direction: column; gap: 15px;">
                <input type="hidden" name="case_id" value="${caseId}">
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">Tytuł dokumentu *</label>
                    <input type="text" name="title" required placeholder="np. Pozew, Umowa, Faktura..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📂 Kategoria dokumentu *</label>
                    <select name="category" required style="width: 100%; padding: 10px; border: 2px solid #9c27b0; border-radius: 6px; background: white; cursor: pointer; font-size: 14px;">
                        <option value="">-- Wybierz kategorię --</option>
                        <optgroup label="📋 Dokumenty procesowe">
                            <option value="POZ">📄 Pozew (POZ)</option>
                            <option value="ODP">📝 Odpowiedź na pozew (ODP)</option>
                            <option value="WNI">📑 Wniosek (WNI)</option>
                            <option value="ZAL">📎 Załącznik (ZAL)</option>
                            <option value="ODW">🔄 Odwołanie (ODW)</option>
                            <option value="ZAZ">⚡ Zażalenie (ZAZ)</option>
                        </optgroup>
                        <optgroup label="⚖️ Orzeczenia">
                            <option value="WYR">⚖️ Wyrok (WYR)</option>
                            <option value="POS">📋 Postanowienie (POS)</option>
                            <option value="NAK">📜 Nakaz zapłaty (NAK)</option>
                            <option value="UZA">✅ Uzasadnienie (UZA)</option>
                        </optgroup>
                        <optgroup label="💼 Umowy i dokumenty">
                            <option value="UMO">💼 Umowa (UMO)</option>
                            <option value="FAK">💰 Faktura (FAK)</option>
                            <option value="RAC">🧾 Rachunek (RAC)</option>
                            <option value="PRZ">📤 Przelew (PRZ)</option>
                            <option value="KOR">📧 Korespondencja (KOR)</option>
                        </optgroup>
                        <optgroup label="📨 Poczta i zawiadomienia">
                            <option value="POC">📨 Poczta (POC)</option>
                            <option value="ZAW">📬 Zawiadomienie (ZAW)</option>
                            <option value="WEZ">📞 Wezwanie (WEZ)</option>
                        </optgroup>
                        <optgroup label="💬 Komunikacja cyfrowa">
                            <option value="WAP">💬 WhatsApp - konwersacja (WAP)</option>
                            <option value="WAV">🎤 WhatsApp - wiadomość głosowa (WAV)</option>
                            <option value="SMS">📱 SMS (SMS)</option>
                            <option value="MMS">📲 MMS (MMS)</option>
                            <option value="EML">📧 Email (EML)</option>
                            <option value="MSG">💬 Messenger (MSG)</option>
                            <option value="TGM">✈️ Telegram (TGM)</option>
                            <option value="SIG">🔒 Signal (SIG)</option>
                        </optgroup>
                        <optgroup label="📱 Social Media">
                            <option value="FB">📘 Facebook - post/komentarz (FB)</option>
                            <option value="IG">📸 Instagram - post/stories (IG)</option>
                            <option value="TW">🐦 Twitter/X - tweet (TW)</option>
                            <option value="LI">💼 LinkedIn - post (LI)</option>
                            <option value="TT">🎵 TikTok (TT)</option>
                            <option value="YT">▶️ YouTube - komentarz (YT)</option>
                        </optgroup>
                        <optgroup label="📸 Zrzuty ekranu i screenshoty">
                            <option value="SCR">📱 Screenshot telefonu (SCR)</option>
                            <option value="SCP">💻 Screenshot komputera (SCP)</option>
                            <option value="SCW">🌐 Screenshot strony WWW (SCW)</option>
                            <option value="SCA">📱 Screenshot aplikacji (SCA)</option>
                        </optgroup>
                        <optgroup label="🎥 Multimedia">
                            <option value="ZDJ">📸 Zdjęcie (ZDJ)</option>
                            <option value="NAG">🎥 Nagranie wideo (NAG)</option>
                            <option value="AUD">🎤 Nagranie audio (AUD)</option>
                            <option value="VOC">🗣️ Wiadomość głosowa (VOC)</option>
                            <option value="VID">📹 Nagranie ekranu (VID)</option>
                        </optgroup>
                        <optgroup label="🔬 Ekspertyzy i analizy">
                            <option value="EKS">🔬 Ekspertyza (EKS)</option>
                            <option value="OPI">📊 Opinia biegłego (OPI)</option>
                            <option value="RAP">📋 Raport (RAP)</option>
                            <option value="ANA">📈 Analiza (ANA)</option>
                        </optgroup>
                        <optgroup label="📂 Inne">
                            <option value="NOT">📝 Notatka (NOT)</option>
                            <option value="LOG">📋 Logi systemowe (LOG)</option>
                            <option value="GPS">📍 Dane GPS/lokalizacja (GPS)</option>
                            <option value="BIL">📊 Billing telefoniczny (BIL)</option>
                            <option value="INN">📂 Inny dokument (INN)</option>
                        </optgroup>
                    </select>
                    <small style="color: #9c27b0; font-size: 0.75rem;">💡 Kategoria wpłynie na numerację: DOK/[KATEGORIA]/... (np. DOK/POZ/CYW/JK/001/001)</small>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📎 Wybierz plik *</label>
                    <input type="file" name="file" required accept="*/*" style="width: 100%; padding: 10px; border: 2px solid #f39c12; border-radius: 6px; background: white; cursor: pointer; font-size: 14px;">
                    <small style="color: #999; font-size: 0.75rem;">📄 Dokumenty: PDF, DOC, DOCX, TXT, XLS, XLSX | 📸 Obrazy: JPG, PNG, GIF, WEBP | 🎥 Wideo: MP4, MOV, AVI | 🎤 Audio: MP3, WAV, OGG, M4A</small>
                </div>
                
                <div style="background: #fffbf0; padding: 15px; border-radius: 8px; border: 2px solid #f39c12;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 700; color: #1a2332; font-size: 1rem;">📝 Opis dokumentu</label>
                    <textarea name="description" rows="4" placeholder="Wpisz opis dokumentu, np.:&#10;Faktura 68/07/2024 - 2 200,00 EUR&#10;Termin: 27.07.2024&#10;Odsetki: 310,44 EUR" style="width: 100%; padding: 12px; border: 2px solid #d4af37; border-radius: 6px; resize: vertical; font-size: 14px; line-height: 1.5; background: white;"></textarea>
                    <small style="color: #666; font-size: 0.8rem; margin-top: 5px; display: block;">💡 Opis będzie widoczny na liście dokumentów</small>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 15px; border-top: 1px solid #eee;">
                    <button type="button" onclick="document.getElementById('addDocumentModal').remove()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        Anuluj
                    </button>
                    <button type="submit" style="padding: 10px 20px; background: linear-gradient(135deg, #f39c12, #e67e22); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        📎 Dodaj dokument
                    </button>
                </div>
            </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('addCaseDocumentForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveCaseDocument(caseId, e.target);
        });
    }
    
    async saveCaseDocument(caseId, form) {
        try {
            const formData = new FormData(form);
            const docTitle = formData.get('title');
            const docDescription = formData.get('description');
            const docCategory = formData.get('category');
            const docFile = formData.get('file');
            
            console.log('📎 Dodawanie dokumentu do sprawy:', caseId);
            console.log('   - Tytuł:', docTitle);
            console.log('   - Kategoria:', docCategory);
            console.log('   - Plik:', docFile ? docFile.name : 'BRAK');
            console.log('   - Token:', localStorage.getItem('token') ? 'OK' : 'BRAK');
            
            const apiUrl = window.api?.baseURL || 'https://web-production-7504.up.railway.app/api';
            console.log('   - API URL:', apiUrl);
            
            const response = await fetch(`${apiUrl}/cases/${caseId}/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            
            console.log('   - Response status:', response.status);
            
            const data = await response.json();
            console.log('   - Response data:', data);
            
            if (!response.ok) {
                throw new Error(data.error || data.message || 'Błąd dodawania dokumentu');
            }
            
            // Pokaż krótką informację w formularzu (bez alertu)
            const successInfo = document.createElement('div');
            successInfo.style.cssText = 'background: #d4edda; color: #155724; padding: 10px 15px; border-radius: 6px; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; animation: fadeIn 0.3s;';
            successInfo.innerHTML = `
                <span style="font-size: 1.2rem;">✅</span>
                <div>
                    <strong>Dodano: ${this.escapeHtml(docTitle)}</strong>
                    ${docDescription ? `<br><small style="color: #666;">${this.escapeHtml(docDescription)}</small>` : ''}
                </div>
            `;
            
            // Wstaw info na górze formularza
            const formElement = document.getElementById('addCaseDocumentForm');
            if (formElement) {
                formElement.insertBefore(successInfo, formElement.firstChild);
                
                // Usuń info po 3 sekundach
                setTimeout(() => successInfo.remove(), 3000);
                
                // Wyczyść pola formularza (oprócz case_id)
                formElement.querySelector('input[name="title"]').value = '';
                formElement.querySelector('textarea[name="description"]').value = '';
                formElement.querySelector('input[name="file"]').value = '';
                formElement.querySelector('select[name="category"]').selectedIndex = 0;
            }
            
            console.log('✅ Dokument dodany, formularz wyczyszczony');
        } catch (error) {
            console.error('❌ Błąd dodawania dokumentu:', error);
            await this.customAlert('Błąd dodawania dokumentu: ' + error.message, 'error');
        }
    }
    
    async downloadCaseDocument(caseId, documentId) {
        try {
            const token = localStorage.getItem('token');
            
            console.log('📥 Pobieranie dokumentu:', documentId);
            
            const response = await fetch(`${window.getApiBaseUrl()}/cases/${caseId}/documents/${documentId}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Błąd pobierania dokumentu');
            }
            
            // Pobierz nazwę pliku z nagłówka
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'dokument';
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?(.+)"?/);
                if (match) filename = match[1];
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            console.log('✅ Dokument pobrany');
        } catch (error) {
            console.error('❌ Błąd pobierania dokumentu:', error);
            await this.customAlert('Błąd pobierania dokumentu: ' + error.message, 'error');
        }
    }

    // KROK 4: Funkcje kontaktu z klientem
    callClient(phone) {
        if (!phone) {
            alert('Brak numeru telefonu!');
            return;
        }
        // Otwórz link tel: (wymaga aplikacji desktop lub telefon)
        window.location.href = `tel:${phone}`;
    }

    whatsappClient(phone) {
        if (!phone) {
            alert('Brak numeru telefonu!');
            return;
        }
        // Usuń spacje i znaki specjalne
        const cleanPhone = phone.replace(/\D/g, '');
        // Otwórz WhatsApp Web
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    }

    emailClient(email) {
        if (!email) {
            alert('Brak adresu email!');
            return;
        }
        
        // Zamknij panel szczegółów klienta
        this.closeClientPanel();
        
        // Przełącz na widok Poczta
        const mailView = document.getElementById('mailView');
        const crmView = document.getElementById('crmView');
        
        if (mailView && crmView) {
            // Ukryj wszystkie widoki
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            
            // Pokaż widok poczty
            mailView.classList.add('active');
            
            // Zaktualizuj nawigację
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.view === 'mail');
            });
            
            // Otwórz okno nowego emaila z wypełnionym adresatem
            setTimeout(() => {
                if (window.mailManager) {
                    window.mailManager.showNewMailModal();
                    // Wypełnij pole "Do:"
                    document.getElementById('mailTo').value = email;
                }
            }, 300);
        }
    }

    chatWithClient(clientId, clientName) {
        // Otwórz mini panel czatu
        this.openMiniChat(clientId, clientName);
    }

    openMiniChat(clientId, clientName) {
        // Utwórz mini panel czatu (jeśli nie istnieje)
        let chatPanel = document.getElementById('miniChatPanel');
        if (!chatPanel) {
            chatPanel = document.createElement('div');
            chatPanel.id = 'miniChatPanel';
            chatPanel.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 400px;
                height: 500px;
                background: white;
                box-shadow: 0 5px 20px rgba(0,0,0,0.3);
                border-radius: 12px;
                z-index: 10001;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            `;
            document.body.appendChild(chatPanel);
        }
        
        // Wypełnij zawartość
        chatPanel.innerHTML = `
            <div style="background: linear-gradient(135deg, #9c27b0, #7b1fa2); color: white; padding: 15px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-weight: 600; font-size: 1rem;">💬 Czat z ${this.escapeHtml(clientName)}</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">Wpisz wiadomość...</div>
                </div>
                <button onclick="crmManager.closeMiniChat()" style="background: rgba(255,255,255,0.2); color: white; border: none; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 16px;">✕</button>
            </div>
            
            <div id="miniChatMessages" style="flex: 1; padding: 15px; overflow-y: auto; background: #f5f5f5;">
                <div style="text-align: center; color: #999; padding: 20px;">
                    <p>💬 Rozpocznij rozmowę z ${this.escapeHtml(clientName)}</p>
                    <p style="font-size: 0.85rem; margin-top: 10px;">Wiadomości będą zapisywane w systemie</p>
                </div>
            </div>
            
            <div style="padding: 15px; border-top: 1px solid #e0e0e0; display: flex; gap: 10px;">
                <input 
                    type="text" 
                    id="miniChatInput" 
                    placeholder="Wpisz wiadomość..." 
                    style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem;"
                    onkeypress="if(event.key==='Enter') crmManager.sendMiniChatMessage(${clientId}, '${this.escapeHtml(clientName)}')"
                >
                <button 
                    onclick="crmManager.sendMiniChatMessage(${clientId}, '${this.escapeHtml(clientName)}')" 
                    style="padding: 10px 20px; background: #9c27b0; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;"
                >
                    Wyślij
                </button>
            </div>
        `;
        
        // Pokaż panel
        chatPanel.style.display = 'flex';
    }

    sendMiniChatMessage(clientId, clientName) {
        const input = document.getElementById('miniChatInput');
        const message = input.value.trim();
        
        if (!message) return;
        
        // Dodaj wiadomość do widoku
        const messagesContainer = document.getElementById('miniChatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = 'margin-bottom: 12px; text-align: right;';
        messageDiv.innerHTML = `
            <div style="display: inline-block; background: #9c27b0; color: white; padding: 10px 15px; border-radius: 12px 12px 0 12px; max-width: 70%; text-align: left;">
                ${this.escapeHtml(message)}
            </div>
            <div style="font-size: 0.75rem; color: #999; margin-top: 3px;">
                ${new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Wyczyść input
        input.value = '';
        
        // TODO: Wysłać wiadomość do backendu
        // await window.api.request('/chat/send', {
        //     method: 'POST',
        //     body: JSON.stringify({ clientId, message })
        // });
    }

    closeMiniChat() {
        const chatPanel = document.getElementById('miniChatPanel');
        if (chatPanel) {
            chatPanel.style.display = 'none';
        }
    }

    // KROK 4: Dodawanie plików klienta
    async showAddClientFile(clientId) {
        // Pobierz sprawy klienta
        let clientCases = [];
        console.log('🔍 Loading cases for client:', clientId);
        try {
            if (!window.api) {
                console.error('❌ window.api is not defined!');
                clientCases = [];
            } else {
                console.log('✅ window.api exists, making request...');
                const casesResponse = await window.api.request(`/cases?client_id=${clientId}`);
                console.log('✅ Cases response received:', casesResponse);
                console.log('Cases array type:', typeof casesResponse.cases);
                console.log('Cases array isArray:', Array.isArray(casesResponse.cases));
                console.log('Cases array:', casesResponse.cases);
                clientCases = Array.isArray(casesResponse.cases) ? casesResponse.cases : [];
                console.log('Final clientCases length:', clientCases.length);
            }
        } catch (error) {
            console.error('❌ Error loading cases:', error);
            clientCases = [];
        }
        
        console.log('🎨 Creating modal with clientCases:', clientCases);
        
        const modal = this.createModal('Dodaj plik dla klienta', `
            <form id="addClientFileForm" style="display: flex; flex-direction: column; gap: 15px;">
                <input type="hidden" name="client_id" value="${clientId}">
                
                ${clientCases.length > 0 ? `
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Przypisz do sprawy (opcjonalnie):</label>
                        <select name="case_id" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Brak - tylko do klienta</option>
                            ${clientCases.map(c => `
                                <option value="${c.id}">${this.escapeHtml(c.case_number)} - ${this.escapeHtml(c.title)}</option>
                            `).join('')}
                        </select>
                    </div>
                ` : ''}
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📂 Kategoria dokumentu *</label>
                    <select name="category" required style="width: 100%; padding: 10px; border: 2px solid #9c27b0; border-radius: 6px; background: white; cursor: pointer; font-size: 14px;">
                        <option value="">-- Wybierz kategorię --</option>
                        <optgroup label="📋 Dokumenty procesowe">
                            <option value="POZ">📄 Pozew (POZ)</option>
                            <option value="ODP">📝 Odpowiedź na pozew (ODP)</option>
                            <option value="WNI">📑 Wniosek (WNI)</option>
                            <option value="ZAL">📎 Załącznik (ZAL)</option>
                            <option value="ODW">🔄 Odwołanie (ODW)</option>
                            <option value="ZAZ">⚡ Zażalenie (ZAZ)</option>
                        </optgroup>
                        <optgroup label="⚖️ Orzeczenia">
                            <option value="WYR">⚖️ Wyrok (WYR)</option>
                            <option value="POS">📋 Postanowienie (POS)</option>
                            <option value="NAK">📜 Nakaz zapłaty (NAK)</option>
                            <option value="UZA">✅ Uzasadnienie (UZA)</option>
                        </optgroup>
                        <optgroup label="💼 Umowy i dokumenty">
                            <option value="UMO">💼 Umowa (UMO)</option>
                            <option value="FAK">💰 Faktura (FAK)</option>
                            <option value="RAC">🧾 Rachunek (RAC)</option>
                            <option value="PRZ">📤 Przelew (PRZ)</option>
                            <option value="KOR">📧 Korespondencja (KOR)</option>
                        </optgroup>
                        <optgroup label="📨 Poczta i zawiadomienia">
                            <option value="POC">📨 Poczta (POC)</option>
                            <option value="ZAW">📬 Zawiadomienie (ZAW)</option>
                            <option value="WEZ">📞 Wezwanie (WEZ)</option>
                        </optgroup>
                        <optgroup label="📸 Dowody">
                            <option value="ZDJ">📸 Zdjęcie (ZDJ)</option>
                            <option value="NAG">🎥 Nagranie (NAG)</option>
                            <option value="EKS">🔬 Ekspertyza (EKS)</option>
                        </optgroup>
                        <optgroup label="🪪 Dokumenty osobiste">
                            <option value="DOW">🪪 Dowód osobisty (DOW)</option>
                            <option value="PAS">📘 Paszport (PAS)</option>
                            <option value="PRA">🚗 Prawo jazdy (PRA)</option>
                        </optgroup>
                        <optgroup label="📂 Inne">
                            <option value="NOT">📝 Notatka (NOT)</option>
                            <option value="INN">📂 Inny dokument (INN)</option>
                        </optgroup>
                    </select>
                    <small style="color: #9c27b0; font-size: 0.75rem;">💡 Kategoria wpłynie na numer dokumentu klienta</small>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">📎 Wybierz plik:</label>
                    <input type="file" name="file" required accept="*/*" style="width: 100%; padding: 10px; border: 2px solid #f39c12; border-radius: 4px; background: white; cursor: pointer; font-size: 14px;">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Opis (opcjonalnie):</label>
                    <textarea name="description" rows="3" placeholder="Dodaj opis dokumentu..." style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" onclick="crmManager.closeModal()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Anuluj
                    </button>
                    <button type="submit" style="padding: 10px 20px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                        📎 Dodaj plik
                    </button>
                </div>
            </form>
        `);
        
        console.log('🎨 Modal created, form HTML length:', modal.innerHTML.length);

        document.getElementById('addClientFileForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveClientFile(clientId, e.target);
        });
    }

    async saveClientFile(clientId, form) {
        console.log('💾 saveClientFile called for client:', clientId);
        try {
            const formData = new FormData(form);
            const token = localStorage.getItem('token');
            
            console.log('💾 FormData entries:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}:`, value instanceof File ? `File(${value.name})` : value);
            }
            
            console.log('💾 Token:', token ? 'EXISTS' : 'MISSING');
            console.log('💾 Sending POST to:', `${window.getApiBaseUrl()}/clients/${clientId}/files`);
            
            // Wysyłka do backendu
            const response = await fetch(`${window.getApiBaseUrl()}/clients/${clientId}/files`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            console.log('💾 Response status:', response.status);
            console.log('💾 Response ok:', response.ok);
            
            const data = await response.json();
            console.log('💾 Response data:', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'Błąd uploadu pliku');
            }
            
            console.log('✅ Plik dodany pomyślnie, odświeżam panel...');
            this.closeModal();
            
            // Odśwież panel klienta
            await this.showClientDetails(clientId);
        } catch (error) {
            console.error('❌ saveClientFile error:', error);
            await this.customAlert('Błąd dodawania pliku: ' + error.message, 'error');
        }
    }

    // KROK 4: Dodawanie notatek o kliencie
    showAddClientNote(clientId) {
        const modal = this.createModal('Dodaj notatkę o kliencie', `
            <form id="addClientNoteForm" style="display: flex; flex-direction: column; gap: 15px;">
                <input type="hidden" name="client_id" value="${clientId}">
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Treść notatki:</label>
                    <textarea name="content" required rows="5" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" placeholder="Wpisz notatkę o kliencie..."></textarea>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" onclick="crmManager.closeModal()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Anuluj
                    </button>
                    <button type="submit" style="padding: 10px 20px; background: #9c27b0; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                        📝 Dodaj notatkę
                    </button>
                </div>
            </form>
        `);

        document.getElementById('addClientNoteForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveClientNote(clientId, e.target);
        });
    }

    async saveClientNote(clientId, form) {
        try {
            const formData = new FormData(form);
            const content = formData.get('content');

            console.log('💾 Zapisuję notatkę dla klienta:', clientId, 'Treść:', content);

            // Wysyłka do backendu
            const response = await window.api.request(`/clients/${clientId}/notes`, {
                method: 'POST',
                body: JSON.stringify({ content })
            });
            
            console.log('📨 Odpowiedź z serwera:', response);
            
            if (!response.success) {
                throw new Error(response.message || 'Błąd dodawania notatki');
            }
            
            console.log('✅ Notatka dodana, odświeżam panel...');
            this.closeModal();
            
            // Odśwież panel klienta
            await this.showClientDetails(clientId);
        } catch (error) {
            console.error('❌ Błąd zapisywania notatki:', error);
            await this.customAlert('Błąd dodawania notatki: ' + error.message, 'error');
        }
    }
    
    // Toggle komentarzy do notatki
    async toggleNoteComments(noteId) {
        const commentsDiv = document.getElementById(`comments_${noteId}`);
        const toggleBtn = document.getElementById(`toggleComments_${noteId}`);
        
        if (commentsDiv.style.display === 'none') {
            // Pokaż komentarze
            commentsDiv.style.display = 'block';
            toggleBtn.textContent = '✕ Ukryj';
            
            // Załaduj komentarze
            await this.loadNoteComments(noteId);
            
            // Dodaj listener do formularza
            const form = document.getElementById(`commentForm_${noteId}`);
            if (form && !form.hasAttribute('data-listener')) {
                form.setAttribute('data-listener', 'true');
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.saveNoteComment(noteId, e.target);
                });
            }
        } else {
            // Ukryj komentarze
            commentsDiv.style.display = 'none';
            toggleBtn.textContent = '💬 Komentarze';
        }
    }
    
    async loadNoteComments(noteId) {
        try {
            console.log('💬 Ładowanie komentarzy dla notatki:', noteId);
            
            const response = await window.api.request(`/notes/${noteId}/comments`);
            const comments = response.comments || [];
            
            const commentsList = document.getElementById(`commentsList_${noteId}`);
            if (comments.length > 0) {
                commentsList.innerHTML = comments.map(c => `
                    <div style="background: #f5f5f5; padding: 10px; border-radius: 4px; border-left: 3px solid #9c27b0;">
                        <p style="margin: 0 0 6px 0; color: #333; font-size: 0.9rem;">${this.escapeHtml(c.comment)}</p>
                        <small style="color: #999; font-size: 0.75rem;">
                            ${this.escapeHtml(c.author_name || 'Nieznany')} - ${new Date(c.created_at).toLocaleString('pl-PL')}
                        </small>
                    </div>
                `).join('');
            } else {
                commentsList.innerHTML = '<p style="color: #999; font-size: 0.85rem; text-align: center; margin: 0;">Brak komentarzy</p>';
            }
        } catch (error) {
            console.error('❌ Błąd ładowania komentarzy:', error);
            document.getElementById(`commentsList_${noteId}`).innerHTML = '<p style="color: #dc3545; font-size: 0.85rem; text-align: center; margin: 0;">Błąd ładowania komentarzy</p>';
        }
    }
    
    async saveNoteComment(noteId, form) {
        try {
            const formData = new FormData(form);
            const comment = formData.get('comment');
            
            console.log('💾 Zapisywanie komentarza do notatki:', noteId);
            
            const response = await window.api.request(`/notes/${noteId}/comments`, {
                method: 'POST',
                body: JSON.stringify({ comment })
            });
            
            if (!response.success) {
                throw new Error(response.message || 'Błąd dodawania komentarza');
            }
            
            // Wyczyść formularz
            form.reset();
            
            // Odśwież listę komentarzy
            await this.loadNoteComments(noteId);
            
            // Automatycznie ukryj komentarze po dodaniu
            const commentsDiv = document.getElementById(`comments_${noteId}`);
            const toggleBtn = document.getElementById(`toggleComments_${noteId}`);
            commentsDiv.style.display = 'none';
            toggleBtn.textContent = '💬 Komentarze';
            
        } catch (error) {
            console.error('❌ Błąd zapisywania komentarza:', error);
            await this.customAlert('Błąd dodawania komentarza: ' + error.message, 'error');
        }
    }

    // Helper: Tworzenie modala
    createModal(title, content) {
        // Usuń stary modal jeśli istnieje
        const oldModal = document.getElementById('crmModal');
        if (oldModal) oldModal.remove();

        const modal = document.createElement('div');
        modal.id = 'crmModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 0; width: 100vw; height: 100vh; overflow-y: auto; box-sizing: border-box; display: flex; flex-direction: column;">
                ${title ? `
                    <div style="padding: 20px; border-bottom: 2px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                        <h3 style="margin: 0; color: #1a2332;">${title}</h3>
                        <div id="modalHeaderButtons" style="display: flex; gap: 10px;"></div>
                    </div>
                ` : ''}
                <div style="flex: 1; padding: ${title ? '20px' : '0'}; overflow-y: auto;">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Zamknij modal przy kliknięciu w tło
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        return modal;
    }

    closeModal() {
        const modal = document.getElementById('crmModal');
        if (modal) modal.remove();
    }

    // Helper: Pobieranie pliku
    async downloadFile(clientId, fileId) {
        try {
            const token = localStorage.getItem('token');
            
            console.log('⬇️ Pobieranie pliku:', fileId, 'dla klienta:', clientId);
            
            const response = await fetch(`${window.getApiBaseUrl()}/clients/${clientId}/files/${fileId}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Błąd pobierania pliku');
            }
            
            // Pobierz blob z pliku
            const blob = await response.blob();
            
            // Pobierz nazwę pliku z nagłówka Content-Disposition
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = 'plik';
            if (contentDisposition) {
                const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
                if (matches != null && matches[1]) {
                    filename = matches[1].replace(/['"]/g, '');
                }
            }
            
            // Utwórz link do pobrania
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            console.log('✅ Plik pobrany:', filename);
        } catch (error) {
            console.error('❌ Błąd pobierania pliku:', error);
            await this.customAlert('Błąd pobierania pliku: ' + error.message, 'error');
        }
    }

    // === HELPER: KATEGORIA DOKUMENTU ===
    
    getCategoryLabel(category) {
        const categories = {
            'POZ': '📄 Pozew',
            'ODP': '📝 Odpowiedź',
            'WNI': '📑 Wniosek',
            'ZAL': '📎 Załącznik',
            'ODW': '🔄 Odwołanie',
            'ZAZ': '⚡ Zażalenie',
            'WYR': '⚖️ Wyrok',
            'POS': '📋 Postanowienie',
            'NAK': '📜 Nakaz',
            'UZA': '✅ Uzasadnienie',
            'UMO': '💼 Umowa',
            'FAK': '💰 Faktura',
            'RAC': '🧾 Rachunek',
            'PRZ': '📤 Przelew',
            'KOR': '📧 Korespondencja',
            'POC': '📨 Poczta',
            'ZAW': '📬 Zawiadomienie',
            'WEZ': '📞 Wezwanie',
            'ZDJ': '📸 Zdjęcie',
            'NAG': '🎥 Nagranie',
            'EKS': '🔬 Ekspertyza',
            'DOW': '🪪 Dowód osobisty',
            'PAS': '📘 Paszport',
            'PRA': '🚗 Prawo jazdy',
            'NOT': '📝 Notatka',
            'INN': '📂 Inny'
        };
        return categories[category] || '📂 Dokument';
    }
    
    getCategoryColor(category) {
        const colors = {
            'POZ': '#e74c3c', 'ODP': '#3498db', 'WNI': '#9b59b6',
            'ZAL': '#95a5a6', 'ODW': '#e67e22', 'ZAZ': '#f39c12',
            'WYR': '#c0392b', 'POS': '#8e44ad', 'NAK': '#d35400',
            'UZA': '#27ae60', 'UMO': '#2980b9', 'FAK': '#16a085',
            'RAC': '#f1c40f', 'PRZ': '#1abc9c', 'KOR': '#34495e',
            'POC': '#2ecc71', 'ZAW': '#3498db', 'WEZ': '#e74c3c',
            'ZDJ': '#9b59b6', 'NAG': '#e91e63', 'EKS': '#00bcd4',
            'DOW': '#3498db', 'PAS': '#e74c3c', 'PRA': '#27ae60',
            'NOT': '#607d8b', 'INN': '#95a5a6'
        };
        return colors[category] || '#95a5a6';
    }
    
    // Helper: Rozwijanie/zwijanie listy spraw
    toggleAllCases(clientId) {
        const allCasesDiv = document.getElementById(`allCases_${clientId}`);
        const toggleBtn = document.getElementById(`toggleCases_${clientId}`);
        
        if (allCasesDiv.style.display === 'none') {
            allCasesDiv.style.display = 'flex';
            toggleBtn.textContent = '⚖️ Ukryj dodatkowe sprawy';
        } else {
            allCasesDiv.style.display = 'none';
            const totalCases = allCasesDiv.querySelectorAll('[style*="background: white"]').length + 3;
            toggleBtn.textContent = `⚖️ Pokaż wszystkie sprawy (${totalCases})`;
        }
    }
    
    // Helper: Rozwijanie/zwijanie listy notatek
    toggleAllNotes(clientId) {
        const allNotesDiv = document.getElementById(`allNotes_${clientId}`);
        const toggleBtn = document.getElementById(`toggleNotes_${clientId}`);
        
        if (allNotesDiv.style.display === 'none') {
            allNotesDiv.style.display = 'flex';
            toggleBtn.textContent = '📝 Ukryj dodatkowe notatki';
        } else {
            allNotesDiv.style.display = 'none';
            const totalNotes = allNotesDiv.querySelectorAll('[style*="background: white"]').length + 3;
            toggleBtn.textContent = `📝 Pokaż wszystkie notatki (${totalNotes})`;
        }
    }

    // Helper: Rozwijanie/zwijanie listy plików
    toggleAllFiles(clientId) {
        const allFilesDiv = document.getElementById(`allFiles_${clientId}`);
        const toggleBtn = document.getElementById(`toggleFiles_${clientId}`);
        
        if (allFilesDiv.style.display === 'none') {
            allFilesDiv.style.display = 'flex';
            toggleBtn.textContent = '📁 Ukryj dodatkowe pliki';
        } else {
            allFilesDiv.style.display = 'none';
            const totalFiles = allFilesDiv.querySelectorAll('[style*="background: white"]').length + 3;
            toggleBtn.textContent = `📁 Pokaż wszystkie (${totalFiles})`;
        }
    }

    // Helper: Podgląd pliku
    async previewFile(clientId, fileId, fileType) {
        try {
            const token = localStorage.getItem('token');
            
            console.log('👁️ Podgląd pliku:', fileId);
            
            const response = await fetch(`${window.getApiBaseUrl()}/clients/${clientId}/files/${fileId}/download`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Błąd pobierania pliku');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Utwórz modal z podglądem
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: rgba(0,0,0,0.9);
                z-index: 10001;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            `;
            
            let content = '';
            if (fileType.startsWith('image/')) {
                content = `<img src="${url}" style="max-width: 90vw; max-height: 90vh; object-fit: contain;">`;
            } else if (fileType === 'application/pdf') {
                content = `<iframe src="${url}" style="width: 90vw; height: 90vh; border: none; border-radius: 8px;"></iframe>`;
            }
            
            modal.innerHTML = `
                <div style="position: relative; background: white; border-radius: 8px; padding: 20px; max-width: 95vw; max-height: 95vh; overflow: auto;">
                    <button onclick="this.parentElement.parentElement.remove(); window.URL.revokeObjectURL('${url}')" 
                            style="position: absolute; top: 10px; right: 10px; background: #dc3545; color: white; border: none; border-radius: 50%; width: 40px; height: 40px; cursor: pointer; font-size: 20px; z-index: 1;">
                        ✕
                    </button>
                    ${content}
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Zamknij przy kliknięciu w tło
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    window.URL.revokeObjectURL(url);
                }
            });
        } catch (error) {
            console.error('❌ Błąd podglądu pliku:', error);
            await this.customAlert('Błąd podglądu pliku: ' + error.message, 'error');
        }
    }
    
    // Helper: Usuwanie pliku
    async deleteFile(clientId, fileId) {
        // Krok 1: Sprawdź hasło
        const password = await this.customPrompt('Aby usunąć plik, wpisz hasło administratora:', 'password');
        if (!password) {
            return; // Użytkownik anulował
        }
        
        if (password !== 'Proadmin') {
            await this.customAlert('Nieprawidłowe hasło!', 'error');
            return;
        }
        
        // Krok 2: Potwierdź usunięcie
        const confirmed = await this.customConfirm('Czy na pewno chcesz usunąć ten plik?');
        if (!confirmed) {
            return;
        }
        
        try {
            const token = localStorage.getItem('token');
            
            console.log('🗑️ Usuwanie pliku:', fileId);
            
            const response = await fetch(`${window.getApiBaseUrl()}/clients/${clientId}/files/${fileId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Błąd usuwania pliku');
            }
            
            console.log('✅ Plik usunięty');
            
            // Odśwież panel klienta
            await this.showClientDetails(clientId);
        } catch (error) {
            console.error('❌ Błąd usuwania pliku:', error);
            await this.customAlert('Błąd usuwania pliku: ' + error.message, 'error');
        }
    }

    // Helper: Przełączanie statusu klienta
    async toggleClientStatus(clientId, currentStatus) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const actionText = newStatus === 'inactive' ? 'zarchiwizować' : 'aktywować';
        
        const confirmed = await this.customConfirm(`Czy na pewno chcesz ${actionText} tego klienta?`);
        if (!confirmed) {
            return;
        }
        
        try {
            console.log('🔄 Zmiana statusu klienta:', clientId, '→', newStatus);
            
            const response = await window.api.request(`/clients/${clientId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status: newStatus })
            });
            
            if (!response.success) {
                throw new Error(response.message || 'Błąd zmiany statusu');
            }
            
            console.log('✅ Status zmieniony');
            
            // Odśwież panel klienta
            await this.showClientDetails(clientId);
            
            // Odśwież listę klientów
            await this.loadClients();
        } catch (error) {
            console.error('❌ Błąd zmiany statusu:', error);
            await this.customAlert('Błąd zmiany statusu: ' + error.message, 'error');
        }
    }

    // Helper: Formatowanie rozmiaru pliku
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Załaduj mecenasów do selecta
    async loadCaretakersToSelect(selectId) {
        try {
            // POBIERZ client_managers DLA FORMULARZA KLIENTA
            const response = await window.api.request('/cases/staff/list');
            const clientManagers = response.client_managers || [];
            
            console.log('📦 crm-clean.js loadCaretakersToSelect (CLIENT):', {
                selectId,
                client_managers: clientManagers.length,
                data: clientManagers
            });
            
            const select = document.getElementById(selectId);
            if (!select) {
                console.warn('Select nie znaleziony:', selectId);
                return;
            }
            
            // Wyczyść poprzednie opcje (oprócz pierwszej - placeholdera)
            const firstOption = select.options[0];
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }
            
            // Dodaj opcje opiekunów KLIENTÓW
            clientManagers.forEach(manager => {
                const option = document.createElement('option');
                option.value = manager.id;
                option.textContent = `${manager.name} (${manager.initials || manager.email})`;
                select.appendChild(option);
                console.log(`➕ crm-clean (client): Dodano ${manager.name} (role: ${manager.user_role})`);
            });
            
            console.log(`✅ Załadowano ${clientManagers.length} opiekunów KLIENTÓW`);
        } catch (error) {
            console.error('❌ Błąd ładowania opiekunów klientów:', error);
        }
    }

    async loadCaseManagersToSelect(selectId) {
        try {
            // POBIERZ case_managers DLA FORMULARZA SPRAWY
            const response = await window.api.request('/cases/staff/list');
            const caseManagers = response.case_managers || [];
            const clientManagers = response.client_managers || [];
            
            console.log('📦 crm-clean.js loadCaseManagersToSelect (CASE):', {
                selectId,
                case_managers: caseManagers.length,
                client_managers: clientManagers.length
            });
            
            const select = document.getElementById(selectId);
            if (!select) {
                console.warn('Select nie znaleziony:', selectId);
                return;
            }
            
            // Wyczyść poprzednie opcje (oprócz pierwszej - placeholdera)
            const firstOption = select.options[0];
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }
            
            // NAJPIERW dodaj opiekunów SPRAW (case_managers)
            if (caseManagers.length > 0) {
                const group = document.createElement('optgroup');
                group.label = '📋 Opiekunowie spraw';
                caseManagers.forEach(manager => {
                    const option = document.createElement('option');
                    option.value = manager.id;
                    option.textContent = `${manager.name} (${manager.initials || manager.email})`;
                    group.appendChild(option);
                    console.log(`➕ crm-clean (case): Dodano ${manager.name} (role: ${manager.user_role})`);
                });
                select.appendChild(group);
            }
            
            // POTEM dodaj opiekunów KLIENTÓW (client_managers) - opcjonalnie
            if (clientManagers.length > 0) {
                const group = document.createElement('optgroup');
                group.label = '👤 Opiekunowie klientów (opcjonalnie)';
                clientManagers.forEach(manager => {
                    const option = document.createElement('option');
                    option.value = manager.id;
                    option.textContent = `${manager.name} (${manager.initials || manager.email})`;
                    group.appendChild(option);
                });
                select.appendChild(group);
            }
            
            console.log(`✅ Załadowano ${caseManagers.length} opiekunów SPRAW + ${clientManagers.length} opiekunów KLIENTÓW`);
        } catch (error) {
            console.error('❌ Błąd ładowania opiekunów spraw:', error);
        }
    }

    async loadLawyersToSelect(selectId) {
        try {
            const response = await window.api.request('/users');
            const allUsers = response.users || [];
            
            // Filtruj tylko mecenasów (lawyers)
            const lawyers = allUsers.filter(user => user.role === 'lawyer');
            
            const select = document.getElementById(selectId);
            if (!select) {
                console.warn('Select nie znaleziony:', selectId);
                return;
            }
            
            // Wyczyść poprzednie opcje (oprócz pierwszej - placeholdera)
            const firstOption = select.options[0];
            select.innerHTML = '';
            if (firstOption) {
                select.appendChild(firstOption);
            }
            
            // Dodaj opcje mecenasów
            lawyers.forEach(lawyer => {
                const option = document.createElement('option');
                option.value = lawyer.id;
                option.textContent = `${lawyer.name} (${lawyer.email})`;
                select.appendChild(option);
            });
            
            console.log(`✅ Załadowano ${lawyers.length} mecenasów`);
        } catch (error) {
            console.error('❌ Błąd ładowania mecenasów:', error);
        }
    }

    // Nowe funkcje dla szczegółów sprawy
    async showAddCaseEvent(caseId) {
        await this.customAlert('Funkcja dodawania wydarzenia w przygotowaniu', 'info');
        // TODO: Implementacja formularza dodawania wydarzenia
    }

    async showAddCaseComment(caseId) {
        // Przełącz na zakładkę komentarzy
        if (window.crmManager && window.crmManager.switchCaseTab) {
            window.crmManager.switchCaseTab(caseId, 'comments');
        }
    }

    async saveCaseComment(caseId) {
        const text = document.getElementById('newCommentText')?.value;
        const internal = document.getElementById('commentInternal')?.checked;
        const pdfFile = document.getElementById('commentPdfFile')?.files[0];
        
        if (!text || text.trim() === '') {
            await this.customAlert('Wpisz treść komentarza', 'error');
            return;
        }
        
        try {
            console.log('💾 Zapisywanie komentarza do sprawy:', caseId);
            
            // KROK 1: Zapisz komentarz (normalnie przez JSON)
            const commentData = {
                case_id: caseId,
                comment: text.trim(),
                is_internal: internal || false
            };
            
            console.log('📝 Dane komentarza:', commentData);
            
            const commentResponse = await window.api.request('/comments', {
                method: 'POST',
                body: JSON.stringify(commentData)
            });
            
            console.log('✅ Komentarz zapisany, ID:', commentResponse.commentId);
            
            // KROK 2: Jeśli jest plik, wyślij go
            if (pdfFile) {
                console.log('📎 Wysyłam plik:', pdfFile.name, 'Typ:', pdfFile.type, 'Rozmiar:', pdfFile.size);
                
                const formData = new FormData();
                formData.append('file', pdfFile);
                formData.append('case_id', caseId);
                formData.append('comment_id', commentResponse.commentId);
                
                const token = localStorage.getItem('token');
                
                const fileResponse = await fetch('https://web-production-7504.up.railway.app/api/comments/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                
                if (!fileResponse.ok) {
                    console.error('❌ Błąd wysyłania pliku, status:', fileResponse.status);
                    throw new Error('Błąd wysyłania pliku');
                }
                
                const fileData = await fileResponse.json();
                console.log('✅ Plik wysłany:', fileData);
            }
            
            // Wyczyść formularz
            document.getElementById('newCommentText').value = '';
            document.getElementById('commentInternal').checked = false;
            document.getElementById('commentPdfFile').value = '';
            document.getElementById('commentPdfName').textContent = '';
            
            // Przeładuj tylko listę komentarzy (bez resetowania zakładki)
            await this.reloadCommentsList(caseId);
            
        } catch (error) {
            console.error('❌ Błąd zapisywania komentarza:', error);
            await this.customAlert('Błąd dodawania komentarza: ' + error.message, 'error');
        }
    }

    // Pokaż formularz odpowiedzi na komentarz
    showReplyForm(commentId, authorName) {
        // Ukryj wszystkie inne formularze odpowiedzi
        document.querySelectorAll('[id^="replyForm_"]').forEach(form => {
            form.style.display = 'none';
        });
        
        // Pokaż formularz dla tego komentarza
        const form = document.getElementById(`replyForm_${commentId}`);
        if (form) {
            form.style.display = 'block';
            
            // Focus na textarea
            setTimeout(() => {
                const textarea = document.getElementById(`replyText_${commentId}`);
                if (textarea) {
                    textarea.focus();
                }
            }, 100);
        }
    }

    // Ukryj formularz odpowiedzi
    hideReplyForm(commentId) {
        const form = document.getElementById(`replyForm_${commentId}`);
        if (form) {
            form.style.display = 'none';
            
            // Wyczyść formularz
            const textarea = document.getElementById(`replyText_${commentId}`);
            const checkbox = document.getElementById(`replyInternal_${commentId}`);
            if (textarea) textarea.value = '';
            if (checkbox) checkbox.checked = false;
        }
    }

    // Przeładuj tylko listę komentarzy (bez resetowania zakładki)
    async reloadCommentsList(caseId) {
        try {
            const response = await window.api.request(`/comments/case/${caseId}`);
            const comments = response.comments || [];
            
            const listDiv = document.getElementById('caseCommentsList');
            if (!listDiv) return;
            
            if (comments.length === 0) {
                listDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 20px;">Brak komentarzy do sprawy</p>';
                return;
            }
            
            // Użyj tej samej logiki renderowania co w crm-case-tabs.js
            console.log('📝 Wszystkie komentarze:', comments);
            const topLevelComments = comments.filter(c => !c.parent_comment_id || c.parent_comment_id === null);
            const getReplies = (parentId) => comments.filter(c => c.parent_comment_id && Number(c.parent_comment_id) === Number(parentId));
            console.log('📌 Główne komentarze:', topLevelComments);
            console.log('💬 Funkcja getReplies gotowa');
            
            const self = this; // Zachowaj kontekst dla escapeHtml
            
            const renderComment = (c, isReply = false) => {
                const authorName = c.author_name || c.user_name || c.author_email || 'Nieznany użytkownik';
                const authorInitial = authorName[0].toUpperCase();
                const commentDate = new Date(c.created_at).toLocaleString('pl-PL');
                const isInternal = c.internal || c.is_internal;
                const replies = getReplies(c.id);
                
                if (replies.length > 0) {
                    console.log(`💬 Komentarz ${c.id} ma ${replies.length} odpowiedzi:`, replies);
                }
                
                return `
                <div style="${isReply ? 'margin-left: 50px; margin-top: 10px;' : ''}">
                    <div id="comment_${c.id}" style="background: ${isInternal ? '#fff9e6' : 'white'}; padding: 20px; border-radius: 10px; border: 2px solid ${isInternal ? '#FFD700' : '#e0e0e0'}; ${isReply ? 'border-left: 4px solid #FFD700;' : ''} box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #1a2332, #2c3e50); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.2rem;">
                                    ${authorInitial}
                                </div>
                                <div style="flex: 1;">
                                    <strong style="color: #1a2332; font-size: 1.05rem; display: block;">${self.escapeHtml(authorName)}</strong>
                                    <span style="color: #666; font-size: 0.85rem;">${commentDate}</span>
                                </div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${isInternal ? `
                                    <span style="padding: 6px 12px; background: #fff3cd; color: #856404; border: 1px solid #ffc107; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">
                                        🔒 Wewnętrzny
                                    </span>
                                ` : `
                                    <span style="padding: 6px 12px; background: #d4edda; color: #155724; border: 1px solid #28a745; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">
                                        👁️ Publiczny
                                    </span>
                                `}
                                <button onclick="crmManager.showReplyForm(${c.id}, '${self.escapeHtml(authorName).replace(/'/g, "\\'")}'  );" 
                                    style="padding: 6px 14px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.3s;" 
                                    onmouseover="this.style.background='linear-gradient(135deg, #d4af37, #FFD700)'" 
                                    onmouseout="this.style.background='linear-gradient(135deg, #FFD700, #d4af37)'">
                                    💬 Odpowiedz
                                </button>
                                <button onclick="crmManager.deleteComment(${caseId}, ${c.id});" 
                                    style="padding: 6px 14px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: all 0.3s;" 
                                    onmouseover="this.style.background='#c82333'" 
                                    onmouseout="this.style.background='#dc3545'"
                                    title="Usuń komentarz">
                                    🗑️ Usuń
                                </button>
                            </div>
                        </div>
                        <div style="color: #1a2332; line-height: 1.8; font-size: 1rem; white-space: pre-wrap; padding: 10px; background: ${isInternal ? '#fffaf0' : '#f9f9f9'}; border-radius: 6px;">${self.escapeHtml(c.comment)}</div>
                        
                        <!-- Załączniki -->
                        ${c.attachments && c.attachments.length > 0 ? `
                            <div style="margin-top: 15px; padding: 12px; background: #f0f8ff; border-radius: 8px; border: 1px solid #b8d4f1;">
                                <div style="color: #d4af37; font-weight: 600; margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                                    📎 Załączniki (${c.attachments.length})
                                </div>
                                ${c.attachments.map(att => {
                                    const fileIcon = att.file_type?.includes('pdf') ? '📄' : 
                                                   att.file_type?.includes('image') ? '🖼️' : 
                                                   att.file_type?.includes('word') ? '📝' : 
                                                   att.file_type?.includes('excel') ? '📊' : '📎';
                                    const fileSize = att.file_size ? (att.file_size / 1024).toFixed(1) + ' KB' : '';
                                    
                                    return `
                                        <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: white; border-radius: 6px; margin-bottom: 6px; border: 1px solid #e0e0e0;">
                                            <span style="font-size: 1.5rem;">${fileIcon}</span>
                                            <div style="flex: 1;">
                                                <div style="font-weight: 600; color: #1a2332; font-size: 0.95rem;">${self.escapeHtml(att.title || att.filename)}</div>
                                                <div style="font-size: 0.8rem; color: #666;">
                                                    ${att.document_number} • ${fileSize}
                                                </div>
                                            </div>
                                            <button onclick="crmManager.viewDocument(${att.id}, ${caseId})" 
                                                style="padding: 6px 12px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;"
                                                title="Wyświetl plik">
                                                👁️ Pokaż
                                            </button>
                                            <button onclick="crmManager.downloadDocument(${att.id}, '${self.escapeHtml(att.filename)}')" 
                                                style="padding: 6px 12px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: 600;"
                                                title="Pobierz plik">
                                                ⬇️ Pobierz
                                            </button>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : ''}
                        
                        <div id="replyForm_${c.id}" style="display: none; margin-top: 15px; padding: 15px; background: #fffaf0; border-radius: 8px; border: 2px dashed #FFD700;">
                            <div style="margin-bottom: 10px; color: #d4af37; font-weight: 600;">
                                💬 Odpowiedź do: ${self.escapeHtml(authorName)}
                            </div>
                            <textarea id="replyText_${c.id}" placeholder="Wpisz odpowiedź..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; min-height: 80px; resize: vertical; font-size: 0.95rem;"></textarea>
                            <div style="display: flex; gap: 10px; margin-top: 10px;">
                                <label style="display: flex; align-items: center; gap: 5px;">
                                    <input type="checkbox" id="replyInternal_${c.id}">
                                    <span style="font-size: 0.85rem; color: #1a2332; font-weight: 600;">🔒 Wewnętrzny</span>
                                </label>
                                <button onclick="crmManager.saveReply(${caseId}, ${c.id})" style="padding: 8px 16px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; margin-left: auto;">
                                    ✓ Wyślij odpowiedź
                                </button>
                                <button onclick="crmManager.hideReplyForm(${c.id})" style="padding: 8px 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">
                                    ✕ Anuluj
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    ${replies.length > 0 ? `
                        <div style="margin-top: 10px;">
                            ${replies.map(reply => renderComment(reply, true)).join('')}
                        </div>
                    ` : ''}
                </div>
                `;
            };
            
            listDiv.innerHTML = topLevelComments.map(c => renderComment(c, false)).join('');
            
        } catch (error) {
            console.error('❌ Błąd przeładowania komentarzy:', error);
        }
    }

    // Usuń komentarz (z potwierdzeniem hasła)
    async deleteComment(caseId, commentId) {
        // Pierwsze potwierdzenie
        const confirmed = await this.customConfirm('Czy na pewno chcesz usunąć ten komentarz? Ta operacja jest nieodwracalna!');
        if (!confirmed) return;
        
        // Zapytaj o hasło administratora
        const password = await this.customPrompt('Wprowadź hasło administratora:', 'password');
        if (!password) {
            await this.customAlert('Usuwanie anulowane', 'info');
            return;
        }
        
        try {
            console.log('🗑️ Usuwanie komentarza:', commentId);
            
            const response = await window.api.request(`/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'X-Admin-Password': password
                }
            });
            
            if (!response.success) {
                throw new Error(response.error || response.message || 'Błąd usuwania komentarza');
            }
            
            // Przeładuj tylko listę komentarzy
            await this.reloadCommentsList(caseId);
            
        } catch (error) {
            console.error('❌ Błąd usuwania komentarza:', error);
            await this.customAlert('Błąd usuwania komentarza: ' + error.message, 'error');
        }
    }

    // Zapisz odpowiedź na komentarz
    async saveReply(caseId, parentCommentId) {
        const text = document.getElementById(`replyText_${parentCommentId}`)?.value;
        const internal = document.getElementById(`replyInternal_${parentCommentId}`)?.checked;
        
        if (!text || text.trim() === '') {
            await this.customAlert('Wpisz treść odpowiedzi', 'error');
            return;
        }
        
        const payload = {
            case_id: caseId,
            parent_comment_id: parentCommentId,
            comment: text.trim(),
            is_internal: internal || false
        };
        
        console.log('💾 FRONTEND: Wysyłam odpowiedź:', payload);
        
        try {
            const response = await window.api.request('/comments', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            
            console.log('✅ FRONTEND: Odpowiedź z serwera:', response);
            
            if (!response.success) {
                throw new Error(response.message || 'Błąd dodawania odpowiedzi');
            }
            
            // Ukryj i wyczyść formularz
            this.hideReplyForm(parentCommentId);
            
            // Przeładuj tylko listę komentarzy
            await this.reloadCommentsList(caseId);
            
        } catch (error) {
            console.error('❌ Błąd zapisywania odpowiedzi:', error);
            await this.customAlert('Błąd dodawania odpowiedzi: ' + error.message, 'error');
        }
    }

    // Wyświetl dokument/załącznik w pop-upie
    async viewDocument(documentId, caseId = null, sourceType = null) {
        // Pokaż okienko ładowania
        const loadingModal = document.createElement('div');
        loadingModal.id = 'documentLoadingModal';
        loadingModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.85);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000000;
            animation: fadeIn 0.2s;
        `;
        loadingModal.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 1.5s infinite;">📄</div>
                <div style="font-size: 1.3rem; font-weight: 600; margin-bottom: 15px;">Ładowanie dokumentu...</div>
                <div style="width: 200px; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden; margin: 0 auto;">
                    <div style="width: 30%; height: 100%; background: linear-gradient(90deg, #FFD700, #d4af37); border-radius: 3px; animation: loadingBar 1.5s ease-in-out infinite;"></div>
                </div>
                <div style="margin-top: 15px; font-size: 0.9rem; opacity: 0.7;">Proszę czekać...</div>
            </div>
            <style>
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                }
                @keyframes loadingBar {
                    0% { width: 0%; margin-left: 0%; }
                    50% { width: 60%; margin-left: 20%; }
                    100% { width: 0%; margin-left: 100%; }
                }
            </style>
        `;
        document.body.appendChild(loadingModal);
        
        try {
            console.log('👁️ Wyświetlam dokument ID:', documentId, 'Case ID:', caseId, 'Source:', sourceType);
            
            // Użyj dynamicznego API_URL
            const apiBaseUrl = window.getApiBaseUrl();
            const token = localStorage.getItem('token');
            
            console.log('🔗 API URL:', apiBaseUrl, 'Token:', token ? 'OK' : 'BRAK');
            
            // Ustal URL do pliku
            let fileUrl;
            if (sourceType === 'attachment') {
                fileUrl = `${apiBaseUrl}/attachments/${documentId}/download`;
            } else if (sourceType === 'document') {
                fileUrl = `${apiBaseUrl}/documents/download/${documentId}`;
            } else {
                // Domyślnie próbuj documents
                fileUrl = `${apiBaseUrl}/documents/download/${documentId}`;
            }
            
            // Pobierz plik bezpośrednio (bez HEAD request) z retry
            console.log('📥 Pobieranie pliku z:', fileUrl);
            
            let response = null;
            let lastError = null;
            
            // Retry 3 razy z opóźnieniem
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    console.log(`📥 Próba ${attempt}/3...`);
                    response = await fetch(fileUrl, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (response.ok) break;
                    
                    // Jeśli nie zadziałało dla documents, spróbuj attachments
                    if (!response.ok && sourceType !== 'attachment' && attempt === 1) {
                        console.log('⚠️ Documents nie zadziałał, próbuję attachments...');
                        fileUrl = `${apiBaseUrl}/attachments/${documentId}/download`;
                        continue;
                    }
                } catch (fetchError) {
                    console.error(`❌ Próba ${attempt} nieudana:`, fetchError.message);
                    lastError = fetchError;
                    if (attempt < 3) {
                        await new Promise(r => setTimeout(r, 500 * attempt)); // Czekaj 500ms, 1s, 1.5s
                    }
                }
            }
            
            if (!response || !response.ok) {
                throw lastError || new Error(`Błąd pobierania dokumentu: ${response?.status || 'brak odpowiedzi'}`);
            }
            
            const blob = await response.blob();
            const contentType = blob.type || response.headers.get('Content-Type') || 'application/octet-stream';
            const contentDisposition = response.headers.get('Content-Disposition') || '';
            
            // Pobierz nazwę pliku
            let fileName = 'dokument';
            const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
            if (matches != null && matches[1]) {
                fileName = matches[1].replace(/['"]/g, '');
            }
            
            // Zapisz URL do pobierania
            const downloadUrl = fileUrl;
            
            // Dla wideo/audio - użyj blob URL (działa lepiej niż streaming z tokenem)
            const isVideo = contentType.includes('video');
            const isAudio = contentType.includes('audio');
            
            const url = window.URL.createObjectURL(blob);
            const fileType = contentType;
            
            console.log('✅ Plik pobrany:', fileName, 'Typ:', fileType, 'Rozmiar:', blob.size);
            
            // Usuń okienko ładowania
            loadingModal.remove();
            
            // Stwórz modal z podglądem
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.95);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                animation: fadeIn 0.3s;
            `;
            
            let previewContent = '';
            if (fileType.includes('pdf')) {
                previewContent = `<iframe src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>`;
            } else if (fileType.includes('video')) {
                // Wideo - użyj natywnego odtwarzacza z streamingiem
                previewContent = `
                    <video controls autoplay style="max-width: 100%; max-height: 100%; background: #000;">
                        <source src="${url}" type="${fileType}">
                        Twoja przeglądarka nie obsługuje odtwarzania wideo.
                    </video>
                `;
            } else if (fileType.includes('audio')) {
                // Audio - użyj natywnego odtwarzacza
                previewContent = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px;">
                        <div style="font-size: 5rem; margin-bottom: 30px;">🎵</div>
                        <audio controls autoplay style="width: 100%; max-width: 500px;">
                            <source src="${url}" type="${fileType}">
                            Twoja przeglądarka nie obsługuje odtwarzania audio.
                        </audio>
                    </div>
                `;
            } else if (fileType.includes('image')) {
                previewContent = `<img src="${url}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
            } else if (fileType.includes('text') || fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.json') || fileName.endsWith('.xml') || fileName.endsWith('.csv') || fileName.endsWith('.log')) {
                // Pliki tekstowe - odczytaj i wyświetl zawartość
                try {
                    const textContent = await blob.text();
                    const escapedContent = textContent
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                    previewContent = `
                        <div style="width: 100%; height: 100%; overflow: auto; background: #1e1e1e; padding: 20px;">
                            <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-family: 'Consolas', 'Monaco', 'Courier New', monospace; font-size: 14px; line-height: 1.6; color: #d4d4d4;">${escapedContent}</pre>
                        </div>
                    `;
                } catch (e) {
                    console.error('Błąd odczytu pliku tekstowego:', e);
                    previewContent = `
                        <div style="text-align: center; color: white; padding: 40px;">
                            <div style="font-size: 4rem; margin-bottom: 20px;">📄</div>
                            <div style="font-size: 1.2rem; margin-bottom: 20px;">Błąd odczytu pliku tekstowego</div>
                        </div>
                    `;
                }
            } else {
                previewContent = `
                    <div style="text-align: center; color: white; padding: 40px;">
                        <div style="font-size: 4rem; margin-bottom: 20px;">📄</div>
                        <div style="font-size: 1.2rem; margin-bottom: 20px;">Podgląd niedostępny dla tego typu pliku</div>
                        <button onclick="window.open('${url}', '_blank')" 
                            style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                            Otwórz w nowej karcie
                        </button>
                    </div>
                `;
            }
            
            modal.innerHTML = `
                <div style="background: white; border-radius: 12px; width: 90%; height: 90%; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; display: flex; justify-content: space-between; align-items: center; color: white;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span style="font-size: 1.5rem;">📄</span>
                            <div>
                                <div style="font-weight: 700; font-size: 1.1rem;">${this.escapeHtml(fileName)}</div>
                                <div style="font-size: 0.85rem; opacity: 0.9;">${fileType}</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="crmManager.downloadMediaFile('${downloadUrl}', '${this.escapeHtml(fileName)}')" 
                                style="padding: 10px 20px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;"
                                onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                                onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                                ⬇️ Pobierz
                            </button>
                            <button onclick="this.closest('[style*=fixed]').remove(); window.URL.revokeObjectURL('${url}')" 
                                style="padding: 10px 20px; background: rgba(255,255,255,0.2); color: white; border: 2px solid white; border-radius: 6px; cursor: pointer; font-weight: 600; transition: all 0.3s;"
                                onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                                onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                                ✕ Zamknij
                            </button>
                        </div>
                    </div>
                    <div style="flex: 1; overflow: auto; display: flex; align-items: center; justify-content: center; background: #f5f5f5;">
                        ${previewContent}
                    </div>
                </div>
            `;
            
            // Zamknij na kliknięcie w tło
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                    window.URL.revokeObjectURL(url);
                }
            });
            
            // Zamknij na ESC
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    modal.remove();
                    window.URL.revokeObjectURL(url);
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
            
            document.body.appendChild(modal);
            
        } catch (error) {
            // Usuń okienko ładowania w przypadku błędu
            loadingModal.remove();
            console.error('❌ Błąd wyświetlania dokumentu:', error);
            
            // Automatycznie otwórz w nowej karcie gdy fetch nie działa
            console.log('🔄 Otwieram dokument w nowej karcie...');
            const apiBaseUrl = window.getApiBaseUrl();
            const token = localStorage.getItem('token');
            
            // Otwórz w nowej karcie z tokenem w URL (fallback)
            let newTabUrl;
            if (sourceType === 'attachment') {
                newTabUrl = `${apiBaseUrl}/attachments/${documentId}/download?token=${token}`;
            } else {
                newTabUrl = `${apiBaseUrl}/documents/download/${documentId}?token=${token}`;
            }
            window.open(newTabUrl, '_blank');
        }
    }
    
    // Pomocnicza funkcja do pobierania z blob URL
    downloadDocumentDirect(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    // Pobierz plik multimedialny z autoryzacją
    async downloadMediaFile(fileUrl, filename) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(fileUrl, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error('Błąd pobierania pliku');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Zwolnij pamięć
            setTimeout(() => window.URL.revokeObjectURL(url), 100);
        } catch (error) {
            console.error('❌ Błąd pobierania pliku:', error);
            alert('Błąd pobierania pliku: ' + error.message);
        }
    }
    
    // Pobierz dokument/załącznik
    async downloadDocument(documentId, filename, sourceType = null) {
        try {
            console.log('⬇️ Pobieram dokument ID:', documentId, 'Source:', sourceType);
            
            const apiBaseUrl = window.getApiBaseUrl();
            const token = localStorage.getItem('token');
            let response;
            
            if (sourceType === 'attachment') {
                // Pobierz z attachments
                response = await fetch(`${apiBaseUrl}/attachments/${documentId}/download?download=true`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                // Próbuj z documents
                response = await fetch(`${apiBaseUrl}/documents/download/${documentId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                // Jeśli nie znaleziono, spróbuj z attachments
                if (!response.ok) {
                    response = await fetch(`${apiBaseUrl}/attachments/${documentId}/download?download=true`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                }
            }
            
            if (!response.ok) {
                throw new Error('Błąd pobierania dokumentu');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Pobierz plik
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('❌ Błąd pobierania dokumentu:', error);
            await this.customAlert('Błąd pobierania dokumentu: ' + error.message, 'error');
        }
    }
    
    // 🔍 GLOBALNA WYSZUKIWARKA - Szuka po wszystkim!
    async globalSearch(query) {
        const resultsDiv = document.getElementById('globalSearchResults');
        
        if (!query || query.trim().length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }
        
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = '<div style="padding: 20px; text-align: center; color: #666;">🔍 Wyszukuję...</div>';
        
        try {
            const response = await window.api.request(`/api/search?q=${encodeURIComponent(query)}`);
            console.log('🔍 Odpowiedź z wyszukiwarki:', response);
            
            const { cases, events, documents, clients, evidence } = response;
            console.log('📦 Dowody z wyszukiwarki:', evidence);
            const totalResults = cases.length + events.length + documents.length + clients.length + (evidence ? evidence.length : 0);
            
            if (totalResults === 0) {
                resultsDiv.innerHTML = '<div style="padding: 20px; text-align: center; color: #999;">Brak wyników dla "<strong>' + this.escapeHtml(query) + '</strong>"</div>';
                return;
            }
            
            let html = `<div style="padding: 15px;">`;
            
            // SPRAWY
            if (cases.length > 0) {
                html += `
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px 0; color: #667eea; font-size: 1rem;">📁 Sprawy (${cases.length})</h4>
                        ${cases.map(c => `
                            <div style="padding: 12px; background: #f8f9fa; border-left: 4px solid #667eea; margin-bottom: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;"
                                 onclick="document.getElementById('globalSearchResults').style.display='none'; crmManager.viewCase(${c.id})"
                                 onmouseover="this.style.background='#e9ecef'" onmouseout="this.style.background='#f8f9fa'">
                                <div style="font-weight: 600; color: #1a2332; margin-bottom: 4px;">${this.escapeHtml(c.case_number)} - ${this.escapeHtml(c.title)}</div>
                                <div style="font-size: 0.85rem; color: #666;">
                                    Klient: ${this.escapeHtml(c.client_name || 'Brak')} • ${this.escapeHtml(c.case_type)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            // WYDARZENIA
            if (events.length > 0) {
                html += `
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px 0; color: #e67e22; font-size: 1rem;">📅 Wydarzenia (${events.length})</h4>
                        ${events.map(e => `
                            <div style="padding: 12px; background: #fff3e0; border-left: 4px solid #e67e22; margin-bottom: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;"
                                 onclick="document.getElementById('globalSearchResults').style.display='none'; ${typeof window.viewEventDetails === 'function' ? `window.viewEventDetails(${e.id})` : `alert('Funkcja viewEventDetails nie istnieje')`}"
                                 onmouseover="this.style.background='#ffe0b2'" onmouseout="this.style.background='#fff3e0'">
                                <div style="font-weight: 600; color: #1a2332; margin-bottom: 4px;">${this.escapeHtml(e.event_code || e.title)}</div>
                                <div style="font-size: 0.85rem; color: #666;">
                                    ${new Date(e.start_date).toLocaleDateString('pl-PL')} • ${this.escapeHtml(e.event_type)}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            // DOWODY
            if (evidence && evidence.length > 0) {
                console.log('📦 Renderuję dowody:', evidence.map(e => `ID:${e.id} Code:${e.evidence_code}`));
                html += `
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px 0; color: #f39c12; font-size: 1rem;">🔍 Dowody (${evidence.length})</h4>
                        ${evidence.map(e => {
                            console.log(`🔍 Dowód: ID=${e.id}, case_id=${e.case_id}, code=${e.evidence_code}`);
                            return `
                            <div style="padding: 12px; background: #fff3e0; border-left: 4px solid #f39c12; margin-bottom: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;"
                                 onclick="console.log('🖱️ Kliknięto dowód ID:${e.id}'); document.getElementById('globalSearchResults').style.display='none'; crmManager.openEvidenceFromSearch(${e.id}, ${e.case_id})"
                                 onmouseover="this.style.background='#ffe0b2'" onmouseout="this.style.background='#fff3e0'">
                                <div style="font-weight: 600; color: #1a2332; margin-bottom: 4px;">🔍 ${this.escapeHtml(e.evidence_code || e.name)} <small style="color: #999;">(ID: ${e.id})</small></div>
                                <div style="font-size: 0.85rem; color: #666;">
                                    Sprawa: ${this.escapeHtml(e.case_number || 'Brak')} • ${this.escapeHtml(e.evidence_type || 'Dowód')}
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                `;
            }
            
            // DOKUMENTY
            if (documents.length > 0) {
                html += `
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px 0; color: #28a745; font-size: 1rem;">📄 Dokumenty (${documents.length})</h4>
                        ${documents.map(d => `
                            <div style="padding: 12px; background: #e8f5e9; border-left: 4px solid #28a745; margin-bottom: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;"
                                 onclick="document.getElementById('globalSearchResults').style.display='none'; crmManager.previewDocument(${d.id})"
                                 onmouseover="this.style.background='#c8e6c9'" onmouseout="this.style.background='#e8f5e9'">
                                <div style="font-weight: 600; color: #1a2332; margin-bottom: 4px;">${this.escapeHtml(d.title)}</div>
                                <div style="font-size: 0.85rem; color: #666;">
                                    ${this.escapeHtml(d.file_name)} • ${(d.file_size / 1024).toFixed(1)} KB
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            // KLIENCI
            if (clients.length > 0) {
                html += `
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin: 0 0 10px 0; color: #17a2b8; font-size: 1rem;">👤 Klienci (${clients.length})</h4>
                        ${clients.map(c => `
                            <div style="padding: 12px; background: #d1ecf1; border-left: 4px solid #17a2b8; margin-bottom: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s;"
                                 onclick="document.getElementById('globalSearchResults').style.display='none'; crmManager.showClientDetails(${c.id})"
                                 onmouseover="this.style.background='#bee5eb'" onmouseout="this.style.background='#d1ecf1'">
                                <div style="font-weight: 600; color: #1a2332; margin-bottom: 4px;">${this.escapeHtml(c.first_name)} ${this.escapeHtml(c.last_name)}</div>
                                <div style="font-size: 0.85rem; color: #666;">
                                    ${this.escapeHtml(c.email || 'Brak email')} ${c.phone ? '• ' + this.escapeHtml(c.phone) : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            html += `</div>`;
            resultsDiv.innerHTML = html;
            
        } catch (error) {
            console.error('❌ Błąd wyszukiwania:', error);
            resultsDiv.innerHTML = '<div style="padding: 20px; text-align: center; color: #dc3545;">Błąd wyszukiwania: ' + error.message + '</div>';
        }
    }
    
    // ========== EDYCJA SPRAWY (ENHANCED VERSION) ==========
    async showEditCaseModalEnhanced(caseId) {
        // Definiuj funkcje GLOBALNIE przed stworzeniem modala
        window.updateCourtHint = function() {
            const caseType = document.getElementById('editCaseType')?.value;
            const hint = document.getElementById('courtHint');
            const hintText = document.getElementById('courtHintText');
            
            if (!caseType) return;
            
            // ✨ NOWE: Automatycznie ustaw rodzaj sądu
            if (window.autoSetCourtType) {
                window.autoSetCourtType(caseType);
            }
            
            // Pobierz podpowiedź z config (jeśli istnieje)
            let message = '';
            if (window.getHintForCaseType) {
                message = window.getHintForCaseType(caseType);
            }
            
            // Fallback - stare podpowiedzi (jeśli config nie załadowany)
            if (!message) {
                if (caseType === 'administrative') {
                    message = 'Sprawy administracyjne → WSA (skargi na decyzje administracji) lub NSA (kasacje)';
                } else if (caseType === 'family') {
                    message = 'Rozwody i separacje → zawsze SO (Sąd Okręgowy)';
                } else if (caseType === 'criminal') {
                    message = 'Sprawy karne: SR (typowe przestępstwa) lub SO (cięższe zbrodnie jak zabójstwo)';
                } else if (caseType === 'civil') {
                    message = 'Sprawy cywilne: SR (do ~75k zł) lub SO (powyżej 75k zł)';
                } else if (caseType === 'commercial') {
                    message = 'Sprawy gospodarcze: SR/SO (spory między przedsiębiorcami), KRS w SO';
                } else if (caseType === 'labor') {
                    message = 'Sprawy pracy: SR/SO - Wydział Pracy i Ubezpieczeń Społecznych';
                } else if (caseType === 'bankruptcy') {
                    message = 'Upadłość → SO (Wydział Gospodarczy)';
                } else if (caseType === 'compensation') {
                    message = 'Odszkodowania → SR/SO (zależnie od wartości)';
                }
            }
            
            // Pokaż podpowiedź
            if (hint && hintText && message) {
                hintText.textContent = message;
                hint.style.display = 'block';
            } else if (hint) {
                hint.style.display = 'none';
            }
        };
        
        window.updateProsecutorSection = function() {
            const caseType = document.getElementById('editCaseType')?.value;
            const prosecutorSection = document.getElementById('prosecutorSection');
            const policeSection = document.getElementById('policeSection');
            
            if (!caseType || !prosecutorSection || !policeSection) return;
            
            console.log('🔄 Zmiana typu sprawy na:', caseType);
            
            // ✅ NOWE: Pokazuj sekcję organów ścigania dla WSZYSTKICH typów spraw
            console.log('✅ Pokazuję sekcję organów ścigania (dostępna dla wszystkich typów spraw)');
            prosecutorSection.style.display = 'block';
            policeSection.style.display = 'none';
            
            // Włącz wszystkie pola w sekcji organów ścigania
            prosecutorSection.querySelectorAll('input:not([type="hidden"]), textarea, select').forEach(field => {
                field.disabled = false;
            });
            
            // Wyłącz sekcję policji (nie jest już potrzebna)
            policeSection.querySelectorAll('input, textarea, select').forEach(field => {
                field.disabled = true;
            });
        };
        
        try {
            const response = await window.api.request(`/cases/${caseId}`);
            const caseData = response.case;
            
            const modal = this.createEditModal('📝 Edytuj sprawę', `
                <form id="editCaseForm" style="display: flex; flex-direction: column; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">Numer sprawy *</label>
                        <input type="text" name="case_number" value="${this.escapeHtml(caseData.case_number)}" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">Tytuł sprawy *</label>
                        <input type="text" name="title" value="${this.escapeHtml(caseData.title)}" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">Typ sprawy *</label>
                            <small style="display: block; color: #666; font-size: 0.85rem; margin-bottom: 8px; font-style: italic;">
                                (WYBIERZ PODTYP - GŁÓWNY TYP ZOSTANIE AUTOMATYCZNIE PRZYPISANY)
                            </small>
                            <select name="case_type" id="editCaseType" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" onchange="updateCourtHint(); updateProsecutorSection();">
                                <option value="">Wybierz...</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">Priorytet</label>
                            <select name="priority" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="low" ${caseData.priority === 'low' ? 'selected' : ''}>🔵 Niski</option>
                                <option value="medium" ${caseData.priority === 'medium' ? 'selected' : ''}>🟡 Średni</option>
                                <option value="high" ${caseData.priority === 'high' ? 'selected' : ''}>🔴 Wysoki</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- INFORMACJE SĄDOWE -->
                    <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
                        <h4 style="margin: 0 0 15px 0; color: #1976d2; display: flex; align-items: center; gap: 8px;">
                            ⚖️ Informacje sądowe
                        </h4>
                        
                        <div id="courtHint" style="background: #fff3e0; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 0.85rem; color: #e65100; display: none;">
                            <strong>💡 Podpowiedź:</strong> <span id="courtHintText"></span>
                        </div>
                        
                        <!-- WYSZUKIWARKA SĄDÓW -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332; font-size: 1rem;">🔍 Wyszukaj sąd w bazie</label>
                            <div style="position: relative;">
                                <input type="text" 
                                       id="courtSearchInput" 
                                       placeholder="Wpisz: miasto, nazwę sądu (np. 'Warszawa Mokotów')..."
                                       style="width: 100%; padding: 14px 45px 14px 14px; border: 2px solid #2196f3; border-radius: 8px; font-size: 1rem; background: white;"
                                       oninput="window.searchCourtsLive(this.value)"
                                       onfocus="this.style.borderColor='#1976d2'"
                                       onblur="setTimeout(() => {document.getElementById('courtSuggestions').style.display='none'}, 200)">
                                <div style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #2196f3; font-size: 1.2rem;">🏛️</div>
                            </div>
                            
                            <!-- Dropdown z sugestiami -->
                            <div id="courtSuggestions" style="display: none; position: absolute; z-index: 1000; background: white; border: 2px solid #2196f3; border-top: none; border-radius: 0 0 8px 8px; max-height: 400px; overflow-y: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.15); width: calc(100% - 40px);"></div>
                            
                            <small style="display: block; margin-top: 8px; color: #666; font-size: 0.85rem;">💡 Wpisz minimum 2 znaki aby zobaczyć sugestie</small>
                        </div>
                        
                        <!-- Wybrane informacje o sądzie -->
                        <div id="selectedCourtInfo" style="display: none; background: linear-gradient(135deg, #e3f2fd, #bbdefb); border: 2px solid #2196f3; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                                <h4 style="margin: 0; color: #0d47a1; font-size: 1.2rem;" id="selectedCourtName">🏛️ Sąd</h4>
                                <button type="button" onclick="window.clearSelectedCourt()" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">✖ Usuń</button>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.95rem;">
                                <div><strong>📍 Adres:</strong> <span id="selectedCourtAddress"></span></div>
                                <div><strong>📞 Telefon:</strong> <span id="selectedCourtPhone"></span></div>
                                <div><strong>✉️ Email:</strong> <span id="selectedCourtEmail"></span></div>
                                <div><strong>🌐 Strona:</strong> <a id="selectedCourtWebsite" href="#" target="_blank" style="color: #1976d2;">Otwórz</a></div>
                            </div>
                            <input type="hidden" id="selectedCourtId" name="court_id">
                            <input type="hidden" id="selectedCourtData" name="court_data">
                        </div>
                        
                        <!-- Ręczne pola (jeśli nie wybrano z bazy) -->
                        <div id="manualCourtFields">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">🏛️ Rodzaj sądu (ręcznie)</label>
                                    <select name="court_type" id="editCourtType" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;" onchange="updateCourtHint()">
                                        <option value="">Nie dotyczy</option>
                                        <optgroup label="Sądy Powszechne">
                                            <option value="SR">SR - Sąd Rejonowy</option>
                                            <option value="SO">SO - Sąd Okręgowy</option>
                                            <option value="SA">SA - Sąd Apelacyjny</option>
                                            <option value="SN">SN - Sąd Najwyższy</option>
                                        </optgroup>
                                        <optgroup label="Sądy Wydziałowe">
                                            <option value="SR-ROD">SR/SO - Wydział Rodzinny</option>
                                            <option value="SO-GOSP">SO - Wydział Gospodarczy</option>
                                            <option value="SR-PRACY">SR/SO - Wydział Pracy i Ubezpieczeń Społecznych</option>
                                            <option value="SO-KRS">SO - Wydział Gospodarczy KRS</option>
                                        </optgroup>
                                        <optgroup label="Sądy Administracyjne">
                                            <option value="WSA">WSA - Wojewódzki Sąd Administracyjny</option>
                                            <option value="NSA">NSA - Naczelny Sąd Administracyjny</option>
                                        </optgroup>
                                        <optgroup label="Inne">
                                            <option value="ARBITRAZ">Arbitraż / Sąd polubowny</option>
                                            <option value="TK">TK - Trybunał Konstytucyjny</option>
                                        </optgroup>
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">📍 Nazwa sądu (ręcznie)</label>
                                    <input type="text" name="court_name" id="manualCourtName" value="${this.escapeHtml(caseData.court_name || '')}" placeholder="np. Sąd Okręgowy w Warszawie" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                            </div>
                            
                            <!-- NOWE POLA: Adres, Telefon, Email sądu -->
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">📍 Adres sądu</label>
                                <input type="text" name="court_address" id="manualCourtAddress" value="${this.escapeHtml(caseData.court_address || '')}" placeholder="np. ul. Czerniakowska 100A, 00-454 Warszawa" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                <small style="color: #666; font-size: 0.85rem; display: block; margin-top: 5px;">💡 Wypełni się automatycznie gdy wybierzesz sąd z bazy</small>
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">📞 Telefon sądu</label>
                                    <input type="text" name="court_phone" id="manualCourtPhone" value="${this.escapeHtml(caseData.court_phone || '')}" placeholder="np. 22 56 56 100" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">✉️ Email sądu</label>
                                    <input type="text" name="court_email" id="manualCourtEmail" value="${this.escapeHtml(caseData.court_email || '')}" placeholder="np. informacja@sąd.gov.pl" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                            </div>
                            
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">🌐 Strona WWW sądu</label>
                                <input type="url" name="court_website" id="manualCourtWebsite" value="${this.escapeHtml(caseData.court_website || '')}" placeholder="np. https://warszawa-mokotow.sr.gov.pl" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                <small style="color: #666; font-size: 0.85rem; display: block; margin-top: 5px;">💡 Wypełni się automatycznie gdy wybierzesz sąd z bazy</small>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">🏢 Wydział</label>
                                <input type="text" name="court_department" value="${this.escapeHtml(caseData.court_department || '')}" placeholder="np. I Wydział Cywilny" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">📑 Sygnatura akt</label>
                                <input type="text" name="court_signature" value="${this.escapeHtml(caseData.court_signature || '')}" placeholder="np. I C 123/2025" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">👨‍⚖️ Sędzia prowadzący</label>
                                <input type="text" name="judge_name" value="${this.escapeHtml(caseData.judge_name || '')}" placeholder="SSO Jan Kowalski" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">📋 Referent sądowy</label>
                                <input type="text" name="referent" value="${this.escapeHtml(caseData.referent || '')}" placeholder="Anna Nowak" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                        </div>
                    </div>
                    
                    <!-- PROKURATURA I ORGANY ŚCIGANIA - WSZYSTKIE TYPY SPRAW -->
                    <div id="prosecutorSection" style="background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800; display: none;">
                        <h4 style="margin: 0 0 15px 0; color: #e65100; display: flex; align-items: center; gap: 8px;">
                            🔍 Prokuratura i organy ścigania
                        </h4>
                        <p style="margin: 0 0 15px 0; color: #666; font-size: 0.9rem; font-style: italic;">
                            Jeśli dotyczy - np. w sprawach karnych, odszkodowaniach po wypadkach, sprawach o przestępstwa gospodarcze
                        </p>
                        
                        <!-- WYSZUKIWARKA PROKURATUR -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332; font-size: 1rem;">🔍 Wyszukaj prokuraturę w bazie</label>
                            <div style="position: relative;">
                                <input type="text" 
                                       id="prosecutorSearchInput" 
                                       placeholder="Wpisz: miasto, typ (regionalna/okręgowa/rejonowa)..."
                                       style="width: 100%; padding: 14px 45px 14px 14px; border: 2px solid #ff9800; border-radius: 8px; font-size: 1rem; background: white;"
                                       oninput="window.searchProsecutorsLive(this.value)"
                                       onfocus="this.style.borderColor='#f57c00'"
                                       onblur="setTimeout(() => {document.getElementById('prosecutorSuggestions').style.display='none'}, 200)">
                                <div style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #ff9800; font-size: 1.2rem; pointer-events: none;">🔍</div>
                                <div id="prosecutorSuggestions" style="display: none; position: absolute; top: 100%; left: 0; z-index: 10000; width: 100%; max-height: 400px; overflow-y: auto; background: white; border: 2px solid #ff9800; border-radius: 8px; margin-top: 5px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);"></div>
                            </div>
                        </div>
                        
                        <!-- WYBRANA PROKURATURA (INFO) -->
                        <div id="selectedProsecutorInfo" style="display: none; margin-bottom: 20px; background: linear-gradient(135deg, #fff3e0, #ffecb3); padding: 15px; border-radius: 8px; border: 2px solid #ff9800;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <strong style="color: #e65100; font-size: 1.05rem;">🏛️ <span id="selectedProsecutorName"></span></strong>
                                <button type="button" onclick="window.clearSelectedProsecutor()" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">✖ Usuń</button>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.95rem;">
                                <div><strong>📍 Adres:</strong> <span id="selectedProsecutorAddress"></span></div>
                                <div><strong>📞 Telefon:</strong> <span id="selectedProsecutorPhone"></span></div>
                                <div><strong>✉️ Email:</strong> <span id="selectedProsecutorEmail"></span></div>
                                <div><strong>🌐 Strona:</strong> <a id="selectedProsecutorWebsite" href="#" target="_blank" style="color: #f57c00;">Otwórz</a></div>
                            </div>
                            <input type="hidden" id="selectedProsecutorId" name="prosecutor_id">
                            <input type="hidden" id="selectedProsecutorData" name="prosecutor_data">
                        </div>
                        
                        <!-- RĘCZNE POLE (jeśli nie wybrano z bazy) -->
                        <div id="manualProsecutorFields">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">🏛️ Prokuratura (ręcznie)</label>
                                <input type="text" name="prosecutor_office" id="manualProsecutorOffice" value="${this.escapeHtml(caseData.prosecutor_office || '')}" placeholder="np. Prokuratura Okręgowa w Warszawie" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                <small style="color: #666; font-size: 0.85rem; display: block; margin-top: 5px;">💡 Wypełni się automatycznie gdy wybierzesz prokuraturę z bazy</small>
                            </div>
                            
                            <!-- DODATKOWE DANE PROKURATURY -->
                            <div style="background: #fff8e1; padding: 12px; border-radius: 6px; border: 1px solid #ffcc80; margin-bottom: 15px;">
                                <div style="color: #e65100; font-weight: 600; margin-bottom: 10px; font-size: 0.9rem;">📋 Dane kontaktowe prokuratury</div>
                                
                                <div style="margin-bottom: 12px;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.85rem;">📍 Adres prokuratury</label>
                                    <input type="text" name="prosecutor_address" id="prosecutorAddress" value="${this.escapeHtml(caseData.prosecutor_address || '')}" placeholder="np. ul. Krakowskie Przedmieście 25, Warszawa" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                                </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                                    <div>
                                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.85rem;">📞 Telefon</label>
                                        <input type="text" name="prosecutor_phone" id="prosecutorPhone" value="${this.escapeHtml(caseData.prosecutor_phone || '')}" placeholder="np. (22) 695 70 00" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.85rem;">✉️ Email</label>
                                        <input type="email" name="prosecutor_email" id="prosecutorEmail" value="${this.escapeHtml(caseData.prosecutor_email || '')}" placeholder="np. warszawa@warszawa.po.gov.pl" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                                    </div>
                                </div>
                                
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.85rem;">🌐 Strona WWW</label>
                                    <input type="url" name="prosecutor_website" id="prosecutorWebsite" value="${this.escapeHtml(caseData.prosecutor_website || '')}" placeholder="np. https://warszawa.po.gov.pl" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                                </div>
                                
                                <small style="color: #e65100; font-size: 0.8rem; display: block; margin-top: 8px;">💡 Te pola wypełnią się automatycznie gdy wybierzesz prokuraturę z wyszukiwarki powyżej</small>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">👔 Prokurator</label>
                                <input type="text" name="prosecutor_name" value="${this.escapeHtml(caseData.prosecutor_name || '')}" placeholder="Prokurator Jan Kowalski" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            <div>
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">📑 Akt oskarżenia / Postanowienie</label>
                                <input type="text" name="indictment_number" value="${this.escapeHtml(caseData.indictment_number || '')}" placeholder="np. Ds. 123/2025" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">👤 Skarżyciel posiłkowy</label>
                            <input type="text" name="auxiliary_prosecutor" value="${this.escapeHtml(caseData.auxiliary_prosecutor || '')}" placeholder="Imię i nazwisko skarżyciela posiłkowego" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        
                        <!-- WYSZUKIWARKA KOMEND POLICJI -->
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332; font-size: 1rem;">🔍 Wyszukaj komendę policji w bazie</label>
                            <div style="position: relative;">
                                <input type="text" 
                                       id="policeSearchInput" 
                                       placeholder="Wpisz: miasto, województwo, typ (wojewódzka/rejonowa)..."
                                       style="width: 100%; padding: 14px 45px 14px 14px; border: 2px solid #2196f3; border-radius: 8px; font-size: 1rem; background: white;"
                                       oninput="window.searchPoliceLive(this.value)"
                                       onfocus="this.style.borderColor='#1565c0'"
                                       onblur="setTimeout(() => {document.getElementById('policeSuggestions').style.display='none'}, 200)">
                                <div style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: #2196f3; font-size: 1.2rem; pointer-events: none;">🔍</div>
                                <div id="policeSuggestions" style="display: none; position: absolute; top: 100%; left: 0; z-index: 10000; width: 100%; max-height: 400px; overflow-y: auto; background: white; border: 2px solid #2196f3; border-radius: 8px; margin-top: 5px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);"></div>
                            </div>
                        </div>
                        
                        <!-- WYBRANA KOMENDA POLICJI (INFO) -->
                        <div id="selectedPoliceInfo" style="display: none; margin-bottom: 20px; background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 15px; border-radius: 8px; border: 2px solid #2196f3;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <strong style="color: #1565c0; font-size: 1.05rem;">🚔 <span id="selectedPoliceName"></span></strong>
                                <button type="button" onclick="window.clearSelectedPolice()" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">✖ Usuń</button>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.95rem;">
                                <div><strong>📍 Adres:</strong> <span id="selectedPoliceAddress"></span></div>
                                <div><strong>📞 Telefon:</strong> <span id="selectedPolicePhone"></span></div>
                                <div><strong>✉️ Email:</strong> <span id="selectedPoliceEmail"></span></div>
                                <div style="display: none;"><strong>🌐 Strona:</strong> <a id="selectedPoliceWebsite" href="#" target="_blank" style="color: #1565c0;">Otwórz</a></div>
                            </div>
                            <input type="hidden" id="selectedPoliceId" name="police_id">
                            <input type="hidden" id="selectedPoliceData" name="police_data">
                        </div>
                        
                        <!-- RĘCZNE POLA POLICJI -->
                        <div id="manualPoliceFields">
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">🚔 Komenda Policji (ręcznie)</label>
                                <input type="text" name="investigation_authority" id="manualPoliceAuthority" value="${this.escapeHtml(caseData.investigation_authority || '')}" placeholder="np. Komenda Rejonowa Policji Warszawa III" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                <small style="color: #666; font-size: 0.85rem; display: block; margin-top: 5px;">💡 Wypełni się automatycznie gdy wybierzesz komendę z bazy</small>
                            </div>
                            
                            <!-- DODATKOWE DANE POLICJI -->
                            <div style="background: #e1f5fe; padding: 12px; border-radius: 6px; border: 1px solid #81d4fa; margin-bottom: 15px;">
                                <div style="color: #1565c0; font-weight: 600; margin-bottom: 10px; font-size: 0.9rem;">📋 Dane kontaktowe komendy</div>
                                
                                <div style="margin-bottom: 12px;">
                                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.85rem;">📍 Adres komendy</label>
                                    <input type="text" name="police_address" id="policeAddress" value="${this.escapeHtml(caseData.police_address || '')}" placeholder="np. ul. Nowolipie 2, Warszawa" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                                </div>
                                
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                                    <div>
                                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.85rem;">📞 Telefon</label>
                                        <input type="text" name="police_phone" id="policePhone" value="${this.escapeHtml(caseData.police_phone || '')}" placeholder="np. (22) 603 11 11" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                                    </div>
                                    <div>
                                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.85rem;">✉️ Email</label>
                                        <input type="email" name="police_email" id="policeEmail" value="${this.escapeHtml(caseData.police_email || '')}" placeholder="np. kwp.warszawa@policja.gov.pl" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                                    </div>
                                </div>
                                
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.85rem;">🌐 Strona WWW</label>
                                    <input type="url" name="police_website" id="policeWebsite" value="${this.escapeHtml(caseData.police_website || '')}" placeholder="np. https://warszawa.policja.gov.pl" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                                </div>
                                
                                <small style="color: #1565c0; font-size: 0.8rem; display: block; margin-top: 8px;">💡 Te pola wypełnią się automatycznie gdy wybierzesz komendę z wyszukiwarki powyżej</small>
                            </div>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">📋 Sygnatura akt policyjnych</label>
                            <input type="text" name="police_case_number" value="${this.escapeHtml(caseData.police_case_number || '')}" placeholder="np. RSD-123/2025" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                    </div>
                    
                    <!-- ORGANY ŚCIGANIA - DLA POZOSTAŁYCH TYPÓW SPRAW -->
                    <div id="policeSection" style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3; display: none;">
                        <h4 style="margin: 0 0 8px 0; color: #1565c0; display: flex; align-items: center; gap: 8px;">
                            🚔 Organy ścigania
                        </h4>
                        <p style="margin: 0 0 15px 0; color: #666; font-size: 0.85rem; font-style: italic;">
                            (Jeśli dotyczy - np. w sprawach o odszkodowanie po wypadku - dane zostaną wypełnione w sekcji prokuratur powyżej)
                        </p>
                        
                        <div style="padding: 15px; background: #fff3e0; border-radius: 6px; border-left: 3px solid #ff9800;">
                            <strong style="color: #e65100;">ℹ️ Informacja:</strong>
                            <p style="margin: 8px 0 0 0; color: #666; font-size: 0.9rem;">
                                Dane organu dochodzeniowego (komendy policji) znajdują się w sekcji "Prokuratura i organy ścigania" powyżej.
                            </p>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">Opis sprawy</label>
                        <textarea id="updateCaseDescription" name="description" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;">${this.escapeHtml(caseData.description || '')}</textarea>
                    </div>
                </form>
            `);
            
            // Dodaj przyciski do nagłówka
            const headerButtons = document.getElementById('modalHeaderButtons');
            if (headerButtons) {
                headerButtons.innerHTML = `
                    <button type="button" onclick="document.getElementById('crmEditModal').remove();" style="padding: 8px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.9rem;">
                        Anuluj
                    </button>
                    <button type="submit" form="editCaseForm" style="padding: 8px 20px; background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.9rem;">
                        💾 Zapisz
                    </button>
                `;
            }
            
            document.getElementById('editCaseForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.saveCaseEdits(caseId, e.target);
            });
            
            // Wywołaj funkcje inicjalizacyjne po załadowaniu DOM
            setTimeout(() => {
                // Wypełnij select typami spraw (takie same jak przy dodawaniu)
                const editCaseTypeSelect = document.getElementById('editCaseType');
                if (window.caseTypeConfig && editCaseTypeSelect) {
                    window.caseTypeConfig.typeGroups.forEach(group => {
                        const optgroup = document.createElement('optgroup');
                        optgroup.label = group.label;
                        
                        group.subtypes.forEach(subtype => {
                            const option = document.createElement('option');
                            option.value = subtype.value;
                            option.textContent = `${subtype.label}`;
                            option.dataset.mainType = group.mainType;
                            option.dataset.prefix = subtype.prefix;
                            
                            // Zaznacz aktualny podtyp sprawy
                            if (subtype.value === caseData.case_subtype || 
                                (subtype.value === caseData.case_type && !caseData.case_subtype)) {
                                option.selected = true;
                            }
                            
                            optgroup.appendChild(option);
                        });
                        
                        editCaseTypeSelect.appendChild(optgroup);
                    });
                    
                    console.log('✅ Załadowano typy spraw do edycji (Enhanced):', caseData.case_type, caseData.case_subtype);
                }
                
                window.updateCourtHint();
                window.updateProsecutorSection();
                
                // 📝 Inicjalizuj Rich Text Editor dla opisu sprawy
                if (window.RichTextEditor) {
                    window.RichTextEditor.init('updateCaseDescription', caseData.description || '');
                    console.log('✅ Rich Text Editor zainicjalizowany dla aktualizacji sprawy');
                }
            }, 100);
            
        } catch (error) {
            console.error('❌ Błąd ładowania danych sprawy:', error);
            await this.customAlert('Błąd: ' + error.message, 'error');
        }
    }
    
    // Helper: Tworzenie modala edycji (z innym ID niż główny modal)
    createEditModal(title, content) {
        // Usuń stary modal edycji jeśli istnieje
        const oldModal = document.getElementById('crmEditModal');
        if (oldModal) oldModal.remove();

        const modal = document.createElement('div');
        modal.id = 'crmEditModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.7);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
        `;

        modal.innerHTML = `
            <div style="background: white; border-radius: 0; width: 100vw; height: 100vh; overflow-y: auto; box-sizing: border-box; display: flex; flex-direction: column;">
                ${title ? `
                    <div style="padding: 20px; border-bottom: 2px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;">
                        <h3 style="margin: 0; color: #1a2332;">${title}</h3>
                        <div id="modalHeaderButtons" style="display: flex; gap: 10px;"></div>
                    </div>
                ` : ''}
                <div style="flex: 1; padding: ${title ? '20px' : '0'}; overflow-y: auto;">
                    ${content}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Zamknij modal przy kliknięciu w tło
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        return modal;
    }
    
    async saveCaseEdits(caseId, form) {
        try {
            const formData = new FormData(form);
            
            // Konwersja podtypu na główny typ
            const caseSubtype = formData.get('case_type');
            const mainType = window.getMainTypeFromSubtype ? window.getMainTypeFromSubtype(caseSubtype) : caseSubtype;
            
            // Pobierz tylko wartości z ENABLED pól (disabled są ignorowane przez FormData)
            const updateData = {
                case_number: formData.get('case_number'),
                title: formData.get('title'),
                case_type: mainType,
                case_subtype: caseSubtype,
                priority: formData.get('priority'),
                status: formData.get('status') || 'open',
                description: formData.get('description') || null,
                // Informacje sądowe - podstawowe
                court_type: formData.get('court_type') || null,
                court_name: formData.get('court_name') || null,
                court_department: formData.get('court_department') || null,
                court_signature: formData.get('court_signature') || null,
                judge_name: formData.get('judge_name') || null,
                referent: formData.get('referent') || null,
                // Informacje sądowe - z bazy danych sądów
                court_id: formData.get('court_id') || null,
                // Prokuratura i organy ścigania (tylko z aktywnej sekcji)
                prosecutor_office: formData.get('prosecutor_office') || null,
                prosecutor_name: formData.get('prosecutor_name') || null,
                indictment_number: formData.get('indictment_number') || null,
                auxiliary_prosecutor: formData.get('auxiliary_prosecutor') || null,
                investigation_authority: formData.get('investigation_authority') || null,
                police_case_number: formData.get('police_case_number') || null
            };
            
            // Jeśli wybrano sąd z bazy, dodaj jego szczegółowe dane
            const courtData = formData.get('court_data');
            if (courtData) {
                try {
                    const court = JSON.parse(courtData);
                    updateData.court_address = court.address;
                    updateData.court_phone = court.phone;
                    updateData.court_email = court.email;
                    updateData.court_website = court.website;
                    updateData.court_coordinates = JSON.stringify(court.coordinates);
                    console.log('✅ Zapisuję dane sądu z bazy:', court.name);
                } catch (e) {
                    console.error('❌ Błąd parsowania court_data:', e);
                }
            } else {
                // Jeśli NIE wybrano z bazy, weź z ręcznych pól
                updateData.court_address = formData.get('court_address') || null;
                updateData.court_phone = formData.get('court_phone') || null;
                updateData.court_email = formData.get('court_email') || null;
                updateData.court_website = formData.get('court_website') || null;
            }
            
            // Jeśli wybrano prokuraturę z bazy, dodaj jej szczegółowe dane
            const prosecutorData = formData.get('prosecutor_data');
            console.log('🔍 DEBUG: prosecutor_data z FormData:', prosecutorData);
            if (prosecutorData) {
                try {
                    const prosecutor = JSON.parse(prosecutorData);
                    updateData.prosecutor_id = prosecutor.id;
                    updateData.prosecutor_office = prosecutor.name;
                    updateData.prosecutor_address = prosecutor.address;
                    updateData.prosecutor_phone = prosecutor.phone;
                    updateData.prosecutor_email = prosecutor.email;
                    updateData.prosecutor_website = prosecutor.website;
                    console.log('✅ Zapisuję dane prokuratury z bazy:', prosecutor.name);
                    console.log('📦 Pełne dane prokuratury:', prosecutor);
                } catch (e) {
                    console.error('❌ Błąd parsowania prosecutor_data:', e);
                }
            } else {
                console.warn('⚠️ BRAK prosecutor_data w FormData!');
                console.log('🔍 Sprawdzam czy element istnieje:', document.getElementById('selectedProsecutorData'));
                console.log('🔍 Wartość elementu:', document.getElementById('selectedProsecutorData')?.value);
            }
            
            // ✨ NOWE: Jeśli wybrano komendę policji z bazy, dodaj jej szczegółowe dane
            const policeData = formData.get('police_data');
            console.log('🚔 DEBUG: police_data z FormData:', policeData);
            if (policeData) {
                try {
                    const police = JSON.parse(policeData);
                    updateData.police_id = police.id;
                    updateData.investigation_authority = police.name;
                    updateData.police_address = police.address;
                    updateData.police_phone = police.phone;
                    updateData.police_email = police.email;
                    updateData.police_website = police.website;
                    console.log('✅ Zapisuję dane komendy policji z bazy:', police.name);
                    console.log('📦 Pełne dane policji:', police);
                } catch (e) {
                    console.error('❌ Błąd parsowania police_data:', e);
                }
            } else {
                console.warn('⚠️ BRAK police_data w FormData!');
                console.log('🔍 Sprawdzam czy element police_data istnieje:', document.getElementById('selectedPoliceData'));
                console.log('🔍 Wartość elementu:', document.getElementById('selectedPoliceData')?.value);
            }
            
            console.log('💾 Zapisywanie zmian:', updateData);
            console.log('📋 investigation_authority:', updateData.investigation_authority);
            console.log('📋 police_case_number:', updateData.police_case_number);
            console.log('🚔 police_id:', updateData.police_id);
            console.log('🚔 police_address:', updateData.police_address);
            console.log('🚔 police_phone:', updateData.police_phone);
            
            const response = await window.api.request(`/cases/${caseId}`, {
                method: 'PUT',
                body: JSON.stringify(updateData)
            });
            
            if (!response.success) {
                throw new Error(response.message || 'Błąd aktualizacji');
            }
            
            await this.customAlert('Zaktualizowano!', 'success');
            
            // Zamknij modal edycji (crmEditModal)
            const editModal = document.getElementById('crmEditModal');
            if (editModal) editModal.remove();
            
            // Odśwież listę spraw w tle
            await this.loadCases();
            
            // Sprawdź czy modal sprawy jest otwarty
            const caseTabContent = document.getElementById('caseTabContent');
            if (caseTabContent) {
                // Modal sprawy jest otwarty - odśwież zakładkę szczegółów
                console.log('✅ Modal sprawy otwarty - odświeżam zakładkę szczegółów');
                if (window.crmManager && window.crmManager.switchCaseTab) {
                    window.crmManager.switchCaseTab(caseId, 'details');
                }
            } else {
                // Modal sprawy jest zamknięty - nic nie rób
                console.log('ℹ️ Modal sprawy jest zamknięty');
            }
            
        } catch (error) {
            console.error('❌ Błąd:', error);
            await this.customAlert('Błąd: ' + error.message, 'error');
        }
    }
}

// Funkcje globalne
window.showEditCaseModal = function(caseId) {
    window.crmManager.showEditCaseModalEnhanced(caseId);
};

// Nowa nazwa - aby uniknąć konfliktów z cache
window.showEditCaseModalEnhanced = function(caseId) {
    window.crmManager.showEditCaseModalEnhanced(caseId);
};

// Funkcja wyboru sądu z autocomplete - WYPEŁNIA WSZYSTKIE POLA
window.selectCourtFromAutocomplete = async function(courtId) {
    try {
        console.log('🏛️ Wybrano sąd z ID:', courtId);
        
        // Pobierz pełne dane sądu
        const response = await window.api.request(`/courts/${courtId}`);
        const court = response.court;
        
        console.log('✅ Dane sądu:', court);
        
        // 1. Ustaw ukryte pola (dla zapisu)
        document.getElementById('selectedCourtId').value = court.id;
        document.getElementById('selectedCourtData').value = JSON.stringify(court);
        
        // 2. WYPEŁNIJ WIDOCZNE POLA
        document.getElementById('manualCourtName').value = court.name || '';
        document.getElementById('manualCourtAddress').value = court.address || '';
        document.getElementById('manualCourtPhone').value = court.phone || '';
        document.getElementById('manualCourtEmail').value = court.email || '';
        document.getElementById('manualCourtWebsite').value = court.website || '';
        
        // 3. Pokaż kartę informacyjną (opcjonalnie)
        const infoDiv = document.getElementById('selectedCourtInfo');
        if (infoDiv) {
            infoDiv.innerHTML = `
                <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <strong style="color: #0d47a1; font-size: 1.1rem;">🏛️ ${court.name}</strong>
                        <button onclick="window.clearSelectedCourt()" style="padding: 5px 12px; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">✖ Usuń</button>
                    </div>
                    <div style="color: #1565c0; font-size: 0.95rem; line-height: 1.8;">
                        <div>📍 <strong>Adres:</strong> ${court.address}</div>
                        <div>📞 <strong>Telefon:</strong> ${court.phone}</div>
                        <div>✉️ <strong>Email:</strong> ${court.email}</div>
                        ${court.website ? `<div style="margin-top: 8px;"><a href="${court.website}" target="_blank" style="color: #2196f3; text-decoration: none; font-weight: 600;">🌐 Otwórz stronę sądu</a></div>` : ''}
                    </div>
                </div>
            `;
            infoDiv.style.display = 'block';
        }
        
        // 4. Ukryj dropdown z sugestiami
        const suggestionsDiv = document.getElementById('courtSuggestions');
        if (suggestionsDiv) {
            suggestionsDiv.style.display = 'none';
        }
        
        // 5. Wyczyść pole wyszukiwania
        const searchInput = document.getElementById('courtSearchInput');
        if (searchInput) {
            searchInput.value = '';
        }
        
        console.log('✅ Wszystkie pola wypełnione!');
        
        // 6. Animacja potwierdzenia
        [document.getElementById('manualCourtName'),
         document.getElementById('manualCourtAddress'),
         document.getElementById('manualCourtPhone'),
         document.getElementById('manualCourtEmail'),
         document.getElementById('manualCourtWebsite')].forEach(field => {
            if (field) {
                field.style.background = '#d4edda';
                field.style.borderColor = '#28a745';
                setTimeout(() => {
                    field.style.background = 'white';
                    field.style.borderColor = '#ddd';
                }, 2000);
            }
        });
        
    } catch (error) {
        console.error('❌ Błąd wyboru sądu:', error);
        alert('Błąd: ' + error.message);
    }
};

// Funkcja czyszczenia wybranego sądu
window.clearSelectedCourt = function() {
    // Wyczyść ukryte pola
    document.getElementById('selectedCourtId').value = '';
    document.getElementById('selectedCourtData').value = '';
    
    // Ukryj kartę informacyjną
    const infoDiv = document.getElementById('selectedCourtInfo');
    if (infoDiv) {
        infoDiv.style.display = 'none';
    }
    
    console.log('🗑️ Wyczyszczono wybór sądu');
};

// ========== SYSTEM WYSZUKIWANIA SĄDÓW ==========

window.searchCourtsLive = async function(query) {
    const suggestionsDiv = document.getElementById('courtSuggestions');
    
    if (!suggestionsDiv) return;
    
    // Jeśli zapytanie < 2 znaki, ukryj sugestie
    if (query.length < 2) {
        suggestionsDiv.style.display = 'none';
        return;
    }
    
    try {
        console.log('🔍 Wyszukiwanie sądów:', query);
        const response = await window.api.request(`/courts/search?q=${encodeURIComponent(query)}`);
        const courts = response.courts || [];
        
        console.log(`✅ Znaleziono ${courts.length} sądów`);
        
        if (courts.length === 0) {
            suggestionsDiv.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #999;">
                    Nie znaleziono sądów dla: "<strong>${query}</strong>"
                </div>
            `;
            suggestionsDiv.style.display = 'block';
            return;
        }
        
        // Wyświetl sugestie
        suggestionsDiv.innerHTML = courts.map(court => `
            <div onclick="window.selectCourtFromAutocomplete('${court.id}')" 
                 style="padding: 15px; border-bottom: 1px solid #e0e0e0; cursor: pointer; transition: background 0.2s;"
                 onmouseover="this.style.background='#e3f2fd'"
                 onmouseout="this.style.background='white'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <strong style="color: #0d47a1; font-size: 1.05rem;">${court.name}</strong>
                    <span style="background: #2196f3; color: white; padding: 3px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">${court.type}</span>
                </div>
                <div style="color: #666; font-size: 0.9rem;">
                    📍 ${court.address}
                </div>
                <div style="color: #999; font-size: 0.85rem; margin-top: 4px;">
                    📞 ${court.phone} | ✉️ ${court.email}
                </div>
            </div>
        `).join('');
        
        suggestionsDiv.style.display = 'block';
        
    } catch (error) {
        console.error('❌ Błąd wyszukiwania sądów:', error);
        suggestionsDiv.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #dc3545;">
                ❌ Błąd wyszukiwania: ${error.message}
            </div>
        `;
        suggestionsDiv.style.display = 'block';
    }
};

window.selectCourt = async function(courtId) {
    try {
        console.log('✅ Wybrano sąd:', courtId);
        
        // Pobierz szczegóły sądu
        const response = await window.api.request(`/courts/${courtId}`);
        const court = response.court;
        
        console.log('📋 Dane sądu:', court);
        
        // Ukryj dropdown
        document.getElementById('courtSuggestions').style.display = 'none';
        
        // Pokaż kartę z informacjami o sądzie
        const infoDiv = document.getElementById('selectedCourtInfo');
        infoDiv.style.display = 'block';
        
        // Wypełnij informacje
        document.getElementById('selectedCourtName').textContent = `🏛️ ${court.name}`;
        document.getElementById('selectedCourtAddress').textContent = court.address;
        document.getElementById('selectedCourtPhone').textContent = court.phone;
        document.getElementById('selectedCourtEmail').textContent = court.email;
        document.getElementById('selectedCourtWebsite').href = court.website;
        
        // Zapisz dane do hidden fields
        document.getElementById('selectedCourtId').value = court.id;
        document.getElementById('selectedCourtData').value = JSON.stringify({
            id: court.id,
            name: court.name,
            address: court.address,
            phone: court.phone,
            email: court.email,
            coordinates: court.coordinates,
            departments: court.departments
        });
        
        // Wypełnij pola formularza
        const courtNameInput = document.querySelector('input[name="court_name"]');
        if (courtNameInput) courtNameInput.value = court.name;
        
        // Wyczyść wyszukiwarkę
        document.getElementById('courtSearchInput').value = '';
        
        // Ukryj ręczne pola (bo wybrano z bazy)
        document.getElementById('manualCourtFields').style.display = 'none';
        
        // Zasugeruj wydziały
        if (court.departments && court.departments.length > 0) {
            console.log('💡 Dostępne wydziały:', court.departments);
        }
        
    } catch (error) {
        console.error('❌ Błąd wybierania sądu:', error);
        alert('Błąd: ' + error.message);
    }
};

window.clearSelectedCourt = function() {
    // Ukryj kartę
    document.getElementById('selectedCourtInfo').style.display = 'none';
    
    // Wyczyść hidden fields
    document.getElementById('selectedCourtId').value = '';
    document.getElementById('selectedCourtData').value = '';
    
    // Pokaż ręczne pola
    document.getElementById('manualCourtFields').style.display = 'block';
    
    console.log('🗑️ Usunięto wybrany sąd');
};

// ========== GLOBALNE WYSZUKIWANIE ==========

window.crmManager = window.crmManager || new CRMManager();

window.crmManager.globalSearch = async function(query) {
    const resultsDiv = document.getElementById('globalSearchResults');
    
    if (!query || query.length < 3) {
        resultsDiv.style.display = 'none';
        return;
    }
    
    try {
        console.log('🔍 Wyszukiwanie globalne:', query);
        
        // Wywołaj API wyszukiwania
        const response = await window.api.request(`/search?q=${encodeURIComponent(query)}`);
        
        const cases = response.cases || [];
        const clients = response.clients || [];
        const documents = response.documents || [];
        const events = response.events || [];
        const evidence = response.evidence || [];
        const witnesses = response.witnesses || [];
        const testimonies = response.testimonies || [];
        
        const totalResults = cases.length + clients.length + documents.length + events.length + evidence.length + witnesses.length + testimonies.length;
        
        console.log(`✅ Znaleziono: ${totalResults} wyników`);
        
        if (totalResults === 0) {
            resultsDiv.innerHTML = `
                <div style="padding: 30px; text-align: center; color: #999;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">🔍</div>
                    <div style="font-size: 1.1rem; font-weight: 600; color: #1a2332; margin-bottom: 8px;">Brak wyników</div>
                    <div>Nie znaleziono niczego dla: "<strong>${this.escapeHtml(query)}</strong>"</div>
                </div>
            `;
            resultsDiv.style.display = 'block';
            return;
        }
        
        let html = `<div style="padding: 15px;">`;
        
        // Sprawy
        if (cases.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #1a2332; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">⚖️ Sprawy (${cases.length})</h4>
                    ${cases.map(c => `
                        <div onclick="crmManager.viewCase(${c.id}); document.getElementById('globalSearchResults').style.display='none'; document.getElementById('globalSearch').value='';" 
                             style="padding: 12px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; background: white; border: 1px solid #e0e0e0; transition: all 0.2s;"
                             onmouseover="this.style.background='#f5f5f5'; this.style.borderColor='#FFD700';"
                             onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0';">
                            <div style="font-weight: 600; color: #1a2332; margin-bottom: 4px;">${this.escapeHtml(c.case_number)} - ${this.escapeHtml(c.title)}</div>
                            <div style="font-size: 0.85rem; color: #666;">${this.escapeHtml(c.case_type || 'Nieznany typ')}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Dowody
        if (evidence.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #1a2332; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">📦 Dowody (${evidence.length})</h4>
                    ${evidence.map(e => `
                        <div onclick="crmManager.openEvidenceFromSearch(${e.id}, ${e.case_id}); document.getElementById('globalSearchResults').style.display='none'; document.getElementById('globalSearch').value='';" 
                             style="padding: 12px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; background: white; border: 1px solid #e0e0e0; transition: all 0.2s;"
                             onmouseover="this.style.background='#fff3e0'; this.style.borderColor='#f39c12';"
                             onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0';">
                            <div style="font-weight: 600; color: #1a2332; margin-bottom: 4px;">🔍 ${this.escapeHtml(e.evidence_code)} - ${this.escapeHtml(e.name)}</div>
                            <div style="font-size: 0.85rem; color: #666;">Sprawa: ${this.escapeHtml(e.case_number || 'Brak')}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Klienci
        if (clients.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #1a2332; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">👤 Klienci (${clients.length})</h4>
                    ${clients.map(cl => `
                        <div onclick="crmManager.showClientDetails(${cl.id}); document.getElementById('globalSearchResults').style.display='none'; document.getElementById('globalSearch').value='';" 
                             style="padding: 12px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; background: white; border: 1px solid #e0e0e0; transition: all 0.2s;"
                             onmouseover="this.style.background='#e3f2fd'; this.style.borderColor='#2196f3';"
                             onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0';">
                            <div style="font-weight: 600; color: #1a2332; margin-bottom: 4px;">${this.escapeHtml(cl.first_name)} ${this.escapeHtml(cl.last_name)}</div>
                            <div style="font-size: 0.85rem; color: #666;">${this.escapeHtml(cl.email || 'Brak email')}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Wydarzenia
        if (events.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #1a2332; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">📅 Wydarzenia (${events.length})</h4>
                    ${events.map(ev => `
                        <div onclick="if(window.viewEventDetails) { window.viewEventDetails(${ev.id}); document.getElementById('globalSearchResults').style.display='none'; document.getElementById('globalSearch').value=''; } else { crmManager.viewCase(${ev.case_id}); document.getElementById('globalSearchResults').style.display='none'; document.getElementById('globalSearch').value=''; }" 
                             style="padding: 12px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; background: white; border: 1px solid #e0e0e0; transition: all 0.2s;"
                             onmouseover="this.style.background='#f3e5f5'; this.style.borderColor='#9c27b0';"
                             onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0';">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; color: #1a2332; margin-bottom: 4px;">${this.escapeHtml(ev.event_code || ev.title)}</div>
                                    <div style="font-size: 0.85rem; color: #666;">📅 ${new Date(ev.start_date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
                                    ${ev.location ? `<div style="font-size: 0.85rem; color: #999; margin-top: 2px;">📍 ${this.escapeHtml(ev.location)}</div>` : ''}
                                </div>
                                <div style="font-size: 1.5rem;">👁️</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Dokumenty - styl jak Dowody
        if (documents.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #1a2332; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">📄 DOKUMENTY (${documents.length})</h4>
                    ${documents.map(d => `
                        <div onclick="crmManager.openDocumentFromSearch(${d.id}, ${d.case_id}); document.getElementById('globalSearchResults').style.display='none'; document.getElementById('globalSearch').value='';" 
                             style="padding: 12px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; background: white; border: 1px solid #e0e0e0; transition: all 0.2s;"
                             onmouseover="this.style.background='#e8f5e9'; this.style.borderColor='#4caf50';"
                             onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0';">
                            <div style="font-weight: 600; color: #1a2332; margin-bottom: 4px;">🔍 ${this.escapeHtml(d.document_code || d.document_number || 'DOK')} - ${this.escapeHtml(d.title || d.filename)}</div>
                            <div style="font-size: 0.85rem; color: #666;">Sprawa: ${this.escapeHtml(d.case_number || 'Brak')}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        // Świadkowie
        if (witnesses.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #1a2332; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">👤 Świadkowie (${witnesses.length})</h4>
                    ${witnesses.map(w => {
                        // Ukryj imię i nazwisko - zawsze 4 i 5 gwiazdek (RODO)
                        const firstNameMasked = '****';
                        const lastNameMasked = '*****';
                        return `
                        <div onclick="crmManager.openWitnessFromSearch(${w.id}, ${w.case_id}); document.getElementById('globalSearchResults').style.display='none'; document.getElementById('globalSearch').value='';" 
                             style="padding: 12px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; background: white; border: 1px solid #e0e0e0; transition: all 0.2s;"
                             onmouseover="this.style.background='#fff3e0'; this.style.borderColor='#ff9800';"
                             onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0';">
                            <div style="font-weight: 600; color: #1a2332; margin-bottom: 4px;">👤 ${this.escapeHtml(w.witness_code)} - ${firstNameMasked} ${lastNameMasked}</div>
                            <div style="font-size: 0.85rem; color: #666;">Rola: ${this.escapeHtml(w.role || 'Brak')} • Sprawa: ${this.escapeHtml(w.case_number || 'Brak')}</div>
                        </div>
                    `;
                    }).join('')}
                </div>
            `;
        }
        
        // Zeznania świadków
        if (testimonies.length > 0) {
            html += `
                <div style="margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #1a2332; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.5px;">📝 Zeznania świadków (${testimonies.length})</h4>
                    ${testimonies.map(t => {
                        const testimonyPreview = (t.testimony_content || '').substring(0, 100);
                        const testimonyDate = new Date(t.testimony_date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
                        // Ukryj imię i nazwisko - zawsze 4 i 5 gwiazdek (RODO)
                        const firstNameMasked = '****';
                        const lastNameMasked = '*****';
                        return `
                        <div onclick="crmManager.openWitnessFromSearch(${t.id}, ${t.case_id}); document.getElementById('globalSearchResults').style.display='none'; document.getElementById('globalSearch').value='';" 
                             style="padding: 12px; border-radius: 6px; margin-bottom: 8px; cursor: pointer; background: white; border: 1px solid #e0e0e0; transition: all 0.2s;"
                             onmouseover="this.style.background='#e8eaf6'; this.style.borderColor='#5c6bc0';"
                             onmouseout="this.style.background='white'; this.style.borderColor='#e0e0e0';">
                            <div style="font-weight: 600; color: #1a2332; margin-bottom: 4px;">📝 ${this.escapeHtml(t.witness_code)} - ${firstNameMasked} ${lastNameMasked}</div>
                            <div style="font-size: 0.85rem; color: #666; margin-bottom: 4px;">📅 ${testimonyDate} • Wersja: ${t.version_number} • Typ: ${this.escapeHtml(t.testimony_type || 'Pisemne')}</div>
                            <div style="font-size: 0.85rem; color: #999; font-style: italic;">${this.escapeHtml(testimonyPreview)}${testimonyPreview.length >= 100 ? '...' : ''}</div>
                            <div style="font-size: 0.85rem; color: #666; margin-top: 4px;">Sprawa: ${this.escapeHtml(t.case_number || 'Brak')}</div>
                        </div>
                    `;
                    }).join('')}
                </div>
            `;
        }
        
        html += `</div>`;
        
        resultsDiv.innerHTML = html;
        resultsDiv.style.display = 'block';
        
    } catch (error) {
        console.error('❌ Błąd wyszukiwania:', error);
        resultsDiv.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #dc3545;">
                ❌ Błąd wyszukiwania: ${error.message}
            </div>
        `;
        resultsDiv.style.display = 'block';
    }
};

// =====================================
// WIDOK KLIENTA (alias dla showClientDetails)
// =====================================
CRMManager.prototype.viewClient = function(clientId) {
    console.log(`📊 viewClient wywołane dla klienta ID: ${clientId}`);
    // Wywołaj istniejącą funkcję showClientDetails
    this.showClientDetails(clientId);
};

// =====================================
// OTWÓRZ DOWÓD Z WYSZUKIWARKI
// =====================================
CRMManager.prototype.openEvidenceFromSearch = function(evidenceId, caseId) {
    console.log('🔍 Otwieranie dowodu z wyszukiwarki:', evidenceId, 'w sprawie:', caseId);
    
    // Przełącz na CRM
    if (window.showTab) window.showTab('crm');
    
    // Otwórz sprawę BEZ pokazywania szczegółów - od razu idź do dowodów
    this.viewCase(caseId);
    
    // NATYCHMIAST przełącz na zakładkę Dowody (bez czekania)
    setTimeout(() => {
        if (window.goToEvidence) {
            console.log('✅ Wywołuję window.goToEvidence - bezpośrednio do dowodu');
            window.goToEvidence(caseId, evidenceId);
        } else {
            console.error('❌ Funkcja window.goToEvidence nie istnieje!');
        }
    }, 300); // Skrócony czas - szybsze przejście
};

// =====================================
// OTWÓRZ DOKUMENT Z WYSZUKIWARKI
// =====================================
CRMManager.prototype.openDocumentFromSearch = function(documentId, caseId) {
    console.log('📄 Otwieranie dokumentu z wyszukiwarki:', documentId, 'w sprawie:', caseId);
    
    // Przełącz na CRM
    if (window.showTab) window.showTab('crm');
    
    // Otwórz sprawę
    setTimeout(() => {
        this.viewCase(caseId);
        
        // Przełącz na zakładkę dokumentów
        setTimeout(() => {
            const documentsTab = document.querySelector(`[onclick*="renderDocumentsTab(${caseId})"]`);
            if (documentsTab) {
                documentsTab.click();
                
                // Podświetl konkretny dokument
                setTimeout(() => {
                    const documentCard = document.getElementById(`document_${documentId}`);
                    if (documentCard) {
                        documentCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        documentCard.style.background = '#d4edda';
                        documentCard.style.transition = 'background 2s';
                        setTimeout(() => {
                            documentCard.style.background = '';
                        }, 2000);
                    }
                }, 500);
            }
        }, 800);
    }, 300);
};

// =====================================
// OTWÓRZ ŚWIADKA Z WYSZUKIWARKI
// =====================================
CRMManager.prototype.openWitnessFromSearch = function(witnessId, caseId) {
    console.log('👤 Otwieranie świadka z wyszukiwarki:', witnessId, 'w sprawie:', caseId);
    
    // Przełącz na CRM
    if (window.showTab) window.showTab('crm');
    
    // Otwórz sprawę
    this.viewCase(caseId);
    
    // Przełącz na zakładkę Świadków
    setTimeout(() => {
        if (window.goToWitness) {
            console.log('✅ Wywołuję window.goToWitness - przejście do świadka');
            window.goToWitness(caseId, witnessId);
        } else {
            console.error('❌ Funkcja window.goToWitness nie istnieje!');
            // Fallback - spróbuj kliknąć zakładkę ręcznie
            const witnessesTab = document.querySelector(`[onclick*="renderWitnessesTab(${caseId})"]`);
            if (witnessesTab) {
                witnessesTab.click();
                
                // Podświetl kartę świadka
                setTimeout(() => {
                    const witnessCard = document.getElementById(`witness_${witnessId}`);
                    if (witnessCard) {
                        witnessCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        witnessCard.style.background = '#fff3e0';
                        witnessCard.style.transition = 'background 2s';
                        setTimeout(() => {
                            witnessCard.style.background = '';
                        }, 2000);
                    }
                }, 500);
            }
        }
    }, 600);
};

// =====================================
// WYŚWIETL WSZYSTKIE SPRAWY KLIENTA
// =====================================
CRMManager.prototype.viewClientCases = async function(clientId) {
    try {
        console.log('📂 Pobieranie spraw klienta:', clientId);
        
        // Pobierz informacje o kliencie
        const clientResponse = await window.api.request(`/clients/${clientId}`);
        const client = clientResponse.client;
        
        // Pobierz sprawy klienta
        const casesResponse = await window.api.request(`/cases?client_id=${clientId}`);
        const cases = casesResponse.cases || [];
        
        console.log(`✅ Znaleziono ${cases.length} spraw dla klienta:`, client.first_name, client.last_name);
        
        // Utwórz modal ze sprawami
        this.createModal(`📂 Sprawy klienta: ${client.first_name} ${client.last_name}`, `
            <div style="max-width: 1200px; margin: 0 auto; position: relative;">
                <!-- Przycisk zamknięcia w prawym górnym rogu -->
                <button onclick="crmManager.closeModal()" style="position: absolute; top: 10px; right: 10px; width: 40px; height: 40px; background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.5); border-radius: 50%; cursor: pointer; font-weight: bold; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; z-index: 10; transition: all 0.3s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'; this.style.transform='scale(1.1)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='scale(1)'">
                    ✕
                </button>
                
                <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-top: 4px solid #FFD700;">
                    <h3 style="margin: 0 0 10px 0; font-size: 1.3rem; color: #FFD700;">👤 ${this.escapeHtml(client.first_name)} ${this.escapeHtml(client.last_name)}</h3>
                    ${client.company_name ? `<p style="margin: 0; opacity: 0.9; color: #d4af37;">🏢 ${this.escapeHtml(client.company_name)}</p>` : ''}
                    <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 0.95rem;">
                        📧 ${this.escapeHtml(client.email || '-')} | 📞 ${this.escapeHtml(client.phone || '-')}
                    </p>
                </div>
                
                ${cases.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; background: #f9f9f9; border-radius: 8px;">
                        <div style="font-size: 4rem; margin-bottom: 20px;">📭</div>
                        <h3 style="color: #666; margin: 0 0 10px 0;">Brak spraw</h3>
                        <p style="color: #999; margin: 0;">Ten klient nie ma jeszcze żadnych spraw</p>
                        <button onclick="crmManager.closeModal(); crmManager.showAddCase()" style="margin-top: 20px; padding: 12px 24px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #d4af37; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 12px rgba(212,175,55,0.3);">
                            ➕ Dodaj pierwszą sprawę
                        </button>
                    </div>
                ` : `
                    <div style="display: grid; gap: 15px;">
                        ${cases.map(c => {
                            const statusColors = {
                                open: { bg: '#d4edda', color: '#155724', icon: '🟢', label: 'Otwarta' },
                                in_progress: { bg: '#fff3cd', color: '#856404', icon: '🟡', label: 'W toku' },
                                closed: { bg: '#f8d7da', color: '#721c24', icon: '🔴', label: 'Zamknięta' }
                            };
                            
                            const priorityColors = {
                                low: { icon: '🔵', label: 'Niski' },
                                medium: { icon: '🟡', label: 'Średni' },
                                high: { icon: '🔴', label: 'Wysoki' }
                            };
                            
                            const status = statusColors[c.status] || statusColors.open;
                            const priority = priorityColors[c.priority] || priorityColors.medium;
                            
                            return `
                                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 5px solid #1a2332; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s; cursor: pointer;"
                                     onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(212,175,55,0.3)'"
                                     onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'"
                                     onclick="crmManager.closeModal(); crmManager.viewCase(${c.id})">
                                    
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px; flex-wrap: wrap; gap: 10px;">
                                        <div style="flex: 1;">
                                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                                                <strong style="font-size: 1.2rem; color: #1a2332;">${this.escapeHtml(c.case_number)}</strong>
                                                <span style="padding: 4px 12px; background: ${status.bg}; color: ${status.color}; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                                                    ${status.icon} ${status.label}
                                                </span>
                                                <span style="padding: 4px 12px; background: #e3f2fd; color: #1565c0; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                                                    ${priority.icon} ${priority.label}
                                                </span>
                                            </div>
                                            <h4 style="margin: 0 0 10px 0; color: #1a2332; font-size: 1.1rem;">${this.escapeHtml(c.title)}</h4>
                                            ${c.description ? `
                                                <p style="margin: 0 0 10px 0; color: #666; font-size: 0.9rem; line-height: 1.5;">
                                                    ${this.getDescriptionPreview(c.description, 150)}
                                                </p>
                                            ` : ''}
                                        </div>
                                    </div>
                                    
                                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                                        <div>
                                            <div style="font-size: 0.8rem; color: #999; margin-bottom: 4px;">📁 Typ sprawy</div>
                                            <div style="font-weight: 600; color: #1a2332;">${this.escapeHtml(c.case_type || 'Nie określono')}</div>
                                        </div>
                                        ${c.court_name ? `
                                            <div>
                                                <div style="font-size: 0.8rem; color: #999; margin-bottom: 4px;">🏛️ Sąd</div>
                                                <div style="font-weight: 600; color: #1a2332;">${this.escapeHtml(c.court_name)}</div>
                                            </div>
                                        ` : ''}
                                        ${c.court_signature ? `
                                            <div>
                                                <div style="font-size: 0.8rem; color: #999; margin-bottom: 4px;">📋 Sygnatura</div>
                                                <div style="font-weight: 600; color: #1a2332;">${this.escapeHtml(c.court_signature)}</div>
                                            </div>
                                        ` : ''}
                                        ${c.assigned_to_name ? `
                                            <div>
                                                <div style="font-size: 0.8rem; color: #999; margin-bottom: 4px;">👨‍⚖️ Mecenas</div>
                                                <div style="font-weight: 600; color: #1a2332;">${this.escapeHtml(c.assigned_to_name)}</div>
                                            </div>
                                        ` : ''}
                                        <div>
                                            <div style="font-size: 0.8rem; color: #999; margin-bottom: 4px;">📅 Utworzono</div>
                                            <div style="font-weight: 600; color: #1a2332;">${new Date(c.created_at).toLocaleDateString('pl-PL')}</div>
                                        </div>
                                    </div>
                                    
                                    <div style="margin-top: 15px; display: flex; gap: 8px;">
                                        <button onclick="event.stopPropagation(); crmManager.closeModal(); crmManager.viewCase(${c.id})" 
                                                style="padding: 8px 16px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #d4af37; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 0.9rem; box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);">
                                            👁️ Otwórz sprawę
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center;">
                        <button onclick="crmManager.closeModal(); crmManager.showAddCase()" 
                                style="padding: 12px 24px; background: linear-gradient(135deg, #1a2332, #2c3e50); color: #FFD700; border: 2px solid #FFD700; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 12px rgba(212,175,55,0.3);">
                            ➕ Dodaj nową sprawę
                        </button>
                    </div>
                `}
            </div>
        `);
        
    } catch (error) {
        console.error('❌ Błąd pobierania spraw klienta:', error);
        await this.customAlert('Błąd pobierania spraw: ' + error.message, 'error');
    }
};

// =====================================
// ODDAJ SPRAWĘ
// =====================================
CRMManager.prototype.releaseCase = async function(caseId) {
    const confirmed = confirm('Czy na pewno chcesz oddać tę sprawę?\n\nSprawa wróci do puli dostępnych i będzie mogła być przejęta przez innego mecenasa.');
    
    if (!confirmed) return;
    
    try {
        const response = await window.api.request(`/cases/${caseId}/unassign`, {
            method: 'POST'
        });
        
        if (response.success) {
            await this.customAlert('✅ Sprawa została oddana i jest dostępna do przejęcia przez innych.', 'success');
            // Odśwież widok
            this.viewCase(caseId);
        } else {
            throw new Error(response.error || 'Błąd oddawania sprawy');
        }
    } catch (error) {
        console.error('❌ Błąd oddawania sprawy:', error);
        await this.customAlert('❌ Błąd: ' + error.message, 'error');
    }
};

// =====================================
// EDYTUJ KLIENTA
// =====================================
CRMManager.prototype.editClient = async function(clientId) {
    try {
        console.log('✏️ Otwieranie edycji klienta:', clientId);
        
        // Pobierz dane klienta
        const response = await window.api.request(`/clients/${clientId}`);
        const client = response.client;
        
        if (!client) {
            await this.customAlert('Nie znaleziono klienta', 'error');
            return;
        }
        
        // Utwórz modal z formularzem edycji
        this.createModal('✏️ Edytuj dane klienta', `
            <form id="editClientForm" style="display: flex; flex-direction: column; gap: 15px; max-width: 800px; margin: 0 auto;">
                <!-- Imię i nazwisko -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">👤 Imię *</label>
                        <input type="text" name="first_name" value="${this.escapeHtml(client.first_name || '')}" required placeholder="Jan" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">👤 Nazwisko *</label>
                        <input type="text" name="last_name" value="${this.escapeHtml(client.last_name || '')}" required placeholder="Kowalski" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                </div>
                
                <!-- Firma -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">🏢 Nazwa firmy</label>
                    <input type="text" name="company_name" value="${this.escapeHtml(client.company_name || '')}" placeholder="Firma Sp. z o.o." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                </div>
                
                <!-- Email i telefon -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📧 Email</label>
                        <input type="email" name="email" value="${this.escapeHtml(client.email || '')}" placeholder="kontakt@firma.pl" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📞 Telefon</label>
                        <input type="tel" id="phoneInputEdit" name="phone" value="${this.escapeHtml(client.phone || '')}" placeholder="+48 123 456 789" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                </div>
                
                <!-- Adres -->
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">🏠 Ulica</label>
                        <input type="text" name="address_street" value="${this.escapeHtml(client.address_street || '')}" placeholder="ul. Marszałkowska" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">🏙️ Miasto</label>
                        <input type="text" name="address_city" value="${this.escapeHtml(client.address_city || '')}" placeholder="Warszawa" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                </div>
                
                <!-- Kod pocztowy i kraj -->
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📮 Kod pocztowy</label>
                        <input type="text" id="postalInputEdit" name="address_postal" value="${this.escapeHtml(client.address_postal || '')}" placeholder="00-000" maxlength="6" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">🌍 Kraj</label>
                        <input type="text" name="address_country" value="${this.escapeHtml(client.address_country || 'Polska')}" placeholder="Polska" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                </div>
                
                <!-- NIP, PESEL -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">🔢 NIP</label>
                        <input type="text" id="nipInputEdit" name="nip" value="${this.escapeHtml(client.nip || '')}" placeholder="123-456-78-90" maxlength="13" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">🔢 PESEL</label>
                        <input type="text" id="peselInputEdit" name="pesel" value="${this.escapeHtml(client.pesel || '')}" placeholder="12345678901" maxlength="11" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                    </div>
                </div>
                
                <!-- Opiekun klienta -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">👤 Opiekun klienta</label>
                    <select id="caretakerSelectEdit" name="assigned_to" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                        <option value="">-- Brak opiekuna --</option>
                    </select>
                    <input type="hidden" id="currentAssignedTo" value="${client.assigned_to || ''}">
                </div>
                
                <!-- Status -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📊 Status</label>
                    <select name="status" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;">
                        <option value="active" ${client.status === 'active' ? 'selected' : ''}>🟢 Aktywny</option>
                        <option value="inactive" ${client.status === 'inactive' ? 'selected' : ''}>⚫ Nieaktywny</option>
                    </select>
                </div>
                
                <!-- Notatki -->
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📝 Notatki</label>
                    <textarea name="notes" rows="3" placeholder="Dodatkowe informacje..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; font-size: 1rem;">${this.escapeHtml(client.notes || '')}</textarea>
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 15px; border-top: 1px solid #eee;">
                    <button type="button" onclick="crmManager.closeModal()" style="padding: 10px 25px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                        Anuluj
                    </button>
                    <button type="submit" style="padding: 10px 25px; background: linear-gradient(135deg, #FFD700, #FFA500); color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 1rem; box-shadow: 0 4px 15px rgba(255,215,0,0.3);">
                        💾 Zapisz zmiany
                    </button>
                </div>
            </form>
        `);
        
        // Dodaj auto-formatowanie dla pól edycji
        this.setupEditAutoFormatting();
        
        // Załaduj listę opiekunów klientów do selecta
        await this.loadCaretakersToSelect('caretakerSelectEdit');
        
        // Ustaw aktualnie wybranego opiekuna
        const currentAssignedTo = document.getElementById('currentAssignedTo')?.value;
        if (currentAssignedTo) {
            const select = document.getElementById('caretakerSelectEdit');
            if (select) {
                select.value = currentAssignedTo;
            }
        }
        
        // Obsługa submita formularza
        document.getElementById('editClientForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.saveClientEdits(clientId, e.target);
        });
        
    } catch (error) {
        console.error('❌ Błąd otwierania edycji klienta:', error);
        await this.customAlert('Błąd: ' + error.message, 'error');
    }
};

// Auto-formatowanie dla formularza edycji
CRMManager.prototype.setupEditAutoFormatting = function() {
    // Kod pocztowy: 00-000
    const postalInput = document.getElementById('postalInputEdit');
    if (postalInput) {
        postalInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                value = value.substring(0, 2) + '-' + value.substring(2, 5);
            }
            e.target.value = value;
        });
    }
    
    // NIP: 123-456-78-90
    const nipInput = document.getElementById('nipInputEdit');
    if (nipInput) {
        nipInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 3 && value.length <= 6) {
                value = value.substring(0, 3) + '-' + value.substring(3);
            } else if (value.length > 6 && value.length <= 8) {
                value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6);
            } else if (value.length > 8) {
                value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6, 8) + '-' + value.substring(8, 10);
            }
            e.target.value = value;
        });
    }
    
    // PESEL: tylko cyfry, max 11
    const peselInput = document.getElementById('peselInputEdit');
    if (peselInput) {
        peselInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 11);
        });
    }
    
    // Telefon: formatowanie z spacjami
    const phoneInput = document.getElementById('phoneInputEdit');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            const hasPlus = value.startsWith('+');
            const digitsOnly = value.replace(/[^\d]/g, '');
            
            if (hasPlus && digitsOnly.length > 0) {
                let formatted = '+';
                if (digitsOnly.length > 2) {
                    formatted += digitsOnly.substring(0, 2) + ' ';
                    if (digitsOnly.length > 5) {
                        formatted += digitsOnly.substring(2, 5) + ' ';
                        if (digitsOnly.length > 8) {
                            formatted += digitsOnly.substring(5, 8) + ' ';
                            formatted += digitsOnly.substring(8, 11);
                        } else {
                            formatted += digitsOnly.substring(5);
                        }
                    } else {
                        formatted += digitsOnly.substring(2);
                    }
                } else {
                    formatted += digitsOnly;
                }
                value = formatted;
            }
            e.target.value = value;
        });
    }
};

// Zapisz zmiany w danych klienta
CRMManager.prototype.saveClientEdits = async function(clientId, form) {
    try {
        const formData = new FormData(form);
        
        const updateData = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            company_name: formData.get('company_name') || null,
            email: formData.get('email') || null,
            phone: formData.get('phone') || null,
            pesel: formData.get('pesel') || null,
            nip: formData.get('nip') || null,
            address_street: formData.get('address_street') || null,
            address_city: formData.get('address_city') || null,
            address_postal: formData.get('address_postal') || null,
            address_country: formData.get('address_country') || 'Polska',
            notes: formData.get('notes') || null,
            status: formData.get('status') || 'active',
            assigned_to: formData.get('assigned_to') || null
        };
        
        console.log('💾 Zapisywanie zmian klienta:', clientId, updateData);
        
        const response = await window.api.request(`/clients/${clientId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        
        if (!response.success) {
            throw new Error(response.error || 'Błąd aktualizacji');
        }
        
        await this.customAlert('✅ Dane klienta zostały zaktualizowane!', 'success');
        this.closeModal();
        
        // Odśwież listę klientów
        await this.loadClients();
        
    } catch (error) {
        console.error('❌ Błąd zapisywania zmian:', error);
        await this.customAlert('Błąd: ' + error.message, 'error');
    }
};

// =====================================
// USUŃ KLIENTA (TYLKO ADMIN)
// =====================================
CRMManager.prototype.deleteClient = async function(clientId) {
    try {
        // Pobierz dane klienta najpierw
        const clientResponse = await window.api.request(`/clients/${clientId}`);
        const client = clientResponse.client;
        
        if (!client) {
            await this.customAlert('Nie znaleziono klienta', 'error');
            return;
        }
        
        const clientName = `${client.first_name} ${client.last_name}`;
        
        // Pobierz liczbę spraw klienta
        const casesResponse = await window.api.request(`/cases?client_id=${clientId}`);
        const cases = casesResponse.cases || [];
        const casesCount = cases.length;
        
        // Pierwsze potwierdzenie Z INFORMACJĄ O SPRAWACH
        let confirmMessage = `Czy na pewno chcesz usunąć klienta:\n\n${clientName}\n${client.company_name ? `(${client.company_name})` : ''}`;
        
        if (casesCount > 0) {
            confirmMessage += `\n\n⚠️ UWAGA! Ten klient ma ${casesCount} ${casesCount === 1 ? 'sprawę' : casesCount < 5 ? 'sprawy' : 'spraw'}:\n`;
            cases.slice(0, 5).forEach(c => {
                confirmMessage += `\n• ${c.case_number} - ${c.title}`;
            });
            if (casesCount > 5) {
                confirmMessage += `\n... i ${casesCount - 5} innych`;
            }
            confirmMessage += '\n\n🗑️ Wszystkie sprawy również zostaną usunięte!';
        }
        
        confirmMessage += '\n\n⚠️ Ta operacja jest nieodwracalna!';
        
        const confirmed = await this.customConfirm(confirmMessage);
        
        if (!confirmed) {
            return;
        }
        
        // Zapytaj o hasło administratora
        const password = await this.customPrompt('Wprowadź hasło administratora aby potwierdzić usunięcie:', 'password');
        
        if (!password) {
            await this.customAlert('Usuwanie anulowane', 'info');
            return;
        }
        
        console.log('🗑️ Usuwanie klienta:', clientId);
        
        // Wyślij request z hasłem w nagłówku
        const response = await window.api.request(`/clients/${clientId}`, {
            method: 'DELETE',
            headers: {
                'X-Admin-Password': password
            }
        });
        
        if (!response.success) {
            throw new Error(response.error || 'Błąd usuwania klienta');
        }
        
        await this.customAlert(`✅ Klient ${clientName} został usunięty wraz z ${casesCount} ${casesCount === 1 ? 'sprawą' : casesCount < 5 ? 'sprawami' : 'sprawami'}`, 'success');
        
        // Odśwież listę klientów I SPRAW
        await this.loadClients();
        await this.loadCases();  // ⬅️ DODANE - odśwież też sprawy!
        
    } catch (error) {
        console.error('❌ Błąd usuwania klienta:', error);
        
        if (error.message.includes('401')) {
            await this.customAlert('❌ Nieprawidłowe hasło administratora!', 'error');
        } else if (error.message.includes('403')) {
            await this.customAlert('❌ Brak uprawnień! Tylko administrator może usuwać klientów.', 'error');
        } else {
            await this.customAlert('❌ Błąd usuwania klienta: ' + error.message, 'error');
        }
    }
};

// Inicjalizacja
window.crmManager = window.crmManager || new CRMManager();

document.addEventListener('DOMContentLoaded', () => {
    window.crmManager.init();
});

