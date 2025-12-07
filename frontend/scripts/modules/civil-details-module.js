// ========== MODUŁ SZCZEGÓŁÓW SPRAW CYWILNYCH ==========
console.log('📝 Civil Details Module v1.0 - Loaded!');

class CivilDetailsModule {
    constructor() {
        this.currentCaseId = null;
        this.civilData = null;
    }

    // ========== RENDERUJ ZAKŁADKĘ ==========
    async render(caseId) {
        this.currentCaseId = caseId;
        
        // Pobierz dane
        await this.loadData();
        
        return `
            <div style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; color: #1a2332;">📋 Szczegóły sprawy cywilnej</h2>
                    <button onclick="civilDetailsModule.showEditForm()" style="padding: 10px 20px; background: linear-gradient(135deg, #3B82F6, #1E40AF); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
                        ✏️ ${this.civilData ? 'Edytuj szczegóły' : 'Dodaj szczegóły'}
                    </button>
                </div>
                
                ${this.civilData ? this.renderDetails() : this.renderEmpty()}
            </div>
        `;
    }

    // ========== WYŚWIETL PUSTE ==========
    renderEmpty() {
        return `
            <div style="text-align: center; padding: 60px 20px; background: #f8f9fa; border-radius: 12px; border: 2px dashed #dee2e6;">
                <div style="font-size: 4rem; margin-bottom: 20px;">📋</div>
                <h3 style="color: #6c757d; margin: 0 0 10px 0;">Brak szczegółowych informacji</h3>
                <p style="color: #adb5bd; margin: 0 0 20px 0;">Kliknij przycisk powyżej aby dodać szczegółowe informacje o sprawie cywilnej</p>
            </div>
        `;
    }

    // ========== WYŚWIETL SZCZEGÓŁY ==========
    renderDetails() {
        const d = this.civilData;
        
        return `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                
                <!-- KATEGORIA -->
                ${d.civil_category ? `
                    <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; border-left: 4px solid #3B82F6;">
                        <h4 style="margin: 0 0 10px 0; color: #1565c0;">📂 Kategoria sprawy</h4>
                        <div style="font-weight: 600; color: #1a2332;">${this.getCategoryName(d.civil_category)}</div>
                    </div>
                ` : ''}
                
                <!-- UMOWY CYWILNOPRAWNE -->
                ${d.contract_type ? this.renderContractSection(d) : ''}
                
                <!-- ROSZCZENIA PIENIĘŻNE -->
                ${d.claim_basis ? this.renderMonetarySection(d) : ''}
                
                <!-- ROSZCZENIA ODSZKODOWAWCZE -->
                ${d.incident_description ? this.renderCompensationSection(d) : ''}
                
                <!-- SPORY NIERUCHOMOŚCIOWE -->
                ${d.property_dispute_type ? this.renderPropertySection(d) : ''}
                
                <!-- POZOSTAŁE -->
                ${d.additional_notes ? `
                    <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; border-left: 4px solid #3B82F6;">
                        <h4 style="margin: 0 0 10px 0; color: #f57c00;">📝 Dodatkowe notatki</h4>
                        <div style="white-space: pre-wrap; color: #1a2332;">${this.escapeHtml(d.additional_notes)}</div>
                    </div>
                ` : ''}
                
            </div>
        `;
    }

    // ========== SEKCJA UMOWY ==========
    renderContractSection(d) {
        return `
            <div style="background: #f3e5f5; padding: 20px; border-radius: 12px; border-left: 4px solid #9c27b0;">
                <h3 style="margin: 0 0 15px 0; color: #7b1fa2;">📄 Umowy cywilnoprawne</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    ${d.contract_type ? `<div><strong>Rodzaj umowy:</strong> ${this.getContractTypeName(d.contract_type)}</div>` : ''}
                    ${d.contract_date ? `<div><strong>Data zawarcia:</strong> ${new Date(d.contract_date).toLocaleDateString('pl-PL')}</div>` : ''}
                    ${d.contract_parties ? `<div><strong>Strony umowy:</strong> ${this.escapeHtml(d.contract_parties)}</div>` : ''}
                    ${d.contract_executed !== null ? `<div><strong>Umowa wykonana:</strong> ${d.contract_executed ? '✅ Tak' : '❌ Nie'}</div>` : ''}
                    ${d.penalties_provided ? `<div><strong>Kary umowne:</strong> ${d.penalty_amount ? d.penalty_amount + ' PLN' : 'Przewidziane'}</div>` : ''}
                </div>
                ${d.contract_terms ? `<div style="margin-top: 15px;"><strong>Warunki umowy:</strong><br>${this.escapeHtml(d.contract_terms)}</div>` : ''}
                ${d.unmet_obligations ? `<div style="margin-top: 15px; padding: 10px; background: #ffe0e0; border-radius: 6px;"><strong>⚠️ Niezrealizowane zobowiązania:</strong><br>${this.escapeHtml(d.unmet_obligations)}</div>` : ''}
            </div>
        `;
    }

    // ========== SEKCJA ROSZCZENIA PIENIĘŻNE ==========
    renderMonetarySection(d) {
        return `
            <div style="background: #F8FAFC; padding: 20px; border-radius: 12px; border-left: 4px solid #3B82F6;">
                <h3 style="margin: 0 0 15px 0; color: #2e7d32;">💰 Roszczenia pieniężne</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    ${d.claim_basis ? `<div><strong>Podstawa roszczenia:</strong> ${this.getClaimBasisName(d.claim_basis)}</div>` : ''}
                    ${d.principal_amount ? `<div><strong>Kwota główna:</strong> <span style="font-size: 1.2rem; font-weight: 700; color: #2e7d32;">${d.principal_amount} PLN</span></div>` : ''}
                    ${d.interest_amount ? `<div><strong>Odsetki:</strong> ${d.interest_amount} PLN</div>` : ''}
                    ${d.payment_demands_sent !== null ? `<div><strong>Wezwania wysłane:</strong> ${d.payment_demands_sent ? '✅ Tak' : '❌ Nie'}</div>` : ''}
                </div>
                ${d.debtor_objections ? `<div style="margin-top: 15px; padding: 10px; background: #F8FAFC; border-radius: 6px;"><strong>⚠️ Zarzuty dłużnika:</strong><br>${this.escapeHtml(d.debtor_objections)}</div>` : ''}
                ${d.limitation_period_check ? `<div style="margin-top: 15px;"><strong>Sprawdzenie przedawnienia:</strong><br>${this.escapeHtml(d.limitation_period_check)}</div>` : ''}
            </div>
        `;
    }

    // ========== SEKCJA ODSZKODOWANIA ==========
    renderCompensationSection(d) {
        return `
            <div style="background: #F8FAFC; padding: 20px; border-radius: 12px; border-left: 4px solid #3B82F6;">
                <h3 style="margin: 0 0 15px 0; color: #f57c00;">⚖️ Roszczenia odszkodowawcze</h3>
                
                <div style="margin-bottom: 15px;">
                    <strong>Opis zdarzenia:</strong>
                    <div style="margin-top: 5px; padding: 10px; background: white; border-radius: 6px;">${this.escapeHtml(d.incident_description)}</div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 15px;">
                    ${d.incident_date ? `<div><strong>Data zdarzenia:</strong> ${new Date(d.incident_date).toLocaleDateString('pl-PL')}</div>` : ''}
                    ${d.incident_location ? `<div><strong>Miejsce:</strong> ${this.escapeHtml(d.incident_location)}</div>` : ''}
                    ${d.police_report !== null ? `<div><strong>Protokół policji:</strong> ${d.police_report ? '✅ Tak' : '❌ Nie'}</div>` : ''}
                </div>
                
                ${d.property_damaged || d.property_value ? `
                    <div style="padding: 15px; background: #ffe0e0; border-radius: 8px; margin-bottom: 15px;">
                        <h4 style="margin: 0 0 10px 0; color: #d32f2f;">💔 Szkoda majątkowa</h4>
                        ${d.property_damaged ? `<div><strong>Zniszczone mienie:</strong> ${this.escapeHtml(d.property_damaged)}</div>` : ''}
                        ${d.property_value ? `<div><strong>Wartość:</strong> <span style="font-weight: 700;">${d.property_value} PLN</span></div>` : ''}
                    </div>
                ` : ''}
                
                ${d.injuries_description || d.treatment_costs ? `
                    <div style="padding: 15px; background: #ffebee; border-radius: 8px;">
                        <h4 style="margin: 0 0 10px 0; color: #c62828;">🩹 Szkoda osobowa</h4>
                        ${d.injuries_description ? `<div><strong>Obrażenia:</strong> ${this.escapeHtml(d.injuries_description)}</div>` : ''}
                        ${d.treatment_costs ? `<div><strong>Koszty leczenia:</strong> ${d.treatment_costs} PLN</div>` : ''}
                        ${d.lost_income ? `<div><strong>Utracone dochody:</strong> ${d.lost_income} PLN</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    // ========== SEKCJA NIERUCHOMOŚCI ==========
    renderPropertySection(d) {
        return `
            <div style="background: #e1f5fe; padding: 20px; border-radius: 12px; border-left: 4px solid #0288d1;">
                <h3 style="margin: 0 0 15px 0; color: #01579b;">🏠 Spory nieruchomościowe</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                    ${d.property_dispute_type ? `<div><strong>Typ sporu:</strong> ${this.getPropertyDisputeName(d.property_dispute_type)}</div>` : ''}
                    ${d.legal_title ? `<div><strong>Tytuł prawny:</strong> ${this.escapeHtml(d.legal_title)}</div>` : ''}
                    ${d.land_register_number ? `<div><strong>Księga wieczysta:</strong> ${this.escapeHtml(d.land_register_number)}</div>` : ''}
                </div>
                ${d.notarial_acts ? `<div style="margin-top: 15px;"><strong>Akty notarialne:</strong><br>${this.escapeHtml(d.notarial_acts)}</div>` : ''}
                ${d.previous_court_cases ? `<div style="margin-top: 15px;"><strong>Poprzednie sprawy sądowe:</strong><br>${this.escapeHtml(d.previous_court_cases)}</div>` : ''}
            </div>
        `;
    }

    // ========== HELPER - NAZWY KATEGORII ==========
    getCategoryName(code) {
        const names = {
            'contract': '📄 Umowy cywilnoprawne',
            'monetary': '💰 Roszczenia pieniężne',
            'compensation': '⚖️ Roszczenia odszkodowawcze',
            'property': '🏠 Spory nieruchomościowe',
            'other': '📋 Inne'
        };
        return names[code] || code;
    }

    getContractTypeName(code) {
        const names = {
            'sale': 'Sprzedaży',
            'rent': 'Najmu',
            'commission': 'Zlecenia',
            'work': 'Dzieła',
            'loan': 'Pożyczki',
            'other': 'Inna'
        };
        return names[code] || code;
    }

    getClaimBasisName(code) {
        const names = {
            'contract': 'Umowa',
            'invoice': 'Faktura',
            'promissory_note': 'Weksel',
            'credit': 'Umowa kredytowa'
        };
        return names[code] || code;
    }

    getPropertyDisputeName(code) {
        const names = {
            'co_ownership': 'Zniesienie współwłasności',
            'eviction': 'Eksmisja',
            'easement': 'Służebność',
            'possession': 'Naruszenie posiadania'
        };
        return names[code] || code;
    }

    // ========== POBIERZ DANE ==========
    async loadData() {
        try {
            const response = await window.api.request(`/civil-details/case/${this.currentCaseId}`);
            this.civilData = response.details;
        } catch (error) {
            console.error('❌ Błąd pobierania danych cywilnych:', error);
        }
    }

    // ========== ESCAPE HTML ==========
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ========== FORMULARZ EDYCJI - część 1/2 w następnej wiadomości ==========
}

// Globalna instancja
window.civilDetailsModule = new CivilDetailsModule();
