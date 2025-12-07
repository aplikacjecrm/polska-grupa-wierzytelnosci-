class MailManager {
    constructor() {
        this.accounts = [];
        this.currentAccount = null;
        this.messages = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('addAccountBtn').addEventListener('click', () => {
            this.showAddAccountModal();
        });

        document.getElementById('addAccountForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.addAccount();
        });

        document.getElementById('newMailBtn').addEventListener('click', () => {
            this.showNewMailModal();
        });

        document.getElementById('newMailForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.sendMail();
        });

        document.getElementById('refreshMailBtn').addEventListener('click', () => {
            if (this.currentAccount) {
                this.loadMessages(this.currentAccount.id);
            }
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').classList.remove('active');
            });
        });

        // Close modal on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    async loadAccounts() {
        try {
            const response = await api.getMailAccounts();
            this.accounts = response.accounts || [];
            this.renderAccounts();
        } catch (error) {
            console.error('Błąd ładowania kont:', error);
        }
    }

    renderAccounts() {
        const container = document.getElementById('accountsList');
        
        if (this.accounts.length === 0) {
            container.innerHTML = '<p style="color: #95a5a6; font-size: 0.9rem;">Brak kont pocztowych</p>';
            return;
        }

        container.innerHTML = this.accounts.map(account => `
            <div class="account-item" data-id="${account.id}">
                <div style="font-weight: 600; margin-bottom: 3px;">${account.email}</div>
                <div style="font-size: 0.85rem; color: #7f8c8d;">${account.imap_host}</div>
            </div>
        `).join('');

        // Event listeners
        container.querySelectorAll('.account-item').forEach(item => {
            item.addEventListener('click', () => {
                const accountId = parseInt(item.dataset.id);
                this.selectAccount(accountId);
            });
        });
    }

    async selectAccount(accountId) {
        this.currentAccount = this.accounts.find(a => a.id === accountId);
        
        // Update UI
        document.querySelectorAll('.account-item').forEach(item => {
            item.classList.toggle('active', parseInt(item.dataset.id) === accountId);
        });

        await this.loadMessages(accountId);
    }

    async loadMessages(accountId) {
        try {
            const container = document.getElementById('mailMessages');
            container.innerHTML = '<div style="padding: 20px; text-align: center;">⏳ Ładowanie...</div>';

            const response = await api.getMessages(accountId);
            this.messages = response.messages || [];
            
            this.renderMessages();
        } catch (error) {
            console.error('Błąd ładowania wiadomości:', error);
            document.getElementById('mailMessages').innerHTML = `
                <div style="padding: 20px; text-align: center; color: #3B82F6;">
                    ❌ Błąd ładowania wiadomości
                </div>
            `;
        }
    }

    renderMessages() {
        const container = document.getElementById('mailMessages');
        
        if (this.messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📭</span>
                    <p>Brak wiadomości</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.messages.map(msg => `
            <div class="message-item" data-id="${msg.id}">
                <div class="message-from">${this.escapeHtml(msg.from || 'Nieznany')}</div>
                <div class="message-subject">${this.escapeHtml(msg.subject || '(Brak tematu)')}</div>
                <div class="message-preview">${this.escapeHtml(msg.text?.substring(0, 100) || '')}</div>
                <div style="font-size: 0.8rem; color: #95a5a6; margin-top: 5px;">
                    ${this.formatDate(msg.date)}
                </div>
            </div>
        `).join('');

        // Event listeners
        container.querySelectorAll('.message-item').forEach(item => {
            item.addEventListener('click', () => {
                const msgId = parseInt(item.dataset.id);
                this.showMessage(msgId);
            });
        });
    }

    showMessage(msgId) {
        const message = this.messages.find(m => m.id === msgId);
        if (!message) return;

        const container = document.getElementById('mailPreview');
        
        container.innerHTML = `
            <div style="padding: 20px;">
                <h3 style="color: var(--text-dark); margin-bottom: 15px;">
                    ${this.escapeHtml(message.subject || '(Brak tematu)')}
                </h3>
                <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid var(--border);">
                    <div style="margin-bottom: 8px;">
                        <strong>Od:</strong> ${this.escapeHtml(message.from || 'Nieznany')}
                    </div>
                    <div style="margin-bottom: 8px;">
                        <strong>Do:</strong> ${this.escapeHtml(message.to || '')}
                    </div>
                    <div style="color: #7f8c8d; font-size: 0.9rem;">
                        ${this.formatDate(message.date)}
                    </div>
                </div>
                <div style="line-height: 1.6; color: var(--text-dark);">
                    ${message.html || this.escapeHtml(message.text || '').replace(/\n/g, '<br>')}
                </div>
                ${message.attachments && message.attachments.length > 0 ? `
                    <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid var(--border);">
                        <strong>Załączniki (${message.attachments.length}):</strong>
                        <ul style="margin-top: 10px;">
                            ${message.attachments.map(att => `
                                <li>${this.escapeHtml(att.filename)} (${this.formatBytes(att.size)})</li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    showAddAccountModal() {
        document.getElementById('addAccountModal').classList.add('active');
    }

    async addAccount() {
        const accountData = {
            email: document.getElementById('accountEmail').value,
            password: document.getElementById('accountPassword').value,
            imapHost: document.getElementById('accountImapHost').value,
            imapPort: parseInt(document.getElementById('accountImapPort').value),
            smtpHost: document.getElementById('accountSmtpHost').value,
            smtpPort: parseInt(document.getElementById('accountSmtpPort').value)
        };

        try {
            await api.addMailAccount(accountData);
            document.getElementById('addAccountModal').classList.remove('active');
            document.getElementById('addAccountForm').reset();
            await this.loadAccounts();
        } catch (error) {
            alert('Błąd dodawania konta: ' + error.message);
        }
    }

    showNewMailModal() {
        if (!this.currentAccount) {
            alert('Najpierw wybierz konto pocztowe');
            return;
        }
        document.getElementById('newMailModal').classList.add('active');
    }

    async sendMail() {
        if (!this.currentAccount) {
            alert('Brak wybranego konta');
            return;
        }

        const mailData = {
            accountId: this.currentAccount.id,
            to: document.getElementById('mailTo').value,
            subject: document.getElementById('mailSubject').value,
            text: document.getElementById('mailBody').value
        };

        try {
            await api.sendMail(mailData);
            document.getElementById('newMailModal').classList.remove('active');
            document.getElementById('newMailForm').reset();
            alert('✅ Wiadomość wysłana!');
        } catch (error) {
            alert('Błąd wysyłania: ' + error.message);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleString('pl-PL');
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

const mailManager = new MailManager();
window.mailManager = mailManager;
