// Main application controller
class App {
    constructor() {
        this.currentView = 'crm';
        this.init();
    }

    async init() {
        console.log('App initializing...');
        
        // Wyczyść błędny hash z routera (jeśli jest)
        const hash = window.location.hash;
        if (hash.startsWith('#/') || hash.includes('client-') || hash.includes('case-')) {
            console.log('⚠️ Czyszczę stary hash routera:', hash);
            window.location.hash = '';
        }
        
        this.setupNavigation();
        this.setupWindowControls();
        this.setupIPC();
        this.setupModalClosing(); // Dodaj obsługę zamykania modali
        
        console.log('App initialized successfully');
        
        // Check authentication
        await authManager.checkAuth();
    }
    
    setupModalClosing() {
        // Dodaj listenery do wszystkich przycisków zamykania modali
        document.addEventListener('click', (e) => {
            // Ignoruj modale z ID (zarządzane przez własne handlery)
            if (e.target.id && e.target.id.includes('Modal')) return;
            if (e.target.closest('.modal-overlay')) return;
            
            // Zamykanie przez przycisk .modal-close
            if (e.target.classList.contains('modal-close')) {
                const modal = e.target.closest('.modal');
                if (modal && !modal.classList.contains('modal-overlay')) {
                    modal.classList.remove('active');
                }
            }
            
            // Zamykanie przez kliknięcie w tło modala (tylko stare modale bez overlay)
            if (e.target.classList.contains('modal') && !e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('active');
            }
        });
        
        console.log('✅ Modal closing listeners added');
    }

    // Dostosuj interfejs do roli użytkownika
    adjustUIForRole(userRole, setDefaultView = true) {
        // Zapisz rolę i ustaw atrybut CSS
        localStorage.setItem('userRole', userRole);
        document.body.setAttribute('data-user-role', userRole);
        
        // Ukryj wszystkie elementy specyficzne dla ról
        document.querySelectorAll('.admin-only, .lawyer-only, .client-only, .hr-only, .finance-only, .payroll-only').forEach(item => {
            item.style.display = 'none';
        });
        
        // Pokaż odpowiednie elementy według roli
        const roleVisibility = {
            admin: ['.admin-only', '.lawyer-only', '.hr-only', '.finance-only', '.payroll-only'],  // Admin widzi WSZYSTKO
            lawyer: ['.lawyer-only'],
            client_manager: ['.lawyer-only'],  // Opiekun klienta widzi te same opcje co mecenas
            case_manager: ['.lawyer-only'],    // Opiekun sprawy widzi te same opcje co mecenas
            reception: ['.lawyer-only', '.finance-only'],  // Recepcja widzi sprawy + finanse (odczyt)
            hr: ['.hr-only'],                  // HR - tylko swoje menu
            finance: ['.finance-only'],        // Finance - tylko swoje menu
            payroll: ['.payroll-only', '.hr-only', '.finance-only'],  // Payroll - HR + Finance + własne
            client: ['.client-only']
        };
        
        const visibleClasses = roleVisibility[userRole] || [];
        document.querySelectorAll('.nav-item').forEach(item => {
            const shouldShow = visibleClasses.some(cls => item.classList.contains(cls.substring(1))) 
                            || (!item.classList.contains('admin-only') && 
                                !item.classList.contains('lawyer-only') && 
                                !item.classList.contains('client-only') &&
                                !item.classList.contains('hr-only') &&
                                !item.classList.contains('finance-only') &&
                                !item.classList.contains('payroll-only'));
            item.style.display = shouldShow ? 'flex' : 'none';
        });
        
        // Ustaw domyślny widok przy logowaniu
        if (setDefaultView) {
            // Managerowie widzą swoje dashboardy
            if (userRole === 'client_manager' || userRole === 'case_manager' || userRole === 'lawyer') {
                this.switchView('lawyer-dashboard');
            } else if (userRole === 'client') {
                this.switchView('client-portal');
            } else if (userRole === 'hr') {
                this.switchView('employee-dashboard'); // HR widzi dashboard pracowników
            } else if (userRole === 'finance') {
                this.switchView('finance-dashboard'); // Finance widzi dashboard finansowy
            } else if (userRole === 'payroll') {
                this.switchView('payroll-dashboard'); // Payroll widzi swój dashboard
            } else {
                this.switchView('crm');
            }
        }
        
        // Ukryj przyciski CRM dla klientów, HR i Finance
        ['newClientBtn', 'newCaseBtn', 'addAccountBtn'].forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                const hideFor = ['client', 'hr', 'finance'].includes(userRole);
                btn.style.display = hideFor ? 'none' : 'inline-block';
            }
        });
    }

    setupNavigation() {
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item._hasNavListener) return;
            item._hasNavListener = true;
            
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (item.dataset.view) {
                    this.switchView(item.dataset.view);
                }
            });
        });
    }

    switchView(viewName) {
        console.log('🔄 switchView:', viewName);
        
        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === viewName);
        });

        // Hide all views
        const allViews = document.querySelectorAll('.view-content');
        console.log(`📦 Hiding ${allViews.length} views`);
        allViews.forEach(view => {
            view.style.setProperty('display', 'none', 'important');
        });

        // Show selected view
        const targetId = `${viewName}View`;
        console.log(`🔍 Looking for view: #${targetId}`);
        const selectedView = document.getElementById(targetId);
        if (selectedView) {
            console.log(`✅ View found: #${targetId}`);
            
            // Finance Dashboard ma specjalne wymagania (scrollowanie)
            if (viewName === 'finance-dashboard') {
                selectedView.style.cssText = 'display: block !important; width: 100% !important; height: 100% !important; overflow-y: auto !important; overflow-x: hidden !important; visibility: visible !important; opacity: 1 !important; position: relative !important;';
            } else {
                // Inne widoki - standardowe style
                selectedView.style.cssText = 'display: flex !important; flex-direction: column !important; flex: 1 1 auto !important; width: 100% !important; min-height: calc(100vh - 40px) !important; height: auto !important; overflow-y: auto !important; overflow-x: hidden !important; visibility: visible !important; opacity: 1 !important; position: relative !important;';
            }
            
            console.log(`📊 View display after set:`, window.getComputedStyle(selectedView).display);
            console.log(`📏 View dimensions:`, selectedView.offsetWidth, 'x', selectedView.offsetHeight);
            console.log(`👀 View visibility:`, window.getComputedStyle(selectedView).visibility);
            console.log(`📝 View has content (innerHTML length):`, selectedView.innerHTML.length);
        } else {
            console.error('❌ View not found:', targetId);
        }

        this.currentView = viewName;

        // Initialize view-specific managers
        if (viewName === 'calendar' && window.calendarManager) {
            console.log('Initializing calendar...');
            calendarManager.init();
        }
        if (viewName === 'chat') {
            console.log('💬 Chat view - initializing chatManager...');
            if (window.initChatManager) {
                window.initChatManager();
            } else {
                console.error('❌ initChatManager not found!');
            }
        }
        if (viewName === 'admin') {
            console.log('🔥 Admin view - initializing adminDashboard...');
            
            // FORCE: Wyczyść i wymusz ponowne wyświetlenie
            const adminView = document.getElementById('adminView');
            if (adminView) {
                console.log('🧹 Czyszczę adminView przed renderowaniem...');
                adminView.innerHTML = '<div style="padding: 40px; text-align: center;">⏳ Ładowanie dashboardu...</div>';
                // ULTRA WYMUSZENIE - konkretna wysokość w vh
                adminView.style.cssText = 'display: flex !important; flex-direction: column !important; flex: 1 1 auto !important; width: 100% !important; min-height: calc(100vh - 40px) !important; height: auto !important; overflow-y: auto !important; overflow-x: hidden !important; visibility: visible !important; opacity: 1 !important; position: relative !important;';
            }
            
            // Próba natychmiastowa
            if (window.adminDashboard) {
                console.log('✅ adminDashboard found - calling init()');
                setTimeout(() => window.adminDashboard.init(), 50);
            } else {
                // Retry po 100ms (dla race condition)
                console.warn('⚠️ adminDashboard not ready, retrying in 100ms...');
                setTimeout(() => {
                    if (window.adminDashboard) {
                        console.log('✅ adminDashboard ready after retry!');
                        window.adminDashboard.init();
                    } else {
                        console.error('❌ adminDashboard still not found after retry!');
                        console.error('Available in window:', Object.keys(window).filter(k => k.includes('admin')));
                    }
                }, 100);
            }
        }
        if (viewName === 'finance-dashboard') {
            console.log('💰 Finance Dashboard view - initializing...');
            
            // Próba natychmiastowa
            if (window.financeDashboard) {
                console.log('✅ financeDashboard found - calling open()');
                setTimeout(() => window.financeDashboard.open(), 100);
            } else {
                // Retry po 200ms (dla race condition)
                console.warn('⚠️ financeDashboard not ready, retrying in 200ms...');
                setTimeout(() => {
                    if (window.financeDashboard) {
                        console.log('✅ financeDashboard ready after retry!');
                        window.financeDashboard.open();
                    } else {
                        console.error('❌ financeDashboard still not found after retry!');
                        console.error('Available in window:', Object.keys(window).filter(k => k.includes('finance')));
                    }
                }, 200);
            }
        }
        if (viewName === 'lawyer-dashboard') {
            console.log('🔥 MOJ DASHBOARD - ładowanie Universal Dashboard + Employee Dashboard...');
            
            const lawyerView = document.getElementById('lawyer-dashboardView');
            if (!lawyerView) {
                console.error('❌ lawyer-dashboardView NIE ISTNIEJE!');
                return;
            }
            
            // WYMUSZENIE WIDOCZNOŚCI
            console.log('🔍 lawyer-dashboardView znaleziony!');
            lawyerView.style.cssText = 'display: flex !important; flex-direction: column !important; flex: 1 !important; width: 100% !important; min-width: 100% !important; height: 100% !important; min-height: calc(100vh - 40px) !important; overflow-y: auto !important; visibility: visible !important; opacity: 1 !important; background: #16213e !important;';
            lawyerView.innerHTML = '';
            console.log('✅ Styles ustawione, innerHTML wyczyszczony');
            
            // 1. GÓRA: Dodaj kontener dla Universal Dashboard
            const universalContainer = document.createElement('div');
            universalContainer.id = 'universalDashboardContainer';
            universalContainer.style.cssText = 'width: 100%; padding: 20px; background: white;';
            lawyerView.appendChild(universalContainer);
            
            // 2. DÓŁ: Dodaj kontener dla Employee Dashboard HR
            const employeeContainer = document.createElement('div');
            employeeContainer.id = 'employeeDashboardHRContainer';
            employeeContainer.style.cssText = 'width: 100%; min-height: 600px; background: #f5f5f5; margin-top: 20px;';
            employeeContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: #3B82F6;">⏳ Ładowanie Employee Dashboard HR...</div>';
            lawyerView.appendChild(employeeContainer);
            
            // Załaduj Universal Dashboard (stare karty)
            if (window.universalDashboard) {
                console.log('✅ Ładuję Universal Dashboard (karty)...');
                setTimeout(() => {
                    window.universalDashboard.init('universalDashboardContainer');
                }, 50);
            } else {
                console.warn('⚠️ universalDashboard not found - retrying...');
                setTimeout(() => {
                    if (window.universalDashboard) {
                        window.universalDashboard.init('universalDashboardContainer');
                    }
                }, 200);
            }
            
            // Załaduj Employee Dashboard HR (zakładki HR)
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const userId = currentUser.id || currentUser.userId;
            
            if (userId && window.EmployeeDashboard) {
                console.log('✅ Ładuję Employee Dashboard HR (zakładki)...');
                setTimeout(async () => {
                    try {
                        const dashboard = new window.EmployeeDashboard(userId);
                        await dashboard.loadData();
                        await dashboard.render('employeeDashboardHRContainer');
                        window.employeeDashboard = dashboard;
                        console.log('✅ Oba dashboardy załadowane!');
                    } catch (error) {
                        console.error('❌ BŁĄD Employee Dashboard:', error);
                        employeeContainer.innerHTML = `<div style="padding: 40px; text-align: center; color: red;">❌ Błąd ładowania Employee Dashboard: ${error.message}</div>`;
                    }
                }, 300);
            } else {
                employeeContainer.innerHTML = '<div style="padding: 40px; text-align: center; color: #95a5a6;">⚠️ Employee Dashboard niedostępny</div>';
            }
        }
        if (viewName === 'case-manager-dashboard') {
            console.log('Case Manager Dashboard view - initializing UNIVERSAL...');
            if (window.universalDashboard) {
                console.log('✅ Calling universalDashboard.init()');
                universalDashboard.init();
            } else {
                console.error('❌ universalDashboard not found in window!');
            }
        }
        if (viewName === 'my-cases') {
            console.log('My Cases view - loading user cases...');
            if (window.loadMyCases) {
                console.log('✅ Calling loadMyCases()');
                window.loadMyCases();
            } else {
                console.error('❌ loadMyCases not found in window!');
            }
        }
        if (viewName === 'client-portal' && window.clientPortal) {
            clientPortal.init();
        }
        if (viewName === 'projects' && window.investmentProjects) {
            investmentProjects.init();
        }
        if (viewName === 'ai-assistant' && window.aiAssistant) {
            console.log('Initializing AI Assistant...');
            aiAssistant.init();
        }
        if (viewName === 'legal-library' && window.showLegalLibrary) {
            console.log('Opening Legal Library...');
            try {
                window.showLegalLibrary();
            } catch (error) {
                console.error('❌ Błąd przy otwieraniu Legal Library:', error);
            }
        }
        if (viewName === 'finance-dashboard') {
            console.log('💰 Finance Dashboard view - initializing...');
            
            const financeView = document.getElementById('finance-dashboardView');
            if (financeView) {
                console.log('🧹 Czyszczę finance-dashboardView przed renderowaniem...');
                financeView.innerHTML = '<div style="padding: 40px; text-align: center;">⏳ Ładowanie Finance Dashboard...</div>';
                financeView.style.cssText = 'display: flex !important; flex-direction: column !important; flex: 1 1 auto !important; width: 100% !important; min-height: calc(100vh - 40px) !important; height: auto !important; overflow-y: auto !important; overflow-x: hidden !important; visibility: visible !important; opacity: 1 !important; position: relative !important;';
            }
            
            if (window.financeDashboard) {
                console.log('✅ financeDashboard found - calling init()');
                setTimeout(() => window.financeDashboard.init(), 50);
            } else {
                console.warn('⚠️ financeDashboard not ready, retrying in 100ms...');
                setTimeout(() => {
                    if (window.financeDashboard) {
                        console.log('✅ financeDashboard ready after retry!');
                        window.financeDashboard.init();
                    } else {
                        console.error('❌ financeDashboard still not found after retry!');
                    }
                }, 100);
            }
        }
        if (viewName === 'payroll-dashboard') {
            console.log('💼 Payroll Dashboard view - initializing...');
            
            const payrollView = document.getElementById('payroll-dashboardView');
            if (payrollView) {
                payrollView.style.cssText = 'display: flex !important; flex-direction: column !important; flex: 1 1 auto !important; width: 100% !important; min-height: calc(100vh - 40px) !important; height: auto !important; overflow-y: auto !important; overflow-x: hidden !important; visibility: visible !important; opacity: 1 !important; position: relative !important;';
                payrollView.innerHTML = '<div style="padding: 40px; text-align: center;">⏳ Ładowanie Payroll Dashboard...</div>';
                
                if (window.payrollDashboard) {
                    setTimeout(() => window.payrollDashboard.open(), 100);
                } else {
                    console.error('❌ payrollDashboard not found!');
                }
            }
        }
        if (viewName === 'hr-dashboard') {
            console.log('🏢 HR Dashboard view - initializing...');
            
            const hrView = document.getElementById('hr-dashboardView');
            if (hrView) {
                console.log('✅ hr-dashboardView znaleziony');
                hrView.style.cssText = 'display: flex !important; flex-direction: column !important; flex: 1 1 auto !important; width: 100% !important; min-height: calc(100vh - 40px) !important; height: auto !important; overflow-y: auto !important; overflow-x: hidden !important; visibility: visible !important; opacity: 1 !important; position: relative !important;';
                hrView.innerHTML = '<div style="padding: 40px; text-align: center;">⏳ Ładowanie HR Dashboard...</div>';
                
                // Inicjalizuj HR Dashboard
                if (window.HRDashboard) {
                    console.log('✅ HRDashboard class found - creating instance...');
                    setTimeout(() => {
                        window.hrDashboard = new window.HRDashboard();
                        window.hrDashboard.init();
                    }, 100);
                } else {
                    console.error('❌ HRDashboard class NOT FOUND!');
                    hrView.innerHTML = '<div style="padding: 40px; text-align: center; color: red;">❌ HR Dashboard nie załadowany</div>';
                }
            } else {
                console.error('❌ hr-dashboardView NIE ISTNIEJE w HTML!');
            }
        }
        if (viewName === 'employee-dashboard') {
            console.log('👥 Employee Dashboard view - initializing...');
            
            const employeeView = document.getElementById('employee-dashboardView');
            if (employeeView) {
                console.log('✅ employee-dashboardView znaleziony');
                employeeView.style.cssText = 'display: flex !important; flex-direction: column !important; flex: 1 1 auto !important; width: 100% !important; min-height: calc(100vh - 40px) !important; height: auto !important; overflow-y: auto !important; overflow-x: hidden !important; visibility: visible !important; opacity: 1 !important; position: relative !important;';
                
                // Sprawdź czy istnieje globalny EmployeeDashboard
                if (window.employeeDashboard) {
                    console.log('✅ employeeDashboard found - calling showList()');
                    setTimeout(() => {
                        if (window.employeeDashboard.showList) {
                            window.employeeDashboard.showList();
                        }
                    }, 100);
                } else {
                    console.log('⚠️ employeeDashboard nie znaleziony - to normalne, powinien załadować się automatycznie');
                }
            } else {
                console.error('❌ employee-dashboardView NIE ISTNIEJE w HTML!');
            }
        }
    }

    setupWindowControls() {
        // Sprawdź czy to Electron (desktop) czy przeglądarka
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');

                // Przyciski głównego okna
                document.getElementById('minimizeBtn').addEventListener('click', () => {
                    ipcRenderer.send('minimize-window');
                });

                document.getElementById('maximizeBtn').addEventListener('click', () => {
                    ipcRenderer.send('maximize-window');
                });

                document.getElementById('closeBtn').addEventListener('click', () => {
                    ipcRenderer.send('close-window');
        });

        // Przyciski okna logowania
        const minimizeBtnLogin = document.getElementById('minimizeBtnLogin');
        if (minimizeBtnLogin) {
            minimizeBtnLogin.addEventListener('click', () => {
                ipcRenderer.send('minimize-window');
            });
        }

        const maximizeBtnLogin = document.getElementById('maximizeBtnLogin');
        if (maximizeBtnLogin) {
            maximizeBtnLogin.addEventListener('click', () => {
                ipcRenderer.send('maximize-window');
            });
        }

        const closeBtnLogin = document.getElementById('closeBtnLogin');
        if (closeBtnLogin) {
            closeBtnLogin.addEventListener('click', () => {
                ipcRenderer.send('close-window');
            });
        }
            } catch (e) {
                // W przeglądarce - przyciski okna nie działają
                console.log('Running in browser mode - window controls disabled');
            }
        }
    }

    setupIPC() {
        // Sprawdź czy to Electron
        if (typeof require !== 'undefined') {
            try {
                const { ipcRenderer } = require('electron');

        ipcRenderer.on('new-message', () => {
            if (mailManager) {
                mailManager.showNewMailModal();
            }
        });

        ipcRenderer.on('switch-view', (event, view) => {
            this.switchView(view);
        });

        ipcRenderer.on('logout', () => {
            authManager.logout();
        });

                ipcRenderer.on('show-about', () => {
                    alert(`E-PGW\nWersja: 1.0.0\n\n© 2025 Polska Grupa Wierzytelności\nwww.e-pgw.pl`);
                });
            } catch (e) {
                // W przeglądarce - IPC nie działa
                console.log('Running in browser mode - IPC disabled');
            }
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - creating App');
    window.app = new App();
    console.log('App created:', window.app);
});
