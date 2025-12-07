/**
 * DASHBOARD LOADER - Lazy Loading System
 * Ładuje dashboardy tylko gdy są potrzebne
 * Oszczędność: ~300KB przy starcie aplikacji
 */

class DashboardLoader {
    constructor() {
        this.loadedDashboards = {};
        this.loadingPromises = {};
        console.log('📊 Dashboard Loader zainicjalizowany');
    }

    /**
     * Załaduj dashboard dynamicznie
     * @param {string} dashboardType - admin/employee/lawyer/finance/universal/case_manager
     * @returns {Promise} Dashboard class
     */
    async load(dashboardType) {
        // Jeśli już załadowany - zwróć od razu
        if (this.loadedDashboards[dashboardType]) {
            console.log(`✓ Dashboard ${dashboardType} już załadowany`);
            return this.loadedDashboards[dashboardType];
        }

        // Jeśli w trakcie ładowania - poczekaj
        if (this.loadingPromises[dashboardType]) {
            console.log(`⏳ Czekam na ładowanie ${dashboardType}...`);
            return this.loadingPromises[dashboardType];
        }

        console.log(`📥 Ładuję dashboard: ${dashboardType}...`);

        // Map typu do pliku
        const dashboardFiles = {
            'admin': 'dashboards/admin-dashboard.js',
            'employee': 'dashboards/employee-dashboard.js',
            'lawyer': 'dashboards/lawyer-dashboard.js',
            'finance': 'dashboards/finance-dashboard.js',
            'universal': 'dashboards/universal-dashboard.js',
            'case_manager': 'dashboards/case-manager-dashboard.js'
        };

        const fileName = dashboardFiles[dashboardType];
        if (!fileName) {
            throw new Error(`Nieznany typ dashboardu: ${dashboardType}`);
        }

        // Stwórz promise ładowania
        this.loadingPromises[dashboardType] = this._loadScript(fileName, dashboardType);

        try {
            await this.loadingPromises[dashboardType];
            console.log(`✅ Dashboard ${dashboardType} załadowany!`);
            return this.loadedDashboards[dashboardType];
        } catch (error) {
            console.error(`❌ Błąd ładowania ${dashboardType}:`, error);
            delete this.loadingPromises[dashboardType];
            throw error;
        }
    }

    /**
     * Załaduj skrypt dynamicznie
     */
    _loadScript(fileName, dashboardType) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `scripts/${fileName}?v=${Date.now()}`;
            
            script.onload = () => {
                // Sprawdź czy dashboard class istnieje
                const dashboardClasses = {
                    'admin': window.AdminDashboard,
                    'employee': window.EmployeeDashboard,
                    'lawyer': window.LawyerDashboard,
                    'finance': window.FinanceDashboard,
                    'universal': window.UniversalDashboard,
                    'case_manager': window.CaseManagerDashboard
                };

                const DashboardClass = dashboardClasses[dashboardType];
                if (DashboardClass) {
                    this.loadedDashboards[dashboardType] = DashboardClass;
                    resolve(DashboardClass);
                } else {
                    reject(new Error(`Dashboard class nie znaleziona dla ${dashboardType}`));
                }
            };

            script.onerror = () => {
                reject(new Error(`Nie udało się załadować ${fileName}`));
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Preload dashboard w tle (dla szybszego dostępu)
     */
    async preload(dashboardType) {
        if (!this.loadedDashboards[dashboardType] && !this.loadingPromises[dashboardType]) {
            console.log(`🔄 Preloading ${dashboardType} w tle...`);
            this.load(dashboardType).catch(err => {
                console.warn(`Preload ${dashboardType} nie powiódł się:`, err);
            });
        }
    }

    /**
     * Inicjalizuj i pokaż dashboard
     */
    async initAndShow(dashboardType, containerId = null) {
        try {
            const DashboardClass = await this.load(dashboardType);
            const dashboard = new DashboardClass();
            
            if (dashboard.init) {
                await dashboard.init();
            }
            
            if (dashboard.render && containerId) {
                const container = document.getElementById(containerId);
                if (container) {
                    dashboard.render(container);
                }
            }

            return dashboard;
        } catch (error) {
            console.error(`Błąd inicjalizacji dashboardu ${dashboardType}:`, error);
            throw error;
        }
    }

    /**
     * Wyładuj dashboard (zwolnij pamięć)
     */
    unload(dashboardType) {
        if (this.loadedDashboards[dashboardType]) {
            delete this.loadedDashboards[dashboardType];
            console.log(`🗑️ Dashboard ${dashboardType} wyładowany z pamięci`);
        }
    }
}

// Global instance
window.dashboardLoader = new DashboardLoader();

// Helper function dla łatwego użycia
window.loadDashboard = (type) => window.dashboardLoader.load(type);
