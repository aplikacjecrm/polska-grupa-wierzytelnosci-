// Zabezpieczenie przed duplikacją
if (window.ChatManager) {
    console.warn('⚠️ ChatManager already exists - skipping redefinition');
} else {
    window.ChatManager = class ChatManager {
        constructor() {
            this.users = [];
            this.currentUser = null;
            this.messages = [];
        this.typingTimeout = null;
        this.setupEventListeners();
        this.setupSocketListeners();
    }

    setupEventListeners() {
        const messageInput = document.getElementById('messageInput');
        const sendBtn = document.getElementById('sendBtn');
        
        // Sprawdź czy elementy istnieją
        if (!messageInput || !sendBtn) {
            console.warn('⚠️ Chat elements not found yet - skipping setup');
            return;
        }
        
        // ZABEZPIECZENIE: Usuń stare listenery jeśli istnieją
        if (this._listeners) {
            console.log('🔄 Usuwam stare event listeners...');
            messageInput.removeEventListener('input', this._listeners.input);
            messageInput.removeEventListener('keypress', this._listeners.keypress);
            sendBtn.removeEventListener('click', this._listeners.sendClick);
            const attachBtn = document.getElementById('attachBtn');
            if (attachBtn && this._listeners.attachClick) {
                attachBtn.removeEventListener('click', this._listeners.attachClick);
            }
            const userSearch = document.getElementById('userSearch');
            if (userSearch && this._listeners.userSearch) {
                userSearch.removeEventListener('input', this._listeners.userSearch);
            }
        }
        
        // Przechowuj referencje do listenerów
        this._listeners = {};
        
        // Podpowiedzi po wpisaniu "/" lub "@"
        this._listeners.input = (e) => {
            const text = e.target.value;
            const cursorPos = e.target.selectionStart;
            const textBeforeCursor = text.substring(0, cursorPos);
            const words = textBeforeCursor.split(/\s/);
            const lastWord = words[words.length - 1];
            
            console.log('💬 Input event:', text, 'lastWord:', lastWord);
            
            // Wykrywanie @mentions
            if (lastWord.startsWith('@')) {
                console.log('✅ Wykryto @mention');
                const query = lastWord.substring(1); // Usuń @
                this.showUserMentions(query, e.target, cursorPos);
                this.hideSlashSuggestions();
            }
            // Wykrywanie slash commands
            else if (lastWord.startsWith('/')) {
                console.log('✅ Wykryto slash command, wywołuję showSlashSuggestions');
                this.showSlashSuggestions(lastWord, e.target);
                this.hideMentionsDropdown();
            } else {
                this.hideSlashSuggestions();
                this.hideMentionsDropdown();
            }
        };

        this._listeners.keypress = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.hideSlashSuggestions();
                this.hideMentionsDropdown();
                this.sendMessage();
                return;
            }

            // Typing indicator
            if (this.currentUser) {
                socketManager.typing(this.currentUser.id, true);
                
                clearTimeout(this.typingTimeout);
                this.typingTimeout = setTimeout(() => {
                    socketManager.typing(this.currentUser.id, false);
                }, 1000);
            }
        };

        this._listeners.sendClick = () => {
            this.sendMessage();
        };

        this._listeners.attachClick = () => {
            this.showAttachmentDialog();
        };

        this._listeners.userSearch = (e) => {
            this.filterUsers(e.target.value);
        };

        // Dodaj event listenery
        messageInput.addEventListener('input', this._listeners.input);
        messageInput.addEventListener('keypress', this._listeners.keypress);
        sendBtn.addEventListener('click', this._listeners.sendClick);
        
        const attachBtn = document.getElementById('attachBtn');
        if (attachBtn) {
            attachBtn.addEventListener('click', this._listeners.attachClick);
        }

        const userSearch = document.getElementById('userSearch');
        if (userSearch) {
            userSearch.addEventListener('input', this._listeners.userSearch);
        }
    }

    setupSocketListeners() {
        // ZABEZPIECZENIE: Usuń stare listenery przed dodaniem nowych
        console.log('🔌 Czyszczę i dodaję socket listenery...');
        
        // Wyczyść wszystkie stare listenery dla chat (ustaw pustą tablicę)
        if (socketManager.listeners['new-chat-message']) {
            console.log('🧹 Czyszczę', socketManager.listeners['new-chat-message'].length, 'starych listenerów new-chat-message');
            socketManager.listeners['new-chat-message'] = [];
        }
        if (socketManager.listeners['user-status-changed']) {
            console.log('🧹 Czyszczę', socketManager.listeners['user-status-changed'].length, 'starych listenerów user-status-changed');
            socketManager.listeners['user-status-changed'] = [];
        }
        if (socketManager.listeners['user-typing']) {
            console.log('🧹 Czyszczę', socketManager.listeners['user-typing'].length, 'starych listenerów user-typing');
            socketManager.listeners['user-typing'] = [];
        }
        
        console.log('✅ Stare listenery wyczyszczone');
        console.log('➕ Dodaję nowe listenery...');
        
        socketManager.on('new-chat-message', async (message) => {
            console.log('📨 Otrzymano wiadomość:', {
                message: message.message,
                id: message.id,
                sender_id: message.sender_id,
                receiver_id: message.receiver_id
            });
            
            const myUserId = Number(window.authManager?.currentUser?.id);
            const currentChatUserId = Number(this.currentUser?.id);
            const msgSenderId = Number(message.sender_id);
            const msgReceiverId = Number(message.receiver_id);
            
            console.log('🔍 Sprawdzam:', {
                myUserId,
                currentChatUserId,
                msgSenderId,
                msgReceiverId
            });
            
            // Jeśli wiadomość dotyczy aktualnie otwartego czatu
            // PRZYPADEK 1: Otrzymuję wiadomość od osoby z którą rozmawiam
            // PRZYPADEK 2: Wysłałem wiadomość do osoby z którą rozmawiam
            if (currentChatUserId && myUserId) {
                const isIncomingFromCurrentChat = 
                    msgSenderId === currentChatUserId && msgReceiverId === myUserId;
                const isOutgoingToCurrentChat = 
                    msgSenderId === myUserId && msgReceiverId === currentChatUserId;
                
                if (isIncomingFromCurrentChat || isOutgoingToCurrentChat) {
                    console.log('✅ Wiadomość należy do tego czatu! Odświeżam...');
                    // AUTO-ODŚWIEŻENIE: Pobierz wszystkie wiadomości z bazy
                    await this.loadMessages();
                    this.scrollToBottom();
                    
                    // Oznacz jako przeczytane (tylko przychodzące)
                    if (isIncomingFromCurrentChat) {
                        socketManager.markAsRead(msgSenderId);
                    }
                } else {
                    console.log('ℹ️ Wiadomość z innego czatu, aktualizuję badge');
                    // Aktualizuj badge nieprzeczytanych
                    this.updateUnreadBadge();
                }
            } else {
                // Aktualizuj badge nieprzeczytanych
                this.updateUnreadBadge();
            }
        });

        socketManager.on('user-status-changed', (data) => {
            const user = this.users.find(u => u.id === data.userId);
            if (user) {
                user.status = data.status;
                this.renderUsers();
                
                if (this.currentUser && this.currentUser.id === data.userId) {
                    this.updateChatHeader();
                }
            }
        });

        socketManager.on('user-typing', (data) => {
            if (this.currentUser && data.userId === this.currentUser.id) {
                this.showTypingIndicator(data.isTyping);
            }
        });

        socketManager.on('message-sent', (message) => {
            this.messages.push(message);
            this.renderMessages();
            this.scrollToBottom();
        });

        socketManager.on('new-chat-message', (message) => {
            console.log('📬 Nowa wiadomość:', message);
            
            // Jeśli wiadomość jest do/od aktualnie otwartego czatu
            if (this.currentUser && 
                (message.sender_id === this.currentUser.id || message.receiver_id === this.currentUser.id)) {
                this.messages.push(message);
                this.renderMessages();
                this.scrollToBottom();
            }
            
            // Pokaż notyfikację banner
            this.showNotificationBanner(message);
            
            // Przesuń użytkownika na górę listy
            this.moveUserToTop(message.sender_id);
            
            // Odśwież badge nieprzeczytanych
            this.updateUnreadBadge();
        });
    }

    async loadUsers() {
        try {
            const response = await api.getUsers();
            this.users = response.users || [];
            this.renderUsers();
            this.updateUnreadBadge();
        } catch (error) {
            console.error('Błąd ładowania użytkowników:', error);
        }
    }

    renderUsers() {
        const container = document.getElementById('usersList');
        
        if (this.users.length === 0) {
            container.innerHTML = '<p style="color: #95a5a6; font-size: 0.9rem;">Brak użytkowników</p>';
            return;
        }

        container.innerHTML = this.users.map(user => {
            const initials = user.name
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase();

            return `
                <div class="user-item ${this.currentUser?.id === user.id ? 'active' : ''}" data-id="${user.id}">
                    <div class="user-avatar">
                        <span>${initials}</span>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: ${this.currentUser?.id === user.id ? 'white' : 'var(--text-dark)'};">
                            ${this.escapeHtml(user.name)}
                        </div>
                        <div style="font-size: 0.85rem; color: ${this.currentUser?.id === user.id ? 'rgba(255,255,255,0.8)' : '#7f8c8d'};">
                            <span class="status-dot ${user.status}"></span>
                            ${user.status === 'online' ? 'Online' : 'Offline'}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Event listeners
        container.querySelectorAll('.user-item').forEach(item => {
            item.addEventListener('click', () => {
                const userId = parseInt(item.dataset.id);
                this.selectUser(userId);
            });
        });
    }

    async selectUser(userId) {
        this.currentUser = this.users.find(u => u.id === userId);
        
        if (!this.currentUser) return;

        // Update UI
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.toggle('active', parseInt(item.dataset.id) === userId);
        });

        // Show chat interface
        document.getElementById('chatHeader').style.display = 'block';
        document.getElementById('chatInput').style.display = 'flex';

        this.updateChatHeader();
        await this.loadMessages();
        
        // Oznacz wiadomości jako przeczytane
        await api.markAsRead(userId);
        this.updateUnreadBadge();
        
        // AUTO-ODŚWIEŻANIE: Co 30 sekund synchronizuj z bazą
        if (this._refreshInterval) {
            clearInterval(this._refreshInterval);
        }
        
        this._refreshInterval = setInterval(async () => {
            if (this.currentUser && this.currentUser.id === userId) {
                // SPRAWDŹ czy jakieś wideo/audio jest odtwarzane
                const messagesList = document.getElementById('messagesList');
                const activeVideo = messagesList?.querySelector('video:not([paused])');
                const activeAudio = messagesList?.querySelector('audio:not([paused])');
                
                // NIE odświeżaj jeśli coś jest odtwarzane
                if (activeVideo || activeAudio) {
                    console.log('🎬 Pomijam odświeżanie - media są odtwarzane');
                    return;
                }
                
                // CICHE odświeżanie w tle - bez logów
                const currentScrollPos = messagesList?.scrollTop;
                const wasAtBottom = this.isScrolledToBottom();
                
                await this.loadMessages();
                
                // Zachowaj pozycję scrolla jeśli nie był na dole
                if (!wasAtBottom && currentScrollPos !== undefined) {
                    messagesList.scrollTop = currentScrollPos;
                }
            }
        }, 30000); // 30 sekund - backup w tle
    }
    
    isScrolledToBottom() {
        const container = document.getElementById('messagesList');
        if (!container) return true;
        return container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    }

    updateChatHeader() {
        if (!this.currentUser) return;

        const chatUsername = document.getElementById('chatUsername');
        if (chatUsername) {
            chatUsername.textContent = this.currentUser.name;
        }
    }

    async loadMessages() {
        if (!this.currentUser) return;

        try {
            const response = await api.getChatMessages(this.currentUser.id);
            this.messages = response.messages || [];
            this.renderMessages();
            this.scrollToBottom();
        } catch (error) {
            console.error('Błąd ładowania wiadomości:', error);
        }
    }

    async anonymizeRestrictedLinks(message) {
        // Zanonimizuj linki do klientów jeśli użytkownik nie ma dostępu
        // Format: <a href="#" onclick="...viewClient(123)...">👤 Jan Kowalski</a>
        
        // Regex do znajdowania linków do klientów
        const clientLinkRegex = /<a[^>]*onclick="[^"]*viewClient\((\d+)\)[^"]*"[^>]*>(👤\s*[^<]+)<\/a>/gi;
        
        // Znajdź wszystkie linki do klientów
        const matches = [...message.matchAll(clientLinkRegex)];
        
        console.log('🔍 Znaleziono linków do klientów:', matches.length);
        
        if (matches.length === 0) {
            return message; // Brak linków do klientów
        }
        
        // Sprawdź dostęp dla każdego klienta
        const accessChecks = await Promise.all(
            matches.map(async (match) => {
                const clientId = match[1];
                const fullText = match[2]; // "👤 Jan Kowalski"
                
                console.log('🔍 Sprawdzam dostęp do klienta:', clientId);
                
                try {
                    // Sprawdź dostęp przez API
                    await window.api.request(`/clients/${clientId}`);
                    console.log('✅ Ma dostęp do klienta:', clientId);
                    return { hasAccess: true, clientId, fullText };
                } catch (error) {
                    // Brak dostępu (403) lub błąd
                    console.log('❌ BRAK dostępu do klienta:', clientId, error.message);
                    return { hasAccess: false, clientId, fullText };
                }
            })
        );
        
        // Zamień linki w zależności od dostępu
        let result = message;
        matches.forEach((match, index) => {
            const check = accessChecks[index];
            console.log(`📋 Klient ${check.clientId}: hasAccess=${check.hasAccess}`);
            
            if (!check.hasAccess) {
                // Brak dostępu - zamień na kropki
                const anonymized = `<span style="color: #999; cursor: not-allowed; text-decoration: none; font-weight: 600;">👤 ••••••</span>`;
                console.log('🔒 Anonimizuję klienta:', check.clientId);
                result = result.replace(match[0], anonymized);
            } else {
                console.log('✅ Zostawiam oryginalny link dla klienta:', check.clientId);
            }
        });
        
        return result;
    }

    async renderMessages() {
        const container = document.getElementById('messagesList');
        
        if (!container) {
            console.warn('⚠️ messagesList container not found');
            return;
        }
        
        if (this.messages.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">💬</span>
                    <p>Brak wiadomości. Rozpocznij rozmowę!</p>
                </div>
            `;
            return;
        }

        // Przetwórz wiadomości asynchronicznie
        const processedMessages = await Promise.all(this.messages.map(async (msg) => {
            const msgSenderId = Number(msg.sender_id);
            const myUserId = Number(authManager.currentUser.id);
            const isSent = msgSenderId === myUserId;
            const time = new Date(msg.created_at).toLocaleTimeString('pl-PL', {
                hour: '2-digit',
                minute: '2-digit'
            });

            // Jeśli wiadomość zawiera HTML (linki), nie escapuj
            let messageContent = msg.message.includes('<a href') ? msg.message : this.escapeHtml(msg.message);
            
            // Zanonimizuj linki do klientów jeśli użytkownik nie ma dostępu
            messageContent = await this.anonymizeRestrictedLinks(messageContent);
            
            // Konwertuj @mentions na klikalne elementy
            messageContent = this.convertMentionsToLinks(messageContent);
            
            // OBSŁUGA WIADOMOŚCI GŁOSOWYCH
            let attachments = msg.attachments || [];
            if (typeof attachments === 'string') {
                try {
                    attachments = JSON.parse(attachments);
                } catch (e) {
                    attachments = [];
                }
            }
            
            // Sprawdź czy to wiadomość głosowa
            if (Array.isArray(attachments) && attachments.length > 0 && attachments[0].type === 'voice') {
                const audioData = attachments[0].data;
                messageContent = `
                    <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 12px; margin: 5px 0;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.5rem;">🎤</span>
                            <audio controls style="flex: 1; max-width: 250px; height: 32px;">
                                <source src="${audioData}" type="audio/webm">
                                <source src="${audioData}" type="audio/mp4">
                                Twoja przeglądarka nie obsługuje audio.
                            </audio>
                        </div>
                    </div>
                `;
            }
            
            // Sprawdź czy to wiadomość wideo
            else if (Array.isArray(attachments) && attachments.length > 0 && attachments[0].type === 'video') {
                const videoData = attachments[0].data;
                messageContent = `
                    <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 12px; margin: 5px 0;">
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span style="font-size: 1.5rem;">📹</span>
                                <span style="font-size: 0.9rem; color: rgba(255,255,255,0.7);">Wiadomość wideo</span>
                            </div>
                            <video controls style="width: 100%; max-width: 400px; border-radius: 8px;">
                                <source src="${videoData}" type="video/webm">
                                <source src="${videoData}" type="video/mp4">
                                Twoja przeglądarka nie obsługuje wideo.
                            </video>
                        </div>
                    </div>
                `;
            }
            
            // Jeśli to załącznik, dodaj przyciski podglądu i pobierania
            else if (msg.message.includes('📎 Załączniki:')) {
                let files = msg.attachments || [];
                
                // Jeśli attachments to string JSON, parsuj
                if (typeof files === 'string') {
                    try {
                        files = JSON.parse(files);
                    } catch (e) {
                        files = [];
                    }
                }
                
                if (Array.isArray(files) && files.length > 0) {
                    messageContent += '<div style="margin-top: 10px;">';
                    files.forEach((file, idx) => {
                        if (!file || !file.name) return; // Pomiń nieprawidłowe pliki
                        
                        const isPdf = file.name.toLowerCase().endsWith('.pdf');
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
                        
                        messageContent += `
                            <div style="background: rgba(255,255,255,0.1); padding: 8px; border-radius: 6px; margin: 5px 0; display: flex; gap: 10px; align-items: center;">
                                <span style="flex: 1;">${this.escapeHtml(file.name)}</span>
                                ${isImage ? `<button onclick="window.chatManager.previewFile(${msg.id}, ${idx})" style="padding: 4px 12px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">👁️ Podgląd</button>` : ''}
                                ${isPdf ? `<button onclick="window.chatManager.previewFile(${msg.id}, ${idx})" style="padding: 4px 12px; background: #e67e22; color: white; border: none; border-radius: 4px; cursor: pointer;">📄 Otwórz PDF</button>` : ''}
                                <button onclick="window.chatManager.downloadFile(${msg.id}, ${idx})" style="padding: 4px 12px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer;">⬇️ Pobierz</button>
                            </div>
                        `;
                    });
                    messageContent += '</div>';
                }
            }

            return `
                <div class="chat-message ${isSent ? 'sent' : 'received'}">
                    <div>${messageContent}</div>
                    <div class="message-time">${time}</div>
                </div>
            `;
        }));
        
        // Wyrenderuj przetworzone wiadomości
        container.innerHTML = processedMessages.join('');
        
        // Dodaj obsługę kliknięć na mentions
        container.querySelectorAll('.mention-link').forEach(mention => {
            mention.addEventListener('click', (e) => {
                const userId = parseInt(e.target.dataset.userId);
                const user = this.users.find(u => u.id === userId);
                if (user) {
                    console.log('🔵 Kliknięto mention użytkownika:', user.name);
                    this.selectUser(user);
                }
            });
        });
    }

    async sendMessage() {
        const now = Date.now();
        const input = document.getElementById('messageInput');
        let message = input.value.trim();
        
        // ZABEZPIECZENIE 1: Flaga wysyłania
        if (this._sending) {
            console.warn('⚠️ Wiadomość już jest wysyłana - pomijam');
            return;
        }
        
        // ZABEZPIECZENIE 2: Debouncing - ta sama treść w ciągu 1s
        if (this._lastMessage === message && (now - this._lastSendTime) < 1000) {
            console.warn('⚠️ Ta sama wiadomość w ciągu 1s - DUPLIKAT ZABLOKOWANY!');
            console.log('Ostatnia:', this._lastMessage, 'Czas:', now - this._lastSendTime, 'ms');
            return;
        }
        
        if (!this.currentUser) return;
        if (!message) return;
        
        this._sending = true; // Blokada
        this._lastMessage = message;
        this._lastSendTime = now;
        
        console.log('🚀 WYSYŁAM:', message, 'Timestamp:', now);

        // 🔥 SLASH COMMANDS - automatyczne linki
        message = this.processSlashCommands(message);

        try {
            // Wyślij przez API (sprawdzi uprawnienia)
            const response = await api.request('/chat/messages', {
                method: 'POST',
                body: JSON.stringify({
                    receiverId: this.currentUser.id,
                    message: message,
                    attachments: []
                })
            });
            
            if (response.success) {
                input.value = '';
                // AUTO-ODŚWIEŻENIE: Pobierz wszystkie wiadomości z bazy
                console.log('🔄 Auto-odświeżam po wysłaniu wiadomości...');
                await this.loadMessages();
                this.scrollToBottom();
                console.log('✅ Odświeżenie po wiadomości zakończone');
            }
        } catch (error) {
            console.error('Błąd wysyłania:', error);
            if (error.message && error.message.includes('Możesz pisać tylko')) {
                alert('🔒 ' + error.message);
            } else {
                alert('Błąd wysyłania wiadomości');
            }
        } finally {
            this._sending = false; // Odblokuj
            console.log('✅ Wysyłanie zakończone, odblokowano');
        }
        
        // Stop typing indicator
        socketManager.typing(this.currentUser.id, false);
    }

    processSlashCommands(message) {
        // /sprawa CYW/JK/001 (ID:123) → Link do sprawy
        message = message.replace(/\/sprawa\s+(.+?)\s+\(ID:(\d+)\)/gi, (match, caseNumber, caseId) => {
            return `<a href="#" onclick="if(window.crmManager && window.crmManager.viewCase) { window.crmManager.viewCase(${caseId}); } else { window.showTab('crm'); setTimeout(() => window.crmManager.viewCase(${caseId}), 500); } return false;" style="color: #3498db; text-decoration: underline; font-weight: 600;">📋 ${this.escapeHtml(caseNumber)}</a>`;
        });

        // /dokument Umowa.pdf (ID:789) → Link do dokumentu
        message = message.replace(/\/dokument\s+(.+?)\s+\(ID:(\d+)\)/gi, (match, docTitle, docId) => {
            return `<a href="#" onclick="if(window.documentsManager && window.documentsManager.viewDocument) { window.documentsManager.viewDocument(${docId}); } else { window.showTab('documents'); setTimeout(() => window.documentsManager && window.documentsManager.viewDocument(${docId}), 500); } return false;" style="color: #9b59b6; text-decoration: underline; font-weight: 600;">📄 ${this.escapeHtml(docTitle)}</a>`;
        });

        // /klient Jan Kowalski (ID:456) → Link do klienta
        message = message.replace(/\/klient\s+(.+?)\s+\(ID:(\d+)\)/gi, (match, clientName, clientId) => {
            return `<a href="#" onclick="if(window.showTab) window.showTab('crm'); if(window.crmManager && window.crmManager.viewClient) { window.crmManager.viewClient(${clientId}); } return false;" style="color: #e74c3c; text-decoration: underline; font-weight: 600;">👤 ${this.escapeHtml(clientName)}</a>`;
        });

        // /wydarzenie RAP/CYW/JK/001/001 (ID:123) → Link do wydarzenia
        message = message.replace(/\/wydarzenie\s+(.+?)\s+\(ID:(\d+)\)/gi, (match, eventCode, eventId) => {
            return `<a href="#" onclick="if(window.viewEventDetails) { window.viewEventDetails(${eventId}); } else { window.showTab('calendar'); setTimeout(() => window.viewEventDetails && window.viewEventDetails(${eventId}), 500); } return false;" style="color: #f39c12; text-decoration: underline; font-weight: 600;">📅 ${this.escapeHtml(eventCode)}</a>`;
        });

        // /dowod DOW/001 (ID:456) → Link do dowodu
        message = message.replace(/\/dowod\s+(.+?)\s+\(ID:(\d+)\)/gi, (match, evidenceCode, evidenceId) => {
            // Usuń emoji i podkreślniki z kodu dowodu
            const cleanCode = evidenceCode.replace(/[🔍_]/g, '').trim();
            return `<a href="#" onclick="window.chatManager.openEvidence(${evidenceId}); return false;" style="color: #16a085; text-decoration: underline; font-weight: 600;">🔍 ${this.escapeHtml(cleanCode)}</a>`;
        });

        return message;
    }

    showTypingIndicator(isTyping) {
        const statusEl = document.querySelector('.chat-user-status');
        if (!statusEl) return;

        if (isTyping) {
            statusEl.innerHTML = '<em style="color: var(--primary);">pisze...</em>';
        } else {
            this.updateChatHeader();
        }
    }

    async updateUnreadBadge() {
        try {
            const response = await api.getUnreadCount();
            const badge = document.getElementById('chatBadge');
            badge.textContent = response.unread || '';
        } catch (error) {
            console.error('Błąd aktualizacji badge:', error);
        }
    }

    filterUsers(query) {
        const items = document.querySelectorAll('.user-item');
        const lowerQuery = query.toLowerCase();

        items.forEach(item => {
            const userId = parseInt(item.dataset.id);
            const user = this.users.find(u => u.id === userId);
            
            if (user) {
                const matches = user.name.toLowerCase().includes(lowerQuery) ||
                               user.email.toLowerCase().includes(lowerQuery);
                item.style.display = matches ? 'flex' : 'none';
            }
        });
    }

    scrollToBottom() {
        const container = document.getElementById('messagesList');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    showSlashCommandHints(value) {
        const hints = [
            { cmd: '/sprawa', desc: 'Link do sprawy (np. /sprawa 123)' },
            { cmd: '/dokument', desc: 'Link do dokumentu (np. /dokument ABC)' },
            { cmd: '/klient', desc: 'Link do klienta (np. /klient 456)' }
        ];
        
        const filtered = hints.filter(h => h.cmd.startsWith(value.toLowerCase()));
        
        if (filtered.length > 0) {
            console.log('💡 Podpowiedzi:', filtered.map(h => h.cmd).join(', '));
        }
    }
    
    hideSlashCommandHints() {
        // Ukryj podpowiedzi
    }

    showAttachmentDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*,.pdf,.doc,.docx,.txt';
        
        input.onchange = async (e) => {
            const files = Array.from(e.target.files);
            if (files.length === 0) return;
            
            console.log('📎 Wybrano pliki:', files.length);
            
            // Konwertuj pliki na base64
            const attachments = [];
            for (const file of files) {
                try {
                    const base64 = await this.fileToBase64(file);
                    attachments.push({
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: base64
                    });
                    console.log('✅ Przekonwertowano:', file.name);
                } catch (error) {
                    console.error('❌ Błąd konwersji:', file.name, error);
                }
            }
            
            // Wyślij wiadomość z załącznikami
            const fileNames = files.map(f => f.name).join(', ');
            const message = `📎 Załączniki: ${fileNames}`;
            
            socketManager.sendMessage(this.currentUser.id, message, attachments);
            
            console.log('📎 Wysłano załączniki:', attachments.length);
            
            // AUTO-ODŚWIEŻENIE: Natychmiast odśwież po wysłaniu
            setTimeout(async () => {
                console.log('🔄 Auto-odświeżam po wysłaniu załączników...');
                if (window.floatingChatSending && window.floatingChat) {
                    // Jeśli wysyłano z floating chat, odśwież tam
                    await window.floatingChat.loadMessages(window.floatingChatCurrentUser.id);
                    window.floatingChatSending = false;
                    window.floatingChatCurrentUser = null;
                } else {
                    // Standardowo odśwież główny czat
                    await this.loadMessages();
                    this.scrollToBottom();
                }
                console.log('✅ Odświeżenie po załącznikach zakończone');
            }, 300); // Skrócone do 300ms dla szybszego odświeżenia
        };
        
        input.click();
    }
    
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    previewFile(messageId, fileIndex) {
        console.log('👁️ Podgląd pliku:', messageId, fileIndex);
        
        const msg = this.messages.find(m => m.id === messageId);
        if (!msg || !msg.attachments) {
            alert('Plik nie został znaleziony');
            return;
        }
        
        let files = msg.attachments;
        if (typeof files === 'string') {
            try {
                files = JSON.parse(files);
            } catch (e) {
                alert('Błąd parsowania załączników');
                return;
            }
        }
        
        if (!Array.isArray(files) || !files[fileIndex]) {
            alert('Plik nie został znaleziony');
            return;
        }
        
        const file = files[fileIndex];
        
        // Użyj data (base64) zamiast url
        const fileUrl = file.data || file.url;
        
        // Utwórz modal w aplikacji
        this.showFileModal(file.name, fileUrl);
    }
    
    showFileModal(fileName, fileUrl) {
        // Usuń stary modal jeśli istnieje
        const oldModal = document.getElementById('filePreviewModal');
        if (oldModal) oldModal.remove();
        
        // Sprawdź typ pliku
        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
        
        // Utwórz modal
        const modal = document.createElement('div');
        modal.id = 'filePreviewModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.9);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="width: 100%; max-width: 1200px; height: 90vh; display: flex; flex-direction: column; background: #2c3e50; border-radius: 12px; overflow: hidden;">
                <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="margin: 0; color: white; font-size: 1.2rem;">📄 ${this.escapeHtml(fileName)}</h3>
                    <button onclick="document.getElementById('filePreviewModal').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 1rem;">✕ Zamknij</button>
                </div>
                <div style="flex: 1; overflow: auto; padding: 20px; display: flex; align-items: center; justify-content: center;">
                    ${isImage 
                        ? `<img src="${fileUrl}" alt="${this.escapeHtml(fileName)}" style="max-width: 100%; max-height: 100%; object-fit: contain;">` 
                        : `<iframe src="${fileUrl}" style="width: 100%; height: 100%; border: none; background: white;"></iframe>`
                    }
                </div>
            </div>
        `;
        
        // Zamknij na kliknięcie tła
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Zamknij na ESC
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        });
        
        document.body.appendChild(modal);
    }
    
    downloadFile(messageId, fileIndex) {
        console.log('⬇️ Pobieranie pliku:', messageId, fileIndex);
        
        const msg = this.messages.find(m => m.id === messageId);
        if (!msg || !msg.attachments) {
            alert('Plik nie został znaleziony');
            return;
        }
        
        let files = msg.attachments;
        if (typeof files === 'string') {
            try {
                files = JSON.parse(files);
            } catch (e) {
                alert('Błąd parsowania załączników');
                return;
            }
        }
        
        if (!Array.isArray(files) || !files[fileIndex]) {
            alert('Plik nie został znaleziony');
            return;
        }
        
        const file = files[fileIndex];
        
        // Użyj data (base64) zamiast url
        const fileUrl = file.data || file.url;
        
        // Utwórz link do pobrania
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = file.name;
        a.click();
    }

    async showSlashSuggestions(text, inputElement) {
        console.log('🔍 showSlashSuggestions wywołane:', text);
        // Usuń "/" i pobierz zapytanie
        const query = text.substring(1).trim();
        
        console.log('🔍 Query:', query, 'długość:', query.length);
        
        if (query.length < 2) {
            console.log('⚠️ Query za krótkie, ukrywam sugestie');
            this.hideSlashSuggestions();
            return;
        }
        
        try {
            // Użyj globalnej wyszukiwarki
            const response = await api.request(`/search?q=${encodeURIComponent(query)}`);
            
            console.log('🔍 Wyniki wyszukiwania czatu:', response);
            console.log('   - Sprawy:', response.cases?.length || 0);
            console.log('   - Klienci:', response.clients?.length || 0);
            console.log('   - Dokumenty:', response.documents?.length || 0);
            console.log('   - Wydarzenia:', response.events?.length || 0);
            console.log('   - Dowody:', response.evidence?.length || 0);
            
            // Połącz wszystkie wyniki w jedną tablicę
            const allResults = [];
            
            // 1. SPRAWY
            if (response.cases) {
                response.cases.forEach(c => {
                    allResults.push({
                        type: 'case',
                        id: c.id,
                        title: c.case_number || `Sprawa #${c.id}`,
                        subtitle: c.title,
                        data: c
                    });
                });
            }
            
            // 2. KLIENCI
            if (response.clients) {
                response.clients.forEach(c => {
                    const name = c.company_name || `${c.first_name} ${c.last_name}`;
                    allResults.push({
                        type: 'client',
                        id: c.id,
                        title: name,
                        subtitle: c.email || c.phone || '',
                        data: c
                    });
                });
            }
            
            // 3. DOKUMENTY
            if (response.documents) {
                response.documents.forEach(d => {
                    allResults.push({
                        type: 'document',
                        id: d.id,
                        title: d.title || d.file_name,
                        subtitle: d.category || '',
                        data: d
                    });
                });
            }
            
            // 4. WYDARZENIA (rozprawy, spotkania, terminy)
            if (response.events) {
                response.events.forEach(e => {
                    const eventTypes = {
                        'court': '⚖️ Rozprawa',
                        'meeting': '💼 Spotkanie',
                        'deadline': '⏰ Termin',
                        'consultation': '🤝 Konsultacja'
                    };
                    const typeLabel = eventTypes[e.event_type] || '📅 Wydarzenie';
                    
                    allResults.push({
                        type: 'event',
                        id: e.id,
                        title: e.event_code || e.title,
                        subtitle: `${typeLabel} - ${e.location || ''}`,
                        data: e
                    });
                });
            }
            
            // 5. DOWODY
            if (response.evidence) {
                response.evidence.forEach(ev => {
                    allResults.push({
                        type: 'evidence',
                        id: ev.id,
                        title: ev.evidence_code || ev.name,
                        subtitle: `Dowód - ${ev.evidence_type || ''}`,
                        data: ev
                    });
                });
            }
            
            if (allResults.length === 0) {
                this.hideSlashSuggestions();
                return;
            }
            
            console.log('📋 Wszystkie wyniki:', allResults.length);
            
            // Pokaż dropdown z wynikami (max 10 - zwiększono z 5)
            this.renderSlashSuggestions(allResults.slice(0, 10), inputElement);
        } catch (error) {
            console.error('Błąd wyszukiwania:', error);
        }
    }
    
    renderSlashSuggestions(results, inputElement) {
        // Usuń stary dropdown
        this.hideSlashSuggestions();
        
        const dropdown = document.createElement('div');
        dropdown.id = 'slashSuggestionsDropdown';
        dropdown.style.cssText = `
            position: absolute;
            bottom: 100%;
            left: 0;
            right: 0;
            max-height: 300px;
            overflow-y: auto;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px 8px 0 0;
            box-shadow: 0 -4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
        `;
        
        results.forEach(result => {
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                transition: background 0.2s;
            `;
            
            // Ikona według typu
            let icon = '📄';
            let typeLabel = '';
            if (result.type === 'case') {
                icon = '📋';
                typeLabel = 'Sprawa';
            } else if (result.type === 'client') {
                icon = '👤';
                typeLabel = 'Klient';
            } else if (result.type === 'document') {
                icon = '📄';
                typeLabel = 'Dokument';
            } else if (result.type === 'event') {
                icon = '📅';
                typeLabel = 'Wydarzenie';
            } else if (result.type === 'evidence') {
                icon = '🔍';
                typeLabel = 'Dowód';
            }
            
            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem;">${icon}</span>
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: #2c3e50;">${this.escapeHtml(result.title)}</div>
                        <div style="font-size: 0.85rem; color: #7f8c8d;">${typeLabel} ${result.subtitle || ''}</div>
                    </div>
                </div>
            `;
            
            item.addEventListener('mouseenter', () => {
                item.style.background = '#f8f9fa';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = 'white';
            });
            
            item.addEventListener('click', () => {
                this.insertSlashLink(result, inputElement);
            });
            
            dropdown.appendChild(item);
        });
        
        // Dodaj dropdown nad inputem
        const chatInput = inputElement.closest('.chat-input');
        if (chatInput) {
            chatInput.style.position = 'relative';
            chatInput.appendChild(dropdown);
        }
    }
    
    insertSlashLink(result, inputElement) {
        const input = inputElement;
        const text = input.value;
        
        // Znajdź PIERWSZE "/" (komendę slash) - nie ostatnie!
        const firstSlashIndex = text.indexOf('/');
        const beforeSlash = text.substring(0, firstSlashIndex);
        const afterSlash = text.substring(firstSlashIndex);
        
        // Znajdź gdzie kończy się komenda (spacja lub koniec tekstu)
        const spaceAfterCommand = afterSlash.indexOf(' ');
        const afterCommand = spaceAfterCommand !== -1 ? afterSlash.substring(spaceAfterCommand) : '';
        
        // Utwórz tekst linku z numerem i ID
        let linkData = '';
        
        if (result.type === 'case') {
            // Format: /sprawa CYW/JK/001 (ID:123)
            const caseNumber = result.data.case_number || `#${result.id}`;
            linkData = `/sprawa ${caseNumber} (ID:${result.id})`;
        } else if (result.type === 'client') {
            // Format: /klient Jan Kowalski (ID:456)
            linkData = `/klient ${result.title} (ID:${result.id})`;
        } else if (result.type === 'document') {
            // Format: /dokument Umowa.pdf (ID:789)
            linkData = `/dokument ${result.title} (ID:${result.id})`;
        } else if (result.type === 'event') {
            // Format: /wydarzenie RAP/CYW/JK/001/001 (ID:123)
            const eventCode = result.data.event_code || result.title;
            linkData = `/wydarzenie ${eventCode} (ID:${result.id})`;
        } else if (result.type === 'evidence') {
            // Format: /dowod DOW/001 (ID:456)
            const evidenceCode = result.data.evidence_code || result.title || `Dowód #${result.id}`;
            // Usuń emoji i dziwne znaki z kodu dowodu
            const cleanCode = evidenceCode.replace(/[🔍_]/g, '').trim();
            linkData = `/dowod ${cleanCode} (ID:${result.id})`;
            console.log('🔍 Wstawiam dowód:', linkData);
        }
        
        // Wstaw do inputa - ZACHOWAJ tekst po komendzie!
        input.value = beforeSlash + linkData + afterCommand;
        input.focus();
        
        // Ustaw kursor po wstawionym linku
        const cursorPos = beforeSlash.length + linkData.length;
        input.setSelectionRange(cursorPos, cursorPos);
        
        this.hideSlashSuggestions();
    }
    
    hideSlashSuggestions() {
        const dropdown = document.getElementById('slashSuggestionsDropdown');
        if (dropdown) {
            dropdown.remove();
        }
    }
    
    // Funkcje pomocnicze do otwierania elementów
    openEvidence(evidenceId) {
        console.log('🔍 Otwieranie dowodu:', evidenceId);
        // Pobierz dane dowodu
        window.api.request(`/evidence/${evidenceId}`).then(evidence => {
            console.log('✅ Pobrano dowód:', evidence);
            if (evidence && evidence.case_id) {
                console.log('📋 Otwieranie sprawy:', evidence.case_id);
                // Przełącz na CRM
                if (window.showTab) {
                    window.showTab('crm');
                    console.log('✅ Przełączono na CRM');
                }
                // Otwórz sprawę
                setTimeout(() => {
                    if (window.crmManager && window.crmManager.viewCase) {
                        window.crmManager.viewCase(evidence.case_id);
                        console.log('✅ Otwarto sprawę');
                        // NATYCHMIAST przełącz na zakładkę Dowody - używam window.goToEvidence (jak w globalnej wyszukiwarce)
                        setTimeout(() => {
                            if (window.goToEvidence) {
                                console.log('✅ Wywołuję window.goToEvidence - bezpośrednio do dowodu');
                                window.goToEvidence(evidence.case_id, evidenceId);
                            } else {
                                console.error('❌ Funkcja window.goToEvidence nie istnieje!');
                            }
                        }, 300);
                    }
                }, 300);
            }
        }).catch(err => {
            console.error('❌ Błąd pobierania dowodu:', err);
            alert('Nie znaleziono dowodu: ' + err.message);
        });
    }

    showUserMentions(query, inputElement, cursorPos) {
        // Usuń stary dropdown jeśli istnieje
        const oldDropdown = document.getElementById('mentionsDropdown');
        if (oldDropdown) oldDropdown.remove();

        // Filtruj użytkowników (pomiń siebie)
        const currentUserId = window.authManager?.currentUser?.id;
        const filtered = this.users.filter(user => {
            if (user.id === currentUserId) return false; // Pomiń siebie
            const fullName = user.name.toLowerCase();
            return fullName.includes(query.toLowerCase());
        });

        if (filtered.length === 0) return;

        // Utwórz dropdown
        const dropdown = document.createElement('div');
        dropdown.id = 'mentionsDropdown';
        dropdown.className = 'mentions-dropdown';
        
        filtered.forEach((user, index) => {
            const item = document.createElement('div');
            item.className = 'mention-item';
            if (index === 0) item.classList.add('active');
            
            const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
            
            item.innerHTML = `
                <span class="mention-avatar">${initials}</span>
                <div class="mention-info">
                    <div class="mention-name">${this.escapeHtml(user.name)}</div>
                    <div class="mention-role">${user.email || ''}</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.insertMention(user, inputElement, cursorPos);
            });
            
            dropdown.appendChild(item);
        });

        // Pozycjonuj dropdown nad inputem
        const inputRect = inputElement.getBoundingClientRect();
        dropdown.style.position = 'absolute';
        dropdown.style.bottom = (window.innerHeight - inputRect.top + 10) + 'px';
        dropdown.style.left = inputRect.left + 'px';
        dropdown.style.width = (inputRect.width - 100) + 'px';
        
        document.body.appendChild(dropdown);

        // Obsługa klawiatury (strzałki, Enter)
        this.setupMentionKeyboard(inputElement, dropdown, filtered);
    }

    setupMentionKeyboard(inputElement, dropdown, users) {
        const keydownHandler = (e) => {
            // Sprawdź czy dropdown nadal istnieje
            if (!document.getElementById('mentionsDropdown')) {
                inputElement.removeEventListener('keydown', keydownHandler);
                return;
            }

            const items = dropdown.querySelectorAll('.mention-item');
            const activeIndex = Array.from(items).findIndex(item => item.classList.contains('active'));

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                items[activeIndex]?.classList.remove('active');
                const nextIndex = (activeIndex + 1) % items.length;
                items[nextIndex]?.classList.add('active');
                items[nextIndex]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                items[activeIndex]?.classList.remove('active');
                const prevIndex = (activeIndex - 1 + items.length) % items.length;
                items[prevIndex]?.classList.add('active');
                items[prevIndex]?.scrollIntoView({ block: 'nearest' });
            } else if (e.key === 'Enter' && items.length > 0) {
                e.preventDefault();
                e.stopPropagation();
                const activeItem = items[activeIndex];
                if (activeItem) {
                    const user = users[activeIndex];
                    this.insertMention(user, inputElement, inputElement.selectionStart);
                }
            } else if (e.key === 'Escape') {
                dropdown.remove();
                inputElement.removeEventListener('keydown', keydownHandler);
            }
        };
        
        inputElement.addEventListener('keydown', keydownHandler);
    }

    insertMention(user, inputElement, cursorPos) {
        const text = inputElement.value;
        const textBefore = text.substring(0, cursorPos);
        const textAfter = text.substring(cursorPos);
        
        // Znajdź początek @mention
        const lastAtIndex = textBefore.lastIndexOf('@');
        
        // Wstaw mention
        const mention = `@${user.name}`;
        inputElement.value = textBefore.substring(0, lastAtIndex) + mention + ' ' + textAfter;
        
        // Ustaw kursor po mention
        const newCursorPos = lastAtIndex + mention.length + 1;
        inputElement.setSelectionRange(newCursorPos, newCursorPos);
        inputElement.focus();
        
        // Usuń dropdown
        const dropdown = document.getElementById('mentionsDropdown');
        if (dropdown) dropdown.remove();
        
        console.log('✅ Wstawiono mention:', mention);
    }

    convertMentionsToLinks(text) {
        // Wzorzec: @Imię Nazwisko
        const mentionRegex = /@([A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:\s+[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)+)/g;
        
        return text.replace(mentionRegex, (match, name) => {
            // Znajdź użytkownika po nazwie
            const user = this.users.find(u => u.name === name);
            if (user) {
                return `<span class="mention-link" data-user-id="${user.id}" style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 2px 8px; border-radius: 12px; cursor: pointer; font-weight: 600; display: inline-block; margin: 0 2px;">@${name}</span>`;
            }
            return match;
        });
    }

    hideMentionsDropdown() {
        const dropdown = document.getElementById('mentionsDropdown');
        if (dropdown) dropdown.remove();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // WYSYŁANIE WIADOMOŚCI GŁOSOWEJ
    async sendVoiceMessage(base64Audio) {
        if (!this.currentUser) {
            console.error('❌ Brak odbiorcy! currentUser:', this.currentUser);
            alert('Wybierz użytkownika z listy przed nagraniem!');
            return;
        }

        try {
            console.log('🎤 Wysyłam wiadomość głosową do:', this.currentUser.name, 'ID:', this.currentUser.id);
            console.log('🎤 Audio size:', base64Audio.length, 'bytes');
            
            const response = await fetch('/api/chat/voice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    receiver_id: this.currentUser.id,
                    audio: base64Audio
                })
            });

            console.log('🎤 Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Server error:', errorData);
                throw new Error('Błąd wysyłania wiadomości głosowej');
            }

            const data = await response.json();
            console.log('✅ Wiadomość głosowa wysłana!', data);

            // Odśwież wiadomości w odpowiednim miejscu
            if (window.floatingChatRecording && window.floatingChat) {
                // Jeśli nagrywano z floating chat, odśwież tam
                console.log('🔄 Odświeżam floating chat');
                await window.floatingChat.loadMessages(window.floatingChatCurrentUser.id);
                window.floatingChatRecording = false;
                window.floatingChatCurrentUser = null;
            } else {
                // Standardowo odśwież główny czat
                await this.loadMessages();
                this.scrollToBottom();
            }

        } catch (error) {
            console.error('❌ Błąd wysyłania wiadomości głosowej:', error);
            alert('Nie udało się wysłać wiadomości głosowej!\n' + error.message);
            // Wyczyść flagę w razie błędu
            window.floatingChatRecording = false;
            window.floatingChatCurrentUser = null;
        }
    }

    async sendVideoMessage(base64Video) {
        if (!this.currentUser) {
            alert('Wybierz użytkownika z listy przed nagraniem!');
            return;
        }

        try {
            console.log('📹 Wysyłam wiadomość wideo do:', this.currentUser.name, 'ID:', this.currentUser.id);
            console.log('📹 Video size:', (base64Video.length / 1024 / 1024).toFixed(2), 'MB');
            
            const response = await fetch('/api/chat/video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    receiver_id: this.currentUser.id,
                    video: base64Video
                })
            });

            console.log('📹 Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Server error:', errorData);
                throw new Error('Błąd wysyłania wiadomości wideo');
            }

            const data = await response.json();
            console.log('✅ Wiadomość wideo wysłana!', data);

            // Odśwież wiadomości w odpowiednim miejscu
            if (window.floatingChatRecording && window.floatingChat) {
                // Jeśli nagrywano z floating chat, odśwież tam
                console.log('🔄 Odświeżam floating chat');
                await window.floatingChat.loadMessages(window.floatingChatCurrentUser.id);
                window.floatingChatRecording = false;
                window.floatingChatCurrentUser = null;
            } else {
                // Standardowo odśwież główny czat
                await this.loadMessages();
                this.scrollToBottom();
            }

        } catch (error) {
            console.error('❌ Błąd wysyłania wiadomości wideo:', error);
            alert('Nie udało się wysłać wiadomości wideo!\n' + error.message);
            // Wyczyść flagę w razie błędu
            window.floatingChatRecording = false;
            window.floatingChatCurrentUser = null;
        }
    }

    showNotificationBanner(message) {
        // Nie pokazuj notyfikacji jeśli chat jest otwarty dla tego użytkownika
        if (this.currentUser && this.currentUser.id === message.sender_id) {
            return;
        }

        // Utwórz banner
        const banner = document.createElement('div');
        banner.className = 'chat-notification-banner';
        banner.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">💬</span>
                <div class="notification-text">
                    <strong>${message.sender_name || 'Użytkownik'}</strong>
                    <p>${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}</p>
                </div>
            </div>
        `;

        // Dodaj do body
        document.body.appendChild(banner);

        // Kliknięcie otwiera czat
        banner.addEventListener('click', () => {
            const user = this.users.find(u => u.id === message.sender_id);
            if (user) {
                this.selectUser(user);
            }
            banner.remove();
        });

        // Auto-usuń po 5 sekundach
        setTimeout(() => {
            banner.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => banner.remove(), 300);
        }, 5000);
    }

    moveUserToTop(userId) {
        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex > 0) {
            const user = this.users.splice(userIndex, 1)[0];
            this.users.unshift(user);
            this.renderUsers();
        }
    }

    async sendVideoMessage(videoBase64) {
        // ZABEZPIECZENIE przed podwójnym wysyłaniem
        if (this._sendingVideo) {
            console.warn('⚠️ Wideo już jest wysyłane - pomijam');
            return;
        }
        
        if (!this.currentUser) {
            console.error('❌ Brak wybranego użytkownika');
            return;
        }

        this._sendingVideo = true;
        console.log('📹 Wysyłam wideo...');

        try {
            const response = await api.request('/chat/messages', {
                method: 'POST',
                body: JSON.stringify({
                    receiverId: this.currentUser.id,
                    message: '📹 Wiadomość wideo',
                    attachments: [{
                        type: 'video',
                        data: videoBase64
                    }]
                })
            });

            if (response.success) {
                console.log('✅ Wideo wysłane');
                // AUTO-ODŚWIEŻENIE: Pobierz wszystkie wiadomości z bazy
                console.log('🔄 Auto-odświeżam po wysłaniu wideo...');
                await this.loadMessages();
                this.scrollToBottom();
                console.log('✅ Odświeżenie po wideo zakończone');
            }
        } catch (error) {
            console.error('❌ Błąd wysyłania wideo:', error);
            alert('Błąd wysyłania wideo');
        } finally {
            this._sendingVideo = false;
            console.log('✅ Wysyłanie wideo zakończone');
        }
    }

    async sendVoiceMessage(audioBase64) {
        // ZABEZPIECZENIE przed podwójnym wysyłaniem
        if (this._sendingVoice) {
            console.warn('⚠️ Audio już jest wysyłane - pomijam');
            return;
        }
        
        if (!this.currentUser) {
            console.error('❌ Brak wybranego użytkownika');
            return;
        }

        this._sendingVoice = true;
        console.log('🎤 Wysyłam audio...');

        try {
            const response = await api.request('/chat/messages', {
                method: 'POST',
                body: JSON.stringify({
                    receiverId: this.currentUser.id,
                    message: '🎤 Wiadomość głosowa',
                    attachments: [{
                        type: 'voice',
                        data: audioBase64
                    }]
                })
            });

            if (response.success) {
                console.log('✅ Audio wysłane');
                // AUTO-ODŚWIEŻENIE: Pobierz wszystkie wiadomości z bazy
                console.log('🔄 Auto-odświeżam po wysłaniu audio...');
                await this.loadMessages();
                this.scrollToBottom();
                console.log('✅ Odświeżenie po audio zakończone');
            }
        } catch (error) {
            console.error('❌ Błąd wysyłania audio:', error);
            alert('Błąd wysyłania audio');
        } finally {
            this._sendingVoice = false;
            console.log('✅ Wysyłanie audio zakończone');
        }
    }
}

// NIE twórz od razu - poczekaj aż użytkownik kliknie "Czat"
let chatManager = null;

// Funkcja inicjalizacji - wywołaj gdy użytkownik otwiera czat
window.initChatManager = function() {
    if (!chatManager) {
        console.log('💬 Inicjalizacja Chat Managera...');
        chatManager = new ChatManager();
        window.chatManager = chatManager;
        
        // Załaduj użytkowników
        chatManager.loadUsers();
    }
    return chatManager;
};

// Globalna funkcja notyfikacji - działa nawet jak ChatManager nie istnieje
window.showGlobalChatNotification = function(message) {
    console.log('🌍 Globalna notyfikacja:', message);
    
    // Nie pokazuj jeśli to moja własna wiadomość
    if (window.authManager && window.authManager.currentUser && 
        message.sender_id === window.authManager.currentUser.id) {
        return;
    }
    
    // Utwórz banner
    const banner = document.createElement('div');
    banner.className = 'chat-notification-banner';
    banner.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">💬</span>
            <div class="notification-text">
                <strong>${message.sender_name || 'Użytkownik'}</strong>
                <p>${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}</p>
            </div>
        </div>
    `;
    
    // Dodaj do body
    document.body.appendChild(banner);
    
    // Kliknięcie otwiera czat
    banner.addEventListener('click', () => {
        // Przełącz na zakładkę czat
        if (window.showTab) {
            window.showTab('chat');
        }
        
        // Jeśli ChatManager istnieje, otwórz czat z tym użytkownikiem
        if (window.chatManager && window.chatManager.users) {
            const user = window.chatManager.users.find(u => u.id === message.sender_id);
            if (user) {
                window.chatManager.selectUser(user);
            }
        }
        
        banner.remove();
    });
    
    // Auto-usuń po 5 sekundach
    setTimeout(() => {
        banner.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => banner.remove(), 300);
    }, 5000);
};

} // Zamknięcie if (!window.ChatManager)

console.log('✅ Chat.js załadowany - czeka na inicjalizację');
