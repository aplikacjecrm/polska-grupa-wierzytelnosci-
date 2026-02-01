// ==========================================
// RENDERER ANKIET + PROCEDUR
// ==========================================

console.log('🎨 Questionnaire Renderer v71 - FIXED: Naprawiono strukturę nagłówka ankiety!');

window.questionnaireRenderer = {
    
    currentQuestionnaire: null,
    currentCaseId: null,
    currentQuestionnaireType: null,
    answers: {},
    
    // Uniwersalna funkcja do otwierania ankiet
    async openQuestionnaire(caseId, type = 'bankruptcy') {
        console.log(`📋 Otwieranie ankiety typu: ${type} dla sprawy: ${caseId}`);
        
        // Wybierz odpowiednią ankietę
        if (type === 'bankruptcy' || type === 'upadlosc') {
            this.currentQuestionnaire = window.bankruptcyQuestionnaire;
            this.currentQuestionnaireType = 'bankruptcy';
        } else if (type === 'restructuring' || type === 'restrukturyzacja') {
            this.currentQuestionnaire = window.restructuringQuestionnaire;
            this.currentQuestionnaireType = 'restructuring';
        } else if (type === 'compensation' || type === 'odszkodowanie') {
            // Dla compensation - czekaj na załadowanie jeśli trzeba
            if (!window.compensationQuestionnaire) {
                console.log('⏳ Czekam na załadowanie ankiety compensation...');
                // Czekaj max 5 sekund
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (window.compensationQuestionnaire) {
                        console.log('✅ Ankieta compensation załadowana!');
                        break;
                    }
                }
            }
            this.currentQuestionnaire = window.compensationQuestionnaire;
            this.currentQuestionnaireType = 'compensation';
        } else if (type === 'debt_collection' || type === 'windykacja') {
            // Dla windykacji - czekaj na załadowanie jeśli trzeba
            if (!window.debtCollectionQuestionnaire) {
                console.log('⏳ Czekam na załadowanie ankiety windykacyjnej...');
                // Czekaj max 5 sekund
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (window.debtCollectionQuestionnaire) {
                        console.log('✅ Ankieta windykacyjna załadowana!');
                        break;
                    }
                }
            }
            this.currentQuestionnaire = window.debtCollectionQuestionnaire;
            this.currentQuestionnaireType = 'debt_collection';
        } else if (type === 'criminal' || type === 'karna') {
            // Dla ankiety karnej - czekaj na załadowanie jeśli trzeba
            console.log('🚔 Rozpoznano typ CRIMINAL/KARNA');
            if (!window.criminalQuestionnaire) {
                console.log('⏳ Czekam na załadowanie ankiety karnej...');
                // Czekaj max 5 sekund
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (window.criminalQuestionnaire) {
                        console.log('✅ Ankieta karna załadowana!');
                        break;
                    }
                }
            }
            this.currentQuestionnaire = window.criminalQuestionnaire;
            this.currentQuestionnaireType = 'criminal';
            console.log('✅ Ustawiono currentQuestionnaire na criminalQuestionnaire');
            console.log('✅ Ustawiono currentQuestionnaireType na "criminal"');
        } else if (type === 'commercial' || type === 'gospodarcza') {
            // Dla ankiety gospodarczej - czekaj na załadowanie jeśli trzeba
            console.log('💼 Rozpoznano typ COMMERCIAL/GOSPODARCZA');
            if (!window.commercialQuestionnaire) {
                console.log('⏳ Czekam na załadowanie ankiety gospodarczej...');
                // Czekaj max 5 sekund
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (window.commercialQuestionnaire) {
                        console.log('✅ Ankieta gospodarcza załadowana!');
                        break;
                    }
                }
            }
            this.currentQuestionnaire = window.commercialQuestionnaire;
            this.currentQuestionnaireType = 'commercial';
            console.log('✅ Ustawiono currentQuestionnaire na commercialQuestionnaire');
            console.log('✅ Ustawiono currentQuestionnaireType na "commercial"');
        } else if (type === 'inheritance' || type === 'spadkowa') {
            // Dla ankiety spadkowej - czekaj na załadowanie jeśli trzeba
            console.log('🎗️ Rozpoznano typ INHERITANCE/SPADKOWA');
            if (!window.inheritanceQuestionnaire) {
                console.log('⏳ Czekam na załadowanie ankiety spadkowej...');
                // Czekaj max 5 sekund
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (window.inheritanceQuestionnaire) {
                        console.log('✅ Ankieta spadkowa załadowana!');
                        break;
                    }
                }
            }
            this.currentQuestionnaire = window.inheritanceQuestionnaire;
            this.currentQuestionnaireType = 'inheritance';
            console.log('✅ Ustawiono currentQuestionnaire na inheritanceQuestionnaire');
            console.log('✅ Ustawiono currentQuestionnaireType na "inheritance"');
        } else if (type === 'property' || type === 'majątkowa') {
            // Dla ankiety majątkowej - czekaj na załadowanie jeśli trzeba
            console.log('🏠 Rozpoznano typ PROPERTY/MAJĄTKOWA');
            if (!window.propertyQuestionnaire) {
                console.log('⏳ Czekam na załadowanie ankiety majątkowej...');
                // Czekaj max 5 sekund
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (window.propertyQuestionnaire) {
                        console.log('✅ Ankieta majątkowa załadowana!');
                        break;
                    }
                }
            }
            this.currentQuestionnaire = window.propertyQuestionnaire;
            this.currentQuestionnaireType = 'property';
            console.log('✅ Ustawiono currentQuestionnaire na propertyQuestionnaire');
            console.log('✅ Ustawiono currentQuestionnaireType na "property"');
            console.log('🔍 propertyQuestionnaire:', {
                exists: !!window.propertyQuestionnaire,
                sections: window.propertyQuestionnaire?.sections?.length,
                procedure: !!window.propertyQuestionnaire?.procedure,
                documents: window.propertyQuestionnaire?.requiredDocuments?.length
            });
        } else if (type === 'contract' || type === 'umowna') {
            // Dla ankiety umownej - czekaj na załadowanie jeśli trzeba
            console.log('📄 Rozpoznano typ CONTRACT/UMOWNA');
            if (!window.contractQuestionnaire) {
                console.log('⏳ Czekam na załadowanie ankiety umownej...');
                // Czekaj max 5 sekund
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (window.contractQuestionnaire) {
                        console.log('✅ Ankieta umowna załadowana!');
                        break;
                    }
                }
            }
            this.currentQuestionnaire = window.contractQuestionnaire;
            this.currentQuestionnaireType = 'contract';
            console.log('✅ Ustawiono currentQuestionnaire na contractQuestionnaire');
            console.log('✅ Ustawiono currentQuestionnaireType na "contract"');
        } else if (type === 'family' || type === 'rodzinna') {
            // Dla ankiety rodzinnej - czekaj na załadowanie jeśli trzeba
            console.log('👨‍👩‍👧‍👦 Rozpoznano typ FAMILY/RODZINNA');
            if (!window.familyQuestionnaire) {
                console.log('⏳ Czekam na załadowanie ankiety rodzinnej...');
                // Czekaj max 5 sekund
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (window.familyQuestionnaire) {
                        console.log('✅ Ankieta rodzinna załadowana!');
                        break;
                    }
                }
            }
            this.currentQuestionnaire = window.familyQuestionnaire;
            this.currentQuestionnaireType = 'family';
            console.log('✅ Ustawiono currentQuestionnaire na familyQuestionnaire');
            console.log('✅ Ustawiono currentQuestionnaireType na "family"');
        } else if (type === 'building' || type === 'budowlana') {
            // Dla ankiety budowlanej - czekaj na załadowanie jeśli trzeba
            console.log('🏗️ Rozpoznano typ BUILDING/BUDOWLANA');
            if (!window.buildingQuestionnaire) {
                console.log('⏳ Czekam na załadowanie ankiety budowlanej...');
                // Czekaj max 5 sekund
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (window.buildingQuestionnaire) {
                        console.log('✅ Ankieta budowlana załadowana!');
                        break;
                    }
                }
            }
            this.currentQuestionnaire = window.buildingQuestionnaire;
            this.currentQuestionnaireType = 'building';
            console.log('✅ Ustawiono currentQuestionnaire na buildingQuestionnaire');
            console.log('✅ Ustawiono currentQuestionnaireType na "building"');
        } else if (type === 'tax' || type === 'podatkowa') {
            // Dla ankiety podatkowej - czekaj na załadowanie jeśli trzeba
            console.log('🔥 Rozpoznano typ TAX/PODATKOWA');
            if (!window.taxQuestionnaire) {
                console.log('⏳ Czekam na załadowanie ankiety podatkowej...');
                // Czekaj max 5 sekund
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (window.taxQuestionnaire) {
                        console.log('✅ Ankieta podatkowa załadowana!');
                        break;
                    }
                }
            }
            this.currentQuestionnaire = window.taxQuestionnaire;
            this.currentQuestionnaireType = 'tax';
            console.log('✅ Ustawiono currentQuestionnaire na taxQuestionnaire');
            console.log('✅ Ustawiono currentQuestionnaireType na "tax"');
        } else if (type === 'zoning' || type === 'zagospodarowanie') {
            // Dla ankiety zagospodarowania - czekaj na załadowanie jeśli trzeba
            console.log('🗺️ Rozpoznano typ ZONING/ZAGOSPODAROWANIE');
            if (!window.zoningQuestionnaire) {
                console.log('⏳ Czekam na załadowanie ankiety zagospodarowania...');
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (window.zoningQuestionnaire) {
                        console.log('✅ Ankieta zagospodarowania załadowana!');
                        break;
                    }
                }
            }
            this.currentQuestionnaire = window.zoningQuestionnaire;
            this.currentQuestionnaireType = 'zoning';
            console.log('✅ Ustawiono currentQuestionnaire na zoningQuestionnaire');
            console.log('✅ Ustawiono currentQuestionnaireType na "zoning"');
        } else if (type === 'international' || type === 'miedzynarodowe' || type === 'european' || type === 'arbitration') {
            // Dla ankiety międzynarodowej - czekaj na załadowanie jeśli trzeba
            console.log('🌍 Rozpoznano typ INTERNATIONAL/EUROPEAN/ARBITRATION');
            if (!window.internationalQuestionnaire) {
                console.log('⏳ Czekam na załadowanie ankiety międzynarodowej...');
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (window.internationalQuestionnaire) {
                        console.log('✅ Ankieta międzynarodowa załadowana!');
                        break;
                    }
                }
            }
            this.currentQuestionnaire = window.internationalQuestionnaire;
            this.currentQuestionnaireType = 'international';
            console.log('✅ Ustawiono currentQuestionnaire na internationalQuestionnaire');
            console.log('✅ Ustawiono currentQuestionnaireType na "international"');
        } else if (type === 'special' || type === 'maritime' || type === 'energy' || type === 'renewable' || type === 'aviation' || type === 'it') {
            // Dla ankiety prawa specjalnego - czekaj na załadowanie jeśli trzeba
            console.log('⚡ Rozpoznano typ SPECIAL (maritime/energy/renewable/aviation/it)');
            if (!window.specialQuestionnaire) {
                console.log('⏳ Czekam na załadowanie ankiety prawa specjalnego...');
                for (let i = 0; i < 50; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (window.specialQuestionnaire) {
                        console.log('✅ Ankieta prawa specjalnego załadowana!');
                        break;
                    }
                }
            }
            this.currentQuestionnaire = window.specialQuestionnaire;
            this.currentQuestionnaireType = 'special';
            console.log('✅ Ustawiono currentQuestionnaire na specialQuestionnaire');
            console.log('✅ Ustawiono currentQuestionnaireType na "special"');
        } else {
            console.error('❌ Nieznany typ ankiety:', type);
            alert('Błąd: nieznany typ ankiety!');
            return;
        }
        
        if (!this.currentQuestionnaire) {
            console.error('❌ Ankieta nie załadowana!', {
                type: type,
                bankruptcy: !!window.bankruptcyQuestionnaire,
                restructuring: !!window.restructuringQuestionnaire,
                compensation: !!window.compensationQuestionnaire,
                debt_collection: !!window.debtCollectionQuestionnaire,
                criminal: !!window.criminalQuestionnaire,
                commercial: !!window.commercialQuestionnaire,
                inheritance: !!window.inheritanceQuestionnaire,
                property: !!window.propertyQuestionnaire
            });
            console.error('🔍 Szczegóły propertyQuestionnaire:', window.propertyQuestionnaire);
            alert(`Błąd: ankieta ${type} nie została załadowana!\n\nOdśwież stronę (Ctrl+Shift+R) i spróbuj ponownie.`);
            return;
        }
        
        this.currentCaseId = caseId;
        await this.renderBankruptcyQuestionnaire(caseId);
    },
    
    // Renderuj ankietę (uniwersalna)
    async renderBankruptcyQuestionnaire(caseId) {
        this.currentCaseId = caseId;
        // NIE nadpisuj currentQuestionnaire - jest już ustawiona w openQuestionnaire()!
        if (!this.currentQuestionnaire) {
            console.warn('⚠️ currentQuestionnaire nie jest ustawiona, używam bankruptcy jako fallback');
            this.currentQuestionnaire = window.bankruptcyQuestionnaire;
        }
        
        // Załaduj istniejące odpowiedzi (jeśli są)
        await this.loadAnswers(caseId);
        
        const modal = document.createElement('div');
        modal.id = 'bankruptcyQuestionnaireModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            z-index: 10002;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            overflow-y: auto;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                max-width: 1200px;
                width: 100%;
                max-height: 95vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            ">
                <!-- Header -->
                <div style="
                    background: linear-gradient(135deg, #1a2332, #2c3e50);
                    padding: 30px;
                    border-radius: 16px 16px 0 0;
                    color: white;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    border-bottom: 3px solid #FFD700;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.8rem;">${this.currentQuestionnaireType === 'criminal' ? '🚔 ANKIETA KARNA' : this.currentQuestionnaireType === 'restructuring' ? '🏢 ANKIETA RESTRUKTURYZACYJNA' : this.currentQuestionnaireType === 'compensation' ? '💰 ANKIETA ODSZKODOWAWCZA' : this.currentQuestionnaireType === 'debt_collection' ? '📜 ANKIETA WINDYKACYJNA' : this.currentQuestionnaireType === 'commercial' ? '💼 UMOWA GOSPODARCZA' : this.currentQuestionnaireType === 'inheritance' ? '🎗️ ANKIETA SPADKOWA' : this.currentQuestionnaireType === 'property' ? '🏠 ANKIETA MAJĄTKOWA' : this.currentQuestionnaireType === 'contract' ? '📄 ANKIETA UMOWNA' : this.currentQuestionnaireType === 'family' ? '👨‍👩‍👧‍👦 ANKIETA RODZINNA' : this.currentQuestionnaireType === 'building' ? '🏭️ ANKIETA BUDOWLANA' : this.currentQuestionnaireType === 'tax' ? '🔥 ANKIETA PODATKOWA' : this.currentQuestionnaireType === 'zoning' ? '🗺️ ANKIETA ZAGOSPODAROWANIA' : this.currentQuestionnaireType === 'international' ? '🌍 ANKIETA MIĘDZYNARODOWA' : this.currentQuestionnaireType === 'special' ? '⚡ ANKIETA PRAWA SPECJALNEGO' : '🏛️ ANKIETA UPADŁOŚCIOWA'}</h2>
                            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.95rem;">Wypełnij wszystkie wymagane pola</p>
                        </div>
                        <button onclick="document.getElementById('bankruptcyQuestionnaireModal').remove()" style="
                            background: rgba(255,255,255,0.2);
                            border: none;
                            color: white;
                            width: 45px;
                            height: 45px;
                            border-radius: 50%;
                            cursor: pointer;
                            font-size: 1.5rem;
                            font-weight: bold;
                            transition: all 0.3s;
                        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
                    </div>
                    
                    <!-- Progress Bar - WYŁĄCZONY (nie działał poprawnie) -->
                    <div style="margin-top: 20px; display: none;">
                        <div style="background: rgba(255,255,255,0.3); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div id="progressBar" style="background: white; height: 100%; width: 0%; transition: width 0.3s;"></div>
                        </div>
                        <p id="progressText" style="margin: 10px 0 0 0; font-size: 0.9rem; opacity: 0.9;">Postęp: 0% (0/7 sekcji)</p>
                    </div>
                </div>
                
                <!-- Content -->
                <div style="padding: 30px;">
                    
                    <!-- Tabs -->
                    <div id="questionnaireTabs" style="
                        display: flex;
                        gap: 10px;
                        margin-bottom: 30px;
                        overflow-x: auto;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #d4af37;
                    ">
                        <button onclick="window.questionnaireRenderer.showTab('questionnaire')" class="tab-btn active" data-tab="questionnaire" style="
                            padding: 12px 20px;
                            border: 2px solid #d4af37;
                            border-bottom: 3px solid #d4af37;
                            background: #d4af37;
                            color: white;
                            border-radius: 8px 8px 0 0;
                            cursor: pointer;
                            font-weight: 600;
                            white-space: nowrap;
                            outline: none;
                        ">📋 Ankieta</button>
                        
                        <button onclick="window.questionnaireRenderer.showTab('procedure')" class="tab-btn" data-tab="procedure" style="
                            padding: 12px 20px;
                            border: 2px solid #d4af37;
                            background: white;
                            color: #d4af37;
                            border-radius: 8px 8px 0 0;
                            cursor: pointer;
                            font-weight: 600;
                            white-space: nowrap;
                            outline: none;
                        ">📅 Procedura</button>
                        
                        <button onclick="window.questionnaireRenderer.showTab('documents')" class="tab-btn" data-tab="documents" style="
                            padding: 12px 20px;
                            border: 2px solid #d4af37;
                            background: white;
                            color: #d4af37;
                            outline: none;
                            border-radius: 8px 8px 0 0;
                            cursor: pointer;
                            font-weight: 600;
                            white-space: nowrap;
                        ">📄 Dokumenty</button>
                    </div>
                    
                    <!-- Tab Content: Ankieta -->
                    <div id="tab-questionnaire" class="tab-content">
                        <div id="questionnaireContent"></div>
                    </div>
                    
                    <!-- Tab Content: Procedura -->
                    <div id="tab-procedure" class="tab-content" style="display: none;">
                        <div id="procedureContent"></div>
                    </div>
                    
                    <!-- Tab Content: Syndyk -->
                    <div id="tab-trustee" class="tab-content" style="display: none;">
                        <div id="trusteeContent"></div>
                    </div>
                    
                    <!-- Tab Content: Dokumenty -->
                    <div id="tab-documents" class="tab-content" style="display: none;">
                        <div id="documentsContent"></div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="
                        display: flex;
                        gap: 15px;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 2px solid #e0e0e0;
                    ">
                        <button onclick="document.getElementById('bankruptcyQuestionnaireModal').remove()" style="
                            flex: 1;
                            padding: 15px;
                            background: #95a5a6;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 700;
                            font-size: 1rem;
                        ">Anuluj</button>
                        
                        <button onclick="window.questionnaireRenderer.saveAnswers()" style="
                            flex: 2;
                            padding: 15px;
                            background: linear-gradient(135deg, #FFD700, #d4af37);
                            color: #1a2332;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 700;
                            font-size: 1rem;
                        ">💾 Zapisz ankietę</button>
                    </div>
                    
                    <p style="text-align: center; color: #666; margin-top: 15px; font-size: 0.9rem;">
                        💾 Automatyczny zapis co 30 sekund
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Renderuj zawartość zakładek
        this.renderQuestionnaireTab();
        this.renderProcedureTab();
        
        // Zakładka Syndyk tylko dla bankruptcy
        if (this.currentQuestionnaireType === 'bankruptcy') {
            this.renderTrusteeTab();
        }
        
        this.renderDocumentsTab();
        
        // Auto-save co 30 sekund
        this.startAutoSave();
    },
    
    // Przełączanie zakładek
    showTab(tabName) {
        // Ukryj wszystkie contenty
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => tab.style.display = 'none');
        
        // Pokaż wybraną
        document.getElementById(`tab-${tabName}`).style.display = 'block';
        
        // Złoty kolor Pro Meritum dla wszystkich ankiet
        const activeColor = '#d4af37';
        
        // Zmień style przycisków
        const buttons = document.querySelectorAll('.tab-btn');
        buttons.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.style.background = activeColor;
                btn.style.color = 'white';
                btn.style.borderBottom = '3px solid ' + activeColor;
            } else {
                btn.style.background = 'white';
                btn.style.color = activeColor;
                btn.style.borderBottom = '2px solid ' + activeColor;
            }
        });
    },
    
    // Renderuj zakładkę ankiety
    renderQuestionnaireTab() {
        const container = document.getElementById('questionnaireContent');
        if (!container) return;
        
        console.log('🎨 renderQuestionnaireTab wywołane');
        console.log('📋 currentQuestionnaire:', this.currentQuestionnaire);
        console.log('📊 currentQuestionnaireType:', this.currentQuestionnaireType);
        
        if (!this.currentQuestionnaire) {
            console.error('❌ currentQuestionnaire jest undefined!');
            container.innerHTML = '<p style="color:red;padding:20px;">Błąd: Ankieta nie została załadowana!</p>';
            return;
        }
        
        if (!this.currentQuestionnaire.sections) {
            console.error('❌ currentQuestionnaire.sections jest undefined!');
            console.log('📦 Dostępne właściwości:', Object.keys(this.currentQuestionnaire));
            container.innerHTML = '<p style="color:red;padding:20px;">Błąd: Ankieta nie ma sekcji!</p>';
            return;
        }
        
        console.log('✅ Liczba sekcji:', this.currentQuestionnaire.sections.length);
        
        let html = '';
        
        // Pobierz wybrany typ dłużnika
        const debtorType = this.answers['debtor_type_entity_type'] || '';
        
        this.currentQuestionnaire.sections.forEach((section, sectionIndex) => {
            // Sprawdź czy sekcja powinna być widoczna
            if (section.showIf) {
                // Jeśli showIf to funkcja (ankieta karna)
                if (typeof section.showIf === 'function') {
                    const shouldShow = section.showIf(this.answers);
                    if (!shouldShow) {
                        return; // Pomiń tę sekcję
                    }
                }
                // Jeśli showIf to tablica (inne ankiety - np. debt_collection)
                else if (Array.isArray(section.showIf) && section.showIf.length > 0) {
                    if (!section.showIf.includes(debtorType)) {
                        return; // Pomiń tę sekcję
                    }
                }
            }
            html += `
                <div style="
                    background: ${sectionIndex % 2 === 0 ? '#f8f9fa' : 'white'};
                    padding: 25px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    border: 2px solid #e0e0e0;
                ">
                    <h2 style="margin: 0 0 15px 0; color: #d4af37; font-size: 1.1rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                        📋 SEKCJA ${sectionIndex + 1}${section.description ? ': ' + section.description.toUpperCase() : ''}
                    </h2>
                    ${section.title ? `
                        <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 1.3rem;">
                            ${section.icon || ''} ${section.title}
                        </h3>
                    ` : ''}
                    
                    ${section.help ? `
                        <div style="
                            background: #e3f2fd;
                            padding: 15px;
                            border-radius: 8px;
                            border-left: 4px solid #2196f3;
                            margin-bottom: 20px;
                        ">
                            <p style="margin: 0; color: #1976d2;">💡 ${section.help}</p>
                        </div>
                    ` : ''}
                    
                    ${this.renderQuestions(section.questions, section.id)}
                    
                    ${section.type === 'repeatable' ? `
                        <button onclick="window.questionnaireRenderer.addRepeatable('${section.id}')" style="
                            padding: 12px 20px;
                            background: #3498db;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 600;
                            margin-top: 15px;
                        ">➕ Dodaj kolejnego wierzyciela</button>
                    ` : ''}
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Wypełnij zapisane odpowiedzi
        this.fillSavedAnswers();
    },
    
    // Renderuj pytania
    renderQuestions(questions, sectionId) {
        let html = '';
        
        // Pobierz wybrany typ dłużnika
        const debtorType = this.answers['debtor_type_entity_type'] || '';
        
        // Licznik dla numeracji pytań
        let questionNumber = 1;
        
        questions.forEach(q => {
            // Sprawdź czy pytanie powinno być widoczne
            if (q.showIf) {
                // Jeśli showIf to funkcja (ankieta karna)
                if (typeof q.showIf === 'function') {
                    const shouldShow = q.showIf(this.answers);
                    if (!shouldShow) {
                        return; // Pomiń to pytanie
                    }
                }
                // Jeśli showIf to tablica (inne ankiety)
                else if (Array.isArray(q.showIf) && q.showIf.length > 0) {
                    if (!q.showIf.includes(debtorType)) {
                        return; // Pomiń to pytanie
                    }
                }
            }
            
            const fieldId = `${sectionId}_${q.id}`;
            const value = this.answers[fieldId] || '';
            
            html += `<div style="margin-bottom: 20px;">`;
            
            // Label (NIE renderuj dla prostych checkboxów i pól info - mają własny label zintegrowany)
            const isSimpleCheckbox = q.type === 'checkbox' && (!q.options || q.options.length === 0);
            const isInfoField = q.type === 'info';
            const isActionButton = q.type === 'action_button';
            if (!isSimpleCheckbox && !isInfoField && !isActionButton) {
                const needsAdviceChecked = this.answers[`${fieldId}_needsAdvice`] === 'true';
                html += `
                    <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-weight: 600; color: #2c3e50; font-size: 1rem;">
                        <span>
                            <span style="display: inline-block; min-width: 25px; color: #d4af37; font-weight: 700;">${questionNumber}.</span> ${q.label} ${q.required ? '<span style="color: #e74c3c;">*</span>' : ''}
                        </span>
                        <span 
                            id="${fieldId}_needsAdvice"
                            onclick="window.questionnaireRenderer.toggleNeedsAdviceQuestion('${fieldId}')"
                            style="
                                color: ${needsAdviceChecked ? '#e74c3c' : '#f39c12'};
                                font-size: 1.4rem;
                                font-weight: 700;
                                cursor: pointer;
                                padding: 4px 8px;
                                border-radius: 50%;
                                transition: all 0.3s;
                                background: ${needsAdviceChecked ? '#ffe6e6' : 'transparent'};
                                flex-shrink: 0;
                            "
                            title="Nie wiem - potrzebuję pomocy doradcy. Kliknij jeśli chcesz pominąć to pytanie - twój doradca pomoże ci wypełnić tę część."
                            onmouseover="this.style.background='#fff3cd'"
                            onmouseout="this.style.background='${needsAdviceChecked ? '#ffe6e6' : 'transparent'}'"
                        >
                            ?
                        </span>
                    </label>
                `;
            }
            
            // Input field based on type
            switch (q.type) {
                case 'info':
                    // Pole informacyjne (tylko wyświetlanie HTML bez inputa)
                    html += q.content || '';
                    break;
                    
                case 'text':
                case 'email':
                case 'tel':
                case 'date':
                case 'number':
                    html += `
                        <input
                            type="${q.type}"
                            id="${fieldId}"
                            name="${fieldId}"
                            value="${value}"
                            ${q.required ? 'required' : ''}
                            ${q.pattern ? `pattern="${q.pattern}"` : ''}
                            ${q.min !== undefined ? `min="${q.min}"` : ''}
                            ${q.placeholder ? `placeholder="${q.placeholder}"` : ''}
                            style="
                                width: 100%;
                                padding: 14px;
                                border: 2px solid #e0e0e0;
                                border-radius: 8px;
                                font-size: 1.15rem;
                            "
                            onchange="window.questionnaireRenderer.updateAnswer('${fieldId}', this.value)"
                        >
                    `;
                    break;
                    
                case 'textarea':
                    html += `
                        <textarea
                            id="${fieldId}"
                            name="${fieldId}"
                            ${q.required ? 'required' : ''}
                            rows="${q.rows || 3}"
                            ${q.placeholder ? `placeholder="${q.placeholder}"` : ''}
                            style="
                                width: 100%;
                                padding: 14px;
                                border: 2px solid #e0e0e0;
                                border-radius: 8px;
                                font-size: 1.15rem;
                                line-height: 1.5;
                                resize: vertical;
                                font-family: inherit;
                            "
                            onchange="window.questionnaireRenderer.updateAnswer('${fieldId}', this.value)"
                        >${value}</textarea>
                    `;
                    
                    // Dodaj przycisk nagrywania jeśli audioRecording = true
                    if (q.audioRecording) {
                        html += `
                            <div style="margin-top: 15px; padding: 15px; background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border-radius: 8px; border-left: 4px solid #4caf50;">
                                <p style="margin: 0 0 10px 0; color: #2c3e50; font-weight: 600;">
                                    💡 <strong>Alternatywnie:</strong> Zamiast pisać możesz NAGRAĆ swoją odpowiedź głosem
                                </p>
                                <button id="record_btn_${fieldId}" 
                                    onclick="window.bankruptcyQuestionnaire.startRecording('${fieldId}')"
                                    type="button"
                                    style="padding: 12px 24px; background: linear-gradient(135deg, #4caf50, #45a049); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 8px rgba(76,175,80,0.3);">
                                    🎤 Nagraj odpowiedź głosem
                                </button>
                                <div id="audio_${fieldId}" style="margin-top: 10px;"></div>
                            </div>
                        `;
                    }
                    break;
                    
                case 'radio':
                    q.options.forEach(opt => {
                        const checked = value === opt.value ? 'checked' : '';
                        html += `
                            <label style="display: block; margin-bottom: 12px; cursor: pointer; padding: 8px;">
                                <input
                                    type="radio"
                                    name="${fieldId}"
                                    value="${opt.value}"
                                    ${checked}
                                    ${q.required ? 'required' : ''}
                                    onchange="window.questionnaireRenderer.updateAnswer('${fieldId}', this.value)"
                                    style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;"
                                >
                                <span style="font-size: 1.15rem; color: #2c3e50; font-weight: 500;">${opt.label}</span>
                            </label>
                        `;
                    });
                    break;
                    
                case 'checkbox':
                    // Jeśli brak options = prosty checkbox (true/false)
                    if (!q.options || q.options.length === 0) {
                        const checked = value === 'true' || value === true ? 'checked' : '';
                        const needsAdviceChecked = this.answers[`${fieldId}_needsAdvice`] === 'true';
                        html += `
                            <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 15px;">
                                <div style="display: flex; align-items: center;">
                                    <input
                                        type="checkbox"
                                        name="${fieldId}"
                                        value="true"
                                        ${checked}
                                        style="width: 20px; height: 20px; margin-right: 12px; cursor: pointer;"
                                    >
                                    <span style="color: #2c3e50; font-weight: 500;">${q.label}</span>
                                </div>
                                <span 
                                    id="${fieldId}_needsAdvice"
                                    onclick="window.questionnaireRenderer.toggleNeedsAdviceQuestion('${fieldId}')"
                                    style="
                                        color: ${needsAdviceChecked ? '#e74c3c' : '#f39c12'};
                                        font-size: 1.4rem;
                                        font-weight: 700;
                                        cursor: pointer;
                                        padding: 4px 8px;
                                        border-radius: 50%;
                                        transition: all 0.3s;
                                        background: ${needsAdviceChecked ? '#ffe6e6' : 'transparent'};
                                    "
                                    title="Nie wiem - potrzebuję pomocy doradcy. Kliknij jeśli chcesz pominąć to pytanie - twój doradca pomoże ci wypełnić tę część."
                                    onmouseover="this.style.background='#fff3cd'"
                                    onmouseout="this.style.background='${needsAdviceChecked ? '#ffe6e6' : 'transparent'}'"
                                >
                                    ?
                                </span>
                            </label>
                        `;
                    } else {
                        // Checkbox z opcjami (multiselect)
                        const savedValues = value ? value.split(',') : [];
                        q.options.forEach(opt => {
                            const checked = savedValues.includes(opt.value) ? 'checked' : '';
                            html += `
                                <label style="display: block; margin-bottom: 12px; cursor: pointer; padding: 8px;">
                                    <input
                                        type="checkbox"
                                        name="${fieldId}[]"
                                    value="${opt.value}"
                                    ${checked}
                                    onchange="window.questionnaireRenderer.updateCheckboxAnswer('${fieldId}')"
                                    style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;"
                                >
                                <span style="font-size: 1.15rem; color: #2c3e50; font-weight: 500;">${opt.label}</span>
                            </label>
                        `;
                        });
                    }
                    break;
                    
                case 'select':
                    html += `
                        <select
                            id="${fieldId}"
                            name="${fieldId}"
                            ${q.required ? 'required' : ''}
                            style="
                                width: 100%;
                                padding: 14px;
                                border: 2px solid #e0e0e0;
                                border-radius: 8px;
                                font-size: 1.15rem;
                            "
                            onchange="window.questionnaireRenderer.updateAnswer('${fieldId}', this.value)"
                        >
                            <option value="">Wybierz...</option>
                            ${q.options.map(opt => `
                                <option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>
                                    ${opt.label}
                                </option>
                            `).join('')}
                        </select>
                    `;
                    break;
                    
                case 'file':
                    html += `
                        <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; border: 2px dashed #2196f3;">
                            <input
                                type="file"
                                id="${fieldId}"
                                name="${fieldId}"
                                ${q.multiple ? 'multiple' : ''}
                                ${q.accept ? `accept="${q.accept}"` : ''}
                                style="
                                    width: 100%;
                                    padding: 10px;
                                    font-size: 1rem;
                                    cursor: pointer;
                                "
                                onchange="window.questionnaireRenderer.handleFileUpload('${fieldId}', this.files)"
                            >
                            <div id="${fieldId}_files" style="margin-top: 10px; font-size: 0.9rem; color: #2c3e50;"></div>
                        </div>
                    `;
                    break;
                    
                case 'info':
                    // Komunikat informacyjny (edukacyjny)
                    html += `
                        <div style="
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 20px;
                            border-radius: 12px;
                            margin-top: 15px;
                            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
                        ">
                            <div style="font-weight: 600; font-size: 1.1rem; margin-bottom: 12px;">
                                ${q.label}
                            </div>
                            <div style="font-size: 0.9rem; line-height: 1.8; opacity: 0.95;">
                                ${q.content}
                            </div>
                        </div>
                    `;
                    break;
                    
                case 'action_button':
                    // Przycisk akcji (np. otwierający modal dodawania dowodów)
                    html += `
                        <div style="
                            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                            color: white;
                            padding: 20px;
                            border-radius: 12px;
                            margin-top: 15px;
                            box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
                            text-align: center;
                        ">
                            <div style="font-weight: 600; font-size: 1.2rem; margin-bottom: 12px;">
                                ${q.label}
                            </div>
                            <div style="font-size: 0.95rem; line-height: 1.6; margin-bottom: 20px; opacity: 0.95;">
                                ${q.content}
                            </div>
                            <button 
                                type="button"
                                onclick="window.questionnaireRenderer.${q.buttonAction}()"
                                style="
                                    background: white;
                                    color: #f5576c;
                                    border: none;
                                    padding: 15px 30px;
                                    border-radius: 10px;
                                    font-weight: 700;
                                    font-size: 1.1rem;
                                    cursor: pointer;
                                    transition: all 0.3s;
                                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                                "
                                onmouseover="this.style.transform='scale(1.05) translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'"
                                onmouseout="this.style.transform='scale(1) translateY(0)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)'"
                            >
                                ${q.buttonText}
                            </button>
                        </div>
                    `;
                    break;
                    
                case 'file_upload':
                    const uploadedFiles = this.answers[`${fieldId}_files`] || [];
                    html += `
                        <div style="background: #f8f9fa; padding: 12px; border-radius: 8px; border: 1px solid #dee2e6; margin-top: 8px;">
                            <!-- Header - kompaktowy -->
                            <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                                <button 
                                    type="button"
                                    onclick="document.getElementById('${fieldId}_input').click()"
                                    style="
                                        flex: 1;
                                        padding: 8px 12px;
                                        background: #4CAF50;
                                        color: white;
                                        border: none;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        font-weight: 500;
                                        font-size: 0.85rem;
                                        transition: all 0.2s;
                                    "
                                    onmouseover="this.style.background='#45a049'"
                                    onmouseout="this.style.background='#4CAF50'"
                                >
                                    💾 Z dysku
                                </button>
                                <button 
                                    type="button"
                                    onclick="window.questionnaireRenderer.openDocumentPicker('${fieldId}')"
                                    style="
                                        flex: 1;
                                        padding: 8px 12px;
                                        background: #2196F3;
                                        color: white;
                                        border: none;
                                        border-radius: 6px;
                                        cursor: pointer;
                                        font-weight: 500;
                                        font-size: 0.85rem;
                                        transition: all 0.2s;
                                    "
                                    onmouseover="this.style.background='#1976D2'"
                                    onmouseout="this.style.background='#2196F3'"
                                >
                                    📁 Z aplikacji
                                </button>
                            </div>
                            
                            <!-- Hidden file input -->
                            <input
                                type="file"
                                id="${fieldId}_input"
                                ${q.multiple ? 'multiple' : ''}
                                ${q.accept ? `accept="${q.accept}"` : ''}
                                style="display: none;"
                                onchange="window.questionnaireRenderer.handleFileUpload('${fieldId}', this.files)"
                            >
                            
                            <!-- Lista załączonych plików -->
                            <div id="${fieldId}_list" style="margin-top: 15px;">
                                ${uploadedFiles.length > 0 ? `
                                    <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6;">
                                        <div style="color: #2c3e50; font-weight: 600; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                                            📎 Załączone pliki (${uploadedFiles.length})
                                        </div>
                                        ${uploadedFiles.map((file, idx) => `
                                            <div style="
                                                display: flex;
                                                align-items: center;
                                                justify-content: space-between;
                                                padding: 10px;
                                                background: #f8f9fa;
                                                border-radius: 6px;
                                                margin-bottom: 8px;
                                                border-left: 4px solid #4CAF50;
                                            ">
                                                <div style="flex: 1;">
                                                    <div style="font-weight: 600; color: #2c3e50;">
                                                        🔖 ${file.serialNumber || `DOW-${Date.now()}-${idx}`}
                                                    </div>
                                                    <div style="color: #666; font-size: 0.9rem; margin-top: 4px;">
                                                        ${file.name || 'Plik'}
                                                        ${file.size ? ` • ${(file.size / 1024).toFixed(1)} KB` : ''}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onclick="window.questionnaireRenderer.removeFile('${fieldId}', ${idx})"
                                                    style="
                                                        padding: 8px 12px;
                                                        background: #f44336;
                                                        color: white;
                                                        border: none;
                                                        border-radius: 6px;
                                                        cursor: pointer;
                                                        font-size: 0.9rem;
                                                    "
                                                >
                                                    🗑️ Usuń
                                                </button>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : `
                                    <div style="
                                        text-align: center;
                                        padding: 20px;
                                        color: #999;
                                        font-size: 0.9rem;
                                        border: 2px dashed #ddd;
                                        border-radius: 8px;
                                    ">
                                        📂 Brak załączonych plików
                                    </div>
                                `}
                            </div>
                        </div>
                    `;
                    break;
            }
            
            // Help text
            if (q.help) {
                html += `
                    <small style="display: block; margin-top: 8px; color: #7f8c8d; font-size: 0.9rem;">
                        💡 ${q.help}
                    </small>
                `;
            }
            
            html += `</div>`;
            
            // Zwiększ licznik tylko dla pytań z etykietą (nie info, nie action_button, nie simple checkbox)
            if (!isSimpleCheckbox && !isInfoField && !isActionButton) {
                questionNumber++;
            }
        });
        
        return html;
    },
    
    // Renderuj zakładkę procedury
    renderProcedureTab() {
        const container = document.getElementById('procedureContent');
        if (!container) return;
        
        // Wybierz właściwą procedurę w zależności od typu dłużnika
        const debtorType = this.answers['debtor_type_entity_type'] || '';
        const isConsumer = debtorType === 'consumer';
        
        // Dla compensation i restructuring nie ma osobnej procedury konsumenckiej
        const procedure = (isConsumer && this.currentQuestionnaireType === 'bankruptcy' && this.currentQuestionnaire.procedure_consumer)
            ? this.currentQuestionnaire.procedure_consumer 
            : this.currentQuestionnaire.procedure;
        
        // Dynamiczny czas trwania w zależności od typu
        let estimatedTime;
        if (this.currentQuestionnaireType === 'bankruptcy') {
            estimatedTime = isConsumer ? '3-7 lat (plan spłaty)' : '18-48 miesięcy';
        } else if (this.currentQuestionnaireType === 'restructuring') {
            estimatedTime = '12-24 miesiące';
        } else if (this.currentQuestionnaireType === 'compensation') {
            estimatedTime = '6-18 miesięcy (do wyroku) + 3-12 miesięcy (egzekucja)';
        } else {
            estimatedTime = procedure.description || 'Zależnie od sprawy';
        }
        
        let html = `
            <h2 style="color: #2c3e50; margin: 0 0 20px 0;">${procedure.title}</h2>
            <p style="color: #7f8c8d; margin-bottom: 30px; font-size: 1.1rem;">
                Przewidywany czas trwania całej procedury: <strong>${estimatedTime}</strong>
            </p>
            ${isConsumer && this.currentQuestionnaireType === 'bankruptcy' ? `
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
                    <p style="margin: 0; color: #2c3e50; font-weight: 600;">
                        ✅ <strong>Upadłość konsumencka</strong> - uproszczona procedura dla osób fizycznych
                    </p>
                    <p style="margin: 5px 0 0 0; color: #2c3e50;">
                        💰 Opłata: 30 zł | 📅 Plan spłaty: 3-7 lat | 🎉 Umorzenie pozostałych długów po zakończeniu
                    </p>
                </div>
            ` : ''}
        `;
        
        procedure.phases.forEach((phase, index) => {
            html += `
                <div style="
                    background: white;
                    border-left: 4px solid ${this.getPhaseColor(index)};
                    padding: 20px;
                    margin-bottom: 20px;
                    border-radius: 0 8px 8px 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                ">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <div style="
                            font-size: 2rem;
                            width: 50px;
                            height: 50px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: ${this.getPhaseColor(index)};
                            color: white;
                            border-radius: 50%;
                            font-weight: bold;
                        ">${phase.phase || phase.id || (index + 1)}</div>
                        <div>
                            <h3 style="margin: 0; color: #2c3e50;">${phase.icon} ${phase.name}</h3>
                            <p style="margin: 5px 0 0 0; color: #7f8c8d;">Czas trwania: ${phase.duration}</p>
                        </div>
                    </div>
                    
                    ${phase.description || phase.notes ? `
                        <div style="
                            background: ${phase.critical ? '#fff3cd' : '#f0f8ff'};
                            padding: 15px;
                            border-radius: 8px;
                            margin: 15px 0;
                            border-left: 4px solid ${phase.critical ? '#ff9800' : this.getPhaseColor(index)};
                        ">
                            <p style="margin: 0; color: #2c3e50; line-height: 1.6;">
                                ${phase.description || phase.notes || ''}
                            </p>
                        </div>
                    ` : ''}
                    
                    <ul style="margin: 0; padding-left: 20px;">
                        ${(phase.tasks || phase.steps || []).map(task => {
                            // Obsługa zarówno stringów jak i obiektów
                            const taskName = typeof task === 'string' ? task : task.name;
                            const taskCritical = typeof task === 'object' ? task.critical : false;
                            const taskDeadline = typeof task === 'object' ? task.deadline_days : null;
                            const taskDescription = typeof task === 'object' ? task.description : null;
                            const taskHelp = typeof task === 'object' ? task.help : null;
                            const taskChecklist = typeof task === 'object' ? task.checklist : null;
                            
                            return `
                            <li style="margin-bottom: 15px; color: #34495e;">
                                <strong style="font-size: 1.05rem;">${taskName}</strong>
                                ${taskCritical ? '<span style="color: #e74c3c; font-weight: bold;"> ⚠️ KRYTYCZNE</span>' : ''}
                                ${taskDeadline ? `<span style="color: #3498db;"> (Termin: ${taskDeadline} dni)</span>` : ''}
                                ${taskDescription ? `<br><p style="margin: 8px 0; color: #555; line-height: 1.6;">${taskDescription}</p>` : ''}
                                ${taskHelp ? `<br><small style="color: #7f8c8d;">${taskHelp}</small>` : ''}
                                ${taskChecklist ? `
                                    <ul style="margin-top: 5px; font-size: 0.95rem;">
                                        ${taskChecklist.map(item => `<li>${item}</li>`).join('')}
                                    </ul>
                                ` : ''}
                            </li>
                            `;
                        }).join('')}
                    </ul>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    // Renderuj zakładkę syndyka
    renderTrusteeTab() {
        const container = document.getElementById('trusteeContent');
        if (!container) return;
        
        const trusteeData = this.currentQuestionnaire.trusteeFields;
        
        let html = `
            <div style="
                background: #fff3cd;
                padding: 20px;
                border-radius: 12px;
                border: 2px solid #ffc107;
                margin-bottom: 30px;
            ">
                <h3 style="margin: 0 0 10px 0; color: #856404;">${trusteeData.title}</h3>
                <p style="margin: 0; color: #856404;">${trusteeData.help}</p>
            </div>
            
            <div style="
                background: white;
                padding: 25px;
                border-radius: 12px;
                border: 2px solid #e0e0e0;
            ">
                <h3 style="margin: 0 0 20px 0; color: #2c3e50;">👨‍⚖️ Dane kontaktowe syndyka</h3>
                ${this.renderQuestions(trusteeData.fields, 'trustee')}
            </div>
        `;
        
        container.innerHTML = html;
        this.fillSavedAnswers();
    },
    
    // Renderuj zakładkę dokumentów
    renderDocumentsTab() {
        console.log('📄 renderDocumentsTab() WYWOŁANA');
        console.log('📄 Typ ankiety:', this.currentQuestionnaireType);
        console.log('📄 Ankieta:', this.currentQuestionnaire);
        
        const container = document.getElementById('documentsContent');
        console.log('📄 Container:', container);
        if (!container) {
            console.error('❌ Nie znaleziono kontenera documentsContent!');
            return;
        }
        
        // Obsługa różnych formatów dokumentów
        let docs = this.currentQuestionnaire.requiredDocuments; // Stary format
        
        // Nowy format: documents.items (np. international questionnaire)
        if (!docs && this.currentQuestionnaire.documents && this.currentQuestionnaire.documents.items) {
            docs = this.currentQuestionnaire.documents.items;
            console.log('📄 Używam nowego formatu: documents.items');
        }
        
        console.log('📄 Dokumenty:', docs);
        console.log('📄 Liczba dokumentów:', docs ? docs.length : 0);
        
        if (!docs || docs.length === 0) {
            console.error('❌ Brak dokumentów!');
            container.innerHTML = '<p style="color: #999;">Brak zdefiniowanych dokumentów.</p>';
            return;
        }
        
        console.log('✅ Zaczynam renderowanie', docs.length, 'dokumentów');
        
        const entityType = this.answers['debtor_type_entity_type'];
        
        // Dynamiczny tekst w zależności od typu ankiety
        const titles = {
            bankruptcy: 'złożenia wniosku o ogłoszenie upadłości',
            restructuring: 'przeprowadzenia restrukturyzacji',
            compensation: 'dochodzenia odszkodowania',
            debt_collection: 'windykacji należności',
            commercial: 'dochodzenia należności gospodarczych (spór B2B)',
            inheritance: 'postępowania spadkowego (stwierdzenie nabycia spadku)',
            property: 'sprawy majątkowej (własność, służebności, roszczenia)',
            international: 'postępowania międzynarodowego (arbitraż, TSUE, egzekucja transgraniczna)'
        };
        const purposeText = titles[this.currentQuestionnaireType] || 'złożenia wniosku';
        
        // Policz dokumenty
        const requiredDocs = docs.filter(d => d.required !== false);
        const optionalDocs = docs.filter(d => d.required === false);
        
        // Policz załączone
        let attachedCount = 0;
        docs.forEach(doc => {
            const crmRefs = this.answers[`doc_${doc.id}_crm_refs`] || [];
            const newFiles = this.answers[`doc_${doc.id}_files`] || [];
            if (crmRefs.length > 0 || newFiles.length > 0) {
                attachedCount++;
            }
        });
        
        let html = `
            <!-- Checklist na górze -->
            <div style="
                background: linear-gradient(135deg, #1a2332, #2c3e50);
                padding: 25px;
                border-radius: 16px;
                margin-bottom: 30px;
                box-shadow: 0 4px 20px rgba(255,215,0,0.4);
                border: 2px solid #FFD700;
            ">
                <h2 style="color: white; margin: 0 0 15px 0; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 2rem;">📋</span>
                    CHECKLIST DOKUMENTÓW
                </h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 20px;">
                    <div style="background: rgba(255,255,255,0.2); padding: 18px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 1.8rem; font-weight: 700;">${docs.length}</div>
                        <div style="color: rgba(255,255,255,0.9); font-size: 0.9rem;">Wszystkich</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 18px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 8px;">⭐</div>
                        <div style="color: white; font-size: 1.8rem; font-weight: 700;">${requiredDocs.length}</div>
                        <div style="color: rgba(255,255,255,0.9); font-size: 0.9rem;">Wymaganych</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 18px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 8px;">📎</div>
                        <div style="color: white; font-size: 1.8rem; font-weight: 700;">${optionalDocs.length}</div>
                        <div style="color: rgba(255,255,255,0.9); font-size: 0.9rem;">Opcjonalnych</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 18px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 8px;">✅</div>
                        <div style="color: white; font-size: 1.8rem; font-weight: 700;">${attachedCount}</div>
                        <div style="color: rgba(255,255,255,0.9); font-size: 0.9rem;">Załączonych</div>
                    </div>
                </div>
                
                <!-- Progress bar -->
                <div style="background: rgba(255,255,255,0.3); border-radius: 20px; height: 12px; overflow: hidden;">
                    <div style="
                        background: linear-gradient(90deg, #4ade80, #22c55e);
                        height: 100%;
                        width: ${docs.length > 0 ? (attachedCount / docs.length * 100).toFixed(0) : 0}%;
                        transition: width 0.5s ease;
                        border-radius: 20px;
                    "></div>
                </div>
                <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; text-align: center; font-size: 0.9rem;">
                    ${attachedCount === docs.length ? '🎉 Wszystkie dokumenty załączone!' : `Postęp: ${attachedCount}/${docs.length} dokumentów`}
                </p>
            </div>
            
            <h2 style="color: #2c3e50; margin: 0 0 15px 0;">📄 Dokumenty wymagane</h2>
            <p style="color: #7f8c8d; margin-bottom: 25px; line-height: 1.6;">
                Lista dokumentów potrzebnych do ${purposeText}.<br>
                Do każdego dokumentu masz <strong>instrukcję krok po kroku</strong> jak go przygotować.
            </p>
        `;
        
        docs.forEach((doc, index) => {
            // Ukryj dokumenty ze showIf jeśli nie pasują
            if (doc.showIf && !doc.showIf.includes(entityType)) {
                return;
            }
            
            const uploadedFiles = this.answers[`doc_${doc.id}_files`] || [];
            const hasFiles = uploadedFiles.length > 0;
            
            // SPECJALNA OBSŁUGA DLA WNIOSKU O UPADŁOŚĆ (ostatni dokument)
            if (doc.id === 'bankruptcy_petition') {
                html += `
                    <style>
                        @keyframes flyToCourt {
                            0% { transform: translateX(-100px) translateY(0px) rotate(0deg); opacity: 0; }
                            5% { transform: translateX(-80px) translateY(-5px) rotate(2deg); opacity: 0.5; }
                            10% { transform: translateX(-50px) translateY(-10px) rotate(5deg); opacity: 1; }
                            15% { transform: translateX(-20px) translateY(-12px) rotate(3deg); }
                            20% { transform: translateX(0px) translateY(-15px) rotate(8deg); }
                            25% { transform: translateX(30px) translateY(-18px) rotate(6deg); }
                            30% { transform: translateX(60px) translateY(-22px) rotate(10deg); }
                            35% { transform: translateX(90px) translateY(-25px) rotate(8deg); }
                            40% { transform: translateX(120px) translateY(-28px) rotate(5deg); }
                            45% { transform: translateX(150px) translateY(-30px) rotate(3deg); }
                            50% { transform: translateX(180px) translateY(-28px) rotate(0deg); }
                            55% { transform: translateX(210px) translateY(-25px) rotate(-3deg); }
                            60% { transform: translateX(240px) translateY(-22px) rotate(-5deg); }
                            65% { transform: translateX(270px) translateY(-18px) rotate(-3deg); }
                            70% { transform: translateX(300px) translateY(-15px) rotate(0deg); }
                            75% { transform: translateX(330px) translateY(-12px) rotate(2deg); }
                            80% { transform: translateX(360px) translateY(-8px) rotate(4deg); }
                            85% { transform: translateX(390px) translateY(-5px) rotate(2deg); }
                            90% { transform: translateX(420px) translateY(-2px) rotate(0deg); }
                            95% { transform: translateX(450px) translateY(0px) rotate(-2deg); opacity: 0.5; }
                            100% { transform: translateX(480px) translateY(0px) rotate(0deg); opacity: 0; }
                        }
                        
                        @keyframes gatherDocuments {
                            0% { transform: scale(0.5) translateY(50px); opacity: 0; }
                            50% { transform: scale(1.2) translateY(-10px); opacity: 1; }
                            100% { transform: scale(1) translateY(0); opacity: 1; }
                        }
                        
                        @keyframes pulse {
                            0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(230,126,34,0.6); }
                            50% { transform: scale(1.05); box-shadow: 0 0 50px rgba(230,126,34,0.8); }
                        }
                        
                        .pigeon-fly {
                            animation: flyToCourt 5s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
                        }
                        
                        .doc-gather {
                            animation: gatherDocuments 1s ease-out;
                        }
                    </style>
                    
                    <div style="
                        background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
                        padding: 40px;
                        border-radius: 20px;
                        margin: 40px 0;
                        border: 5px solid #c0392b;
                        box-shadow: 0 10px 40px rgba(230,126,34,0.5);
                        position: relative;
                        overflow: hidden;
                        animation: pulse 2s ease-in-out infinite;
                    ">
                        <!-- Animacja gołębia lecącego do sądu -->
                        <div style="position: absolute; top: 20px; left: 0; width: 100%; height: 60px; pointer-events: none;">
                            <div class="pigeon-fly" style="font-size: 2rem; position: absolute;">
                                🕊️📄
                            </div>
                            <div style="position: absolute; right: 20px; top: 0; font-size: 3rem;">
                                🏛️
                            </div>
                        </div>
                        
                        <!-- Ikony dokumentów zbierających się -->
                        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; margin-top: 40px;" class="doc-gather">
                            <span style="font-size: 2rem;">📋</span>
                            <span style="font-size: 2rem;">📄</span>
                            <span style="font-size: 2rem;">📑</span>
                            <span style="font-size: 2rem;">📃</span>
                            <span style="font-size: 2rem;">📜</span>
                        </div>
                        
                        <!-- Główna treść -->
                        <div style="text-align: center; color: white;">
                            <h2 style="
                                margin: 0 0 15px 0;
                                font-size: 2.5rem;
                                font-weight: 900;
                                text-shadow: 3px 3px 6px rgba(0,0,0,0.3);
                                letter-spacing: 2px;
                            ">
                                📄 ${doc.name}
                            </h2>
                            
                            <p style="
                                font-size: 1.3rem;
                                margin: 0 0 25px 0;
                                line-height: 1.6;
                                text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
                            ">
                                ${doc.description}
                            </p>
                            
                            <div style="
                                background: rgba(255,255,255,0.2);
                                padding: 20px;
                                border-radius: 15px;
                                margin-bottom: 25px;
                                backdrop-filter: blur(10px);
                            ">
                                <p style="margin: 0; font-size: 1.1rem; font-weight: 600;">
                                    🎯 System automatycznie złoży wszystkie dokumenty w jeden kompletny wniosek!
                                </p>
                                <p style="margin: 10px 0 0 0; font-size: 1rem;">
                                    📦 Wykaz majątku + 👥 Wykaz wierzycieli + 💰 Oświadczenia + 📎 Załączniki
                                </p>
                            </div>
                            
                            <!-- SUPER WIELKI PRZYCISK -->
                            <button 
                                onclick="window.questionnaireRenderer.generateDocument('${doc.id}')"
                                style="
                                    padding: 30px 60px;
                                    background: linear-gradient(135deg, #27ae60, #229954);
                                    color: white;
                                    border: none;
                                    border-radius: 20px;
                                    cursor: pointer;
                                    font-weight: 900;
                                    font-size: 2rem;
                                    box-shadow: 0 10px 30px rgba(39,174,96,0.5);
                                    transition: all 0.3s ease;
                                    text-transform: uppercase;
                                    letter-spacing: 2px;
                                    position: relative;
                                    overflow: hidden;
                                "
                                onmouseover="this.style.transform='scale(1.1) translateY(-5px)'; this.style.boxShadow='0 15px 40px rgba(39,174,96,0.7)'"
                                onmouseout="this.style.transform='scale(1) translateY(0)'; this.style.boxShadow='0 10px 30px rgba(39,174,96,0.5)'"
                            >
                                <span style="position: relative; z-index: 1;">
                                    🚀 WYGENERUJ I WYŚLIJ DO SĄDU! 🏛️
                                </span>
                            </button>
                            
                            ${hasFiles ? `
                                <div style="
                                    background: rgba(255,255,255,0.95);
                                    padding: 20px;
                                    border-radius: 12px;
                                    margin-top: 25px;
                                    color: #2c3e50;
                                ">
                                    <p style="margin: 0 0 10px 0; font-weight: 700; font-size: 1.1rem; color: #27ae60;">
                                        ✅ Załączone dokumenty:
                                    </p>
                                    ${uploadedFiles.map(file => `
                                        <div style="padding: 8px; background: #e8f5e9; border-radius: 6px; margin: 5px 0;">
                                            📄 ${file}
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- Instrukcje -->
                        ${doc.howTo ? `
                            <details style="margin-top: 25px;">
                                <summary style="
                                    cursor: pointer;
                                    padding: 15px;
                                    background: rgba(255,255,255,0.2);
                                    border-radius: 12px;
                                    font-weight: 700;
                                    color: white;
                                    font-size: 1.1rem;
                                    text-align: center;
                                    backdrop-filter: blur(10px);
                                ">
                                    📖 Instrukcja krok po kroku
                                </summary>
                                <div style="
                                    padding: 20px;
                                    background: rgba(255,255,255,0.95);
                                    border-radius: 12px;
                                    margin-top: 15px;
                                    color: #2c3e50;
                                ">
                                    ${doc.howTo.map(step => `
                                        <p style="margin: 12px 0; font-size: 1.05rem; line-height: 1.7;">
                                            ${step}
                                        </p>
                                    `).join('')}
                                </div>
                            </details>
                        ` : ''}
                    </div>
                `;
                return; // Pomiń standardowe renderowanie
            }
            
            // STANDARDOWE RENDEROWANIE DLA INNYCH DOKUMENTÓW
            html += `
                <div style="
                    background: white;
                    padding: 25px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    border: 3px solid ${doc.required ? '#e74c3c' : '#95a5a6'};
                    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
                ">
                    <!-- Nagłówek dokumentu -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
                        <div style="flex: 1;">
                            <h3 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 1.2rem;">
                                ${doc.icon || '📄'} ${doc.name}
                                ${doc.required ? '<span style="color: #e74c3c; font-size: 1.3rem;"> *</span>' : ''}
                            </h3>
                            ${doc.description ? `
                                <p style="margin: 0; color: #555; line-height: 1.5; font-size: 0.95rem;">
                                    ${doc.description}
                                </p>
                            ` : ''}
                            ${doc.deadline ? `
                                <p style="margin: 5px 0 0 0; color: #e67e22; font-size: 0.85rem; font-weight: 600;">
                                    ⏰ Termin: ${doc.deadline}
                                </p>
                            ` : ''}
                        </div>
                        <div style="display: flex; gap: 10px; margin-left: 15px;">
                            ${(doc.canGenerate || doc.aiGenerator) ? `
                                <button 
                                    onclick="window.questionnaireRenderer.generateDocument('${doc.id}')"
                                    style="
                                        padding: 12px 20px;
                                        background: linear-gradient(135deg, #27ae60, #229954);
                                        color: white;
                                        border: none;
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-weight: 600;
                                        font-size: 0.95rem;
                                        box-shadow: 0 2px 8px rgba(39,174,96,0.3);
                                        white-space: nowrap;
                                    "
                                    title="🤖 AI wygeneruje dokument na podstawie ankiety"
                                >
                                    ✨ Generuj AI
                                </button>
                            ` : ''}
                            ${doc.canUpload !== false ? `
                                <button 
                                    onclick="window.questionnaireRenderer.showCrmDocumentsPicker('${doc.id}')"
                                    style="
                                        padding: 12px 20px;
                                        background: linear-gradient(135deg, #FFD700, #d4af37);
                                        color: #1a2332;
                                        border: none;
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-weight: 600;
                                        font-size: 0.95rem;
                                        box-shadow: 0 2px 8px rgba(255,215,0,0.3);
                                        white-space: nowrap;
                                    "
                                    title="Wybierz dokumenty już istniejące w CRM"
                                >
                                    🗂️ Wybierz z CRM
                                </button>
                            ` : ''}
                        </div>
                    </div>
                    
                    <!-- Załączone pliki (tylko z CRM) -->
                    ${(() => {
                        const crmRefs = this.answers[`doc_${doc.id}_crm_refs`] || [];
                        
                        if (crmRefs.length === 0) return '';
                        
                        return `
                            <div style="
                                background: #e8f5e9;
                                padding: 15px;
                                border-radius: 8px;
                                margin-bottom: 15px;
                                border-left: 4px solid #27ae60;
                            ">
                                <p style="margin: 0 0 12px 0; font-weight: 600; color: #27ae60;">
                                    ✅ Załączone dokumenty z CRM (${crmRefs.length}):
                                </p>
                                
                                ${crmRefs.map(ref => `
                                    <div style="
                                        display: flex; 
                                        align-items: center; 
                                        gap: 10px; 
                                        margin-top: 8px;
                                        padding: 10px;
                                        background: rgba(255,215,0,0.1);
                                        border-radius: 6px;
                                    ">
                                        <span style="color: #d4af37; font-size: 1.2rem;">📎</span>
                                        <span style="color: #2c3e50; flex: 1;">${ref.filename}</span>
                                        <span style="
                                            font-size: 0.75rem; 
                                            color: white; 
                                            background: #d4af37; 
                                            padding: 3px 8px; 
                                            border-radius: 4px;
                                        ">CRM</span>
                                    </div>
                                `).join('')}
                            </div>
                        `;
                    })()}
                    
                    <!-- Jak przygotować dokument -->
                    ${doc.howTo ? `
                        <details style="margin-top: 15px;">
                            <summary style="
                                cursor: pointer;
                                padding: 12px;
                                background: #fffbf0;
                                border-radius: 8px;
                                font-weight: 600;
                                color: #d4af37;
                                border: 2px solid #d4af37;
                            ">
                                📖 Instrukcja krok po kroku - jak przygotować ten dokument
                            </summary>
                            <div style="
                                padding: 15px;
                                background: #f8f9fa;
                                border-radius: 8px;
                                margin-top: 10px;
                                border-left: 4px solid #d4af37;
                            ">
                                ${doc.howTo.map(step => `
                                    <p style="margin: 8px 0; color: #2c3e50; line-height: 1.6;">
                                        ${step}
                                    </p>
                                `).join('')}
                            </div>
                        </details>
                    ` : ''}
                    
                    <!-- Przykład -->
                    ${doc.example ? `
                        <details style="margin-top: 10px;">
                            <summary style="
                                cursor: pointer;
                                padding: 12px;
                                background: #fff8e1;
                                border-radius: 8px;
                                font-weight: 600;
                                color: #f39c12;
                                border: 2px solid #f39c12;
                            ">
                                💡 Zobacz przykład
                            </summary>
                            <div style="
                                padding: 15px;
                                background: #fffbf0;
                                border-radius: 8px;
                                margin-top: 10px;
                                border-left: 4px solid #f39c12;
                                font-family: monospace;
                                white-space: pre-wrap;
                                font-size: 0.9rem;
                                line-height: 1.6;
                            ">
                                ${doc.example}
                            </div>
                        </details>
                    ` : ''}
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    // Obsługa upload dokumentów
    handleDocumentUpload(docId, files) {
        const filesArray = Array.from(files).map(f => f.name);
        this.answers[`doc_${docId}_files`] = filesArray;
        this.renderDocumentsTab(); // Odśwież widok
        this.saveAnswers();
        console.log(`✅ Załączono ${files.length} plików do dokumentu: ${docId}`);
    },
    
    // Generowanie pojedynczego dokumentu
    async generateDocument(docId) {
        const doc = this.currentQuestionnaire.requiredDocuments.find(d => d.id === docId);
        if (!doc) return;
        
        // Pokaż modal z informacją o generowaniu
        const modal = this.showGeneratingModal(`Generowanie: ${doc.name}`);
        
        try {
            // MOCK - Symuluj opóźnienie AI
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Wywołaj API AI do generowania dokumentu
            let documentContent;
            
            try {
                const response = await window.api.request('/ai/generate-document', {
                    method: 'POST',
                    body: {
                        documentType: docId,
                        answers: this.answers,
                        questionnaire: 'bankruptcy',
                        caseId: this.currentCaseId
                    }
                });
                
                if (response.success && response.document) {
                    documentContent = response.document;
                } else {
                    throw new Error('Backend nie zwrócił dokumentu');
                }
            } catch (apiError) {
                // Backend nie działa - użyj MOCK
                console.log('⚠️ Backend nie odpowiada, używam mockowanych danych');
                documentContent = this.generateMockDocument(docId, doc.name);
            }
            
            modal.remove();
            
            // Pokaż wygenerowany dokument
            this.showGeneratedDocument(documentContent, doc.name);
            
        } catch (error) {
            modal.remove();
            console.error('Błąd generowania dokumentu:', error);
            alert(`❌ Błąd generowania dokumentu:\n${error.message}`);
        }
    },
    
    // Generowanie mockowego dokumentu (gdy backend nie działa)
    generateMockDocument(docId, docName) {
        const entityType = this.answers['debtor_type_entity_type'] || 'consumer';
        const debtorName = this.answers['debtor_type_company_name'] || 'Jan Kowalski';
        const address = this.answers['debtor_type_residential_address'] || 'ul. Przykładowa 1, 00-001 Warszawa';
        const totalDebt = this.answers['insolvency_total_debt'] || '150000';
        
        // Różne szablony dla różnych dokumentów
        switch(docId) {
            case 'bankruptcy_petition':
                return `WNIOSEK O OGŁOSZENIE UPADŁOŚCI

Warszawa, dnia ${new Date().toLocaleDateString('pl-PL')}

Do Sądu Rejonowego
Wydział Gospodarczy ds. Upadłościowych i Restrukturyzacyjnych

WNIOSKODAWCA:
Imię i nazwisko/Nazwa: ${debtorName}
Adres: ${address}

WNIOSEK O OGŁOSZENIE UPADŁOŚCI

Na podstawie art. 21 ustawy z dnia 28 lutego 2003 r. - Prawo upadłościowe wnoszę o:
1. Ogłoszenie mojej upadłości
2. Ustalenie planu spłaty wierzycieli

UZASADNIENIE:

Wnioskodawca jest niewypłacalny w rozumieniu art. 11 Prawa upadłościowego.
Łączna suma zobowiązań wynosi: ${totalDebt} PLN.

Nie jestem w stanie terminowo regulować wymagalnych zobowiązań pieniężnych.
Szczegółowy wykaz wierzycieli oraz majątku znajduje się w załącznikach.

Jednocześnie oświadczam, że:
- Nie toczy się wobec mnie inne postępowanie upadłościowe
- Nie ukrywam majątku
- Wszystkie informacje są prawdziwe

${debtorName}
...........................
(podpis wnioskodawcy)

ZAŁĄCZNIKI:
1. Wykaz majątku
2. Wykaz wierzycieli
3. Dokumenty potwierdzające niewypłacalność
4. Dowód opłaty sądowej`;

            case 'asset_list':
                return `WYKAZ MAJĄTKU DŁUŻNIKA

Imię i nazwisko: ${debtorName}
Adres: ${address}

SKŁADNIKI MAJĄTKU:

1. NIERUCHOMOŚCI:
   ${this.answers['debtor_type_owns_property'] === 'yes' ? 
     '- Mieszkanie: [adres, metraż, KW, wartość]' : 
     '- Brak nieruchomości w posiadaniu'}

2. RUCHOMOŚCI:
   ${this.answers['debtor_type_owns_car'] === 'yes' ? 
     '- Samochód: [marka, model, rok, wartość]' : 
     '- Brak pojazdów'}

3. KONTA BANKOWE:
   - [Nazwa banku, numer konta, saldo]

4. INNE SKŁADNIKI MAJĄTKU:
   - Brak

ŁĄCZNA WARTOŚĆ MAJĄTKU: [do uzupełnienia] PLN

Oświadczam, że powyższe informacje są zgodne z prawdą.

${debtorName}
...........................
(podpis)`;

            case 'creditors_list':
                return `WYKAZ WIERZYCIELI I ICH WIERZYTELNOŚCI

Dłużnik: ${debtorName}
Adres: ${address}

LP | WIERZYCIEL | KWOTA DŁUGU | DATA WYMAGALNOŚCI | TYTUŁ
---|-----------|-------------|-------------------|-------
1. | [Nazwa wierzyciela] | ${totalDebt} PLN | [data] | [Umowa kredytu/Faktura]

ŁĄCZNA SUMA ZOBOWIĄZAŃ: ${totalDebt} PLN

Powyższy wykaz sporządzono dnia ${new Date().toLocaleDateString('pl-PL')}

${debtorName}
...........................
(podpis)`;

            case 'income_statement':
                return `OŚWIADCZENIE O DOCHODACH

Ja, niżej podpisany/a ${debtorName}

Oświadczam, że:

Miesięczny dochód netto: ${this.answers['personal_situation_monthly_income'] || '0'} PLN
Źródło dochodu: ${this.answers['personal_situation_current_employment'] === 'yes' ? 'Praca na etacie' : 'Brak dochodu'}

Osoby na utrzymaniu: ${this.answers['personal_situation_dependents'] || '0'}
Miesięczne wydatki: ${this.answers['personal_situation_monthly_expenses'] || '0'} PLN

Oświadczam, że powyższe dane są zgodne z prawdą.

Warszawa, ${new Date().toLocaleDateString('pl-PL')}

${debtorName}
...........................
(podpis)`;

            default:
                return `DOKUMENT: ${docName}

Wygenerowany automatycznie przez system na podstawie ankiety.

Dłużnik: ${debtorName}
Adres: ${address}

[Treść dokumentu zostanie uzupełniona przez doradcę prawnego]

Warszawa, ${new Date().toLocaleDateString('pl-PL')}

${debtorName}
...........................
(podpis)`;
        }
    },
    
    // Generowanie głównego wniosku o upadłość
    async generateBankruptcyPetition() {
        // Sprawdź pytania wymagające pomocy
        const needsAdvice = this.getQuestionsNeedingAdvice();
        if (needsAdvice.length > 0) {
            let message = `⚠️ UWAGA: Klient potrzebuje pomocy z ${needsAdvice.length} pytaniami:\n\n`;
            needsAdvice.forEach((item, index) => {
                message += `${index + 1}. ${item.section} → ${item.question}\n`;
            });
            message += '\n📞 Skontaktuj się z klientem przed wygenerowaniem dokumentów!';
            alert(message);
            return;
        }
        
        // Pokaż modal z informacją o generowaniu
        const modal = this.showGeneratingModal('Generowanie kompletnego wniosku o upadłość');
        
        try {
            // Wywołaj API AI do generowania pełnego wniosku
            const response = await window.api.request('/ai/generate-bankruptcy-petition', {
                method: 'POST',
                body: {
                    answers: this.answers,
                    caseId: this.currentCaseId,
                    entityType: this.answers['debtor_type_entity_type']
                }
            });
            
            modal.remove();
            
            if (response.success) {
                // Pokaż wygenerowane dokumenty
                this.showBankruptcyPackage(response.documents);
            } else {
                alert(`❌ Błąd generowania: ${response.error}`);
            }
            
        } catch (error) {
            modal.remove();
            console.error('Błąd generowania wniosku:', error);
            alert(`❌ Błąd generowania wniosku:\n${error.message}\n\nSprawdź czy backend działa (localhost:3500)`);
        }
    },
    
    // Modal "Generowanie..."
    showGeneratingModal(title) {
        // Kolor spinnera w zależności od typu ankiety
        const spinnerColor = this.currentQuestionnaireType === 'inheritance' ? '#8B4513' : 
                            this.currentQuestionnaireType === 'criminal' ? '#e74c3c' :
                            this.currentQuestionnaireType === 'property' ? '#16a085' :
                            this.currentQuestionnaireType === 'commercial' ? '#f39c12' :
                            this.currentQuestionnaireType === 'restructuring' ? '#27ae60' :
                            this.currentQuestionnaireType === 'compensation' ? '#3498db' :
                            this.currentQuestionnaireType === 'contract' ? '#9b59b6' :
                            this.currentQuestionnaireType === 'family' ? '#e91e63' :
                            this.currentQuestionnaireType === 'building' ? '#e67e22' :
                            this.currentQuestionnaireType === 'tax' ? '#c0392b' :
                            this.currentQuestionnaireType === 'zoning' ? '#16a085' :
                            this.currentQuestionnaireType === 'international' ? '#3498db' :
                            '#e67e22';
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            z-index: 10003;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        modal.innerHTML = `
            <div style="
                background: white;
                padding: 40px;
                border-radius: 16px;
                text-align: center;
                max-width: 500px;
            ">
                <div style="
                    width: 60px;
                    height: 60px;
                    border: 4px solid ${spinnerColor};
                    border-top-color: transparent;
                    border-radius: 50%;
                    margin: 0 auto 20px;
                    animation: spin 1s linear infinite;
                "></div>
                <h3 style="margin: 0 0 10px 0; color: #2c3e50;">🤖 AI generuje dokument...</h3>
                <p style="margin: 0; color: #7f8c8d;">${title}</p>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(modal);
        return modal;
    },
    
    // Pokaż wygenerowany dokument
    showGeneratedDocument(documentContent, documentName) {
        // Kolor nagłówka w zależności od typu ankiety
        const headerColor1 = this.currentQuestionnaireType === 'inheritance' ? '#8B4513' : 
                            this.currentQuestionnaireType === 'criminal' ? '#e74c3c' :
                            this.currentQuestionnaireType === 'property' ? '#16a085' :
                            this.currentQuestionnaireType === 'commercial' ? '#f39c12' :
                            this.currentQuestionnaireType === 'restructuring' ? '#27ae60' :
                            this.currentQuestionnaireType === 'compensation' ? '#3498db' :
                            this.currentQuestionnaireType === 'contract' ? '#9b59b6' :
                            this.currentQuestionnaireType === 'family' ? '#e91e63' :
                            this.currentQuestionnaireType === 'building' ? '#e67e22' :
                            this.currentQuestionnaireType === 'tax' ? '#c0392b' :
                            this.currentQuestionnaireType === 'zoning' ? '#16a085' :
                            this.currentQuestionnaireType === 'international' ? '#3498db' :
                            '#27ae60';
        
        const headerColor2 = this.currentQuestionnaireType === 'inheritance' ? '#654321' : 
                            this.currentQuestionnaireType === 'criminal' ? '#c0392b' :
                            this.currentQuestionnaireType === 'property' ? '#138d75' :
                            this.currentQuestionnaireType === 'commercial' ? '#e67e22' :
                            this.currentQuestionnaireType === 'restructuring' ? '#229954' :
                            this.currentQuestionnaireType === 'compensation' ? '#2980b9' :
                            this.currentQuestionnaireType === 'contract' ? '#8e44ad' :
                            this.currentQuestionnaireType === 'family' ? '#c2185b' :
                            this.currentQuestionnaireType === 'building' ? '#d35400' :
                            this.currentQuestionnaireType === 'tax' ? '#a93226' :
                            this.currentQuestionnaireType === 'zoning' ? '#138d75' :
                            this.currentQuestionnaireType === 'international' ? '#2980b9' :
                            '#229954';
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            z-index: 10003;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            overflow-y: auto;
        `;
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                max-width: 900px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <div style="
                    background: linear-gradient(135deg, ${headerColor1}, ${headerColor2});
                    padding: 25px;
                    border-radius: 16px 16px 0 0;
                    color: white;
                ">
                    <h2 style="margin: 0;">✅ Dokument wygenerowany!</h2>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">${documentName}</p>
                </div>
                <div style="padding: 30px;">
                    <div style="
                        background: #ffffff;
                        padding: 20px;
                        border-radius: 8px;
                        border: 2px solid ${headerColor1};
                        white-space: pre-wrap;
                        font-family: 'Courier New', monospace;
                        line-height: 1.8;
                        max-height: 500px;
                        overflow-y: auto;
                        color: #2c3e50;
                        font-size: 13px;
                    ">${this.addLineNumbers(documentContent)}</div>
                    <div style="display: flex; gap: 15px; margin-top: 25px;">
                        <button 
                            onclick="window.questionnaireRenderer.downloadDocument('${documentName}', \`${(documentContent || '').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`)"
                            style="
                                flex: 1;
                                padding: 15px;
                                background: linear-gradient(135deg, ${headerColor1}, ${headerColor2});
                                color: white;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 700;
                                font-size: 1rem;
                            "
                        >
                            💾 Pobierz dokument
                        </button>
                        <button 
                            onclick="this.closest('[style*=z-index]').remove()"
                            style="
                                flex: 1;
                                padding: 15px;
                                background: #95a5a6;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 700;
                                font-size: 1rem;
                            "
                        >
                            Zamknij
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    // Pokaż pakiet dokumentów upadłościowych
    showBankruptcyPackage(documents) {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            z-index: 10003;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            overflow-y: auto;
        `;
        
        const docsHTML = documents.map(doc => `
            <div style="
                background: white;
                padding: 20px;
                border-radius: 8px;
                border: 2px solid #27ae60;
                margin-bottom: 15px;
            ">
                <h4 style="margin: 0 0 10px 0; color: #27ae60;">📄 ${doc.name}</h4>
                <p style="margin: 0 0 15px 0; color: #7f8c8d; font-size: 0.9rem;">${doc.description || 'Dokument gotowy'}</p>
                <button 
                    onclick="window.questionnaireRenderer.downloadDocument('${doc.name}', \`${doc.content.replace(/`/g, '\\`')}\`)"
                    style="
                        padding: 10px 20px;
                        background: #3498db;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-weight: 600;
                    "
                >
                    💾 Pobierz
                </button>
            </div>
        `).join('');
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                max-width: 800px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
            ">
                <div style="
                    background: linear-gradient(135deg, #e67e22, #d35400);
                    padding: 25px;
                    border-radius: 16px 16px 0 0;
                    color: white;
                ">
                    <h2 style="margin: 0;">🎉 Wniosek o upadłość wygenerowany!</h2>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">Pakiet ${documents.length} dokumentów gotowych do pobrania</p>
                </div>
                <div style="padding: 30px;">
                    ${docsHTML}
                    <button 
                        onclick="this.closest('[style*=z-index]').remove()"
                        style="
                            width: 100%;
                            padding: 15px;
                            background: #95a5a6;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 700;
                            font-size: 1rem;
                            margin-top: 15px;
                        "
                    >
                        Zamknij
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    // Autonumeracja linii dokumentu
    addLineNumbers(content) {
        if (!content) return '';
        const lines = content.split('\n');
        return lines.map((line, index) => {
            const lineNum = String(index + 1).padStart(3, ' ');
            return `<span style="color: #95a5a6; user-select: none;">${lineNum}</span> ${line}`;
        }).join('\n');
    },
    
    // Pobierz dokument jako DOCX (Word)
    downloadDocument(filename, content) {
        // Konwertuj tekst do formatu HTML dla Word
        const htmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head>
                <meta charset='utf-8'>
                <title>${filename}</title>
                <style>
                    body { 
                        font-family: 'Times New Roman', serif; 
                        font-size: 12pt; 
                        line-height: 1.5;
                        margin: 2cm;
                    }
                    p { margin: 0; margin-bottom: 10pt; }
                </style>
            </head>
            <body>
                ${content.split('\n').map(line => `<p>${line || '&nbsp;'}</p>`).join('')}
            </body>
            </html>
        `;
        
        const blob = new Blob(['\ufeff', htmlContent], { 
            type: 'application/msword;charset=utf-8' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.doc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`✅ Dokument "${filename}.doc" został pobrany!\n\n📄 Możesz go otworzyć w Microsoft Word.\n\nZnajdziesz go w folderze Pobrane.`);
    },
    
    // Kolory faz procedury
    getPhaseColor(index) {
        const colors = ['#3498db', '#9b59b6', '#e67e22', '#e74c3c', '#1abc9c', '#34495e', '#f39c12', '#27ae60'];
        return colors[index % colors.length];
    },
    
    // Aktualizuj odpowiedź
    updateAnswer(fieldId, value) {
        this.answers[fieldId] = value;
        
        // Jeśli zmienia się typ dłużnika - przeładuj całą ankietę
        if (fieldId === 'debtor_type_entity_type') {
            console.log('🔄 Typ dłużnika zmieniony na:', value);
            this.renderQuestionnaireTab();
        }
        
        this.updateProgress();
    },
    
    // Aktualizuj checkbox
    updateCheckboxAnswer(fieldId) {
        const checkboxes = document.querySelectorAll(`input[name="${fieldId}[]"]:checked`);
        const values = Array.from(checkboxes).map(cb => cb.value);
        this.answers[fieldId] = values.join(',');
        this.updateProgress();
    },
    
    // Obsługa uploadu plików
    handleFileUpload(fieldId, files) {
        if (!files || files.length === 0) return;
        
        const fileList = document.getElementById(`${fieldId}_files`);
        if (!fileList) return;
        
        let html = '<div style="margin-top: 10px;"><strong>Załączone pliki:</strong></div>';
        Array.from(files).forEach((file, index) => {
            html += `
                <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px; padding: 8px; background: white; border-radius: 6px;">
                    <span style="color: #2196f3;">📎</span>
                    <span style="flex: 1; color: #2c3e50; font-weight: 600;">${file.name}</span>
                    <span style="color: #7f8c8d; font-size: 0.85rem;">${(file.size / 1024).toFixed(1)} KB</span>
                </div>
            `;
        });
        fileList.innerHTML = html;
        
        // Zapisz pliki w answers (jako obiekt File - później konwersja do base64)
        this.answers[`${fieldId}_files`] = Array.from(files);
        this.updateProgress();
    },
    
    // Obsługa kliknięcia w "?" - Toggle stanu pomocy
    toggleNeedsAdviceQuestion(fieldId) {
        // Toggle stan
        const currentState = this.answers[`${fieldId}_needsAdvice`] === 'true';
        const newState = !currentState;
        
        // Zapisz w answers
        this.answers[`${fieldId}_needsAdvice`] = newState ? 'true' : 'false';
        
        // Zaktualizuj wygląd znaku "?"
        const questionMark = document.getElementById(`${fieldId}_needsAdvice`);
        if (questionMark) {
            questionMark.style.color = newState ? '#e74c3c' : '#f39c12';
            questionMark.style.background = newState ? '#ffe6e6' : 'transparent';
        }
        
        // Pobierz pole input/textarea/select
        const field = document.getElementById(fieldId);
        
        if (field) {
            if (newState) {
                // Zaznaczono "Potrzebuję pomocy"
                field.removeAttribute('required');
                const originalPlaceholder = field.placeholder || '';
                field.setAttribute('data-original-placeholder', originalPlaceholder);
                field.placeholder = '❓ Pytanie przekazane do doradcy - możesz pominąć';
                field.style.background = '#fffbf0';
                field.style.borderColor = '#ffc107';
                console.log(`✅ Pytanie "${fieldId}" oznaczone jako "potrzebuję pomocy"`);
            } else {
                // Odznaczono
                const questionElement = field.closest('[data-question-required]');
                if (questionElement) {
                    field.setAttribute('required', 'true');
                }
                const originalPlaceholder = field.getAttribute('data-original-placeholder');
                if (originalPlaceholder) {
                    field.placeholder = originalPlaceholder;
                }
                field.style.background = '';
                field.style.borderColor = '#e0e0e0';
                console.log(`❌ Pytanie "${fieldId}" odznaczone z "potrzebuję pomocy"`);
            }
        }
        
        this.autoSave();
    },
    
    // Obsługa checkboxa "Potrzebuję pomocy" (stara funkcja - pozostawiona dla kompatybilności)
    toggleNeedsAdvice(fieldId, checked) {
        // Zapisz w answers
        this.answers[`${fieldId}_needsAdvice`] = checked ? 'true' : 'false';
        
        // Pobierz pole input/textarea/select
        const field = document.getElementById(fieldId);
        
        if (field) {
            if (checked) {
                // Zaznaczono "Potrzebuję pomocy"
                // 1. Usuń required
                field.removeAttribute('required');
                
                // 2. Dodaj placeholder
                const originalPlaceholder = field.placeholder || '';
                field.setAttribute('data-original-placeholder', originalPlaceholder);
                field.placeholder = '❓ Pytanie przekazane do doradcy - możesz pominąć';
                
                // 3. Zmień tło na żółte
                field.style.background = '#fffbf0';
                field.style.borderColor = '#ffc107';
                
                // 4. Wyczyść wartość (opcjonalnie - klient może już coś wpisał)
                // field.value = '';
                
                console.log(`✅ Pytanie "${fieldId}" oznaczone jako "potrzebuję pomocy"`);
            } else {
                // Odznaczono - przywróć normalny stan
                // 1. Przywróć required (jeśli było)
                const questionElement = field.closest('[data-question-required]');
                if (questionElement) {
                    field.setAttribute('required', 'true');
                }
                
                // 2. Przywróć placeholder
                const originalPlaceholder = field.getAttribute('data-original-placeholder');
                if (originalPlaceholder) {
                    field.placeholder = originalPlaceholder;
                }
                
                // 3. Przywróć normalny wygląd
                field.style.background = '';
                field.style.borderColor = '#e0e0e0';
                
                console.log(`❌ Pytanie "${fieldId}" odznaczone z "potrzebuję pomocy"`);
            }
        }
        
        this.updateProgress();
    },
    
    // Aktualizuj postęp
    updateProgress() {
        const total = this.currentQuestionnaire.sections.length;
        let completed = 0;
        
        this.currentQuestionnaire.sections.forEach(section => {
            const requiredQuestions = section.questions.filter(q => q.required);
            const answeredQuestions = requiredQuestions.filter(q => {
                const fieldId = `${section.id}_${q.id}`;
                
                // Pytanie jest odpowiedziane jeśli:
                // 1. Ma odpowiedź ALBO
                // 2. Jest zaznaczone "potrzebuję pomocy"
                const hasAnswer = this.answers[fieldId] && this.answers[fieldId].length > 0;
                const needsAdvice = this.answers[`${fieldId}_needsAdvice`] === 'true';
                
                return hasAnswer || needsAdvice;
            });
            
            if (answeredQuestions.length === requiredQuestions.length) {
                completed++;
            }
        });
        
        const percentage = Math.round((completed / total) * 100);
        
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        
        if (progressBar) progressBar.style.width = `${percentage}%`;
        if (progressText) progressText.textContent = `Postęp: ${percentage}% (${completed}/${total} sekcji)`;
    },
    
    // Wypełnij zapisane odpowiedzi
    fillSavedAnswers() {
        Object.keys(this.answers).forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.value = this.answers[fieldId];
            }
        });
    },
    
    // Załaduj odpowiedzi z backendu
    async loadAnswers(caseId) {
        try {
            const response = await window.api.request(`/cases/${caseId}/questionnaire`);
            if (response.questionnaire) {
                this.answers = JSON.parse(response.questionnaire.answers || '{}');
            }
        } catch (error) {
            console.log('ℹ️ Brak zapisanej ankiety - tworzę nową');
            this.answers = {};
        }
    },
    
    // Zapisz odpowiedzi
    async saveAnswers() {
        try {
            await window.api.request(`/cases/${this.currentCaseId}/questionnaire`, {
                method: 'POST',
                body: JSON.stringify({
                    questionnaire_type: 'bankruptcy',
                    answers: JSON.stringify(this.answers),
                    completed: this.isCompleted()
                })
            });
            
            // alert('✅ Ankieta zapisana!'); // Wyłączone - denerwujące
        } catch (error) {
            console.error('❌ Błąd zapisu:', error);
            alert('❌ Błąd zapisu ankiety');
        }
    },
    
    // Sprawdź czy ukończona
    isCompleted() {
        // Sprawdź czy wszystkie wymagane pola są wypełnione
        let allRequired = [];
        this.currentQuestionnaire.sections.forEach(section => {
            section.questions.filter(q => q.required).forEach(q => {
                allRequired.push(`${section.id}_${q.id}`);
            });
        });
        
        return allRequired.every(fieldId => {
            // Pytanie OK jeśli ma odpowiedź LUB jest zaznaczone "potrzebuję pomocy"
            const hasAnswer = this.answers[fieldId] && this.answers[fieldId].length > 0;
            const needsAdvice = this.answers[`${fieldId}_needsAdvice`] === 'true';
            return hasAnswer || needsAdvice;
        });
    },
    
    // Generuj raport pytań wymagających pomocy
    getQuestionsNeedingAdvice() {
        const needsAdviceList = [];
        
        Object.keys(this.answers).forEach(key => {
            if (key.endsWith('_needsAdvice') && this.answers[key] === 'true') {
                // Usuń sufiks _needsAdvice żeby dostać fieldId
                const fieldId = key.replace('_needsAdvice', '');
                
                // Znajdź pytanie
                this.currentQuestionnaire.sections.forEach(section => {
                    section.questions.forEach(q => {
                        const qFieldId = `${section.id}_${q.id}`;
                        if (qFieldId === fieldId) {
                            needsAdviceList.push({
                                section: section.title,
                                question: q.label,
                                fieldId: fieldId,
                                currentAnswer: this.answers[fieldId] || '(brak odpowiedzi)'
                            });
                        }
                    });
                });
            }
        });
        
        return needsAdviceList;
    },
    
    // Generuj dokumenty
    async generateDocuments() {
        if (!this.isCompleted()) {
            alert('⚠️ Uzupełnij wszystkie wymagane pola przed generowaniem dokumentów!');
            return;
        }
        
        // Sprawdź czy są pytania wymagające pomocy
        const needsAdvice = this.getQuestionsNeedingAdvice();
        if (needsAdvice.length > 0) {
            let message = `⚠️ UWAGA: Klient potrzebuje pomocy z ${needsAdvice.length} pytaniami:\n\n`;
            needsAdvice.forEach((item, index) => {
                message += `${index + 1}. ${item.section} → ${item.question}\n`;
            });
            message += '\n✅ Skontaktuj się z klientem przed wygenerowaniem dokumentów!';
            alert(message);
        }
        
        alert('🚀 Generowanie dokumentów... (funkcja w przygotowaniu)');
        // TODO: Implementacja generowania dokumentów
    },
    
    // Auto-save
    startAutoSave() {
        setInterval(async () => {
            if (Object.keys(this.answers).length > 0) {
                try {
                    await window.api.request(`/cases/${this.currentCaseId}/questionnaire`, {
                        method: 'POST',
                        body: JSON.stringify({
                            questionnaire_type: 'bankruptcy',
                            answers: JSON.stringify(this.answers),
                            completed: this.isCompleted()
                        })
                    });
                    console.log('💾 Auto-save: zapisano bez powiadomienia');
                } catch (error) {
                    console.error('❌ Auto-save failed:', error);
                }
            }
        }, 30000); // 30 sekund
    },
    
    // NOWE: Wybór dokumentów z CRM
    async showCrmDocumentsPicker(docId) {
        console.log('🗂️ Otwieranie wyboru dokumentów z CRM dla:', docId);
        
        // Pobierz dokumenty z aktualnej sprawy
        let crmDocuments = [];
        try {
            const response = await window.api.request(`/cases/${this.currentCaseId}/documents`);
            if (response && response.documents) {
                crmDocuments = response.documents;
            }
        } catch (error) {
            console.error('❌ Błąd pobierania dokumentów:', error);
            alert('Błąd pobierania dokumentów z CRM');
            return;
        }
        
        if (crmDocuments.length === 0) {
            alert('ℹ️ Brak dokumentów w tej sprawie.\n\nDodaj najpierw dokumenty w zakładce "Dokumenty" w CRM.');
            return;
        }
        
        // Utwórz modal z listą dokumentów
        const modal = document.createElement('div');
        modal.id = 'crmDocumentsPickerModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10001;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 16px;
                max-width: 800px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            ">
                <div style="
                    background: linear-gradient(135deg, #9b59b6, #8e44ad);
                    padding: 25px;
                    border-radius: 16px 16px 0 0;
                    color: white;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h2 style="margin: 0; font-size: 1.5rem;">🗂️ Wybierz dokumenty z CRM</h2>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Wybierz istniejące dokumenty aby je przypisać</p>
                        </div>
                        <button onclick="document.getElementById('crmDocumentsPickerModal').remove()" style="
                            background: rgba(255,255,255,0.2);
                            border: 2px solid white;
                            color: white;
                            width: 40px;
                            height: 40px;
                            border-radius: 50%;
                            cursor: pointer;
                            font-size: 1.5rem;
                        ">×</button>
                    </div>
                </div>
                
                <div style="padding: 30px;">
                    <p style="color: #666; margin-bottom: 20px;">
                        📋 Znaleziono <strong>${crmDocuments.length}</strong> dokumentów w tej sprawie
                    </p>
                    
                    <div id="crmDocumentsList" style="display: flex; flex-direction: column; gap: 15px;">
                        ${crmDocuments.map((doc, index) => `
                            <div style="
                                background: #f8f9fa;
                                padding: 20px;
                                border-radius: 12px;
                                border: 2px solid #e0e0e0;
                                cursor: pointer;
                                transition: all 0.3s;
                            "
                            onmouseover="this.style.borderColor='#9b59b6'; this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.borderColor='#e0e0e0'; this.style.transform='translateY(0)'"
                            onclick="window.questionnaireRenderer.attachCrmDocument('${docId}', ${doc.id}, '${doc.filename}')">
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <div style="
                                        width: 50px;
                                        height: 50px;
                                        background: linear-gradient(135deg, #9b59b6, #8e44ad);
                                        border-radius: 12px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        font-size: 1.5rem;
                                        color: white;
                                    ">
                                        ${doc.filename.endsWith('.pdf') ? '📄' : doc.filename.match(/\.(jpg|jpeg|png|gif)$/i) ? '🖼️' : '📎'}
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">
                                            ${doc.filename}
                                        </div>
                                        <div style="font-size: 0.85rem; color: #666;">
                                            ${doc.category || 'Brak kategorii'} • ${doc.upload_date ? new Date(doc.upload_date).toLocaleDateString('pl-PL') : ''}
                                        </div>
                                    </div>
                                    <div style="
                                        padding: 8px 15px;
                                        background: #9b59b6;
                                        color: white;
                                        border-radius: 8px;
                                        font-weight: 600;
                                        font-size: 0.9rem;
                                    ">
                                        Wybierz
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <button onclick="document.getElementById('crmDocumentsPickerModal').remove()" style="
                        margin-top: 20px;
                        width: 100%;
                        padding: 15px;
                        background: #e0e0e0;
                        color: #666;
                        border: none;
                        border-radius: 12px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 1rem;
                    ">
                        Anuluj
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // NOWE: Przypisz dokument z CRM do ankiety
    attachCrmDocument(docId, crmDocId, filename) {
        console.log(`✅ Przypisywanie dokumentu ${filename} (ID: ${crmDocId}) do ${docId}`);
        
        // Zapisz referencję do dokumentu CRM
        if (!this.answers[`doc_${docId}_crm_refs`]) {
            this.answers[`doc_${docId}_crm_refs`] = [];
        }
        
        // Dodaj tylko jeśli jeszcze nie ma
        const exists = this.answers[`doc_${docId}_crm_refs`].some(ref => ref.id === crmDocId);
        if (!exists) {
            this.answers[`doc_${docId}_crm_refs`].push({
                id: crmDocId,
                filename: filename,
                source: 'crm'
            });
        }
        
        // Zamknij modal
        document.getElementById('crmDocumentsPickerModal').remove();
        
        // Odśwież widok dokumentów
        this.renderDocumentsTab();
        
        // Zapisz
        this.saveAnswers();
        
        // Pokaż powiadomienie
        this.showToast(`✅ Dodano: ${filename}`, 'success');
    },
    
    // NOWE: Pokaż toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const colors = {
            success: '#27ae60',
            error: '#e74c3c',
            info: '#3498db'
        };
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10002;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    // 📎 OBSŁUGA UPLOADU PLIKÓW (dla starego typu 'file')
    handleFileUpload(fieldId, files) {
        if (!files || files.length === 0) return;
        
        console.log(`📎 Upload plików dla: ${fieldId}`, files);
        
        const fileList = document.getElementById(`${fieldId}_files`);
        if (fileList) {
            fileList.innerHTML = `<strong>${files.length}</strong> ${files.length === 1 ? 'plik' : 'plików'} wybranych`;
        }
        
        this.showToast(`📎 Wybrano ${files.length} ${files.length === 1 ? 'plik' : 'pliki'}`, 'success');
    },
    
    // 📁 OTWÓRZ MODAL DODAWANIA DOWODÓW
    openEvidenceModal() {
        console.log('📁 Otwieranie modalu dodawania dowodów...');
        
        if (!this.currentCaseId) {
            this.showToast('❌ Brak ID sprawy', 'error');
            return;
        }
        
        // Wywołaj PRAWDZIWY formularz dowodów z evidence-module.js
        if (window.evidenceModule && typeof window.evidenceModule.showAddForm === 'function') {
            console.log('✅ Wywołuję evidenceModule.showAddForm z caseId:', this.currentCaseId);
            window.evidenceModule.showAddForm(this.currentCaseId);
        } else {
            console.error('❌ evidenceModule.showAddForm nie istnieje!');
            this.showToast('❌ Moduł dowodów nie jest załadowany', 'error');
        }
    }
};

console.log('✅ Questionnaire Renderer ready');
