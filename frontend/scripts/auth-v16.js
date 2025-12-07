class AuthManager {
    constructor() {
        this.currentUser = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(`${tabName}Form`).classList.add('active');
            });
        });

        // Login form
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.login();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.register();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', async () => {
            await this.logout();
        });
    }

    async login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');

        try {
            errorDiv.textContent = '';
            const response = await api.login(email, password);
            
            if (response.success) {
                api.setToken(response.token);
                this.currentUser = response.user;
                localStorage.setItem('currentUser', JSON.stringify(response.user));
                console.log('✅ currentUser zapisany do localStorage:', response.user);
                
                // Zaloguj aktywność
                this.logActivity('login', response.user.id);
                
                this.showMainScreen(true);
            } else {
                errorDiv.textContent = 'Nieprawidłowe dane logowania';
            }
        } catch (error) {
            console.error('Błąd logowania:', error);
            errorDiv.textContent = error.message || 'Błąd połączenia z serwerem';
        }
    }

    async register() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const errorDiv = document.getElementById('loginError');

        try {
            errorDiv.textContent = '';
            
            const response = await api.register(email, password, name);
            
            if (response.success) {
                api.setToken(response.token);
                this.currentUser = response.user;
                localStorage.setItem('currentUser', JSON.stringify(response.user));
                console.log('✅ currentUser zapisany do localStorage (register):', response.user);
                
                // Zaloguj aktywność
                this.logActivity('login', response.user.id);
                
                this.showMainScreen(true); // true = świeże logowanie, zmień widok
            }
        } catch (error) {
            errorDiv.textContent = error.message;
        }
    }

    async logout() {
        // Zaloguj aktywność PRZED wylogowaniem (gdy mamy jeszcze user ID)
        if (this.currentUser) {
            this.logActivity('logout', this.currentUser.id);
        }
        
        try {
            await api.logout();
        } catch (error) {
            console.error('Błąd wylogowania:', error);
        }

        api.clearToken();
        localStorage.removeItem('currentUser');
        console.log('🗑️ currentUser usunięty z localStorage');
        socketManager.disconnect();
        this.currentUser = null;
        this.showLoginScreen();
    }

    async checkAuth() {
        const token = localStorage.getItem('token');
        
        if (token) {
            try {
                const response = await api.request('/auth/verify');
                
                if (response.user) {
                    this.currentUser = response.user;
                    localStorage.setItem('currentUser', JSON.stringify(response.user));
                    console.log('✅ currentUser zapisany do localStorage (checkAuth):', response.user);
                    this.showMainScreen(false);
                    return true;
                }
            } catch (error) {
                console.error('Błąd weryfikacji tokenu:', error);
                localStorage.removeItem('token');
            }
        }
        
        this.showLoginScreen();
        return false;
    }

    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const mainScreen = document.getElementById('mainScreen');
        
        mainScreen.removeAttribute('style');
        loginScreen.removeAttribute('style');
        mainScreen.classList.remove('active');
        loginScreen.classList.add('active');
        
        // Wyczysc pola logowania
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('loginError').textContent = '';
        
        void loginScreen.offsetHeight;
    }

    showMainScreen(isNewLogin = true) {
        const loginScreen = document.getElementById('loginScreen');
        const mainScreen = document.getElementById('mainScreen');
        
        mainScreen.removeAttribute('style');
        loginScreen.removeAttribute('style');
        loginScreen.classList.remove('active');
        mainScreen.classList.add('active');
        void mainScreen.offsetHeight;

        this.updateUserUI();

        // Dostosuj UI według roli
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.waitForAppAndAdjustUI(isNewLogin);
            });
        } else {
            this.waitForAppAndAdjustUI(isNewLogin);
        }

        // Połącz Socket.IO
        socketManager.connect(api.token);

        // ✅ POPRAWKA: Inicjalizuj floating chat DOPIERO gdy socket się połączy
        const initFloatingChatWhenReady = () => {
            if (socketManager.connected) {
                console.log('✅ [AUTH] Socket połączony, inicjalizuję floating chat...');
                if (window.initFloatingChat) {
                    window.initFloatingChat();
                }
            } else {
                console.log('⏳ [AUTH] Czekam na połączenie socketa... retry za 100ms');
                setTimeout(initFloatingChatWhenReady, 100);
            }
        };
        initFloatingChatWhenReady();

        // Załaduj dane
        const loadData = () => {
            if (window.crmManager) {
                crmManager.loadClients();
                crmManager.loadCases();
            }
            if (window.mailManager) mailManager.loadAccounts();
            if (window.chatManager) chatManager.loadUsers();
        };
        
        // Przy logowaniu - od razu, przy odświeżeniu - z opóźnieniem
        isNewLogin ? loadData() : setTimeout(loadData, 500);
    }

    waitForAppAndAdjustUI(isNewLogin, retries = 0) {
        if (window.app && this.currentUser) {
            // Używaj user_role zamiast role dla prawidłowego rozpoznania managera
            const userRole = this.currentUser.user_role || this.currentUser.role;
            console.log('👤 Adjusting UI for role:', userRole);
            app.adjustUIForRole(userRole, isNewLogin);
        } else if (retries < 20) {
            setTimeout(() => this.waitForAppAndAdjustUI(isNewLogin, retries + 1), 100);
        } else {
            console.error('❌ Nie można załadować app po 2 sekundach');
        }
    }

    updateUserUI() {
        if (!this.currentUser) return;

        const initials = this.currentUser.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase();

        document.getElementById('userInitials').textContent = initials;
        document.getElementById('userName').textContent = this.currentUser.name;
        
        if (document.getElementById('settingsName')) {
            document.getElementById('settingsName').value = this.currentUser.name;
        }
        if (document.getElementById('settingsEmail')) {
            document.getElementById('settingsEmail').value = this.currentUser.email;
        }
    }

    async logActivity(action, userId) {
        try {
            // Pobierz IP użytkownika (publicznie dostępne API)
            let ipAddress = 'Unknown';
            let location = 'Unknown';
            
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipResponse.json();
                ipAddress = ipData.ip;
                
                // Opcjonalnie: pobierz lokalizację z IP
                try {
                    const geoResponse = await fetch(`https://ipapi.co/${ipAddress}/json/`);
                    const geoData = await geoResponse.json();
                    location = `${geoData.city || ''}, ${geoData.country_name || ''}`.trim();
                } catch (geoError) {
                    console.log('Nie udało się pobrać lokalizacji');
                }
            } catch (ipError) {
                console.log('Nie udało się pobrać IP');
            }
            
            const userAgent = navigator.userAgent;
            
            await api.request('/activity-logs', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: userId,
                    action: action,
                    ip_address: ipAddress,
                    user_agent: userAgent,
                    location: location
                })
            });
            
            console.log(`✅ Zalogowano aktywność: ${action} dla użytkownika ${userId}`);
        } catch (error) {
            console.error('❌ Błąd logowania aktywności:', error);
            // Nie przerywamy procesu logowania/wylogowania jeśli log się nie zapisze
        }
    }
}

const authManager = new AuthManager();
