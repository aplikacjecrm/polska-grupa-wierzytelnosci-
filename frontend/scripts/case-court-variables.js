/**
 * MODUŁ ZMIENNYCH SĄDU DLA DOKUMENTÓW
 * 
 * Dostarcza automatyczne zmienne z danymi sądu do generatorów dokumentów
 * Rozszerza kontekst zmiennych o: {{court_name}}, {{court_address}}, {{court_phone}} itp.
 */

console.log('📄 Moduł Zmiennych Sądu załadowany!');

/**
 * Pobierz dane sądu dla sprawy
 */
window.getCourtVariables = async function(caseId) {
    try {
        console.log('📋 Pobieram dane sądu dla sprawy:', caseId);
        
        const response = await window.api.request(`/cases/${caseId}`);
        const caseData = response.case;
        
        // Przygotuj zmienne sądu
        const courtVariables = {
            // Dane z bazy sądów (jeśli przypisano)
            court_id: caseData.court_id || '',
            court_name: caseData.court_name || '',
            court_address: caseData.court_address || '',
            court_phone: caseData.court_phone || '',
            court_email: caseData.court_email || '',
            court_website: '', // Będzie pobrane z API jeśli potrzebne
            
            // Dane ręczne
            court_type: caseData.court_type || '',
            court_department: caseData.court_department || '',
            court_signature: caseData.court_signature || '',
            judge_name: caseData.judge_name || '',
            referent: caseData.referent || '',
            
            // Prokuratura (dla spraw karnych)
            prosecutor_office: caseData.prosecutor_office || '',
            prosecutor_name: caseData.prosecutor_name || '',
            indictment_number: caseData.indictment_number || '',
            
            // Dane sprawy
            case_number: caseData.case_number || '',
            case_title: caseData.title || '',
            case_type: caseData.case_type || '',
            case_status: caseData.status || '',
            
            // Dane klienta (jeśli dostępne)
            client_name: caseData.client_name || '',
            client_address: caseData.client_address || '',
            
            // Data i czas
            today: new Date().toLocaleDateString('pl-PL'),
            today_long: new Date().toLocaleDateString('pl-PL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        };
        
        // Jeśli sprawa ma przypisany sąd z bazy - pobierz pełne dane
        if (caseData.court_id) {
            try {
                const courtResponse = await window.api.request(`/courts/${caseData.court_id}`);
                const courtData = courtResponse.court;
                
                courtVariables.court_website = courtData.website || '';
                courtVariables.court_departments = courtData.departments ? courtData.departments.join(', ') : '';
                courtVariables.court_full_name = courtData.name || '';
                courtVariables.court_short_name = courtData.shortName || '';
                
                console.log('✅ Pobrano pełne dane sądu z bazy');
            } catch (error) {
                console.warn('⚠️ Nie udało się pobrać pełnych danych sądu:', error);
            }
        }
        
        console.log('✅ Zmienne sądu przygotowane:', courtVariables);
        return courtVariables;
        
    } catch (error) {
        console.error('❌ Błąd pobierania zmiennych sądu:', error);
        return {};
    }
};

/**
 * Wypełnij szablon dokumentu zmiennymi sądu
 */
window.fillCourtTemplate = async function(templateText, caseId) {
    try {
        console.log('📝 Wypełniam szablon zmiennymi sądu');
        
        const variables = await window.getCourtVariables(caseId);
        let filledTemplate = templateText;
        
        // Zastąp wszystkie zmienne w szablonie
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            filledTemplate = filledTemplate.replace(regex, value || '[BRAK DANYCH]');
        }
        
        console.log('✅ Szablon wypełniony');
        return filledTemplate;
        
    } catch (error) {
        console.error('❌ Błąd wypełniania szablonu:', error);
        return templateText;
    }
};

/**
 * Podgląd dostępnych zmiennych dla użytkownika
 */
window.showAvailableCourtVariables = async function(caseId) {
    const variables = await window.getCourtVariables(caseId);
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100vh; background: rgba(0,0,0,0.8); z-index: 10002; display: flex; justify-content: center; align-items: center; padding: 20px;';
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto;">
            <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 25px; border-radius: 16px 16px 0 0; color: white; position: sticky; top: 0; z-index: 100;">
                <h3 style="margin: 0; font-size: 1.5rem;">📋 Dostępne zmienne dla dokumentów</h3>
                <p style="margin: 5px 0 0 0; opacity: 0.9;">Skopiuj i wklej do szablonu dokumentu</p>
            </div>
            
            <div style="padding: 30px;">
                <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0; color: #1E40AF;">💡 Jak używać?</h4>
                    <p style="margin: 0; color: #666;">
                        W szablonie dokumentu użyj zmiennych w formacie: <code style="background: white; padding: 2px 6px; border-radius: 3px; color: #3B82F6;">{{nazwa_zmiennej}}</code>
                        <br>Przykład: <code style="background: white; padding: 2px 6px; border-radius: 3px; color: #3B82F6;">Sąd: {{court_name}}, Adres: {{court_address}}</code>
                    </p>
                </div>
                
                <!-- Zmienne Sądu -->
                <div style="margin-bottom: 25px;">
                    <h4 style="margin: 0 0 15px 0; color: #1a2332; border-bottom: 2px solid #3B82F6; padding-bottom: 8px;">
                        🏛️ Zmienne Sądu
                    </h4>
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; font-size: 0.95rem;">
                        ${Object.entries(variables)
                            .filter(([key]) => key.startsWith('court_'))
                            .map(([key, value]) => `
                                <div style="padding: 8px; background: #f5f5f5; border-radius: 4px; font-family: 'Courier New', monospace; color: #3B82F6; cursor: pointer;" 
                                     onclick="navigator.clipboard.writeText('{{${key}}}'); this.style.background='#d4edda'; setTimeout(() => this.style.background='#f5f5f5', 300);"
                                     title="Kliknij aby skopiować">
                                    {{${key}}}
                                </div>
                                <div style="padding: 8px; background: white; border-radius: 4px; color: #666;">
                                    ${value || '<em style="color: #999;">Brak danych</em>'}
                                </div>
                            `).join('')}
                    </div>
                </div>
                
                <!-- Zmienne Sędziego -->
                ${variables.judge_name || variables.referent ? `
                    <div style="margin-bottom: 25px;">
                        <h4 style="margin: 0 0 15px 0; color: #1a2332; border-bottom: 2px solid #3B82F6; padding-bottom: 8px;">
                            👨‍⚖️ Zmienne Sędziego
                        </h4>
                        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; font-size: 0.95rem;">
                            ${variables.judge_name ? `
                                <div style="padding: 8px; background: #f5f5f5; border-radius: 4px; font-family: 'Courier New', monospace; color: #3B82F6; cursor: pointer;" 
                                     onclick="navigator.clipboard.writeText('{{judge_name}}'); this.style.background='#d4edda'; setTimeout(() => this.style.background='#f5f5f5', 300);">
                                    {{judge_name}}
                                </div>
                                <div style="padding: 8px; background: white; border-radius: 4px; color: #666;">
                                    ${variables.judge_name}
                                </div>
                            ` : ''}
                            ${variables.referent ? `
                                <div style="padding: 8px; background: #f5f5f5; border-radius: 4px; font-family: 'Courier New', monospace; color: #3B82F6; cursor: pointer;" 
                                     onclick="navigator.clipboard.writeText('{{referent}}'); this.style.background='#d4edda'; setTimeout(() => this.style.background='#f5f5f5', 300);">
                                    {{referent}}
                                </div>
                                <div style="padding: 8px; background: white; border-radius: 4px; color: #666;">
                                    ${variables.referent}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Zmienne Prokuratury -->
                ${variables.prosecutor_office || variables.prosecutor_name ? `
                    <div style="margin-bottom: 25px;">
                        <h4 style="margin: 0 0 15px 0; color: #1a2332; border-bottom: 2px solid #9c27b0; padding-bottom: 8px;">
                            🔍 Zmienne Prokuratury
                        </h4>
                        <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; font-size: 0.95rem;">
                            ${Object.entries(variables)
                                .filter(([key]) => key.startsWith('prosecutor_') || key === 'indictment_number')
                                .filter(([_, value]) => value)
                                .map(([key, value]) => `
                                    <div style="padding: 8px; background: #f5f5f5; border-radius: 4px; font-family: 'Courier New', monospace; color: #3B82F6; cursor: pointer;" 
                                         onclick="navigator.clipboard.writeText('{{${key}}}'); this.style.background='#d4edda'; setTimeout(() => this.style.background='#f5f5f5', 300);">
                                        {{${key}}}
                                    </div>
                                    <div style="padding: 8px; background: white; border-radius: 4px; color: #666;">
                                        ${value}
                                    </div>
                                `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- Zmienne Sprawy -->
                <div style="margin-bottom: 25px;">
                    <h4 style="margin: 0 0 15px 0; color: #1a2332; border-bottom: 2px solid #3B82F6; padding-bottom: 8px;">
                        📋 Zmienne Sprawy
                    </h4>
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; font-size: 0.95rem;">
                        ${Object.entries(variables)
                            .filter(([key]) => key.startsWith('case_') || key.startsWith('client_'))
                            .map(([key, value]) => `
                                <div style="padding: 8px; background: #f5f5f5; border-radius: 4px; font-family: 'Courier New', monospace; color: #3B82F6; cursor: pointer;" 
                                     onclick="navigator.clipboard.writeText('{{${key}}}'); this.style.background='#d4edda'; setTimeout(() => this.style.background='#f5f5f5', 300);">
                                    {{${key}}}
                                </div>
                                <div style="padding: 8px; background: white; border-radius: 4px; color: #666;">
                                    ${value || '<em style="color: #999;">Brak danych</em>'}
                                </div>
                            `).join('')}
                    </div>
                </div>
                
                <!-- Zmienne Daty -->
                <div style="margin-bottom: 25px;">
                    <h4 style="margin: 0 0 15px 0; color: #1a2332; border-bottom: 2px solid #3B82F6; padding-bottom: 8px;">
                        📅 Zmienne Daty
                    </h4>
                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px; font-size: 0.95rem;">
                        ${Object.entries(variables)
                            .filter(([key]) => key.startsWith('today'))
                            .map(([key, value]) => `
                                <div style="padding: 8px; background: #f5f5f5; border-radius: 4px; font-family: 'Courier New', monospace; color: #3B82F6; cursor: pointer;" 
                                     onclick="navigator.clipboard.writeText('{{${key}}}'); this.style.background='#d4edda'; setTimeout(() => this.style.background='#f5f5f5', 300);">
                                    {{${key}}}
                                </div>
                                <div style="padding: 8px; background: white; border-radius: 4px; color: #666;">
                                    ${value}
                                </div>
                            `).join('')}
                    </div>
                </div>
                
                <div style="padding-top: 20px; border-top: 2px solid #e0e0e0;">
                    <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" 
                        style="width: 100%; padding: 14px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                        ✓ Zamknij
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Zamknij przy kliknięciu w tło
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

/**
 * Przycisk "Pokaż zmienne" do dodania w formularzu dokumentów
 */
window.createCourtVariablesButton = function(caseId) {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = '📋 Pokaż dostępne zmienne';
    button.style.cssText = 'padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; margin: 10px 0;';
    button.onclick = () => window.showAvailableCourtVariables(caseId);
    
    button.addEventListener('mouseover', () => button.style.background = '#1E40AF');
    button.addEventListener('mouseout', () => button.style.background = '#3B82F6');
    
    return button;
};

console.log('✅ Moduł Zmiennych Sądu gotowy!');
console.log('💡 Użyj: window.getCourtVariables(caseId) aby pobrać zmienne');
console.log('💡 Użyj: window.showAvailableCourtVariables(caseId) aby pokazać listę zmiennych');
