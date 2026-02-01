// ==========================================
// AI CO-PILOT - Inteligentny Asystent Wypełniania
// Pomaga wypełniać formularze, daje podpowiedzi, analizuje dane
// Version: 1.2.0 - Created: 2025-12-02 23:23 - FIXED!
// ==========================================

console.log('🤖🤖🤖 AI CO-PILOT LOADING v1.2.0 🤖🤖🤖');
console.log('🤖 AI Co-Pilot Module Loaded v1.2.0 - Smart Form Assistant');

class AICopilot {
    constructor() {
        this.isActive = false;
        this.currentField = null;
        this.suggestions = {};
        this.caseData = null;
    }
    
    /**
     * Inicjalizuj AI Co-Pilot dla formularza
     */
    init() {
        console.log('🤖 Inicjalizacja AI Co-Pilot...');
        this.attachToFormFields();
        this.createCopilotPanel();
        this.isActive = true;
    }
    
    /**
     * Dodaj AI Co-Pilot do wszystkich pól formularza
     */
    attachToFormFields() {
        // Znajdź wszystkie pola input, textarea, select
        const fields = document.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            // Skip hidden, buttons, checkboxes
            if (field.type === 'hidden' || field.type === 'button' || 
                field.type === 'submit' || field.type === 'checkbox' || 
                field.type === 'radio') {
                return;
            }
            
            // Dodaj ikonę AI obok pola
            this.addAIIcon(field);
            
            // Dodaj event listeners
            field.addEventListener('focus', (e) => this.onFieldFocus(e.target));
            field.addEventListener('input', (e) => this.onFieldInput(e.target));
        });
        
        console.log(`✅ AI Co-Pilot dodany do ${fields.length} pól`);
    }
    
    /**
     * Dodaj ikonę AI obok pola
     */
    addAIIcon(field) {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.width = '100%';
        
        // Przenieś pole do wrappera
        field.parentNode.insertBefore(wrapper, field);
        wrapper.appendChild(field);
        
        // Dodaj ikonę AI
        const icon = document.createElement('div');
        icon.className = 'ai-copilot-icon';
        icon.innerHTML = '🤖';
        icon.title = 'Kliknij aby uzyskać podpowiedzi AI';
        icon.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            cursor: pointer;
            font-size: 1.2rem;
            opacity: 0.5;
            transition: all 0.3s;
            z-index: 10;
        `;
        
        icon.addEventListener('mouseenter', () => {
            icon.style.opacity = '1';
            icon.style.transform = 'translateY(-50%) scale(1.2)';
        });
        
        icon.addEventListener('mouseleave', () => {
            icon.style.opacity = '0.5';
            icon.style.transform = 'translateY(-50%) scale(1)';
        });
        
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showSuggestionsForField(field);
        });
        
        wrapper.appendChild(icon);
    }
    
    /**
     * Utwórz panel AI Co-Pilot
     */
    createCopilotPanel() {
        const panel = document.createElement('div');
        panel.id = 'aiCopilotPanel';
        panel.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 80px;
            width: 350px;
            max-height: 500px;
            background: linear-gradient(135deg, #1a2332, #2d3748);
            border: 2px solid #FFD700;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.5);
            display: none;
            z-index: 10000;
            overflow: hidden;
        `;
        
        panel.innerHTML = `
            <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 15px; color: #1a2332; font-weight: bold; display: flex; justify-content: space-between; align-items: center;">
                <span>🤖 AI Co-Pilot</span>
                <button onclick="window.aiCopilot.togglePanel()" style="background: none; border: none; color: #1a2332; font-size: 1.5rem; cursor: pointer; padding: 0; line-height: 1;">×</button>
            </div>
            <div id="aiCopilotContent" style="padding: 20px; color: white; max-height: 400px; overflow-y: auto;">
                <div style="text-align: center; opacity: 0.7; padding: 40px 20px;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">🤖</div>
                    <p>Kliknij na ikonę 🤖 obok pola aby uzyskać podpowiedzi AI</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Dodaj przycisk toggle
        this.createToggleButton();
    }
    
    /**
     * Utwórz przycisk toggle dla panelu
     */
    createToggleButton() {
        const btn = document.createElement('button');
        btn.id = 'aiCopilotToggle';
        btn.innerHTML = '🤖';
        btn.title = 'AI Co-Pilot - Asystent wypełniania';
        btn.style.cssText = `
            position: fixed;
            right: 20px;
            bottom: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FFD700, #FFA500);
            border: none;
            font-size: 2rem;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(255, 215, 0, 0.5);
            z-index: 9999;
            transition: all 0.3s;
        `;
        
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.1)';
            btn.style.boxShadow = '0 6px 30px rgba(255, 215, 0, 0.7)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
            btn.style.boxShadow = '0 4px 20px rgba(255, 215, 0, 0.5)';
        });
        
        btn.addEventListener('click', () => this.togglePanel());
        
        document.body.appendChild(btn);
    }
    
    /**
     * Toggle panel visibility
     */
    togglePanel() {
        const panel = document.getElementById('aiCopilotPanel');
        if (panel.style.display === 'none' || !panel.style.display) {
            panel.style.display = 'block';
            panel.style.animation = 'slideInRight 0.3s ease';
        } else {
            panel.style.display = 'none';
        }
    }
    
    /**
     * Obsłuż focus na polu
     */
    onFieldFocus(field) {
        this.currentField = field;
        
        // Pokaż panel jeśli ukryty
        const panel = document.getElementById('aiCopilotPanel');
        if (panel && panel.style.display === 'none') {
            // Nie pokazuj automatycznie - niech user kliknie ikonę
        }
    }
    
    /**
     * Obsłuż input w polu
     */
    onFieldInput(field) {
        // Możesz tu dodać real-time suggestions
    }
    
    /**
     * Pokaż podpowiedzi dla pola
     */
    async showSuggestionsForField(field) {
        const panel = document.getElementById('aiCopilotPanel');
        const content = document.getElementById('aiCopilotContent');
        
        panel.style.display = 'block';
        
        // Pokaż loading
        content.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <div style="font-size: 3rem; animation: spin 2s linear infinite;">🤖</div>
                <p style="margin-top: 15px;">AI analizuje pole...</p>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        
        try {
            const fieldInfo = this.getFieldInfo(field);
            const suggestions = await this.getSuggestionsFromAI(fieldInfo);
            
            this.displaySuggestions(suggestions, field);
            
        } catch (error) {
            content.innerHTML = `
                <div style="background: rgba(244,67,54,0.2); border: 1px solid #f44336; padding: 15px; border-radius: 8px;">
                    <div style="font-weight: bold; margin-bottom: 10px;">❌ Błąd</div>
                    <div style="opacity: 0.8;">${error.message}</div>
                </div>
            `;
        }
    }
    
    /**
     * Pobierz informacje o polu
     */
    getFieldInfo(field) {
        const label = this.getFieldLabel(field);
        const name = field.name || field.id || 'unknown';
        const value = field.value || '';
        const placeholder = field.placeholder || '';
        const type = field.type || field.tagName.toLowerCase();
        
        return {
            name,
            label,
            value,
            placeholder,
            type,
            field
        };
    }
    
    /**
     * Znajdź label dla pola
     */
    getFieldLabel(field) {
        // Spróbuj znaleźć label przez for
        const labelFor = document.querySelector(`label[for="${field.id}"]`);
        if (labelFor) return labelFor.textContent.trim();
        
        // Spróbuj znaleźć poprzedni label
        let prev = field.previousElementSibling;
        while (prev) {
            if (prev.tagName === 'LABEL') {
                return prev.textContent.trim();
            }
            prev = prev.previousElementSibling;
        }
        
        // Spróbuj znaleźć parent label
        const parentLabel = field.closest('label');
        if (parentLabel) return parentLabel.textContent.trim();
        
        return field.name || field.id || 'Pole';
    }
    
    /**
     * Pobierz podpowiedzi z AI
     */
    async getSuggestionsFromAI(fieldInfo) {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Brak autoryzacji - zaloguj się ponownie');
        }
        
        // Przygotuj kontekst
        const context = {
            fieldName: fieldInfo.name,
            fieldLabel: fieldInfo.label,
            fieldType: fieldInfo.type,
            currentValue: fieldInfo.value,
            placeholder: fieldInfo.placeholder,
            caseData: window.crmManager?.currentCaseData || null
        };
        
        const prompt = `Jestem asystentem AI wypełniania formularzy w systemie prawniczym. Pomóż użytkownikowi wypełnić pole formularza.

POLE: ${fieldInfo.label || fieldInfo.name}
TYP: ${fieldInfo.type}
OBECNA WARTOŚĆ: ${fieldInfo.value || '(puste)'}
PLACEHOLDER: ${fieldInfo.placeholder || '(brak)'}

${context.caseData ? `KONTEKST SPRAWY:
Numer: ${context.caseData.case_number || '(brak)'}
Tytuł: ${context.caseData.title || '(brak)'}
Typ: ${context.caseData.case_type || '(brak)'}
Status: ${context.caseData.status || '(brak)'}
` : ''}

Proszę:
1. Zasugeruj 2-3 przykładowe wartości dla tego pola (jeśli to ma sens)
2. Wyjaśnij krótko co powinno być w tym polu
3. Podaj wskazówki prawne jeśli to pole prawne

Odpowiedz w formacie JSON:
{
  "suggestions": ["opcja1", "opcja2", "opcja3"],
  "explanation": "Co powinno być w tym polu...",
  "legalTips": "Wskazówki prawne..."
}`;

        const response = await fetch('http://localhost:3500/api/ai/gemini/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                question: prompt,
                context: JSON.stringify(context)
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Błąd AI');
        }
        
        const data = await response.json();
        
        // Spróbuj sparsować JSON z odpowiedzi
        try {
            const jsonMatch = data.answer.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
        } catch (e) {
            // Jeśli nie JSON, zwróć surową odpowiedź
        }
        
        return {
            suggestions: [],
            explanation: data.answer,
            legalTips: ''
        };
    }
    
    /**
     * Wyświetl podpowiedzi
     */
    displaySuggestions(suggestions, field) {
        const content = document.getElementById('aiCopilotContent');
        
        let html = `
            <div style="margin-bottom: 20px;">
                <div style="font-weight: bold; color: #FFD700; margin-bottom: 10px;">
                    📝 ${this.getFieldLabel(field)}
                </div>
        `;
        
        // Wyjaśnienie
        if (suggestions.explanation) {
            html += `
                <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 15px; line-height: 1.6;">
                    ${suggestions.explanation}
                </div>
            `;
        }
        
        // Sugestie
        if (suggestions.suggestions && suggestions.suggestions.length > 0) {
            html += `
                <div style="margin-bottom: 15px;">
                    <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 8px;">💡 Sugestie:</div>
            `;
            
            suggestions.suggestions.forEach((suggestion, index) => {
                html += `
                    <button 
                        onclick="window.aiCopilot.applySuggestion('${suggestion.replace(/'/g, "\\'")}', '${field.id || field.name}')"
                        style="
                            background: linear-gradient(135deg, #2d3748, #1a2332);
                            border: 1px solid #FFD700;
                            color: white;
                            padding: 10px 15px;
                            border-radius: 8px;
                            margin: 5px;
                            cursor: pointer;
                            transition: all 0.3s;
                            display: block;
                            width: 100%;
                            text-align: left;
                        "
                        onmouseover="this.style.background='linear-gradient(135deg, #FFD700, #FFA500)'; this.style.color='#1a2332';"
                        onmouseout="this.style.background='linear-gradient(135deg, #2d3748, #1a2332)'; this.style.color='white';"
                    >
                        ${suggestion}
                    </button>
                `;
            });
            
            html += `</div>`;
        }
        
        // Wskazówki prawne
        if (suggestions.legalTips) {
            html += `
                <div style="background: rgba(76,175,80,0.2); border-left: 3px solid #4caf50; padding: 12px; border-radius: 8px; margin-top: 15px;">
                    <div style="font-weight: bold; color: #4caf50; margin-bottom: 5px;">⚖️ Wskazówki prawne:</div>
                    <div style="font-size: 0.9rem; line-height: 1.5;">${suggestions.legalTips}</div>
                </div>
            `;
        }
        
        html += `</div>`;
        
        content.innerHTML = html;
    }
    
    /**
     * Zastosuj sugestię
     */
    applySuggestion(suggestion, fieldIdentifier) {
        const field = document.getElementById(fieldIdentifier) || 
                     document.querySelector(`[name="${fieldIdentifier}"]`);
        
        if (field) {
            field.value = suggestion;
            field.focus();
            
            // Trigger input event
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Pokaż success
            const content = document.getElementById('aiCopilotContent');
            const successMsg = document.createElement('div');
            successMsg.style.cssText = `
                background: rgba(76,175,80,0.3);
                border: 1px solid #4caf50;
                padding: 10px;
                border-radius: 8px;
                margin-top: 10px;
                animation: fadeIn 0.3s;
            `;
            successMsg.innerHTML = '✅ Zastosowano sugestię!';
            content.appendChild(successMsg);
            
            setTimeout(() => {
                successMsg.style.animation = 'fadeOut 0.3s';
                setTimeout(() => successMsg.remove(), 300);
            }, 2000);
        }
    }
}

// Inicjalizuj globalnie
window.aiCopilot = new AICopilot();

// Auto-init gdy DOM gotowy
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.aiCopilot.init(), 1000);
    });
} else {
    setTimeout(() => window.aiCopilot.init(), 1000);
}

// CSS animations
const style = document.createElement('style');
style.innerHTML = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
