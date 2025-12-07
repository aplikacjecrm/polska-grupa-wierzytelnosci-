// ==========================================
// QUESTIONNAIRE PANELS - SYSTEM PANELI ANKIET
// ==========================================
// v13 - Dodano panel prawa specjalnego MOR/ENE/OZE/LOT/IT

console.log('📋 Ładowanie questionnaire-panels.js v13...'); 

window.questionnairePanels = {
    
    // ===== PANEL ANKIETY WINDYKACYJNEJ =====
    renderDebtCollectionPanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">📜</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Windykacyjna</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Kompleksowe dochodzenie należności - od wezwania do egzekucji</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">12 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">9 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">⚖️</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">AI Analiza</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Siła dowodów</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">20 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                </div>
                <button onclick="window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(${caseId}, 'debt_collection')" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    📜 Wypełnij ankietę windykacyjną
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    💰 Wezwanie do zapłaty • ⚖️ Pozew • 🔨 Egzekucja komornicza
                </p>
            </div>
        `;
    },

    // ===== PANEL ANKIETY ODSZKODOWAWCZEJ =====
    renderCompensationPanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">💰</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Odszkodowawcza</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Kompleksowe dochodzenie odszkodowania i zadośćuczynienia</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">10 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">8 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">🏢</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">15 TU</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Baza kontaktów</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">22 Dokumenty</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                </div>
                <button onclick="window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(${caseId}, 'compensation')" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    💰 Wypełnij ankietę odszkodowawczą
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    ⚖️ Dochodzenie roszczeń • 🏢 Integracja z TU • 📊 Pełna procedura
                </p>
            </div>
        `;
    },

    // ===== PANEL ANKIETY UPADŁOŚCIOWEJ =====
    renderBankruptcyPanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">📉</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Upadłościowa</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Postępowanie upadłościowe - likwidacja lub układ z wierzycielami</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">8 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">👨‍⚖️</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">Syndyk</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Dane kontaktowe</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">9 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                </div>
                <button onclick="window.questionnaireRenderer && window.questionnaireRenderer.renderBankruptcyQuestionnaire(${caseId})" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    📉 Wypełnij ankietę upadłościową
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    ⚠️ Wniosek (30 dni!) • 👨‍⚖️ Syndyk • 🔄 Likwidacja/Układ
                </p>
            </div>
        `;
    },

    // ===== PANEL ANKIETY RESTRUKTURYZACYJNEJ =====
    renderRestructuringPanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">🔄</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Restrukturyzacyjna</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Postępowanie restrukturyzacyjne - ratowanie firmy przed upadłością</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">8 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">6 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">🤝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">Plan układowy</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Propozycje</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">12 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                </div>
                <button onclick="window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(${caseId}, 'restructuring')" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    🔄 Wypełnij ankietę restrukturyzacyjną
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    🔄 4 tryby postępowania • 🤝 Układ • 📊 Plan naprawczy
                </p>
            </div>
        `;
    },

    // ===== PANEL ANKIETY KARNEJ =====
    renderCriminalPanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">🚔</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Karna</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Kompleksowa obrona w sprawach karnych - od przesłuchania do wyroku</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">15 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">🛡️</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">Strategia obrony</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">AI Analiza</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">18 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                </div>
                <button onclick="window.openCriminalQuestionnaire && window.openCriminalQuestionnaire(${caseId})" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    🚔 Wypełnij ankietę karną
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    🚔 Przesłuchanie • 🛡️ Obrona • ⚖️ Rozprawa • 📜 Wyrok
                </p>
            </div>
        `;
    },

    // ===== PANEL ANKIETY GOSPODARCZEJ =====
    renderCommercialPanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">💼</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Gospodarcza</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Postępowanie gospodarcze - dochodzenie należności B2B, windykacja sądowa</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">9 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">👨‍⚖️</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">Komornik</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Dane kontaktowe</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">15 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                </div>
                <button onclick="window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(${caseId}, 'commercial')" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    💼 Wypełnij ankietę gospodarczą
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    💰 Wezwanie do zapłaty • ⚖️ Pozew (SO-GOSP) • 🚨 Zabezpieczenie • 🔨 Egzekucja
-                </p>
            </div>
        `;
    },

    // ===== PANEL ANKIETY SPADKOWEJ =====
    renderInheritancePanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">🎗️</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Spadkowa</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Postępowanie spadkowe - nabycie spadku, dział majątku, testament</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">⏰</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">6 miesięcy</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Termin decyzji</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">15 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                </div>
                <button onclick="window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(${caseId}, 'inheritance')" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    🎗️ Wypełnij ankietę spadkową
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    📋 Zgon • 📜 Testament • ⚖️ Sąd • 💰 Dział spadku
                </p>
            </div>
        `;
    },

    // ===== PANEL ANKIETY MAJĄTKOWEJ =====
    renderPropertyPanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">🏠</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Majątkowa</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Sprawy o własność, służebności, roszczenia rzeczowe</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">16 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">🤖</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">6 Generatorów AI</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Automatyzacja</div>
                    </div>
                </div>
                <button onclick="window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(${caseId}, 'property')" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    🏠 Wypełnij ankietę majątkową
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    📋 Własność • 🚪 Służebności • 💰 Roszczenia • ⚖️ Windykacja
                </p>
            </div>
        `;
    },

    // ===== PANEL ANKIETY UMOWNEJ =====
    renderContractPanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">📄</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Umowna</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Umowy cywilno-prawne, roszczenia, zapłata, wykonanie</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">10 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">🤖</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">4 Generatory AI</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Automatyzacja</div>
                    </div>
                </div>
                <button onclick="window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(${caseId}, 'contract')" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    📄 Wypełnij ankietę umowną
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    📋 Sprzedaż • 🏠 Najem • 💰 Pożyczka • ⚖️ Usługi • 📄 Dzieło
                </p>
            </div>
        `;
    },

    // ===== PANEL ANKIETY RODZINNEJ =====
    renderFamilyPanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">👨‍👩‍👧‍👦</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Rodzinna</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Rozwody, alimenty, opieka nad dziećmi, władza rodzicielska</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">10 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">13 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">🤖</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Generatorów AI</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Automatyzacja</div>
                    </div>
                </div>
                <button onclick="window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(${caseId}, 'family')" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    👨‍👩‍👧‍👦 Wypełnij ankietę rodzinną
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    💔 Rozwód • 💰 Alimenty • 👶 Opieka • 🤝 Kontakty • ⚖️ Władza rodzicielska
                </p>
            </div>
        `;
    },

    // ===== PANEL ANKIETY BUDOWLANEJ =====
    renderBuildingPanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">🏗️</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Budowlana</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Prawo budowlane - pozwolenia, decyzje, spory, WSA/NSA</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">8 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">14 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">🤖</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">5 Generatorów AI</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Automatyzacja</div>
                    </div>
                </div>
                <button onclick="window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(${caseId}, 'building')" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    🏗️ Wypełnij ankietę budowlaną
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    🏢 Pozwolenia • ⚠️ Decyzje • 🏛️ WSA/NSA • 🔬 Ekspertyzy • 🏘️ Spory
                </p>
            </div>
        `;
    },

    // ===== PANEL ANKIETY PODATKOWEJ =====
    renderTaxPanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">🔥</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Podatkowa</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Prawo podatkowe - kontrole, decyzje, spory, US/ZUS/GIS</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">8 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">15 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">🤖</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Generatorów AI</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Automatyzacja</div>
                    </div>
                </div>
                <button onclick="window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(${caseId}, 'tax')" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    🔥 Wypełnij ankietę podatkową
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    💰 VAT/PIT/CIT • 🔍 Kontrole • ⚖️ Odwołania • 🏛️ WSA/NSA • 💸 Egzekucja
                </p>
            </div>
        `;
    },

    // ===== PANEL ANKIETY ZAGOSPODAROWANIA =====
    renderZoningPanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">🗺️</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Zagospodarowania Przestrzennego</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">MPZP, Warunki Zabudowy, decyzje lokalizacyjne, WSA/NSA</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">8 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">7 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">15 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">🤖</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">6 Generatorów AI</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Automatyzacja</div>
                    </div>
                </div>
                <button onclick="window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(${caseId}, 'zoning')" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    🗺️ Wypełnij ankietę zagospodarowania
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    📐 MPZP • 📋 WZ • 🏛️ Decyzje • ⚖️ WSA/NSA • 💰 Odszkodowania
                </p>
            </div>
        `;
    },
    
    // ===== PANEL PRAWA MIĘDZYNARODOWEGO (MIE/EUR/ARB) =====
    renderInternationalPanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">🌍</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Prawa Międzynarodowego</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Międzynarodowe, Prawo UE, Arbitraż - kompleksowo</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">8 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">8 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">18 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">🤖</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">8 Generatorów AI</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Automatyzacja</div>
                    </div>
                </div>
                <button onclick="window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(${caseId}, 'international')" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    🌍 Wypełnij ankietę międzynarodową
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    ⚖️ Arbitraż ICC/LCIA • 🇪🇺 TSUE • 📜 Konwencje • 🌐 Egzekucja • 💼 Umowy międzynarodowe
                </p>
            </div>
        `;
    },
    
    // ===== PANEL PRAWA SPECJALNEGO (MOR/ENE/OZE/LOT/IT) =====
    renderSpecialPanel(caseId) {
        return `
            <div style="background: linear-gradient(135deg, #1a2332, #2c3e50); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(255,215,0,0.4); text-align: center; margin-bottom: 20px; border: 2px solid #FFD700;">
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <div style="font-size: 3rem;">⚡</div>
                    <div style="text-align: left;">
                        <h3 style="margin: 0; color: white; font-size: 1.4rem;">Ankieta Prawa Specjalnego</h3>
                        <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Morskie, Energetyka, OZE, Lotnicze, IT - kompleksowo</p>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 25px; margin-top: 20px;">
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📝</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">8 Sekcji</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Pytania</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📅</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">6 Faz</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Procedura</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">📄</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">12 Dokumentów</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Checklist</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
                        <div style="font-size: 1.5rem; margin-bottom: 8px;">🤖</div>
                        <div style="color: white; font-size: 0.9rem; font-weight: 600;">6 Generatorów AI</div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 0.8rem;">Automatyzacja</div>
                    </div>
                </div>
                <button onclick="window.questionnaireRenderer && window.questionnaireRenderer.openQuestionnaire(${caseId}, 'special')" style="padding: 18px 40px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px solid #1a2332; border-radius: 12px; font-weight: 700; font-size: 1.2rem; cursor: pointer; box-shadow: rgba(0, 0, 0, 0.3) 0px 6px 20px; transition: 0.3s; margin-top: 20px; transform: scale(1); outline: none;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)'">
                    ⚡ Wypełnij ankietę prawa specjalnego
                </button>
                <p style="color: rgba(255,255,255,0.8); margin-top: 15px; font-size: 0.9rem;">
                    ⚓ Morskie • ⚡ Energetyka • 🌱 OZE • ✈️ Lotnicze • 💻 IT
                </p>
            </div>
        `;
    },

    // ===== AUTOMATYCZNE RENDEROWANIE =====
    autoRender(caseData, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn('⚠️ Nie znaleziono kontenera:', containerId);
            return false;
        }

        const caseType = caseData.case_type;
        const caseNumber = caseData.case_number || '';
        let panel = null;

        // WAŻNE: Numer sprawy ma priorytet nad typem!
        // Upadłość (sprawdzamy NAJPIERW numer, żeby nie pokazywać "commercial" dla UPA)
        if (caseNumber.startsWith('UPA')) {
            panel = this.renderBankruptcyPanel(caseData.id);
        }
        // Windykacja
        else if (caseType === 'debt_collection' || caseNumber.startsWith('WIN')) {
            panel = this.renderDebtCollectionPanel(caseData.id);
        }
        // Odszkodowanie
        else if (caseType === 'compensation' || caseNumber.startsWith('ODS')) {
            panel = this.renderCompensationPanel(caseData.id);
        }
        // Upadłość (jeśli nie ma numeru UPA ale typ = bankruptcy)
        else if (caseType === 'bankruptcy') {
            panel = this.renderBankruptcyPanel(caseData.id);
        }
        // Restrukturyzacja
        else if (caseType === 'restructuring' || caseNumber.startsWith('RES')) {
            panel = this.renderRestructuringPanel(caseData.id);
        }
        // Gospodarcze
        else if (caseType === 'commercial' || caseNumber.startsWith('GOS')) {
            panel = this.renderCommercialPanel(caseData.id);
        }
        // Spadkowe
        else if (caseType === 'inheritance' || caseNumber.startsWith('SPA')) {
            panel = this.renderInheritancePanel(caseData.id);
        }
        // Majątkowe
        else if (caseType === 'property' || caseNumber.startsWith('MAJ')) {
            panel = this.renderPropertyPanel(caseData.id);
        }
        // Umowne
        else if (caseType === 'contract' || caseNumber.startsWith('UMO')) {
            panel = this.renderContractPanel(caseData.id);
        }
        // Rodzinne
        else if (caseType === 'family' || caseNumber.startsWith('ROD')) {
            panel = this.renderFamilyPanel(caseData.id);
        }
        // Budowlane
        else if (caseType === 'building' || caseNumber.startsWith('BUD')) {
            panel = this.renderBuildingPanel(caseData.id);
        }
        // Podatkowe
        else if (caseType === 'tax' || caseNumber.startsWith('POD')) {
            panel = this.renderTaxPanel(caseData.id);
        }
        // Zagospodarowanie
        else if (caseType === 'zoning' || caseNumber.startsWith('ZAG')) {
            panel = this.renderZoningPanel(caseData.id);
        }
        // Prawo międzynarodowe (NOWE! MIE/EUR/ARB)
        else if (caseType === 'international' || caseType === 'european' || caseType === 'arbitration' || 
                 caseNumber.startsWith('MIE') || caseNumber.startsWith('EUR') || caseNumber.startsWith('ARB')) {
            panel = this.renderInternationalPanel(caseData.id);
        }
        // Prawo specjalne (NOWE! MOR/ENE/OZE/LOT/IT)
        else if (caseType === 'maritime' || caseType === 'energy' || caseType === 'renewable' || caseType === 'aviation' || caseType === 'it' ||
                 caseNumber.startsWith('MOR') || caseNumber.startsWith('ENE') || caseNumber.startsWith('OZE') || caseNumber.startsWith('LOT') || caseNumber.startsWith('IT/')) {
            panel = this.renderSpecialPanel(caseData.id);
        }
        // Karne
        else if (window.isCriminalCase && (window.isCriminalCase(caseType) || window.isCriminalCase(caseNumber))) {
            panel = this.renderCriminalPanel(caseData.id);
        }

        if (panel) {
            container.innerHTML = panel + container.innerHTML;
            console.log('✅ Dodano panel ankiety dla:', caseType || caseNumber);
            return true;
        }

        return false;
    }
};

console.log('✅ Questionnaire Panels - Ready!');
