/**
 * Client Balance Module v1.0
 * Moduł salda i płatności klienta
 * 
 * Features:
 * - Wyświetlanie salda klienta
 * - Płatności pogrupowane po sprawach
 * - Zasilenie salda: BLIK, PayPal, karta, przelew
 * - Historia transakcji
 */

class ClientBalanceModule {
    constructor() {
        console.log('💰 Client Balance Module zainicjalizowany');
        this.currentClientId = null;
        this.balanceData = null;
    }

    // =====================================
    // RENDEROWANIE SEKCJI SALDA
    // =====================================
    async renderBalanceSection(clientId) {
        this.currentClientId = clientId;
        console.log('🔍 [CLIENT-BALANCE] Ładowanie salda dla klienta:', clientId);
        await this.loadBalanceData(clientId);
        
        if (!this.balanceData) {
            console.error('❌ [CLIENT-BALANCE] Brak danych salda');
            return `<div style="padding: 20px; text-align: center; color: #999;">Błąd ładowania salda klienta</div>`;
        }
        
        console.log('✅ [CLIENT-BALANCE] Saldo załadowane:', this.balanceData.balance);
        
        return `
            <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">💰 Saldo klienta</div>
                        <div style="font-size: 2.5rem; font-weight: 700;">${this.formatMoney(this.balanceData.balance.balance)}</div>
                        <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 5px;">
                            ${this.balanceData.payments?.length || 0} płatności • 
                            ${this.balanceData.paymentsByCases?.length || 0} spraw
                        </div>
                    </div>
                    <button onclick="clientBalanceModule.showTopUpModal()" style="
                        background: white;
                        color: #3B82F6;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        font-weight: 600;
                        cursor: pointer;
                        font-size: 1rem;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                        transition: all 0.3s;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.3)'"
                       onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.2)'">
                        ➕ Zasil saldo
                    </button>
                </div>
                ${this.balanceData.balance.last_transaction_at ? `
                    <div style="font-size: 0.85rem; opacity: 0.8; margin-top: 10px;">
                        Ostatnia transakcja: ${new Date(this.balanceData.balance.last_transaction_at).toLocaleString('pl-PL')}
                    </div>
                ` : ''}
            </div>

            <!-- Płatności po sprawach -->
            <div style="background: white; border-radius: 12px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 20px 0; color: #2c3e50;">📋 Płatności po sprawach</h3>
                ${this.renderPaymentsByCases()}
            </div>

            <!-- Historia transakcji -->
            <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                <h3 style="margin: 0 0 20px 0; color: #2c3e50;">📜 Historia transakcji salda</h3>
                ${this.renderTransactions()}
            </div>
        `;
    }

    renderPaymentsByCases() {
        if (!this.balanceData.paymentsByCases || this.balanceData.paymentsByCases.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">📭</div>
                    Brak płatności
                </div>
            `;
        }

        return this.balanceData.paymentsByCases.map(casePayments => `
            <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <div style="font-weight: 600; color: #2c3e50; font-size: 1.1rem;">${casePayments.case_number}</div>
                        <div style="color: #666; font-size: 0.9rem;">${this.escapeHtml(casePayments.case_title)}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 1.3rem; font-weight: 700; color: #2c3e50;">${this.formatMoney(casePayments.total)}</div>
                        <div style="font-size: 0.85rem; color: #666;">
                            Opłacono: ${this.formatMoney(casePayments.paid)} | 
                            Do zapłaty: ${this.formatMoney(casePayments.pending)}
                        </div>
                    </div>
                </div>
                
                <!-- Lista płatności w sprawie -->
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #f0f0f0;">
                    ${casePayments.payments.map(payment => `
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #f0f0f0;">
                            <div>
                                <span style="font-weight: 500;">${this.escapeHtml(payment.payment_code)}</span>
                                <span style="color: #666; font-size: 0.9rem; margin-left: 10px;">${this.escapeHtml(payment.description || 'Płatność')}</span>
                            </div>
                            <div style="text-align: right;">
                                <div style="font-weight: 600; color: ${payment.status === 'completed' ? '#3B82F6' : payment.status === 'pending' ? '#3B82F6' : '#3B82F6'};">
                                    ${this.formatMoney(payment.amount)}
                                </div>
                                <div style="font-size: 0.8rem; color: #999;">${this.getStatusLabel(payment.status)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    renderTransactions() {
        console.log('🔍 [TRANSACTIONS] Renderowanie transakcji:', {
            hasBalanceData: !!this.balanceData,
            hasTransactions: !!this.balanceData?.transactions,
            transactionsLength: this.balanceData?.transactions?.length || 0,
            transactions: this.balanceData?.transactions
        });
        
        if (!this.balanceData?.transactions || this.balanceData.transactions.length === 0) {
            console.log('⚠️ [TRANSACTIONS] Brak transakcji do wyświetlenia');
            return `
                <div style="text-align: center; padding: 40px; color: #999;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">📭</div>
                    Brak transakcji
                </div>
            `;
        }

        console.log('✅ [TRANSACTIONS] Renderowanie', this.balanceData.transactions.length, 'transakcji');
        
        return `
            <div style="max-height: 400px; overflow-y: auto;">
                ${this.balanceData.transactions.map(transaction => `
                    <div style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #f0f0f0; align-items: center;">
                        <div>
                            <div style="font-weight: 500; color: #2c3e50;">${this.escapeHtml(transaction.description)}</div>
                            <div style="font-size: 0.85rem; color: #999;">
                                ${new Date(transaction.created_at).toLocaleString('pl-PL')} • 
                                ${this.escapeHtml(transaction.created_by_name || 'System')}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.2rem; font-weight: 600; color: ${transaction.amount > 0 ? '#3B82F6' : '#3B82F6'};">
                                ${transaction.amount > 0 ? '+' : ''}${this.formatMoney(transaction.amount)}
                            </div>
                            <div style="font-size: 0.8rem; color: #999;">Saldo: ${this.formatMoney(transaction.balance_after)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // =====================================
    // MODAL ZASILENIA SALDA
    // =====================================
    showTopUpModal() {
        const modal = document.createElement('div');
        modal.id = 'topUpModal';
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; width: 90%;">
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px 12px 0 0; color: white;">
                    <h2 style="margin: 0;">💰 Zasilenie salda</h2>
                    <p style="margin: 5px 0 0; opacity: 0.9;">Wybierz metodę płatności</p>
                </div>
                
                <div style="padding: 30px;">
                    <!-- Kwota -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50;">Kwota do wpłaty (PLN)</label>
                        <input type="number" id="topUpAmount" min="1" step="0.01" placeholder="0.00" 
                            style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1.2rem; font-weight: 600;">
                    </div>

                    <!-- Metody płatności -->
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 12px; font-weight: 600; color: #2c3e50;">Metoda płatności</label>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                            <!-- BLIK -->
                            <div onclick="clientBalanceModule.selectPaymentMethod('blik')" id="payment-blik" class="payment-method-card"
                                style="border: 2px solid #e0e0e0; padding: 20px; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.3s;">
                                <div style="font-size: 2rem; margin-bottom: 8px;">📱</div>
                                <div style="font-weight: 600; color: #2c3e50;">BLIK</div>
                                <div style="font-size: 0.8rem; color: #999;">Kod z aplikacji</div>
                            </div>

                            <!-- PayPal -->
                            <div onclick="clientBalanceModule.selectPaymentMethod('paypal')" id="payment-paypal" class="payment-method-card"
                                style="border: 2px solid #e0e0e0; padding: 20px; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.3s;">
                                <div style="font-size: 2rem; margin-bottom: 8px;">💳</div>
                                <div style="font-weight: 600; color: #2c3e50;">PayPal</div>
                                <div style="font-size: 0.8rem; color: #999;">Szybka płatność</div>
                            </div>

                            <!-- Karta -->
                            <div onclick="clientBalanceModule.selectPaymentMethod('card')" id="payment-card" class="payment-method-card"
                                style="border: 2px solid #e0e0e0; padding: 20px; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.3s;">
                                <div style="font-size: 2rem; margin-bottom: 8px;">💳</div>
                                <div style="font-weight: 600; color: #2c3e50;">Karta płatnicza</div>
                                <div style="font-size: 0.8rem; color: #999;">Visa, Mastercard</div>
                            </div>

                            <!-- Przelew -->
                            <div onclick="clientBalanceModule.selectPaymentMethod('transfer')" id="payment-transfer" class="payment-method-card"
                                style="border: 2px solid #e0e0e0; padding: 20px; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.3s;">
                                <div style="font-size: 2rem; margin-bottom: 8px;">🏦</div>
                                <div style="font-weight: 600; color: #2c3e50;">Przelew</div>
                                <div style="font-size: 0.8rem; color: #999;">Tradycyjny</div>
                            </div>

                            <!-- Gotówka -->
                            <div onclick="clientBalanceModule.selectPaymentMethod('cash')" id="payment-cash" class="payment-method-card"
                                style="border: 2px solid #e0e0e0; padding: 20px; border-radius: 8px; text-align: center; cursor: pointer; transition: all 0.3s;">
                                <div style="font-size: 2rem; margin-bottom: 8px;">💵</div>
                                <div style="font-weight: 600; color: #2c3e50;">Gotówka</div>
                                <div style="font-size: 0.8rem; color: #999;">W kasie</div>
                            </div>
                        </div>
                    </div>

                    <!-- BLIK Code (hidden by default) -->
                    <div id="blikCodeSection" style="display: none; margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #2c3e50;">Kod BLIK (6 cyfr)</label>
                        <input type="text" id="blikCode" maxlength="6" placeholder="123456" 
                            style="width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1.5rem; text-align: center; letter-spacing: 5px;">
                    </div>

                    <!-- Opcja faktury dla gotówki -->
                    <div id="cashInvoiceSection" style="display: none; margin-bottom: 20px; padding: 15px; background: #F8FAFC; border-radius: 8px; border-left: 4px solid #3B82F6;">
                        <label style="display: flex; align-items: center; cursor: pointer;">
                            <input type="checkbox" id="issueCashInvoice" checked style="margin-right: 10px; width: 18px; height: 18px; cursor: pointer;">
                            <span style="font-weight: 600; color: #2c3e50;">
                                📄 Wystaw fakturę VAT za wpłatę gotówki
                            </span>
                        </label>
                        <div style="font-size: 0.85rem; color: #666; margin-top: 5px; margin-left: 28px;">
                            Automatycznie zostanie wygenerowana faktura dokumentująca wpłatę
                        </div>
                    </div>

                    <!-- Przyciski -->
                    <div style="display: flex; gap: 12px; margin-top: 30px;">
                        <button onclick="clientBalanceModule.closeTopUpModal()" style="
                            flex: 1;
                            padding: 12px;
                            background: #e0e0e0;
                            border: none;
                            border-radius: 8px;
                            font-weight: 600;
                            cursor: pointer;
                        ">
                            ❌ Anuluj
                        </button>
                        <button onclick="clientBalanceModule.processTopUp()" style="
                            flex: 2;
                            padding: 12px;
                            background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-weight: 600;
                            cursor: pointer;
                            font-size: 1rem;
                        ">
                            ✓ Zasil saldo
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.selectedPaymentMethod = null;

        // Auto-focus na kwotę
        setTimeout(() => {
            document.getElementById('topUpAmount').focus();
        }, 100);
    }

    selectPaymentMethod(method) {
        // Usuń zaznaczenie z wszystkich
        document.querySelectorAll('.payment-method-card').forEach(card => {
            card.style.border = '2px solid #e0e0e0';
            card.style.background = 'white';
        });

        // Zaznacz wybraną
        const selected = document.getElementById(`payment-${method}`);
        selected.style.border = '2px solid #3B82F6';
        selected.style.background = '#f0f3ff';

        this.selectedPaymentMethod = method;

        // Pokaż pole BLIK jeśli wybrano BLIK
        const blikSection = document.getElementById('blikCodeSection');
        const cashInvoiceSection = document.getElementById('cashInvoiceSection');
        
        if (method === 'blik') {
            blikSection.style.display = 'block';
        } else {
            blikSection.style.display = 'none';
        }
        
        // Pokaż opcję faktury jeśli wybrano gotówkę
        if (method === 'cash') {
            cashInvoiceSection.style.display = 'block';
        } else {
            cashInvoiceSection.style.display = 'none';
        }
    }

    async processTopUp() {
        const amount = document.getElementById('topUpAmount').value;
        const blikCode = document.getElementById('blikCode')?.value;

        if (!amount || amount <= 0) {
            alert('❌ Podaj kwotę do wpłaty');
            return;
        }

        if (!this.selectedPaymentMethod) {
            alert('❌ Wybierz metodę płatności');
            return;
        }

        if (this.selectedPaymentMethod === 'blik' && (!blikCode || blikCode.length !== 6)) {
            alert('❌ Podaj 6-cyfrowy kod BLIK');
            return;
        }

        try {
            const response = await window.api.request('/payments/top-up', 'POST', {
                clientId: this.currentClientId,
                amount: parseFloat(amount),
                paymentMethod: this.selectedPaymentMethod,
                blikCode: blikCode || null,
                description: `Zasilenie salda przez ${this.selectedPaymentMethod.toUpperCase()}`
            });

            if (response.success) {
                let message = `✅ ${response.message}\n\nNowe saldo: ${this.formatMoney(response.newBalance)}`;
                
                // Jeśli gotówka i zaznaczono wystawienie faktury
                const issueCashInvoice = document.getElementById('issueCashInvoice')?.checked;
                if (this.selectedPaymentMethod === 'cash' && issueCashInvoice) {
                    try {
                        // Pobierz dane klienta
                        const client = await window.api.request(`/clients/${this.currentClientId}`);
                        
                        // Wystaw fakturę
                        const invoiceData = {
                            client_id: this.currentClientId,
                            buyer_name: `${client.first_name} ${client.last_name}`,
                            buyer_address: client.address || '',
                            buyer_email: client.email || '',
                            net_amount: parseFloat(amount),
                            vat_rate: 23,
                            items: [{
                                description: 'Zasilenie salda - wpłata gotówki',
                                quantity: 1,
                                unit_price: parseFloat(amount)
                            }],
                            issue_date: new Date().toISOString().split('T')[0],
                            sale_date: new Date().toISOString().split('T')[0],
                            notes: `Wpłata gotówki na saldo klienta`,
                            send_to_ksef: false
                        };
                        
                        const invoiceResult = await window.api.request('/sales-invoices', 'POST', invoiceData);
                        
                        if (invoiceResult.success) {
                            message += `\n\n📄 Faktura ${invoiceResult.invoice_number} wystawiona!\nKwota brutto: ${this.formatMoney(invoiceResult.gross_amount)}`;
                            console.log('✅ Automatycznie wystawiono fakturę za wpłatę gotówki:', invoiceResult.invoice_number);
                        }
                    } catch (invoiceError) {
                        console.error('❌ Błąd wystawiania faktury:', invoiceError);
                        message += '\n\n⚠️ Saldo zasilone, ale błąd wystawiania faktury: ' + invoiceError.message;
                    }
                }
                
                alert(message);
                this.closeTopUpModal();
                
                // Odśwież sekcję salda
                const container = document.getElementById('clientBalanceSection');
                if (container) {
                    container.innerHTML = await this.renderBalanceSection(this.currentClientId);
                }
            } else {
                alert('❌ Błąd: ' + (response.error || 'Nieznany błąd'));
            }
        } catch (error) {
            console.error('Błąd zasilania salda:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    closeTopUpModal() {
        const modal = document.getElementById('topUpModal');
        if (modal) modal.remove();
    }

    // =====================================
    // POMOCNICZE
    // =====================================
    async loadBalanceData(clientId) {
        try {
            this.balanceData = await window.api.request(`/payments/client/${clientId}`);
            console.log('✅ Pobrano dane salda klienta:', this.balanceData);
        } catch (error) {
            console.error('Błąd ładowania salda:', error);
            this.balanceData = {
                balance: { balance: 0, currency: 'PLN', last_transaction_at: null },
                payments: [],
                paymentsByCases: [],
                transactions: []
            };
        }
    }

    formatMoney(amount) {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN'
        }).format(amount || 0);
    }

    getStatusLabel(status) {
        const labels = {
            'pending': 'Oczekująca',
            'completed': 'Opłacona',
            'failed': 'Nieudana',
            'cancelled': 'Anulowana'
        };
        return labels[status] || status;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Utwórz globalną instancję
const clientBalanceModule = new ClientBalanceModule();
window.clientBalanceModule = clientBalanceModule;

console.log('✅ Client Balance Module v1.0 załadowany!');
