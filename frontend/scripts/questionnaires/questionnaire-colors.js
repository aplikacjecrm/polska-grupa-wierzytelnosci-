// ==========================================
// QUESTIONNAIRE COLORS - SCHEMAT KOLORYSTYCZNY
// ==========================================
// Centralna definicja kolorów dla wszystkich ankiet

console.log('🎨 Ładowanie schematu kolorystycznego ankiet...');

window.questionnaireColors = {
    // KOLORY BRANDOWE PRO MERITUM
    brand: {
        gold: '#d4af37',           // Złoty - główny kolor
        darkBlue: '#1a2332',       // Ciemnoniebieski - tło
        navy: '#2c3e50',           // Granatowy - gradient
        platinumSilver: '#c0c5ce'  // Platynowy - akcenty
    },

    // STANDARDOWY SCHEMAT DLA PANELI ANKIET
    panel: {
        // Tło panelu (gradient)
        background: 'linear-gradient(135deg, #1a2332, #2c3e50)',
        
        // Border panelu
        border: '2px solid #FFD700',
        borderColor: '#FFD700',
        
        // Shadow
        boxShadow: '0 4px 20px rgba(255,215,0,0.4)',
        
        // Tekst
        titleColor: 'white',
        descriptionColor: 'rgba(255,255,255,0.9)',
        
        // Karty statystyk
        cardBackground: 'rgba(255,255,255,0.15)',
        cardBackdrop: 'blur(10px)'
    },

    // PRZYCISKI
    button: {
        // Tło przycisku (gradient)
        background: 'linear-gradient(135deg, #FFD700, #d4af37)',
        
        // Tekst przycisku
        color: '#1a2332',
        
        // Border przycisku
        border: '2px solid #1a2332',
        
        // Shadow
        boxShadow: 'rgba(0, 0, 0, 0.3) 0px 6px 20px',
        boxShadowHover: '0 8px 25px rgba(255,215,0,0.5)'
    },

    // FUNKCJE POMOCNICZE
    getPanelStyle() {
        return `
            background: ${this.panel.background};
            padding: 25px;
            border-radius: 12px;
            box-shadow: ${this.panel.boxShadow};
            text-align: center;
            margin-bottom: 20px;
            border: ${this.panel.border};
        `;
    },

    getButtonStyle() {
        return `
            padding: 18px 40px;
            background: ${this.button.background};
            color: ${this.button.color};
            border: ${this.button.border};
            border-radius: 12px;
            font-weight: 700;
            font-size: 1.2rem;
            cursor: pointer;
            box-shadow: ${this.button.boxShadow};
            transition: 0.3s;
            margin-top: 20px;
            transform: scale(1);
        `;
    },

    getCardStyle() {
        return `
            background: ${this.panel.cardBackground};
            padding: 15px;
            border-radius: 8px;
            backdrop-filter: ${this.panel.cardBackdrop};
        `;
    }
};

// EKSPORTUJ STYLE DO UŻYTKU GLOBALNEGO
window.getQuestionnaireStyles = () => window.questionnaireColors;

console.log('✅ Schemat kolorystyczny ankiet załadowany!');
console.log('🎨 Kolory Pro Meritum:');
console.log('   - Złoty:', window.questionnaireColors.brand.gold);
console.log('   - Ciemnoniebieski:', window.questionnaireColors.brand.darkBlue);
console.log('   - Granatowy:', window.questionnaireColors.brand.navy);
