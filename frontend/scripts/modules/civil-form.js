// ========== FORMULARZ SZCZEGÓŁÓW SPRAW CYWILNYCH ==========
console.log('📝 Civil Form v1.0 - Loaded!');

// Dodaj do istniejącego CivilDetailsModule
window.civilDetailsModule.showEditForm = async function() {
    const data = this.civilData || {};
    
    const modal = window.crmManager.createModal('📋 Szczegóły sprawy cywilnej', `
        <form id="civilDetailsForm" style="max-height: 70vh; overflow-y: auto; padding-right: 10px;">
            
            <!-- KATEGORIA SPRAWY -->
            <div style="margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <label style="display: block; margin-bottom: 8px; font-weight: 700; color: #1a2332;">📂 Kategoria sprawy cywilnej *</label>
                <select name="civil_category" id="civilCategory" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.95rem;" onchange="window.civilDetailsModule.toggleSections()">
                    <option value="">-- Wybierz kategorię --</option>
                    <option value="contract" ${data.civil_category === 'contract' ? 'selected' : ''}>📄 Umowy cywilnoprawne</option>
                    <option value="monetary" ${data.civil_category === 'monetary' ? 'selected' : ''}>💰 Roszczenia pieniężne</option>
                    <option value="compensation" ${data.civil_category === 'compensation' ? 'selected' : ''}>⚖️ Roszczenia odszkodowawcze</option>
                    <option value="property" ${data.civil_category === 'property' ? 'selected' : ''}>🏠 Spory nieruchomościowe</option>
                    <option value="other" ${data.civil_category === 'other' ? 'selected' : ''}>📋 Inne</option>
                </select>
            </div>

            <!-- SEKCJA: UMOWY CYWILNOPRAWNE -->
            <div id="section_contract" style="display: none; background: #f3e5f5; padding: 20px; border-radius: 12px; border-left: 4px solid #9c27b0; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #7b1fa2;">📄 Umowy cywilnoprawne</h3>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Rodzaj umowy</label>
                    <select name="contract_type" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="">-- Wybierz --</option>
                        <option value="sale" ${data.contract_type === 'sale' ? 'selected' : ''}>Sprzedaży</option>
                        <option value="rent" ${data.contract_type === 'rent' ? 'selected' : ''}>Najmu</option>
                        <option value="commission" ${data.contract_type === 'commission' ? 'selected' : ''}>Zlecenia</option>
                        <option value="work" ${data.contract_type === 'work' ? 'selected' : ''}>Dzieła</option>
                        <option value="loan" ${data.contract_type === 'loan' ? 'selected' : ''}>Pożyczki</option>
                        <option value="other" ${data.contract_type === 'other' ? 'selected' : ''}>Inna</option>
                    </select>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Data zawarcia umowy</label>
                        <input type="date" name="contract_date" value="${data.contract_date || ''}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Strony umowy</label>
                        <input type="text" name="contract_parties" value="${this.escapeHtml(data.contract_parties || '')}" placeholder="Jan Kowalski, Anna Nowak" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Warunki umowy</label>
                    <textarea name="contract_terms" rows="3" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;">${this.escapeHtml(data.contract_terms || '')}</textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" name="contract_executed" ${data.contract_executed ? 'checked' : ''} style="width: 18px; height: 18px;">
                            <span style="font-weight: 600;">Umowa została wykonana</span>
                        </label>
                    </div>
                    <div>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" name="penalties_provided" id="penaltiesCheck" ${data.penalties_provided ? 'checked' : ''} style="width: 18px; height: 18px;" onchange="document.getElementById('penaltyFields').style.display = this.checked ? 'block' : 'none'">
                            <span style="font-weight: 600;">Przewidziano kary umowne</span>
                        </label>
                    </div>
                </div>
                
                <div id="penaltyFields" style="display: ${data.penalties_provided ? 'block' : 'none'}; background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Wysokość kary (PLN)</label>
                            <input type="number" name="penalty_amount" value="${data.penalty_amount || ''}" step="0.01" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Zasady naliczania</label>
                            <input type="text" name="penalty_terms" value="${this.escapeHtml(data.penalty_terms || '')}" placeholder="np. 100 PLN za każdy dzień opóźnienia" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                    </div>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Niezrealizowane zobowiązania</label>
                    <textarea name="unmet_obligations" rows="3" placeholder="Opisz które zobowiązania nie zostały spełnione..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;">${this.escapeHtml(data.unmet_obligations || '')}</textarea>
                </div>
            </div>

            <!-- SEKCJA: ROSZCZENIA PIENIĘŻNE -->
            <div id="section_monetary" style="display: none; background: #F8FAFC; padding: 20px; border-radius: 12px; border-left: 4px solid #3B82F6; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #2e7d32;">💰 Roszczenia pieniężne</h3>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Podstawa roszczenia</label>
                    <select name="claim_basis" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="">-- Wybierz --</option>
                        <option value="contract" ${data.claim_basis === 'contract' ? 'selected' : ''}>Umowa</option>
                        <option value="invoice" ${data.claim_basis === 'invoice' ? 'selected' : ''}>Faktura</option>
                        <option value="promissory_note" ${data.claim_basis === 'promissory_note' ? 'selected' : ''}>Weksel</option>
                        <option value="credit" ${data.claim_basis === 'credit' ? 'selected' : ''}>Umowa kredytowa</option>
                    </select>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">💵 Kwota główna (PLN)</label>
                        <input type="number" name="principal_amount" value="${data.principal_amount || ''}" step="0.01" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-weight: 700; font-size: 1.1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">📈 Odsetki (PLN)</label>
                        <input type="number" name="interest_amount" value="${data.interest_amount || ''}" step="0.01" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" name="payment_demands_sent" ${data.payment_demands_sent ? 'checked' : ''} style="width: 18px; height: 18px;">
                        <span style="font-weight: 600;">Wysłano wezwania do zapłaty</span>
                    </label>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Zarzuty dłużnika</label>
                    <textarea name="debtor_objections" rows="3" placeholder="Jakie zarzuty zgłasza dłużnik?" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;">${this.escapeHtml(data.debtor_objections || '')}</textarea>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">⏰ Sprawdzenie przedawnienia</label>
                    <textarea name="limitation_period_check" rows="2" placeholder="Terminy płatności, daty przedawnienia..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;">${this.escapeHtml(data.limitation_period_check || '')}</textarea>
                </div>
            </div>

            <!-- SEKCJA: ROSZCZENIA ODSZKODOWAWCZE -->
            <div id="section_compensation" style="display: none; background: #F8FAFC; padding: 20px; border-radius: 12px; border-left: 4px solid #3B82F6; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #f57c00;">⚖️ Roszczenia odszkodowawcze (pozakomunikacyjne)</h3>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Opis zdarzenia *</label>
                    <textarea name="incident_description" rows="4" placeholder="Opisz kiedy, gdzie i w jakich okolicznościach nastąpiła szkoda..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;">${this.escapeHtml(data.incident_description || '')}</textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Data zdarzenia</label>
                        <input type="date" name="incident_date" value="${data.incident_date || ''}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Lokalizacja</label>
                        <input type="text" name="incident_location" value="${this.escapeHtml(data.incident_location || '')}" placeholder="Miejsce zdarzenia" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; margin-top: 30px;">
                            <input type="checkbox" name="police_report" ${data.police_report ? 'checked' : ''} style="width: 18px; height: 18px;">
                            <span style="font-weight: 600;">Protokół policji</span>
                        </label>
                    </div>
                </div>
                
                <!-- SZKODA MAJĄTKOWA -->
                <div style="background: #ffe0e0; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <h4 style="margin: 0 0 10px 0; color: #d32f2f;">💔 Szkoda majątkowa</h4>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Co zostało uszkodzone?</label>
                        <input type="text" name="property_damaged" value="${this.escapeHtml(data.property_damaged || '')}" placeholder="np. mieszkanie, lokal, urządzenie" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">💵 Wartość szkody (PLN)</label>
                        <input type="number" name="property_value" value="${data.property_value || ''}" step="0.01" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-weight: 700;">
                    </div>
                </div>
                
                <!-- SZKODA OSOBOWA -->
                <div style="background: #ffebee; padding: 15px; border-radius: 8px;">
                    <h4 style="margin: 0 0 10px 0; color: #c62828;">🩹 Szkoda osobowa</h4>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Opis obrażeń</label>
                        <textarea name="injuries_description" rows="3" placeholder="np. złamanie, amputacja, uszczerbek na zdrowiu" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;">${this.escapeHtml(data.injuries_description || '')}</textarea>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Koszty leczenia (PLN)</label>
                            <input type="number" name="treatment_costs" value="${data.treatment_costs || ''}" step="0.01" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Utracone dochody (PLN)</label>
                            <input type="number" name="lost_income" value="${data.lost_income || ''}" step="0.01" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>
                    </div>
                </div>
            </div>

            <!-- SEKCJA: SPORY NIERUCHOMOŚCIOWE -->
            <div id="section_property" style="display: none; background: #e1f5fe; padding: 20px; border-radius: 12px; border-left: 4px solid #0288d1; margin-bottom: 20px;">
                <h3 style="margin: 0 0 15px 0; color: #01579b;">🏠 Spory nieruchomościowe</h3>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Typ sporu</label>
                    <select name="property_dispute_type" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="">-- Wybierz --</option>
                        <option value="co_ownership" ${data.property_dispute_type === 'co_ownership' ? 'selected' : ''}>Zniesienie współwłasności</option>
                        <option value="eviction" ${data.property_dispute_type === 'eviction' ? 'selected' : ''}>Eksmisja</option>
                        <option value="easement" ${data.property_dispute_type === 'easement' ? 'selected' : ''}>Służebność</option>
                        <option value="possession" ${data.property_dispute_type === 'possession' ? 'selected' : ''}>Naruszenie posiadania</option>
                    </select>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Tytuł prawny</label>
                        <input type="text" name="legal_title" value="${this.escapeHtml(data.legal_title || '')}" placeholder="własność, użytkowanie wieczyste..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 5px; font-weight: 600;">Numer księgi wieczystej</label>
                        <input type="text" name="land_register_number" value="${this.escapeHtml(data.land_register_number || '')}" placeholder="np. WA1W/00123456/7" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                </div>
                
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Akty notarialne</label>
                    <textarea name="notarial_acts" rows="2" placeholder="Daty zawarcia aktów notarialnych, szczegóły..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;">${this.escapeHtml(data.notarial_acts || '')}</textarea>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 5px; font-weight: 600;">Poprzednie sprawy sądowe</label>
                    <textarea name="previous_court_cases" rows="3" placeholder="Orzeczenia sądowe, postanowienia organów..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;">${this.escapeHtml(data.previous_court_cases || '')}</textarea>
                </div>
            </div>

            <!-- DODATKOWE NOTATKI -->
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332;">📝 Dodatkowe notatki</label>
                <textarea name="additional_notes" rows="4" placeholder="Wszelkie inne istotne informacje..." style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical;">${this.escapeHtml(data.additional_notes || '')}</textarea>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end; padding-top: 15px; border-top: 2px solid #dee2e6;">
                <button type="button" onclick="crmManager.closeModal()" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    Anuluj
                </button>
                <button type="submit" style="padding: 12px 24px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                    💾 Zapisz szczegóły
                </button>
            </div>
        </form>
    `);
    
    // Event listener dla formularza
    document.getElementById('civilDetailsForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveCivilDetails(e.target);
    });
    
    // Wywołaj toggle przy starcie
    setTimeout(() => this.toggleSections(), 100);
};

// Toggle sekcji
window.civilDetailsModule.toggleSections = function() {
    const category = document.getElementById('civilCategory').value;
    
    // Ukryj wszystkie sekcje
    document.getElementById('section_contract').style.display = 'none';
    document.getElementById('section_monetary').style.display = 'none';
    document.getElementById('section_compensation').style.display = 'none';
    document.getElementById('section_property').style.display = 'none';
    
    // Pokaż wybraną
    if (category) {
        const section = document.getElementById(`section_${category}`);
        if (section) section.style.display = 'block';
    }
};

// Zapisz dane
window.civilDetailsModule.saveCivilDetails = async function(form) {
    try {
        const formData = new FormData(form);
        
        const data = {
            civil_category: formData.get('civil_category'),
            contract_type: formData.get('contract_type') || null,
            contract_parties: formData.get('contract_parties') || null,
            contract_date: formData.get('contract_date') || null,
            contract_terms: formData.get('contract_terms') || null,
            contract_executed: formData.get('contract_executed') === 'on',
            unmet_obligations: formData.get('unmet_obligations') || null,
            penalties_provided: formData.get('penalties_provided') === 'on',
            penalty_amount: formData.get('penalty_amount') || null,
            penalty_terms: formData.get('penalty_terms') || null,
            claim_basis: formData.get('claim_basis') || null,
            principal_amount: formData.get('principal_amount') || null,
            interest_amount: formData.get('interest_amount') || null,
            payment_demands_sent: formData.get('payment_demands_sent') === 'on',
            debtor_objections: formData.get('debtor_objections') || null,
            limitation_period_check: formData.get('limitation_period_check') || null,
            incident_description: formData.get('incident_description') || null,
            incident_date: formData.get('incident_date') || null,
            incident_location: formData.get('incident_location') || null,
            witnesses_present: formData.get('witnesses_present') || null,
            police_report: formData.get('police_report') === 'on',
            property_damaged: formData.get('property_damaged') || null,
            property_value: formData.get('property_value') || null,
            repair_receipts: formData.get('repair_receipts') || null,
            expert_valuation: formData.get('expert_valuation') || null,
            injuries_description: formData.get('injuries_description') || null,
            medical_documentation: formData.get('medical_documentation') || null,
            treatment_costs: formData.get('treatment_costs') || null,
            lost_income: formData.get('lost_income') || null,
            disability_period: formData.get('disability_period') || null,
            property_dispute_type: formData.get('property_dispute_type') || null,
            legal_title: formData.get('legal_title') || null,
            land_register_number: formData.get('land_register_number') || null,
            notarial_acts: formData.get('notarial_acts') || null,
            joint_use_details: formData.get('joint_use_details') || null,
            previous_court_cases: formData.get('previous_court_cases') || null,
            warranty_guarantee_details: formData.get('warranty_guarantee_details') || null,
            consumer_claims: formData.get('consumer_claims') || null,
            additional_notes: formData.get('additional_notes') || null
        };
        
        console.log('💾 Zapisywanie danych cywilnych:', data);
        
        const response = await window.api.request(`/civil-details/case/${this.currentCaseId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        if (response.success) {
            await window.crmManager.customAlert('Zapisano szczegóły sprawy cywilnej!', 'success');
            window.crmManager.closeModal();
            // Odśwież zakładkę
            await window.renderCaseTab(this.currentCaseId, 'civil_details');
        } else {
            throw new Error(response.message || 'Błąd zapisu');
        }
        
    } catch (error) {
        console.error('❌ Błąd zapisu:', error);
        await window.crmManager.customAlert('Błąd: ' + error.message, 'error');
    }
};
