// PROSTY MANAGER MODALI - Centralna obsługa wszystkich modali
class ModalManager {
    constructor() {
        this.openModals = [];
        this.init();
    }

    init() {
        console.log('🎭 ModalManager inicjalizacja...');
        
        // ESC zamyka ostatni modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.openModals.length > 0) {
                this.closeTop();
            }
        });
    }

    // Otwórz modal
    open(modalId, data = null) {
        console.log('📂 Otwieram modal:', modalId, data);
        
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error('❌ Modal nie istnieje:', modalId);
            return false;
        }

        // Dodaj do stosu
        if (!this.openModals.includes(modalId)) {
            this.openModals.push(modalId);
        }

        // Pokaż modal
        modal.classList.add('active');
        
        // Trigger custom event dla zewnętrznych handlerów
        modal.dispatchEvent(new CustomEvent('modal:opened', { detail: data }));
        
        return true;
    }

    // Zamknij konkretny modal
    close(modalId) {
        console.log('🔒 Zamykam modal:', modalId);
        
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error('❌ Modal nie istnieje:', modalId);
            return false;
        }

        // Usuń z stosu
        const index = this.openModals.indexOf(modalId);
        if (index > -1) {
            this.openModals.splice(index, 1);
        }

        // Ukryj modal
        modal.classList.remove('active');
        
        // Trigger custom event
        modal.dispatchEvent(new CustomEvent('modal:closed'));
        
        // Jeśli to był ostatni modal z routera, wróć wstecz
        if (window.router && window.router.currentRoute && 
            (window.router.currentRoute.type === 'client' || window.router.currentRoute.type === 'case')) {
            window.router.back();
        }
        
        return true;
    }

    // Zamknij ostatni modal
    closeTop() {
        if (this.openModals.length > 0) {
            const topModal = this.openModals[this.openModals.length - 1];
            this.close(topModal);
        }
    }

    // Zamknij wszystkie modale
    closeAll() {
        console.log('🔒 Zamykam wszystkie modale...');
        
        // Kopiuj array żeby uniknąć problemów z modyfikacją podczas iteracji
        const modalsToClose = [...this.openModals];
        
        modalsToClose.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
            }
        });
        
        this.openModals = [];
    }

    // Sprawdź czy modal jest otwarty
    isOpen(modalId) {
        return this.openModals.includes(modalId);
    }

    // Pobierz aktualnie otwarty modal
    getCurrentModal() {
        if (this.openModals.length === 0) return null;
        return this.openModals[this.openModals.length - 1];
    }
}

// Globalny dostęp
window.modals = new ModalManager();

// Helper functions dla łatwiejszego użycia
window.openModal = (modalId, data) => window.modals.open(modalId, data);
window.closeModal = (modalId) => window.modals.close(modalId);
window.closeAllModals = () => window.modals.closeAll();
