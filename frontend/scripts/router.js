// PROSTY ROUTER - Obsługa historii przeglądarki i URL
class Router {
    constructor() {
        this.currentRoute = null;
        this.listeners = [];
        this.init();
    }

    init() {
        console.log('🔀 Router inicjalizacja...');
        
        // Obsługa wstecz/dalej
        window.addEventListener('popstate', (event) => {
            console.log('🔙 Popstate:', event.state);
            if (event.state) {
                this.handleRoute(event.state, false);
            } else {
                // Brak state - wróć do głównego widoku
                this.navigate({ type: 'view', name: 'crm' }, false);
            }
        });

        // Przywróć z URL po odświeżeniu - WYŁĄCZONE TYMCZASOWO
        // this.restoreFromURL();
        console.log('⚠️ restoreFromURL() WYŁĄCZONE - aplikacja zawsze startuje od widoku CRM');
    }

    // Nawiguj do nowego miejsca
    navigate(route, addToHistory = true) {
        console.log('📍 Navigate:', route, 'addToHistory:', addToHistory);
        
        this.currentRoute = route;
        
        // Dodaj do historii przeglądarki
        if (addToHistory) {
            const url = this.routeToURL(route);
            history.pushState(route, '', url);
        }
        
        // Powiadom słuchaczy
        this.notifyListeners(route);
    }

    // Obsłuż route (z popstate lub nawigacji)
    handleRoute(route, addToHistory = true) {
        this.navigate(route, addToHistory);
    }

    // Zamień route na URL
    routeToURL(route) {
        switch(route.type) {
            case 'view':
                return `#${route.name}`;
            case 'client':
                return `#client-${route.id}`;
            case 'case':
                return `#case-${route.id}`;
            default:
                return '#crm';
        }
    }

    // Przywróć stan z URL
    restoreFromURL() {
        const hash = window.location.hash.substring(1);
        console.log('🔄 Przywracam z URL:', hash);
        console.log('🔄 window.location.href:', window.location.href);
        
        if (!hash) {
            // Brak hash - główny widok
            console.log('🔄 Brak hash - ustawiam #crm');
            history.replaceState({ type: 'view', name: 'crm' }, '', '#crm');
            return;
        }

        // Parse hash
        let route = null;
        
        if (hash.startsWith('client-')) {
            const id = parseInt(hash.split('-')[1]);
            route = { type: 'client', id };
        } else if (hash.startsWith('case-')) {
            const id = parseInt(hash.split('-')[1]);
            route = { type: 'case', id };
        } else {
            // Zwykły widok
            route = { type: 'view', name: hash };
        }

        if (route) {
            // Opóźnij żeby wszystko się załadowało
            setTimeout(() => {
                this.handleRoute(route, false);
            }, 500);
        }
    }

    // Dodaj słuchacza zmian route
    addListener(callback) {
        this.listeners.push(callback);
    }

    // Powiadom słuchaczy
    notifyListeners(route) {
        this.listeners.forEach(callback => {
            try {
                callback(route);
            } catch (error) {
                console.error('❌ Błąd w listenerze routera:', error);
            }
        });
    }

    // Wróć wstecz
    back() {
        history.back();
    }
}

// Globalny dostęp
window.router = new Router();
