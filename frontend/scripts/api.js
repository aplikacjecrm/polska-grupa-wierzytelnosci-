const API_URL = 'http://localhost:3500/api';

class API {
    constructor() {
        this.baseURL = API_URL; // Dodaj baseURL jako właściwość
        this.token = localStorage.getItem('token');
        this.casePasswordCache = {}; // Cache haseł: { caseId: { password, timestamp } }
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        // Stringify body if it exists
        const fetchOptions = {
            ...options,
            headers
        };
        
        if (options.body && typeof options.body === 'object') {
            fetchOptions.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);

            const data = await response.json();

            if (!response.ok) {
                // 🔐 OBSŁUGA BŁĘDU 403 - WYMAGANE HASŁO DO SPRAWY
                if (response.status === 403 && data.requiresPassword) {
                    console.log('🔒 Wymagane hasło dostępu do sprawy');
                    
                    // Wyciągnij caseId z endpointu (np. /cases/12)
                    const caseIdMatch = endpoint.match(/\/cases\/(\d+)/);
                    const caseId = caseIdMatch ? caseIdMatch[1] : null;
                    
                    let password = null;
                    
                    // Sprawdź cache hasła (ważne przez 5 minut)
                    if (caseId && this.casePasswordCache[caseId]) {
                        const cached = this.casePasswordCache[caseId];
                        const age = Date.now() - cached.timestamp;
                        
                        if (age < 5 * 60 * 1000) { // 5 minut
                            console.log('🔑 Używam hasła z cache');
                            password = cached.password;
                        } else {
                            console.log('⏰ Hasło w cache wygasło');
                            delete this.casePasswordCache[caseId];
                        }
                    }
                    
                    // Jeśli nie ma w cache - poproś użytkownika
                    if (!password) {
                        password = await this.promptForCasePassword(data.message || 'Ta sprawa wymaga hasła dostępu');
                    }
                    
                    if (password) {
                        // Ponów request z hasłem w nagłówku
                        console.log('🔑 Ponawianie requestu z hasłem...');
                        const retryHeaders = {
                            ...headers,
                            'x-case-password': password
                        };
                        
                        const retryResponse = await fetch(`${API_URL}${endpoint}`, {
                            ...fetchOptions,
                            headers: retryHeaders
                        });
                        
                        const retryData = await retryResponse.json();
                        
                        if (!retryResponse.ok) {
                            // Hasło niepoprawne - usuń z cache
                            if (caseId) delete this.casePasswordCache[caseId];
                            
                            const retryError = new Error(retryData.message || retryData.error || 'Niepoprawne hasło');
                            retryError.details = retryData.details;
                            retryError.response = retryData;
                            throw retryError;
                        }
                        
                        // ✅ Sukces - zapisz hasło w cache
                        if (caseId) {
                            console.log('💾 Zapisuję hasło w cache');
                            this.casePasswordCache[caseId] = {
                                password: password,
                                timestamp: Date.now()
                            };
                        }
                        
                        console.log('✅ Dostęp uzyskany przez hasło!');
                        return retryData;
                    } else {
                        // Użytkownik anulował
                        const cancelError = new Error('Dostęp anulowany przez użytkownika');
                        cancelError.cancelled = true;
                        throw cancelError;
                    }
                }
                
                const error = new Error(data.message || data.error || 'Błąd serwera');
                error.details = data.details;
                error.response = data;
                throw error;
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    // 🔐 Modal z prośbą o hasło dostępu do sprawy
    promptForCasePassword(message) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
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
                animation: fadeIn 0.2s ease;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 12px;
                    padding: 35px;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                    border-top: 5px solid #FFD700;
                    animation: slideIn 0.3s ease;
                ">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <div style="font-size: 50px; margin-bottom: 15px;">🔒</div>
                        <h2 style="color: #1a2332; margin: 0 0 10px 0; font-size: 22px;">
                            Wymagane hasło dostępu
                        </h2>
                        <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.5;">
                            ${message}
                        </p>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332; font-size: 14px;">
                            🔑 Wprowadź hasło dostępu do sprawy:
                        </label>
                        <input 
                            type="text" 
                            id="casePasswordInput" 
                            placeholder="np. ABC-123"
                            style="
                                width: 100%;
                                padding: 12px;
                                border: 2px solid #FFD700;
                                border-radius: 6px;
                                font-size: 16px;
                                font-family: 'Courier New', monospace;
                                letter-spacing: 2px;
                                text-align: center;
                                text-transform: uppercase;
                            "
                            autocomplete="off"
                        >
                        <small style="display: block; margin-top: 8px; color: #999; font-size: 12px; font-style: italic;">
                            💡 Format: 3 litery-3 cyfry (np. ABC-123) - unikalne dla każdej sprawy
                        </small>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="cancelPasswordBtn" style="
                            padding: 10px 20px;
                            background: #6c757d;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            transition: transform 0.2s;
                        ">
                            Anuluj
                        </button>
                        <button id="confirmPasswordBtn" style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #FFD700, #d4af37);
                            color: #1a2332;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                            font-size: 14px;
                            transition: transform 0.2s;
                        ">
                            ✓ Potwierdź
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            const input = modal.querySelector('#casePasswordInput');
            input.focus();
            
            const handleConfirm = () => {
                const password = input.value.trim();
                modal.remove();
                resolve(password || null);
            };
            
            const handleCancel = () => {
                modal.remove();
                resolve(null);
            };
            
            modal.querySelector('#confirmPasswordBtn').addEventListener('click', handleConfirm);
            modal.querySelector('#cancelPasswordBtn').addEventListener('click', handleCancel);
            
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

    // Auth
    async register(email, password, name) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });
    }

    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async verify() {
        return this.request('/auth/verify');
    }

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    }

    // Mail
    async getMailAccounts() {
        return this.request('/mail/accounts');
    }

    async addMailAccount(accountData) {
        return this.request('/mail/accounts', {
            method: 'POST',
            body: JSON.stringify(accountData)
        });
    }

    async getMessages(accountId) {
        return this.request(`/mail/messages/${accountId}`);
    }

    async sendMail(mailData) {
        return this.request('/mail/send', {
            method: 'POST',
            body: JSON.stringify(mailData)
        });
    }

    // Chat
    async getUsers() {
        return this.request('/chat/users');
    }

    async getChatMessages(userId) {
        return this.request(`/chat/messages/${userId}`);
    }

    async sendChatMessage(messageData) {
        return this.request('/chat/messages', {
            method: 'POST',
            body: JSON.stringify(messageData)
        });
    }

    async markAsRead(userId) {
        return this.request(`/chat/messages/read/${userId}`, {
            method: 'PUT'
        });
    }

    async getUnreadCount() {
        return this.request('/chat/unread');
    }
}

const api = new API();

// Globalny dostęp
window.api = api;
