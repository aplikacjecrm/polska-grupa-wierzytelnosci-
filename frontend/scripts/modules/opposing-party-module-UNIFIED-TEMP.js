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
                
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 25px; border-radius: 12px; max-width: 500px; margin: 0 auto 30px auto; color: white;">
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
                    background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                    color: white;
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
                        Wpisz <strong>nazwę firmy</strong>, <strong>NIP</strong>, <strong>REGON</strong> lub <strong>adres</strong> - dane zostaną automatycznie uzupełnione.
                    </p>
                    
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #2c3e50; font-size: 1.1rem;">
                            🔍 Wyszukaj przeciwnika:
                        </label>
                        <input type="text" id="smart_search_input" placeholder="Np: ACME Sp. z o.o. lub 1234567890 lub ul. Testowa 123" 
                            style="width: 100%; padding: 15px; border: 2px solid #3B82F6; border-radius: 10px; font-size: 1.1rem; box-sizing: border-box;"
                            autofocus />
                        <div id="search_hint" style="margin-top: 8px; font-size: 0.9rem; color: #95a5a6;"></div>
                    </div>
                    
                    <div id="smart_search_status" style="margin-bottom: 20px; padding: 15px; border-radius: 10px; display: none;"></div>
                    
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
                            background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                            color: white;
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
            
            if (!value) {
                hint.textContent = '';
                return;
            }
            
            const cleanValue = value.replace(/[-\s]/g, '');
            
            if (/^\d{10}$/.test(cleanValue)) {
                hint.textContent = '✅ Wykryto NIP - dane zostaną pobrane automatycznie';
                hint.style.color = '#3B82F6';
            } else if (/^\d{9}$/.test(cleanValue)) {
                hint.textContent = '✅ Wykryto REGON - dane zostaną pobrane automatycznie';
                hint.style.color = '#3B82F6';
            } else if (/^\d{10,}$/.test(cleanValue)) {
                hint.textContent = '✅ Wykryto KRS - dane zostaną pobrane automatycznie';
                hint.style.color = '#3B82F6';
            } else {
                hint.textContent = '💡 Wpisz nazwę, NIP (10 cyfr) lub REGON (9 cyfr)';
                hint.style.color = '#95a5a6';
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
        
        statusDiv.style.display = 'block';
        statusDiv.style.background = '#F8FAFC';
        statusDiv.style.color = '#1E40AF';
        statusDiv.innerHTML = '🔍 Analizuję dane i pobieram informacje...';
        
        console.log('🚀 Smart Start - Input:', input, 'Type:', partyType, 'Case ID:', this.currentCaseId);
        
        try {
            // Sprawdź czy to NIP/REGON/KRS
            const cleanValue = input.replace(/[-\s]/g, '');
            let lookupData = null;
            let name = input;
            
            if (/^\d{10}$/.test(cleanValue)) {
                // NIP - używamy CEIDG API
                console.log('✅ Wykryto NIP:', cleanValue);
                statusDiv.innerHTML = '🔍 Wykryto NIP - pobieranie danych z CEIDG...';
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
                statusDiv.innerHTML = '🔍 Wykryto REGON - pobieranie danych...';
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
                statusDiv.innerHTML = 'ℹ️ Wykryto KRS - użyj przycisku "Wyszukiwarka KRS" aby pobrać dane';
                // NIE POBIERAMY - user musi użyć przycisku KRS
                name = input; // Używamy wpisanej wartości jako nazwy
            } else {
                console.log('ℹ️ Nie wykryto NIP/REGON/KRS, używam jako nazwa:', input);
            }
            
            // Rozpocznij analizę
            statusDiv.innerHTML = '✅ Tworzenie analizy...';
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
                    statusDiv.innerHTML = '💾 Zapisywanie pobranych danych...';
                    const updateResponse = await window.api.request(`/opposing-analysis/${this.currentOpposingId}`, {
                        method: 'PUT',
                        body: lookupData
                    });
                    console.log('✅ Odpowiedź z PUT:', updateResponse);
                } else {
                    console.log('ℹ️ Brak danych z lookup do zapisania');
                }
                
                statusDiv.style.background = '#F8FAFC';
                statusDiv.style.color = '#2e7d32';
                statusDiv.innerHTML = '🎉 Dane pobrane i zapisane! Otwieranie analizy...';
                
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
            statusDiv.style.background = '#ffebee';
            statusDiv.style.color = '#c62828';
            statusDiv.innerHTML = `❌ Błąd: ${error.message || 'Sprawdź połączenie'}`;
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
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 30px; border-radius: 12px 12px 0 0; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div style="flex: 1;">
                            <h2 style="margin: 0; font-size: 1.5rem;">🕵️ Analiza: ${this.data.opposing.name}</h2>
                            <p style="margin: 5px 0 0 0; opacity: 0.9;">Krok ${this.currentStep}/7: ${currentStepData.name}</p>
                        </div>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <button onclick="window.opposingAnalysisModule.deleteAnalysis()" style="
                                padding: 10px 20px;
                                background: rgba(231, 76, 60, 0.9);
                                color: white;
                                border: 2px solid rgba(255,255,255,0.3);
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 600;
                                font-size: 0.9rem;
                                transition: all 0.3s;
                            " onmouseover="this.style.background='#1E40AF'" onmouseout="this.style.background='rgba(231, 76, 60, 0.9)'">
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
                                    color: ${step.num <= this.currentStep ? '#3B82F6' : 'white'};
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
                    <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; color: white;">
                        <h4 style="margin: 0 0 20px 0; font-size: 1.4rem;">🔍 WYSZUKIWARKI API - WERYFIKACJA FIRMY</h4>
                        <p style="margin-bottom: 20px; opacity: 0.95;">Użyj wyszukiwarek API aby automatycznie pobrać pełne dane firmy i wypełnić formularz</p>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <!-- KRS Search -->
                            <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 8px;">
                                <h5 style="margin: 0 0 15px 0; font-size: 1.1rem;">🏢 Wyszukaj w KRS</h5>
                                <input type="text" id="krs_number_input" placeholder="Numer KRS (10 cyfr)" maxlength="10" style="width: 100%; padding: 12px; border: none; border-radius: 6px; margin-bottom: 10px; color: #333;">
                                <button onclick="window.opposingAnalysisModule.searchKRS()" style="width: 100%; padding: 12px; background: white; color: #1E40AF; border: none; border-radius: 6px; font-weight: 700; cursor: pointer;">
                                    🔍 Szukaj
                                </button>
                                <div id="krs_results" style="margin-top: 15px;"></div>
                            </div>
                            
                            <!-- CEIDG Search -->
                            <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 8px;">
                                <h5 style="margin: 0 0 15px 0; font-size: 1.1rem;">👤 Wyszukaj w CEIDG</h5>
                                <input type="text" id="ceidg_nip_input" placeholder="NIP (10 cyfr)" maxlength="10" style="width: 100%; padding: 12px; border: none; border-radius: 6px; margin-bottom: 10px; color: #333;">
                                <button onclick="window.opposingAnalysisModule.searchCEIDG()" style="width: 100%; padding: 12px; background: white; color: #1E40AF; border: none; border-radius: 6px; font-weight: 700; cursor: pointer;">
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
                        background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                        color: white;
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
            statusDiv.style.background = '#F8FAFC';
            statusDiv.style.color = '#1E40AF';
            statusDiv.innerHTML = '🔍 Pobieranie danych...';
        }
        
        try {
            const response = await window.api.request(`/opposing-analysis/lookup/${type}/${cleanValue}`);
            
            if (response.success && response.data) {
                // Wypełnij pola automatycznie
                this.fillFormData(response.data);
                
                if (statusDiv) {
                    statusDiv.style.background = '#F8FAFC';
                    statusDiv.style.color = '#2e7d32';
                    statusDiv.innerHTML = '✅ Dane uzupełnione automatycznie!';
                    setTimeout(() => {
                        statusDiv.style.display = 'none';
                    }, 3000);
                }
                
                window.showNotification('✅ Dane firmy pobrane automatycznie!', 'success');
            } else {
                if (statusDiv) {
                    statusDiv.style.background = '#F8FAFC';
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
                field.style.background = '#F8FAFC';
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
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 4px solid #3B82F6;">
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
                        <div style="background: #F8FAFC; padding: 20px; border-radius: 10px; border-left: 4px solid #3B82F6;">
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
                        
                        <!-- Smart Buttons -->
                        <div style="background: #F8FAFC; padding: 20px; border-radius: 10px;">
                            <h4 style="margin: 0 0 15px 0; color: #1E40AF;">🔍 Sprawdź zadłużenie:</h4>
                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                <button onclick="window.open('https://www.krd.pl/Kontakt/Wyszukiwarka-danych', '_blank')" 
                                    style="padding: 10px 20px; background: white; border: 2px solid #1E40AF; color: #1E40AF; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                    📊 KRD - Krajowy Rejestr Długów
                                </button>
                                <button onclick="window.open('https://www.big.pl/dla-wierzycieli/bazy-danych/', '_blank')" 
                                    style="padding: 10px 20px; background: white; border: 2px solid #1E40AF; color: #1E40AF; border-radius: 8px; cursor: pointer; font-weight: 600;">
                                    📈 BIG InfoMonitor
                                </button>
                            </div>
                            <p style="margin: 15px 0 0 0; font-size: 0.9rem; color: #1E40AF;">
                                💡 Sprawdź czy firma/osoba ma zadłużenie w rejestrach
                            </p>
                        </div>
                    </div>
                ` : `
                    <div style="background: #F8FAFC; padding: 30px; border-radius: 10px; text-align: center;">
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
                        background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                        color: white;
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
                <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 15px 0; color: white;">🚀 Social Media OSINT</h4>
                    <button onclick="window.opposingAnalysisModule.searchSocialMediaApify('${data.name || ''}')" 
                        style="width: 100%; padding: 15px; background: white; color: #3B82F6; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1.1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.2); transition: all 0.3s;"
                        onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)'">
                        🔍 Przeszukaj naszą bazę
                    </button>
                    <p style="margin: 10px 0 0 0; font-size: 0.85rem; color: white; opacity: 0.9;">
                        💡 Automatycznie znajdziemy: red flags, skargi, potencjalnych świadków, sentiment
                    </p>
                </div>
                
                <!-- Smart Search Buttons -->
                <div style="background: #F8FAFC; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    <h4 style="margin: 0 0 15px 0; color: #1E40AF;">🔍 Wyszukaj w mediach społecznościowych:</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                        <button onclick="window.open('https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(data.name || '')}', '_blank')" 
                            style="padding: 12px; background: #0077b5; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            💼 LinkedIn
                        </button>
                        <button onclick="window.open('https://www.facebook.com/search/top?q=${encodeURIComponent(data.name || '')}', '_blank')" 
                            style="padding: 12px; background: #1877f2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            👥 Facebook
                        </button>
                        <button onclick="window.open('https://twitter.com/search?q=${encodeURIComponent(data.name || '')}', '_blank')" 
                            style="padding: 12px; background: #1da1f2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            🐦 Twitter/X
                        </button>
                        <button onclick="window.open('https://www.google.com/search?q=${encodeURIComponent((data.name || '') + ' opinie recenzje')}', '_blank')" 
                            style="padding: 12px; background: #34a853; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
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
                        background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                        color: white;
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
                <div style="background: #F8FAFC; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                    <h4 style="margin: 0 0 15px 0; color: #1E40AF;">🔍 Sprawdź w rejestrach sądowych:</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
                        <button onclick="window.open('https://orzeczenia.ms.gov.pl/', '_blank')" 
                            style="padding: 12px; background: white; border: 2px solid #1E40AF; color: #1E40AF; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            ⚖️ Orzeczenia Sądów Powszechnych
                        </button>
                        <button onclick="window.open('https://www.saos.org.pl/', '_blank')" 
                            style="padding: 12px; background: white; border: 2px solid #1E40AF; color: #1E40AF; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            📚 SAOS - Otwarte Orzecznictwo
                        </button>
                    </div>
                    <p style="margin: 15px 0 0 0; font-size: 0.9rem; color: #1E40AF;">
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
                        background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                        color: white;
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
                        background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                        color: white;
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
                        background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                        color: white;
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
                    <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 20px; border-radius: 10px;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">📊</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">Postęp analizy</div>
                        <div style="font-size: 2rem; font-weight: bold; margin-top: 10px;">100%</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #3B82F6 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 10px;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">⚠️</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">Red Flags</div>
                        <div style="font-size: 2rem; font-weight: bold; margin-top: 10px;">-</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #60A5FA 0%, #60A5FA 100%); color: white; padding: 20px; border-radius: 10px;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">📄</div>
                        <div style="font-size: 0.9rem; opacity: 0.9;">Zebrane dane</div>
                        <div style="font-size: 2rem; font-weight: bold; margin-top: 10px;">7/7</div>
                    </div>
                </div>
                
                <!-- AI Analysis Button -->
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
                    <h4 style="margin: 0 0 15px 0; color: white; font-size: 1.3rem;">🤖 Analiza AI</h4>
                    <p style="color: rgba(255,255,255,0.9); margin-bottom: 20px;">
                        Kliknij aby wygenerować raport AI z wykryciem ryzyk, red flags i rekomendacji
                    </p>
                    <button onclick="window.opposingAnalysisModule.generateAIReport()" style="
                        padding: 15px 40px;
                        background: white;
                        color: #3B82F6;
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
                        color: white;
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
    renderDashboard() { return '<div>Dashboard - Coming soon...</div>'; },
    
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
                        <h5 style="color: #3B82F6; margin: 0 0 10px 0;">⚠️ Red Flags:</h5>
                        <ul style="margin: 0; padding-left: 20px;">
                            ${response.report.redFlags.map(flag => `<li>${flag}</li>`).join('')}
                        </ul>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <h5 style="color: #3B82F6; margin: 0 0 10px 0;">✅ Pozytywne aspekty:</h5>
                        <ul style="margin: 0; padding-left: 20px;">
                            ${response.report.positives.map(pos => `<li>${pos}</li>`).join('')}
                        </ul>
                    </div>
                    <div>
                        <h5 style="color: #3B82F6; margin: 0 0 10px 0;">💡 Rekomendacje:</h5>
                        <ul style="margin: 0; padding-left: 20px;">
                            ${response.report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                `;
                window.showNotification('✅ Raport AI wygenerowany!', 'success');
            }
        } catch (error) {
            console.error('❌ Błąd generowania raportu:', error);
            content.innerHTML = '<div style="color: #3B82F6;">❌ Błąd generowania raportu. Spróbuj ponownie.</div>';
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
                <div style="position: sticky; top: 0; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; padding: 20px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center; z-index: 1;">
                    <h2 style="margin: 0;">🔍 Social Media OSINT: ${companyName}</h2>
                    <button onclick="document.getElementById('socialMediaModal').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; font-size: 24px; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">×</button>
                </div>
                <div id="socialMediaResults" style="padding: 20px;">
                    <div style="text-align: center; padding: 40px;">
                        <div style="width: 50px; height: 50px; border: 5px solid #3B82F6; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
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
            <div style="background: linear-gradient(135deg, #F8FAFC, #E2E8F0); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0; color: #1b5e20; font-weight: 700;">✅ Wyniki dla: ${data.query}</h3>
                <p style="margin: 0; color: #2e7d32; font-size: 1.1rem;"><strong>Znaleziono:</strong> ${data.totalPosts} postów</p>
                <p style="margin: 5px 0 0 0; color: #2e7d32;"><strong>Sentiment:</strong> 
                    ${data.sentiment === 'negative' ? '😟 Negatywny' : data.sentiment === 'positive' ? '😊 Pozytywny' : '😐 Neutralny'}
                </p>
            </div>
        `;
        
        // Red Flags
        if (data.redFlags && data.redFlags.length > 0) {
            html += `<h3 style="color: #3B82F6;">🚨 Red Flags (${data.redFlags.length})</h3>`;
            data.redFlags.forEach(flag => {
                const searchQuery = encodeURIComponent(`${flag.author} ${flag.keyword} ${flag.text.substring(0, 30)}`);
                const fbSearchUrl = `https://www.facebook.com/search/posts?q=${searchQuery}`;
                
                html += `
                    <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #3B82F6;">
                        <strong style="color: #3B82F6;">🚩 ${flag.keyword}</strong><br>
                        <p style="margin: 10px 0;">${flag.text.substring(0, 200)}...</p>
                        <small style="color: #666;">Autor: ${flag.author}</small><br>
                        <a href="${fbSearchUrl}" target="_blank" style="color: #3B82F6; text-decoration: none; font-weight: 600;">🔍 Szukaj na FB →</a>
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
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 3px solid #3B82F6;">
                        <strong style="color: #1565c0; font-size: 1.05rem;">${post.author}</strong> <span style="color: #757575;">w ${post.groupName}</span><br>
                        <p style="margin: 10px 0; color: #212121; line-height: 1.5;">${post.text.substring(0, 150)}${post.text.length > 150 ? '...' : ''}</p>
                        <small style="color: #616161; font-weight: 600;">👍 ${post.likes} | 💬 ${post.comments} | 🔄 ${post.shares}</small><br>
                        <a href="${fbSearchUrl}" target="_blank" style="color: #3B82F6; text-decoration: none; font-weight: 700; font-size: 0.95rem;">🔍 Szukaj na FB →</a>
                    </div>
                `;
            });
            
            if (data.posts.length > 10) {
                html += `<p style="text-align: center; color: #999;">Pokazano 10 z ${data.posts.length} postów</p>`;
            }
        }
        
        if (data.totalPosts === 0) {
            html += `
                <div style="text-align: center; padding: 40px; background: #F8FAFC; border-radius: 8px;">
                    <h3 style="color: #1565c0; font-weight: 700;">🔍 Nie znaleziono postów</h3>
                    <p style="color: #1E40AF; font-size: 1.05rem;">Brak wzmianek o tej firmie w monitorowanych grupach Facebook.</p>
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
    
    resultsDiv.innerHTML = '<div style="padding: 15px; text-align: center; color: #3B82F6;">⏳ Pobieranie danych z KRS...</div>';
    
    try {
        const response = await fetch('https://web-production-ef868.up.railway.app/api/company/krs/full', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ krs: krsNumber })
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            const company = data.data;
            let html = `
                <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6;">
                    <h4 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 1.2rem;">✅ ${company.nazwa}</h4>
                    <div style="display: grid; gap: 10px;">
                        ${company.nip ? `<div><strong>NIP:</strong> ${company.nip}</div>` : ''}
                        ${company.regon ? `<div><strong>REGON:</strong> ${company.regon}</div>` : ''}
                        ${company.adres?.pelny ? `<div><strong>Adres:</strong> ${company.adres.pelny}</div>` : ''}
                        ${company.kapital?.wysokosc ? `<div><strong>Kapitał:</strong> ${company.kapital.wysokosc.toLocaleString('pl-PL')} ${company.kapital.waluta}</div>` : ''}
                    </div>
                    <button onclick="window.opposingAnalysisModule.autoFillFromKRS('${krsNumber}')" style="margin-top: 15px; padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        ✅ Wypełnij formularz automatycznie
                    </button>
                </div>
            `;
            
            if (company.zarzad && company.zarzad.length > 0) {
                html += `
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px; border: 2px solid #e0e0e0;">
                        <h5 style="margin: 0 0 10px 0; color: #1a2332;">👥 Zarząd (${company.zarzad.length}):</h5>
                        ${company.zarzad.map(z => `<div style="padding: 8px; background: #f5f5f5; border-radius: 4px; margin-bottom: 5px;">${z.imiona} ${z.nazwisko} - ${z.funkcja}</div>`).join('')}
                    </div>
                `;
            }
            
            resultsDiv.innerHTML = html;
            
            // Zapisz dane do cache dla auto-fill
            window.opposingAnalysisModule.cachedKRSData = company;
        } else {
            resultsDiv.innerHTML = '<div style="padding: 15px; background: #F8FAFC; border-radius: 8px; color: #666;">⚠️ Nie znaleziono firmy w KRS</div>';
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
    
    resultsDiv.innerHTML = '<div style="padding: 15px; text-align: center; color: #3B82F6;">⏳ Pobieranie danych z CEIDG...</div>';
    
    try {
        const response = await fetch('https://web-production-ef868.up.railway.app/api/company/ceidg/nip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nip: nip })
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
            const firma = data.data;
            const statusColors = { 'AKTYWNY': '#3B82F6', 'ZAWIESZONA': '#3B82F6', 'WYKREŚLONA': '#f44336' };
            const statusColor = statusColors[firma.status] || '#999';
            
            let html = `
                <div style="background: #F8FAFC; padding: 20px; border-radius: 8px; border-left: 4px solid ${statusColor};">
                    <h4 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 1.2rem;">✅ ${firma.nazwa}</h4>
                    <div style="display: grid; gap: 10px;">
                        <div><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: 600;">${firma.status}</span></div>
                        ${firma.nip ? `<div><strong>NIP:</strong> ${firma.nip}</div>` : ''}
                        ${firma.adres ? `<div><strong>Adres:</strong> ${firma.adres}</div>` : ''}
                    </div>
                    <button onclick="window.opposingAnalysisModule.autoFillFromCEIDG('${nip}')" style="margin-top: 15px; padding: 10px 20px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        ✅ Wypełnij formularz automatycznie
                    </button>
                </div>
            `;
            resultsDiv.innerHTML = html;
            window.opposingAnalysisModule.cachedCEIDGData = firma;
        } else {
            resultsDiv.innerHTML = '<div style="padding: 15px; background: #F8FAFC; border-radius: 8px; color: #666;">⚠️ Nie znaleziono w CEIDG</div>';
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

console.log('✅ Unified Opposing Party Module loaded');

