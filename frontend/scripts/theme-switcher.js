// ==========================================
// SYSTEM PRZEŁĄCZANIA MOTYWÓW
// ==========================================

class ThemeSwitcher {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.themes = {
            dark: {
                name: 'Dark Gold',
                icon: '🌙',
                description: 'Ciemny motyw ze złotymi akcentami'
            },
            light: {
                name: 'Rose Gold & Navy',
                icon: '💖',
                description: 'Luksusowy motyw - Rose Gold i Granat'
            }
        };
        
        this.init();
    }
    
    init() {
        // Ustaw motyw przy załadowaniu
        this.applyTheme(this.currentTheme);
        
        // Dodaj przełącznik do UI po załadowaniu DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.addSwitcher());
        } else {
            this.addSwitcher();
        }
        
        console.log('🎨 ThemeSwitcher załadowany - aktywny motyw:', this.currentTheme);
    }
    
    applyTheme(themeName) {
        document.body.setAttribute('data-theme', themeName);
        this.currentTheme = themeName;
        localStorage.setItem('theme', themeName);
        
        console.log('✅ Zastosowano motyw:', themeName);
    }
    
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.updateSwitcherUI();
        
        // Animacja przejścia
        document.body.style.transition = 'background 0.5s ease, color 0.5s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 500);
    }
    
    addSwitcher() {
        // Sprawdź czy już istnieje
        if (document.getElementById('themeSwitcher')) return;
        
        // Znajdź user profile lub sidebar
        const userProfile = document.querySelector('.user-profile');
        if (!userProfile) {
            console.warn('⚠️ Nie znaleziono .user-profile - przełącznik motywu nie został dodany');
            return;
        }
        
        // Utwórz przełącznik
        const switcher = document.createElement('div');
        switcher.id = 'themeSwitcher';
        switcher.className = 'theme-switcher';
        switcher.innerHTML = `
            <button class="theme-toggle-btn" onclick="window.themeSwitcher.toggleTheme()" title="Przełącz motyw">
                <span class="theme-icon">${this.themes[this.currentTheme].icon}</span>
                <span class="theme-name">${this.themes[this.currentTheme].name}</span>
            </button>
        `;
        
        // Wstaw po user-profile
        userProfile.insertAdjacentElement('afterend', switcher);
        
        console.log('✅ Przełącznik motywu dodany do UI');
    }
    
    updateSwitcherUI() {
        const icon = document.querySelector('.theme-icon');
        const name = document.querySelector('.theme-name');
        
        if (icon) icon.textContent = this.themes[this.currentTheme].icon;
        if (name) name.textContent = this.themes[this.currentTheme].name;
    }
}

// Inicjalizuj globalnie
window.themeSwitcher = new ThemeSwitcher();
