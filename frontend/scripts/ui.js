// PROSTY UI MANAGER - Toast, Loading, Notyfikacje
class UIManager {
    constructor() {
        this.toastContainer = null;
        this.init();
    }

    init() {
        console.log('🎨 UIManager inicjalizacja...');
        
        // Stwórz container dla toast jeśli nie istnieje
        this.toastContainer = document.getElementById('toastContainer');
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toastContainer';
            this.toastContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 100000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
            `;
            document.body.appendChild(this.toastContainer);
        }
    }

    // Pokaż toast
    toast(message, type = 'success', duration = 3000) {
        const colors = {
            success: { bg: 'linear-gradient(135deg, #10b981, #059669)', icon: '✅' },
            error: { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: '❌' },
            info: { bg: 'linear-gradient(135deg, #3b82f6, #2563eb)', icon: 'ℹ️' },
            warning: { bg: 'linear-gradient(135deg, #FFD700, #d4af37)', icon: '⚠️' }
        };
        
        const style = colors[type] || colors.success;
        
        const toast = document.createElement('div');
        toast.style.cssText = `
            background: ${style.bg};
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            font-weight: 600;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
        `;
        
        toast.innerHTML = `
            <span style="font-size: 1.2rem;">${style.icon}</span>
            <span style="flex: 1;">${message}</span>
            <span style="opacity: 0.7; font-size: 1.2rem;">✕</span>
        `;
        
        // Kliknięcie zamyka
        toast.onclick = () => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        };
        
        // Auto-zamknięcie
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.animation = 'slideOut 0.3s ease-out';
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);
        }
        
        this.toastContainer.appendChild(toast);
    }

    // Skróty
    success(message, duration) {
        this.toast(message, 'success', duration);
    }

    error(message, duration) {
        this.toast(message, 'error', duration);
    }

    info(message, duration) {
        this.toast(message, 'info', duration);
    }

    warning(message, duration) {
        this.toast(message, 'warning', duration);
    }

    // Pokaż loading
    showLoading(message = 'Ładowanie...') {
        let loader = document.getElementById('globalLoader');
        
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'globalLoader';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0,0,0,0.7);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                z-index: 999999;
                gap: 20px;
            `;
            
            loader.innerHTML = `
                <div style="
                    width: 60px;
                    height: 60px;
                    border: 4px solid rgba(255,215,0,0.3);
                    border-top: 4px solid #FFD700;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                "></div>
                <div id="loaderMessage" style="color: white; font-size: 1.1rem; font-weight: 600;">
                    ${message}
                </div>
            `;
            
            document.body.appendChild(loader);
        } else {
            loader.style.display = 'flex';
            document.getElementById('loaderMessage').textContent = message;
        }
    }

    // Ukryj loading
    hideLoading() {
        const loader = document.getElementById('globalLoader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // Confirm dialog
    async confirm(message, title = 'Potwierdź') {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0,0,0,0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 100000;
            `;
            
            modal.innerHTML = `
                <div style="
                    background: white;
                    border-radius: 16px;
                    padding: 30px;
                    max-width: 400px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                ">
                    <h3 style="margin: 0 0 15px 0; color: #1a2332; font-size: 1.3rem;">${title}</h3>
                    <p style="margin: 0 0 25px 0; color: #666; line-height: 1.5;">${message}</p>
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="cancelBtn" style="
                            padding: 10px 20px;
                            background: #e0e0e0;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">Anuluj</button>
                        <button id="confirmBtn" style="
                            padding: 10px 20px;
                            background: linear-gradient(135deg, #FFD700, #d4af37);
                            color: #1a2332;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">Potwierdź</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.querySelector('#confirmBtn').onclick = () => {
                modal.remove();
                resolve(true);
            };
            
            modal.querySelector('#cancelBtn').onclick = () => {
                modal.remove();
                resolve(false);
            };
        });
    }
}

// Globalny dostęp
window.ui = new UIManager();

// Helper functions
window.showToast = (message, type, duration) => window.ui.toast(message, type, duration);
window.showLoading = (message) => window.ui.showLoading(message);
window.hideLoading = () => window.ui.hideLoading();
window.confirmDialog = (message, title) => window.ui.confirm(message, title);
