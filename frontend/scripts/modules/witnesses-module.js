// ==========================================
// MODUŁ ŚWIADKÓW
// ==========================================

console.log('👤 Ładuję moduł świadków...');

// Sprawdź czy moduł jest włączony
if (!window.isModuleEnabled || !window.isModuleEnabled('witnesses')) {
    console.warn('⚠️ Moduł świadków jest wyłączony');
    // Nie ładuj reszty modułu
} else {

// === FUNKCJA RENDEROWANIA ZAKŁADKI ŚWIADKÓW ===

window.renderWitnessesTab = async function(caseId) {
    console.log('👤 Renderuję zakładkę świadków dla sprawy:', caseId);
    
    try {
        // Pobierz świadków
        const response = await window.api.request(`/witnesses/case/${caseId}`);
        const witnesses = response.witnesses || [];
        
        console.log('👤 Pobrano świadków:', witnesses.length);
        
        // Mapowanie statusów i relacji
        const statusConfig = {
            'confirmed': { label: 'Potwierdzony', color: '#3B82F6', emoji: '✅' },
            'withdrawn': { label: 'Wycofany', color: '#dc3545', emoji: '⚠️' },
            'unreliable': { label: 'Niewiarygodny', color: '#3B82F6', emoji: '❓' },
            'hostile': { label: 'Wrogi', color: '#3B82F6', emoji: '❌' }
        };
        
        const relationConfig = {
            'plaintiff': { label: 'Powód', emoji: '⚖️' },
            'defendant': { label: 'Pozwany', emoji: '🛡️' },
            'neutral': { label: 'Neutralny', emoji: '👤' },
            'expert': { label: 'Ekspert', emoji: '🎓' },
            'victim': { label: 'Pokrzywdzony', emoji: '😢' },
            'perpetrator': { label: 'Sprawca', emoji: '⚠️' },
            'eyewitness': { label: 'Naoczny świadek', emoji: '👁️' },
            'character_witness': { label: 'Świadek charakteru', emoji: '⭐' },
            'professional': { label: 'Świadek zawodowy', emoji: '💼' },
            'family': { label: 'Członek rodziny', emoji: '👨‍👩‍👧' },
            'neighbor': { label: 'Sąsiad', emoji: '🏘️' },
            'coworker': { label: 'Współpracownik', emoji: '🤝' },
            'business_partner': { label: 'Partner biznesowy', emoji: '💼' },
            'official': { label: 'Przedstawiciel urzędu', emoji: '🏛️' },
            'investigator': { label: 'Funkcjonariusz', emoji: '🔍' },
            'medical': { label: 'Personel medyczny', emoji: '⚕️' },
            'technical': { label: 'Świadek techniczny', emoji: '🔧' },
            'creditor': { label: 'Wierzyciel', emoji: '💰' },
            'debtor': { label: 'Dłużnik', emoji: '📉' }
        };
        
        return `
            <div style="padding: 20px;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #1a2332;">👤 Świadkowie (${witnesses.length})</h3>
                    <button onclick="witnessesModule.showAddWitnessForm(${caseId})" style="
                        padding: 10px 20px;
                        background: linear-gradient(135deg, #3B82F6, #1E40AF);
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 0.95rem;
                    ">
                        + Dodaj świadka
                    </button>
                </div>
                
                ${witnesses.length === 0 ? `
                    <div style="text-align: center; padding: 60px 20px; background: #f9f9f9; border-radius: 12px;">
                        <div style="font-size: 3rem; margin-bottom: 15px;">👤</div>
                        <p style="color: #999; font-size: 1.1rem; margin: 0;">Brak świadków w sprawie</p>
                        <p style="color: #bbb; font-size: 0.9rem; margin: 10px 0 0 0;">Dodaj pierwszego świadka klikając przycisk powyżej</p>
                    </div>
                ` : `
                    <!-- Lista świadków -->
                    <div style="display: grid; gap: 15px;">
                        ${witnesses.map(w => {
                            const status = statusConfig[w.status] || statusConfig.confirmed;
                            const relation = relationConfig[w.relation_to_case] || relationConfig.neutral;
                            
                            return `
                                <div data-witness-id="${w.id}" style="
                                    background: white;
                                    border: 2px solid ${w.status === 'withdrawn' ? '#dc3545' : '#e0e0e0'};
                                    border-radius: 12px;
                                    padding: 20px;
                                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                    transition: all 0.3s ease;
                                    ${w.status === 'withdrawn' ? 'opacity: 0.7;' : ''}
                                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'">
                                    <!-- Kod świadka -->
                                    ${w.witness_code ? `
                                        <div style="display: inline-block; padding: 8px 16px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border-radius: 8px; font-size: 0.95rem; font-weight: 700; margin-bottom: 12px; font-family: 'Courier New', monospace; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);">
                                            🔢 ${w.witness_code}
                                        </div>
                                    ` : `
                                        <div style="display: inline-block; padding: 6px 14px; background: #95a5a6; color: white; border-radius: 8px; font-size: 0.85rem; font-style: italic; margin-bottom: 12px;">
                                            ⚠️ Brak kodu
                                        </div>
                                    `}
                                    
                                    <!-- Nagłówek -->
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                                        <div style="flex: 1;">
                                            <h4 style="margin: 0 0 8px 0; font-size: 1.2rem; color: #1a2332;">
                                                ${w.first_name} ${w.last_name}
                                            </h4>
                                            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                                                <span style="padding: 4px 10px; background: ${status.color}; color: white; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                                                    ${status.emoji} ${status.label}
                                                </span>
                                                <span style="padding: 4px 10px; background: #f0f0f0; color: #666; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                                                    ${relation.emoji} ${relation.label}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <!-- Wiarygodność -->
                                        <div style="text-align: center; min-width: 80px;">
                                            <div style="font-size: 0.75rem; color: #999; margin-bottom: 4px;">Wiarygodność</div>
                                            <div style="font-size: 1.5rem; font-weight: 700; color: ${w.reliability_score >= 7 ? '#3B82F6' : w.reliability_score >= 4 ? '#3B82F6' : '#dc3545'};">
                                                ${w.reliability_score || 5}/10
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Szczegóły -->
                                    <div style="display: grid; gap: 8px; margin-bottom: 15px; padding: 12px; background: #f9f9f9; border-radius: 8px;">
                                        ${w.contact_phone ? `
                                            <div style="display: flex; gap: 8px; align-items: center;">
                                                <span style="color: #666; font-size: 0.9rem;">📞</span>
                                                <span style="color: #1a2332; font-size: 0.9rem;">${w.contact_phone}</span>
                                            </div>
                                        ` : ''}
                                        ${w.contact_email ? `
                                            <div style="display: flex; gap: 8px; align-items: center;">
                                                <span style="color: #666; font-size: 0.9rem;">📧</span>
                                                <span style="color: #1a2332; font-size: 0.9rem;">${w.contact_email}</span>
                                            </div>
                                        ` : ''}
                                        ${w.address ? `
                                            <div style="display: flex; gap: 8px; align-items: center;">
                                                <span style="color: #666; font-size: 0.9rem;">📍</span>
                                                <span style="color: #1a2332; font-size: 0.9rem;">${w.address}</span>
                                            </div>
                                        ` : ''}
                                        ${w.testimonies_count > 0 ? `
                                            <div style="display: flex; gap: 8px; align-items: center;">
                                                <span style="color: #666; font-size: 0.9rem;">📝</span>
                                                <span style="color: #1a2332; font-size: 0.9rem;">Zeznań: ${w.testimonies_count}</span>
                                            </div>
                                        ` : ''}
                                    </div>
                                    
                                    ${w.notes ? `
                                        <div style="padding: 12px; background: #fff9e6; border-left: 4px solid #3B82F6; border-radius: 6px; margin-bottom: 15px;">
                                            <div style="font-size: 0.85rem; color: #999; margin-bottom: 4px; font-weight: 600;">💬 NOTATKI</div>
                                            <div style="color: #666; font-size: 0.9rem; line-height: 1.5;">${w.notes}</div>
                                        </div>
                                    ` : ''}
                                    
                                    ${w.status === 'withdrawn' && w.withdrawal_reason ? `
                                        <div style="padding: 12px; background: #ffe6e6; border-left: 4px solid #dc3545; border-radius: 6px; margin-bottom: 15px;">
                                            <div style="font-size: 0.85rem; color: #999; margin-bottom: 4px; font-weight: 600;">⚠️ WYCOFANIE</div>
                                            <div style="color: #666; font-size: 0.9rem; line-height: 1.5;">${w.withdrawal_reason}</div>
                                            ${w.withdrawal_date ? `<div style="font-size: 0.8rem; color: #999; margin-top: 5px;">Data: ${new Date(w.withdrawal_date).toLocaleString('pl-PL')}</div>` : ''}
                                        </div>
                                    ` : ''}
                                    
                                    <!-- Przyciski akcji -->
                                    <div style="display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap;">
                                        <button onclick="witnessesModule.showTestimonies(${w.id})" style="
                                            padding: 10px 18px;
                                            background: linear-gradient(135deg, #3B82F6, #1E40AF);
                                            color: white;
                                            border: none;
                                            border-radius: 8px;
                                            cursor: pointer;
                                            font-size: 0.9rem;
                                            font-weight: 700;
                                            box-shadow: 0 2px 8px rgba(102,126,234,0.3);
                                            transition: all 0.3s;
                                        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(102,126,234,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(102,126,234,0.3)'">
                                            📝 Zeznania ${w.testimonies_count ? `(${w.testimonies_count})` : ''}
                                        </button>
                                        <button onclick="witnessesModule.viewWitnessDetails(${w.id})" style="
                                            padding: 10px 18px;
                                            background: #3B82F6;
                                            color: white;
                                            border: none;
                                            border-radius: 8px;
                                            cursor: pointer;
                                            font-size: 0.9rem;
                                            font-weight: 600;
                                        ">
                                            👁️ Szczegóły
                                        </button>
                                        <button onclick="witnessesModule.showEditWitnessForm(${w.id}, ${caseId})" style="
                                            padding: 10px 18px;
                                            background: linear-gradient(135deg, #FFD700, #d4af37);
                                            color: #1a2332;
                                            border: none;
                                            border-radius: 8px;
                                            cursor: pointer;
                                            font-size: 0.9rem;
                                            font-weight: 700;
                                            box-shadow: 0 2px 8px rgba(212,175,55,0.3);
                                            transition: all 0.3s;
                                        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(212,175,55,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(212,175,55,0.3)'">
                                            ✏️ Edytuj
                                        </button>
                                        ${w.status !== 'withdrawn' ? `
                                            <button onclick="witnessesModule.showWithdrawForm(${w.id}, ${caseId})" style="
                                                padding: 10px 18px;
                                                background: #3B82F6;
                                                color: #1a2332;
                                                border: none;
                                                border-radius: 8px;
                                                cursor: pointer;
                                                font-size: 0.9rem;
                                                font-weight: 600;
                                            ">
                                                ⚠️ Wycofaj
                                            </button>
                                        ` : ''}
                                        <button onclick="if(confirm('Na pewno usunąć świadka?')) witnessesModule.deleteWitness(${w.id}, ${caseId})" style="
                                            padding: 10px 18px;
                                            background: #dc3545;
                                            color: white;
                                            border: none;
                                            border-radius: 8px;
                                            cursor: pointer;
                                            font-size: 0.9rem;
                                            font-weight: 600;
                                        ">
                                            🗑️ Usuń
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        `;
        
    } catch (error) {
        console.error('❌ Błąd ładowania świadków:', error);
        return `
            <div style="padding: 40px; text-align: center;">
                <p style="color: #dc3545; font-size: 1.1rem;">❌ Błąd ładowania świadków</p>
                <p style="color: #999;">${error.message}</p>
            </div>
        `;
    }
};

// === MODUŁ ŚWIADKÓW - FUNKCJE ===

window.witnessesModule = {
    
    // Formularz dodawania świadka
    showAddWitnessForm: async function(caseId) {
        console.log('➕ Pokazuję formularz dodawania świadka');
        
        // Wygeneruj kod świadka
        let witnessCode = '';
        try {
            const codeResponse = await window.api.request('/witnesses/generate-code', {
                method: 'POST',
                body: JSON.stringify({ case_id: caseId })
            });
            witnessCode = codeResponse.witness_code;
        } catch (error) {
            console.error('❌ Błąd generowania kodu:', error);
        }
        
        const modal = document.createElement('div');
        modal.id = 'addWitnessModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.7);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 0; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 20px; border-radius: 16px 16px 0 0; color: white; display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0;">➕ Dodaj świadka</h3>
                    <button onclick="document.getElementById('addWitnessModal').remove()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.5rem;">×</button>
                </div>
                
                <!-- Body -->
                <div style="padding: 25px;">
                    ${witnessCode ? `
                        <div style="padding: 12px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: 700; font-size: 1.1rem;">
                            ${witnessCode}
                        </div>
                    ` : ''}
                    
                    <div style="display: grid; gap: 15px;">
                        <!-- Imię -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Imię *</label>
                            <input type="text" id="witnessFirstName" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        </div>
                        
                        <!-- Nazwisko -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Nazwisko *</label>
                            <input type="text" id="witnessLastName" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        </div>
                        
                        <!-- Strona -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Po której stronie?</label>
                            <select id="witnessSide" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                                <option value="our_side">✅ Nasza strona</option>
                                <option value="opposing_side">⚔️ Strona przeciwna</option>
                                <option value="neutral">👤 Neutralny</option>
                            </select>
                        </div>
                        
                        <!-- Relacja do sprawy -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Relacja do sprawy</label>
                            <select id="witnessRelation" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                                <option value="neutral">👤 Neutralny</option>
                                <option value="plaintiff">⚖️ Powód</option>
                                <option value="defendant">🛡️ Pozwany</option>
                                <option value="expert">🎓 Ekspert</option>
                                <option value="victim">😢 Pokrzywdzony</option>
                                <option value="perpetrator">⚠️ Sprawca</option>
                                <option value="eyewitness">👁️ Naoczny świadek zdarzenia</option>
                                <option value="character_witness">⭐ Świadek dobrego charakteru</option>
                                <option value="professional">💼 Świadek zawodowy</option>
                                <option value="family">👨‍👩‍👧 Członek rodziny</option>
                                <option value="neighbor">🏘️ Sąsiad</option>
                                <option value="coworker">🤝 Współpracownik</option>
                                <option value="business_partner">💼 Partner biznesowy</option>
                                <option value="official">🏛️ Przedstawiciel urzędu</option>
                                <option value="investigator">🔍 Funkcjonariusz śledczy</option>
                                <option value="medical">⚕️ Personel medyczny</option>
                                <option value="technical">🔧 Świadek techniczny</option>
                                <option value="creditor">💰 Wierzyciel</option>
                                <option value="debtor">📉 Dłużnik</option>
                            </select>
                        </div>
                        
                        <!-- Telefon -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Telefon</label>
                            <input type="text" id="witnessPhone" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        </div>
                        
                        <!-- Email -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Email</label>
                            <input type="email" id="witnessEmail" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        </div>
                        
                        <!-- Adres - rozbudowany -->
                        <div style="border: 2px solid #e8f2ff; border-radius: 12px; padding: 20px; background: linear-gradient(135deg, rgba(59,130,246,0.05), rgba(30,64,175,0.05));">
                            <label style="display: block; color: #1a2332; font-weight: 700; margin-bottom: 15px; font-size: 1.05rem;">📍 Adres</label>
                            
                            <div style="display: grid; gap: 12px;">
                                <!-- Ulica i numer -->
                                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
                                    <div>
                                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem;">Ulica</label>
                                        <input type="text" id="witnessStreet" placeholder="np. ul. Piękna" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem;">
                                    </div>
                                    <div>
                                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem;">Nr domu/lok.</label>
                                        <input type="text" id="witnessHouseNumber" placeholder="np. 15/3" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem;">
                                    </div>
                                </div>
                                
                                <!-- Kod pocztowy i miasto -->
                                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px;">
                                    <div>
                                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem;">Kod pocztowy</label>
                                        <input type="text" id="witnessPostalCode" placeholder="00-000" maxlength="6" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem;">
                                    </div>
                                    <div>
                                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem;">Miasto</label>
                                        <input type="text" id="witnessCity" placeholder="np. Warszawa" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem;">
                                    </div>
                                </div>
                                
                                <!-- Województwo (opcjonalne) -->
                                <div>
                                    <label style="display: block; color: #666; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem;">Województwo (opcjonalne)</label>
                                    <select id="witnessVoivodeship" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem;">
                                        <option value="">-- Wybierz województwo --</option>
                                        <option value="dolnośląskie">Dolnośląskie</option>
                                        <option value="kujawsko-pomorskie">Kujawsko-pomorskie</option>
                                        <option value="lubelskie">Lubelskie</option>
                                        <option value="lubuskie">Lubuskie</option>
                                        <option value="łódzkie">Łódzkie</option>
                                        <option value="małopolskie">Małopolskie</option>
                                        <option value="mazowieckie">Mazowieckie</option>
                                        <option value="opolskie">Opolskie</option>
                                        <option value="podkarpackie">Podkarpackie</option>
                                        <option value="podlaskie">Podlaskie</option>
                                        <option value="pomorskie">Pomorskie</option>
                                        <option value="śląskie">Śląskie</option>
                                        <option value="świętokrzyskie">Świętokrzyskie</option>
                                        <option value="warmińsko-mazurskie">Warmińsko-mazurskie</option>
                                        <option value="wielkopolskie">Wielkopolskie</option>
                                        <option value="zachodniopomorskie">Zachodniopomorskie</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Wiarygodność -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Wiarygodność (1-10)</label>
                            <input type="number" id="witnessReliability" min="1" max="10" value="5" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        </div>
                        
                        <!-- Notatki -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Notatki</label>
                            <textarea id="witnessNotes" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; min-height: 80px; resize: vertical;"></textarea>
                        </div>
                        
                        <!-- Dokumenty świadka -->
                        <div style="border: 2px solid #e8f2ff; border-radius: 12px; padding: 20px; background: linear-gradient(135deg, rgba(59,130,246,0.05), rgba(30,64,175,0.05));">
                            <label style="display: block; color: #1a2332; font-weight: 700; margin-bottom: 12px; font-size: 1.05rem;">📎 Dokumenty świadka (opcjonalne)</label>
                            <p style="color: #666; font-size: 0.9rem; margin-bottom: 12px;">Możesz dodać dokumenty już teraz lub później po zapisaniu świadka.</p>
                            <input type="file" id="witnessDocuments" multiple accept="*/*" style="width: 100%; padding: 12px; border: 2px dashed #3B82F6; border-radius: 8px; background: white; cursor: pointer; font-size: 0.95rem;">
                            <div id="witnessFilesPreview" style="margin-top: 12px; display: none;">
                                <p style="color: #3B82F6; font-weight: 600; font-size: 0.9rem; margin-bottom: 8px;">Wybrane pliki:</p>
                                <div id="witnessFilesList" style="display: flex; flex-direction: column; gap: 6px; max-height: 120px; overflow-y: auto;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Przyciski -->
                    <div style="display: flex; gap: 10px; margin-top: 25px;">
                        <button onclick="document.getElementById('addWitnessModal').remove()" style="flex: 1; padding: 14px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                            Anuluj
                        </button>
                        <button onclick="witnessesModule.saveWitness(${caseId}, '${witnessCode}')" style="flex: 2; padding: 14px; background: linear-gradient(135deg, #3B82F6, #3B82F6); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                            ✓ Dodaj świadka
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Dodaj listener do podglądu wybranych plików
        setTimeout(() => {
            const filesInput = document.getElementById('witnessDocuments');
            if (filesInput) {
                filesInput.addEventListener('change', (e) => {
                    const preview = document.getElementById('witnessFilesPreview');
                    const filesList = document.getElementById('witnessFilesList');
                    
                    if (e.target.files.length > 0) {
                        preview.style.display = 'block';
                        filesList.innerHTML = '';
                        
                        Array.from(e.target.files).forEach((file, index) => {
                            const fileItem = document.createElement('div');
                            fileItem.style.cssText = 'padding: 8px; background: white; border-radius: 6px; border: 1px solid #e0e0e0; font-size: 0.85rem; color: #333; display: flex; justify-content: space-between; align-items: center;';
                            fileItem.innerHTML = `
                                <span>📄 ${file.name}</span>
                                <span style="color: #666; font-size: 0.8rem;">${(file.size / 1024).toFixed(1)} KB</span>
                            `;
                            filesList.appendChild(fileItem);
                        });
                    } else {
                        preview.style.display = 'none';
                    }
                });
            }
        }, 100);
    },
    
    // Zapisz świadka
    saveWitness: async function(caseId, witnessCode) {
        const firstName = document.getElementById('witnessFirstName').value.trim();
        const lastName = document.getElementById('witnessLastName').value.trim();
        const side = document.getElementById('witnessSide').value;
        const relation = document.getElementById('witnessRelation').value;
        const phone = document.getElementById('witnessPhone').value.trim();
        const email = document.getElementById('witnessEmail').value.trim();
        
        // Złóż adres z osobnych pól
        const street = document.getElementById('witnessStreet').value.trim();
        const houseNumber = document.getElementById('witnessHouseNumber').value.trim();
        const postalCode = document.getElementById('witnessPostalCode').value.trim();
        const city = document.getElementById('witnessCity').value.trim();
        const voivodeship = document.getElementById('witnessVoivodeship').value.trim();
        
        // Buduj pełny adres
        let addressParts = [];
        if (street && houseNumber) {
            addressParts.push(`${street} ${houseNumber}`);
        } else if (street) {
            addressParts.push(street);
        }
        if (postalCode && city) {
            addressParts.push(`${postalCode} ${city}`);
        } else if (city) {
            addressParts.push(city);
        }
        if (voivodeship) {
            addressParts.push(`woj. ${voivodeship}`);
        }
        const address = addressParts.join(', ');
        
        const reliability = parseInt(document.getElementById('witnessReliability').value);
        const notes = document.getElementById('witnessNotes').value.trim();
        
        if (!firstName || !lastName) {
            alert('Wypełnij imię i nazwisko!');
            return;
        }
        
        try {
            const response = await window.api.request('/witnesses', {
                method: 'POST',
                body: JSON.stringify({
                    case_id: caseId,
                    witness_code: witnessCode,
                    first_name: firstName,
                    last_name: lastName,
                    side: side,
                    relation_to_case: relation,
                    contact_phone: phone,
                    contact_email: email,
                    address: address,
                    reliability_score: reliability,
                    notes: notes
                })
            });
            
            console.log('✅ Dodano świadka:', response);
            
            const witnessId = response.witnessId;
            
            // Sprawdź czy są wybrane pliki do uploadu
            const filesInput = document.getElementById('witnessDocuments');
            if (filesInput && filesInput.files.length > 0) {
                console.log(`📎 Uploading ${filesInput.files.length} dokumentów świadka...`);
                
                try {
                    const formData = new FormData();
                    Array.from(filesInput.files).forEach(file => {
                        formData.append('documents', file);
                    });
                    
                    // Upload dokumentów
                    const uploadResponse = await fetch(`/api/witnesses/${witnessId}/documents`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: formData
                    });
                    
                    if (!uploadResponse.ok) {
                        throw new Error('Błąd uploadu dokumentów');
                    }
                    
                    const uploadResult = await uploadResponse.json();
                    console.log('✅ Dokumenty uploadu:', uploadResult);
                    
                } catch (uploadError) {
                    console.error('⚠️ Błąd uploadu dokumentów:', uploadError);
                    alert(`⚠️ Świadek zapisany, ale błąd uploadu dokumentów: ${uploadError.message}`);
                }
            }
            
            // Emit event
            if (window.eventBus) {
                window.eventBus.emit('witness:added', { witnessId: witnessId, caseId });
            }
            
            // Zamknij modal
            document.getElementById('addWitnessModal').remove();
            
            // Odśwież zakładkę
            window.crmManager.switchCaseTab(caseId, 'witnesses');
            
        } catch (error) {
            console.error('❌ Błąd dodawania świadka:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Edytuj świadka
    showEditWitnessForm: async function(witnessId, caseId) {
        console.log('✏️ Edytuję świadka:', witnessId);
        
        try {
            // Pobierz aktualne dane świadka
            const response = await window.api.request(`/witnesses/${witnessId}`);
            const witness = response.witness;
            
            console.log('📄 Dane świadka:', witness);
            
            // Spróbuj rozbić adres na części (jeśli jest w formacie z przecinkami)
            let street = '', houseNumber = '', postalCode = '', city = '', voivodeship = '';
            if (witness.address) {
                const parts = witness.address.split(',').map(p => p.trim());
                if (parts.length > 0) {
                    // Pierwszy element to ulica + numer
                    const streetPart = parts[0].split(' ');
                    if (streetPart.length > 1) {
                        houseNumber = streetPart[streetPart.length - 1];
                        street = streetPart.slice(0, -1).join(' ');
                    } else {
                        street = parts[0];
                    }
                }
                if (parts.length > 1) {
                    // Drugi element to kod + miasto
                    const cityPart = parts[1].split(' ');
                    if (cityPart.length > 1) {
                        postalCode = cityPart[0];
                        city = cityPart.slice(1).join(' ');
                    } else {
                        city = parts[1];
                    }
                }
                if (parts.length > 2) {
                    // Trzeci element to województwo
                    voivodeship = parts[2].replace('woj. ', '');
                }
            }
            
            const modal = document.createElement('div');
            modal.id = 'editWitnessModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: rgba(0,0,0,0.7);
                z-index: 10001;
                display: flex;
                justify-content: center;
                align-items: center;
            `;
            
            modal.innerHTML = `
                <div style="background: white; border-radius: 16px; padding: 0; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #FFD700, #d4af37); padding: 20px; border-radius: 16px 16px 0 0; color: #1a2332; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; font-weight: 800;">✏️ Edytuj świadka</h3>
                        <button onclick="document.getElementById('editWitnessModal').remove()" style="background: rgba(26,35,50,0.2); border: 2px solid #1a2332; color: #1a2332; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.5rem; font-weight: 700;">×</button>
                    </div>
                    
                    <!-- Body -->
                    <div style="padding: 25px;">
                        ${witness.witness_code ? `
                            <div style="padding: 12px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border-radius: 8px; margin-bottom: 20px; text-align: center; font-weight: 700; font-size: 1.1rem;">
                                ${witness.witness_code}
                            </div>
                        ` : ''}
                        
                        <div style="display: grid; gap: 15px;">
                            <!-- Imię -->
                            <div>
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Imię *</label>
                                <input type="text" id="witnessFirstName" value="${witness.first_name || ''}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                            </div>
                            
                            <!-- Nazwisko -->
                            <div>
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Nazwisko *</label>
                                <input type="text" id="witnessLastName" value="${witness.last_name || ''}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                            </div>
                            
                            <!-- Strona -->
                            <div>
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Po której stronie?</label>
                                <select id="witnessSide" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                                    <option value="our_side" ${witness.side === 'our_side' ? 'selected' : ''}>✅ Nasza strona</option>
                                    <option value="opposing_side" ${witness.side === 'opposing_side' ? 'selected' : ''}>⚔️ Strona przeciwna</option>
                                    <option value="neutral" ${witness.side === 'neutral' ? 'selected' : ''}>👤 Neutralny</option>
                                </select>
                            </div>
                            
                            <!-- Relacja do sprawy -->
                            <div>
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Relacja do sprawy</label>
                                <select id="witnessRelation" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                                    <option value="neutral" ${witness.relation_to_case === 'neutral' ? 'selected' : ''}>👤 Neutralny</option>
                                    <option value="plaintiff" ${witness.relation_to_case === 'plaintiff' ? 'selected' : ''}>⚖️ Powód</option>
                                    <option value="defendant" ${witness.relation_to_case === 'defendant' ? 'selected' : ''}>🛡️ Pozwany</option>
                                    <option value="expert" ${witness.relation_to_case === 'expert' ? 'selected' : ''}>🎓 Ekspert</option>
                                    <option value="victim" ${witness.relation_to_case === 'victim' ? 'selected' : ''}>😢 Pokrzywdzony</option>
                                    <option value="perpetrator" ${witness.relation_to_case === 'perpetrator' ? 'selected' : ''}>⚠️ Sprawca</option>
                                    <option value="eyewitness" ${witness.relation_to_case === 'eyewitness' ? 'selected' : ''}>👁️ Naoczny świadek zdarzenia</option>
                                    <option value="character_witness" ${witness.relation_to_case === 'character_witness' ? 'selected' : ''}>⭐ Świadek dobrego charakteru</option>
                                    <option value="professional" ${witness.relation_to_case === 'professional' ? 'selected' : ''}>💼 Świadek zawodowy</option>
                                    <option value="family" ${witness.relation_to_case === 'family' ? 'selected' : ''}>👨‍👩‍👧 Członek rodziny</option>
                                    <option value="neighbor" ${witness.relation_to_case === 'neighbor' ? 'selected' : ''}>🏘️ Sąsiad</option>
                                    <option value="coworker" ${witness.relation_to_case === 'coworker' ? 'selected' : ''}>🤝 Współpracownik</option>
                                    <option value="business_partner" ${witness.relation_to_case === 'business_partner' ? 'selected' : ''}>💼 Partner biznesowy</option>
                                    <option value="official" ${witness.relation_to_case === 'official' ? 'selected' : ''}>🏛️ Przedstawiciel urzędu</option>
                                    <option value="investigator" ${witness.relation_to_case === 'investigator' ? 'selected' : ''}>🔍 Funkcjonariusz śledczy</option>
                                    <option value="medical" ${witness.relation_to_case === 'medical' ? 'selected' : ''}>⚕️ Personel medyczny</option>
                                    <option value="technical" ${witness.relation_to_case === 'technical' ? 'selected' : ''}>🔧 Świadek techniczny</option>
                                    <option value="creditor" ${witness.relation_to_case === 'creditor' ? 'selected' : ''}>💰 Wierzyciel</option>
                                    <option value="debtor" ${witness.relation_to_case === 'debtor' ? 'selected' : ''}>📉 Dłużnik</option>
                                </select>
                            </div>
                            
                            <!-- Telefon -->
                            <div>
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Telefon</label>
                                <input type="text" id="witnessPhone" value="${witness.contact_phone || ''}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                            </div>
                            
                            <!-- Email -->
                            <div>
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Email</label>
                                <input type="email" id="witnessEmail" value="${witness.contact_email || ''}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                            </div>
                            
                            <!-- Adres - rozbudowany -->
                            <div style="border: 2px solid #e8f2ff; border-radius: 12px; padding: 20px; background: linear-gradient(135deg, rgba(59,130,246,0.05), rgba(30,64,175,0.05));">
                                <label style="display: block; color: #1a2332; font-weight: 700; margin-bottom: 15px; font-size: 1.05rem;">📍 Adres</label>
                                
                                <div style="display: grid; gap: 12px;">
                                    <!-- Ulica i numer -->
                                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px;">
                                        <div>
                                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem;">Ulica</label>
                                            <input type="text" id="witnessStreet" value="${street}" placeholder="np. ul. Piękna" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem;">
                                        </div>
                                        <div>
                                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem;">Nr domu/lok.</label>
                                            <input type="text" id="witnessHouseNumber" value="${houseNumber}" placeholder="np. 15/3" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem;">
                                        </div>
                                    </div>
                                    
                                    <!-- Kod pocztowy i miasto -->
                                    <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 10px;">
                                        <div>
                                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem;">Kod pocztowy</label>
                                            <input type="text" id="witnessPostalCode" value="${postalCode}" placeholder="00-000" maxlength="6" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem;">
                                        </div>
                                        <div>
                                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem;">Miasto</label>
                                            <input type="text" id="witnessCity" value="${city}" placeholder="np. Warszawa" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem;">
                                        </div>
                                    </div>
                                    
                                    <!-- Województwo (opcjonalne) -->
                                    <div>
                                        <label style="display: block; color: #666; font-weight: 600; margin-bottom: 6px; font-size: 0.9rem;">Województwo (opcjonalne)</label>
                                        <select id="witnessVoivodeship" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95rem;">
                                            <option value="">-- Wybierz województwo --</option>
                                            <option value="dolnośląskie" ${voivodeship === 'dolnośląskie' ? 'selected' : ''}>Dolnośląskie</option>
                                            <option value="kujawsko-pomorskie" ${voivodeship === 'kujawsko-pomorskie' ? 'selected' : ''}>Kujawsko-pomorskie</option>
                                            <option value="lubelskie" ${voivodeship === 'lubelskie' ? 'selected' : ''}>Lubelskie</option>
                                            <option value="lubuskie" ${voivodeship === 'lubuskie' ? 'selected' : ''}>Lubuskie</option>
                                            <option value="łódzkie" ${voivodeship === 'łódzkie' ? 'selected' : ''}>Łódzkie</option>
                                            <option value="małopolskie" ${voivodeship === 'małopolskie' ? 'selected' : ''}>Małopolskie</option>
                                            <option value="mazowieckie" ${voivodeship === 'mazowieckie' ? 'selected' : ''}>Mazowieckie</option>
                                            <option value="opolskie" ${voivodeship === 'opolskie' ? 'selected' : ''}>Opolskie</option>
                                            <option value="podkarpackie" ${voivodeship === 'podkarpackie' ? 'selected' : ''}>Podkarpackie</option>
                                            <option value="podlaskie" ${voivodeship === 'podlaskie' ? 'selected' : ''}>Podlaskie</option>
                                            <option value="pomorskie" ${voivodeship === 'pomorskie' ? 'selected' : ''}>Pomorskie</option>
                                            <option value="śląskie" ${voivodeship === 'śląskie' ? 'selected' : ''}>Śląskie</option>
                                            <option value="świętokrzyskie" ${voivodeship === 'świętokrzyskie' ? 'selected' : ''}>Świętokrzyskie</option>
                                            <option value="warmińsko-mazurskie" ${voivodeship === 'warmińsko-mazurskie' ? 'selected' : ''}>Warmińsko-mazurskie</option>
                                            <option value="wielkopolskie" ${voivodeship === 'wielkopolskie' ? 'selected' : ''}>Wielkopolskie</option>
                                            <option value="zachodniopomorskie" ${voivodeship === 'zachodniopomorskie' ? 'selected' : ''}>Zachodniopomorskie</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Wiarygodność -->
                            <div>
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Wiarygodność (1-10)</label>
                                <input type="number" id="witnessReliability" min="1" max="10" value="${witness.reliability_score || 5}" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                            </div>
                            
                            <!-- Notatki -->
                            <div>
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Notatki</label>
                                <textarea id="witnessNotes" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; min-height: 80px; resize: vertical;">${witness.notes || ''}</textarea>
                            </div>
                        </div>
                        
                        <!-- Przyciski -->
                        <div style="display: flex; gap: 10px; margin-top: 25px;">
                            <button onclick="document.getElementById('editWitnessModal').remove()" style="flex: 1; padding: 14px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                                Anuluj
                            </button>
                            <button onclick="witnessesModule.updateWitness(${witnessId}, ${caseId})" style="flex: 2; padding: 14px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem; box-shadow: 0 3px 10px rgba(212,175,55,0.3);">
                                ✓ Zapisz zmiany
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
        } catch (error) {
            console.error('❌ Błąd ładowania danych świadka:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Aktualizuj świadka
    updateWitness: async function(witnessId, caseId) {
        const firstName = document.getElementById('witnessFirstName').value.trim();
        const lastName = document.getElementById('witnessLastName').value.trim();
        const side = document.getElementById('witnessSide').value;
        const relation = document.getElementById('witnessRelation').value;
        const phone = document.getElementById('witnessPhone').value.trim();
        const email = document.getElementById('witnessEmail').value.trim();
        
        // Złóż adres z osobnych pól
        const street = document.getElementById('witnessStreet').value.trim();
        const houseNumber = document.getElementById('witnessHouseNumber').value.trim();
        const postalCode = document.getElementById('witnessPostalCode').value.trim();
        const city = document.getElementById('witnessCity').value.trim();
        const voivodeship = document.getElementById('witnessVoivodeship').value.trim();
        
        // Buduj pełny adres
        let addressParts = [];
        if (street && houseNumber) {
            addressParts.push(`${street} ${houseNumber}`);
        } else if (street) {
            addressParts.push(street);
        }
        if (postalCode && city) {
            addressParts.push(`${postalCode} ${city}`);
        } else if (city) {
            addressParts.push(city);
        }
        if (voivodeship) {
            addressParts.push(`woj. ${voivodeship}`);
        }
        const address = addressParts.join(', ');
        
        const reliability = parseInt(document.getElementById('witnessReliability').value);
        const notes = document.getElementById('witnessNotes').value.trim();
        
        if (!firstName || !lastName) {
            alert('Wypełnij imię i nazwisko!');
            return;
        }
        
        try {
            const response = await window.api.request(`/witnesses/${witnessId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    side: side,
                    relation_to_case: relation,
                    contact_phone: phone,
                    contact_email: email,
                    address: address,
                    reliability_score: reliability,
                    notes: notes
                })
            });
            
            console.log('✅ Zaktualizowano świadka:', response);
            // Komunikat ukryty - lista świadków odświeży się automatycznie
            // alert('✅ Zaktualizowano świadka!');
            
            // Emit event
            if (window.eventBus) {
                window.eventBus.emit('witness:updated', { witnessId, caseId });
            }
            
            // Zamknij modal
            document.getElementById('editWitnessModal').remove();
            
            // Odśwież zakładkę
            window.crmManager.switchCaseTab(caseId, 'witnesses');
            
        } catch (error) {
            console.error('❌ Błąd aktualizacji świadka:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Szczegóły świadka
    viewWitnessDetails: async function(witnessId) {
        console.log('👁️ Szczegóły świadka:', witnessId);
        
        // Pokaż okienko ładowania
        const loadingModal = document.createElement('div');
        loadingModal.id = 'witnessLoadingModal';
        loadingModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); display: flex; align-items: center;
            justify-content: center; z-index: 10000; animation: fadeIn 0.2s;
        `;
        loadingModal.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 1.5s infinite;">👤</div>
                <div style="font-size: 1.3rem; font-weight: 600; margin-bottom: 15px;">Ładowanie danych świadka...</div>
                <div style="width: 200px; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden; margin: 0 auto;">
                    <div style="width: 30%; height: 100%; background: linear-gradient(90deg, #3B82F6, #1E40AF); border-radius: 3px; animation: loadingBar 1.5s ease-in-out infinite;"></div>
                </div>
                <style>
                    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                    @keyframes loadingBar { 0% { width: 0%; margin-left: 0%; } 50% { width: 60%; margin-left: 20%; } 100% { width: 0%; margin-left: 100%; } }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                </style>
            </div>
        `;
        document.body.appendChild(loadingModal);
        
        try {
            // Pobierz dane świadka
            const response = await window.api.request(`/witnesses/${witnessId}`);
            const witness = response.witness;
            
            // Pobierz case_id ze świadka
            const caseId = witness.case_id;
            
            // Pobierz zeznania świadka
            const testimResp = await window.api.request(`/witnesses/${witnessId}/testimonies`);
            const testimonies = testimResp.testimonies || [];
            
            console.log('📝 Pobrano zeznań dla szczegółów:', testimonies.length);
            
            // Usuń okienko ładowania
            const loadingEl = document.getElementById('witnessLoadingModal');
            if (loadingEl) loadingEl.remove();
            
            // Stwórz modal ze szczegółami
            const modal = document.createElement('div');
            modal.id = 'witnessDetailsModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: rgba(0,0,0,0.8);
                z-index: 10001;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow-y: auto;
            `;
            
            modal.innerHTML = `
                <div style="background: #f5f7fb; border-radius: 16px; padding: 0; max-width: 900px; width: 95%; max-height: 90vh; overflow-y: auto; margin: 20px; box-shadow: 0 14px 40px rgba(0,0,0,0.45);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 20px; border-radius: 16px 16px 0 0; color: white; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 10;">
                        <h3 style="margin: 0;">👤 ${witness.first_name} ${witness.last_name}</h3>
                        <button onclick="document.getElementById('witnessDetailsModal').remove()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.5rem;">×</button>
                    </div>
                    
                    <!-- Body -->
                    <div style="padding: 25px; color: #111827;">
                        <!-- Podstawowe informacje -->
                        <div style="background: #ffffff; padding: 20px 22px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #dde3f0;">
                            <h4 style="margin: 0 0 15px 0; color: #111827; font-size: 1.05rem;">ℹ️ Podstawowe informacje</h4>
                            <div style="display: grid; gap: 10px; font-size: 0.95rem; line-height: 1.6;">
                                <div><strong>Kod:</strong> ${witness.witness_code || '-'}</div>
                                <div><strong>Strona:</strong> ${witness.side || '-'}</div>
                                <div><strong>Relacja:</strong> ${witness.relation || '-'}</div>
                                <div><strong>Wiarygodność:</strong> ${witness.reliability_score || 5}/10</div>
                                ${witness.contact_phone ? `<div><strong>📞 Telefon:</strong> ${witness.contact_phone}</div>` : ''}
                                ${witness.contact_email ? `<div><strong>📧 Email:</strong> ${witness.contact_email}</div>` : ''}
                                ${witness.address ? `<div><strong>📍 Adres:</strong> ${witness.address}</div>` : ''}
                                ${witness.notes ? `<div style="margin-top: 10px;"><strong>💬 Notatki:</strong><br><span style="white-space: pre-wrap;">${witness.notes}</span></div>` : ''}
                            </div>
                        </div>
                        
                        <!-- Dokumenty świadka -->
                        <div style="background: #ffffff; padding: 20px 22px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #dde3f0;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <h4 style="margin: 0; color: #111827; font-size: 1.05rem;">📎 Dokumenty świadka</h4>
                                <button onclick="witnessesModule.showUploadWitnessDocuments(${witnessId}, ${caseId})" style="
                                    padding: 8px 16px;
                                    background: linear-gradient(135deg, #3B82F6, #1E40AF);
                                    color: white;
                                    border: none;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-size: 0.85rem;
                                    font-weight: 600;
                                ">
                                    + Dodaj dokumenty
                                </button>
                            </div>
                            <div id="witnessDocumentsList-${witnessId}">
                                <div style="text-align: center; padding: 20px; color: #999;">Ładowanie dokumentów...</div>
                            </div>
                        </div>
                        
                        <!-- Zeznania świadka -->
                        <div style="margin-top: 25px;">
                            <div style="margin-bottom: 15px;">
                                <h4 style="margin: 0; color: #1a2332;">📝 Zeznania świadka (${testimonies.length})</h4>
                            </div>
                            
                            ${testimonies.length === 0 ? `
                                <div style="text-align: center; padding: 40px 20px; background: #f9f9f9; border-radius: 12px; border: 2px dashed #e0e0e0;">
                                    <div style="font-size: 2.5rem; margin-bottom: 10px;">📝</div>
                                    <p style="color: #999; margin: 0;">Brak zeznań świadka</p>
                                </div>
                            ` : `
                                <div style="display: grid; gap: 15px;">
                                    ${testimonies.map((t, index) => `
                                        <div style="
                                            background: ${t.is_retracted ? '#fff5f5' : 'white'};
                                            border: 2px solid ${t.is_retracted ? '#dc3545' : '#e0e0e0'};
                                            border-radius: 12px;
                                            padding: 18px;
                                            ${t.is_retracted ? 'opacity: 0.7;' : ''}
                                            transition: all 0.3s;
                                        ">
                                            <!-- Nagłówek zeznania - klikalne -->
                                            <div style="cursor: pointer;" onclick="witnessesModule.viewTestimonyDetails(${witnessId}, ${t.id})" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">
                                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                                                    <div>
                                                        <div style="display: inline-block; padding: 5px 10px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border-radius: 6px; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px;">
                                                            Wersja ${t.version_number}
                                                        </div>
                                                        <div style="color: #666; font-size: 0.85rem; margin-top: 4px;">
                                                            📅 ${new Date(t.testimony_date).toLocaleDateString('pl-PL', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                                        </div>
                                                    </div>
                                                    <span style="padding: 5px 10px; background: ${t.testimony_type === 'written' ? '#3B82F6' : t.testimony_type === 'oral' ? '#3B82F6' : '#3B82F6'}; color: white; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">
                                                        ${t.testimony_type === 'written' ? '📄 Pisemne' : t.testimony_type === 'oral' ? '🎤 Ustne' : '📹 Nagranie'}
                                                    </span>
                                                </div>
                                                
                                                <div style="color: #1a2332; font-size: 0.9rem; line-height: 1.5; margin-bottom: 10px; max-height: 60px; overflow: hidden; text-overflow: ellipsis;">
                                                    ${t.testimony_content.substring(0, 150)}${t.testimony_content.length > 150 ? '...' : ''}
                                                </div>
                                                
                                                ${t.is_retracted ? `
                                                    <div style="display: inline-block; padding: 4px 10px; background: #dc3545; color: white; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">
                                                        ❌ WYCOFANE
                                                    </div>
                                                ` : ''}
                                                
                                                <div style="margin-top: 10px; text-align: right;">
                                                    <span style="color: #3B82F6; font-size: 0.85rem; font-weight: 600;">👁️ Kliknij aby zobaczyć szczegóły</span>
                                                </div>
                                            </div>
                                            
                                            <!-- Załączniki do tego zeznania -->
                                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #e0e0e0;">
                                                <div id="testimony-attachments-${t.id}" style="margin-bottom: 10px;"></div>
                                                <button onclick="event.stopPropagation(); witnessesModule.showAddTestimonyAttachment(${witnessId}, ${t.id}, ${caseId}, ${t.version_number})" 
                                                    style="width: 100%; padding: 10px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: 2px dashed #d4af37; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                                    📎 Dodaj załącznik do zeznania v${t.version_number}
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Załaduj dokumenty świadka
            this.loadWitnessDocuments(witnessId);
            
            // Załaduj załączniki dla każdego zeznania
            for (const t of testimonies) {
                this.loadTestimonyAttachments(witnessId, t.id, caseId, t.version_number);
            }
            
        } catch (error) {
            // Usuń okienko ładowania w przypadku błędu
            const loadingEl = document.getElementById('witnessLoadingModal');
            if (loadingEl) loadingEl.remove();
            
            console.error('❌ Błąd ładowania szczegółów:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Załaduj dokumenty świadka
    loadWitnessDocuments: async function(witnessId) {
        const container = document.getElementById(`witnessDocumentsList-${witnessId}`);
        if (!container) return;
        
        try {
            const response = await window.api.request(`/witnesses/${witnessId}/documents`);
            const documents = response.documents || [];
            
            console.log(`📎 Pobrano ${documents.length} dokumentów świadka ${witnessId}`);
            
            if (documents.length === 0) {
                container.innerHTML = '<div style="text-align: center; padding: 20px; color: #999; font-size: 0.9rem;">Brak dokumentów</div>';
            } else {
                container.innerHTML = `
                    <div style="display: grid; gap: 12px;">
                        ${documents.map(doc => `
                            <div style="background: white; border: 2px solid #e0e0e0; border-radius: 12px; padding: 16px; border-left: 4px solid #FFD700;">
                                <!-- Kod dokumentu -->
                                ${doc.document_code ? `
                                    <div style="display: inline-block; padding: 6px 12px; background: linear-gradient(135deg, #FFD700, #FFA500); color: #1a2332; border-radius: 8px; font-size: 0.8rem; font-weight: 700; margin-bottom: 10px;">
                                        📋 ${doc.document_code}
                                    </div>
                                ` : ''}
                                
                                <!-- Nazwa pliku -->
                                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: #1a2332; font-size: 1rem; margin-bottom: 4px;">📄 ${doc.file_name}</div>
                                        <div style="font-size: 0.85rem; color: #666;">
                                            ${(doc.file_size / 1024).toFixed(1)} KB • ${new Date(doc.uploaded_at).toLocaleDateString('pl-PL')} • ${doc.uploaded_by_name || 'Admin'}
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Przyciski -->
                                <div style="display: flex; gap: 8px; margin-top: 12px;">
                                    <button onclick="witnessesModule.viewWitnessDocument(${witnessId}, ${doc.id})" style="
                                        flex: 1;
                                        padding: 10px 16px;
                                        background: linear-gradient(135deg, #FFD700, #FFA500);
                                        color: #1a2332;
                                        border: none;
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-size: 0.9rem;
                                        font-weight: 700;
                                        box-shadow: 0 2px 8px rgba(255,215,0,0.3);
                                        transition: all 0.3s;
                                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(255,215,0,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(255,215,0,0.3)'">
                                        👁️ Pokaż
                                    </button>
                                    <button onclick="witnessesModule.downloadWitnessDocument(${witnessId}, ${doc.id})" style="
                                        flex: 1;
                                        padding: 10px 16px;
                                        background: linear-gradient(135deg, #3B82F6, #1E40AF);
                                        color: white;
                                        border: none;
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-size: 0.9rem;
                                        font-weight: 700;
                                        box-shadow: 0 2px 8px rgba(59,130,246,0.3);
                                        transition: all 0.3s;
                                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(59,130,246,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(59,130,246,0.3)'">
                                        📥 Pobierz
                                    </button>
                                    <button onclick="if(confirm('Usunąć dokument ${doc.file_name}?')) witnessesModule.deleteWitnessDocument(${witnessId}, ${doc.id})" style="
                                        padding: 10px 16px;
                                        background: #dc3545;
                                        color: white;
                                        border: none;
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-size: 0.9rem;
                                        font-weight: 700;
                                    ">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Błąd ładowania dokumentów świadka:', error);
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">Błąd ładowania dokumentów</div>';
        }
    },
    
    // Pokaż modal uploadu dokumentów świadka
    showUploadWitnessDocuments: function(witnessId, caseId) {
        const modal = document.createElement('div');
        modal.id = 'uploadWitnessDocsModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 10003; display: flex;
            justify-content: center; align-items: center; padding: 20px;
        `;
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 25px; max-width: 500px; width: 100%;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0;">📎 Dodaj dokumenty świadka</h3>
                    <button onclick="document.getElementById('uploadWitnessDocsModal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
                </div>
                
                <input type="file" id="witnessDocsFiles" multiple style="width: 100%; padding: 12px; border: 2px dashed #3B82F6; border-radius: 8px; margin-bottom: 15px;">
                <div id="witnessDocsPreview" style="margin-bottom: 15px; display: none;"></div>
                
                <button onclick="witnessesModule.uploadWitnessDocuments(${witnessId})" style="
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, #3B82F6, #1E40AF);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 700;
                    font-size: 1rem;
                ">
                    📤 Wgraj dokumenty
                </button>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Preview
        document.getElementById('witnessDocsFiles').addEventListener('change', (e) => {
            const preview = document.getElementById('witnessDocsPreview');
            if (e.target.files.length > 0) {
                preview.style.display = 'block';
                preview.innerHTML = `<div style="font-size: 0.9rem; color: #666;">Wybrano: ${e.target.files.length} plik(ów)</div>`;
            }
        });
    },
    
    // Upload dokumentów świadka
    uploadWitnessDocuments: async function(witnessId) {
        const filesInput = document.getElementById('witnessDocsFiles');
        if (!filesInput.files.length) {
            alert('❌ Wybierz pliki');
            return;
        }
        
        const formData = new FormData();
        Array.from(filesInput.files).forEach(file => {
            formData.append('documents', file);
        });
        
        try {
            const apiUrl = window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://web-production-ef868.up.railway.app';
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${apiUrl}/witnesses/${witnessId}/documents`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            if (!response.ok) throw new Error('Błąd uploadu');
            
            const result = await response.json();
            console.log('✅ Upload dokumentów:', result);
            
            alert(`✅ Wgrano ${result.count} dokumentów`);
            document.getElementById('uploadWitnessDocsModal').remove();
            this.loadWitnessDocuments(witnessId);
            
        } catch (error) {
            console.error('❌ Błąd uploadu:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Podgląd dokumentu świadka (otwórz w modalu aplikacji)
    viewWitnessDocument: async function(witnessId, docId) {
        try {
            // Pobierz dane dokumentu
            const response = await window.api.request(`/witnesses/${witnessId}/documents`);
            const documents = response.documents || [];
            const doc = documents.find(d => d.id === docId);
            
            if (!doc) {
                alert('❌ Dokument nie znaleziony');
                return;
            }
            
            const apiUrl = window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://web-production-ef868.up.railway.app';
            const token = localStorage.getItem('token');
            const docUrl = `${apiUrl}/witnesses/${witnessId}/documents/${docId}?view=true&token=${token}`;
            
            // Stwórz modal z podglądem (podobny do innych dokumentów w systemie)
            const modal = document.createElement('div');
            modal.id = 'witnessDocViewModal';
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.95); z-index: 10005; display: flex;
                flex-direction: column; align-items: center; justify-content: center;
            `;
            
            const fileExt = doc.file_name.split('.').pop().toLowerCase();
            const isPDF = fileExt === 'pdf';
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt);
            const isTXT = fileExt === 'txt';
            
            let content = '';
            if (isPDF) {
                content = `<iframe src="${docUrl}" style="width: 90vw; height: 85vh; border: none; border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);"></iframe>`;
            } else if (isImage) {
                content = `<img src="${docUrl}" style="max-width: 90vw; max-height: 85vh; border-radius: 8px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">`;
            } else if (isTXT) {
                // Pobierz treść TXT i wyświetl w pięknym boxie z fioletową ramką
                try {
                    const txtResponse = await fetch(docUrl);
                    const txtContent = await txtResponse.text();
                    content = `<div style="
                        background: white;
                        border: 4px solid #9333ea;
                        border-radius: 16px;
                        padding: 30px;
                        max-width: 90vw;
                        max-height: 80vh;
                        overflow-y: auto;
                        box-shadow: 0 8px 32px rgba(147,51,234,0.3);
                    ">
                        <div style="
                            background: linear-gradient(135deg, #9333ea, #7c3aed);
                            color: white;
                            padding: 15px 20px;
                            border-radius: 10px;
                            margin-bottom: 20px;
                            font-weight: 700;
                            font-size: 1.1rem;
                            text-align: center;
                            box-shadow: 0 4px 12px rgba(147,51,234,0.4);
                        ">
                            📄 ${doc.document_code || doc.file_name}
                        </div>
                        <pre style="
                            white-space: pre-wrap;
                            word-wrap: break-word;
                            font-family: 'Segoe UI', Arial, sans-serif;
                            font-size: 1rem;
                            line-height: 1.6;
                            color: #1a2332;
                            margin: 0;
                        ">${txtContent}</pre>
                        <div style="margin-top: 20px; text-align: center;">
                            <button onclick="window.open('${docUrl.replace('view=true', 'view=false')}', '_blank')" style="
                                padding: 12px 24px;
                                background: linear-gradient(135deg, #9333ea, #7c3aed);
                                color: white;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                                font-weight: 700;
                                font-size: 1rem;
                                box-shadow: 0 4px 12px rgba(147,51,234,0.3);
                            ">📥 Pobierz plik</button>
                        </div>
                    </div>`;
                } catch (error) {
                    console.error('❌ Błąd wczytywania TXT:', error);
                    content = `<div style="background: white; padding: 40px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">⚠️</div>
                        <p style="color: #333; font-size: 1.1rem; margin-bottom: 20px;">Nie udało się wczytać pliku tekstowego</p>
                        <button onclick="window.open('${docUrl.replace('view=true', 'view=false')}', '_blank')" style="padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">📥 Pobierz plik</button>
                    </div>`;
                }
            } else {
                content = `<div style="background: white; padding: 40px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">📄</div>
                    <p style="color: #333; font-size: 1.1rem; margin-bottom: 20px;">Podgląd niedostępny dla tego typu pliku</p>
                    <button onclick="window.open('${docUrl.replace('view=true', 'view=false')}', '_blank')" style="padding: 12px 24px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">📥 Pobierz plik</button>
                </div>`;
            }
            
            modal.innerHTML = `
                <div style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 12px 24px; border-radius: 12px; color: white; font-weight: 600; z-index: 1;">
                    📋 ${doc.document_code || doc.file_name}
                </div>
                
                <button onclick="document.getElementById('witnessDocViewModal').remove()" style="
                    position: absolute; top: 20px; right: 20px; z-index: 2;
                    background: rgba(255,255,255,0.2); backdrop-filter: blur(10px);
                    border: 2px solid white; color: white;
                    width: 48px; height: 48px; border-radius: 50%;
                    cursor: pointer; font-size: 1.8rem; font-weight: 700;
                    transition: all 0.3s;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
                
                ${content}
            `;
            
            document.body.appendChild(modal);
            
            // Zamknij po kliknięciu w tło
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
        } catch (error) {
            console.error('❌ Błąd podglądu:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Pobierz dokument świadka (download)
    downloadWitnessDocument: async function(witnessId, docId) {
        try {
            const apiUrl = window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://web-production-ef868.up.railway.app';
            const token = localStorage.getItem('token');
            
            window.open(`${apiUrl}/witnesses/${witnessId}/documents/${docId}?token=${token}`, '_blank');
        } catch (error) {
            console.error('❌ Błąd pobierania:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Usuń dokument świadka
    deleteWitnessDocument: async function(witnessId, docId) {
        try {
            await window.api.request(`/witnesses/${witnessId}/documents/${docId}`, { method: 'DELETE' });
            alert('✅ Dokument usunięty');
            this.loadWitnessDocuments(witnessId);
        } catch (error) {
            console.error('❌ Błąd usuwania:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Załaduj załączniki dla konkretnego zeznania
    loadTestimonyAttachments: async function(witnessId, testimonyId, caseId, versionNumber) {
        try {
            const apiUrl = window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://web-production-ef868.up.railway.app';
            const token = localStorage.getItem('token');
            
            // Pobierz załączniki dla tego zeznania (filtruj po entity_type=testimony i entity_id=testimonyId)
            const response = await fetch(`${apiUrl}/attachments?entity_type=testimony&entity_id=${testimonyId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            const attachments = data.attachments || [];
            
            const container = document.getElementById(`testimony-attachments-${testimonyId}`);
            if (!container) return;
            
            if (attachments.length === 0) {
                container.innerHTML = '<div style="color: #999; font-size: 0.85rem; text-align: center; padding: 8px;">Brak załączników</div>';
            } else {
                container.innerHTML = `
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${attachments.map(att => `
                            <div style="display: flex; flex-direction: column; gap: 4px; padding: 10px; background: #f8f9fa; border-left: 4px solid #FFD700; border-radius: 6px;">
                                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                    <span style="background: #FFD700; color: #1a2332; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.75rem;">
                                        📋 ${att.attachment_code || 'BRAK KODU'}
                                    </span>
                                    <span style="color: #1a2332; font-weight: 500; font-size: 0.9rem;">${att.title || att.file_name}</span>
                                    <span style="color: #999; font-size: 0.75rem;">(${(att.file_size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <div style="display: flex; gap: 6px;">
                                    <button onclick="event.stopPropagation(); window.crmManager.viewDocument(${att.id}, null, 'attachment')" style="flex: 1; background: #FFD700; border: none; border-radius: 4px; padding: 6px 10px; cursor: pointer; font-size: 0.85rem; font-weight: 600;" title="Pokaż">👁️ Pokaż</button>
                                    <button onclick="event.stopPropagation(); window.downloadAttachment(${att.id})" style="flex: 1; background: #2196F3; color: white; border: none; border-radius: 4px; padding: 6px 10px; cursor: pointer; font-size: 0.85rem; font-weight: 600;" title="Pobierz">⬇️ Pobierz</button>
                                    <button onclick="event.stopPropagation(); witnessesModule.deleteTestimonyAttachment(${att.id}, ${witnessId}, ${testimonyId}, ${caseId}, ${versionNumber})" style="background: #f44336; color: white; border: none; border-radius: 4px; padding: 6px 10px; cursor: pointer; font-size: 0.85rem;" title="Usuń">🗑️</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ Błąd ładowania załączników zeznania:', error);
        }
    },
    
    // Pokaż formularz dodawania załącznika do zeznania
    showAddTestimonyAttachment: function(witnessId, testimonyId, caseId, versionNumber) {
        const modal = document.createElement('div');
        modal.id = 'addTestimonyAttachmentModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 10003; display: flex;
            justify-content: center; align-items: center; padding: 20px;
        `;
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 25px; max-width: 500px; width: 100%; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #1a2332;">📎 Dodaj załącznik do zeznania v${versionNumber}</h3>
                    <button onclick="document.getElementById('addTestimonyAttachmentModal').remove()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;">×</button>
                </div>
                
                <div style="display: grid; gap: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Tytuł załącznika *</label>
                        <input type="text" id="testimonyAttTitle" placeholder="np. Dokument potwierdzający" style="width: 100%; padding: 10px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">Plik *</label>
                        <input type="file" id="testimonyAttFile" style="width: 100%; padding: 10px; border: 2px dashed #FFD700; border-radius: 8px; background: #fffbf0;">
                    </div>
                    
                    <button onclick="witnessesModule.uploadTestimonyAttachment(${witnessId}, ${testimonyId}, ${caseId}, ${versionNumber})" 
                        style="width: 100%; padding: 14px; background: linear-gradient(135deg, #4CAF50, #45a049); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem;">
                        📤 Wgraj załącznik
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },
    
    // Wgraj załącznik do zeznania
    uploadTestimonyAttachment: async function(witnessId, testimonyId, caseId, versionNumber) {
        const titleInput = document.getElementById('testimonyAttTitle');
        const fileInput = document.getElementById('testimonyAttFile');
        
        if (!titleInput.value.trim()) {
            alert('❌ Podaj tytuł załącznika');
            return;
        }
        if (!fileInput.files[0]) {
            alert('❌ Wybierz plik');
            return;
        }
        
        // Pokaż ładowanie
        const loadingModal = document.createElement('div');
        loadingModal.id = 'uploadLoadingModal';
        loadingModal.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 10004;`;
        loadingModal.innerHTML = `<div style="text-align: center; color: white;"><div style="font-size: 4rem; animation: pulse 1.5s infinite;">📤</div><div style="font-size: 1.3rem; font-weight: 600; margin-top: 15px;">Wgrywanie...</div></div>`;
        document.body.appendChild(loadingModal);
        
        try {
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            formData.append('entity_type', 'testimony');
            formData.append('entity_id', testimonyId);
            formData.append('case_id', caseId);
            formData.append('title', titleInput.value.trim());
            formData.append('category', 'zeznanie');
            
            const apiUrl = window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://web-production-ef868.up.railway.app';
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${apiUrl}/attachments/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            
            loadingModal.remove();
            
            if (response.ok) {
                document.getElementById('addTestimonyAttachmentModal').remove();
                // Odśwież listę załączników
                this.loadTestimonyAttachments(witnessId, testimonyId, caseId, versionNumber);
            } else {
                const data = await response.json();
                alert('❌ Błąd: ' + (data.error || 'Nieznany błąd'));
            }
        } catch (error) {
            loadingModal.remove();
            console.error('❌ Błąd uploadu:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Usuń załącznik zeznania
    deleteTestimonyAttachment: async function(attachmentId, witnessId, testimonyId, caseId, versionNumber) {
        if (!confirm('Czy na pewno chcesz usunąć ten załącznik?')) return;
        
        try {
            const apiUrl = window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://web-production-ef868.up.railway.app';
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${apiUrl}/attachments/${attachmentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                alert('✅ Załącznik usunięty');
                this.loadTestimonyAttachments(witnessId, testimonyId, caseId, versionNumber);
            } else {
                alert('❌ Błąd usuwania');
            }
        } catch (error) {
            console.error('❌ Błąd:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Formularz wycofania
    showWithdrawForm: function(witnessId, caseId) {
        const modal = document.createElement('div');
        modal.id = 'withdrawWitnessModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background: rgba(0,0,0,0.7);
            z-index: 10001;
            display: flex;
            justify-content: center;
            align-items: center;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 0; max-width: 500px; width: 90%;">
                <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 20px; border-radius: 16px 16px 0 0; color: white;">
                    <h3 style="margin: 0;">⚠️ Wycofanie świadka</h3>
                </div>
                <div style="padding: 25px;">
                    <p style="margin: 0 0 20px 0; color: #666;">Podaj powód wycofania świadka:</p>
                    <textarea id="withdrawReason" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; min-height: 100px; resize: vertical;"></textarea>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button onclick="document.getElementById('withdrawWitnessModal').remove()" style="flex: 1; padding: 12px; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            Anuluj
                        </button>
                        <button onclick="witnessesModule.withdrawWitness(${witnessId}, ${caseId})" style="flex: 1; padding: 12px; background: #3B82F6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                            ⚠️ Wycofaj
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // Wycofaj świadka
    withdrawWitness: async function(witnessId, caseId) {
        const reason = document.getElementById('withdrawReason').value.trim();
        
        if (!reason) {
            alert('Podaj powód wycofania!');
            return;
        }
        
        try {
            await window.api.request(`/witnesses/${witnessId}/withdraw`, {
                method: 'POST',
                body: JSON.stringify({ reason })
            });
            
            console.log('✅ Wycofano świadka');
            alert('✅ Wycofano świadka');
            
            // Emit event
            if (window.eventBus) {
                window.eventBus.emit('witness:withdrawn', { witnessId, reason });
            }
            
            document.getElementById('withdrawWitnessModal').remove();
            window.crmManager.switchCaseTab(caseId, 'witnesses');
            
        } catch (error) {
            console.error('❌ Błąd wycofania:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Usuń świadka
    deleteWitness: async function(witnessId, caseId) {
        try {
            await window.api.request(`/witnesses/${witnessId}`, { method: 'DELETE' });
            
            console.log('✅ Usunięto świadka');
            alert('✅ Usunięto świadka');
            
            window.crmManager.switchCaseTab(caseId, 'witnesses');
            
        } catch (error) {
            console.error('❌ Błąd usuwania:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // ================================================
    // FUNKCJE ZEZNAŃ ŚWIADKÓW
    // ================================================
    
    // Pokaż zeznania świadka
    showTestimonies: async function(witnessId) {
        console.log('📝 Pokazuję zeznania świadka:', witnessId);
        
        try {
            // Pobierz dane świadka
            const witnessResp = await window.api.request(`/witnesses/${witnessId}`);
            const witness = witnessResp.witness;
            
            // Pobierz zeznania
            const testimResp = await window.api.request(`/witnesses/${witnessId}/testimonies`);
            const testimonies = testimResp.testimonies || [];
            
            console.log('📝 Pobrano zeznań:', testimonies.length);
            
            const modal = document.createElement('div');
            modal.id = 'testimoniesModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: rgba(0,0,0,0.7);
                z-index: 10002;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow-y: auto;
                padding: 20px;
            `;
            
            modal.innerHTML = `
                <div style="background: white; border-radius: 16px; padding: 0; max-width: 900px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 25px; border-radius: 16px 16px 0 0; color: white; position: sticky; top: 0; z-index: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h3 style="margin: 0 0 8px 0; font-size: 1.4rem;">📝 Zeznania świadka</h3>
                                <p style="margin: 0; opacity: 0.9; font-size: 1.1rem;">${witness.first_name} ${witness.last_name}</p>
                            </div>
                            <button onclick="document.getElementById('testimoniesModal').remove()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.5rem; font-weight: 700;">×</button>
                        </div>
                    </div>
                    
                    <!-- Body -->
                    <div style="padding: 25px;">
                        <!-- Przycisk dodaj zeznanie -->
                        <div style="margin-bottom: 20px;">
                            <button onclick="witnessesModule.showAddTestimonyForm(${witnessId})" style="
                                width: 100%;
                                padding: 15px;
                                background: linear-gradient(135deg, #3B82F6, #20c997);
                                color: white;
                                border: none;
                                border-radius: 10px;
                                cursor: pointer;
                                font-size: 1rem;
                                font-weight: 700;
                                box-shadow: 0 4px 12px rgba(40,167,69,0.3);
                                transition: all 0.3s;
                            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(40,167,69,0.5)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(40,167,69,0.3)'">
                                ➕ Dodaj nowe zeznanie
                            </button>
                        </div>
                        
                        ${testimonies.length === 0 ? `
                            <div style="text-align: center; padding: 60px 20px; background: #f9f9f9; border-radius: 12px;">
                                <div style="font-size: 3rem; margin-bottom: 15px;">📝</div>
                                <p style="color: #999; font-size: 1.1rem; margin: 0;">Brak zeznań</p>
                                <p style="color: #bbb; font-size: 0.9rem; margin: 10px 0 0 0;">Dodaj pierwsze zeznanie klikając przycisk powyżej</p>
                            </div>
                        ` : `
                            <!-- Lista zeznań -->
                            <div style="display: grid; gap: 20px;">
                                ${testimonies.map((t, index) => `
                                    <div style="
                                        background: white;
                                        border: 2px solid ${t.is_retracted ? '#dc3545' : '#e0e0e0'};
                                        border-radius: 12px;
                                        padding: 20px;
                                        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                        ${t.is_retracted ? 'opacity: 0.6;' : ''}
                                    ">
                                        <!-- Nagłówek zeznania -->
                                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                                            <div>
                                                <div style="display: inline-block; padding: 6px 12px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border-radius: 6px; font-size: 0.85rem; font-weight: 700; margin-bottom: 8px;">
                                                    Wersja ${t.version_number}
                                                </div>
                                                <div style="color: #666; font-size: 0.9rem;">
                                                    📅 ${new Date(t.testimony_date).toLocaleDateString('pl-PL', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                                </div>
                                                <div style="color: #999; font-size: 0.85rem; margin-top: 4px;">
                                                    👤 Zapisał: ${t.recorded_by_name || 'Nieznany'}
                                                </div>
                                            </div>
                                            <div style="text-align: right;">
                                                <span style="display: inline-block; padding: 6px 12px; background: ${t.testimony_type === 'written' ? '#3B82F6' : t.testimony_type === 'oral' ? '#3B82F6' : '#3B82F6'}; color: white; border-radius: 6px; font-size: 0.85rem; font-weight: 600;">
                                                    ${t.testimony_type === 'written' ? '📄 Pisemne' : t.testimony_type === 'oral' ? '🎤 Ustne' : '📹 Nagranie'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <!-- Treść zeznania -->
                                        <div style="padding: 15px; background: #f9f9f9; border-radius: 8px; margin-bottom: 15px;">
                                            <div style="color: #1a2332; font-size: 0.95rem; line-height: 1.6; white-space: pre-wrap;">${t.testimony_content}</div>
                                        </div>
                                        
                                        <!-- Ocena wiarygodności -->
                                        ${t.credibility_assessment ? `
                                            <div style="padding: 12px; background: #F8FAFC; border-left: 4px solid #3B82F6; border-radius: 6px; margin-bottom: 15px;">
                                                <div style="font-size: 0.85rem; color: #3B82F6; margin-bottom: 4px; font-weight: 600;">✓ OCENA WIARYGODNOŚCI</div>
                                                <div style="color: #666; font-size: 0.9rem;">${t.credibility_assessment}</div>
                                            </div>
                                        ` : ''}
                                        
                                        <!-- Wycofanie -->
                                        ${t.is_retracted ? `
                                            <div style="padding: 12px; background: #ffe6e6; border-left: 4px solid #dc3545; border-radius: 6px;">
                                                <div style="font-size: 0.85rem; color: #dc3545; margin-bottom: 4px; font-weight: 600;">❌ ZEZNANIE WYCOFANE</div>
                                                ${t.retraction_reason ? `<div style="color: #666; font-size: 0.9rem;">${t.retraction_reason}</div>` : ''}
                                                ${t.retraction_date ? `<div style="font-size: 0.8rem; color: #999; margin-top: 5px;">Wycofano: ${new Date(t.retraction_date).toLocaleString('pl-PL')}</div>` : ''}
                                            </div>
                                        ` : `
                                            <div style="text-align: right;">
                                                <button onclick="if(confirm('Na pewno wycofać to zeznanie?')) witnessesModule.retractTestimony(${witnessId}, ${t.id})" style="
                                                    padding: 8px 16px;
                                                    background: #dc3545;
                                                    color: white;
                                                    border: none;
                                                    border-radius: 6px;
                                                    cursor: pointer;
                                                    font-size: 0.85rem;
                                                    font-weight: 600;
                                                ">
                                                    ❌ Wycofaj zeznanie
                                                </button>
                                            </div>
                                        `}
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
        } catch (error) {
            console.error('❌ Błąd pobierania zeznań:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Formularz dodawania zeznania
    showAddTestimonyForm: function(witnessId) {
        const modal = document.createElement('div');
        modal.id = 'addTestimonyModal';
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
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 16px; padding: 0; max-width: 700px; width: 100%; max-height: 90vh; overflow-y: auto;">
                <div style="background: linear-gradient(135deg, #3B82F6, #20c997); padding: 20px; border-radius: 16px 16px 0 0; color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0;">➕ Dodaj zeznanie</h3>
                        <button onclick="witnessesModule.closeTestimonyModal()" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.5rem;">×</button>
                    </div>
                </div>
                
                <div style="padding: 25px;">
                    <div style="display: grid; gap: 20px;">
                        <!-- Data zeznania -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Data i godzina zeznania *</label>
                            <input type="datetime-local" id="testimonyDate" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;" value="${new Date().toISOString().slice(0, 16)}">
                        </div>
                        
                        <!-- Typ zeznania -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Typ zeznania</label>
                            <select id="testimonyType" onchange="witnessesModule.handleTestimonyTypeChange()" style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                                <option value="written">📄 Pisemne</option>
                                <option value="oral">🎤 Ustne (transkrypcja)</option>
                                <option value="recorded">📹 Nagranie</option>
                            </select>
                        </div>
                        
                        <!-- Interfejs nagrywania (ukryty domyślnie) -->
                        <div id="recordingInterface" style="display: none; padding: 20px; background: #f9f9f9; border-radius: 12px; border: 2px dashed #3B82F6;">
                            <h4 style="margin: 0 0 15px 0; color: #3B82F6;">📹 Interfejs nagrywania</h4>
                            
                            <!-- Wybór typu nagrania -->
                            <div style="margin-bottom: 15px;">
                                <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Typ nagrania</label>
                                <div style="display: flex; gap: 10px;">
                                    <button id="selectAudioOnly" onclick="witnessesModule.selectRecordingType('audio')" style="
                                        flex: 1;
                                        padding: 12px;
                                        background: white;
                                        border: 2px solid #e0e0e0;
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-size: 0.95rem;
                                        font-weight: 600;
                                        transition: all 0.3s;
                                    ">
                                        🎤 Tylko audio
                                    </button>
                                    <button id="selectVideoAudio" onclick="witnessesModule.selectRecordingType('video')" style="
                                        flex: 1;
                                        padding: 12px;
                                        background: white;
                                        border: 2px solid #e0e0e0;
                                        border-radius: 8px;
                                        cursor: pointer;
                                        font-size: 0.95rem;
                                        font-weight: 600;
                                        transition: all 0.3s;
                                    ">
                                        📹 Audio + Wideo
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Podgląd kamery -->
                            <div id="videoPreviewContainer" style="display: none; margin-bottom: 15px;">
                                <video id="videoPreview" autoplay muted style="width: 100%; max-height: 300px; background: black; border-radius: 8px;"></video>
                            </div>
                            
                            <!-- Kontrolki nagrywania -->
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <button id="startRecording" onclick="witnessesModule.startRecording()" style="
                                    flex: 1;
                                    padding: 12px;
                                    background: linear-gradient(135deg, #dc3545, #c82333);
                                    color: white;
                                    border: none;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-size: 1rem;
                                    font-weight: 700;
                                    box-shadow: 0 4px 12px rgba(220,53,69,0.3);
                                    display: none;
                                ">
                                    ⏺️ Start nagrywania
                                </button>
                                <button id="stopRecording" onclick="witnessesModule.stopRecording()" style="
                                    flex: 1;
                                    padding: 12px;
                                    background: linear-gradient(135deg, #6c757d, #545b62);
                                    color: white;
                                    border: none;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-size: 1rem;
                                    font-weight: 700;
                                    box-shadow: 0 4px 12px rgba(108,117,125,0.3);
                                    display: none;
                                ">
                                    ⏹️ Stop
                                </button>
                                <div id="recordingTimer" style="display: none; padding: 12px; background: white; border-radius: 8px; font-weight: 700; color: #dc3545; font-size: 1.1rem; min-width: 80px; text-align: center;">
                                    00:00
                                </div>
                            </div>
                            
                            <!-- Status -->
                            <div id="recordingStatus" style="margin-top: 15px; padding: 12px; background: white; border-radius: 8px; text-align: center; color: #999; font-size: 0.9rem;">
                                Wybierz typ nagrania aby rozpocząć
                            </div>
                        </div>
                        
                        <!-- Treść zeznania -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Treść zeznania *</label>
                            <textarea id="testimonyContent" style="width: 100%; min-height: 200px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; font-family: inherit; resize: vertical;" placeholder="Wpisz treść zeznania..."></textarea>
                        </div>
                        
                        <!-- Ocena wiarygodności -->
                        <div>
                            <label style="display: block; color: #666; font-weight: 600; margin-bottom: 8px;">Ocena wiarygodności (opcjonalnie)</label>
                            <textarea id="credibilityAssessment" style="width: 100%; min-height: 100px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; font-family: inherit; resize: vertical;" placeholder="Twoja ocena wiarygodności tego zeznania..."></textarea>
                        </div>
                    </div>
                    
                    <!-- Przyciski -->
                    <div style="display: flex; gap: 15px; margin-top: 25px;">
                        <button onclick="witnessesModule.closeTestimonyModal()" style="
                            flex: 1;
                            padding: 12px;
                            background: #e0e0e0;
                            color: #666;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 1rem;
                            font-weight: 600;
                        ">
                            Anuluj
                        </button>
                        <button onclick="witnessesModule.saveTestimony(${witnessId})" style="
                            flex: 1;
                            padding: 12px;
                            background: linear-gradient(135deg, #3B82F6, #20c997);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 1rem;
                            font-weight: 700;
                            box-shadow: 0 4px 12px rgba(40,167,69,0.3);
                        ">
                            ✓ Zapisz zeznanie
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },
    
    // Zapisz zeznanie
    saveTestimony: async function(witnessId) {
        const date = document.getElementById('testimonyDate').value;
        const type = document.getElementById('testimonyType').value;
        const content = document.getElementById('testimonyContent').value.trim();
        const assessment = document.getElementById('credibilityAssessment').value.trim();
        
        if (!date || !content) {
            alert('❌ Wypełnij wymagane pola (data i treść zeznania)');
            return;
        }
        
        try {
            console.log('💾 Zapisuję zeznanie świadka:', witnessId);
            
            // 1. Zapisz zeznanie
            const response = await window.api.request(`/witnesses/${witnessId}/testimonies`, {
                method: 'POST',
                body: JSON.stringify({
                    testimony_date: date,
                    testimony_type: type,
                    testimony_content: content,
                    credibility_assessment: assessment || null
                })
            });
            
            console.log('✅ Zeznanie zapisane:', response);
            
            // 2. Jeśli to zeznanie PISEMNE lub USTNE, zapisz jako TXT
            if (type === 'written' || type === 'oral') {
                const typeLabel = type === 'written' ? 'pisemnego' : 'ustnego (transkrypcja)';
                console.log(`📄 Zapisywanie zeznania ${typeLabel} jako TXT...`);
                
                try {
                    const txtResponse = await window.api.request(
                        `/witnesses/${witnessId}/testimonies/${response.testimony_id}/save-as-txt`,
                        {
                            method: 'POST'
                        }
                    );
                    console.log('✅ Zeznanie zapisane jako TXT:', txtResponse.attachment_code);
                } catch (txtError) {
                    console.error('❌ Błąd zapisu zeznania jako TXT:', txtError);
                    // Nie przerywamy - zeznanie już zapisane
                }
            }
            
            // 3. Jeśli jest nagranie, upload jako załącznik
            if (type === 'recorded' && this.recordedBlob) {
                console.log('📎 Uploading nagrania jako załącznik...');
                console.log('📎 Blob type:', this.recordedBlob.type, 'Size:', this.recordedBlob.size);
                
                try {
                    // Pobierz dane świadka aby uzyskać case_id
                    const witnessResp = await window.api.request(`/witnesses/${witnessId}`);
                    const witness = witnessResp.witness;
                    
                    // Wygeneruj numer nagrania
                    const recordingCodeResp = await window.api.request(`/witnesses/${witnessId}/generate-recording-code`, {
                        method: 'POST'
                    });
                    const recordingCode = recordingCodeResp.recording_code;
                    console.log('🔢 Numer nagrania:', recordingCode);
                    
                    // Określ rozszerzenie na podstawie MIME type
                    let extension = 'webm';
                    if (this.recordedBlob.type.includes('mp4')) {
                        extension = 'mp4';
                    } else if (this.recordedBlob.type.includes('ogg')) {
                        extension = 'ogg';
                    }
                    
                    // Przygotuj FormData - zapisz jako załącznik zeznania (entity_type=testimony)
                    const formData = new FormData();
                    const filename = `${recordingCode}_v${response.version_number}_${Date.now()}.${extension}`;
                    formData.append('file', this.recordedBlob, filename);
                    formData.append('case_id', witness.case_id);
                    formData.append('entity_type', 'testimony');
                    formData.append('entity_id', response.testimony_id);
                    formData.append('title', `${recordingCode} - Nagranie zeznania v${response.version_number}`);
                    formData.append('category', 'zeznanie');
                    formData.append('description', `Nagranie ${this.recordingType === 'video' ? 'wideo' : 'audio'} z dnia ${new Date(date).toLocaleDateString('pl-PL')} (${witness.witness_code})`);
                    
                    console.log('📎 Filename:', filename);
                    
                    // Upload
                    const token = localStorage.getItem('token');
                    const apiUrl = window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://web-production-ef868.up.railway.app';
                    const uploadResponse = await fetch(`${apiUrl}/attachments/upload`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        },
                        body: formData
                    });
                    
                    if (uploadResponse.ok) {
                        const uploadResult = await uploadResponse.json();
                        console.log('✅ Nagranie zapisane jako załącznik:', uploadResult);
                    } else {
                        const errorText = await uploadResponse.text();
                        console.error('❌ Błąd uploadu nagrania:', errorText);
                    }
                } catch (uploadError) {
                    console.error('❌ Błąd uploadu nagrania:', uploadError);
                    // Nie przerywamy - zeznanie już zapisane
                }
                
                // Wyczyść nagranie
                this.recordedBlob = null;
                this.currentMimeType = null;
                this.stopMediaStream();
            }
            
            alert(`✅ Zeznanie zapisane (wersja ${response.version_number})`);
            
            // Zamknij modala dodawania
            document.getElementById('addTestimonyModal').remove();
            
            // Odśwież listę zeznań
            const testimModal = document.getElementById('testimoniesModal');
            if (testimModal) {
                testimModal.remove();
            }
            this.showTestimonies(witnessId);
            
        } catch (error) {
            console.error('❌ Błąd zapisywania zeznania:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Wycofaj zeznanie
    retractTestimony: async function(witnessId, testimonyId) {
        const reason = prompt('Podaj powód wycofania zeznania:');
        if (!reason) return;
        
        try {
            console.log('❌ Wycofuję zeznanie:', testimonyId);
            
            await window.api.request(`/witnesses/${witnessId}/testimonies/${testimonyId}/retract`, {
                method: 'POST',
                body: JSON.stringify({ retraction_reason: reason })
            });
            
            console.log('✅ Zeznanie wycofane');
            alert('✅ Zeznanie wycofane');
            
            // Odśwież listę
            document.getElementById('testimoniesModal').remove();
            this.showTestimonies(witnessId);
            
        } catch (error) {
            console.error('❌ Błąd wycofywania zeznania:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Podgląd szczegółów zeznania (z modala Szczegóły świadka)
    viewTestimonyDetails: async function(witnessId, testimonyId) {
        console.log('👁️ Podgląd zeznania:', testimonyId);
        
        // Pokaż okienko ładowania
        const loadingModal = document.createElement('div');
        loadingModal.id = 'testimonyLoadingModal';
        loadingModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); display: flex; align-items: center;
            justify-content: center; z-index: 10003; animation: fadeIn 0.2s;
        `;
        loadingModal.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 1.5s infinite;">📝</div>
                <div style="font-size: 1.3rem; font-weight: 600; margin-bottom: 15px;">Ładowanie zeznania...</div>
                <div style="width: 200px; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden; margin: 0 auto;">
                    <div style="width: 30%; height: 100%; background: linear-gradient(90deg, #3B82F6, #1E40AF); border-radius: 3px; animation: loadingBar 1.5s ease-in-out infinite;"></div>
                </div>
            </div>
        `;
        document.body.appendChild(loadingModal);
        
        try {
            // Pobierz wszystkie zeznania
            const testimResp = await window.api.request(`/witnesses/${witnessId}/testimonies`);
            const testimonies = testimResp.testimonies || [];
            
            // Znajdź konkretne zeznanie
            const testimony = testimonies.find(t => t.id === testimonyId);
            if (!testimony) {
                const loadingEl = document.getElementById('testimonyLoadingModal');
                if (loadingEl) loadingEl.remove();
                alert('❌ Zeznanie nie znalezione');
                return;
            }
            
            // Pobierz załączniki zeznania (dla nagrań)
            let recordingAttachment = null;
            if (testimony.testimony_type === 'recorded') {
                try {
                    // Pobierz załączniki bezpośrednio dla tego zeznania (entity_type=testimony)
                    const apiUrl = window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://web-production-ef868.up.railway.app';
                    const token = localStorage.getItem('token');
                    
                    const attachResp = await fetch(`${apiUrl}/attachments?entity_type=testimony&entity_id=${testimonyId}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const attachData = await attachResp.json();
                    const attachments = attachData.attachments || [];
                    
                    // Znajdź nagranie (wideo lub audio)
                    const recordingAttachments = attachments.filter(a => 
                        a.category === 'zeznanie' &&
                        (a.file_type?.startsWith('video/') || a.file_type?.startsWith('audio/') || 
                         a.file_name?.endsWith('.webm') || a.file_name?.endsWith('.mp4') || a.file_name?.endsWith('.ogg'))
                    );
                    
                    if (recordingAttachments.length > 0) {
                        recordingAttachment = recordingAttachments[0];
                        console.log('📎 Znaleziono nagranie zeznania:', recordingAttachment);
                    }
                } catch (err) {
                    console.error('⚠️ Błąd pobierania załączników zeznania:', err);
                }
            }
            
            // Dla nagrania - użyj bezpośredniego URL ze streamingiem (nie pobieraj całego pliku!)
            let recordingStreamUrl = null;
            if (recordingAttachment) {
                const token = localStorage.getItem('token');
                const apiUrl = window.getApiBaseUrl ? window.getApiBaseUrl() : 'https://web-production-ef868.up.railway.app';
                // Użyj bezpośredniego URL z tokenem - serwer obsługuje Range requests dla streamingu
                recordingStreamUrl = `${apiUrl}/attachments/${recordingAttachment.id}/download?token=${token}`;
                console.log('📹 Streaming URL nagrania:', recordingStreamUrl);
            }
            
            // Usuń okienko ładowania
            const loadingEl = document.getElementById('testimonyLoadingModal');
            if (loadingEl) loadingEl.remove();
            
            // Stwórz modal szczegółów zeznania (z-index wyższy)
            const modal = document.createElement('div');
            modal.id = 'testimonyDetailsModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100vh;
                background: rgba(0,0,0,0.85);
                z-index: 10002;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            `;
            
            modal.innerHTML = `
                <div style="background: white; border-radius: 16px; padding: 0; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 8px 32px rgba(0,0,0,0.4);">
                    <!-- Header -->
                    <div style="background: linear-gradient(135deg, #3B82F6, #1E40AF); padding: 20px; border-radius: 16px 16px 0 0; color: white; position: sticky; top: 0; z-index: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h3 style="margin: 0 0 5px 0;">📝 Szczegóły zeznania</h3>
                                <p style="margin: 0; opacity: 0.9; font-size: 0.95rem;">Wersja ${testimony.version_number}</p>
                            </div>
                            <button onclick="witnessesModule.closeTestimonyDetailsModal('${recordingStreamUrl || ''}')" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; font-size: 1.5rem; font-weight: 700;">×</button>
                        </div>
                    </div>
                    
                    <!-- Body -->
                    <div style="padding: 25px;">
                        <!-- Informacje podstawowe -->
                        <div style="background: #f9f9f9; padding: 18px; border-radius: 12px; margin-bottom: 20px;">
                            <div style="display: grid; gap: 12px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="color: #999; font-size: 0.85rem; margin-bottom: 4px;">Data zeznania</div>
                                        <div style="color: #1a2332; font-size: 1rem; font-weight: 600;">
                                            📅 ${new Date(testimony.testimony_date).toLocaleDateString('pl-PL', {year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                                        </div>
                                    </div>
                                    <span style="padding: 8px 14px; background: ${testimony.testimony_type === 'written' ? '#3B82F6' : testimony.testimony_type === 'oral' ? '#3B82F6' : '#3B82F6'}; color: white; border-radius: 8px; font-size: 0.9rem; font-weight: 600;">
                                        ${testimony.testimony_type === 'written' ? '📄 Pisemne' : testimony.testimony_type === 'oral' ? '🎤 Ustne' : '📹 Nagranie'}
                                    </span>
                                </div>
                                
                                <div>
                                    <div style="color: #999; font-size: 0.85rem; margin-bottom: 4px;">Zapisał</div>
                                    <div style="color: #1a2332; font-size: 0.95rem;">👤 ${testimony.recorded_by_name || 'Nieznany'}</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Odtwarzacz nagrania -->
                        ${recordingAttachment && recordingStreamUrl ? `
                            <div style="margin-bottom: 25px;">
                                <h4 style="margin: 0 0 15px 0; color: #3B82F6; font-size: 1.1rem;">
                                    ${recordingAttachment.file_type?.startsWith('video/') ? '📹 Nagranie wideo' : '🎤 Nagranie audio'}
                                </h4>
                                <div style="padding: 20px; background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); border-radius: 16px; box-shadow: 0 4px 20px rgba(102,126,234,0.3);">
                                    ${recordingAttachment.file_type?.startsWith('video/') ? `
                                        <!-- Odtwarzacz wideo -->
                                        <video 
                                            controls 
                                            controlsList="nodownload"
                                            style="width: 100%; max-height: 400px; border-radius: 12px; background: black;"
                                            src="${recordingStreamUrl}"
                                        >
                                            Twoja przeglądarka nie obsługuje odtwarzania wideo.
                                        </video>
                                    ` : `
                                        <!-- Odtwarzacz audio -->
                                        <div style="text-align: center; padding: 20px;">
                                            <div style="font-size: 4rem; margin-bottom: 20px; color: white;">🎵</div>
                                            <audio 
                                                controls 
                                                controlsList="nodownload"
                                                style="width: 100%; max-width: 500px;"
                                                src="${recordingStreamUrl}"
                                            >
                                                Twoja przeglądarka nie obsługuje odtwarzania audio.
                                            </audio>
                                        </div>
                                    `}
                                    <!-- Informacje o pliku -->
                                    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); display: flex; justify-content: space-between; align-items: center; color: white; font-size: 0.9rem;">
                                        <div>
                                            <div style="opacity: 0.8; margin-bottom: 4px;">Plik: ${recordingAttachment.file_name}</div>
                                            <div style="opacity: 0.8;">Rozmiar: ${(recordingAttachment.file_size / (1024 * 1024)).toFixed(2)} MB</div>
                                        </div>
                                        <button 
                                            onclick="downloadAttachment(${recordingAttachment.id})"
                                            style="
                                                padding: 10px 20px;
                                                background: rgba(255,255,255,0.2);
                                                border: 2px solid white;
                                                color: white;
                                                border-radius: 8px;
                                                cursor: pointer;
                                                font-size: 0.9rem;
                                                font-weight: 600;
                                                transition: all 0.3s;
                                            "
                                            onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                                            onmouseout="this.style.background='rgba(255,255,255,0.2)'"
                                        >
                                            ⬇️ Pobierz
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ` : ''}
                        
                        <!-- Treść zeznania -->
                        <div style="margin-bottom: 20px;">
                            <h4 style="margin: 0 0 12px 0; color: #1a2332; font-size: 1.1rem;">📄 Treść zeznania</h4>
                            <div style="padding: 20px; background: #f9f9f9; border-radius: 12px; border-left: 4px solid #3B82F6;">
                                <div style="color: #1a2332; font-size: 1rem; line-height: 1.7; white-space: pre-wrap;">${testimony.testimony_content}</div>
                            </div>
                        </div>
                        
                        <!-- Ocena wiarygodności -->
                        ${testimony.credibility_assessment ? `
                            <div style="margin-bottom: 20px;">
                                <h4 style="margin: 0 0 12px 0; color: #3B82F6; font-size: 1.1rem;">✓ Ocena wiarygodności</h4>
                                <div style="padding: 18px; background: #F8FAFC; border-radius: 12px; border-left: 4px solid #3B82F6;">
                                    <div style="color: #1a2332; font-size: 0.95rem; line-height: 1.6;">${testimony.credibility_assessment}</div>
                                </div>
                            </div>
                        ` : ''}
                        
                        <!-- Status wycofania -->
                        ${testimony.is_retracted ? `
                            <div style="margin-bottom: 20px;">
                                <div style="padding: 18px; background: #ffe6e6; border-radius: 12px; border-left: 4px solid #dc3545;">
                                    <h4 style="margin: 0 0 10px 0; color: #dc3545; font-size: 1.1rem;">❌ ZEZNANIE WYCOFANE</h4>
                                    ${testimony.retraction_reason ? `
                                        <div style="color: #1a2332; font-size: 0.95rem; line-height: 1.6; margin-bottom: 10px;">${testimony.retraction_reason}</div>
                                    ` : ''}
                                    ${testimony.retraction_date ? `
                                        <div style="color: #999; font-size: 0.85rem;">Wycofano: ${new Date(testimony.retraction_date).toLocaleString('pl-PL')}</div>
                                    ` : ''}
                                </div>
                            </div>
                        ` : `
                            <!-- Przycisk wycofania -->
                            <div style="text-align: center; margin-top: 25px;">
                                <button onclick="if(confirm('Na pewno wycofać to zeznanie?')) { witnessesModule.retractTestimonyFromDetails(${witnessId}, ${testimonyId}) }" style="
                                    padding: 12px 24px;
                                    background: #dc3545;
                                    color: white;
                                    border: none;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-size: 0.95rem;
                                    font-weight: 600;
                                    box-shadow: 0 2px 8px rgba(220,53,69,0.3);
                                ">
                                    ❌ Wycofaj zeznanie
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
        } catch (error) {
            // Usuń okienko ładowania w przypadku błędu
            const loadingEl = document.getElementById('testimonyLoadingModal');
            if (loadingEl) loadingEl.remove();
            
            console.error('❌ Błąd podglądu zeznania:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // Wycofaj zeznanie z modala szczegółów
    retractTestimonyFromDetails: async function(witnessId, testimonyId) {
        const reason = prompt('Podaj powód wycofania zeznania:');
        if (!reason) return;
        
        try {
            await window.api.request(`/witnesses/${witnessId}/testimonies/${testimonyId}/retract`, {
                method: 'POST',
                body: JSON.stringify({ retraction_reason: reason })
            });
            
            alert('✅ Zeznanie wycofane');
            
            // Zamknij modal szczegółów
            document.getElementById('testimonyDetailsModal').remove();
            
            // Odśwież modal świadka jeśli jest otwarty
            const witnessModal = document.getElementById('witnessDetailsModal');
            if (witnessModal) {
                witnessModal.remove();
                this.viewWitnessDetails(witnessId);
            }
            
        } catch (error) {
            console.error('❌ Błąd wycofywania:', error);
            alert('❌ Błąd: ' + error.message);
        }
    },
    
    // ================================================
    // FUNKCJE NAGRYWANIA AUDIO/WIDEO
    // ================================================
    
    mediaStream: null,
    mediaRecorder: null,
    recordedChunks: [],
    recordingType: null,
    recordingStartTime: null,
    timerInterval: null,
    
    // Obsługa zmiany typu zeznania
    handleTestimonyTypeChange: function() {
        const type = document.getElementById('testimonyType').value;
        const recordingInterface = document.getElementById('recordingInterface');
        
        if (type === 'recorded') {
            recordingInterface.style.display = 'block';
        } else {
            recordingInterface.style.display = 'none';
            this.stopMediaStream();
        }
    },
    
    // Wybór typu nagrania (audio/video)
    selectRecordingType: async function(type) {
        console.log('📹 Wybrano typ nagrania:', type);
        this.recordingType = type;
        
        // Stylowanie przycisków
        const audioBtn = document.getElementById('selectAudioOnly');
        const videoBtn = document.getElementById('selectVideoAudio');
        
        if (type === 'audio') {
            audioBtn.style.background = 'linear-gradient(135deg, #3B82F6, #1E40AF)';
            audioBtn.style.color = 'white';
            audioBtn.style.borderColor = '#3B82F6';
            videoBtn.style.background = 'white';
            videoBtn.style.color = '#666';
            videoBtn.style.borderColor = '#e0e0e0';
        } else {
            videoBtn.style.background = 'linear-gradient(135deg, #3B82F6, #1E40AF)';
            videoBtn.style.color = 'white';
            videoBtn.style.borderColor = '#3B82F6';
            audioBtn.style.background = 'white';
            audioBtn.style.color = '#666';
            audioBtn.style.borderColor = '#e0e0e0';
        }
        
        // Inicjalizuj stream
        await this.initMediaStream(type);
    },
    
    // Inicjalizacja strumienia mediów
    initMediaStream: async function(type) {
        try {
            const constraints = type === 'video' 
                ? { video: true, audio: true }
                : { audio: true };
            
            console.log('🎙️ Requesting media with constraints:', JSON.stringify(constraints));
            document.getElementById('recordingStatus').innerHTML = '⏳ Czekam na pozwolenie...';
            
            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Sprawdź czy audio jest dostępne
            const audioTracks = this.mediaStream.getAudioTracks();
            const videoTracks = this.mediaStream.getVideoTracks();
            console.log('🎙️ Audio tracks:', audioTracks.length, audioTracks.map(t => t.label));
            console.log('📹 Video tracks:', videoTracks.length, videoTracks.map(t => t.label));
            
            if (audioTracks.length === 0) {
                console.error('❌ BRAK ŚCIEŻKI AUDIO!');
                document.getElementById('recordingStatus').innerHTML = '⚠️ Mikrofon nie został wykryty!';
                document.getElementById('recordingStatus').style.color = '#ff9800';
            }
            
            // Pokaż podgląd wideo jeśli wybrano wideo
            if (type === 'video') {
                const videoPreview = document.getElementById('videoPreview');
                const videoContainer = document.getElementById('videoPreviewContainer');
                videoPreview.srcObject = this.mediaStream;
                videoContainer.style.display = 'block';
            } else {
                document.getElementById('videoPreviewContainer').style.display = 'none';
            }
            
            // Pokaż przycisk start
            document.getElementById('startRecording').style.display = 'block';
            document.getElementById('recordingStatus').innerHTML = `✅ ${type === 'video' ? 'Kamera i mikrofon' : 'Mikrofon'} gotowe! Kliknij "Start nagrywania"`;
            document.getElementById('recordingStatus').style.color = '#3B82F6';
            
        } catch (error) {
            console.error('❌ Błąd dostępu do mediów:', error);
            document.getElementById('recordingStatus').innerHTML = '❌ Brak dostępu do kamery/mikrofonu. Sprawdź uprawnienia.';
            document.getElementById('recordingStatus').style.color = '#dc3545';
        }
    },
    
    // Start nagrywania
    startRecording: function() {
        if (!this.mediaStream) {
            alert('❌ Najpierw wybierz typ nagrania');
            return;
        }
        
        this.recordedChunks = [];
        
        // Utwórz MediaRecorder z odpowiednim MIME type
        let options;
        let mimeType;
        
        if (this.recordingType === 'video') {
            // Dla wideo - próbuj najpierw VP9+opus, potem VP8+opus, potem fallback
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
                options = { mimeType: 'video/webm;codecs=vp9,opus' };
                mimeType = 'video/webm';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
                options = { mimeType: 'video/webm;codecs=vp8,opus' };
                mimeType = 'video/webm';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                options = { mimeType: 'video/webm;codecs=vp9' };
                mimeType = 'video/webm';
            } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                options = { mimeType: 'video/webm;codecs=vp8' };
                mimeType = 'video/webm';
            } else {
                options = { mimeType: 'video/webm' };
                mimeType = 'video/webm';
            }
        } else {
            // Dla audio - próbuj opus
            if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
                options = { mimeType: 'audio/webm;codecs=opus' };
                mimeType = 'audio/webm';
            } else if (MediaRecorder.isTypeSupported('audio/webm')) {
                options = { mimeType: 'audio/webm' };
                mimeType = 'audio/webm';
            } else {
                // Fallback dla Safari
                options = { mimeType: 'audio/mp4' };
                mimeType = 'audio/mp4';
            }
        }
        
        console.log('🎙️ Używam MIME type:', options.mimeType);
        
        try {
            this.mediaRecorder = new MediaRecorder(this.mediaStream, options);
            this.currentMimeType = mimeType;
        } catch (e) {
            console.warn('⚠️ Fallback do domyślnego MediaRecorder:', e);
            this.mediaRecorder = new MediaRecorder(this.mediaStream);
            this.currentMimeType = this.recordingType === 'video' ? 'video/webm' : 'audio/webm';
        }
        
        // Zbieraj dane
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };
        
        // Po zakończeniu nagrywania
        this.mediaRecorder.onstop = () => {
            const blob = new Blob(this.recordedChunks, {
                type: this.currentMimeType || (this.recordingType === 'video' ? 'video/webm' : 'audio/webm')
            });
            
            console.log('✅ Nagranie zakończone - Blob type:', blob.type, 'Size:', blob.size);
            
            // Zapisz blob do wykorzystania później
            this.recordedBlob = blob;
            
            // Pokaż informację
            const sizeMB = (blob.size / (1024 * 1024)).toFixed(2);
            document.getElementById('recordingStatus').innerHTML = `✅ Nagranie zakończone (${sizeMB} MB). Możesz zapisać zeznanie.`;
            document.getElementById('recordingStatus').style.color = '#3B82F6';
            
            // Automatycznie dodaj do treści zeznania
            const content = document.getElementById('testimonyContent');
            content.value = `[NAGRANIE ${this.recordingType === 'video' ? 'WIDEO' : 'AUDIO'}]\n\n` + 
                           `Rozmiar: ${sizeMB} MB\n` +
                           `Format: ${this.currentMimeType}\n` +
                           `Data: ${new Date().toLocaleString('pl-PL')}\n\n` +
                           (content.value || 'Transkrypcja lub dodatkowe uwagi...');
        };
        
        // Start
        this.mediaRecorder.start();
        this.recordingStartTime = Date.now();
        
        // UI
        document.getElementById('startRecording').style.display = 'none';
        document.getElementById('stopRecording').style.display = 'block';
        document.getElementById('recordingTimer').style.display = 'block';
        document.getElementById('recordingStatus').innerHTML = '🔴 NAGRYWANIE W TOKU...';
        document.getElementById('recordingStatus').style.color = '#dc3545';
        
        // Timer
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            document.getElementById('recordingTimer').textContent = 
                `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }, 1000);
        
        console.log('🔴 Nagrywanie rozpoczęte');
    },
    
    // Stop nagrywania
    stopRecording: function() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        
        // Zatrzymaj timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // UI
        document.getElementById('stopRecording').style.display = 'none';
        document.getElementById('recordingTimer').style.display = 'none';
        
        console.log('⏹️ Nagrywanie zatrzymane');
    },
    
    // Zatrzymaj stream mediów
    stopMediaStream: function() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
        
        // Resetuj UI
        const videoPreview = document.getElementById('videoPreview');
        if (videoPreview) {
            videoPreview.srcObject = null;
        }
    },
    
    // Zamknij modal zeznania (z czyszczeniem)
    closeTestimonyModal: function() {
        // Zatrzymaj nagrywanie jeśli trwa
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.stopRecording();
        }
        
        // Zatrzymaj timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Zatrzymaj strumień mediów
        this.stopMediaStream();
        
        // Wyczyść nagranie
        this.recordedBlob = null;
        this.recordingType = null;
        
        // Zamknij modal
        const modal = document.getElementById('addTestimonyModal');
        if (modal) {
            modal.remove();
        }
        
        console.log('🧹 Modal zeznania zamknięty i wyczyszczony');
    },
    
    // Zamknij modal szczegółów zeznania (z czyszczeniem blob URL)
    closeTestimonyDetailsModal: function(blobUrl) {
        // Zwolnij blob URL jeśli istnieje
        if (blobUrl && blobUrl.startsWith('blob:')) {
            window.URL.revokeObjectURL(blobUrl);
            console.log('🧹 Blob URL zwolniony');
        }
        
        // Zamknij modal
        const modal = document.getElementById('testimonyDetailsModal');
        if (modal) {
            modal.remove();
        }
        
        console.log('🧹 Modal szczegółów zeznania zamknięty');
    }
};

console.log('✅ Moduł świadków załadowany');

// Funkcja diagnostyczna - testuj obsługę nagrywania
window.testRecordingSupport = function() {
    console.log('🎙️ === TESTY OBSŁUGI NAGRYWANIA ===');
    
    // 1. MediaRecorder API
    if (!window.MediaRecorder) {
        console.error('❌ MediaRecorder API NIE jest obsługiwane w tej przeglądarce!');
        return;
    }
    console.log('✅ MediaRecorder API jest obsługiwane');
    
    // 2. getUserMedia
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('❌ getUserMedia NIE jest obsługiwane!');
        return;
    }
    console.log('✅ getUserMedia jest obsługiwane');
    
    // 3. Wspierane MIME types
    console.log('\n📋 Wspierane formaty nagrywania:');
    
    const videoTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4'
    ];
    
    const audioTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
    ];
    
    console.log('🎥 VIDEO:');
    videoTypes.forEach(type => {
        const supported = MediaRecorder.isTypeSupported(type);
        console.log(`  ${supported ? '✅' : '❌'} ${type}`);
    });
    
    console.log('\n🎤 AUDIO:');
    audioTypes.forEach(type => {
        const supported = MediaRecorder.isTypeSupported(type);
        console.log(`  ${supported ? '✅' : '❌'} ${type}`);
    });
    
    console.log('\n💡 Użyj: witnessesModule.selectRecordingType("audio") lub "video" aby przetestować nagrywanie');
};

} // Koniec sprawdzania czy moduł włączony

