// ==========================================
// SALES INVOICES MODULE
// System wystawiania faktur VAT dla klientów
// ==========================================

class SalesInvoicesModule {
    constructor() {
        this.currentInvoice = null;
    }
    
    // =====================================
    // LISTA FAKTUR SPRZEDAŻOWYCH
    // =====================================
    async showInvoicesList() {
        try {
            const invoices = await window.api.request('/sales-invoices?limit=100');
            
            // Znajdź kontener - użyj adminView lub financeContent jako fallback
            let container = document.getElementById('financeActivityList') 
                || document.getElementById('mainContent')
                || document.getElementById('financeContent')
                || document.getElementById('adminView');
            
            if (!container) {
                console.error('❌ Nie znaleziono kontenera do wyświetlenia faktur!');
                alert('Nie można wyświetlić listy faktur - brak kontenera w DOM.\n\nFaktura została zapisana poprawnie!');
                return;
            }
            
            console.log('✅ Kontener znaleziony:', container.id);
            container.innerHTML = `
                <div style="max-width: 1400px; margin: 0 auto; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                        <div>
                            <h2 style="margin: 0; color: #1a2332;">📄 Faktury sprzedażowe</h2>
                            <p style="margin: 5px 0 0 0; color: #666;">Faktury VAT wystawione klientom</p>
                        </div>
                        <button onclick="salesInvoices.showIssueInvoiceModal()" style="
                            padding: 12px 24px;
                            background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%);
                            color: white;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                            box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
                        ">
                            ➕ Wystaw fakturę
                        </button>
                    </div>
                    
                    ${invoices.invoices && invoices.invoices.length > 0 ? `
                        <div style="background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <thead style="background: #f8f9fa;">
                                    <tr>
                                        <th style="padding: 15px; text-align: left; font-weight: 600;">Numer</th>
                                        <th style="padding: 15px; text-align: left;">Klient</th>
                                        <th style="padding: 15px; text-align: left;">Sprawa</th>
                                        <th style="padding: 15px; text-align: right;">Kwota brutto</th>
                                        <th style="padding: 15px; text-align: left;">Data wystawienia</th>
                                        <th style="padding: 15px; text-align: center;">Status</th>
                                        <th style="padding: 15px; text-align: center;">KSeF</th>
                                        <th style="padding: 15px; text-align: center;">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${invoices.invoices.map(inv => `
                                        <tr style="border-bottom: 1px solid #f0f0f0;">
                                            <td style="padding: 15px; font-weight: 600; color: #3B82F6;">${this.escapeHtml(inv.invoice_number)}</td>
                                            <td style="padding: 15px;">${this.escapeHtml(inv.client_name || inv.buyer_name)}</td>
                                            <td style="padding: 15px;">${inv.case_number || '-'}</td>
                                            <td style="padding: 15px; text-align: right; font-weight: 600;">${this.formatMoney(inv.gross_amount)}</td>
                                            <td style="padding: 15px;">${new Date(inv.issue_date).toLocaleDateString('pl-PL')}</td>
                                            <td style="padding: 15px; text-align: center;">
                                                <span style="
                                                    padding: 6px 12px;
                                                    border-radius: 20px;
                                                    font-size: 0.85rem;
                                                    font-weight: 600;
                                                    background: ${inv.payment_status === 'paid' ? '#d4edda' : '#F8FAFC'};
                                                    color: ${inv.payment_status === 'paid' ? '#155724' : '#666'};
                                                ">
                                                    ${inv.payment_status === 'paid' ? '✓ Opłacona' : '⏳ Nieopłacona'}
                                                </span>
                                            </td>
                                            <td style="padding: 15px; text-align: center;">
                                                ${inv.ksef_reference_number ? `
                                                    <span style="
                                                        padding: 6px 12px;
                                                        border-radius: 20px;
                                                        font-size: 0.85rem;
                                                        font-weight: 600;
                                                        background: #d4edda;
                                                        color: #155724;
                                                    ">
                                                        ✓ Wysłana
                                                    </span>
                                                ` : `
                                                    <button onclick="salesInvoices.sendToKsef(${inv.id})" style="
                                                        padding: 6px 12px;
                                                        background: #3B82F6;
                                                        color: white;
                                                        border: none;
                                                        border-radius: 6px;
                                                        cursor: pointer;
                                                        font-size: 0.85rem;
                                                    ">
                                                        📤 Wyślij
                                                    </button>
                                                `}
                                            </td>
                                            <td style="padding: 15px; text-align: center;">
                                                <button onclick="salesInvoices.viewInvoice(${inv.id})" style="
                                                    padding: 6px 12px;
                                                    background: #3B82F6;
                                                    color: white;
                                                    border: none;
                                                    border-radius: 6px;
                                                    cursor: pointer;
                                                    margin-right: 5px;
                                                    font-size: 0.85rem;
                                                ">
                                                    👁️ Zobacz
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 12px;">
                            <p style="color: #999; font-size: 1.1rem;">Brak wystawionych faktur</p>
                            <p style="color: #666;">Kliknij "Wystaw fakturę" aby rozpocząć</p>
                        </div>
                    `}
                </div>
            `;
        } catch (error) {
            console.error('❌ Błąd ładowania faktur:', error);
            alert('Błąd: ' + error.message);
        }
    }
    
    // =====================================
    // MODAL WYSTAWIANIA FAKTURY
    // =====================================
    async showIssueInvoiceModal(clientId = null, caseId = null) {
        // Pobierz listę klientów
        const clients = await window.api.request('/clients');
        
        const modal = document.createElement('div');
        modal.id = 'issueInvoiceModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; width: 95%; max-height: 95vh; overflow-y: auto;">
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%); padding: 25px; border-radius: 12px 12px 0 0; color: white; position: sticky; top: 0; z-index: 10;">
                    <h2 style="margin: 0;">📄 Wystaw fakturę VAT</h2>
                    <p style="margin: 5px 0 0 0; opacity: 0.95; font-size: 0.95rem;">Dla klienta</p>
                </div>
                
                <form id="issueInvoiceForm" onsubmit="salesInvoices.saveInvoice(event); return false;" style="padding: 30px;">
                    <!-- Klient -->
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Klient *</label>
                        <select name="client_id" required onchange="salesInvoices.onClientChange(this.value)" style="
                            width: 100%; 
                            padding: 12px; 
                            border: 2px solid #e0e0e0; 
                            border-radius: 8px;
                            font-size: 1rem;
                        ">
                            <option value="">Wybierz klienta...</option>
                            ${clients.clients?.map(c => `
                                <option value="${c.id}" ${clientId == c.id ? 'selected' : ''}>
                                    ${this.escapeHtml(c.first_name)} ${this.escapeHtml(c.last_name)} (${this.escapeHtml(c.email)})
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <!-- Dane automatycznie uzupełnione -->
                    <div id="clientDataSection" style="display: none; background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                        <h4 style="margin: 0 0 15px 0; color: #3B82F6;">Dane nabywcy (z bazy)</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                            <input type="hidden" name="buyer_name" id="buyer_name">
                            <input type="hidden" name="buyer_address" id="buyer_address">
                            <input type="hidden" name="buyer_email" id="buyer_email">
                            <div id="buyerDataDisplay"></div>
                        </div>
                    </div>
                    
                    <!-- Sprawa klienta -->
                    <div id="casesSection" style="display: none; margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Sprawa (opcjonalnie)</label>
                        <select name="case_id" onchange="salesInvoices.onCaseChange(this.value)" style="
                            width: 100%; 
                            padding: 12px; 
                            border: 2px solid #e0e0e0; 
                            border-radius: 8px;
                            font-size: 1rem;
                        ">
                            <option value="">Bez powiązania ze sprawą</option>
                        </select>
                        <small style="color: #666; display: block; margin-top: 5px;">
                            Wybierz sprawę aby automatycznie wypełnić opis usługi
                        </small>
                    </div>
                    
                    <!-- Pozycje faktury -->
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Usługa / Towar *</label>
                        <textarea name="item_description" id="item_description" rows="2" required placeholder="Np. Reprezentacja prawna w sprawie CYW/JK/001" style="
                            width: 100%; 
                            padding: 12px; 
                            border: 2px solid #e0e0e0; 
                            border-radius: 8px;
                            font-family: inherit;
                        "></textarea>
                    </div>
                    
                    <!-- Kwoty -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Kwota netto *</label>
                            <input type="number" name="net_amount" step="0.01" required placeholder="5000.00" onchange="salesInvoices.calculateVAT()" style="
                                width: 100%; 
                                padding: 12px; 
                                border: 2px solid #e0e0e0; 
                                border-radius: 8px;
                            ">
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Stawka VAT *</label>
                            <select name="vat_rate" required onchange="salesInvoices.calculateVAT()" style="
                                width: 100%; 
                                padding: 12px; 
                                border: 2px solid #e0e0e0; 
                                border-radius: 8px;
                            ">
                                <option value="23">23%</option>
                                <option value="8">8%</option>
                                <option value="5">5%</option>
                                <option value="0">0% / zw.</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Podsumowanie -->
                    <div id="invoiceSummary" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 8px; margin-bottom: 25px; display: none;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="font-weight: 600;">Kwota netto:</span>
                            <span id="summaryNet">0,00 PLN</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <span style="font-weight: 600;">VAT (<span id="summaryVatRate">23</span>%):</span>
                            <span id="summaryVat">0,00 PLN</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #3B82F6;">
                            <span style="font-weight: 700; font-size: 1.2rem; color: #3B82F6;">DO ZAPŁATY:</span>
                            <span id="summaryGross" style="font-weight: 700; font-size: 1.2rem; color: #3B82F6;">0,00 PLN</span>
                        </div>
                    </div>
                    
                    <!-- Daty -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px;">
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Data wystawienia *</label>
                            <input type="date" name="issue_date" required value="${new Date().toISOString().split('T')[0]}" style="
                                width: 100%; 
                                padding: 12px; 
                                border: 2px solid #e0e0e0; 
                                border-radius: 8px;
                            ">
                        </div>
                        
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Termin płatności</label>
                            <input type="date" name="due_date" style="
                                width: 100%; 
                                padding: 12px; 
                                border: 2px solid #e0e0e0; 
                                border-radius: 8px;
                            ">
                        </div>
                    </div>
                    
                    <!-- Opcje -->
                    <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" name="send_to_ksef" style="margin-right: 10px; width: 18px; height: 18px;">
                            <span style="font-weight: 600;">🧾 Wyślij automatycznie do KSeF</span>
                        </label>
                        <small style="color: #666; display: block; margin-top: 5px; margin-left: 28px;">
                            Faktura zostanie wysłana do Krajowego Systemu e-Faktur
                        </small>
                    </div>
                    
                    <!-- Płatność ratalna -->
                    <div style="background: #e7f5ff; padding: 15px; border-radius: 8px; margin-bottom: 25px; border: 2px solid #3B82F6;">
                        <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 15px;">
                            <input type="checkbox" id="installmentPayment" name="installment_payment" onchange="salesInvoices.toggleInstallmentOptions()" style="margin-right: 10px; width: 18px; height: 18px;">
                            <span style="font-weight: 600;">💳 Płatność ratalna</span>
                        </label>
                        
                        <div id="installmentOptions" style="display: none; margin-left: 28px;">
                            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">Liczba rat</label>
                                    <input type="number" name="installment_count" min="2" max="24" value="12" style="
                                        width: 100%; 
                                        padding: 8px; 
                                        border: 2px solid #e0e0e0; 
                                        border-radius: 6px;
                                    ">
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">Częstotliwość</label>
                                    <select name="installment_frequency" style="
                                        width: 100%; 
                                        padding: 8px; 
                                        border: 2px solid #e0e0e0; 
                                        border-radius: 6px;
                                    ">
                                        <option value="monthly">Miesięcznie</option>
                                        <option value="biweekly">Co 2 tygodnie</option>
                                        <option value="weekly">Tygodniowo</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #1a2332; font-size: 0.9rem;">Data pierwszej raty</label>
                                    <input type="date" name="installment_start_date" value="${new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]}" style="
                                        width: 100%; 
                                        padding: 8px; 
                                        border: 2px solid #e0e0e0; 
                                        border-radius: 6px;
                                    ">
                                </div>
                            </div>
                            <div id="installmentPreview" style="background: white; padding: 10px; border-radius: 6px; font-size: 0.9rem;">
                                <strong>Podgląd:</strong> <span id="installmentPreviewText">12 rat × 0,00 PLN miesięcznie</span>
                            </div>
                            <small style="color: #666; display: block; margin-top: 10px;">
                                System automatycznie wygeneruje harmonogram rat i będzie wysyłał przypomnienia
                            </small>
                        </div>
                    </div>
                    
                    <!-- Uwagi -->
                    <div style="margin-bottom: 25px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1a2332;">Uwagi</label>
                        <textarea name="notes" rows="2" placeholder="Dodatkowe informacje..." style="
                            width: 100%; 
                            padding: 12px; 
                            border: 2px solid #e0e0e0; 
                            border-radius: 8px;
                            font-family: inherit;
                        "></textarea>
                    </div>
                    
                    <!-- Przyciski -->
                    <div style="display: flex; gap: 15px; justify-content: flex-end;">
                        <button type="button" onclick="salesInvoices.closeModal('issueInvoiceModal')" style="
                            padding: 12px 24px;
                            background: #e0e0e0;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            ❌ Anuluj
                        </button>
                        <button type="submit" style="
                            padding: 12px 32px;
                            background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                            box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
                        ">
                            ✓ Wystaw fakturę
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Jeśli klient wybrany - załaduj dane
        if (clientId) {
            this.onClientChange(clientId);
        }
    }
    
    // =====================================
    // ZMIANA KLIENTA
    // =====================================
    async onClientChange(clientId) {
        if (!clientId) {
            document.getElementById('clientDataSection').style.display = 'none';
            document.getElementById('casesSection').style.display = 'none';
            return;
        }
        
        try {
            const response = await window.api.request(`/clients/${clientId}`);
            const client = response.client || response; // Backend może zwrócić { client: {...} } lub samo {...}
            
            console.log('📥 Dane klienta:', client);
            
            // Wypełnij ukryte pola
            document.getElementById('buyer_name').value = `${client.first_name || ''} ${client.last_name || ''}`.trim();
            document.getElementById('buyer_address').value = client.address || client.address_street || '';
            document.getElementById('buyer_email').value = client.email || '';
            
            // Pokaż dane
            document.getElementById('buyerDataDisplay').innerHTML = `
                <div style="color: #1a2332; font-size: 0.95rem; margin-bottom: 8px;"><strong style="color: #3B82F6;">Nazwa:</strong> ${this.escapeHtml(client.first_name)} ${this.escapeHtml(client.last_name)}</div>
                <div style="color: #1a2332; font-size: 0.95rem; margin-bottom: 8px;"><strong style="color: #3B82F6;">Adres:</strong> ${this.escapeHtml(client.address || '-')}</div>
                <div style="color: #1a2332; font-size: 0.95rem; margin-bottom: 8px;"><strong style="color: #3B82F6;">Email:</strong> ${this.escapeHtml(client.email || '-')}</div>
            `;
            
            document.getElementById('clientDataSection').style.display = 'block';
            
            // Załaduj sprawy klienta
            await this.loadClientCases(clientId);
            
        } catch (error) {
            console.error('❌ Błąd pobierania danych klienta:', error);
        }
    }
    
    // =====================================
    // ŁADUJ SPRAWY KLIENTA
    // =====================================
    async loadClientCases(clientId) {
        try {
            const response = await window.api.request(`/cases?client_id=${clientId}`);
            const cases = response.cases || [];
            
            const caseSelect = document.querySelector('[name="case_id"]');
            
            // Wyczyść i dodaj opcje
            caseSelect.innerHTML = '<option value="">Bez powiązania ze sprawą</option>';
            
            if (cases.length > 0) {
                cases.forEach(c => {
                    const option = document.createElement('option');
                    option.value = c.id;
                    option.textContent = `${c.case_number} - ${c.title}`;
                    option.dataset.caseNumber = c.case_number;
                    option.dataset.caseTitle = c.title;
                    caseSelect.appendChild(option);
                });
                
                document.getElementById('casesSection').style.display = 'block';
            } else {
                document.getElementById('casesSection').style.display = 'none';
            }
        } catch (error) {
            console.error('❌ Błąd ładowania spraw:', error);
        }
    }
    
    // =====================================
    // ZMIANA SPRAWY
    // =====================================
    async onCaseChange(caseId) {
        if (!caseId) {
            return;
        }
        
        const caseSelect = document.querySelector('[name="case_id"]');
        const selectedOption = caseSelect.options[caseSelect.selectedIndex];
        
        if (selectedOption) {
            const caseNumber = selectedOption.dataset.caseNumber;
            const caseTitle = selectedOption.dataset.caseTitle;
            
            // Auto-wypełnij opis usługi
            const descriptionField = document.getElementById('item_description');
            descriptionField.value = `Reprezentacja prawna w sprawie ${caseNumber} - ${caseTitle}`;
            
            // Dodaj małą animację
            descriptionField.style.background = '#d4edda';
            setTimeout(() => {
                descriptionField.style.background = 'white';
            }, 500);
            
            // Pobierz płatności sprawy i auto-wypełnij kwotę
            try {
                const response = await window.api.request(`/payments/case/${caseId}`);
                const payments = response.payments || [];
                
                if (payments.length > 0) {
                    // Suma nieopłaconych lub wszystkich płatności
                    const unpaid = payments.filter(p => p.payment_status !== 'paid');
                    const paymentsToUse = unpaid.length > 0 ? unpaid : payments;
                    
                    const totalAmount = paymentsToUse.reduce((sum, p) => sum + (p.amount || 0), 0);
                    
                    if (totalAmount > 0) {
                        const netField = document.querySelector('[name="net_amount"]');
                        netField.value = totalAmount.toFixed(2);
                        
                        // Przelicz VAT
                        this.calculateVAT();
                        
                        // Animacja
                        netField.style.background = '#d4edda';
                        setTimeout(() => {
                            netField.style.background = 'white';
                        }, 500);
                        
                        console.log(`✅ Auto-wypełniono kwotę: ${totalAmount} PLN ze sprawy ${caseNumber}`);
                    }
                }
            } catch (error) {
                console.error('❌ Błąd pobierania płatności sprawy:', error);
            }
        }
    }
    
    // =====================================
    // KALKULACJA VAT
    // =====================================
    calculateVAT() {
        const netInput = document.querySelector('[name="net_amount"]');
        const vatRateSelect = document.querySelector('[name="vat_rate"]');
        
        if (!netInput || !vatRateSelect) return;
        
        const net = parseFloat(netInput.value) || 0;
        const vatRate = parseInt(vatRateSelect.value) || 0;
        
        if (net > 0) {
            const vat = (net * vatRate / 100).toFixed(2);
            const gross = (net + parseFloat(vat)).toFixed(2);
            
            document.getElementById('summaryNet').textContent = this.formatMoney(net);
            document.getElementById('summaryVatRate').textContent = vatRate;
            document.getElementById('summaryVat').textContent = this.formatMoney(vat);
            document.getElementById('summaryGross').textContent = this.formatMoney(gross);
            document.getElementById('invoiceSummary').style.display = 'block';
            
            // Aktualizuj podgląd rat jeśli włączone
            this.updateInstallmentPreview();
        } else {
            document.getElementById('invoiceSummary').style.display = 'none';
        }
    }
    
    // =====================================
    // RATY - TOGGLE OPCJI
    // =====================================
    toggleInstallmentOptions() {
        const checkbox = document.getElementById('installmentPayment');
        const options = document.getElementById('installmentOptions');
        
        if (checkbox.checked) {
            options.style.display = 'block';
            this.updateInstallmentPreview();
        } else {
            options.style.display = 'none';
        }
    }
    
    // =====================================
    // RATY - PODGLĄD
    // =====================================
    updateInstallmentPreview() {
        const grossText = document.getElementById('summaryGross')?.textContent;
        const count = parseInt(document.querySelector('[name="installment_count"]')?.value) || 12;
        const frequency = document.querySelector('[name="installment_frequency"]')?.value || 'monthly';
        
        if (!grossText) return;
        
        // Wyciągnij kwotę z tekstu "X,XXX.XX PLN"
        const grossAmount = parseFloat(grossText.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        
        if (grossAmount > 0) {
            const installmentAmount = (grossAmount / count).toFixed(2);
            const frequencyText = {
                'monthly': 'miesięcznie',
                'biweekly': 'co 2 tygodnie',
                'weekly': 'tygodniowo'
            }[frequency] || 'miesięcznie';
            
            const previewText = `${count} rat × ${this.formatMoney(installmentAmount)} ${frequencyText}`;
            document.getElementById('installmentPreviewText').textContent = previewText;
        }
    }
    
    // =====================================
    // ZAPISZ FAKTURĘ
    // =====================================
    async saveInvoice(event) {
        event.preventDefault();
        console.log('🔥🔥🔥 SAVE INVOICE CALLED! 🔥🔥🔥');
        const form = event.target;
        const formData = new FormData(form);
        
        const installmentPayment = formData.get('installment_payment') === 'on';
        
        console.log('📋 FormData zebrane:', {
            client_id: formData.get('client_id'),
            buyer_name: formData.get('buyer_name'),
            net_amount: formData.get('net_amount'),
            vat_rate: formData.get('vat_rate'),
            installment_payment: installmentPayment
        });
        
        const data = {
            client_id: parseInt(formData.get('client_id')),
            case_id: formData.get('case_id') ? parseInt(formData.get('case_id')) : null,
            buyer_name: formData.get('buyer_name'),
            buyer_address: formData.get('buyer_address'),
            buyer_email: formData.get('buyer_email'),
            net_amount: parseFloat(formData.get('net_amount')),
            vat_rate: parseInt(formData.get('vat_rate')),
            items: [{
                description: formData.get('item_description'),
                quantity: 1,
                unit_price: parseFloat(formData.get('net_amount'))
            }],
            issue_date: formData.get('issue_date'),
            sale_date: formData.get('issue_date'),
            due_date: formData.get('due_date') || null,
            notes: formData.get('notes') || null,
            send_to_ksef: formData.get('send_to_ksef') === 'on',
            // Płatność ratalna
            installment_payment: installmentPayment,
            installment_count: installmentPayment ? parseInt(formData.get('installment_count')) : null,
            first_installment_date: installmentPayment ? formData.get('installment_start_date') : null
        };
        
        console.log('📤 Wysyłam dane do backendu:', data);
        
        try {
            console.log('🌐 Wywołuję API: POST /sales-invoices');
            const result = await window.api.request('/sales-invoices', {
                method: 'POST',
                body: data
            });
            console.log('📥 Odpowiedź z backendu:', result);
            console.log('📊 Szczegóły odpowiedzi:');
            console.log('  - invoice_number:', result.invoice_number);
            console.log('  - payment_code:', result.payment_code);
            console.log('  - gross_amount:', result.gross_amount);
            console.log('  - installments:', result.installments);
            console.log('  - success:', result.success);
            
            if (result.success) {
                console.log('✅ Faktura zapisana pomyślnie!', result);
                let message = `✅ Faktura ${result.invoice_number} wystawiona!\n\n`;
                message += `💰 Kwota: ${this.formatMoney(result.gross_amount)}\n`;
                message += `💳 Płatność: ${result.payment_code}\n`;
                
                if (result.installments && result.installments > 0) {
                    const perInstallment = (parseFloat(result.gross_amount) / result.installments).toFixed(2);
                    message += `\n📅 Płatność ratalna:\n`;
                    message += `${result.installments} rat × ${this.formatMoney(perInstallment)}\n`;
                    message += `Harmonogram rat wygenerowany automatycznie!`;
                }
                
                alert(message);
                this.closeModal('issueInvoiceModal');
                await this.showInvoicesList();
            }
        } catch (error) {
            console.error('❌ Błąd wystawiania faktury:', error);
            alert('Błąd: ' + error.message);
        }
    }
    
    // =====================================
    // WYŚLIJ DO KSEF
    // =====================================
    async sendToKsef(invoiceId) {
        if (!confirm('Wysłać fakturę do KSeF?')) return;
        
        try {
            const result = await window.api.request(`/sales-invoices/${invoiceId}/send-ksef`, 'POST');
            
            if (result.success) {
                alert(`✅ Faktura wysłana do KSeF!\n\nNumer referencyjny:\n${result.ksef_reference_number}`);
                await this.showInvoicesList();
            }
        } catch (error) {
            console.error('❌ Błąd wysyłania do KSeF:', error);
            alert('Błąd: ' + error.message);
        }
    }
    
    // =====================================
    // ZOBACZ FAKTURĘ
    // =====================================
    async viewInvoice(invoiceId) {
        try {
            const result = await window.api.request(`/sales-invoices/${invoiceId}`);
            const inv = result.invoice;
            
            const modal = document.createElement('div');
            modal.id = 'viewInvoiceModal';
            modal.className = 'modal';
            modal.style.display = 'flex';
            
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 700px; width: 95%;">
                    <div style="background: linear-gradient(135deg, #3B82F6 0%, #3B82F6 100%); padding: 25px; border-radius: 12px 12px 0 0; color: white;">
                        <h2 style="margin: 0;">📄 ${this.escapeHtml(inv.invoice_number)}</h2>
                        <p style="margin: 5px 0 0 0; opacity: 0.95;">Faktura VAT</p>
                    </div>
                    
                    <div style="padding: 30px;">
                        <!-- Klient -->
                        <div style="margin-bottom: 25px; background: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <h4 style="margin: 0 0 15px 0; color: #3B82F6;">Nabywca</h4>
                            <p style="margin: 5px 0;"><strong>Nazwa:</strong> ${this.escapeHtml(inv.buyer_name)}</p>
                            <p style="margin: 5px 0;"><strong>NIP:</strong> ${inv.buyer_nip || '-'}</p>
                            <p style="margin: 5px 0;"><strong>Adres:</strong> ${this.escapeHtml(inv.buyer_address || '-')}</p>
                        </div>
                        
                        <!-- Kwoty -->
                        <div style="margin-bottom: 25px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Kwota netto:</span>
                                <span style="font-weight: 600;">${this.formatMoney(inv.net_amount)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>VAT ${inv.vat_rate}%:</span>
                                <span style="font-weight: 600;">${this.formatMoney(inv.vat_amount)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding-top: 10px; border-top: 2px solid #3B82F6;">
                                <span style="font-weight: 700; font-size: 1.2rem;">DO ZAPŁATY:</span>
                                <span style="font-weight: 700; font-size: 1.2rem; color: #3B82F6;">${this.formatMoney(inv.gross_amount)}</span>
                            </div>
                        </div>
                        
                        <!-- Status -->
                        <div style="text-align: center; margin-bottom: 20px;">
                            <span style="
                                padding: 10px 20px;
                                border-radius: 25px;
                                font-weight: 600;
                                background: ${inv.payment_status === 'paid' ? '#d4edda' : '#F8FAFC'};
                                color: ${inv.payment_status === 'paid' ? '#155724' : '#666'};
                            ">
                                ${inv.payment_status === 'paid' ? '✓ Opłacona' : '⏳ Nieopłacona'}
                            </span>
                        </div>
                        
                        <!-- Przyciski -->
                        <div style="display: flex; gap: 10px; justify-content: center;">
                            <button onclick="salesInvoices.closeModal('viewInvoiceModal')" style="
                                padding: 12px 24px;
                                background: #e0e0e0;
                                border: none;
                                border-radius: 8px;
                                cursor: pointer;
                            ">
                                ✕ Zamknij
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
        } catch (error) {
            console.error('❌ Błąd pobierania faktury:', error);
            alert('Błąd: ' + error.message);
        }
    }
    
    // =====================================
    // POMOCNICZE
    // =====================================
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.remove();
    }
    
    formatMoney(amount) {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount || 0);
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Utwórz globalną instancję
const salesInvoices = new SalesInvoicesModule();
window.salesInvoices = salesInvoices;

// Event listenery dla rat (delegacja na dokument)
document.addEventListener('change', (e) => {
    if (e.target.name === 'installment_count' || e.target.name === 'installment_frequency') {
        salesInvoices.updateInstallmentPreview();
    }
});

console.log('%c🔥🔥🔥 Sales Invoices Module v1.9 - ALL FIXED! 🔥🔥🔥', 'background: green; color: white; font-size: 16px; font-weight: bold; padding: 10px;');
console.log('✅ Naprawiono: wywołanie API + dane klienta + kolumna invoice_id!');
