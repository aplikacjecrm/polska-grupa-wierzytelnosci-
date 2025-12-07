// AI Assistant Manager
class AIAssistant {
    constructor() {
        this.messages = [];
        this.currentCaseId = null;
    }

    // Open AI panel for case analysis
    async openAIAnalysis(caseId, caseTitle) {
        this.currentCaseId = caseId;
        
        const modalHtml = `
            <div id="aiModal" style="
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                z-index: 10000;
                align-items: center;
                justify-content: center;
                overflow-y: auto;
                padding: 20px 10px;
            ">
                <div style="
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    border: 2px solid #d4af37;
                    width: 90%;
                    max-width: 800px;
                    max-height: 90vh;
                    margin: auto;
                    border-radius: 15px;
                    box-shadow: 0 20px 60px rgba(212,175,55,0.3);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    position: relative;
                ">
                    <!-- Header - Sticky -->
                    <div style="background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 15px 20px; border-bottom: 1px solid rgba(255,255,255,0.2); position: sticky; top: 0; z-index: 100;">
                        <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                            <div style="flex: 1; min-width: 0;">
                                <h2 style="color: white; margin: 0 0 5px 0; font-size: 1.2rem; display: flex; align-items: center; gap: 8px; font-weight: 700; letter-spacing: 0.3px;">
                                    <span style="font-size: 1.5rem;">⚖️</span> Asystent Prawny AI
                                </h2>
                                <div style="color: rgba(255,255,255,0.9); font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                    ${caseTitle}
                                </div>
                            </div>
                            <button onclick="aiAssistant.closeAI()" 
                                    style="background: #d4af37; border: none; color: #1a1a2e; width: 40px; height: 40px; min-width: 40px; border-radius: 50%; cursor: pointer; font-size: 1.5rem; font-weight: bold; transition: all 0.3s; flex-shrink: 0;"
                                    onmouseover="this.style.background='#ffd700'; this.style.transform='rotate(90deg)'"
                                    onmouseout="this.style.background='#d4af37'; this.style.transform='rotate(0deg)'"
                                    title="Zamknij AI Asystenta">
                                ✕
                            </button>
                        </div>
                    </div>
                    
                    <!-- Warning Banner -->
                    <div style="background: rgba(212,175,55,0.15); border-left: 4px solid #d4af37; padding: 10px 20px; color: white; font-size: 0.8rem; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1rem;">🔒</span>
                        <div>
                            <strong style="color: #d4af37;">Prywatność:</strong> Dane wrażliwe (PESEL, NIP, adresy) są automatycznie maskowane przed wysłaniem do AI. Zero logowania.
                        </div>
                    </div>
                    
                    <div style="background: rgba(76,175,80,0.15); border-left: 4px solid #3B82F6; padding: 10px 20px; color: white; font-size: 0.8rem; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1rem;">🤖</span>
                        <div>
                            <strong style="color: #3B82F6;">Google Gemini AI:</strong> Używamy darmowego Gemini AI (100% za darmo). Claude AI (płatny) jest wyłączony.
                        </div>
                    </div>
                    
                    <div style="background: rgba(212,175,55,0.1); border-left: 4px solid #d4af37; padding: 10px 20px; color: white; font-size: 0.8rem; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1rem;">⚠️</span>
                        <div>
                            <strong style="color: #d4af37;">Ważne:</strong> AI dostarcza tylko sugestie. Zawsze weryfikuj odpowiedzi przed użyciem.
                        </div>
                    </div>
                    
                    <!-- Messages Area -->
                    <div id="aiMessages" style="height: 400px; overflow-y: auto; padding: 20px; background: rgba(255,255,255,0.05);">
                        <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.6);">
                            <div style="font-size: 4rem; margin-bottom: 15px;">🤖</div>
                            <div style="font-size: 1.1rem; margin-bottom: 10px;">Witaj! Jestem Twoim asystentem AI</div>
                            <div style="font-size: 0.9rem;">Zadaj pytanie o sprawę lub wybierz szybką akcję poniżej</div>
                        </div>
                    </div>
                    
                    <!-- Quick Actions -->
                    <div style="padding: 15px 20px; background: rgba(0,0,0,0.2); border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);">
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button onclick="aiAssistant.quickAction('analyze')" 
                                    style="padding: 8px 14px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 20px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;"
                                    onmouseover="this.style.background='rgba(255,255,255,0.25)'"
                                    onmouseout="this.style.background='rgba(255,255,255,0.15)'">
                                📊 Przeanalizuj sprawę
                            </button>
                            <button onclick="aiAssistant.quickAction('risks')" 
                                    style="padding: 8px 14px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 20px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;"
                                    onmouseover="this.style.background='rgba(255,255,255,0.25)'"
                                    onmouseout="this.style.background='rgba(255,255,255,0.15)'">
                                ⚠️ Zidentyfikuj ryzyka
                            </button>
                            <button onclick="aiAssistant.quickAction('nextsteps')" 
                                    style="padding: 8px 14px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); color: white; border-radius: 20px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;"
                                    onmouseover="this.style.background='rgba(255,255,255,0.25)'"
                                    onmouseout="this.style.background='rgba(255,255,255,0.15)'">
                                📋 Następne kroki
                            </button>
                            <button onclick="aiAssistant.openDocumentGenerator()" 
                                    style="padding: 8px 14px; background: rgba(76,175,80,0.3); border: 1px solid rgba(76,175,80,0.5); color: white; border-radius: 20px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.2s;"
                                    onmouseover="this.style.background='rgba(76,175,80,0.4)'"
                                    onmouseout="this.style.background='rgba(76,175,80,0.3)'">
                                📝 Generuj dokument
                            </button>
                        </div>
                    </div>
                    
                    <!-- Input Area -->
                    <div style="padding: 20px; background: rgba(0,0,0,0.3);">
                        <div style="display: flex; gap: 10px;">
                            <textarea id="aiInput" 
                                      placeholder="Zadaj pytanie o sprawę..." 
                                      style="flex: 1; padding: 12px; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.2); border-radius: 12px; color: white; font-size: 0.95rem; resize: none; min-height: 50px;"
                                      onkeypress="if(event.key==='Enter' && !event.shiftKey){ event.preventDefault(); aiAssistant.sendMessage(); }"
                                      onfocus="this.style.borderColor='rgba(255,255,255,0.4)'"
                                      onblur="this.style.borderColor='rgba(255,255,255,0.2)'"></textarea>
                            <button onclick="aiAssistant.sendMessage()" 
                                    style="padding: 12px 24px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 1rem; transition: all 0.3s; box-shadow: 0 4px 15px rgba(76,175,80,0.3);"
                                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(76,175,80,0.4)'"
                                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(76,175,80,0.3)'">
                                Wyślij
                            </button>
                        </div>
                    </div>
                    
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        setTimeout(() => {
            const modal = document.getElementById('aiModal');
            modal.style.display = 'flex';
            
            // Zamknij po kliknięciu w tło (poza modalem)
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'aiModal') {
                    this.closeAI();
                }
            });
            
            // Zamknij po naciśnięciu ESC
            this.escapeHandler = (e) => {
                if (e.key === 'Escape') {
                    this.closeAI();
                }
            };
            document.addEventListener('keydown', this.escapeHandler);
        }, 100);
    }

    // Quick action buttons
    quickAction(action) {
        const questions = {
            analyze: 'Przeanalizuj tę sprawę zgodnie z aktualnymi przepisami i podaj główne punkty, na które powinienem zwrócić uwagę. Powołaj konkretne artykuły.',
            risks: 'Jakie widzisz potencjalne ryzyka prawne w tej sprawie zgodnie z aktualnymi przepisami? Jakie terminy powinienem zachować?',
            nextsteps: 'Jakie są zalecane następne kroki procesowe w tej sprawie? Podaj konkretne czynności z podstawą prawną i terminami.'
        };
        
        document.getElementById('aiInput').value = questions[action];
        this.sendMessage();
    }

    // Send message to AI - NOWA WERSJA Z AKTUALNYMI PRZEPISAMI
    async sendMessage() {
        const input = document.getElementById('aiInput');
        const question = input.value.trim();
        
        if (!question) return;
        
        // Clear input
        input.value = '';
        
        // Add user message
        this.addMessage('user', question);
        
        // Show loading
        this.addMessage('ai', '🔄 Analizuję z aktualnymi przepisami...', 'loading');
        
        try {
            // UŻYWAMY GEMINI AI (darmowy) zamiast Claude (płatny)
            const caseContext = await this.getCaseContext();
            const contextText = caseContext ? `\n\nKONTEKST SPRAWY:\nNumer: ${caseContext.case_number}\nTytuł: ${caseContext.title}\nTyp: ${caseContext.case_type}\n` : '';
            
            const response = await api.request('/ai/gemini/ask', {
                method: 'POST',
                body: JSON.stringify({
                    question: question + contextText,
                    context: caseContext ? JSON.stringify(caseContext) : '',
                    caseId: this.currentCaseId // 📄 WYSYŁAM caseId aby backend mógł pobrać dokumenty!
                })
            });
            
            // Remove loading
            this.removeLoadingMessage();
            
            // Add AI response
            const aiAnswer = response.answer || response.response || 'Brak odpowiedzi';
            this.addMessage('ai', aiAnswer + '\n\n📚 Odpowiedź zawiera aktualne przepisy prawne z ' + new Date().toLocaleDateString('pl-PL'));
            
        } catch (error) {
            this.removeLoadingMessage();
            this.addMessage('ai', '❌ Błąd: ' + error.message, 'error');
        }
    }
    
    // Pobierz kontekst sprawy
    async getCaseContext() {
        try {
            const caseData = await api.request(`/cases/${this.currentCaseId}`);
            return {
                case_number: caseData.case_number,
                title: caseData.title,
                case_type: caseData.case_type, // Poprawiona nazwa pola!
                status: caseData.status,
                description: caseData.description,
                court_name: caseData.court_name,
                court_signature: caseData.court_signature
            };
        } catch (error) {
            console.error('Błąd pobierania kontekstu:', error);
            return null;
        }
    }

    // Add message to chat
    addMessage(sender, text, type = 'normal') {
        const messagesDiv = document.getElementById('aiMessages');
        
        // Remove welcome message if exists
        const welcome = messagesDiv.querySelector('div[style*="text-align: center"]');
        if (welcome) welcome.remove();
        
        const isUser = sender === 'user';
        const isError = type === 'error';
        const isLoading = type === 'loading';
        
        const messageHtml = `
            <div class="${isLoading ? 'ai-loading-message' : ''}" style="display: flex; justify-content: ${isUser ? 'flex-end' : 'flex-start'}; margin-bottom: 15px; animation: slideIn 0.3s ease;">
                <div style="max-width: 75%; padding: 12px 16px; border-radius: 16px; ${isUser ? 'background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white;' : isError ? 'background: rgba(244,67,54,0.2); border: 1px solid #f44336; color: #ffcdd2;' : 'background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); color: white; border: 1px solid rgba(255,255,255,0.2);'}">
                    <div style="font-size: 0.9rem; line-height: 1.5; white-space: pre-wrap;">${this.escapeHtml(text)}</div>
                    ${!isUser && !isLoading ? '<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 0.75rem; color: rgba(255,255,255,0.6);">⚠️ Sugestia AI - zweryfikuj przed użyciem</div>' : ''}
                </div>
            </div>
        `;
        
        messagesDiv.insertAdjacentHTML('beforeend', messageHtml);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    // Remove loading message
    removeLoadingMessage() {
        const loading = document.querySelector('.ai-loading-message');
        if (loading) loading.remove();
    }

    // Toggle custom document field
    toggleCustomDocument() {
        const docType = document.getElementById('documentType').value;
        const customField = document.getElementById('customDocumentField');
        
        if (docType === 'custom') {
            customField.style.display = 'block';
        } else {
            customField.style.display = 'none';
        }
    }

    // Open document generator
    openDocumentGenerator() {
        const generatorHtml = `
            <div id="documentGeneratorModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10006; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease;">
                <div style="background: white; border-radius: 16px; padding: 30px; max-width: 600px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border-top: 4px solid #d4af37;">
                    <h3 style="color: #1a1a2e; margin: 0 0 20px 0; font-size: 1.4rem; display: flex; align-items: center; gap: 10px; font-weight: 700;">
                        <span style="font-size: 1.8rem;">⚖️</span> Generator Dokumentów Prawnych
                    </h3>
                    
                    <div style="background: #fffbf0; border-left: 4px solid #d4af37; padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #d4af37; box-shadow: 0 2px 4px rgba(212,175,55,0.1);">
                        <div style="display: flex; align-items: start; gap: 10px;">
                            <span style="color: #d4af37; font-size: 1.2rem; font-weight: bold;">⚠</span>
                            <div>
                                <strong style="color: #1a1a2e; font-size: 0.95rem;">Uwaga prawna:</strong>
                                <p style="color: #2c3e50; margin: 5px 0 0 0; line-height: 1.5; font-size: 0.9rem;">
                                    Asystent AI wygeneruje szkic dokumentu. Dokument wymaga obowiązkowej weryfikacji przez radcę prawnego lub adwokata przed złożeniem w sądzie.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px;">Typ dokumentu:</label>
                        <select id="documentType" style="width: 100%; padding: 12px; border: 2px solid #d4af37; border-radius: 8px; font-size: 1rem; color: #1a1a2e; background: white;" onchange="aiAssistant.toggleCustomDocument()">
                            <optgroup label="⚖️ Pisma procesowe podstawowe">
                                <option value="pozew">▪ Pozew</option>
                                <option value="odpowiedz_na_pozew">▪ Odpowiedź na pozew</option>
                                <option value="replika">▪ Replika</option>
                                <option value="wniosek_procesowy">▪ Wniosek procesowy</option>
                                <option value="wniosek_dowodowy">▪ Wniosek dowodowy</option>
                                <option value="wniosek_zabezpieczajacy">▪ Wniosek o zabezpieczenie</option>
                                <option value="pismo_do_sadu">▪ Pismo do sądu</option>
                                <option value="sprzeciw_od_nakazu">▪ Sprzeciw od nakazu zapłaty</option>
                            </optgroup>
                            
                            <optgroup label="📝 Środki odwoławcze">
                                <option value="zażalenie">▪ Zażalenie</option>
                                <option value="apelacja">▪ Apelacja</option>
                                <option value="kasacja">▪ Kasacja</option>
                                <option value="skarga_kasacyjna">▪ Skarga kasacyjna</option>
                                <option value="wniosek_o_wznowienie">▪ Wniosek o wznowienie postępowania</option>
                            </optgroup>
                            
                            <optgroup label="§ Odszkodowania i roszczenia">
                                <option value="pozew_odszkodowawczy">▪ Pozew o odszkodowanie</option>
                                <option value="pozew_zadoscuczynienie">▪ Pozew o zadośćuczynienie</option>
                                <option value="wezwanie_do_zaplaty">▪ Wezwanie do zapłaty</option>
                                <option value="reklamacja_ubezpieczenie">▪ Reklamacja do ubezpieczyciela</option>
                                <option value="odwolanie_od_decyzji_ubezpieczyciel">▪ Odwołanie od decyzji ubezpieczyciela</option>
                                <option value="pozew_wypadek_komunikacyjny">▪ Pozew - wypadek komunikacyjny</option>
                                <option value="pozew_wypadek_przy_pracy">▪ Pozew - wypadek przy pracy</option>
                            </optgroup>
                            
                            <optgroup label="⚖ Upadłość konsumencka">
                                <option value="wniosek_upadlosc_konsumencka">▪ Wniosek o ogłoszenie upadłości konsumenckiej</option>
                                <option value="plan_splaty_upadlosc">▪ Plan spłaty wierzycieli</option>
                                <option value="uzupelnienie_wniosku_upadlosc">▪ Uzupełnienie wniosku upadłościowego</option>
                            </optgroup>
                            
                            <optgroup label="⚖ Restrukturyzacja">
                                <option value="wniosek_restrukturyzacja">▪ Wniosek o otwarcie restrukturyzacji</option>
                                <option value="plan_restrukturyzacyjny">▪ Plan restrukturyzacyjny</option>
                                <option value="propozycja_ukladu">▪ Propozycja układu z wierzycielami</option>
                                <option value="wniosek_zawieszenie_egzekucji">▪ Wniosek o zawieszenie egzekucji</option>
                            </optgroup>
                            
                            <optgroup label="§ Prawo pracy">
                                <option value="pozew_przywrocenie_do_pracy">▪ Pozew o przywrócenie do pracy</option>
                                <option value="pozew_odszkodowanie_zwolnienie">▪ Pozew o odszkodowanie za zwolnienie</option>
                                <option value="pozew_wynagrodzenie">▪ Pozew o wynagrodzenie</option>
                            </optgroup>
                            
                            <optgroup label="§ Prawo nieruchomości">
                                <option value="pozew_eksmisja">▪ Pozew o eksmisję</option>
                                <option value="pozew_zniesienie_wspolwlasnosci">▪ Pozew o zniesienie współwłasności</option>
                            </optgroup>
                            
                            <optgroup label="§ Inne dokumenty">
                                <option value="umowa_zlecenie">▪ Umowa zlecenia</option>
                                <option value="pelnomocnictwo">▪ Pełnomocnictwo procesowe</option>
                                <option value="ugoda">▪ Ugoda</option>
                                <option value="oswiadczenie">▪ Oświadczenie</option>
                                <option value="custom">▪ Dokument niestandardowy</option>
                            </optgroup>
                        </select>
                    </div>
                    
                    <div id="customDocumentField" style="margin-bottom: 20px; display: none;">
                        <label style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px;">Jaki dokument wygenerować? *</label>
                        <input type="text" id="customDocumentType" 
                               placeholder="Np. umowa zlecenia, pełnomocnictwo, odwołanie od decyzji..."
                               style="width: 100%; padding: 12px; border: 2px solid #d4af37; border-radius: 8px; font-size: 1rem; color: #1a1a2e; background: white;">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px;">Styl dokumentu:</label>
                        <select id="documentStyle" style="width: 100%; padding: 12px; border: 2px solid #d4af37; border-radius: 8px; font-size: 1rem; color: #1a1a2e; background: white;">
                            <option value="formal">📜 Formalny (sąd, urząd)</option>
                            <option value="simplified">📋 Uproszczony (klient, wewnętrzny)</option>
                            <option value="draft">✍️ Robocza notatka</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px;">Szczegółowość:</label>
                        <select id="documentDetail" style="width: 100%; padding: 12px; border: 2px solid #d4af37; border-radius: 8px; font-size: 1rem; color: #1a1a2e; background: white;">
                            <option value="short">📄 Krótka (1 strona)</option>
                            <option value="normal" selected>📄📄 Normalna (2-3 strony)</option>
                            <option value="detailed">📄📄📄 Szczegółowa (5+ stron)</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px; background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #d4af37;">
                        <label style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 10px;">✨ Auto-wypełnij danymi z sprawy:</label>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #2c3e50;">
                                <input type="checkbox" id="autoFillParties" checked style="width: 18px; height: 18px; cursor: pointer;">
                                <span>Strony procesu (powód, pozwany)</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #2c3e50;">
                                <input type="checkbox" id="autoFillCourt" checked style="width: 18px; height: 18px; cursor: pointer;">
                                <span>Sąd i sygnatura</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #2c3e50;">
                                <input type="checkbox" id="autoFillEvidence" checked style="width: 18px; height: 18px; cursor: pointer;">
                                <span>Dowody i dokumenty</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #2c3e50;">
                                <input type="checkbox" id="autoFillWitnesses" checked style="width: 18px; height: 18px; cursor: pointer;">
                                <span>Świadkowie i zeznania</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #2c3e50;">
                                <input type="checkbox" id="autoFillEvents" checked style="width: 18px; height: 18px; cursor: pointer;">
                                <span>Wydarzenia i terminy</span>
                            </label>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px;">Dodatkowe informacje (opcjonalnie):</label>
                        <textarea id="additionalInfo" 
                                  placeholder="Np. szczególne okoliczności, wnioski dowodowe, terminy..."
                                  style="width: 100%; padding: 12px; border: 2px solid #d4af37; border-radius: 8px; font-size: 1rem; min-height: 100px; resize: vertical; color: #1a1a2e; background: white;"></textarea>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button onclick="document.getElementById('documentGeneratorModal').remove()" 
                                style="padding: 12px 24px; background: #1a1a2e; color: #d4af37; border: 2px solid #d4af37; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Anuluj
                        </button>
                        <button onclick="aiAssistant.generateDocument()" 
                                style="padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            🤖 Generuj szkic
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', generatorHtml);
    }

    // Generate document
    async generateDocument() {
        let documentType = document.getElementById('documentType').value;
        const additionalInfo = document.getElementById('additionalInfo').value;
        const documentStyle = document.getElementById('documentStyle').value;
        const documentDetail = document.getElementById('documentDetail').value;
        
        // Zbierz opcje auto-fill
        const autoFillOptions = {
            parties: document.getElementById('autoFillParties')?.checked || false,
            court: document.getElementById('autoFillCourt')?.checked || false,
            evidence: document.getElementById('autoFillEvidence')?.checked || false,
            witnesses: document.getElementById('autoFillWitnesses')?.checked || false,
            events: document.getElementById('autoFillEvents')?.checked || false
        };
        
        // Sprawdź czy to custom dokument
        if (documentType === 'custom') {
            const customType = document.getElementById('customDocumentType').value.trim();
            if (!customType) {
                this.showToast('⚠️ Opisz jaki dokument wygenerować', 'warning');
                return;
            }
            documentType = customType;
        }
        
        document.getElementById('documentGeneratorModal').remove();
        
        const styleText = documentStyle === 'formal' ? 'Formalny' : documentStyle === 'simplified' ? 'Uproszczony' : 'Szkic';
        const detailText = documentDetail === 'short' ? 'Krótki' : documentDetail === 'detailed' ? 'Szczegółowy' : 'Normalny';
        
        this.addMessage('user', `Wygeneruj dokument: ${documentType} (${styleText}, ${detailText})${additionalInfo ? ` - ${additionalInfo}` : ''}`);
        
        // ═══ KROK 1: PEŁNA ANALIZA SPRAWY ═══
        this.addMessage('ai', '🔍 KROK 1/4: Analizuję pełną dokumentację sprawy...', 'loading');
        
        try {
            // Wywołaj NAJPIERW pełną analizę sprawy (czyta PDFy, świadków, wydarzenia!)
            const analysisResponse = await api.request('/ai/gemini/ask', {
                method: 'POST',
                body: JSON.stringify({
                    caseId: this.currentCaseId,
                    question: `Przeanalizuj MAKSYMALNIE SZCZEGÓŁOWO CAŁĄ sprawę:

1. DOKUMENTY PDF/DOCX:
   - Przeczytaj PEŁNĄ treść każdego dokumentu
   - Wyciągnij WSZYSTKIE kwoty, daty, nazwy firm
   - Zidentyfikuj kluczowe postanowienia umów

2. ŚWIADKOWIE:
   - Przeczytaj SZCZEGÓŁOWE OPISY każdego świadka (📝 pole "notes")
   - Przeanalizuj ich rolę w sprawie
   - Zidentyfikuj ich zeznania i wiarygodność
   - Wyciągnij konkretne informacje o ich zaangażowaniu

3. DOWODY:
   - Przeczytaj SZCZEGÓŁOWE NOTATKI o każdym dowodzie
   - Oceń ich istotność dla sprawy
   - Zidentyfikuj powiązania między dowodami

4. WYDARZENIA:
   - Przeanalizuj chronologię zdarzeń
   - Zidentyfikuj kluczowe daty i terminy

5. OBRAZY/OCR:
   - Przeanalizuj tekst rozpoznany z obrazów
   - Wyciągnij kluczowe informacje z WhatsApp, emaili

6. KOMENTARZE I NOTATKI:
   - Przeczytaj wszystkie komentarze prawników
   - Uwzględnij notatki wewnętrzne

Podaj BARDZO SZCZEGÓŁOWE podsumowanie zawierające:
- Wszystkie kwoty i faktury z datami
- Pełne informacje o świadkach i ich roli
- Chronologię wydarzeń
- Listę wszystkich dowodów
- Kluczowe fakty dla dokumentu: ${documentType}`
                })
            });
            
            this.removeLoadingMessage();
            
            // Pokaż wyniki analizy
            if (analysisResponse.answer) {
                this.addMessage('ai', `✅ KROK 1/4: Analiza zakończona\n\n${analysisResponse.answer.substring(0, 500)}...`, 'success');
            }
            
            // ═══ KROK 2: IDENTYFIKACJA RYZYK ═══
            this.addMessage('ai', '⚠️ KROK 2/4: Identyfikuję ryzyka prawne...', 'loading');
            
            const risksResponse = await api.request('/ai/gemini/ask', {
                method: 'POST',
                body: JSON.stringify({
                    caseId: this.currentCaseId,
                    question: `Na podstawie PEŁNEJ analizy dokumentów, świadków, dowodów i wydarzeń:

1. Zidentyfikuj WSZYSTKIE potencjalne ryzyka prawne:
   - Słabe punkty w argumentacji
   - Brakujące dowody lub dokumenty
   - Problemy z wiarygodnością świadków
   - Luki w dokumentacji
   - Potencjalne kontrargumenty strony przeciwnej

2. Oceń SIŁĘ każdego dowodu:
   - Które dowody są najsilniejsze?
   - Które są podatne na zakwestionowanie?

3. Przeanalizuj WIARYGODNOŚĆ świadków:
   - Na podstawie ich szczegółowych opisów (📝 notes)
   - Jakie są ich relacje ze stronami?
   - Czy ich zeznania są spójne?

4. Co należy WZMOCNIĆ w dokumencie ${documentType}?
   - Jakie argumenty bardziej rozwinąć?
   - Które przepisy prawne powołać?

Podaj szczegółową analizę ryzyk i rekomendacje.`
                })
            });
            
            this.removeLoadingMessage();
            
            if (risksResponse.answer) {
                this.addMessage('ai', `✅ KROK 2/4: Ryzyka zidentyfikowane\n\n${risksResponse.answer.substring(0, 400)}...`, 'warning');
            }
            
            // ═══ KROK 3: STRATEGIA I NASTĘPNE KROKI ═══
            this.addMessage('ai', '💡 KROK 3/4: Opracowuję strategię i następne kroki...', 'loading');
            
            const strategyResponse = await api.request('/ai/gemini/ask', {
                method: 'POST',
                body: JSON.stringify({
                    caseId: this.currentCaseId,
                    question: `Opracuj SZCZEGÓŁOWĄ strategię procesową dla dokumentu: ${documentType}

Uwzględnij:
1. WSZYSTKIE dowody i ich kolejność prezentacji
2. WSZYSTKICH świadków (ich szczegółowe opisy z 📝 notes) i jak ich wykorzystać
3. Konkretne artykuły kodeksów do powołania (KC, KPC, etc.)
4. Chronologię przedstawienia faktów
5. Kluczowe argumenty do uwypuklenia
6. Odpowiedzi na potencjalne zarzuty strony przeciwnej

Co DOKŁADNIE powinno znaleźć się w każdej sekcji dokumentu:
- Nagłówek: jakie dane?
- Stan faktyczny: jakie szczegóły?
- Uzasadnienie prawne: które artykuły?
- Wnioski: konkretne sformułowania?
- Dowody: w jakiej kolejności?

Podaj konkretny plan treści dokumentu.`
                })
            });
            
            this.removeLoadingMessage();
            
            if (strategyResponse.answer) {
                this.addMessage('ai', `✅ KROK 3/4: Strategia opracowana\n\n${strategyResponse.answer.substring(0, 400)}...`, 'info');
            }
            
            // ═══ KROK 4: GENEROWANIE DOKUMENTU Z PEŁNYM KONTEKSTEM ═══
            this.addMessage('ai', '📄 KROK 4/4: Generuję dokument na podstawie pełnej analizy...', 'loading');
            
            // TERAZ DOPIERO generuj dokument - AI ma już pełny kontekst w pamięci!
            const response = await api.request('/ai/gemini/generate-document', {
                method: 'POST',
                body: JSON.stringify({
                    caseId: this.currentCaseId,
                    documentType: documentType,
                    additionalInfo: additionalInfo + '\n\nUWAGA: Użyj WSZYSTKICH informacji z poprzedniej analizy dokumentów, świadków, wydarzeń i dowodów!',
                    style: documentStyle,
                    detail: documentDetail,
                    autoFill: autoFillOptions
                })
            });
            
            this.removeLoadingMessage();
            
            if (response.success) {
                this.addMessage('ai', '✅ DOKUMENT WYGENEROWANY! Użyto pełnej analizy sprawy.', 'success');
                this.showDocumentDraft(response.draft, documentType);
            } else {
                this.addMessage('ai', `❌ Błąd generowania: ${response.error}`, 'error');
            }
            
        } catch (error) {
            this.removeLoadingMessage();
            this.addMessage('ai', '❌ Błąd: ' + error.message, 'error');
        }
    }

    // Show generated document draft
    showDocumentDraft(draft, type) {
        const draftHtml = `
            <div id="documentDraftModal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10007; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease;">
                <div style="background: white; border-radius: 16px; padding: 30px; max-width: 900px; width: 95%; max-height: 90vh; overflow: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="color: #2c3e50; margin: 0; font-size: 1.4rem;">📄 Wygenerowany szkic dokumentu</h3>
                        <button onclick="document.getElementById('documentDraftModal').remove()" 
                                style="background: #d4af37; border: none; font-size: 1.8rem; cursor: pointer; color: #1a1a2e; width: 40px; height: 40px; border-radius: 50%; font-weight: bold; transition: all 0.3s;"
                                onmouseover="this.style.background='#ffd700'; this.style.transform='rotate(90deg)'"
                                onmouseout="this.style.background='#d4af37'; this.style.transform='rotate(0deg)'">
                            ✕
                        </button>
                    </div>
                    
                    <div style="background: #ffebee; border-left: 4px solid #f44336; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                        <strong style="color: #c62828;">⚠️ SZKIC DOKUMENTU</strong>
                        <div style="color: #c62828; margin-top: 8px; font-size: 0.9rem;">
                            Ten dokument został wygenerowany przez AI i wymaga:
                            <ul style="margin: 8px 0 0 20px;">
                                <li>Weryfikacji merytorycznej przez prawnika</li>
                                <li>Uzupełnienia miejsc oznaczonych [DO UZUPEŁNIENIA]</li>
                                <li>Sprawdzenia poprawności danych i dat</li>
                                <li>Dostosowania do specyfiki sprawy</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div style="background: #ffffff; border: 2px solid #d4af37; border-radius: 8px; padding: 20px; margin-bottom: 20px; white-space: pre-wrap; font-family: 'Courier New', monospace; font-size: 0.95rem; max-height: 500px; overflow-y: auto; color: #1a1a2e; line-height: 1.6;">
                        ${this.escapeHtml(draft)}
                    </div>
                    
                    <!-- Pole do zmiany nazwy pliku -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; color: #2c3e50; font-weight: 600; margin-bottom: 8px;">Nazwa pliku (opcjonalnie):</label>
                        <input type="text" id="documentFileName" 
                               placeholder="Np. Pozew_o_odszkodowanie"
                               style="width: 100%; padding: 12px; border: 2px solid #d4af37; border-radius: 8px; font-size: 1rem; color: #1a1a2e; background: white;"
                               value="">
                        <div style="color: #7f8c8d; font-size: 0.85rem; margin-top: 4px;">
                            Jeśli puste, zostanie użyta domyślna nazwa: "Szkic AI: ${type}"
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
                        <button onclick="aiAssistant.copyDraft()" 
                                style="padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            📋 Skopiuj
                        </button>
                        <button onclick="aiAssistant.saveDraftToCase('${type}')" 
                                style="padding: 12px 24px; background: #d4af37; color: #1a1a2e; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; box-shadow: 0 2px 8px rgba(212,175,55,0.3);">
                            💾 Dodaj do sprawy
                        </button>
                        <button onclick="aiAssistant.downloadDraft('${type}')" 
                                style="padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            📄 Pobierz Word
                        </button>
                        <button onclick="document.getElementById('documentDraftModal').remove()" 
                                style="padding: 12px 24px; background: #1a1a2e; color: #d4af37; border: 2px solid #d4af37; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Zamknij
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', draftHtml);
    }

    // Copy draft to clipboard
    async copyDraft() {
        const draftText = document.querySelector('#documentDraftModal pre, #documentDraftModal div[style*="monospace"]').textContent;
        
        try {
            await navigator.clipboard.writeText(draftText);
            this.showToast('✅ Skopiowano do schowka', 'success');
        } catch (error) {
            this.showToast('❌ Błąd kopiowania', 'error');
        }
    }

    // Save draft to case documents
    async saveDraftToCase(type) {
        const draftText = document.querySelector('#documentDraftModal pre, #documentDraftModal div[style*="monospace"]').textContent;
        
        // Pobierz niestandardową nazwę pliku (jeśli podana)
        const customFileName = document.getElementById('documentFileName')?.value.trim();
        
        try {
            // Przygotuj HTML content
            const htmlContent = this.generateDocumentHTML(draftText, type);
            
            // Konwertuj na blob
            const blob = new Blob(['\ufeff' + htmlContent], { 
                type: 'application/msword;charset=utf-8' 
            });
            
            // Utwórz nazwę pliku
            const fileTitle = customFileName || `Szkic AI: ${type}`;
            const fileName = customFileName 
                ? `${customFileName.replace(/[^a-zA-Z0-9_ąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]/g, '_')}.doc`
                : `AI_szkic_${type}_${new Date().toISOString().split('T')[0]}.doc`;
            
            // Przygotuj FormData
            const formData = new FormData();
            formData.append('file', blob, fileName);
            formData.append('case_id', this.currentCaseId);
            formData.append('title', fileTitle);
            formData.append('description', 'Dokument wygenerowany przez AI - wymaga weryfikacji prawnika');
            formData.append('category', 'ai_generated');
            
            // Wyślij do backendu - poprawny endpoint
            const response = await fetch(`https://web-production-7504.up.railway.app/api/cases/${this.currentCaseId}/documents`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            
            if (!response.ok) throw new Error('Błąd zapisu dokumentu');
            
            this.showToast('✅ Dokument dodany do sprawy!', 'success');
            
            // Odśwież listę dokumentów w modalu sprawy (jeśli jest otwarty)
            if (window.crmManager && typeof window.crmManager.loadCaseDocuments === 'function') {
                console.log('🔄 Odświeżanie listy dokumentów...');
                await window.crmManager.loadCaseDocuments(this.currentCaseId);
            }
            
            // Zamknij modal dokumentu
            document.getElementById('documentDraftModal').remove();
            
        } catch (error) {
            console.error('Error saving draft:', error);
            this.showToast('❌ Błąd zapisu dokumentu: ' + error.message, 'error');
        }
    }

    // Generate HTML content for document
    generateDocumentHTML(draftText, type) {
        return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Szkic dokumentu - ${type}</title>
    <style>
        @page {
            size: A4;
            margin: 2.5cm 1.5cm 2.5cm 3.5cm;
        }
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.5;
            margin: 0;
            padding: 0;
            color: #000;
            text-align: justify;
        }
        p {
            margin: 0 0 6pt 0;
            text-indent: 0;
        }
        h1, h2, h3 {
            font-family: 'Times New Roman', serif;
            font-weight: bold;
            text-align: center;
            margin: 12pt 0;
        }
    </style>
</head>
<body>
    ${draftText.split('\n').map(line => {
        // Zachowaj puste linie
        if (!line.trim()) return '<p>&nbsp;</p>';
        // Wykryj nagłówki (WIELKIE LITERY)
        if (line === line.toUpperCase() && line.length < 50 && line.trim().length > 0) {
            return `<p style="text-align: center; font-weight: bold;">${line}</p>`;
        }
        return `<p>${line}</p>`;
    }).join('\n')}
</body>
</html>`;
    }

    // Download draft as Word file
    downloadDraft(type) {
        const draftText = document.querySelector('#documentDraftModal pre, #documentDraftModal div[style*="monospace"]').textContent;
        const htmlContent = this.generateDocumentHTML(draftText, type);
        
        // Pobierz niestandardową nazwę pliku (jeśli podana)
        const customFileName = document.getElementById('documentFileName')?.value.trim();
        
        // Zapisz jako .doc (HTML format - Word otworzy bez problemu)
        const blob = new Blob(['\ufeff' + htmlContent], { 
            type: 'application/msword;charset=utf-8' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Użyj niestandardowej nazwy lub domyślnej
        if (customFileName) {
            a.download = `${customFileName.replace(/[^a-zA-Z0-9_ąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]/g, '_')}.doc`;
        } else {
            a.download = `szkic_${type}_${new Date().toISOString().split('T')[0]}.doc`;
        }
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('✅ Pobrano szkic - otworzy się w Word z poprawnymi znakami', 'success');
    }

    // Close AI modal
    closeAI() {
        const modal = document.getElementById('aiModal');
        if (modal) {
            modal.remove();
            // Usuń nasłuchiwanie ESC
            document.removeEventListener('keydown', this.escapeHandler);
        }
        this.messages = [];
    }

    // Helper: escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Helper: show toast
    showToast(message, type) {
        // Prosty toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#3B82F6' : type === 'error' ? '#f44336' : '#3B82F6'};
            color: white;
            border-radius: 8px;
            font-weight: 600;
            z-index: 99999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize AI Assistant
const aiAssistant = new AIAssistant();

