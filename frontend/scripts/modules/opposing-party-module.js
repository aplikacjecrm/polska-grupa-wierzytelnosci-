// ==========================================
// MODUŁ STRONY PRZECIWNEJ - UNIFIED v2.0
// Guided Workflow (7 kroków) + API Searchers (6 integracji)
// Smart Start + Evidence Bank + Auto-fill
// v2.0 - 2025-11-10
// ==========================================

console.log('⚔️⚔️⚔️ UNIFIED MODULE v2.0 - Workflow + API ⚔️⚔️⚔️');
console.log('✅ 7 Kroków Guided Workflow');
console.log('✅ 6 Wyszukiwarek API: CEIDG, KRS, CEPiK, UFG, Social, FB Groups');

window.opposingAnalysisModule = {
    currentOpposingId: null,
    currentCaseId: null,
    currentStep: 0,
    data: {},
    
    // ==========================================
    // 1. GŁÓWNA FUNKCJA RENDERUJĄCA
    // ==========================================
    
    async render(caseId) {
        console.log(`🕵️ Renderuję moduł analizy dla sprawy: ${caseId}`);
        this.currentCaseId = caseId;
        
        try {
            // Pobierz dane
            const response = await window.api.request(`/opposing-analysis/case/${caseId}`);
            
            if (response.exists) {
                // Istnieje - pokaż dashboard lub workflow
                this.data = response;
                this.currentOpposingId = response.opposing.id;
                this.currentStep = response.opposing.workflow_step || 0;
                
                if (response.opposing.workflow_completed) {
                    return this.renderDashboard();
                } else {
                    return this.renderWorkflow();
                }
            } else {
                // Nie istnieje - pokaż start screen
                return this.renderStartScreen();
            }
            
        } catch (error) {
            console.error('❌ Błąd ładowania modułu:', error);
            return `<div style="padding: 20px; color: red;">❌ Błąd ładowania modułu analizy</div>`;
        }
    },
    
    // ==========================================
    // 2. START SCREEN - Przed rozpoczęciem
    // ==========================================
    
    renderStartScreen() {
        return `
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">🎯</div>
                <h2 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 1.8rem;">Analiza Strony Przeciwnej</h2>
                <p style="color: #7f8c8d; font-size: 1.1rem; margin: 0 0 30px 0; max-width: 600px; margin-left: auto; margin-right: auto;">
                    Przeprowadzimy Cię przez pełną analizę przeciwnika krok po kroku. 
                    Poznaj jego słabe punkty, taktyki i historię - zdobądź przewagę w sądzie!
                </p>
                
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; max-width: 500px; margin: 0 auto 30px auto; color: #000;">
                    <div style="font-size: 2.5rem; margin-bottom: 10px;">⏱️</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Szacowany czas:</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">15-20 minut</div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; max-width: 700px; margin: 0 auto 40px auto;">
                    <div style="background: #ecf0f1; padding: 20px; border-radius: 8px;">
                        <div style="font-size: 2rem; margin-bottom: 8px;">📝</div>
                        <div style="font-weight: 600; color: #2c3e50;">7 Kroków</div>
                        <div style="font-size: 0.85rem; color: #7f8c8d;">Guided workflow</div>
                    </div>
                    <div style="background: #ecf0f1; padding: 20px; border-radius: 8px;">
                        <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
                        <div style="font-weight: 600; color: #2c3e50;">Smart Search</div>
                        <div style="font-size: 0.85rem; color: #7f8c8d;">Auto-otwieranie źródeł</div>
                    </div>
                    <div style="background: #ecf0f1; padding: 20px; border-radius: 8px;">
                        <div style="font-size: 2rem; margin-bottom: 8px;">📸</div>
                        <div style="font-size: 0.85rem; color: #7f8c8d;">Evidence Bank</div>
                    </div>
                    <div style="background: #ecf0f1; padding: 20px; border-radius: 8px;">
                        <div style="font-size: 2rem; margin-bottom: 8px;">🤖</div>
                        <div style="font-weight: 600; color: #2c3e50;">AI Analysis</div>
                        <div style="font-size: 0.85rem; color: #7f8c8d;">Red flags detection</div>
                    </div>
                </div>
                
                <button onclick="window.opposingAnalysisModule.startAnalysis()" style="
                    padding: 18px 50px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: #000;
                    border: none;
                    border-radius: 12px;
                    font-size: 1.3rem;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
                    transition: all 0.3s;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 25px rgba(102, 126, 234, 0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 6px 20px rgba(102, 126, 234, 0.4)'">
                    🚀 Rozpocznij analizę
                </button>
                
                <p style="color: #95a5a6; font-size: 0.85rem; margin-top: 20px;">
                    💡 Możesz przerwać i wrócić w dowolnym momencie - postęp jest automatycznie zapisywany
                </p>
            </div>
        `;
    },
    
    // ==========================================
    // 3. START ANALYSIS - Inicjalizacja
    // ==========================================
    
    async startAnalysis() {
        // Pokaż smart modal z auto-lookup
        this.showSmartStartModal();
    },
    
    showSmartStartModal() {
        const modal = document.createElement('div');
        modal.id = 'smart-start-modal';
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;">
                <div style="background: white; padding: 40px; border-radius: 16px; max-width: 600px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                    <h2 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 1.8rem;">🕵️ Rozpocznij analizę przeciwnika</h2>
                    <p style="color: #7f8c8d; margin: 0 0 30px 0; font-size: 1rem;">
                        Wpisz <strong>nazwę firmy</strong> lub <strong>imię i nazwisko</strong> - dane zostaną automatycznie uzupełnione.
                    </p>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #2c3e50;">
                            🔍 Wyszukaj przeciwnika:
                        </label>
                        <input 
                            type="text" 
                            id="smart_search_input" 
                            placeholder="Wpisz nazwę firmy lub imię i nazwisko" 
                            style="
                                width: 100%;
                                padding: 15px;
                                border: 2px solid #bdc3c7;
                                border-radius: 8px;
                                font-size: 1.1rem;
                                transition: border 0.3s;
                            "
                            onfocus="this.style.borderColor='#667eea'"
                            onblur="this.style.borderColor='#bdc3c7'"
                        />
                        <small id="search_hint" style="display: block; margin-top: 8px; color: #95a5a6; font-size: 0.9rem;">
                            💡 Po rozpoczęciu, dane firmy zostaną automatycznie pobrane z CEIDG/KRS
                        </small>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #2c3e50;">
                            Typ strony przeciwnej:
                        </label>
                        <div style="display: flex; gap: 15px;">
                            <label style="flex: 1; cursor: pointer;">
                                <input type="radio" name="party_type" value="company" checked style="margin-right: 8px;" />
                                <span style="font-size: 1.1rem;">🏢 Firma</span>
                            </label>
                            <label style="flex: 1; cursor: pointer;">
                                <input type="radio" name="party_type" value="individual" style="margin-right: 8px;" />
                                <span style="font-size: 1.1rem;">👤 Osoba fizyczna</span>
                            </label>
                        </div>
                    </div>
                    
                    <!-- Status Message -->
                    <div id="smart_search_status" style="display: none; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: 600;"></div>
                    
                    <div style="display: flex; gap: 15px; justify-content: flex-end;">
                        <button onclick="window.opposingAnalysisModule.closeSmartModal()" style="
                            padding: 12px 30px;
                            background: #ecf0f1;
                            color: #2c3e50;
                            border: none;
                            border-radius: 8px;
                            font-size: 1rem;
                            font-weight: 600;
                            cursor: pointer;
                        ">Anuluj</button>
                        <button onclick="window.opposingAnalysisModule.processSmartStart()" style="
                            padding: 12px 40px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: #000;
                            border: none;
                            border-radius: 8px;
                            font-size: 1rem;
                            font-weight: 600;
                            cursor: pointer;
                            box-shadow: 0 4px 15px rgba(118, 75, 162, 0.4);
                        ">🚀 Rozpocznij analizę</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-hint on input
        const input = document.getElementById('smart_search_input');
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            const hint = document.getElementById('search_hint');
            
            if (!value || value.length < 3) {
                hint.textContent = '💡 Po rozpoczęciu, dane firmy zostaną automatycznie pobrane z CEIDG/KRS';
                hint.style.color = '#95a5a6';
            } else {
                hint.textContent = '✅ Gotowe do rozpoczęcia analizy';
                hint.style.color = '#27ae60';
            }
        });
        
        // Enter key support
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.processSmartStart();
            }
        });
    },
    
    closeSmartModal() {
        const modal = document.getElementById('smart-start-modal');
        if (modal) modal.remove();
    },
    
    async processSmartStart() {
        const input = document.getElementById('smart_search_input').value.trim();
        if (!input) {
            alert('Wprowadź nazwę firmy, NIP lub REGON!');
            return;
        }
        
        const partyType = document.querySelector('input[name="party_type"]:checked').value;
        const statusDiv = document.getElementById('smart_search_status');
        
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.style.background = '#e3f2fd';
            statusDiv.style.color = '#1976d2';
            statusDiv.innerHTML = '🔍 Analizuję dane i pobieram informacje...';
        }
        
        console.log('🚀 Smart Start - Input:', input, 'Type:', partyType, 'Case ID:', this.currentCaseId);
        
        try {
            // Sprawdź czy to NIP/REGON/KRS
            const cleanValue = input.replace(/[-\s]/g, '');
            let lookupData = null;
            let name = input;
            
            if (/^\d{10}$/.test(cleanValue)) {
                // NIP - używamy CEIDG API
                console.log('✅ Wykryto NIP:', cleanValue);
                if (statusDiv) statusDiv.innerHTML = '🔍 Wykryto NIP - pobieranie danych z CEIDG...';
                const response = await window.api.request(`/opposing-analysis/lookup/nip/${cleanValue}`);
                console.log('📥 Odpowiedź lookup NIP:', response);
                if (response.success && response.data) {
                    lookupData = response.data;
                    name = lookupData.name;
                    console.log('✅ Dane z lookup:', lookupData);
                } else {
                    console.log('⚠️ Brak danych z lookup');
                }
            } else if (/^\d{9}$/.test(cleanValue)) {
                // REGON - opcjonalnie (wymaga klucza GUS)
                console.log('✅ Wykryto REGON:', cleanValue);
                if (statusDiv) statusDiv.innerHTML = '🔍 Wykryto REGON - pobieranie danych...';
                const response = await window.api.request(`/opposing-analysis/lookup/regon/${cleanValue}`);
                console.log('📥 Odpowiedź lookup REGON:', response);
                if (response.success && response.data) {
                    lookupData = response.data;
                    name = lookupData.name;
                    console.log('✅ Dane z lookup:', lookupData);
                } else {
                    console.log('⚠️ Brak danych z lookup');
                }
            } else if (/^\d{10,}$/.test(cleanValue)) {
                // KRS - BRAK AUTO-LOOKUP (brak darmowego API)
                console.log('ℹ️ Wykryto KRS:', cleanValue);
                if (statusDiv) statusDiv.innerHTML = 'ℹ️ Wykryto KRS - użyj przycisku "Wyszukiwarka KRS" aby pobrać dane';
                // NIE POBIERAMY - user musi użyć przycisku KRS
                name = input; // Używamy wpisanej wartości jako nazwy
            } else {
                console.log('ℹ️ Nie wykryto NIP/REGON/KRS, używam jako nazwa:', input);
            }
            
            // Rozpocznij analizę
            if (statusDiv) statusDiv.innerHTML = '✅ Tworzenie analizy...';
            const response = await window.api.request(`/opposing-analysis/case/${this.currentCaseId}/start`, {
                method: 'POST',
                body: { name, party_type: partyType }
            });
            
            if (response.success) {
                this.currentOpposingId = response.opposingId;
                console.log('✅ Analiza utworzona, ID:', this.currentOpposingId);
                
                // Jeśli mamy dane z lookup, zapisz je od razu
                if (lookupData) {
                    console.log('💾 Zapisuję dane z lookup:', lookupData);
                    if (statusDiv) statusDiv.innerHTML = '💾 Zapisywanie pobranych danych...';
                    const updateResponse = await window.api.request(`/opposing-analysis/${this.currentOpposingId}`, {
                        method: 'PUT',
                        body: lookupData
                    });
                    console.log('✅ Odpowiedź z PUT:', updateResponse);
                } else {
                    console.log('ℹ️ Brak danych z lookup do zapisania');
                }
                
                if (statusDiv) {
                    statusDiv.style.background = '#e8f5e9';
                    statusDiv.style.color = '#2e7d32';
                    statusDiv.innerHTML = '🎉 Dane pobrane i zapisane! Otwieranie analizy...';
                }
                
                setTimeout(async () => {
                    this.closeSmartModal();
                    
                    // NAJPIERW odśwież dane z bazy (pobiera nowo utworzoną analizę)
                    const response = await window.api.request(`/opposing-analysis/case/${this.currentCaseId}`);
                    this.data = response;
                    this.currentOpposingId = response.opposing.id;
                    
                    // POTEM ustaw currentStep na 1 (nadpisz wartość z bazy która jest 0)
                    this.currentStep = 1;
                    
                    // Teraz odśwież widok - pokaże krok 1
                    await this.refreshView();
                    window.showNotification('✅ Analiza rozpoczęta - dane automatycznie uzupełnione!', 'success');
                }, 1000);
            } else {
                console.log('❌ Błąd tworzenia analizy:', response);
            }
        } catch (error) {
            console.error('❌ Błąd smart start:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                caseId: this.currentCaseId
            });
            if (statusDiv) {
                statusDiv.style.background = '#ffebee';
                statusDiv.style.color = '#c62828';
                statusDiv.innerHTML = `❌ Błąd: ${error.message || 'Sprawdź połączenie'}`;
            }
            window.showNotification('❌ Błąd rozpoczęcia analizy', 'error');
        }
    },
    
    // ==========================================
    // 4. GUIDED WORKFLOW - 7 kroków
    // ==========================================
    
    renderWorkflow() {
        const steps = [
            { num: 1, name: 'Podstawowa identyfikacja', icon: '🏢' },
            { num: 2, name: 'Flash check finansowy', icon: '💰' },
            { num: 3, name: 'Social Media Scan', icon: '📱' },
            { num: 4, name: 'Historia sądowa', icon: '⚖️' },
            { num: 5, name: 'Taktyki procesowe', icon: '🎭' },
            { num: 6, name: 'Pełnomocnik prawny', icon: '👨‍⚖️' },
            { num: 7, name: 'Podsumowanie i AI', icon: '🤖' }
        ];
        
        const currentStepData = steps[this.currentStep - 1] || steps[0];
        const progress = Math.round((this.currentStep / 7) * 100);
        
        return `
            <div style="max-width: 1000px; margin: 0 auto;">
                <!-- Header z progressem -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; color: #000;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div style="flex: 1;">
                            <h2 style="margin: 0; font-size: 1.5rem;">🕵️ Analiza: ${this.data.opposing.name}</h2>
                            <p style="margin: 5px 0 0 0; opacity: 0.9;">Krok ${this.currentStep}/7: ${currentStepData.name}</p>
                        </div>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <button onclick="window.opposingAnalysisModule.deleteAnalysis()" style="
                                padding: 10px 20px;
                                background: rgba(231, 76, 60, 0.9);
                                color: #000;
                                border: 2px solid rgba(255,255,255,0.3);
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 600;
                                font-size: 0.9rem;
                                transition: all 0.3s;
                            " onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='rgba(231, 76, 60, 0.9)'">
                                🗑️ Usuń
                            </button>
                            <div style="text-align: right;">
                                <div style="font-size: 2rem; font-weight: 700;">${progress}%</div>
                                <div style="font-size: 0.85rem; opacity: 0.9;">ukończone</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Progress bar -->
                    <div style="background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden;">
                        <div style="background: white; height: 100%; width: ${progress}%; transition: width 0.5s;"></div>
                    </div>
                    
                    <!-- Steps indicator -->
                    <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                        ${steps.map(step => `
                            <div style="text-align: center; flex: 1;">
                                <div style="
                                    width: 40px;
                                    height: 40px;
                                    margin: 0 auto 5px auto;
                                    background: ${step.num <= this.currentStep ? 'white' : 'rgba(255,255,255,0.3)'};
                                    color: ${step.num <= this.currentStep ? '#667eea' : 'white'};
                                    border-radius: 50%;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 1.2rem;
                                    font-weight: 700;
                                    transition: all 0.3s;
                                ">${step.num <= this.currentStep ? '✓' : step.num}</div>
                                <div style="font-size: 0.7rem; opacity: ${step.num <= this.currentStep ? '1' : '0.7'};">${step.icon}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Content area -->
                <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    ${this.renderStepContent(this.currentStep)}
                </div>
            </div>
        `;
    },
    
    // ==========================================
    // 5. STEP CONTENT - Treść poszczególnych kroków
    // ==========================================
    
    renderStepContent(stepNumber) {
        switch(stepNumber) {
            case 1: return this.renderStep1_Identification();
            case 2: return this.renderStep2_Financial();
            case 3: return this.renderStep3_SocialMedia();
            case 4: return this.renderStep4_History();
            case 5: return this.renderStep5_Tactics();
            case 6: return this.renderStep6_Lawyer();
            case 7: return this.renderStep7_Summary();
            default: return this.renderStep1_Identification();
        }
    },
    
    renderStep1_Identification() {
        const data = this.data.opposing || {};
        
        return `
            <div>
                <h3 style="margin: 0 0 20px 0; color: #2c3e50;">🏢 Krok 1: Podstawowa Identyfikacja</h3>
                <p style="color: #7f8c8d; margin-bottom: 30px;">Zbierz podstawowe dane o stronie przeciwnej. Jeśli to firma, sprawdzimy ją w KRS/CEIDG.</p>
                
                <div style="display: grid; gap: 20px; margin-bottom: 30px;">
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Nazwa / Imię i nazwisko *</label>
                        <input type="text" id="opposing_name" value="${data.name || ''}" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px; font-size: 1rem;" />
                    </div>
                    
                    ${data.party_type === 'company' ? `
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <div>
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">
                                    NIP 
                                    <span style="font-size: 0.8rem; color: #7f8c8d; font-weight: 400;">🔍 Auto-lookup</span>
                                </label>
                                <input type="text" id="opposing_nip" value="${data.nip || ''}" placeholder="123-456-78-90" 
                                    onblur="window.opposingAnalysisModule.autoLookup('nip', this.value)"
                                    style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                            </div>
                            <div>
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">
                                    REGON
                                    <span style="font-size: 0.8rem; color: #7f8c8d; font-weight: 400;">🔍 Auto-lookup</span>
                                </label>
                                <input type="text" id="opposing_regon" value="${data.regon || ''}" placeholder="123456789"
                                    onblur="window.opposingAnalysisModule.autoLookup('regon', this.value)"
                                    style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                            </div>
                            <div>
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">
                                    KRS
                                    <span style="font-size: 0.8rem; color: #7f8c8d; font-weight: 400;">🔍 Auto-lookup</span>
                                </label>
                                <input type="text" id="opposing_krs" value="${data.krs || ''}" placeholder="0000123456"
                                    onblur="window.opposingAnalysisModule.autoLookup('krs', this.value)"
                                    style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                            </div>
                        </div>
                        <div id="lookup_status" style="margin-top: 10px; padding: 10px; border-radius: 8px; display: none;"></div>
                    ` : ''}
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Adres</label>
                        <input type="text" id="opposing_address" value="${data.address || ''}" placeholder="ul. Przykładowa 123, 00-001 Warszawa" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Telefon</label>
                            <input type="text" id="opposing_phone" value="${data.phone || ''}" placeholder="+48 123 456 789" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Email</label>
                            <input type="email" id="opposing_email" value="${data.email || ''}" placeholder="kontakt@firma.pl" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                        </div>
                    </div>
                </div>
                
                ${data.party_type === 'company' ? `
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; color: #000;">
                        <h4 style="margin: 0 0 20px 0; font-size: 1.4rem;">🔍 WYSZUKIWARKI API - WERYFIKACJA FIRMY</h4>
                        <p style="margin-bottom: 20px; opacity: 0.95;">Użyj wyszukiwarek API aby automatycznie pobrać pełne dane firmy i wypełnić formularz</p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <!-- KRS Search -->
                            <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 8px;">
                                <h5 style="margin: 0 0 15px 0; font-size: 1.1rem;">🏢 Wyszukaj w KRS</h5>
                                <input type="text" id="krs_number_input" placeholder="Numer KRS (10 cyfr)" maxlength="10" style="width: 100%; padding: 12px; border: none; border-radius: 6px; margin-bottom: 10px; color: #333 !important; background: white !important;">
                                <button onclick="window.opposingAnalysisModule.searchKRS()" style="width: 100%; padding: 12px; background: white; color: #764ba2; border: none; border-radius: 6px; font-weight: 700; cursor: pointer;">
                                    🔍 Szukaj
                                </button>
                                <div id="krs_results" style="margin-top: 15px;"></div>
                            </div>
                            
                            <!-- CEIDG Search -->
                            <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 8px;">
                                <h5 style="margin: 0 0 15px 0; font-size: 1.1rem;">👤 Wyszukaj w CEIDG</h5>
                                <input type="text" id="ceidg_nip_input" placeholder="NIP (10 cyfr)" maxlength="10" style="width: 100%; padding: 12px; border: none; border-radius: 6px; margin-bottom: 10px; color: #333 !important; background: white !important;">
                                <button onclick="window.opposingAnalysisModule.searchCEIDG()" style="width: 100%; padding: 12px; background: white; color: #764ba2; border: none; border-radius: 6px; font-weight: 700; cursor: pointer;">
                                    🔍 Szukaj
                                </button>
                                <div id="ceidg_results" style="margin-top: 15px;"></div>
                            </div>
                        </div>
                    </div>
                ` : ''}
                
                <!-- Navigation -->
                <div style="display: flex; justify-content: flex-end; gap: 15px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
                    <button onclick="window.opposingAnalysisModule.saveAndNext()" style="
                        padding: 15px 40px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: #000;
                        border: none;
                        border-radius: 8px;
                        font-weight: 700;
                        font-size: 1.1rem;
                        cursor: pointer;
                        transition: all 0.3s;
                    " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
                        Dalej → Finanse
                    </button>
                </div>
            </div>
        `;
    },
    
    // Pozostałe kroki - będą w part 2...
    
    // ==========================================
    // 6. SAVE AND NAVIGATE
    // ==========================================
    
    async saveAndNext() {
        console.log('📤 Zapisuję i przechodzę do następnego kroku...');
        await this.saveCurrentStep();
        
        if (this.currentStep < 7) {
            this.currentStep++;
            console.log('✅ Przechodzę do kroku:', this.currentStep);
        }
        
        // Odśwież widok
        await this.refreshView();
    },
    
    async previousStep() {
        console.log('📤 Wracam do poprzedniego kroku...');
        await this.saveCurrentStep();
        
        if (this.currentStep > 1) {
            this.currentStep--;
            console.log('✅ Wracam do kroku:', this.currentStep);
        }
        
        // Odśwież widok
        await this.refreshView();
    },
    
    async refreshView() {
        console.log('🔄 refreshView() - START');
        const container = document.getElementById('caseTabContent');
        console.log('📦 Container:', container ? 'ZNALEZIONY' : 'NIE ZNALEZIONO');
        
        if (container) {
            console.log('🎨 Renderuję nowy widok dla kroku:', this.currentStep);
            
            // NIE POBIERAJ danych z API - użyj już załadowanych!
            // Tylko wygeneruj HTML dla aktualnego widoku
            let newContent;
            if (this.data && this.data.exists) {
                newContent = this.renderWorkflow();
            } else {
                newContent = this.renderStartScreen();
            }
            
            console.log('📝 HTML wygenerowany, długość:', newContent?.length || 0);
            
            container.innerHTML = newContent;
            console.log('✅ innerHTML ustawiony');
            
            // Jeśli jesteśmy na kroku 2, załaduj zadłużenia i odpowiedzi zewnętrzne
            if (this.currentStep === 2 && this.data && this.data.exists) {
                console.log('💳 Ładuję zadłużenia i odpowiedzi dla kroku 2...');
                setTimeout(() => {
                    this.loadDebts();
                    this.loadExternalResponses();
                }, 100);
            }
            
            // Jeśli jesteśmy na kroku 4, załaduj sprawy sądowe
            if (this.currentStep === 4 && this.data && this.data.exists) {
                console.log('⚖️ Ładuję sprawy sądowe dla kroku 4...');
                setTimeout(() => {
                    this.loadCourtCases();
                }, 100);
            }
            
            // Jeśli jesteśmy na kroku 7, załaduj dowody
            if (this.currentStep === 7 && this.data && this.data.exists) {
                console.log('📁 Ładuję dowody dla kroku 7...');
                setTimeout(() => {
                    this.loadEvidence();
                }, 100);
            }
            
            // Scroll do góry
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            console.error('❌ Nie znaleziono kontenera caseTabContent');
        }
    },
    
    attachEventListeners() {
        console.log('🔌 Podłączam event listenery...');
        
        // Znajdź wszystkie przyciski i dodaj listeners
        const btnNext = document.querySelector('[data-action="next"]');
        const btnPrev = document.querySelector('[data-action="prev"]');
        const btnFinish = document.querySelector('[data-action="finish"]');
        
        if (btnNext) {
            console.log('✅ Znaleziono przycisk Dalej');
            btnNext.onclick = () => {
                console.log('🖱️ KLIK: Dalej');
                this.saveAndNext();
            };
        }
        
        if (btnPrev) {
            console.log('✅ Znaleziono przycisk Wstecz');
            btnPrev.onclick = () => {
                console.log('🖱️ KLIK: Wstecz');
                this.previousStep();
            };
        }
        
        if (btnFinish) {
            console.log('✅ Znaleziono przycisk Zakończ');
            btnFinish.onclick = () => {
                console.log('🖱️ KLIK: Zakończ');
                this.finishAnalysis();
            };
        }
    },
    
    async saveCurrentStep() {
        if (!this.currentOpposingId) {
            console.log('⚠️ Brak ID analizy do zapisania');
            return;
        }
        
        // Zbierz dane z formularza - WSZYSTKIE KROKI
        const formData = {
            // Krok 1: Podstawowa identyfikacja
            name: document.getElementById('opposing_name')?.value,
            nip: document.getElementById('opposing_nip')?.value,
            regon: document.getElementById('opposing_regon')?.value,
            krs: document.getElementById('opposing_krs')?.value,
            address: document.getElementById('opposing_address')?.value,
            phone: document.getElementById('opposing_phone')?.value,
            email: document.getElementById('opposing_email')?.value,
            notes: document.getElementById('opposing_notes')?.value,
            
            // Krok 2: Flash check finansowy
            financial_capital: document.getElementById('financial_capital')?.value,
            financial_status: document.getElementById('financial_status')?.value,
            financial_debt: document.getElementById('financial_debt')?.checked,
            financial_krd: document.getElementById('financial_krd')?.checked,
            financial_notes: document.getElementById('financial_notes')?.value,
            
            // Krok 3: Social media
            social_profiles: document.getElementById('social_profiles')?.value,
            social_reputation: document.getElementById('social_reputation')?.value,
            social_notes: document.getElementById('social_notes')?.value,
            
            // Krok 4: Historia sądowa
            history_cases_count: document.getElementById('history_cases_count')?.value,
            history_outcome: document.getElementById('history_outcome')?.value,
            history_notes: document.getElementById('history_notes')?.value,
            
            // Krok 5: Taktyki
            tactics_style: document.getElementById('tactics_style')?.value,
            tactic_delays: document.getElementById('tactic_delays')?.checked,
            tactic_motions: document.getElementById('tactic_motions')?.checked,
            tactic_settlement: document.getElementById('tactic_settlement')?.checked,
            tactic_witnesses: document.getElementById('tactic_witnesses')?.checked,
            tactic_evidence: document.getElementById('tactic_evidence')?.checked,
            tactics_notes: document.getElementById('tactics_notes')?.value,
            
            // Krok 6: Pełnomocnik
            lawyer_name: document.getElementById('lawyer_name')?.value,
            lawyer_firm: document.getElementById('lawyer_firm')?.value,
            lawyer_phone: document.getElementById('lawyer_phone')?.value,
            lawyer_email: document.getElementById('lawyer_email')?.value,
            lawyer_experience: document.getElementById('lawyer_experience')?.value,
            lawyer_aggressiveness: document.getElementById('lawyer_aggressiveness')?.value,
            lawyer_notes: document.getElementById('lawyer_notes')?.value,
            
            // Krok 7: Podsumowanie
            summary_notes: document.getElementById('summary_notes')?.value,
            
            // Workflow
            workflow_step: this.currentStep
        };
        
        // Usuń puste wartości
        Object.keys(formData).forEach(key => {
            if (formData[key] === '' || formData[key] === null || formData[key] === undefined) {
                delete formData[key];
            }
        });
        
        // Jeśli nie ma żadnych danych do zapisania, pomiń
        if (Object.keys(formData).length === 1 && formData.workflow_step) {
            console.log('ℹ️ Brak zmian do zapisania');
            return;
        }
        
        try {
            console.log('💾 Zapisuję krok', this.currentStep, formData);
            
            await window.api.request(`/opposing-analysis/${this.currentOpposingId}`, {
                method: 'PUT',
                body: formData
            });
            
            console.log('✅ Krok', this.currentStep, 'zapisany');
        } catch (error) {
            console.error('❌ Błąd zapisu kroku:', error);
            window.showNotification('❌ Błąd zapisu danych', 'error');
        }
    },
    
    // ==========================================
    // 7. AUTO-LOOKUP NIP/KRS/REGON
    // ==========================================
    
    async autoLookup(type, value) {
        if (!value || value.trim() === '') return;
        
        // Usuń znaki specjalne (myślniki, spacje)
        const cleanValue = value.replace(/[-\s]/g, '');
        
        // Walidacja długości
        const minLength = {
            'nip': 10,
            'krs': 10,
            'regon': 9
        };
        
        if (cleanValue.length < minLength[type]) {
            return; // Za krótki numer - nie odpytuj
        }
        
        const statusDiv = document.getElementById('lookup_status');
        if (statusDiv) {
            statusDiv.style.display = 'block';
            statusDiv.style.background = '#e3f2fd';
            statusDiv.style.color = '#1976d2';
            statusDiv.innerHTML = '🔍 Pobieranie danych...';
        }
        
        try {
            const response = await window.api.request(`/opposing-analysis/lookup/${type}/${cleanValue}`);
            
            if (response.success && response.data) {
                // Wypełnij pola automatycznie
                this.fillFormData(response.data);
                
                if (statusDiv) {
                    statusDiv.style.background = '#e8f5e9';
                    statusDiv.style.color = '#2e7d32';
                    statusDiv.innerHTML = '✅ Dane uzupełnione automatycznie!';
                    setTimeout(() => {
                        statusDiv.style.display = 'none';
                    }, 3000);
                }
                
                window.showNotification('✅ Dane firmy pobrane automatycznie!', 'success');
            } else {
                if (statusDiv) {
                    statusDiv.style.background = '#fff3e0';
                    statusDiv.style.color = '#e65100';
                    statusDiv.innerHTML = '⚠️ Nie znaleziono danych - wypełnij ręcznie';
                    setTimeout(() => {
                        statusDiv.style.display = 'none';
                    }, 3000);
                }
            }
            
        } catch (error) {
            console.error('❌ Błąd auto-lookup:', error);
            if (statusDiv) {
                statusDiv.style.background = '#ffebee';
                statusDiv.style.color = '#c62828';
                statusDiv.innerHTML = '❌ Błąd pobierania danych';
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 3000);
            }
        }
    },
    
    fillFormData(data) {
        // Wypełnij wszystkie pola danymi z API
        if (data.name) document.getElementById('opposing_name').value = data.name;
        if (data.nip) document.getElementById('opposing_nip').value = data.nip;
        if (data.regon) document.getElementById('opposing_regon').value = data.regon;
        if (data.krs) document.getElementById('opposing_krs').value = data.krs;
        if (data.address) document.getElementById('opposing_address').value = data.address;
        if (data.phone) document.getElementById('opposing_phone').value = data.phone;
        if (data.email) document.getElementById('opposing_email').value = data.email;
        
        // Animacja wypełniania (flash effect)
        const fields = ['opposing_name', 'opposing_nip', 'opposing_regon', 'opposing_krs', 'opposing_address', 'opposing_phone', 'opposing_email'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && field.value) {
                field.style.background = '#e8f5e9';
                field.style.transition = 'background 0.5s';
                setTimeout(() => {
                    field.style.background = 'white';
                }, 1000);
            }
        });
    },
    
    // ==========================================
    // 8. SMART SEARCH FUNCTIONS
    // ==========================================
    
    searchInKRS() {
        const name = document.getElementById('opposing_name')?.value;
        if (!name) {
            alert('Wprowadź najpierw nazwę firmy!');
            return;
        }
        
        // Oficjalna wyszukiwarka KRS MS
        // Format URL: https://wyszukiwarka-krs.ms.gov.pl/?q=nazwa
        const searchUrl = `https://wyszukiwarka-krs.ms.gov.pl/?q=${encodeURIComponent(name)}`;
        window.open(searchUrl, '_blank');
        
        window.showNotification('🏛️ Otwarto wyszukiwarkę KRS - sprawdź dane i wróć!', 'info');
    },
    
    searchInCEIDG() {
        const name = document.getElementById('opposing_name')?.value;
        if (!name) {
            alert('Wprowadź najpierw nazwę firmy!');
            return;
        }
        
        // CEIDG - Centralna Ewidencja i Informacja o Działalności Gospodarczej
        const searchUrl = `https://prod.ceidg.gov.pl/CEIDG/ceidg.public.ui/Search.aspx?Name=${encodeURIComponent(name)}`;
        window.open(searchUrl, '_blank');
        
        window.showNotification('📋 Otwarto CEIDG - sprawdź działalność gospodarczą!', 'info');
    },
    
    searchInGoogle() {
        const name = document.getElementById('opposing_name')?.value;
        if (!name) {
            alert('Wprowadź najpierw nazwę firmy!');
            return;
        }
        
        // Google search z dodatkowymi keywords
        const searchQuery = `${name} site:biznes.gov.pl OR site:krs.gov.pl OR opinie`;
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
        window.open(searchUrl, '_blank');
        
        window.showNotification('🌐 Otwarto Google - sprawdź opinie i informacje!', 'info');
    },
    
    // Inne metody pomocnicze...
    renderStep2_Financial() {
        const data = this.data.opposing || {};
        
        return `
            <div style="background: white; border-radius: 12px; padding: 30px;">
                <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 1.5rem;">
                    💰 Krok 2: Flash Check Finansowy
                </h3>
                <p style="color: #7f8c8d; margin-bottom: 30px;">
                    Szybka ocena sytuacji finansowej przeciwnika - kapitał, zadłużenie, ryzyko.
                </p>
                
                ${data.party_type === 'company' ? `
                    <div style="display: grid; gap: 25px;">
                        <!-- Kapitał Zakładowy -->
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #3498db;">
                            <h4 style="margin: 0 0 15px 0; color: #2c3e50;">💼 Kapitał Zakładowy</h4>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                <div>
                                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Wartość (PLN)</label>
                                    <input type="number" id="financial_capital" value="${data.financial_capital || ''}" 
                                        placeholder="np. 100000" 
                                        style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                                </div>
                                <div>
                                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Status</label>
                                    <select id="financial_status" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;">
                                        <option value="">Wybierz...</option>
                                        <option value="stable" ${data.financial_status === 'stable' ? 'selected' : ''}>💚 Stabilna</option>
                                        <option value="moderate" ${data.financial_status === 'moderate' ? 'selected' : ''}>🟡 Umiarkowana</option>
                                        <option value="risk" ${data.financial_status === 'risk' ? 'selected' : ''}>🔴 Ryzykowna</option>
                                        <option value="unknown" ${data.financial_status === 'unknown' ? 'selected' : ''}>❓ Nieznana</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Zadłużenie -->
                        <div style="background: #fff3e0; padding: 20px; border-radius: 10px; border-left: 4px solid #ff9800;">
                            <h4 style="margin: 0 0 15px 0; color: #2c3e50;">⚠️ Zadłużenie i Ryzyka</h4>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">
                                    <input type="checkbox" id="financial_debt" ${data.financial_debt ? 'checked' : ''} style="margin-right: 8px;" />
                                    Posiada zadłużenie / egzekucje
                                </label>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">
                                    <input type="checkbox" id="financial_krd" ${data.financial_krd ? 'checked' : ''} style="margin-right: 8px;" />
                                    Wpisany do KRD / BIG InfoMonitor
                                </label>
                            </div>
                            <div>
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Notatki</label>
                                <textarea id="financial_notes" placeholder="Szczegóły zadłużenia, źródła informacji..." 
                                    style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px; min-height: 80px; resize: vertical; font-family: inherit;">${data.financial_notes || ''}</textarea>
                            </div>
                        </div>
                        
                        <!-- Smart Buttons - Zadłużenie -->
                        <div style="background: #e3f2fd; padding: 20px; border-radius: 10px;">
                            <h4 style="margin: 0 0 15px 0; color: #1976d2;">🔍 Sprawdź zadłużenie:</h4>
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                <button onclick="window.open('https://panel.krd.pl/authentication/login?returnurl=%2fclient2.0%2f#_ga=2.66379182.1414453411.1631708766-1391755914.1581948976', '_blank')" 
                                    style="padding: 10px 20px; background: white; border: 2px solid #1976d2; color: #1976d2; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                    📊 KRD - Krajowy Rejestr Długów
                                </button>
                                <button onclick="window.open('https://www.big.pl/dla-wierzycieli/bazy-danych/', '_blank')" 
                                    style="padding: 10px 20px; background: white; border: 2px solid #1976d2; color: #1976d2; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                    📈 BIG InfoMonitor
                                </button>
                                <button onclick="window.open('https://www.krz.ms.gov.pl/', '_blank')" 
                                    style="padding: 10px 20px; background: white; border: 2px solid #e53935; color: #c62828; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                    📋 KRZ - Krajowy Rejestr Zadłużonych
                                </button>
                            </div>
                            <p style="margin: 15px 0 0 0; font-size: 0.9rem; color: #1976d2;">
                                💡 Sprawdź czy firma/osoba ma zadłużenie w rejestrach (KRD, BIG, KRZ)
                            </p>
                        </div>
                        
                        <!-- Smart Buttons - Ubezpieczenia i Pojazdy -->
                        <div style="background: #e8f5e9; padding: 20px; border-radius: 10px;">
                            <h4 style="margin: 0 0 15px 0; color: #2e7d32;">🚗 Sprawdź ubezpieczenia i pojazdy:</h4>
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                <button onclick="window.open('https://info.ufg.pl/infoportal/zaswiadczenia', '_blank')" 
                                    style="padding: 10px 20px; background: white; border: 2px solid #2e7d32; color: #2e7d32; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                    🚙 UFG - Zaświadczenia
                                </button>
                                <button onclick="window.open('https://historiapojazdu.gov.pl/', '_blank')" 
                                    style="padding: 10px 20px; background: white; border: 2px solid #2e7d32; color: #2e7d32; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                    🚗 CEPiK - Historia Pojazdu
                                </button>
                            </div>
                            <p style="margin: 15px 0 0 0; font-size: 0.9rem; color: #2e7d32;">
                                💡 Sprawdź polisy OC/AC i historię pojazdów (wymagany nr rejestracyjny lub VIN)
                            </p>
                        </div>
                        
                        <!-- NOWA SEKCJA: Lista zadłużeń -->
                        <div style="background: #ffebee; padding: 20px; border-radius: 10px; border-left: 4px solid #e74c3c;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h4 style="margin: 0; color: #c62828;">💳 Zarejestrowane zadłużenia</h4>
                                <button onclick="window.opposingAnalysisModule.addDebt()" 
                                    style="padding: 8px 16px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                                    ➕ Dodaj zadłużenie
                                </button>
                            </div>
                            <div id="debts_list_container">
                                <!-- Lista zadłużeń będzie tutaj -->
                            </div>
                        </div>
                        
                        <!-- NOWA SEKCJA: Odpowiedzi z systemów zewnętrznych -->
                        <div style="background: #f3e5f5; padding: 20px; border-radius: 10px; border-left: 4px solid #9c27b0;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h4 style="margin: 0; color: #6a1b9a;">📋 Odpowiedzi z systemów zewnętrznych</h4>
                                <button onclick="window.opposingAnalysisModule.addExternalResponse()" 
                                    style="padding: 8px 16px; background: linear-gradient(135deg, #9c27b0, #7b1fa2); color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                                    ➕ Dodaj odpowiedź
                                </button>
                            </div>
                            <div id="external_responses_container">
                                <!-- Lista odpowiedzi będzie tutaj -->
                            </div>
                        </div>
                    </div>
                ` : `
                    <div style="background: #fff3e0; padding: 30px; border-radius: 10px; text-align: center;">
                        <p style="color: #f57c00; margin: 0; font-size: 1.1rem;">
                            ℹ️ Flash check finansowy dostępny tylko dla firm
                        </p>
                    </div>
                `}
                
                <!-- Navigation -->
                <div style="display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
                    <button onclick="window.opposingAnalysisModule.previousStep()" style="
                        padding: 15px 40px;
                        background: #ecf0f1;
                        color: #2c3e50;
                        border: none;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                    ">← Wstecz</button>
                    <button onclick="window.opposingAnalysisModule.saveAndNext()" style="
                        padding: 15px 40px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: #000;
                        border: none;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(118, 75, 162, 0.4);
                    ">Dalej →</button>
                </div>
            </div>
        `;
    },
    renderStep3_SocialMedia() {
        const data = this.data.opposing || {};
        
        return `
            <div style="background: white; border-radius: 12px; padding: 30px;">
                <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 1.5rem;">
                    📱 Krok 3: Social Media Scan
                </h3>
                <p style="color: #7f8c8d; margin-bottom: 30px;">
                    Przeszukaj media społecznościowe i internet w poszukiwaniu informacji, opinii i wzmianek.
                </p>
                
                <!-- Social OSINT Button -->
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 15px 0; color: #000;">🚀 Social Media OSINT</h4>
                    <button onclick="window.opposingAnalysisModule.searchSocialMediaApify('${data.name || ''}')" 
                        style="width: 100%; padding: 15px; background: white; color: #667eea; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1.1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: all 0.3s;"
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)'">
                        🔍 Przeszukaj naszą bazę
                    </button>
                    <p style="margin: 10px 0 0 0; font-size: 0.85rem; color: #000; opacity: 0.9;">
                        💡 Automatycznie znajdziemy: red flags, skargi, potencjalnych świadków, sentiment
                    </p>
                </div>
                
                <!-- Smart Search Buttons -->
                <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    <h4 style="margin: 0 0 15px 0; color: #1976d2;">🔍 Wyszukaj w mediach społecznościowych:</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                        <button onclick="window.open('https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(data.name || '')}', '_blank')" 
                            style="padding: 12px; background: #0077b5; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            💼 LinkedIn
                        </button>
                        <button onclick="window.open('https://www.facebook.com/search/top?q=${encodeURIComponent(data.name || '')}', '_blank')" 
                            style="padding: 12px; background: #1877f2; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            👥 Facebook
                        </button>
                        <button onclick="window.open('https://twitter.com/search?q=${encodeURIComponent(data.name || '')}', '_blank')" 
                            style="padding: 12px; background: #1da1f2; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            🐦 Twitter/X
                        </button>
                        <button onclick="window.open('https://www.google.com/search?q=${encodeURIComponent((data.name || '') + ' opinie recenzje')}', '_blank')" 
                            style="padding: 12px; background: #34a853; color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            🔎 Google
                        </button>
                    </div>
                </div>
                
                <!-- Findings -->
                <div style="display: grid; gap: 20px;">
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Profile społecznościowe (linki)</label>
                        <textarea id="social_profiles" placeholder="https://linkedin.com/in/..., https://facebook.com/..." 
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px; min-height: 80px; resize: vertical; font-family: inherit;">${data.social_profiles || ''}</textarea>
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Reputacja online</label>
                        <select id="social_reputation" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;">
                            <option value="">Wybierz...</option>
                            <option value="positive" ${data.social_reputation === 'positive' ? 'selected' : ''}>😊 Pozytywna</option>
                            <option value="neutral" ${data.social_reputation === 'neutral' ? 'selected' : ''}>😐 Neutralna</option>
                            <option value="negative" ${data.social_reputation === 'negative' ? 'selected' : ''}>😠 Negatywna</option>
                            <option value="mixed" ${data.social_reputation === 'mixed' ? 'selected' : ''}>🤔 Mieszana</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Notatki i znaleziska</label>
                        <textarea id="social_notes" placeholder="Opinie, recenzje, wzmianki, kontrowersje..." 
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px; min-height: 120px; resize: vertical; font-family: inherit;">${data.social_notes || ''}</textarea>
                    </div>
                </div>
                
                <!-- Navigation -->
                <div style="display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
                    <button onclick="window.opposingAnalysisModule.previousStep()" style="
                        padding: 15px 40px;
                        background: #ecf0f1;
                        color: #2c3e50;
                        border: none;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                    ">← Wstecz</button>
                    <button onclick="window.opposingAnalysisModule.saveAndNext()" style="
                        padding: 15px 40px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: #000;
                        border: none;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(118, 75, 162, 0.4);
                    ">Dalej →</button>
                </div>
            </div>
        `;
    },
    renderStep4_History() {
        const data = this.data.opposing || {};
        
        return `
            <div style="background: white; border-radius: 12px; padding: 30px;">
                <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 1.5rem;">
                    ⚖️ Krok 4: Historia Sądowa
                </h3>
                <p style="color: #7f8c8d; margin-bottom: 30px;">
                    Przeszukaj historię postępowań sądowych i prawnych przeciwnika.
                </p>
                
                <!-- Search Tools -->
                <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    <h4 style="margin: 0 0 15px 0; color: #1976d2;">🔍 Sprawdź w rejestrach sądowych:</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
                        <button onclick="window.open('https://orzeczenia.ms.gov.pl/', '_blank')" 
                            style="padding: 12px; background: white; border: 2px solid #1976d2; color: #1976d2; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            ⚖️ Orzeczenia Sądów Powszechnych
                        </button>
                        <button onclick="window.open('https://www.saos.org.pl/', '_blank')" 
                            style="padding: 12px; background: white; border: 2px solid #1976d2; color: #1976d2; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            📚 SAOS - Otwarte Orzecznictwo
                        </button>
                    </div>
                    <p style="margin: 15px 0 0 0; font-size: 0.9rem; color: #1976d2;">
                        💡 Wyszukaj po nazwie firmy/osoby aby znaleźć poprzednie sprawy
                    </p>
                </div>
                
                <!-- Case History -->
                <div style="display: grid; gap: 20px;">
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Liczba wcześniejszych spraw</label>
                        <input type="number" id="history_cases_count" value="${data.history_cases_count || ''}" 
                            placeholder="np. 5" min="0"
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Wynik spraw</label>
                        <select id="history_outcome" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;">
                            <option value="">Wybierz...</option>
                            <option value="mostly_won" ${data.history_outcome === 'mostly_won' ? 'selected' : ''}>✅ Przeważnie wygrane</option>
                            <option value="mixed" ${data.history_outcome === 'mixed' ? 'selected' : ''}>⚖️ Mieszane</option>
                            <option value="mostly_lost" ${data.history_outcome === 'mostly_lost' ? 'selected' : ''}>❌ Przeważnie przegrane</option>
                            <option value="unknown" ${data.history_outcome === 'unknown' ? 'selected' : ''}>❓ Nieznane</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Szczegóły spraw i wyroków</label>
                        <textarea id="history_notes" placeholder="Sygnatura akt, data, przedmiot, wynik..." 
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px; min-height: 150px; resize: vertical; font-family: inherit;">${data.history_notes || ''}</textarea>
                    </div>
                </div>
                
                <!-- NOWA SEKCJA: Lista spraw sądowych -->
                <div style="background: #fff9e6; padding: 20px; border-radius: 10px; margin-top: 25px; border-left: 4px solid #ff9800;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h4 style="margin: 0; color: #e65100;">⚖️ Zarejestrowane sprawy sądowe</h4>
                        <button onclick="window.opposingAnalysisModule.addCourtCase()" 
                            style="padding: 8px 16px; background: linear-gradient(135deg, #ff9800, #f57c00); color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                            ➕ Dodaj sprawę
                        </button>
                    </div>
                    <div id="court_cases_container">
                        <!-- Lista spraw będzie tutaj -->
                    </div>
                </div>
                
                <!-- Navigation -->
                <div style="display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
                    <button onclick="window.opposingAnalysisModule.previousStep()" style="
                        padding: 15px 40px;
                        background: #ecf0f1;
                        color: #2c3e50;
                        border: none;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                    ">← Wstecz</button>
                    <button onclick="window.opposingAnalysisModule.saveAndNext()" style="
                        padding: 15px 40px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: #000;
                        border: none;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(118, 75, 162, 0.4);
                    ">Dalej →</button>
                </div>
            </div>
        `;
    },
    renderStep5_Tactics() {
        const data = this.data.opposing || {};
        
        return `
            <div style="background: white; border-radius: 12px; padding: 30px;">
                <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 1.5rem;">
                    🎯 Krok 5: Taktyki Procesowe
                </h3>
                <p style="color: #7f8c8d; margin-bottom: 30px;">
                    Zapisz znane taktyki, zachowania i strategie przeciwnika w sądzie.
                </p>
                
                <div style="display: grid; gap: 25px;">
                    <!-- Litigation Style -->
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <h4 style="margin: 0 0 15px 0; color: #2c3e50;">⚡ Styl procesowy</h4>
                        <select id="tactics_style" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;">
                            <option value="">Wybierz...</option>
                            <option value="aggressive" ${data.tactics_style === 'aggressive' ? 'selected' : ''}>🔴 Agresywny</option>
                            <option value="defensive" ${data.tactics_style === 'defensive' ? 'selected' : ''}>🛡️ Defensywny</option>
                            <option value="cooperative" ${data.tactics_style === 'cooperative' ? 'selected' : ''}>🤝 Kooperatywny</option>
                            <option value="delaying" ${data.tactics_style === 'delaying' ? 'selected' : ''}>⏰ Przewlekający</option>
                            <option value="manipulative" ${data.tactics_style === 'manipulative' ? 'selected' : ''}>🎭 Manipulacyjny</option>
                        </select>
                    </div>
                    
                    <!-- Common Tactics -->
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 12px; color: #2c3e50;">🎲 Znane taktyki (zaznacz wszystkie):</label>
                        <div style="display: grid; gap: 10px;">
                            <label style="display: block;"><input type="checkbox" id="tactic_delays" ${data.tactic_delays ? 'checked' : ''} style="margin-right: 8px;" />Opóźnianie postępowania</label>
                            <label style="display: block;"><input type="checkbox" id="tactic_motions" ${data.tactic_motions ? 'checked' : ''} style="margin-right: 8px;" />Liczne wnioski formalne</label>
                            <label style="display: block;"><input type="checkbox" id="tactic_settlement" ${data.tactic_settlement ? 'checked' : ''} style="margin-right: 8px;" />Unikanie ugody</label>
                            <label style="display: block;"><input type="checkbox" id="tactic_witnesses" ${data.tactic_witnesses ? 'checked' : ''} style="margin-right: 8px;" />Agresywne przesłuchania</label>
                            <label style="display: block;"><input type="checkbox" id="tactic_evidence" ${data.tactic_evidence ? 'checked' : ''} style="margin-right: 8px;" />Kwestionowanie dowodów</label>
                        </div>
                    </div>
                    
                    <!-- Notes -->
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">📝 Szczegółowe notatki o taktykach</label>
                        <textarea id="tactics_notes" placeholder="Opisz konkretne zachowania, wypowiedzi, strategie..." 
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px; min-height: 150px; resize: vertical; font-family: inherit;">${data.tactics_notes || ''}</textarea>
                    </div>
                </div>
                
                <!-- Navigation -->
                <div style="display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
                    <button onclick="window.opposingAnalysisModule.previousStep()" style="
                        padding: 15px 40px;
                        background: #ecf0f1;
                        color: #2c3e50;
                        border: none;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                    ">← Wstecz</button>
                    <button onclick="window.opposingAnalysisModule.saveAndNext()" style="
                        padding: 15px 40px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: #000;
                        border: none;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(118, 75, 162, 0.4);
                    ">Dalej →</button>
                </div>
            </div>
        `;
    },
    renderStep6_Lawyer() {
        const data = this.data.opposing || {};
        
        return `
            <div style="background: white; border-radius: 12px; padding: 30px;">
                <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 1.5rem;">
                    👨‍⚖️ Krok 6: Pełnomocnik Prawny
                </h3>
                <p style="color: #7f8c8d; margin-bottom: 30px;">
                    Informacje o pełnomocniku procesowym przeciwnika - kancelaria, styl pracy, historia.
                </p>
                
                <div style="display: grid; gap: 20px;">
                    <!-- Lawyer Info -->
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Imię i nazwisko pełnomocnika</label>
                        <input type="text" id="lawyer_name" value="${data.lawyer_name || ''}" 
                            placeholder="Adw. Jan Kowalski"
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Kancelaria</label>
                        <input type="text" id="lawyer_firm" value="${data.lawyer_firm || ''}" 
                            placeholder="Kancelaria Prawna ABC"
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Telefon</label>
                            <input type="text" id="lawyer_phone" value="${data.lawyer_phone || ''}" 
                                placeholder="+48 123 456 789"
                                style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Email</label>
                            <input type="email" id="lawyer_email" value="${data.lawyer_email || ''}" 
                                placeholder="adwokat@kancelaria.pl"
                                style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                        </div>
                    </div>
                    
                    <!-- Experience & Style -->
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                        <h4 style="margin: 0 0 15px 0; color: #2c3e50;">🎯 Ocena pełnomocnika</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                            <div>
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Doświadczenie</label>
                                <select id="lawyer_experience" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;">
                                    <option value="">Wybierz...</option>
                                    <option value="junior" ${data.lawyer_experience === 'junior' ? 'selected' : ''}>🌱 Początkujący</option>
                                    <option value="mid" ${data.lawyer_experience === 'mid' ? 'selected' : ''}>🌳 Średni</option>
                                    <option value="senior" ${data.lawyer_experience === 'senior' ? 'selected' : ''}>🌲 Doświadczony</option>
                                    <option value="expert" ${data.lawyer_experience === 'expert' ? 'selected' : ''}>🏆 Ekspert</option>
                                </select>
                            </div>
                            <div>
                                <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Agresywność</label>
                                <select id="lawyer_aggressiveness" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;">
                                    <option value="">Wybierz...</option>
                                    <option value="low" ${data.lawyer_aggressiveness === 'low' ? 'selected' : ''}>💙 Niska</option>
                                    <option value="medium" ${data.lawyer_aggressiveness === 'medium' ? 'selected' : ''}>💛 Średnia</option>
                                    <option value="high" ${data.lawyer_aggressiveness === 'high' ? 'selected' : ''}>🔴 Wysoka</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Notes -->
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">📝 Notatki o pełnomocniku</label>
                        <textarea id="lawyer_notes" placeholder="Historia współpracy, znane sprawy, specjalizacja, styl pracy..." 
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px; min-height: 120px; resize: vertical; font-family: inherit;">${data.lawyer_notes || ''}</textarea>
                    </div>
                </div>
                
                <!-- Navigation -->
                <div style="display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
                    <button onclick="window.opposingAnalysisModule.previousStep()" style="
                        padding: 15px 40px;
                        background: #ecf0f1;
                        color: #2c3e50;
                        border: none;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                    ">← Wstecz</button>
                    <button onclick="window.opposingAnalysisModule.saveAndNext()" style="
                        padding: 15px 40px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: #000;
                        border: none;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(118, 75, 162, 0.4);
                    ">Dalej →</button>
                </div>
            </div>
        `;
    },
    renderStep7_Summary() {
        const data = this.data.opposing || {};
        
        return `
            <div style="background: white; border-radius: 12px; padding: 30px;">
                <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 1.5rem;">
                    🎉 Krok 7: Podsumowanie i AI
                </h3>
                <p style="color: #7f8c8d; margin-bottom: 30px;">
                    Przegląd zebranych informacji i analiza AI z wykryciem red flags.
                </p>
                
                <!-- Summary Cards -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 30px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #000; padding: 20px; border-radius: 10px;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">📊</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">Postęp analizy</div>
                        <div style="font-size: 2rem; font-weight: bold; margin-top: 10px;">100%</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #000; padding: 20px; border-radius: 10px;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">⚠️</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">Red Flags</div>
                        <div style="font-size: 2rem; font-weight: bold; margin-top: 10px;">-</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #000; padding: 20px; border-radius: 10px;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">📄</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">Zebrane dane</div>
                        <div style="font-size: 2rem; font-weight: bold; margin-top: 10px;">7/7</div>
                    </div>
                </div>
                
                <!-- SEKCJA DOWODÓW -->
                <div style="background: linear-gradient(135deg, #ff9a56 0%, #ff6a00 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h4 style="margin: 0; color: #000; font-size: 1.3rem;">📁 Dowody w sprawie</h4>
                        <button onclick="window.opposingAnalysisModule.showAddEvidenceModal()" style="
                            padding: 10px 20px;
                            background: white;
                            color: #ff6a00;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                        ">+ Dodaj dowód</button>
                    </div>
                    <p style="color: rgba(255,255,255,0.95); margin-bottom: 20px; font-size: 0.95rem;">
                        Poniżej znajdują się dowody zebrane w sprawie. AI wykorzysta te dowody do analizy i wygenerowania raportu.
                    </p>
                    
                    <div id="evidence_list_container" style="background: white; border-radius: 8px; padding: 20px; min-height: 100px;">
                        <div style="text-align: center; color: #999; padding: 20px;">
                            ⏳ Ładowanie dowodów...
                        </div>
                    </div>
                </div>
                
                <!-- AI Analysis Button -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                    <h4 style="margin: 0 0 15px 0; color: #000; font-size: 1.3rem;">🤖 Analiza AI</h4>
                    <p style="color: rgba(255,255,255,0.9); margin-bottom: 20px;">
                        Kliknij aby wygenerować raport AI z wykryciem ryzyk, red flags i rekomendacji.<br/>
                        <small style="opacity: 0.85;">AI przeanalizuje wszystkie zebrane dane włącznie z dowodami powyżej.</small>
                    </p>
                    <button onclick="window.opposingAnalysisModule.generateAIReport()" style="
                        padding: 15px 40px;
                        background: white;
                        color: #667eea;
                        border: none;
                        border-radius: 10px;
                        font-size: 1.1rem;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    ">✨ Wygeneruj Raport AI</button>
                </div>
                
                <!-- AI Report Placeholder -->
                <div id="ai_report_container" style="display: none; background: #f8f9fa; padding: 25px; border-radius: 10px; margin-bottom: 30px;">
                    <h4 style="margin: 0 0 20px 0; color: #2c3e50;">📊 Raport AI</h4>
                    <div id="ai_report_content" style="color: #2c3e50; line-height: 1.6;"></div>
                </div>
                
                <!-- Final Notes -->
                <div>
                    <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">📝 Końcowe notatki i rekomendacje</label>
                    <textarea id="summary_notes" placeholder="Ogólne wnioski, strategia, rekomendacje..." 
                        style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px; min-height: 150px; resize: vertical; font-family: inherit;">${data.summary_notes || ''}</textarea>
                </div>
                
                <!-- Navigation -->
                <div style="display: flex; justify-content: space-between; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
                    <button onclick="window.opposingAnalysisModule.previousStep()" style="
                        padding: 15px 40px;
                        background: #ecf0f1;
                        color: #2c3e50;
                        border: none;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                    ">← Wstecz</button>
                    <button onclick="window.opposingAnalysisModule.finishAnalysis()" style="
                        padding: 15px 40px;
                        background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
                        color: #000;
                        border: none;
                        border-radius: 10px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        box-shadow: 0 4px 15px rgba(56, 239, 125, 0.4);
                    ">✔️ Zakończ Analizę</button>
                </div>
            </div>
        `;
    },
    renderDashboard() {
        const data = this.data.opposing || {};
        
        return `
            <div style="max-width: 1200px; margin: 0 auto;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 12px 12px 0 0; color: #000;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.8rem;">✅ ${data.name}</h2>
                            <p style="margin: 5px 0 0 0; opacity: 0.9;">Analiza ukończona</p>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="window.opposingAnalysisModule.editAnalysis()" style="padding: 12px 24px; background: white; color: #11998e; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                ✏️ Edytuj
                            </button>
                            <button onclick="window.opposingAnalysisModule.deleteAnalysis()" style="padding: 12px 24px; background: rgba(231, 76, 60, 0.9); color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                🗑️ Usuń
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Content -->
                <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    
                    <!-- Podstawowe dane -->
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                        <h3 style="margin: 0 0 15px 0; color: #2c3e50;">📋 Podstawowe dane</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            ${data.nip ? `<div><strong>NIP:</strong> ${data.nip}</div>` : ''}
                            ${data.regon ? `<div><strong>REGON:</strong> ${data.regon}</div>` : ''}
                            ${data.krs ? `<div><strong>KRS:</strong> ${data.krs}</div>` : ''}
                            ${data.address ? `<div><strong>Adres:</strong> ${data.address}</div>` : ''}
                            ${data.phone ? `<div><strong>Telefon:</strong> ${data.phone}</div>` : ''}
                            ${data.email ? `<div><strong>Email:</strong> ${data.email}</div>` : ''}
                        </div>
                    </div>
                    
                    <!-- Finanse -->
                    ${data.financial_status || data.credit_rating || data.debt_info ? `
                        <div style="background: #fff3e0; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #ff9800;">
                            <h3 style="margin: 0 0 15px 0; color: #e65100;">💰 Sytuacja finansowa</h3>
                            ${data.financial_status ? `<p><strong>Status:</strong> ${data.financial_status}</p>` : ''}
                            ${data.credit_rating ? `<p><strong>Rating:</strong> ${data.credit_rating}</p>` : ''}
                            ${data.debt_info ? `<p><strong>Zadłużenia:</strong> ${data.debt_info}</p>` : ''}
                        </div>
                    ` : ''}
                    
                    <!-- Social Media -->
                    ${data.social_profiles || data.reputation_summary ? `
                        <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #2196f3;">
                            <h3 style="margin: 0 0 15px 0; color: #1565c0;">📱 Social Media</h3>
                            ${data.social_profiles ? `<p><strong>Profile:</strong> ${data.social_profiles}</p>` : ''}
                            ${data.reputation_summary ? `<p><strong>Reputacja:</strong> ${data.reputation_summary}</p>` : ''}
                        </div>
                    ` : ''}
                    
                    <!-- Historia sądowa -->
                    ${data.court_history || data.history_notes ? `
                        <div style="background: #f3e5f5; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #9c27b0;">
                            <h3 style="margin: 0 0 15px 0; color: #6a1b9a;">⚖️ Historia sądowa</h3>
                            ${data.court_history ? `<p><strong>Liczba spraw:</strong> ${data.court_history}</p>` : ''}
                            ${data.history_notes ? `<p>${data.history_notes}</p>` : ''}
                        </div>
                    ` : ''}
                    
                    <!-- Taktyki procesowe -->
                    ${data.tactics ? `
                        <div style="background: #fff9c4; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #fbc02d;">
                            <h3 style="margin: 0 0 15px 0; color: #f57f17;">🎭 Taktyki procesowe</h3>
                            <p>${data.tactics}</p>
                        </div>
                    ` : ''}
                    
                    <!-- Pełnomocnik -->
                    ${data.lawyer_name || data.lawyer_specialization ? `
                        <div style="background: #e8f5e9; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
                            <h3 style="margin: 0 0 15px 0; color: #2e7d32;">👨‍⚖️ Pełnomocnik prawny</h3>
                            ${data.lawyer_name ? `<p><strong>Imię i nazwisko:</strong> ${data.lawyer_name}</p>` : ''}
                            ${data.lawyer_specialization ? `<p><strong>Specjalizacja:</strong> ${data.lawyer_specialization}</p>` : ''}
                        </div>
                    ` : ''}
                    
                    <!-- Podsumowanie -->
                    ${data.summary ? `
                        <div style="background: #fce4ec; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #e91e63;">
                            <h3 style="margin: 0 0 15px 0; color: #c2185b;">📝 Podsumowanie</h3>
                            <p>${data.summary}</p>
                        </div>
                    ` : ''}
                    
                </div>
            </div>
        `;
    },
    
    editAnalysis() {
        // Wróć do workflow od początku
        this.currentStep = 1;
        this.refreshView();
    },
    
    // ==========================================
    // 9. AI REPORT & FINISH
    // ==========================================
    
    async generateAIReport() {
        const container = document.getElementById('ai_report_container');
        const content = document.getElementById('ai_report_content');
        
        if (!container || !content) return;
        
        container.style.display = 'block';
        content.innerHTML = '<div style="text-align: center; padding: 20px;">⏳ Generowanie raportu AI...</div>';
        
        try {
            const response = await window.api.request(`/opposing-analysis/${this.currentOpposingId}/ai-report`);
            
            if (response.report) {
                content.innerHTML = `
                    <div style="margin-bottom: 20px;">
                        <h5 style="color: #e74c3c; margin: 0 0 10px 0;">⚠️ Red Flags:</h5>
                        <ul style="margin: 0; padding-left: 20px;">
                            ${response.report.redFlags.map(flag => `<li>${flag}</li>`).join('')}
                        </ul>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h5 style="color: #27ae60; margin: 0 0 10px 0;">✅ Pozytywne aspekty:</h5>
                        <ul style="margin: 0; padding-left: 20px;">
                            ${response.report.positives.map(pos => `<li>${pos}</li>`).join('')}
                        </ul>
                    </div>
                    <div>
                        <h5 style="color: #3498db; margin: 0 0 10px 0;">💡 Rekomendacje:</h5>
                        <ul style="margin: 0; padding-left: 20px;">
                            ${response.report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                `;
                window.showNotification('✅ Raport AI wygenerowany!', 'success');
            }
        } catch (error) {
            console.error('❌ Błąd generowania raportu:', error);
            content.innerHTML = '<div style="color: #e74c3c;">❌ Błąd generowania raportu. Spróbuj ponownie.</div>';
        }
    },
    
    async finishAnalysis() {
        try {
            await this.saveCurrentStep();
            
            // Update status to completed
            await window.api.request(`/opposing-analysis/${this.currentOpposingId}`, {
                method: 'PUT',
                body: { analysis_status: 'completed', workflow_completed: true }
            });
            
            window.showNotification('🎉 Analiza zakończona pomyślnie!', 'success');
            
            // Reload to show completed state
            await this.refreshView();
            
        } catch (error) {
            console.error('❌ Błąd kończenia analizy:', error);
            window.showNotification('❌ Błąd zapisywania', 'error');
        }
    },
    
    // ==========================================
    // 10. DELETE ANALYSIS
    // ==========================================
    
    // ==========================================
    // SOCIAL MEDIA SEARCH
    // ==========================================
    
    async searchSocialMediaApify(companyName) {
        console.log('🔍 Wyszukiwanie w Apify dla:', companyName);
        
        // Jeśli nie podano nazwy, zapytaj
        if (!companyName || companyName.trim() === '') {
            companyName = prompt('🔍 Wpisz nazwę firmy do wyszukania w Social Media:', '');
            if (!companyName || companyName.trim() === '') {
                return;
            }
        }
        
        // Wywołaj istniejącą funkcję z właściwą nazwą
        this.searchSocialMedia(companyName);
    },
    
    async searchSocialMedia(companyName) {
        console.log('🔍 Wyszukiwanie w Social Media...');
        
        // Jeśli nie podano nazwy, zapytaj
        if (!companyName || companyName.trim() === '') {
            companyName = prompt('🔍 Wpisz nazwę firmy do wyszukania w Social Media:', '');
            if (!companyName || companyName.trim() === '') {
                return;
            }
        }
        
        // Pokaż modal ładowania
        const modal = document.createElement('div');
        modal.id = 'socialMediaModal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s;';
        modal.innerHTML = `
            <div style="background: white; border-radius: 12px; width: 90%; max-width: 1200px; max-height: 90vh; overflow: auto; position: relative;">
                <div style="position: sticky; top: 0; background: linear-gradient(135deg, #667eea, #764ba2); color: #000; padding: 20px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center; z-index: 1;">
                    <h2 style="margin: 0;">🔍 Social Media OSINT: ${companyName}</h2>
                    <button onclick="document.getElementById('socialMediaModal').remove()" style="background: rgba(255,255,255,0.2); border: none; color: #000; font-size: 24px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">×</button>
                </div>
                <div id="socialMediaResults" style="padding: 20px;">
                    <div style="text-align: center; padding: 40px;">
                        <div style="width: 50px; height: 50px; border: 5px solid #667eea; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                        <p style="color: #666;">Przeszukuję bazę Social Media...</p>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        try {
            // Wywołaj API
            const response = await window.api.request('/company/facebook-groups', {
                method: 'POST',
                body: JSON.stringify({ query: companyName })
            });
            
            if (response.success) {
                this.displaySocialMediaResults(response.data);
            } else {
                throw new Error(response.error || 'Błąd API');
            }
        } catch (error) {
            console.error('❌ Błąd wyszukiwania:', error);
            document.getElementById('socialMediaResults').innerHTML = `
                <div style="text-align: center; padding: 40px; color: #dc3545;">
                    <h3>❌ Błąd wyszukiwania</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    },
    
    displaySocialMediaResults(data) {
        let html = `
            <div style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #1b5e20; font-weight: 700;">✅ Wyniki dla: ${data.query}</h3>
                <p style="margin: 0; color: #2e7d32; font-size: 1.1rem;"><strong>Znaleziono:</strong> ${data.totalPosts} postów</p>
                <p style="margin: 5px 0 0 0; color: #2e7d32;"><strong>Sentiment:</strong> 
                    ${data.sentiment === 'negative' ? '😟 Negatywny' : data.sentiment === 'positive' ? '😊 Pozytywny' : '😐 Neutralny'}
                </p>
            </div>
        `;
        
        // Red Flags
        if (data.redFlags && data.redFlags.length > 0) {
            html += `<h3 style="color: #e74c3c;">🚨 Red Flags (${data.redFlags.length})</h3>`;
            data.redFlags.forEach(flag => {
                const searchQuery = encodeURIComponent(`${flag.author} ${flag.keyword} ${flag.text.substring(0, 30)}`);
                const fbSearchUrl = `https://www.facebook.com/search/posts?q=${searchQuery}`;
                
                html += `
                    <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #e74c3c;">
                        <strong style="color: #e74c3c;">🚩 ${flag.keyword}</strong><br>
                        <p style="margin: 10px 0;">${flag.text.substring(0, 200)}...</p>
                        <small style="color: #666;">Autor: ${flag.author}</small><br>
                        <a href="${fbSearchUrl}" target="_blank" style="color: #e74c3c; text-decoration: none; font-weight: 600;">🔍 Szukaj na FB →</a>
                    </div>
                `;
            });
        }
        
        // Witnesses
        if (data.potentialWitnesses && data.potentialWitnesses.length > 0) {
            html += `<h3 style="color: #6a1b9a; font-weight: 700;">👥 Potencjalni Świadkowie (${data.potentialWitnesses.length})</h3>`;
            data.potentialWitnesses.forEach(witness => {
                const fbPeopleUrl = `https://www.facebook.com/search/people?q=${encodeURIComponent(witness.name)}`;
                
                html += `
                    <div style="background: #f3e5f5; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #9C27B0;">
                        <strong style="color: #6a1b9a; font-size: 1.1rem;">👤 ${witness.name}</strong><br>
                        <p style="margin: 10px 0; color: #4a148c; font-size: 0.95rem;">${witness.complaint}</p>
                        <small style="color: #666; font-weight: 600;">Źródło: ${witness.groupName}</small><br>
                        <a href="${fbPeopleUrl}" target="_blank" style="color: #9C27B0; text-decoration: none; font-weight: 700; font-size: 0.95rem;">👤 Szukaj osoby →</a>
                    </div>
                `;
            });
        }
        
        // Posts
        if (data.posts && data.posts.length > 0) {
            html += `<h3 style="color: #1565c0; font-weight: 700; margin-top: 30px;">📝 Wszystkie Posty (${data.posts.length})</h3>`;
            data.posts.slice(0, 10).forEach(post => {
                const searchQuery = encodeURIComponent(`${post.author} ${post.text.substring(0, 50)}`);
                const fbSearchUrl = `https://www.facebook.com/search/posts?q=${searchQuery}`;
                
                html += `
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #2196f3;">
                        <strong style="color: #1565c0; font-size: 1.05rem;">${post.author}</strong> <span style="color: #757575;">w ${post.groupName}</span><br>
                        <p style="margin: 10px 0; color: #212121; line-height: 1.5;">${post.text.substring(0, 150)}${post.text.length > 150 ? '...' : ''}</p>
                        <small style="color: #616161; font-weight: 600;">👍 ${post.likes} | 💬 ${post.comments} | 🔄 ${post.shares}</small><br>
                        <a href="${fbSearchUrl}" target="_blank" style="color: #2196f3; text-decoration: none; font-weight: 700; font-size: 0.95rem;">🔍 Szukaj na FB →</a>
                    </div>
                `;
            });
            
            if (data.posts.length > 10) {
                html += `<p style="text-align: center; color: #999;">Pokazano 10 z ${data.posts.length} postów</p>`;
            }
        }
        
        if (data.totalPosts === 0) {
            html += `
                <div style="text-align: center; padding: 40px; background: #e3f2fd; border-radius: 8px;">
                    <h3 style="color: #1565c0; font-weight: 700;">🔍 Nie znaleziono postów</h3>
                    <p style="color: #1976d2; font-size: 1.05rem;">Brak wzmianek o tej firmie w monitorowanych grupach Facebook.</p>
                </div>
            `;
        }
        
        document.getElementById('socialMediaResults').innerHTML = html;
    },
    
    async deleteAnalysis() {
        if (!this.currentOpposingId) {
            window.showNotification('❌ Brak analizy do usunięcia', 'error');
            return;
        }
        
        // Potwierdzenie usunięcia
        if (!confirm('⚠️ CZY NA PEWNO USUNĄĆ TĘ ANALIZĘ?\n\n' + 
                     'Zostaną usunięte:\n' +
                     '• Wszystkie dane przeciwnika\n' +
                     '• Checklist (7 kroków)\n' +
                     '• Dowody i załączniki\n' +
                     '• Profile społecznościowe\n\n' +
                     'OPERACJA JEST NIEODWRACALNA!')) {
            return;
        }
        
        try {
            console.log('🗑️ Usuwanie analizy ID:', this.currentOpposingId);
            
            await window.api.request(`/opposing-analysis/${this.currentOpposingId}`, {
                method: 'DELETE'
            });
            
            console.log('✅ Analiza usunięta');
            window.showNotification('✅ Analiza został usunięta', 'success');
            
            // Reset stanu
            this.currentOpposingId = null;
            this.data = {};
            this.currentStep = 0;
            
            // Przeładuj widok - pokaż start screen
            await this.refreshView();
            
        } catch (error) {
            console.error('❌ Błąd usuwania analizy:', error);
            window.showNotification('❌ Błąd usuwania analizy', 'error');
        }
    }
};

// ==========================================
// WRAPPER FUNKCJI DLA KOMPATYBILNOŚCI
// ==========================================

window.renderOpposingPartyTab = async function(caseId) {
    console.log('⚔️ Wywołuję zunifikowany moduł dla sprawy:', caseId);
    return await window.opposingAnalysisModule.render(caseId);
};

// ==========================================
// FUNKCJE WYSZUKIWAREK API
// ==========================================

window.opposingAnalysisModule.searchKRS = async function() {
    const krsNumber = document.getElementById('krs_number_input')?.value.trim();
    const resultsDiv = document.getElementById('krs_results');
    
    if (!resultsDiv) {
        console.error('❌ Nie znaleziono kontenera krs_results');
        return;
    }
    
    if (!krsNumber || krsNumber.length !== 10) {
        resultsDiv.innerHTML = '<div style="padding: 15px; background: #ffebee; border-radius: 8px; color: #c62828;">❌ Podaj poprawny numer KRS (10 cyfr)</div>';
        return;
    }
    
    resultsDiv.innerHTML = '<div style="padding: 15px; text-align: center; color: #667eea;">⏳ Pobieranie danych z KRS...</div>';
    
    try {
        const response = await fetch('https://web-production-7504.up.railway.app/api/company/krs/full', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ krs: krsNumber })
        });
        
        const data = await response.json();
        
            if (data.success && data.data) {
            const company = data.data;
            let html = `
                <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50;">
                    <h4 style="margin: 0 0 15px 0; color: #2e7d32 !important; font-size: 1.2rem;">✅ ${company.nazwa}</h4>
                    
                    <div style="display: grid; gap: 8px; color: #333 !important; margin-bottom: 15px; font-size: 0.95rem;">
                        ${company.krs ? `<div style="color: #333 !important;"><strong style="color: #333 !important;">KRS:</strong> ${company.krs}</div>` : ''}
                        ${company.nip ? `<div style="color: #333 !important;"><strong style="color: #333 !important;">NIP:</strong> ${company.nip}</div>` : ''}
                        ${company.regon ? `<div style="color: #333 !important;"><strong style="color: #333 !important;">REGON:</strong> ${company.regon}</div>` : ''}
                        ${company.kapitalZakladowy?.wartosc ? `<div style="color: #333 !important;"><strong style="color: #333 !important;">Kapitał:</strong> ${company.kapitalZakladowy.wartosc.toLocaleString('pl-PL')} ${company.kapitalZakladowy.waluta}</div>` : ''}
                    </div>

                    <div style="margin-bottom: 15px; color: #000 !important; font-size: 0.95rem;">
                        <strong style="display: block; margin-bottom: 4px; color: #000 !important;">📍 Adres:</strong>
                        ${company.adres?.pelny || 'Brak pełnego adresu'}
                        ${company.adres?.wojewodztwo ? `<br><span style="font-size: 0.85rem; color: #000 !important;">Województwo: ${company.adres.wojewodztwo}</span>` : ''}
                        ${company.adres?.powiat ? `<br><span style="font-size: 0.85rem; color: #000 !important;">Powiat: ${company.adres.powiat}</span>` : ''}
                        ${company.adres?.gmina ? `<br><span style="font-size: 0.85rem; color: #000 !important;">Gmina: ${company.adres.gmina}</span>` : ''}
                        ${company.adres?.kraj && company.adres.kraj !== 'POLSKA' ? `<br><span style="font-size: 0.85rem; color: #000 !important;">Kraj: ${company.adres.kraj}</span>` : ''}
                        ${company.adres?.email ? `<br>📧 <a href="mailto:${company.adres.email}" style="color: #1976d2; text-decoration: none;">${company.adres.email}</a>` : ''}
                        ${company.adres?.www ? `<br>🌐 <a href="${company.adres.www.startsWith('http') ? company.adres.www : 'http://' + company.adres.www}" target="_blank" style="color: #1976d2; text-decoration: none;">${company.adres.www}</a>` : ''}
                    </div>

                    ${company.reprezentacja?.sposobReprezentacji ? `
                        <div style="margin-bottom: 15px; color: #000 !important; background: rgba(255,255,255,0.6); padding: 10px; border-radius: 4px; border: 1px solid #c8e6c9;">
                            <strong style="display: block; margin-bottom: 4px; color: #000 !important;">⚖️ Reprezentacja:</strong>
                            <div style="font-size: 0.85rem; font-style: italic; line-height: 1.4; color: #000 !important;">${company.reprezentacja.sposobReprezentacji}</div>
                        </div>
                    ` : ''}

                    ${company.reprezentacja?.zarzad && company.reprezentacja.zarzad.length > 0 ? `
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #333 !important; display: block; margin-bottom: 5px;">👥 Zarząd:</strong>
                            ${company.reprezentacja.zarzad.map(z => `
                                <div style="padding: 8px; background: white; border-radius: 4px; margin-bottom: 5px; color: #333 !important; border: 1px solid #c8e6c9; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                    <strong style="color: #333 !important;">${z.imie}${z.imieDrugie ? ' ' + z.imieDrugie : ''} ${z.nazwisko}</strong><br>
                                    <span style="font-size: 0.85rem; color: #555 !important;">${z.funkcja}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${company.reprezentacja?.radaNadzorcza && company.reprezentacja.radaNadzorcza.length > 0 ? `
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #333 !important; display: block; margin-bottom: 5px;">🏛️ Rada Nadzorcza:</strong>
                            ${company.reprezentacja.radaNadzorcza.map(r => `
                                <div style="padding: 8px; background: white; border-radius: 4px; margin-bottom: 5px; color: #333 !important; border: 1px solid #e1bee7; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                                    <strong style="color: #333 !important;">${r.imie}${r.imieDrugie ? ' ' + r.imieDrugie : ''} ${r.nazwisko}</strong><br>
                                    <span style="font-size: 0.85rem; color: #555 !important;">${r.funkcja}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}

                    ${company.wspolnicy && company.wspolnicy.length > 0 ? `
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #333 !important; display: block; margin-bottom: 5px;">🤝 Wspólnicy:</strong>
                            <div style="max-height: 150px; overflow-y: auto;">
                                ${company.wspolnicy.map(w => `
                                    <div style="padding: 6px 8px; background: white; border-radius: 4px; margin-bottom: 3px; color: #333 !important; font-size: 0.9rem; border: 1px solid #e0e0e0;">
                                        • <strong>${w.nazwa || 'Brak nazwy'}</strong>
                                        ${w.udzialy ? `<br><span style="font-size: 0.85rem; color: #666;">Udziały: ${w.udzialy}</span>` : ''}
                                        ${w.wartoscUdzialow ? `<br><span style="font-size: 0.85rem; color: #666;">Wartość: ${w.wartoscUdzialow}</span>` : ''}
                                        ${w.dataWpisu ? `<br><span style="font-size: 0.8rem; color: #999;">Wpis: ${w.dataWpisu}</span>` : ''}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    ${company.przedmiotDzialalnosci && company.przedmiotDzialalnosci.length > 0 ? `
                        <div style="margin-bottom: 15px;">
                            <strong style="color: #333 !important; display: block; margin-bottom: 5px;">🏭 PKD:</strong>
                            <div style="font-size: 0.85rem; color: #333 !important; background: white; padding: 8px; border-radius: 4px; border: 1px solid #e0e0e0;">
                                ${company.przedmiotDzialalnosci.slice(0, 5).map(p => p.opis || p.pkd).join(', ')}
                                ${company.przedmiotDzialalnosci.length > 5 ? `... (+${company.przedmiotDzialalnosci.length - 5})` : ''}
                            </div>
                        </div>
                    ` : ''}

                    <button onclick="window.opposingAnalysisModule.autoFillFromKRS('${krsNumber}')" style="width: 100%; margin-top: 10px; padding: 12px; background: #4caf50; color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 1rem; box-shadow: 0 2px 5px rgba(76,175,80,0.3);">
                        ✅ Wypełnij formularz automatycznie
                    </button>
                </div>
            `;
            
            resultsDiv.innerHTML = html;
            
            // Zapisz dane do cache dla auto-fill
            window.opposingAnalysisModule.cachedKRSData = company;
        } else {
            resultsDiv.innerHTML = '<div style="padding: 15px; background: #fff3cd; border-radius: 8px; color: #856404;">⚠️ Nie znaleziono firmy w KRS</div>';
        }
    } catch (error) {
        console.error('❌ Błąd wyszukiwania KRS:', error);
        resultsDiv.innerHTML = '<div style="padding: 15px; background: #ffebee; border-radius: 8px; color: #c62828;">❌ Błąd połączenia z KRS API</div>';
    }
};

window.opposingAnalysisModule.searchCEIDG = async function() {
    const nip = document.getElementById('ceidg_nip_input')?.value.trim();
    const resultsDiv = document.getElementById('ceidg_results');
    
    if (!resultsDiv) return;
    
    if (!nip || nip.length !== 10) {
        resultsDiv.innerHTML = '<div style="padding: 15px; background: #ffebee; border-radius: 8px; color: #c62828;">❌ Podaj poprawny NIP (10 cyfr)</div>';
        return;
    }
    
    resultsDiv.innerHTML = '<div style="padding: 15px; text-align: center; color: #667eea;">⏳ Pobieranie danych z CEIDG...</div>';
    
    try {
        const response = await fetch('https://web-production-7504.up.railway.app/api/company/ceidg/nip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nip: nip })
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            const firma = data.data;
            const statusColors = { 'AKTYWNY': '#4caf50', 'ZAWIESZONA': '#ff9800', 'WYKREŚLONA': '#f44336' };
            const statusColor = statusColors[firma.status] || '#999';
            
            let html = `
                <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusColor};">
                    <h4 style="margin: 0 0 15px 0; color: #2e7d32 !important; font-size: 1.2rem;">✅ ${firma.nazwa}</h4>
                    <div style="display: grid; gap: 10px; color: #333 !important;">
                        <div style="color: #333 !important;"><strong style="color: #333 !important;">Status:</strong> <span style="color: ${statusColor} !important; font-weight: 600;">${firma.status}</span></div>
                        ${firma.nip ? `<div style="color: #333 !important;"><strong style="color: #333 !important;">NIP:</strong> ${firma.nip}</div>` : ''}
                        ${firma.adres ? `<div style="color: #333 !important;"><strong style="color: #333 !important;">Adres:</strong> ${typeof firma.adres === 'object' ? (firma.adres.ulica ? firma.adres.ulica + ' ' + (firma.adres.budynek || '') + ', ' + (firma.adres.miasto || '') : JSON.stringify(firma.adres).replace(/["{}]/g, ' ')) : firma.adres}</div>` : ''}
                    </div>
                    <button onclick="window.opposingAnalysisModule.autoFillFromCEIDG('${nip}')" style="margin-top: 15px; padding: 10px 20px; background: #4caf50; color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        ✅ Wypełnij formularz automatycznie
                    </button>
                </div>
            `;
            resultsDiv.innerHTML = html;
            window.opposingAnalysisModule.cachedCEIDGData = firma;
        } else {
            resultsDiv.innerHTML = '<div style="padding: 15px; background: #fff3cd; border-radius: 8px; color: #856404;">⚠️ Nie znaleziono w CEIDG</div>';
        }
    } catch (error) {
        resultsDiv.innerHTML = '<div style="padding: 15px; background: #ffebee; border-radius: 8px; color: #c62828;">❌ Błąd połączenia</div>';
    }
};

// Auto-fill functions
window.opposingAnalysisModule.autoFillFromKRS = async function(krsNumber) {
    const data = this.cachedKRSData;
    if (!data) return;
    
    // Wypełnij pola formularza w kroku 1
    const nameInput = document.getElementById('opposing_name');
    const nipInput = document.getElementById('opposing_nip');
    const regonInput = document.getElementById('opposing_regon');
    const krsInput = document.getElementById('opposing_krs');
    const addressInput = document.getElementById('opposing_address');
    
    if (nameInput) nameInput.value = data.nazwa || '';
    if (nipInput) nipInput.value = data.nip || '';
    if (regonInput) regonInput.value = data.regon || '';
    if (krsInput) krsInput.value = krsNumber;
    if (addressInput) addressInput.value = data.adres?.pelny || '';
    
    window.showNotification('✅ Formularz wypełniony automatycznie!', 'success');
};

window.opposingAnalysisModule.autoFillFromCEIDG = async function(nip) {
    const data = this.cachedCEIDGData;
    if (!data) return;
    
    const nameInput = document.getElementById('opposing_name');
    const nipInput = document.getElementById('opposing_nip');
    const addressInput = document.getElementById('opposing_address');
    
    if (nameInput) nameInput.value = data.nazwa || '';
    if (nipInput) nipInput.value = data.nip || '';
    if (addressInput) addressInput.value = data.adres || '';
    
    window.showNotification('✅ Formularz wypełniony automatycznie!', 'success');
};

// ==========================================
// FUNKCJE DOWODÓW
// ==========================================

window.opposingAnalysisModule.loadEvidence = async function() {
    const container = document.getElementById('evidence_list_container');
    if (!container) return;
    
    try {
        const response = await window.api.request(`/evidence?case_id=${this.currentCaseId}`);
        const evidence = response.evidence || [];
        
        if (evidence.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: #999; padding: 40px;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">📂</div>
                    <div style="font-size: 1.1rem;">Brak dowodów w sprawie</div>
                    <div style="font-size: 0.9rem; margin-top: 5px;">Kliknij "Dodaj dowód" aby dodać pierwszy dowód</div>
                </div>
            `;
            return;
        }
        
        const typeIcons = {
            'all': '📁',
            'key': '🔑',
            'supporting': '📋',
            'to_check': '🔍'
        };
        
        const typeColors = {
            'all': '#667eea',
            'key': '#e74c3c',
            'supporting': '#27ae60',
            'to_check': '#f39c12'
        };
        
        let html = '<div style="display: grid; gap: 15px;">';
        
        evidence.forEach(item => {
            const icon = typeIcons[item.type] || '📁';
            const color = typeColors[item.type] || '#999';
            
            html += `
                <div style="border: 2px solid ${color}; border-radius: 10px; padding: 15px; background: white;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <div style="display: flex; gap: 10px; align-items: center; flex: 1;">
                            <span style="font-size: 1.5rem;">${icon}</span>
                            <div>
                                <div style="font-weight: 600; color: #2c3e50; font-size: 1.05rem;">${item.name || item.title}</div>
                                <div style="font-size: 0.85rem; color: #7f8c8d; margin-top: 3px;">Kod: ${item.evidence_code}</div>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="window.opposingAnalysisModule.viewEvidenceDetails(${item.id})" 
                                style="padding: 6px 12px; background: #3498db; color: #000; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                👁️ Szczegóły
                            </button>
                            <button onclick="window.opposingAnalysisModule.deleteEvidence(${item.id})" 
                                style="padding: 6px 12px; background: #e74c3c; color: #000; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                                🗑️
                            </button>
                        </div>
                    </div>
                    ${item.description ? `<div style="color: #666; font-size: 0.9rem; margin-bottom: 10px;">${item.description}</div>` : ''}
                    <div style="display: flex; gap: 15px; font-size: 0.85rem; color: #7f8c8d;">
                        <span>📅 ${item.obtained_date || 'Brak daty'}</span>
                        ${item.attachments_count ? `<span>📎 ${item.attachments_count} załączników</span>` : ''}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Błąd ładowania dowodów:', error);
        container.innerHTML = '<div style="text-align: center; color: #e74c3c; padding: 20px;">❌ Błąd ładowania dowodów</div>';
    }
};

window.opposingAnalysisModule.showAddEvidenceModal = function() {
    // Użyj istniejącego modułu dowodów zamiast tworzyć własny modal
    if (window.evidenceModule && typeof window.evidenceModule.showAddForm === 'function') {
        window.evidenceModule.showAddForm(this.currentCaseId);
    } else if (typeof evidenceModule !== 'undefined' && typeof evidenceModule.showAddForm === 'function') {
        evidenceModule.showAddForm(this.currentCaseId);
    } else {
        console.error('❌ evidenceModule.showAddForm nie jest dostępny');
        window.showNotification('❌ Moduł dowodów nie jest załadowany', 'error');
    }
};

// Funkcja saveEvidence usunięta - używamy evidenceModule.showAddForm() który ma własną logikę zapisu

// Nasłuchuj na dodanie dowodu z evidenceModule
if (window.eventBus) {
    window.eventBus.on('evidence:created', (data) => {
        console.log('📁 Wykryto dodanie dowodu, odświeżam listę...');
        // Odśwież listę dowodów jeśli jesteśmy na kroku 7
        if (window.opposingAnalysisModule && window.opposingAnalysisModule.currentStep === 7) {
            setTimeout(() => {
                window.opposingAnalysisModule.loadEvidence();
            }, 300);
        }
    });
}

window.opposingAnalysisModule.viewEvidenceDetails = function(evidenceId) {
    // Użyj istniejącego modułu dowodów do wyświetlenia szczegółów
    if (window.evidenceModule && typeof window.evidenceModule.viewDetails === 'function') {
        window.evidenceModule.viewDetails(evidenceId);
    } else if (typeof evidenceModule !== 'undefined' && typeof evidenceModule.viewDetails === 'function') {
        evidenceModule.viewDetails(evidenceId);
    } else {
        console.error('❌ evidenceModule.viewDetails nie jest dostępny');
        window.showNotification('❌ Moduł dowodów nie jest załadowany', 'error');
    }
};

window.opposingAnalysisModule.deleteEvidence = async function(evidenceId) {
    if (!confirm('Czy na pewno chcesz usunąć ten dowód?')) return;
    
    try {
        await window.api.request(`/evidence/${evidenceId}`, {
            method: 'DELETE'
        });
        
        window.showNotification('✅ Dowód usunięty', 'success');
        await this.loadEvidence();
        
    } catch (error) {
        console.error('❌ Błąd usuwania dowodu:', error);
        window.showNotification('❌ Błąd usuwania dowodu', 'error');
    }
};

// ==========================================
// FUNKCJE ZADŁUŻEŃ
// ==========================================

window.opposingAnalysisModule.addDebt = function() {
    const modal = document.createElement('div');
    modal.id = 'add_debt_modal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; padding: 30px; border-radius: 16px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin: 0 0 20px 0; color: #c62828;">💳 Dodaj zadłużenie</h3>
                
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Źródło informacji *</label>
                        <select id="debt_source" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;">
                            <option value="">Wybierz źródło...</option>
                            <option value="KRD">📊 KRD - Krajowy Rejestr Długów</option>
                            <option value="BIG">📈 BIG InfoMonitor</option>
                            <option value="KRZ">⚖️ KRZ - Krajowy Rejestr Zadłużonych</option>
                            <option value="court">🏛️ Wyrok sądowy</option>
                            <option value="bailiff">👮 Komornik</option>
                            <option value="other">📋 Inne źródło</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Wierzyciel *</label>
                        <input type="text" id="debt_creditor" placeholder="np. Bank XYZ, Dostawca ABC" 
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Kwota (PLN)</label>
                            <input type="number" id="debt_amount" placeholder="np. 50000" 
                                style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Data wpisu</label>
                            <input type="date" id="debt_date" 
                                style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Szczegóły</label>
                        <textarea id="debt_details" placeholder="Dodatkowe informacje o zadłużeniu..." 
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px; min-height: 80px; resize: vertical;"></textarea>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 25px; justify-content: flex-end;">
                    <button onclick="document.getElementById('add_debt_modal').remove()" 
                        style="padding: 12px 25px; background: #ecf0f1; color: #2c3e50; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Anuluj
                    </button>
                    <button onclick="window.opposingAnalysisModule.saveDebt()" 
                        style="padding: 12px 25px; background: linear-gradient(135deg, #e74c3c, #c0392b); color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        💾 Zapisz
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Ustaw dzisiejszą datę jako domyślną
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('debt_date').value = today;
};

window.opposingAnalysisModule.saveDebt = function() {
    const source = document.getElementById('debt_source').value.trim();
    const creditor = document.getElementById('debt_creditor').value.trim();
    const amount = document.getElementById('debt_amount').value;
    const date = document.getElementById('debt_date').value;
    const details = document.getElementById('debt_details').value.trim();
    
    if (!source || !creditor) {
        alert('Wypełnij wymagane pola: Źródło i Wierzyciel');
        return;
    }
    
    // Pobierz obecną listę lub utwórz nową
    if (!this.data.opposing.debts) {
        this.data.opposing.debts = [];
    }
    
    const debt = {
        id: Date.now(),
        source,
        creditor,
        amount: amount ? parseFloat(amount) : null,
        date,
        details,
        created_at: new Date().toISOString()
    };
    
    this.data.opposing.debts.push(debt);
    
    // Zapisz do bazy
    this.saveCurrentStep();
    
    window.showNotification('✅ Zadłużenie dodane!', 'success');
    document.getElementById('add_debt_modal').remove();
    
    // Odśwież listę
    this.loadDebts();
};

window.opposingAnalysisModule.loadDebts = function() {
    const container = document.getElementById('debts_list_container');
    if (!container) return;
    
    const debts = this.data.opposing.debts || [];
    
    if (debts.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #999; padding: 20px;">
                <div style="font-size: 2rem; margin-bottom: 10px;">📭</div>
                <div>Brak zarejestrowanych zadłużeń</div>
                <div style="font-size: 0.9rem; margin-top: 5px;">Kliknij "Dodaj zadłużenie" aby dodać pierwszy wpis</div>
            </div>
        `;
        return;
    }
    
    const sourceIcons = {
        'KRD': '📊',
        'BIG': '📈',
        'KRZ': '⚖️',
        'court': '🏛️',
        'bailiff': '👮',
        'other': '📋'
    };
    
    let html = '<div style="display: grid; gap: 10px;">';
    
    debts.forEach(debt => {
        const icon = sourceIcons[debt.source] || '📋';
        const amountStr = debt.amount ? `${debt.amount.toLocaleString('pl-PL')} PLN` : 'Kwota nieznana';
        
        html += `
            <div style="background: white; border: 2px solid #ffcdd2; border-radius: 8px; padding: 15px; display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 1.3rem;">${icon}</span>
                        <strong style="color: #c62828;">${debt.creditor}</strong>
                    </div>
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 5px;">
                        Źródło: ${debt.source} ${debt.date ? `• ${debt.date}` : ''}
                    </div>
                    <div style="color: #e74c3c; font-weight: 600; margin-bottom: 5px;">
                        ${amountStr}
                    </div>
                    ${debt.details ? `<div style="color: #999; font-size: 0.85rem; margin-top: 8px;">${debt.details}</div>` : ''}
                </div>
                <button onclick="window.opposingAnalysisModule.deleteDebt(${debt.id})" 
                    style="padding: 6px 12px; background: #e74c3c; color: #000; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                    🗑️
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
};

window.opposingAnalysisModule.deleteDebt = function(debtId) {
    if (!confirm('Czy na pewno chcesz usunąć to zadłużenie?')) return;
    
    this.data.opposing.debts = this.data.opposing.debts.filter(d => d.id !== debtId);
    this.saveCurrentStep();
    window.showNotification('✅ Zadłużenie usunięte', 'success');
    this.loadDebts();
};

// ==========================================
// FUNKCJE ODPOWIEDZI ZEWNĘTRZNYCH
// ==========================================

window.opposingAnalysisModule.addExternalResponse = function() {
    const modal = document.createElement('div');
    modal.id = 'add_response_modal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; padding: 30px; border-radius: 16px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin: 0 0 20px 0; color: #6a1b9a;">📋 Dodaj odpowiedź z systemu</h3>
                
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">System *</label>
                        <select id="response_system" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;">
                            <option value="">Wybierz system...</option>
                            <option value="UFG">🚙 UFG - Ubezpieczeniowy Fundusz Gwarancyjny</option>
                            <option value="CEPiK">🚗 CEPiK - Historia pojazdu</option>
                            <option value="KRD">📊 KRD - Krajowy Rejestr Długów</option>
                            <option value="BIG">📈 BIG InfoMonitor</option>
                            <option value="KRZ">⚖️ KRZ - Krajowy Rejestr Zadłużonych</option>
                            <option value="other">📋 Inny system</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Data odpowiedzi</label>
                        <input type="date" id="response_date" 
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Wynik sprawdzenia *</label>
                        <select id="response_result" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;">
                            <option value="">Wybierz wynik...</option>
                            <option value="positive">✅ Pozytywny (brak wpisów/zadłużeń)</option>
                            <option value="negative">❌ Negatywny (znaleziono wpisy)</option>
                            <option value="partial">⚠️ Częściowy (wymaga weryfikacji)</option>
                            <option value="no_data">❓ Brak danych</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Szczegóły odpowiedzi *</label>
                        <textarea id="response_content" placeholder="Wpisz szczegóły odpowiedzi z systemu..." 
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px; min-height: 120px; resize: vertical;"></textarea>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 25px; justify-content: flex-end;">
                    <button onclick="document.getElementById('add_response_modal').remove()" 
                        style="padding: 12px 25px; background: #ecf0f1; color: #2c3e50; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Anuluj
                    </button>
                    <button onclick="window.opposingAnalysisModule.saveExternalResponse()" 
                        style="padding: 12px 25px; background: linear-gradient(135deg, #9c27b0, #7b1fa2); color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        💾 Zapisz
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Ustaw dzisiejszą datę jako domyślną
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('response_date').value = today;
};

window.opposingAnalysisModule.saveExternalResponse = function() {
    const system = document.getElementById('response_system').value.trim();
    const date = document.getElementById('response_date').value;
    const result = document.getElementById('response_result').value;
    const content = document.getElementById('response_content').value.trim();
    
    if (!system || !result || !content) {
        alert('Wypełnij wymagane pola: System, Wynik i Szczegóły');
        return;
    }
    
    // Pobierz obecną listę lub utwórz nową
    if (!this.data.opposing.external_responses) {
        this.data.opposing.external_responses = [];
    }
    
    const response = {
        id: Date.now(),
        system,
        date,
        result,
        content,
        created_at: new Date().toISOString()
    };
    
    this.data.opposing.external_responses.push(response);
    
    // Zapisz do bazy
    this.saveCurrentStep();
    
    window.showNotification('✅ Odpowiedź dodana!', 'success');
    document.getElementById('add_response_modal').remove();
    
    // Odśwież listę
    this.loadExternalResponses();
};

window.opposingAnalysisModule.loadExternalResponses = function() {
    const container = document.getElementById('external_responses_container');
    if (!container) return;
    
    const responses = this.data.opposing.external_responses || [];
    
    if (responses.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #999; padding: 20px;">
                <div style="font-size: 2rem; margin-bottom: 10px;">📭</div>
                <div>Brak odpowiedzi z systemów</div>
                <div style="font-size: 0.9rem; margin-top: 5px;">Kliknij "Dodaj odpowiedź" aby zapisać informacje z UFG, CEPiK, KRD, itp.</div>
            </div>
        `;
        return;
    }
    
    const systemIcons = {
        'UFG': '🚙',
        'CEPiK': '🚗',
        'KRD': '📊',
        'BIG': '📈',
        'KRZ': '⚖️',
        'other': '📋'
    };
    
    const resultColors = {
        'positive': '#27ae60',
        'negative': '#e74c3c',
        'partial': '#f39c12',
        'no_data': '#95a5a6'
    };
    
    const resultLabels = {
        'positive': '✅ Pozytywny',
        'negative': '❌ Negatywny',
        'partial': '⚠️ Częściowy',
        'no_data': '❓ Brak danych'
    };
    
    let html = '<div style="display: grid; gap: 10px;">';
    
    responses.forEach(resp => {
        const icon = systemIcons[resp.system] || '📋';
        const color = resultColors[resp.result] || '#999';
        const resultLabel = resultLabels[resp.result] || resp.result;
        
        html += `
            <div style="background: white; border: 2px solid ${color}; border-radius: 8px; padding: 15px; display: flex; justify-content: space-between; align-items: start;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                        <span style="font-size: 1.3rem;">${icon}</span>
                        <strong style="color: #2c3e50;">${resp.system}</strong>
                        <span style="color: ${color}; font-weight: 600; font-size: 0.9rem;">${resultLabel}</span>
                    </div>
                    <div style="color: #666; font-size: 0.9rem; margin-bottom: 8px;">
                        ${resp.date ? `Data: ${resp.date}` : ''}
                    </div>
                    <div style="color: #555; font-size: 0.9rem; line-height: 1.5; background: #f8f9fa; padding: 10px; border-radius: 6px;">
                        ${resp.content}
                    </div>
                </div>
                <button onclick="window.opposingAnalysisModule.deleteExternalResponse(${resp.id})" 
                    style="padding: 6px 12px; background: #e74c3c; color: #000; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; margin-left: 10px;">
                    🗑️
                </button>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
};

window.opposingAnalysisModule.deleteExternalResponse = function(responseId) {
    if (!confirm('Czy na pewno chcesz usunąć tę odpowiedź?')) return;
    
    this.data.opposing.external_responses = this.data.opposing.external_responses.filter(r => r.id !== responseId);
    this.saveCurrentStep();
    window.showNotification('✅ Odpowiedź usunięta', 'success');
    this.loadExternalResponses();
};

// ==========================================
// FUNKCJE SPRAW SĄDOWYCH
// ==========================================

window.opposingAnalysisModule.addCourtCase = function() {
    const modal = document.createElement('div');
    modal.id = 'add_court_case_modal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;">
            <div style="background: white; padding: 30px; border-radius: 16px; max-width: 700px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <h3 style="margin: 0 0 20px 0; color: #e65100;">⚖️ Dodaj sprawę sądową</h3>
                
                <div style="display: grid; gap: 15px;">
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Sygnatura akt *</label>
                            <input type="text" id="case_signature" placeholder="np. I C 123/2024" 
                                style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Data</label>
                            <input type="date" id="case_date" 
                                style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Sąd</label>
                            <input type="text" id="case_court" placeholder="np. Sąd Okręgowy w Warszawie" 
                                style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Rola strony</label>
                            <select id="case_role" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;">
                                <option value="">Wybierz...</option>
                                <option value="plaintiff">🔴 Powód</option>
                                <option value="defendant">🔵 Pozwany</option>
                                <option value="third_party">🟡 Strona trzecia</option>
                                <option value="other">⚪ Inna</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Przedmiot sprawy *</label>
                        <input type="text" id="case_subject" placeholder="np. Zapłata należności, ustalenie ojcostwa, rozwód" 
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Status sprawy</label>
                            <select id="case_status" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;">
                                <option value="">Wybierz...</option>
                                <option value="ongoing">🔄 W toku</option>
                                <option value="finished">✅ Zakończona</option>
                                <option value="appeal">⚖️ Apelacja</option>
                                <option value="cassation">📜 Kasacja</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Wynik</label>
                            <select id="case_outcome" style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;">
                                <option value="">Wybierz...</option>
                                <option value="won">✅ Wygrana</option>
                                <option value="lost">❌ Przegrana</option>
                                <option value="settlement">🤝 Ugoda</option>
                                <option value="dismissed">🚫 Oddalona</option>
                                <option value="pending">⏳ Oczekuje</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Kwota (PLN)</label>
                        <input type="number" id="case_amount" placeholder="np. 100000" 
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px;" />
                    </div>
                    
                    <div>
                        <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #2c3e50;">Notatki</label>
                        <textarea id="case_notes" placeholder="Dodatkowe informacje o sprawie, wyrok, koszty..." 
                            style="width: 100%; padding: 12px; border: 2px solid #ecf0f1; border-radius: 8px; min-height: 100px; resize: vertical;"></textarea>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 25px; justify-content: flex-end;">
                    <button onclick="document.getElementById('add_court_case_modal').remove()" 
                        style="padding: 12px 25px; background: #ecf0f1; color: #2c3e50; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        Anuluj
                    </button>
                    <button onclick="window.opposingAnalysisModule.saveCourtCase()" 
                        style="padding: 12px 25px; background: linear-gradient(135deg, #ff9800, #f57c00); color: #000; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        💾 Zapisz
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
};

window.opposingAnalysisModule.saveCourtCase = function() {
    const signature = document.getElementById('case_signature').value.trim();
    const date = document.getElementById('case_date').value;
    const court = document.getElementById('case_court').value.trim();
    const role = document.getElementById('case_role').value;
    const subject = document.getElementById('case_subject').value.trim();
    const status = document.getElementById('case_status').value;
    const outcome = document.getElementById('case_outcome').value;
    const amount = document.getElementById('case_amount').value;
    const notes = document.getElementById('case_notes').value.trim();
    
    if (!signature || !subject) {
        alert('Wypełnij wymagane pola: Sygnatura i Przedmiot sprawy');
        return;
    }
    
    // Pobierz obecną listę lub utwórz nową
    if (!this.data.opposing.court_cases) {
        this.data.opposing.court_cases = [];
    }
    
    const courtCase = {
        id: Date.now(),
        signature,
        date,
        court,
        role,
        subject,
        status,
        outcome,
        amount: amount ? parseFloat(amount) : null,
        notes,
        created_at: new Date().toISOString()
    };
    
    this.data.opposing.court_cases.push(courtCase);
    
    // Zapisz do bazy
    this.saveCurrentStep();
    
    window.showNotification('✅ Sprawa dodana!', 'success');
    document.getElementById('add_court_case_modal').remove();
    
    // Odśwież listę
    this.loadCourtCases();
};

window.opposingAnalysisModule.loadCourtCases = function() {
    const container = document.getElementById('court_cases_container');
    if (!container) return;
    
    const cases = this.data.opposing.court_cases || [];
    
    if (cases.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #999; padding: 20px;">
                <div style="font-size: 2rem; margin-bottom: 10px;">📭</div>
                <div>Brak zarejestrowanych spraw sądowych</div>
                <div style="font-size: 0.9rem; margin-top: 5px;">Kliknij "Dodaj sprawę" aby dodać pierwszy wpis</div>
            </div>
        `;
        return;
    }
    
    const roleIcons = {
        'plaintiff': '🔴',
        'defendant': '🔵',
        'third_party': '🟡',
        'other': '⚪'
    };
    
    const roleLabels = {
        'plaintiff': 'Powód',
        'defendant': 'Pozwany',
        'third_party': 'Strona trzecia',
        'other': 'Inna'
    };
    
    const statusColors = {
        'ongoing': '#2196f3',
        'finished': '#4caf50',
        'appeal': '#ff9800',
        'cassation': '#9c27b0'
    };
    
    const statusLabels = {
        'ongoing': '🔄 W toku',
        'finished': '✅ Zakończona',
        'appeal': '⚖️ Apelacja',
        'cassation': '📜 Kasacja'
    };
    
    const outcomeLabels = {
        'won': '✅ Wygrana',
        'lost': '❌ Przegrana',
        'settlement': '🤝 Ugoda',
        'dismissed': '🚫 Oddalona',
        'pending': '⏳ Oczekuje'
    };
    
    let html = '<div style="display: grid; gap: 12px;">';
    
    cases.forEach(courtCase => {
        const roleIcon = roleIcons[courtCase.role] || '⚪';
        const roleLabel = roleLabels[courtCase.role] || courtCase.role;
        const statusColor = statusColors[courtCase.status] || '#999';
        const statusLabel = statusLabels[courtCase.status] || courtCase.status;
        const outcomeLabel = outcomeLabels[courtCase.outcome] || courtCase.outcome || 'Brak informacji';
        
        html += `
            <div style="background: white; border: 2px solid #ffe0b2; border-radius: 8px; padding: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <span style="font-size: 1.2rem;">${roleIcon}</span>
                            <strong style="color: #e65100; font-size: 1.05rem;">${courtCase.signature}</strong>
                        </div>
                        <div style="color: #2c3e50; font-weight: 600; margin-bottom: 5px;">
                            ${courtCase.subject}
                        </div>
                        <div style="display: flex; gap: 15px; color: #666; font-size: 0.9rem; margin-bottom: 8px; flex-wrap: wrap;">
                            ${courtCase.court ? `<span>🏛️ ${courtCase.court}</span>` : ''}
                            ${courtCase.date ? `<span>📅 ${courtCase.date}</span>` : ''}
                            <span>${roleLabel}</span>
                        </div>
                        <div style="display: flex; gap: 10px; margin-bottom: 8px;">
                            ${courtCase.status ? `<span style="padding: 4px 10px; background: ${statusColor}; color: #000; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">${statusLabel}</span>` : ''}
                            ${courtCase.outcome ? `<span style="padding: 4px 10px; background: #f5f5f5; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">${outcomeLabel}</span>` : ''}
                        </div>
                        ${courtCase.amount ? `<div style="color: #ff6f00; font-weight: 700; margin-bottom: 5px;">💰 ${courtCase.amount.toLocaleString('pl-PL')} PLN</div>` : ''}
                        ${courtCase.notes ? `<div style="color: #999; font-size: 0.85rem; margin-top: 8px; background: #f8f9fa; padding: 8px; border-radius: 4px;">${courtCase.notes}</div>` : ''}
                    </div>
                    <button onclick="window.opposingAnalysisModule.deleteCourtCase(${courtCase.id})" 
                        style="padding: 6px 12px; background: #e74c3c; color: #000; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; margin-left: 10px;">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
};

window.opposingAnalysisModule.deleteCourtCase = function(caseId) {
    if (!confirm('Czy na pewno chcesz usunąć tę sprawę?')) return;
    
    this.data.opposing.court_cases = this.data.opposing.court_cases.filter(c => c.id !== caseId);
    this.saveCurrentStep();
    window.showNotification('✅ Sprawa usunięta', 'success');
    this.loadCourtCases();
};

console.log('✅ Unified Opposing Party Module loaded');

