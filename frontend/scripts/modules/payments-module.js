/**
 * Payments Module v1.0
 * Moduł płatności z integracją PayPal
 * 
 * Features:
 * - Generowanie kodu płatności
 * - Tworzenie płatności
 * - Integracja PayPal
 * - Historia płatności
 * - Statystyki
 */

class PaymentsModule {
    constructor() {
        console.log('💰 Payments Module zainicjalizowany');
        this.currentCaseId = null;
        this.payments = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Event Bus listeners
        if (window.eventBus) {
            eventBus.on('case:opened', (data) => {
                this.currentCaseId = data.caseId;
                this.loadPayments(data.caseId);
            });
            
            eventBus.on('payment:created', (data) => {
                this.loadPayments(data.caseId);
            });
        }
    }

    // =====================================
    // RENDEROWANIE ZAKŁADKI PŁATNOŚCI
    // =====================================
    async renderPaymentsTab(caseId) {
        this.currentCaseId = caseId;
        
        // Pokaż okienko ładowania w kontenerze
        let container = document.getElementById('caseTabContent') ||
                         document.getElementById('caseTabContentArea') ||
                         document.querySelector('[id*="Tab"][id*="Content"]');
        
        if (container) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; padding: 60px; flex-direction: column;">
                    <div style="font-size: 3rem; margin-bottom: 20px; animation: pulse 1.5s infinite;">💰</div>
                    <div style="font-size: 1.2rem; font-weight: 600; color: #1a2332; margin-bottom: 15px;">Ładowanie płatności...</div>
                    <div style="width: 200px; height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden;">
                        <div style="width: 30%; height: 100%; background: linear-gradient(90deg, #FFD700, #d4af37); border-radius: 3px; animation: loadingBar 1.5s ease-in-out infinite;"></div>
                    </div>
                    <style>
                        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                        @keyframes loadingBar { 0% { width: 0%; margin-left: 0%; } 50% { width: 60%; margin-left: 20%; } 100% { width: 0%; margin-left: 100%; } }
                    </style>
                </div>
            `;
        }
        
        await this.loadPayments(caseId);
        
        // Kontener już znaleziony wcześniej
        if (!container) {
            console.error('❌ Kontener zakładek nie znaleziony');
            console.log('🔍 Sprawdzono: #caseTabContent, #caseTabContentArea');
            return;
        }
        
        console.log('✅ Znaleziono kontener:', container.id);

        container.innerHTML = `
            <div style="padding: 20px;">
                <!-- Nagłówek -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="margin: 0; color: #1a2332;">💰 Płatności w sprawie</h3>
                    <button onclick="paymentsModule.showAddPaymentForm()" style="padding: 12px 24px; background: linear-gradient(135deg, #FFD700, #d4af37); color: #1a2332; border: none; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 1rem; box-shadow: 0 4px 15px rgba(212,175,55,0.3); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                        ➕ Dodaj płatność
                    </button>
                </div>

                <!-- Statystyki -->
                ${this.renderPaymentStats()}

                <!-- Lista płatności -->
                <div id="paymentsList">
                    ${this.renderPaymentsList()}
                </div>
            </div>
        `;
    }

    renderPaymentStats() {
        const total = this.payments.length;
        const pending = this.payments.filter(p => p.status === 'pending').length;
        const completed = this.payments.filter(p => p.status === 'completed').length;
        const failed = this.payments.filter(p => p.status === 'failed').length;
        
        // Przeterminowane płatności
        const now = new Date();
        const overdue = this.payments.filter(p => 
            p.status === 'pending' && 
            p.due_date && 
            new Date(p.due_date) < now
        ).length;
        
        const totalAmount = this.payments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        
        const pendingAmount = this.payments
            .filter(p => p.status === 'pending')
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
        
        const overdueAmount = this.payments
            .filter(p => p.status === 'pending' && p.due_date && new Date(p.due_date) < now)
            .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, #FFD700 0%, #d4af37 100%); padding: 15px; border-radius: 8px; color: #1a2332;">
                    <div style="font-size: 1.5rem; font-weight: 700;">${total}</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">Wszystkie</div>
                </div>
                <div style="background: linear-gradient(135deg, #FFD700 0%, #d4af37 100%); padding: 15px; border-radius: 8px; color: #1a2332;">
                    <div style="font-size: 1.5rem; font-weight: 700;">${pending}</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">Oczekujące</div>
                </div>
                <div style="background: linear-gradient(135deg, #FFD700 0%, #d4af37 100%); padding: 15px; border-radius: 8px; color: #1a2332;">
                    <div style="font-size: 1.5rem; font-weight: 700;">${completed}</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">Opłacone</div>
                </div>
                <div style="background: linear-gradient(135deg, #FFD700 0%, #d4af37 100%); padding: 15px; border-radius: 8px; color: #1a2332;">
                    <div style="font-size: 1.2rem; font-weight: 700;">${totalAmount.toFixed(2)} PLN</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">Wpłacono</div>
                </div>
                <div style="background: linear-gradient(135deg, #FFD700 0%, #d4af37 100%); padding: 15px; border-radius: 8px; color: #1a2332;">
                    <div style="font-size: 1.2rem; font-weight: 700;">${pendingAmount.toFixed(2)} PLN</div>
                    <div style="font-size: 0.85rem; opacity: 0.9;">Do zapłaty</div>
                </div>
                ${overdue > 0 ? `
                    <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 15px; border-radius: 8px; color: white; animation: pulse 2s infinite;">
                        <div style="font-size: 1.5rem; font-weight: 700;">${overdue}</div>
                        <div style="font-size: 0.85rem; opacity: 0.9;">⚠️ Przeterminowane</div>
                    </div>
                    <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 15px; border-radius: 8px; color: white;">
                        <div style="font-size: 1.2rem; font-weight: 700;">${overdueAmount.toFixed(2)} PLN</div>
                        <div style="font-size: 0.85rem; opacity: 0.9;">⚠️ Zaległości</div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderPaymentsList() {
        if (this.payments.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; background: #f8f9fa; border-radius: 8px; border: 2px dashed #ddd;">
                    <div style="font-size: 3rem; margin-bottom: 15px;">💳</div>
                    <h4 style="color: #7f8c8d; margin-bottom: 10px;">Brak płatności</h4>
                    <p style="color: #999; font-size: 0.9rem;">
                        Kliknij "Dodaj płatność" aby utworzyć pierwszą płatność
                    </p>
                </div>
            `;
        }

        const statusColors = {
            'pending': '#FFD700',
            'completed': '#2ecc71',
            'failed': '#e74c3c',
            'refunded': '#95a5a6'
        };

        const statusLabels = {
            'pending': '⏳ Oczekująca',
            'completed': '✅ Opłacona',
            'failed': '❌ Nieudana',
            'refunded': '↩️ Zwrócona'
        };

        return this.payments.map(payment => {
            // Sprawdź czy płatność jest przeterminowana
            const now = new Date();
            const isOverdue = payment.status === 'pending' && 
                            payment.due_date && 
                            new Date(payment.due_date) < now;
            
            const borderStyle = isOverdue ? 'border: 3px solid #e74c3c;' : '';
            const bgStyle = isOverdue ? 'background: linear-gradient(135deg, #fee 0%, #fdd 100%);' : 'background: white;';
            
            return `
            <div style="${bgStyle} border-radius: 8px; padding: 15px; margin-bottom: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: transform 0.2s; ${borderStyle}"
                 onmouseover="this.style.transform='translateY(-2px)'"
                 onmouseout="this.style.transform='translateY(0)'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                    <div style="flex: 1; cursor: pointer;" onclick="paymentsModule.viewPaymentDetails(${payment.id})">
                        <div style="font-weight: 600; color: ${isOverdue ? '#c0392b' : '#1a2332'}; margin-bottom: 5px;">
                            ${isOverdue ? '⚠️ ' : ''}${this.escapeHtml(payment.payment_code)}
                        </div>
                        <div style="color: #7f8c8d; font-size: 0.9rem;">
                            ${this.escapeHtml(payment.description || 'Brak opisu')}
                        </div>
                        ${isOverdue ? `
                            <div style="color: #e74c3c; font-size: 0.85rem; font-weight: 600; margin-top: 5px;">
                                ⏰ Przeterminowana od: ${new Date(payment.due_date).toLocaleDateString('pl-PL')}
                            </div>
                        ` : ''}
                    </div>
                    <div style="display: flex; gap: 8px; align-items: start;">
                        ${isOverdue ? `
                            <button onclick="event.stopPropagation(); paymentsModule.sendPaymentReminder(${payment.id})"
                                    style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; white-space: nowrap;">
                                📧 Przypomnienie
                            </button>
                        ` : ''}
                        <span style="background: ${isOverdue ? '#e74c3c' : statusColors[payment.status]}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; white-space: nowrap; font-weight: 600;">
                            ${isOverdue ? '⚠️ Przeterminowana' : statusLabels[payment.status] || payment.status}
                        </span>
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; font-size: 0.9rem; color: #7f8c8d;">
                    <div>
                        <strong>Kwota:</strong> ${parseFloat(payment.amount).toFixed(2)} ${payment.currency}
                    </div>
                    <div>
                        <strong>Typ:</strong> ${payment.payment_type}
                    </div>
                    <div>
                        <strong>Data:</strong> ${new Date(payment.created_at).toLocaleDateString('pl-PL')}
                    </div>
                    ${payment.due_date ? `
                        <div>
                            <strong>Termin:</strong> ${new Date(payment.due_date).toLocaleDateString('pl-PL')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        }).join('');
    }

    // =====================================
    // FORMULARZ DODAWANIA PŁATNOŚCI
    // =====================================
    async showAddPaymentForm() {
        if (!this.currentCaseId) {
            alert('❌ Nie wybrano sprawy');
            return;
        }

        // Pokaż okienko ładowania
        const loadingModal = document.createElement('div');
        loadingModal.id = 'addPaymentLoadingModal';
        loadingModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); display: flex; align-items: center;
            justify-content: center; z-index: 10000; animation: fadeIn 0.2s;
        `;
        loadingModal.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 1.5s infinite;">➕</div>
                <div style="font-size: 1.3rem; font-weight: 600; margin-bottom: 15px;">Przygotowuję formularz...</div>
                <div style="width: 200px; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden; margin: 0 auto;">
                    <div style="width: 30%; height: 100%; background: linear-gradient(90deg, #FFD700, #d4af37); border-radius: 3px; animation: loadingBar 1.5s ease-in-out infinite;"></div>
                </div>
            </div>
        `;
        document.body.appendChild(loadingModal);

        try {
            // Generuj kod płatności
            const response = await api.request('/payments/generate-code', {
            method: 'POST',
            body: JSON.stringify({ caseId: this.currentCaseId })
        });

        const paymentCode = response.code;

        // Pobierz dane sprawy
        const caseData = await api.request(`/cases/${this.currentCaseId}`);

        const modal = this.createModal('addPaymentModal', `
            <div style="max-width: 600px; margin: 0 auto;">
                <h2 style="margin-bottom: 20px;">💰 Nowa płatność</h2>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="font-weight: 600; color: #2c3e50; margin-bottom: 5px;">Kod płatności:</div>
                    <div style="font-size: 1.2rem; color: #3B82F6;">${paymentCode}</div>
                </div>

                <form id="addPaymentForm" onsubmit="paymentsModule.submitPayment(event); return false;">
                    <input type="hidden" name="payment_code" value="${paymentCode}">
                    <input type="hidden" name="case_id" value="${this.currentCaseId}">
                    <input type="hidden" name="client_id" value="${caseData.case?.client_id || ''}">

                    <div class="form-group">
                        <label>Kwota (PLN) *</label>
                        <input type="number" name="amount" step="0.01" min="0" required 
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>

                    <div class="form-group">
                        <label>Typ płatności *</label>
                        <select name="payment_type" required 
                                style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Wybierz...</option>
                            <option value="invoice">Faktura VAT</option>
                            <option value="advance">Zaliczka</option>
                            <option value="final">Płatność końcowa</option>
                            <option value="consultation">Konsultacja</option>
                            <option value="representation">Reprezentacja sądowa</option>
                            <option value="documents">Opłata za dokumenty</option>
                            <option value="other">Inne</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Opis</label>
                        <textarea name="description" rows="3" 
                                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                    </div>

                    <div class="form-group">
                        <label>Metoda płatności *</label>
                        <select name="payment_method" id="paymentMethodSelect" required 
                                onchange="paymentsModule.togglePaymentMethodFields()"
                                style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Wybierz...</option>
                            <option value="blik">📱 BLIK</option>
                            <option value="paypal">💳 PayPal</option>
                            <option value="card">💳 Karta płatnicza</option>
                            <option value="cash">💵 Gotówka</option>
                            <option value="crypto">₿ Kryptowaluta</option>
                            <option value="balance">💰 Saldo klienta</option>
                            <option value="bank_transfer">🏦 Przelew bankowy</option>
                        </select>
                    </div>

                    <!-- Pole dla BLIK -->
                    <div id="blikFields" style="display: none;">
                        <div class="form-group">
                            <label>Kod BLIK (6 cyfr)</label>
                            <input type="text" name="blik_code" maxlength="6" placeholder="123456" 
                                   style="width: 100%; padding: 15px; border: 2px solid #3B82F6; border-radius: 8px; font-size: 1.5rem; text-align: center; letter-spacing: 5px; font-family: monospace;">
                            <small style="color: #3B82F6; display: block; margin-top: 5px;">
                                📱 Kod z aplikacji bankowej klienta
                            </small>
                        </div>
                    </div>

                    <!-- Pola dla kryptowaluty -->
                    <div id="cryptoFields" style="display: none;">
                        <div class="form-group">
                            <label>Waluta krypto</label>
                            <select name="crypto_currency" 
                                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="BTC">₿ Bitcoin (BTC)</option>
                                <option value="ETH">Ξ Ethereum (ETH)</option>
                                <option value="USDT">₮ Tether (USDT)</option>
                                <option value="BNB">🔶 Binance Coin (BNB)</option>
                                <option value="USDC">🔵 USD Coin (USDC)</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Adres portfela klienta</label>
                            <input type="text" name="crypto_wallet_address" placeholder="0x..." 
                                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace;">
                            <small style="color: #999;">Adres gdzie klient ma wysłać płatność</small>
                        </div>
                    </div>

                    <!-- Opcja rat -->
                    <div class="form-group" style="border-top: 2px solid #ecf0f1; padding-top: 20px; margin-top: 20px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 600;">
                            <input type="checkbox" id="enableInstallments" onchange="paymentsModule.toggleInstallments()" style="cursor: pointer;">
                            <span>📅 Rozłóż na raty</span>
                        </label>
                        <small style="display: block; color: #999; margin-top: 5px; margin-left: 26px;">
                            Utwórz harmonogram płatności ratalnych
                        </small>
                    </div>

                    <!-- Pola rat (ukryte domyślnie) -->
                    <div id="installmentFields" style="display: none; background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 10px;">
                        <div class="form-group">
                            <label>Liczba rat *</label>
                            <select name="installment_count" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="2">2 raty</option>
                                <option value="3">3 raty</option>
                                <option value="4">4 raty</option>
                                <option value="6">6 rat</option>
                                <option value="12">12 rat</option>
                                <option value="24">24 raty</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Częstotliwość *</label>
                            <select name="frequency" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="monthly">Miesięczna</option>
                                <option value="weekly">Tygodniowa</option>
                                <option value="biweekly">Co 2 tygodnie</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Pierwsza rata *</label>
                            <input type="date" name="start_date" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        </div>

                        <div style="background: #fff3cd; padding: 10px; border-radius: 4px; border-left: 4px solid #ffc107; font-size: 0.9rem;">
                            <strong>📌 Uwaga:</strong> Zostanie utworzona płatność główna oraz automatycznie wygenerowany harmonogram rat.
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Termin płatności</label>
                        <input type="date" name="due_date" 
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        <small style="display: block; color: #999; margin-top: 5px;">
                            Pozostaw puste jeśli rozłożono na raty
                        </small>
                    </div>

                    <!-- KONTROLA PROWIZJI -->
                    <div class="form-group" style="border-top: 2px solid #ecf0f1; padding-top: 20px; margin-top: 20px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-weight: 600;">
                            <input type="checkbox" id="enableCommission" name="enable_commission" checked onchange="paymentsModule.toggleCommission()" style="cursor: pointer;">
                            <span>💰 Nalicz prowizję dla tej płatności</span>
                        </label>
                        <small style="display: block; color: #999; margin-top: 5px; margin-left: 26px;">
                            Prowizja dla mecenasa/opiekuna (odznacz jeśli to opłata urzędowa, koszty sądowe itp.)
                        </small>
                    </div>

                    <!-- Pola prowizji (widoczne gdy checkbox zaznaczony) -->
                    <div id="commissionFields" style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-top: 10px; border: 2px solid #3B82F6;">
                        <div class="form-group">
                            <label>Stawka prowizji (%) *</label>
                            <input type="number" name="commission_rate_override" step="0.01" min="0" max="100" placeholder="Auto (wg. roli)" 
                                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            <small style="display: block; color: #3B82F6; margin-top: 5px;">
                                💡 Pozostaw puste dla automatycznej stawki: Mecenas 15%, Opiekun sprawy 10%, Opiekun klienta 5%
                            </small>
                        </div>
                        
                        <div class="form-group">
                            <label>Kto dostaje prowizję?</label>
                            <select name="commission_recipient_override" 
                                    style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="">Auto (mecenas + opiekunowie)</option>
                                <option value="lawyer_only">Tylko mecenas</option>
                                <option value="case_manager_only">Tylko opiekun sprawy</option>
                                <option value="client_manager_only">Tylko opiekun klienta</option>
                            </select>
                            <small style="display: block; color: #3B82F6; margin-top: 5px;">
                                ✨ Domyślnie prowizje trafiają do mecenasa oraz wszystkich przypisanych opiekunów
                            </small>
                        </div>

                        <div style="background: #dbeafe; padding: 10px; border-radius: 4px; border-left: 4px solid #3B82F6; font-size: 0.9rem; margin-top: 10px;">
                            <strong>ℹ️ System automatyczny:</strong><br>
                            • Mecenas sprawy → 15% prowizji<br>
                            • Opiekun sprawy → 10% prowizji<br>
                            • Opiekun klienta → 5% prowizji<br>
                            <br>
                            <strong>⚠️ Zatwierdzenie przez Admin:</strong><br>
                            Wszystkie prowizje wymagają zatwierdzenia w Finance Dashboard przed wypłatą.
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button type="submit" class="btn-primary" style="flex: 1;">
                            💾 Utwórz płatność
                        </button>
                        <button type="button" onclick="paymentsModule.closeModal('addPaymentModal')" class="btn-secondary" style="flex: 1;">
                            ❌ Anuluj
                        </button>
                    </div>
                </form>
            </div>
        `);

        // Płynne przejście z ładowania do formularza
        const loadingEl = document.getElementById('addPaymentLoadingModal');
        if (loadingEl) {
            // Fade out okienka ładowania
            loadingEl.style.transition = 'opacity 0.3s ease';
            loadingEl.style.opacity = '0';
            setTimeout(() => loadingEl.remove(), 300);
        }

        document.body.appendChild(modal);
        
        // Płynne pojawienie się formularza (fade in + scale)
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.4s ease';
        modal.classList.add('active');
        
        requestAnimationFrame(() => {
            modal.style.opacity = '1';
        });
        } catch (error) {
            // Usuń okienko ładowania w przypadku błędu
            const loadingEl = document.getElementById('addPaymentLoadingModal');
            if (loadingEl) loadingEl.remove();
            
            console.error('Błąd otwierania formularza płatności:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    togglePaymentMethodFields() {
        const method = document.getElementById('paymentMethodSelect').value;
        const blikFields = document.getElementById('blikFields');
        const cryptoFields = document.getElementById('cryptoFields');
        
        // Ukryj wszystkie specjalne pola
        if (blikFields) blikFields.style.display = 'none';
        if (cryptoFields) cryptoFields.style.display = 'none';
        
        // Pokaż odpowiednie pola
        if (method === 'blik' && blikFields) {
            blikFields.style.display = 'block';
        } else if (method === 'crypto' && cryptoFields) {
            cryptoFields.style.display = 'block';
        }
    }

    toggleInstallments() {
        const checkbox = document.getElementById('enableInstallments');
        const installmentFields = document.getElementById('installmentFields');
        
        if (checkbox && installmentFields) {
            if (checkbox.checked) {
                installmentFields.style.display = 'block';
                console.log('📅 Opcja rat włączona');
            } else {
                installmentFields.style.display = 'none';
                console.log('📅 Opcja rat wyłączona');
            }
        }
    }

    toggleCommission() {
        const checkbox = document.getElementById('enableCommission');
        const commissionFields = document.getElementById('commissionFields');
        
        if (checkbox && commissionFields) {
            if (checkbox.checked) {
                commissionFields.style.display = 'block';
                console.log('💰 Prowizje włączone');
            } else {
                commissionFields.style.display = 'none';
                console.log('💰 Prowizje wyłączone (opłata bez prowizji)');
            }
        }
    }

    async submitPayment(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        
        const data = {
            payment_code: formData.get('payment_code'),
            case_id: parseInt(formData.get('case_id')),
            client_id: parseInt(formData.get('client_id')),
            amount: parseFloat(formData.get('amount')),
            currency: 'PLN',
            description: formData.get('description'),
            payment_type: formData.get('payment_type'),
            payment_method: formData.get('payment_method'),
            add_to_balance: formData.get('add_to_balance') === '1',
            blik_code: formData.get('blik_code') || null,
            crypto_currency: formData.get('crypto_currency') || null,
            crypto_wallet_address: formData.get('crypto_wallet_address') || null,
            due_date: formData.get('due_date') || null,
            // KONTROLA PROWIZJI
            enable_commission: document.getElementById('enableCommission')?.checked ? 1 : 0,
            commission_rate_override: formData.get('commission_rate_override') ? parseFloat(formData.get('commission_rate_override')) : null,
            commission_recipient_override: formData.get('commission_recipient_override') || null
        };

        console.log('💰 Dane prowizji:', {
            enabled: data.enable_commission,
            rate: data.commission_rate_override,
            recipient: data.commission_recipient_override
        });

        // Sprawdź czy opcja rat jest włączona
        const enableInstallments = document.getElementById('enableInstallments');
        const installmentsEnabled = enableInstallments && enableInstallments.checked;
        
        let installmentData = null;
        if (installmentsEnabled) {
            installmentData = {
                installment_count: parseInt(formData.get('installment_count')),
                frequency: formData.get('frequency'),
                start_date: formData.get('start_date')
            };
            console.log('📅 Raty włączone:', installmentData);
        }

        try {
            // Utwórz płatność
            const response = await api.request('/payments', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (response.success) {
                const paymentId = response.paymentId;
                
                // Jeśli raty są włączone, wygeneruj harmonogram
                if (installmentsEnabled && installmentData) {
                    try {
                        const installmentResponse = await api.request('/installments/generate', {
                            method: 'POST',
                            body: JSON.stringify({
                                invoice_id: paymentId,
                                case_id: data.case_id,
                                client_id: data.client_id,
                                total_amount: data.amount,
                                installment_count: installmentData.installment_count,
                                frequency: installmentData.frequency,
                                start_date: installmentData.start_date
                            })
                        });
                        
                        if (installmentResponse.success) {
                            console.log('✅ Harmonogram rat wygenerowany:', installmentResponse.installments);
                            alert(`✅ Płatność utworzona pomyślnie!\n📅 Wygenerowano ${installmentData.installment_count} rat.`);
                        }
                    } catch (installmentError) {
                        console.error('❌ Błąd generowania rat:', installmentError);
                        alert('⚠️ Płatność utworzona, ale nie udało się wygenerować harmonogramu rat.\n' + installmentError.message);
                    }
                } else {
                    alert('✅ Płatność utworzona pomyślnie!');
                }
                
                this.closeModal('addPaymentModal');
                
                // Emit event
                if (window.eventBus) {
                    eventBus.emit('payment:created', { 
                        paymentId: paymentId, 
                        caseId: this.currentCaseId 
                    });
                }
                
                await this.renderPaymentsTab(this.currentCaseId);
            }
        } catch (error) {
            console.error('Błąd tworzenia płatności:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // SZCZEGÓŁY PŁATNOŚCI
    // =====================================
    async viewPaymentDetails(paymentId) {
        // Pokaż okienko ładowania
        const loadingModal = document.createElement('div');
        loadingModal.id = 'paymentLoadingModal';
        loadingModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.85); display: flex; align-items: center;
            justify-content: center; z-index: 10000; animation: fadeIn 0.2s;
        `;
        loadingModal.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 1.5s infinite;">💰</div>
                <div style="font-size: 1.3rem; font-weight: 600; margin-bottom: 15px;">Ładowanie płatności...</div>
                <div style="width: 200px; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden; margin: 0 auto;">
                    <div style="width: 30%; height: 100%; background: linear-gradient(90deg, #FFD700, #d4af37); border-radius: 3px; animation: loadingBar 1.5s ease-in-out infinite;"></div>
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
            const payments = await api.request(`/payments/case/${this.currentCaseId}`);
            const payment = payments.payments.find(p => p.id === paymentId);
            
            if (!payment) {
                const loadingEl = document.getElementById('paymentLoadingModal');
                if (loadingEl) loadingEl.remove();
                alert('❌ Płatność nie znaleziona');
                return;
            }

            // Pobierz raty jeśli istnieją
            let installments = [];
            try {
                const installmentsResponse = await api.request(`/installments?invoice_id=${paymentId}`);
                installments = installmentsResponse.installments || [];
                console.log('📅 Pobrano rat:', installments.length);
            } catch (e) {
                console.log('ℹ️ Brak rat dla tej płatności');
            }

            const statusColors = {
                'pending': '#3B82F6',
                'completed': '#3B82F6',
                'failed': '#3B82F6'
            };

            // Płynne przejście z ładowania do modala
            const loadingEl = document.getElementById('paymentLoadingModal');
            if (loadingEl) {
                loadingEl.style.transition = 'opacity 0.3s ease';
                loadingEl.style.opacity = '0';
                setTimeout(() => loadingEl.remove(), 300);
            }

            const modal = this.createModal('paymentDetailsModal', `
                <div style="max-width: 700px; margin: 0 auto;">
                    <h2 style="margin-bottom: 20px;">💰 Szczegóły płatności</h2>
                    
                    <div style="background: white; border-radius: 8px; padding: 20px;">
                        <!-- Kod i status -->
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #f0f0f0;">
                            <div>
                                <div style="color: #64748b; font-size: 0.9rem; margin-bottom: 5px; font-weight: 600;">Kod płatności</div>
                                <div style="font-size: 1.3rem; font-weight: 600; color: #2c3e50;">${this.escapeHtml(payment.payment_code)}</div>
                            </div>
                            <div style="text-align: right;">
                                <div style="background: ${statusColors[payment.status]}; color: white; padding: 8px 20px; border-radius: 20px; font-weight: 600;">
                                    ${payment.status.toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <!-- Kwota -->
                        <div style="text-align: center; padding: 30px 0; background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); border-radius: 8px; margin-bottom: 20px; color: white;">
                            <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">Kwota do zapłaty</div>
                            <div style="font-size: 3rem; font-weight: 700;">${parseFloat(payment.amount).toFixed(2)} ${payment.currency}</div>
                        </div>

                        <!-- Szczegóły -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <div>
                                <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600;">Typ płatności</div>
                                <div style="font-weight: 600; color: #1a2332; font-size: 1rem;">${payment.payment_type}</div>
                            </div>
                            <div>
                                <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600;">Klient</div>
                                <div style="font-weight: 600; color: #1a2332; font-size: 1rem;">${this.escapeHtml(payment.client_name || 'Brak danych')}</div>
                            </div>
                            <div>
                                <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600;">Data utworzenia</div>
                                <div style="font-weight: 600; color: #1a2332; font-size: 1rem;">${new Date(payment.created_at).toLocaleString('pl-PL')}</div>
                            </div>
                            ${payment.due_date ? `
                                <div>
                                    <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600;">Termin płatności</div>
                                    <div style="font-weight: 600; color: #1a2332; font-size: 1rem;">${new Date(payment.due_date).toLocaleDateString('pl-PL')}</div>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Opis -->
                        ${payment.description ? `
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                <div style="color: #64748b; font-size: 0.85rem; margin-bottom: 5px; font-weight: 600;">Opis</div>
                                <div style="color: #1a2332; font-size: 0.95rem;">${this.escapeHtml(payment.description)}</div>
                            </div>
                        ` : ''}

                        <!-- Informacja o potwierdzeniu płatności -->
                        ${payment.status === 'completed' && payment.confirmed_by ? `
                            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
                                <div style="color: #2e7d32; font-weight: 700; margin-bottom: 10px; font-size: 1rem;">✅ Płatność potwierdzona</div>
                                <div style="font-size: 0.9rem; color: #1a2332; font-weight: 600;">
                                    <strong style="color: #64748b;">Potwierdził:</strong> ${this.escapeHtml(payment.confirmed_by_name || 'ID: ' + payment.confirmed_by)}<br>
                                    <strong style="color: #64748b;">Data potwierdzenia:</strong> ${payment.paid_at ? new Date(payment.paid_at).toLocaleString('pl-PL') : 'Brak danych'}<br>
                                    ${payment.payment_reference ? `<strong style="color: #64748b;">Numer referencyjny:</strong> ${this.escapeHtml(payment.payment_reference)}<br>` : ''}
                                    ${payment.confirmation_file ? `
                                        <strong style="color: #64748b;">Załącznik:</strong> 
                                        <a href="/uploads/${payment.confirmation_file}" target="_blank" style="color: #2e7d32; text-decoration: underline;">
                                            📎 Pobierz potwierdzenie
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        ` : ''}

                        <!-- PayPal Info -->
                        ${payment.paypal_order_id ? `
                            <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #3B82F6;">
                                <div style="color: #3B82F6; font-weight: 700; margin-bottom: 10px; font-size: 1rem;">✅ Opłacone przez PayPal</div>
                                <div style="font-size: 0.9rem; color: #1a2332; font-weight: 600;">
                                    <strong style="color: #64748b;">Order ID:</strong> ${payment.paypal_order_id}<br>
                                    <strong style="color: #64748b;">Email:</strong> ${payment.paypal_payer_email || 'Brak danych'}
                                </div>
                            </div>
                        ` : ''}

                        <!-- Harmonogram rat -->
                        ${installments.length > 0 ? `
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #FFD700;">
                                <h3 style="margin: 0 0 15px 0; color: #2c3e50; display: flex; align-items: center; gap: 8px;">
                                    📅 Harmonogram rat (${installments.length})
                                </h3>
                                <div style="overflow-x: auto;">
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr style="border-bottom: 2px solid #ddd; background: #f8f9fa;">
                                                <th style="padding: 10px; text-align: left; font-weight: 700; color: #2c3e50;">Rata</th>
                                                <th style="padding: 10px; text-align: right; font-weight: 700; color: #2c3e50;">Kwota</th>
                                                <th style="padding: 10px; text-align: center; font-weight: 700; color: #2c3e50;">Termin</th>
                                                <th style="padding: 10px; text-align: center; font-weight: 700; color: #2c3e50;">Status</th>
                                                <th style="padding: 10px; text-align: center; font-weight: 700; color: #2c3e50;">Akcje</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${installments.map(inst => {
                                                const isPending = inst.status === 'pending';
                                                const isOverdue = isPending && new Date(inst.due_date) < new Date();
                                                const statusBadge = inst.status === 'completed' 
                                                    ? '<span style="background: #2ecc71; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem;">✅ Opłacona</span>'
                                                    : isOverdue 
                                                    ? '<span style="background: #e74c3c; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem;">⚠️ Przeterminowana</span>'
                                                    : '<span style="background: #FFD700; color: #1a2332; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem;">⏳ Oczekująca</span>';
                                                
                                                return `
                                                    <tr style="border-bottom: 1px solid #ecf0f1;">
                                                        <td style="padding: 12px; font-weight: 600; color: #1a2332; font-size: 1rem;">${inst.installment_number}/${inst.total_installments}</td>
                                                        <td style="padding: 12px; text-align: right; font-weight: 600; color: #1a2332; font-size: 1rem;">${parseFloat(inst.amount).toFixed(2)} PLN</td>
                                                        <td style="padding: 12px; text-align: center; font-size: 0.95rem; color: #1a2332; font-weight: 600;">${new Date(inst.due_date).toLocaleDateString('pl-PL')}</td>
                                                        <td style="padding: 12px; text-align: center;">${statusBadge}</td>
                                                        <td style="padding: 12px; text-align: center;">
                                                            ${inst.status === 'pending' ? `
                                                                <button onclick="paymentsModule.payInstallment(${inst.id}, ${payment.id})" 
                                                                        style="padding: 6px 12px; background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600;">
                                                                    💰 Opłać
                                                                </button>
                                                            ` : '✅'}
                                                        </td>
                                                    </tr>
                                                `;
                                            }).join('')}
                                        </tbody>
                                    </table>
                                </div>
                                <div style="margin-top: 15px; padding: 10px; background: white; border-radius: 6px; font-size: 1rem; color: #1a2332;">
                                    <strong style="color: #2c3e50;">Suma rat:</strong> <strong style="color: #1a2332;">${installments.reduce((sum, i) => sum + parseFloat(i.amount), 0).toFixed(2)} PLN</strong>
                                    <span style="margin-left: 20px;">
                                        <strong style="color: #2c3e50;">Opłacone:</strong> <strong style="color: #1a2332;">${installments.filter(i => i.status === 'completed').length}/${installments.length}</strong>
                                    </span>
                                </div>
                            </div>
                        ` : ''}

                        <!-- Akcje -->
                        <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
                            ${payment.status === 'pending' ? `
                                ${payment.payment_method === 'paypal' || !payment.payment_method ? `
                                    <button onclick="paymentsModule.payWithPayPal(${payment.id})" class="btn-primary">
                                        💳 Zapłać PayPal
                                    </button>
                                ` : ''}
                                ${payment.payment_method === 'cash' ? `
                                    <button onclick="paymentsModule.payWithCash(${payment.id})" class="btn-primary">
                                        💵 Zarejestruj gotówkę
                                    </button>
                                ` : ''}
                                ${payment.payment_method === 'crypto' ? `
                                    <button onclick="paymentsModule.payWithCrypto(${payment.id})" class="btn-primary">
                                        ₿ Zarejestruj krypto
                                    </button>
                                ` : ''}
                                <!-- Przycisk Zapłać z salda dla wszystkich -->
                                <button onclick="paymentsModule.payWithBalance(${payment.id})" class="btn-primary">
                                    💰 Zapłać z salda
                                </button>
                                <!-- Przycisk Potwierdź opłatę dla admin/finance -->
                                <button onclick="paymentsModule.showConfirmPaymentForm(${payment.id})" class="btn-success" style="background: linear-gradient(135deg, #2ecc71, #27ae60);">
                                    ✅ Potwierdź opłatę
                                </button>
                            ` : ''}
                            <button onclick="paymentsModule.viewPaymentHistory(${payment.id})" class="btn-secondary">
                                📜 Historia
                            </button>
                            ${payment.client_id ? `
                                <button onclick="paymentsModule.viewClientBalance(${payment.client_id})" class="btn-secondary">
                                    💰 Saldo
                                </button>
                            ` : ''}
                            <button onclick="paymentsModule.closeModal('paymentDetailsModal')" class="btn-secondary">
                                ❌ Zamknij
                            </button>
                        </div>
                    </div>
                </div>
            `);

            document.body.appendChild(modal);
            
            // Płynne pojawienie się modala
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.4s ease';
            modal.classList.add('active');
            
            requestAnimationFrame(() => {
                modal.style.opacity = '1';
            });
        } catch (error) {
            // Usuń okienko ładowania w przypadku błędu
            const loadingEl = document.getElementById('paymentLoadingModal');
            if (loadingEl) loadingEl.remove();
            
            console.error('Błąd pobierania szczegółów płatności:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // INTEGRACJA PAYPAL
    // =====================================
    async payWithPayPal(paymentId) {
        try {
            // TODO: Implementacja PayPal
            alert('🚧 Integracja PayPal w przygotowaniu!\n\nPotrzebne:\n1. PayPal Client ID\n2. Konfiguracja webhooków\n3. Implementacja PayPal SDK');
        } catch (error) {
            console.error('Błąd PayPal:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // OPŁACANIE RATY
    // =====================================
    async payInstallment(installmentId, paymentId) {
        const confirmed = confirm('Czy na pewno chcesz oznaczyć tę ratę jako opłaconą?');
        if (!confirmed) return;

        try {
            const response = await api.request(`/installments/${installmentId}/pay`, {
                method: 'POST',
                body: JSON.stringify({
                    payment_method: 'cash' // domyślnie gotówka, można rozszerzyć
                })
            });

            if (response.success) {
                alert('✅ Rata została opłacona!');
                this.closeModal('paymentDetailsModal');
                await this.renderPaymentsTab(this.currentCaseId);
                // Ponownie otwórz szczegóły aby pokazać zaktualizowane raty
                await this.viewPaymentDetails(paymentId);
            }
        } catch (error) {
            console.error('❌ Błąd opłacania raty:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // PŁATNOŚĆ GOTÓWKĄ
    // =====================================
    async payWithCash(paymentId) {
        const modal = this.createModal('payCashModal', `
            <div style="max-width: 500px; margin: 0 auto;">
                <h2 style="margin-bottom: 20px; color: #1a2332; font-weight: 700;">💵 Rejestracja płatności gotówką</h2>
                
                <form id="payCashForm" onsubmit="paymentsModule.submitCashPayment(${paymentId}, event); return false;">
                    <div class="form-group">
                        <label style="font-weight: 600; color: #2c3e50; margin-bottom: 8px; display: block;">Numer paragonu / pokwitowania *</label>
                        <input type="text" name="cash_receipt_number" required 
                               placeholder="PAR/2025/001"
                               style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; font-weight: 600; color: #1a2332;">
                    </div>

                    <div class="form-group" style="margin-top: 15px;">
                        <label style="font-weight: 600; color: #2c3e50; margin-bottom: 8px; display: block;">Notatka</label>
                        <textarea name="note" rows="3" 
                                  placeholder="Dodatkowe informacje..."
                                  style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 4px; color: #1a2332;"></textarea>
                    </div>

                    <div class="form-group" style="margin-top: 15px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" name="add_to_balance" value="1" style="cursor: pointer; width: 18px; height: 18px;">
                            <span style="font-weight: 600; color: #1a2332;">💰 Dodaj do salda klienta po opłaceniu</span>
                        </label>
                        <small style="display: block; color: #64748b; margin-top: 5px; margin-left: 26px; font-weight: 600;">
                            Jeśli zaznaczone, kwota zostanie dodana do salda klienta (prepaid)
                        </small>
                    </div>

                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                        <div style="font-weight: 700; color: #92400e; margin-bottom: 5px;">⚠️ Uwaga</div>
                        <div style="color: #1a2332; font-size: 0.9rem; font-weight: 600;">
                            Upewnij się, że otrzymałeś płatność gotówką i wydałeś paragon/pokwitowanie przed potwierdzeniem.
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn-primary" style="flex: 1;">
                            ✅ Potwierdź wpłatę
                        </button>
                        <button type="button" onclick="paymentsModule.closeModal('payCashModal')" class="btn-secondary" style="flex: 1;">
                            ❌ Anuluj
                        </button>
                    </div>
                </form>
            </div>
        `);

        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    async submitCashPayment(paymentId, event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        try {
            const response = await api.request(`/payments/${paymentId}/pay-cash`, {
                method: 'POST',
                body: JSON.stringify({
                    cash_receipt_number: formData.get('cash_receipt_number'),
                    note: formData.get('note'),
                    add_to_balance: formData.get('add_to_balance') === '1'
                })
            });

            if (response.success) {
                this.closeModal('payCashModal');
                this.closeModal('paymentDetailsModal');
                alert('✅ Płatność gotówką zarejestrowana!');
                await this.renderPaymentsTab(this.currentCaseId);
            }
        } catch (error) {
            console.error('Błąd rejestracji płatności:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // PŁATNOŚĆ KRYPTOWALUTĄ
    // =====================================
    async payWithCrypto(paymentId) {
        const payments = await api.request(`/payments/case/${this.currentCaseId}`);
        const payment = payments.payments.find(p => p.id === paymentId);

        const modal = this.createModal('payCryptoModal', `
            <div style="max-width: 600px; margin: 0 auto;">
                <h2 style="margin-bottom: 20px;">₿ Rejestracja płatności kryptowalutą</h2>
                
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px; color: white; margin-bottom: 20px; text-align: center;">
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">Kwota do zapłaty</div>
                    <div style="font-size: 2.5rem; font-weight: 700;">${parseFloat(payment.amount).toFixed(2)} PLN</div>
                    ${payment.crypto_currency ? `
                        <div style="font-size: 1rem; opacity: 0.9; margin-top: 10px;">Waluta: ${payment.crypto_currency}</div>
                    ` : ''}
                </div>

                ${payment.crypto_wallet_address ? `
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <div style="font-weight: 600; margin-bottom: 10px;">📍 Adres portfela:</div>
                        <div style="font-family: monospace; word-break: break-all; background: white; padding: 10px; border-radius: 4px; font-size: 0.9rem;">
                            ${payment.crypto_wallet_address}
                        </div>
                        <button onclick="navigator.clipboard.writeText('${payment.crypto_wallet_address}')" 
                                style="margin-top: 10px; padding: 8px 16px; background: #3B82F6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            📋 Kopiuj adres
                        </button>
                    </div>
                ` : ''}

                <form id="payCryptoForm" onsubmit="paymentsModule.submitCryptoPayment(${paymentId}, event); return false;">
                    <div class="form-group">
                        <label>Waluta krypto *</label>
                        <select name="crypto_currency" required 
                                style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="BTC" ${payment.crypto_currency === 'BTC' ? 'selected' : ''}>₿ Bitcoin (BTC)</option>
                            <option value="ETH" ${payment.crypto_currency === 'ETH' ? 'selected' : ''}>Ξ Ethereum (ETH)</option>
                            <option value="USDT" ${payment.crypto_currency === 'USDT' ? 'selected' : ''}>₮ Tether (USDT)</option>
                            <option value="BNB" ${payment.crypto_currency === 'BNB' ? 'selected' : ''}>🔶 Binance Coin (BNB)</option>
                            <option value="USDC" ${payment.crypto_currency === 'USDC' ? 'selected' : ''}>🔵 USD Coin (USDC)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Kwota w kryptowalucie *</label>
                        <input type="text" name="crypto_amount" required 
                               placeholder="0.00123456"
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace;">
                        <small style="color: #999;">Ile klient przelał (w wybranej walucie)</small>
                    </div>

                    <div class="form-group">
                        <label>Transaction Hash (TX) *</label>
                        <input type="text" name="crypto_transaction_hash" required 
                               placeholder="0x123abc..."
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace;">
                        <small style="color: #999;">Hash transakcji z blockchain</small>
                    </div>

                    <div class="form-group">
                        <label>Notatka</label>
                        <textarea name="note" rows="2" 
                                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                    </div>

                    <div style="background: #F8FAFC; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #3B82F6;">
                        <div style="font-weight: 600; color: #1565c0; margin-bottom: 5px;">ℹ️ Weryfikacja</div>
                        <div style="color: #1565c0; font-size: 0.9rem;">
                            Sprawdź transakcję w blockchain explorer przed potwierdzeniem!
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn-primary" style="flex: 1;">
                            ✅ Potwierdź płatność
                        </button>
                        <button type="button" onclick="paymentsModule.closeModal('payCryptoModal')" class="btn-secondary" style="flex: 1;">
                            ❌ Anuluj
                        </button>
                    </div>
                </form>
            </div>
        `);

        document.body.appendChild(modal);
        modal.classList.add('active');
    }

    async submitCryptoPayment(paymentId, event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        try {
            const response = await api.request(`/payments/${paymentId}/pay-crypto`, {
                method: 'POST',
                body: JSON.stringify({
                    crypto_currency: formData.get('crypto_currency'),
                    crypto_amount: formData.get('crypto_amount'),
                    crypto_transaction_hash: formData.get('crypto_transaction_hash'),
                    note: formData.get('note')
                })
            });

            if (response.success) {
                this.closeModal('payCryptoModal');
                this.closeModal('paymentDetailsModal');
                alert('✅ Płatność kryptowalutą zarejestrowana!');
                await this.renderPaymentsTab(this.currentCaseId);
            }
        } catch (error) {
            console.error('Błąd rejestracji płatności:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // SALDO KLIENTA
    // =====================================
    async viewClientBalance(clientId) {
        try {
            const response = await api.request(`/payments/balance/${clientId}`);
            const { balance, transactions } = response;

            const modal = this.createModal('clientBalanceModal', `
                <div style="max-width: 700px; margin: 0 auto;">
                    <h2 style="margin-bottom: 20px;">💰 Saldo klienta</h2>
                    
                    <div style="background: #3B82F6; padding: 30px; border-radius: 12px; color: white; text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">Dostępne saldo</div>
                        <div style="font-size: 3rem; font-weight: 700;">${parseFloat(balance.balance || 0).toFixed(2)} ${balance.currency || 'PLN'}</div>
                    </div>

                    <h3 style="margin-bottom: 15px;">📜 Historia transakcji</h3>
                    
                    ${transactions.length === 0 ? `
                        <div style="text-align: center; padding: 40px; color: #999;">
                            Brak transakcji
                        </div>
                    ` : `
                        <div style="max-height: 400px; overflow-y: auto;">
                            ${transactions.map(t => `
                                <div style="background: white; border-left: 4px solid ${t.transaction_type === 'credit' ? '#3B82F6' : '#3B82F6'}; padding: 15px; margin-bottom: 10px; border-radius: 4px;">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
                                        <div>
                                            <span style="font-weight: 600; color: ${t.transaction_type === 'credit' ? '#3B82F6' : '#3B82F6'};">
                                                ${t.transaction_type === 'credit' ? '➕' : '➖'} ${parseFloat(t.amount).toFixed(2)} PLN
                                            </span>
                                        </div>
                                        <span style="color: #7f8c8d; font-size: 0.9rem;">
                                            ${new Date(t.created_at).toLocaleDateString('pl-PL')}
                                        </span>
                                    </div>
                                    ${t.description ? `<div style="color: #666; font-size: 0.9rem; margin-bottom: 5px;">${this.escapeHtml(t.description)}</div>` : ''}
                                    <div style="color: #999; font-size: 0.85rem;">
                                        Saldo: ${parseFloat(t.balance_before).toFixed(2)} → ${parseFloat(t.balance_after).toFixed(2)} PLN
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}

                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="paymentsModule.closeModal('clientBalanceModal')" class="btn-secondary">
                            ❌ Zamknij
                        </button>
                    </div>
                </div>
            `);

            document.body.appendChild(modal);
            modal.classList.add('active');
        } catch (error) {
            console.error('Błąd pobierania salda:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    async payWithBalance(paymentId) {
        const confirmed = confirm('💰 Czy na pewno chcesz opłacić tę płatność ze salda?\n\nKwota zostanie automatycznie pobrana z salda klienta.');
        if (!confirmed) return;

        try {
            const response = await api.request(`/payments/${paymentId}/pay-with-balance`, {
                method: 'POST'
            });

            if (response.success) {
                this.closeModal('paymentDetailsModal');
                alert(`✅ Płatność opłacona ze salda!\n\nPobrano: ${response.amount} PLN\nNowe saldo: ${response.new_balance} PLN`);
                await this.renderPaymentsTab(this.currentCaseId);
            }
        } catch (error) {
            console.error('❌ Błąd płatności ze salda:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // RĘCZNE POTWIERDZENIE OPŁATY (ADMIN/FINANCE)
    // =====================================
    async showConfirmPaymentForm(paymentId) {
        const payments = await api.request(`/payments/case/${this.currentCaseId}`);
        const payment = payments.payments.find(p => p.id === paymentId);

        const modal = this.createModal('confirmPaymentModal', `
            <div style="max-width: 600px; margin: 0 auto;">
                <h2 style="margin-bottom: 20px;">✅ Potwierdź opłatę</h2>
                
                <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 20px; border-radius: 12px; color: white; margin-bottom: 20px; text-align: center;">
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 5px;">Kwota płatności</div>
                    <div style="font-size: 2.5rem; font-weight: 700;">${parseFloat(payment.amount).toFixed(2)} PLN</div>
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 10px;">Kod: ${this.escapeHtml(payment.payment_code)}</div>
                </div>

                <form id="confirmPaymentForm" onsubmit="paymentsModule.submitConfirmPayment(${paymentId}, event); return false;">
                    <div class="form-group">
                        <label>Metoda płatności *</label>
                        <select name="payment_method" required 
                                style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Wybierz...</option>
                            <option value="card">💳 Karta płatnicza</option>
                            <option value="paypal">💰 PayPal</option>
                            <option value="bank_transfer">🏦 Przelew bankowy</option>
                            <option value="blik">📱 BLIK</option>
                            <option value="cash">💵 Gotówka</option>
                            <option value="crypto">₿ Kryptowaluta</option>
                            <option value="other">📋 Inna</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Numer referencyjny / ID transakcji</label>
                        <input type="text" name="payment_reference" 
                               placeholder="Np. numer przelewu, ID PayPal, numer paragonu..."
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;">
                        <small style="color: #999;">Opcjonalnie - dowolny identyfikator potwierdzający płatność</small>
                    </div>

                    <div class="form-group">
                        <label>Notatka</label>
                        <textarea name="note" rows="3" 
                                  placeholder="Dodatkowe informacje o płatności..."
                                  style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
                    </div>

                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 8px;">
                            📎 Załącz potwierdzenie płatności (opcjonalnie)
                        </label>
                        <input type="file" name="confirmation_file" id="confirmationFileInput" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">
                        <small style="color: #999; display: block; margin-top: 5px;">
                            Dozwolone: PDF, JPG, PNG, DOC, DOCX (max 10MB)
                        </small>
                        <div id="filePreview" style="margin-top: 10px; display: none;">
                            <div style="background: #e8f5e9; padding: 10px; border-radius: 4px; border-left: 4px solid #4caf50;">
                                <strong style="color: #2e7d32;">✅ Wybrano plik:</strong>
                                <div id="fileName" style="color: #1b5e20; margin-top: 5px; font-family: monospace;"></div>
                            </div>
                        </div>
                    </div>

                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
                        <div style="font-weight: 600; color: #856404; margin-bottom: 5px;">⚠️ Uwaga</div>
                        <div style="color: #856404; font-size: 0.9rem;">
                            Potwierdzenie płatności oznacza jej akceptację jako opłaconej. Upewnij się, że środki faktycznie wpłynęły na konto.
                        </div>
                    </div>

                    <div style="display: flex; gap: 10px;">
                        <button type="submit" class="btn-success" style="flex: 1; background: linear-gradient(135deg, #2ecc71, #27ae60); padding: 12px; border: none; border-radius: 8px; color: white; font-weight: 600; cursor: pointer;">
                            ✅ Potwierdź płatność
                        </button>
                        <button type="button" onclick="paymentsModule.closeModal('confirmPaymentModal')" class="btn-secondary" style="flex: 1; background: #e0e0e0; padding: 12px; border: none; border-radius: 8px; cursor: pointer;">
                            ❌ Anuluj
                        </button>
                    </div>
                </form>
            </div>
        `);

        document.body.appendChild(modal);
        modal.classList.add('active');
        
        // Dodaj event listener dla podglądu pliku
        const fileInput = document.getElementById('confirmationFileInput');
        const filePreview = document.getElementById('filePreview');
        const fileName = document.getElementById('fileName');
        
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                fileName.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                filePreview.style.display = 'block';
            } else {
                filePreview.style.display = 'none';
            }
        });
    }

    async submitConfirmPayment(paymentId, event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const file = formData.get('confirmation_file');
        
        try {
            let response;
            
            // Jeśli jest plik, użyj endpoint z uploadem
            if (file && file.size > 0) {
                console.log('📎 Wysyłanie z plikiem:', file.name);
                
                // Użyj FormData bezpośrednio (nie JSON.stringify)
                const uploadData = new FormData();
                uploadData.append('file', file);
                uploadData.append('payment_method', formData.get('payment_method'));
                uploadData.append('payment_reference', formData.get('payment_reference') || '');
                uploadData.append('note', formData.get('note') || '');
                
                response = await fetch(`/api/payments/${paymentId}/upload-confirmation`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                        // NIE dodawaj Content-Type - przeglądarka ustawi automatycznie z boundary
                    },
                    body: uploadData
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Błąd uploadu pliku');
                }
                
                response = await response.json();
            } else {
                // Bez pliku - normalny endpoint
                console.log('📝 Wysyłanie bez pliku');
                response = await api.request(`/payments/${paymentId}/confirm-paid`, {
                    method: 'POST',
                    body: JSON.stringify({
                        payment_method: formData.get('payment_method'),
                        payment_reference: formData.get('payment_reference'),
                        note: formData.get('note')
                    })
                });
            }

            if (response.success) {
                this.closeModal('confirmPaymentModal');
                this.closeModal('paymentDetailsModal');
                
                let message = `✅ Płatność potwierdzona!\n\nKwota: ${response.amount} PLN\nMetoda: ${response.payment_method}`;
                if (response.file_name) {
                    message += `\n\n📎 Załączono plik:\n${response.file_name}`;
                }
                
                alert(message);
                await this.renderPaymentsTab(this.currentCaseId);
            }
        } catch (error) {
            console.error('❌ Błąd potwierdzania płatności:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    // =====================================
    // POMOCNICZE - ŁADOWANIE PŁATNOŚCI
    // =====================================
    async loadPayments(caseId) {
        try {
            console.log('💰 Ładuję płatności dla sprawy:', caseId);
            
            // Użyj tylko normalnego endpointu z autoryzacją
            const response = await window.api.request(`/payments/case/${caseId}`);
            this.payments = response.payments || [];
            console.log('✅ Pobrano płatności:', this.payments.length);
        } catch (error) {
            console.error('❌ Błąd ładowania płatności:', error);
            this.payments = [];
        }
    }

    async viewPaymentHistory(paymentId) {
        try {
            const response = await window.api.request(`/payments/${paymentId}/history`);
            const history = response.history || [];

            const modal = this.createModal('paymentHistoryModal', `
                <div style="max-width: 600px; margin: 0 auto;">
                    <h2 style="margin-bottom: 20px;">📜 Historia płatności</h2>
                    
                    ${history.length === 0 ? `
                        <div style="text-align: center; padding: 40px; color: #999;">
                            Brak historii zmian
                        </div>
                    ` : `
                        <div style="max-height: 400px; overflow-y: auto;">
                            ${history.map(h => {
                                // Zamień nazwę pliku na klikalny link
                                let noteHtml = '';
                                if (h.note) {
                                    let note = this.escapeHtml(h.note);
                                    // Znajdź wzorzec "Opłacono z załączonym plikiem: [nazwa_pliku]"
                                    const fileMatch = note.match(/Opłacono z załączonym plikiem: ([^.]+\.\w+)/);
                                    if (fileMatch) {
                                        const fileName = fileMatch[1];
                                        // Znajdź pełną ścieżkę pliku z payment_history
                                        note = note.replace(
                                            fileMatch[0],
                                            `Opłacono z załączonym plikiem: <a href="/uploads/payment-confirmations/${fileName}" target="_blank" style="color: #3B82F6; text-decoration: underline; font-weight: 600;">📎 ${fileName}</a>`
                                        );
                                    }
                                    noteHtml = `<div style="color: #666; font-size: 0.9rem; line-height: 1.6;">${note}</div>`;
                                }
                                
                                return `
                                    <div style="background: white; border-left: 4px solid #3B82F6; padding: 15px; margin-bottom: 10px; border-radius: 4px;">
                                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                            <span style="font-weight: 600;">${h.old_status || 'N/A'} → ${h.new_status}</span>
                                            <span style="color: #7f8c8d; font-size: 0.9rem;">${new Date(h.changed_at).toLocaleString('pl-PL')}</span>
                                        </div>
                                        ${noteHtml}
                                        <div style="color: #999; font-size: 0.85rem; margin-top: 5px;">
                                            <strong>Zmienił:</strong> ${this.escapeHtml(h.changed_by_name || 'Nieznany użytkownik')}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    `}

                    <div style="text-align: center; margin-top: 20px;">
                        <button onclick="paymentsModule.closeModal('paymentHistoryModal')" class="btn-secondary">
                            ❌ Zamknij
                        </button>
                    </div>
                </div>
            `);

            document.body.appendChild(modal);
            modal.classList.add('active');
        } catch (error) {
            console.error('Błąd pobierania historii:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }

    createModal(id, content) {
        const modal = document.createElement('div');
        modal.id = id;
        modal.className = 'modal';
        modal.style.cssText = 'animation: none !important;'; // Wyłącz domyślną animację
        modal.innerHTML = `
            <div class="modal-content" style="max-height: 90vh; overflow-y: auto; opacity: 0; transform: scale(0.95); transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);">
                ${content}
            </div>
        `;
        
        // Płynne pojawienie się po dodaniu do DOM
        requestAnimationFrame(() => {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            }
        });
        
        return modal;
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =====================================
    // WYSYŁANIE PRZYPOMNIENIA O PŁATNOŚCI
    // =====================================
    async sendPaymentReminder(paymentId) {
        const confirmed = confirm('📧 Wysłać przypomnienie o płatności do klienta?\n\nKlient otrzyma:\n• Email z przypomnieniem\n• Powiadomienie w aplikacji');
        
        if (!confirmed) return;

        try {
            const response = await api.request(`/payments/${paymentId}/send-reminder`, {
                method: 'POST'
            });

            if (response.success) {
                alert(`✅ Przypomnienie wysłane!\n\n📧 Email: ${response.email_sent ? 'TAK' : 'NIE'}\n🔔 Powiadomienie: ${response.notification_sent ? 'TAK' : 'NIE'}`);
                await this.renderPaymentsTab(this.currentCaseId);
            }
        } catch (error) {
            console.error('❌ Błąd wysyłania przypomnienia:', error);
            alert('❌ Błąd: ' + error.message);
        }
    }
}

// Utwórz globalną instancję
const paymentsModule = new PaymentsModule();
window.paymentsModule = paymentsModule;

console.log('✅ Payments Module v1.0 załadowany - PayPal Integration ready! 💰');

