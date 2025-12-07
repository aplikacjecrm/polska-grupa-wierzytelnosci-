// ==========================================
// AI ASSISTANT MODULE
// Asystent AI dla spraw prawnych (Gemini + Claude)
// ==========================================

(function() {
    console.log('🤖 AI Assistant Module: Loading...');

    let currentCaseId = null;
    let currentCaseData = null;
    let aiProvider = 'gemini'; // 'gemini' lub 'claude'

    // Sprawdź dostępność AI przy starcie
    async function checkAIStatus() {
        try {
            const response = await fetch('/api/ai/status', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const status = await response.json();
                console.log('🤖 AI Status:', status);

                // Wybierz najlepszy dostępny provider
                if (status.gemini.configured) {
                    aiProvider = 'gemini';
                    console.log('✅ Używam Gemini AI');
                } else if (status.claude.configured) {
                    aiProvider = 'claude';
                    console.log('✅ Używam Claude AI');
                } else {
                    console.warn('⚠️ Brak skonfigurowanego AI');
                }

                return status;
            }
        } catch (error) {
            console.error('❌ Błąd sprawdzania statusu AI:', error);
        }
        return null;
    }

    // Renderuj panel AI Asystenta
    function renderAIPanel(caseId, caseData) {
        currentCaseId = caseId;
        currentCaseData = caseData;

        const container = document.getElementById('ai-assistant-panel');
        if (!container) {
            console.warn('Brak kontenera #ai-assistant-panel');
            return;
        }

        container.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);">
                
                <!-- Nagłówek -->
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                    <h3 style="margin: 0; font-size: 1.3rem; color: white !important;">
                        🤖 AI Asystent Prawny
                    </h3>
                    <select id="ai-provider-select" style="padding: 6px 12px; border-radius: 6px; border: none; background: rgba(255,255,255,0.2); color: white; font-size: 0.9rem;">
                        <option value="gemini">Gemini AI</option>
                        <option value="claude">Claude AI</option>
                    </select>
                </div>

                <!-- Szybkie Akcje -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 20px;">
                    <button onclick="AIAssistant.quickAnalyze()" style="padding: 12px; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                        📊 Analizuj Sprawę
                    </button>
                    <button onclick="AIAssistant.suggestActions()" style="padding: 12px; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                        💡 Sugestie
                    </button>
                    <button onclick="AIAssistant.findPrecedents()" style="padding: 12px; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                        ⚖️ Precedensy
                    </button>
                    <button onclick="AIAssistant.generateSummary()" style="padding: 12px; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.1); color: white; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.3s;">
                        📝 Podsumowanie
                    </button>
                </div>

                <!-- Pole pytania -->
                <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 10px; backdrop-filter: blur(10px);">
                    <textarea 
                        id="ai-question-input" 
                        placeholder="Zadaj pytanie o sprawę..." 
                        style="width: 100%; min-height: 80px; padding: 12px; border: none; border-radius: 8px; font-size: 0.95rem; resize: vertical; background: white; color: #333;"
                    ></textarea>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button onclick="AIAssistant.askQuestion()" style="flex: 1; padding: 12px; background: white; color: #667eea; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 1rem;">
                            ✨ Zapytaj AI
                        </button>
                        <button onclick="AIAssistant.clearConversation()" style="padding: 12px 20px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 8px; cursor: pointer;">
                            🗑️ Wyczyść
                        </button>
                    </div>
                </div>

                <!-- Odpowiedzi AI -->
                <div id="ai-responses" style="margin-top: 20px; max-height: 400px; overflow-y: auto;">
                    <!-- Tutaj pojawią się odpowiedzi -->
                </div>

            </div>

            <style>
                #ai-assistant-panel button:hover {
                    background: rgba(255,255,255,0.25) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                
                #ai-responses::-webkit-scrollbar {
                    width: 8px;
                }
                
                #ai-responses::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                
                #ai-responses::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.3);
                    border-radius: 10px;
                }
            </style>
        `;

        // Ustaw wybrany provider
        const select = document.getElementById('ai-provider-select');
        if (select) {
            select.value = aiProvider;
            select.addEventListener('change', (e) => {
                aiProvider = e.target.value;
                console.log('🔄 Zmieniono AI provider na:', aiProvider);
            });
        }
    }

    // Dodaj odpowiedź do panelu
    function addResponse(question, answer, type = 'success') {
        const responsesContainer = document.getElementById('ai-responses');
        if (!responsesContainer) return;

        const responseElement = document.createElement('div');
        responseElement.style.cssText = `
            background: rgba(255,255,255,0.95);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 15px;
            color: #333;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;

        responseElement.innerHTML = `
            <div style="font-weight: 600; color: #667eea; margin-bottom: 8px; font-size: 0.9rem;">
                👤 Pytanie:
            </div>
            <div style="padding: 10px; background: rgba(102,126,234,0.1); border-radius: 6px; margin-bottom: 12px; font-size: 0.95rem;">
                ${question}
            </div>
            
            <div style="font-weight: 600; color: ${type === 'error' ? '#e53935' : '#4caf50'}; margin-bottom: 8px; font-size: 0.9rem;">
                🤖 ${aiProvider === 'gemini' ? 'Gemini' : 'Claude'} AI:
            </div>
            <div style="padding: 10px; background: ${type === 'error' ? 'rgba(229,57,53,0.1)' : 'rgba(76,175,80,0.1)'}; border-radius: 6px; line-height: 1.6; font-size: 0.95rem; white-space: pre-wrap;">
                ${answer}
            </div>
        `;

        responsesContainer.insertBefore(responseElement, responsesContainer.firstChild);
        responsesContainer.scrollTop = 0;
    }

    // Zadaj pytanie
    async function askQuestion() {
        const input = document.getElementById('ai-question-input');
        if (!input || !input.value.trim()) {
            alert('Wpisz pytanie!');
            return;
        }

        const question = input.value.trim();
        input.value = '';

        // Wyświetl loader
        addResponse(question, '⏳ Myślę...', 'loading');

        try {
            const response = await fetch(`/api/ai/${aiProvider}/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    question: question,
                    context: currentCaseData ? JSON.stringify(currentCaseData) : ''
                })
            });

            const data = await response.json();

            // Usuń loader
            const responsesContainer = document.getElementById('ai-responses');
            if (responsesContainer && responsesContainer.firstChild) {
                responsesContainer.firstChild.remove();
            }

            if (data.success !== false) {
                addResponse(question, data.answer || data.response, 'success');
            } else {
                addResponse(question, '❌ ' + (data.error || 'Błąd AI'), 'error');
            }

        } catch (error) {
            console.error('Błąd AI:', error);
            addResponse(question, '❌ Błąd połączenia z AI', 'error');
        }
    }

    // Szybka analiza sprawy
    async function quickAnalyze() {
        if (!currentCaseData) {
            alert('Brak danych sprawy');
            return;
        }

        const question = 'Przeanalizuj tę sprawę i podaj kluczowe informacje, podstawę prawną oraz zalecane działania.';
        addResponse(question, '⏳ Analizuję sprawę...', 'loading');

        try {
            const response = await fetch(`/api/ai/${aiProvider}/summary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    caseData: currentCaseData
                })
            });

            const data = await response.json();

            const responsesContainer = document.getElementById('ai-responses');
            if (responsesContainer && responsesContainer.firstChild) {
                responsesContainer.firstChild.remove();
            }

            if (data.success !== false) {
                addResponse(question, data.summary || data.response, 'success');
            } else {
                addResponse(question, '❌ ' + (data.error || 'Błąd analizy'), 'error');
            }

        } catch (error) {
            console.error('Błąd analizy:', error);
            addResponse(question, '❌ Błąd połączenia', 'error');
        }
    }

    // Sugestie działań
    async function suggestActions() {
        const question = 'Jakie działania powinienem podjąć w tej sprawie? Podaj konkretne kroki z terminami.';
        document.getElementById('ai-question-input').value = question;
        askQuestion();
    }

    // Znajdź precedensy
    async function findPrecedents() {
        if (!currentCaseData) {
            alert('Brak danych sprawy');
            return;
        }

        const question = 'Znajdź podobne precedensy i orzecznictwo dla tej sprawy';
        addResponse(question, '⏳ Szukam precedensów...', 'loading');

        try {
            const response = await fetch(`/api/ai/${aiProvider}/precedents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    caseDescription: JSON.stringify(currentCaseData)
                })
            });

            const data = await response.json();

            const responsesContainer = document.getElementById('ai-responses');
            if (responsesContainer && responsesContainer.firstChild) {
                responsesContainer.firstChild.remove();
            }

            if (data.success !== false) {
                addResponse(question, data.suggestions || data.response, 'success');
            } else {
                addResponse(question, '❌ ' + (data.error || 'Błąd wyszukiwania'), 'error');
            }

        } catch (error) {
            console.error('Błąd precedensów:', error);
            addResponse(question, '❌ Błąd połączenia', 'error');
        }
    }

    // Generuj podsumowanie
    async function generateSummary() {
        quickAnalyze(); // Używa tej samej funkcji
    }

    // Wyczyść konwersację
    function clearConversation() {
        const responsesContainer = document.getElementById('ai-responses');
        if (responsesContainer) {
            responsesContainer.innerHTML = '';
        }
    }

    // Eksportuj API
    window.AIAssistant = {
        render: renderAIPanel,
        askQuestion: askQuestion,
        quickAnalyze: quickAnalyze,
        suggestActions: suggestActions,
        findPrecedents: findPrecedents,
        generateSummary: generateSummary,
        clearConversation: clearConversation,
        checkStatus: checkAIStatus
    };

    // Sprawdź status AI przy starcie
    checkAIStatus();

    console.log('✅ AI Assistant Module: Loaded');

})();
