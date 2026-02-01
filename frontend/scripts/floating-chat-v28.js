console.log('💬 Floating Chat Widget Loading...');

// Zabezpieczenie przed duplikacją
if (window.FloatingChat) {
    console.warn('⚠️ FloatingChat already exists - skipping redefinition');
} else {
    window.FloatingChat = class FloatingChat {
        constructor() {
            this.isOpen = false;
        this.isDragging = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        this._sending = false;
        this._lastMessage = '';
        this._lastSendTime = 0;
        this.messages = [];
        
        this.createWidget();
        this.attachEventListeners();
        this.setupSocketListeners();
    }

    createWidget() {
        // Floating Button (dymek)
        const button = document.createElement('div');
        button.id = 'floatingChatButton';
        button.innerHTML = `
            <div class="floating-chat-icon">💬</div>
            <div class="floating-chat-badge" id="floatingChatBadge">0</div>
        `;
        document.body.appendChild(button);
        this.button = button;

        // Floating Panel (rozwinięty czat)
        const panel = document.createElement('div');
        panel.id = 'floatingChatPanel';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="floating-chat-header" id="floatingChatHeader">
                <span>💬 Komunikator</span>
                <div class="floating-chat-controls">
                    <button class="floating-btn-minimize" id="floatingMinimize">−</button>
                    <button class="floating-btn-close" id="floatingClose">✕</button>
                </div>
            </div>
            <div class="floating-chat-body">
                <div class="floating-users-list" id="floatingUsersList">
                    <div class="floating-empty">Ładowanie...</div>
                </div>
                <div class="floating-chat-messages" id="floatingChatMessages" style="display: none;">
                    <div class="floating-chat-user-header" id="floatingChatUserHeader"></div>
                    <div class="floating-messages-area" id="floatingMessagesArea"></div>
                    <div class="floating-input-area">
                        <button class="floating-action-btn" id="floatingEmojiBtn" title="Emoji">😊</button>
                        <button class="floating-action-btn" id="floatingAttachBtn" title="Załączniki">📎</button>
                        <button class="floating-action-btn" id="floatingVoiceBtn" title="Nagraj audio">🎤</button>
                        <button class="floating-action-btn" id="floatingVideoBtn" title="Nagraj wideo">📹</button>
                        <input type="text" id="floatingMessageInput" placeholder="Napisz wiadomość (/ dla poleceń)...">
                        <button id="floatingSendBtn">📤</button>
                    </div>
                    <div id="floatingEmojiPicker" class="floating-emoji-picker" style="display: none;"></div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        this.panel = panel;
    }

    attachEventListeners() {
        // Toggle open/close
        this.button.addEventListener('click', () => this.toggle());
        
        // Close button
        document.getElementById('floatingClose').addEventListener('click', () => this.close());
        
        // Minimize button
        document.getElementById('floatingMinimize').addEventListener('click', () => this.minimize());
        
        // Dragging
        const header = document.getElementById('floatingChatHeader');
        header.addEventListener('mousedown', (e) => this.dragStart(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.dragEnd());
        
        // Send message
        document.getElementById('floatingSendBtn').addEventListener('click', () => this.sendMessage());
        const messageInput = document.getElementById('floatingMessageInput');
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Slash commands suggestions
        messageInput.addEventListener('input', (e) => {
            const text = e.target.value;
            if (text.startsWith('/') && window.chatManager) {
                // Użyj funkcji z głównego czatu
                window.chatManager.showSlashSuggestions(text, e.target);
            }
        });
        
        // Action buttons
        document.getElementById('floatingEmojiBtn').addEventListener('click', () => this.toggleEmojiPicker());
        document.getElementById('floatingAttachBtn').addEventListener('click', () => this.handleAttachments());
        document.getElementById('floatingVoiceBtn').addEventListener('click', () => this.handleVoiceRecording());
        document.getElementById('floatingVideoBtn').addEventListener('click', () => this.handleVideoRecording());
        
        // Zamknij emoji picker po kliknięciu poza nim
        document.addEventListener('click', (e) => {
            const picker = document.getElementById('floatingEmojiPicker');
            const emojiBtn = document.getElementById('floatingEmojiBtn');
            if (picker && picker.style.display === 'block' && 
                !picker.contains(e.target) && 
                !emojiBtn.contains(e.target)) {
                picker.style.display = 'none';
                console.log('✅ [FLOATING] Emoji picker zamknięty (kliknięcie poza)');
            }
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.panel.style.display = 'flex';
        this.button.style.display = 'none';
        this.isOpen = true;
        this.loadUsers();
    }

    close() {
        this.panel.style.display = 'none';
        this.button.style.display = 'flex';
        this.isOpen = false;
    }

    minimize() {
        this.close();
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/chat/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            this.renderUsers(data.users || []);
        } catch (error) {
            console.error('Błąd ładowania użytkowników:', error);
        }
    }

    renderUsers(users) {
        const container = document.getElementById('floatingUsersList');
        
        console.log('📋 Floating Chat - renderUsers:', users);
        
        if (!users || users.length === 0) {
            container.innerHTML = '<div class="floating-empty">Brak użytkowników</div>';
            return;
        }

        // Filtruj tylko użytkowników (nie sprawy ani inne obiekty)
        const validUsers = users.filter(user => user && user.id && user.name);
        
        if (validUsers.length === 0) {
            container.innerHTML = '<div class="floating-empty">Brak użytkowników</div>';
            return;
        }

        container.innerHTML = validUsers.map(user => `
            <div class="floating-user-item" data-user-id="${user.id}">
                <div class="floating-user-avatar">${user.name.charAt(0).toUpperCase()}</div>
                <div class="floating-user-info">
                    <div class="floating-user-name">${user.name}</div>
                    <div class="floating-user-status ${user.status || 'offline'}">${user.status === 'online' ? 'Online' : 'Offline'}</div>
                </div>
            </div>
        `).join('');

        // Attach click handlers
        container.querySelectorAll('.floating-user-item').forEach(item => {
            item.addEventListener('click', () => {
                const userId = parseInt(item.dataset.userId);
                const user = users.find(u => u.id === userId);
                if (user) this.openChat(user);
            });
        });
    }

    openChat(user) {
        console.log('💬 [FLOATING] Opening chat with:', user);
        this.currentUser = user;
        
        document.getElementById('floatingUsersList').style.display = 'none';
        document.getElementById('floatingChatMessages').style.display = 'flex';
        
        const header = document.getElementById('floatingChatUserHeader');
        header.innerHTML = `
            <button class="floating-back-btn" id="floatingBackBtn">←</button>
            <div class="floating-user-avatar">${user.name.charAt(0).toUpperCase()}</div>
            <div class="floating-user-info">
                <div class="floating-user-name">${user.name}</div>
                <div class="floating-user-status ${user.status || 'offline'}">${user.status === 'online' ? 'Online' : 'Offline'}</div>
            </div>
        `;
        
        document.getElementById('floatingBackBtn').addEventListener('click', () => this.backToUsersList());
        
        console.log('📥 [FLOATING] Ładuję wiadomości...');
        this.loadMessages(user.id);
        this.scrollToBottom();
    }

    backToUsersList() {
        document.getElementById('floatingUsersList').style.display = 'block';
        document.getElementById('floatingChatMessages').style.display = 'none';
        this.currentUser = null;
    }

    async loadMessages(userId) {
        try {
            console.log('📥 [FLOATING] Ładuję wiadomości dla użytkownika:', userId);
            const response = await fetch(`/api/chat/messages/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            this.messages = data.messages || [];
            console.log('📨 [FLOATING] Załadowano wiadomości:', this.messages.length);
            this.renderMessages(this.messages);
        } catch (error) {
            console.error('❌ [FLOATING] Błąd ładowania wiadomości:', error);
        }
    }

    setupSocketListeners() {
        if (!window.socketManager) {
            console.warn('⚠️ [FLOATING] SocketManager nie jest gotowy - retry za 500ms...');
            setTimeout(() => this.setupSocketListeners(), 500);
            return;
        }
        
        // WYCZYŚĆ STARE LISTENERY z floating chat
        if (window.socketManager.listeners['new-chat-message']) {
            const oldCount = window.socketManager.listeners['new-chat-message'].length;
            console.log('🧹 [FLOATING] Czyszczę stare listenery małego czatu (było:', oldCount, ')');
            // Usuń TYLKO listenery floating chat (te z logami [FLOATING])
            window.socketManager.listeners['new-chat-message'] = 
                window.socketManager.listeners['new-chat-message'].filter(cb => {
                    return !cb.toString().includes('[FLOATING]');
                });
            console.log('✅ [FLOATING] Po czyszczeniu zostało:', window.socketManager.listeners['new-chat-message'].length);
        }
        
        console.log('🔌 [FLOATING] Konfiguruję socket listeners...');
        
        window.socketManager.on('new-chat-message', async (message) => {
            console.log('📨 [FLOATING] Otrzymano wiadomość:', {
                message: message.message,
                id: message.id,
                sender_id: message.sender_id,
                receiver_id: message.receiver_id
            });
            
            const myUserId = Number(window.authManager?.currentUser?.id);
            const currentChatUserId = Number(this.currentUser?.id);
            const msgSenderId = Number(message.sender_id);
            const msgReceiverId = Number(message.receiver_id);
            
            console.log('🔍 [FLOATING] Sprawdzam:', {
                myUserId,
                currentChatUserId,
                msgSenderId,
                msgReceiverId,
                'moje typy': typeof myUserId,
                'msg typy': typeof msgSenderId
            });
            
            // Jeśli wiadomość dotyczy aktualnie otwartego czatu
            // PRZYPADEK 1: Otrzymuję wiadomość od osoby z którą rozmawiam
            // PRZYPADEK 2: Wysłałem wiadomość do osoby z którą rozmawiam
            if (currentChatUserId && myUserId) {
                const isIncomingFromCurrentChat = 
                    msgSenderId === currentChatUserId && msgReceiverId === myUserId;
                const isOutgoingToCurrentChat = 
                    msgSenderId === myUserId && msgReceiverId === currentChatUserId;
                
                console.log('🎯 [FLOATING] Porównanie:', {
                    isIncoming: isIncomingFromCurrentChat,
                    'sprawdzam incoming': msgSenderId + '===' + currentChatUserId + ' && ' + msgReceiverId + '===' + myUserId,
                    isOutgoing: isOutgoingToCurrentChat,
                    'sprawdzam outgoing': msgSenderId + '===' + myUserId + ' && ' + msgReceiverId + '===' + currentChatUserId
                });
                
                if (isIncomingFromCurrentChat || isOutgoingToCurrentChat) {
                    console.log('✅ [FLOATING] Wiadomość należy do tego czatu! Odświeżam...');
                    await this.loadMessages(currentChatUserId);
                    this.scrollToBottom();
                } else {
                    console.log('ℹ️ [FLOATING] Wiadomość z innego czatu, pomijam');
                }
            }
        });
        
        const totalListeners = window.socketManager.listeners['new-chat-message']?.length || 0;
        console.log('✅ [FLOATING] Socket listeners skonfigurowane');
        console.log('📊 [FLOATING] Całkowita liczba listenerów new-chat-message:', totalListeners);
        
        // Test czy listener działa
        console.log('🧪 [FLOATING] TEST: Sprawdzam czy listener jest aktywny...');
        setTimeout(() => {
            console.log('🧪 [FLOATING] Listener floating chat czeka na wiadomości...');
        }, 1000);
    }
    
    scrollToBottom() {
        const container = document.getElementById('floatingMessagesArea');
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    }
    
    renderMessages(messages) {
        const container = document.getElementById('floatingMessagesArea');
        const myUserId = Number(window.authManager?.currentUser?.id);
        
        console.log('🎨 [FLOATING] Renderuję', messages.length, 'wiadomości');
        console.log('🆔 [FLOATING] Moje ID:', myUserId, '(type:', typeof myUserId, ') Rozmawiam z:', this.currentUser?.id);
        
        container.innerHTML = messages.map(msg => {
            const msgSenderId = Number(msg.sender_id);
            const isSent = msgSenderId === myUserId;
            console.log('💬 [FLOATING] Wiadomość:', msg.message, '| sender:', msgSenderId, '(type:', typeof msgSenderId, ') | myId:', myUserId, '| isSent:', isSent, '| COMPARISON:', msgSenderId, '===', myUserId, '=', (msgSenderId === myUserId));
            const time = new Date(msg.created_at).toLocaleTimeString('pl-PL', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            // Parsuj załączniki
            let attachments = [];
            try {
                if (msg.attachments) {
                    attachments = typeof msg.attachments === 'string' 
                        ? JSON.parse(msg.attachments) 
                        : msg.attachments;
                }
            } catch (e) {
                console.error('Błąd parsowania załączników:', e);
            }
            
            // Sprawdź czy to audio, wideo lub załączniki
            let content = '';
            if (attachments.length > 0) {
                const att = attachments[0];
                if (att.type === 'voice') {
                    content = `
                        <div class="media-message">
                            <audio controls style="max-width: 250px;"><source src="${att.data}" type="audio/webm"></audio>
                            <button class="download-media-btn" onclick="window.downloadMedia('${att.data}', 'audio', '${msg.id}')" title="Pobierz">⬇️</button>
                        </div>
                    `;
                } else if (att.type === 'video') {
                    content = `
                        <div class="media-message">
                            <video controls style="max-width: 250px; border-radius: 8px;"><source src="${att.data}" type="video/webm"></video>
                            <button class="download-media-btn" onclick="window.downloadMedia('${att.data}', 'video', '${msg.id}')" title="Pobierz">⬇️</button>
                        </div>
                    `;
                } else {
                    // Zwykłe załączniki (dokumenty, obrazy)
                    content = `
                        <div style="padding: 8px; background: rgba(255,255,255,0.1); border-radius: 8px; margin: 4px 0;">
                            ${msg.message}
                            <div style="margin-top: 8px;">
                                ${attachments.map((file, idx) => {
                                    const fileIcon = file.type?.includes('image') ? '🖼️' : file.type?.includes('pdf') ? '📄' : '📎';
                                    const fileSize = file.size ? `(${(file.size / 1024).toFixed(1)} KB)` : '';
                                    
                                    // Jeśli to obraz, pokaż podgląd
                                    if (file.type?.includes('image')) {
                                        return `
                                            <div style="margin: 8px 0;">
                                                <img src="${file.data}" alt="${file.name}" 
                                                     style="max-width: 200px; max-height: 200px; border-radius: 8px; cursor: pointer;"
                                                     onclick="window.open('${file.data}', '_blank')">
                                                <div style="display: flex; align-items: center; gap: 8px; margin-top: 4px;">
                                                    <span style="font-size: 12px; color: rgba(255,255,255,0.7);">${file.name} ${fileSize}</span>
                                                    <button onclick="window.downloadFloatingAttachment(${msg.id}, ${idx})" 
                                                            style="background: #3498db; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                                        ⬇️ Pobierz
                                                    </button>
                                                </div>
                                            </div>
                                        `;
                                    } else {
                                        return `
                                            <div style="display: flex; align-items: center; gap: 8px; padding: 4px; background: rgba(255,255,255,0.05); border-radius: 4px; margin: 4px 0;">
                                                <span style="font-size: 20px;">${fileIcon}</span>
                                                <span style="flex: 1; font-size: 13px;">${file.name} ${fileSize}</span>
                                                <button onclick="window.downloadFloatingAttachment(${msg.id}, ${idx})" 
                                                        style="background: #3498db; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                                    ⬇️ Pobierz
                                                </button>
                                            </div>
                                        `;
                                    }
                                }).join('')}
                            </div>
                        </div>
                    `;
                }
            } else {
                content = msg.message;
            }
            
            return `
                <div class="floating-message ${isSent ? 'sent' : 'received'}">
                    <div class="floating-message-content">${content}</div>
                    <div class="floating-message-time">${time}</div>
                </div>
            `;
        }).join('');
        
        container.scrollTop = container.scrollHeight;
    }

    async sendMessage() {
        if (!this.currentUser) return;
        
        const input = document.getElementById('floatingMessageInput');
        const message = input.value.trim();
        const now = Date.now();
        
        // ZABEZPIECZENIE 1: Flaga wysyłania
        if (this._sending) {
            console.warn('⚠️ [FLOATING] Wiadomość już jest wysyłana - pomijam');
            return;
        }
        
        // ZABEZPIECZENIE 2: Debouncing
        if (this._lastMessage === message && (now - this._lastSendTime) < 1000) {
            console.warn('⚠️ [FLOATING] Ta sama wiadomość w ciągu 1s - DUPLIKAT ZABLOKOWANY!');
            return;
        }
        
        if (!message) return;
        
        this._sending = true;
        this._lastMessage = message;
        this._lastSendTime = now;
        
        console.log('🚀 [FLOATING] WYSYŁAM:', message, 'Timestamp:', now);
        
        try {
            await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    receiverId: this.currentUser.id,
                    message: message,
                    attachments: []
                })
            });
            
            input.value = '';
            console.log('🔄 [FLOATING] Auto-odświeżam po wysłaniu...');
            await this.loadMessages(this.currentUser.id);
            console.log('✅ [FLOATING] Odświeżenie zakończone');
        } catch (error) {
            console.error('❌ [FLOATING] Błąd wysyłania:', error);
        } finally {
            this._sending = false;
            console.log('✅ [FLOATING] Wysyłanie zakończone, odblokowano');
        }
    }

    updateBadge(count) {
        const badge = document.getElementById('floatingChatBadge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
        }
    }

    // Dragging functionality
    dragStart(e) {
        if (e.target.closest('.floating-chat-controls')) return;
        
        this.initialX = e.clientX - this.xOffset;
        this.initialY = e.clientY - this.yOffset;
        this.isDragging = true;
        this.panel.style.cursor = 'grabbing';
    }

    drag(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        this.currentX = e.clientX - this.initialX;
        this.currentY = e.clientY - this.initialY;
        this.xOffset = this.currentX;
        this.yOffset = this.currentY;
        
        this.setTranslate(this.currentX, this.currentY, this.panel);
    }

    dragEnd() {
        this.initialX = this.currentX;
        this.initialY = this.currentY;
        this.isDragging = false;
        this.panel.style.cursor = 'default';
    }

    setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    toggleEmojiPicker() {
        const picker = document.getElementById('floatingEmojiPicker');
        
        if (picker.style.display === 'none' || !picker.style.display) {
            // Pokaż emoji picker
            this.renderEmojiPicker();
            picker.style.display = 'block';
        } else {
            // Ukryj emoji picker
            picker.style.display = 'none';
        }
    }

    renderEmojiPicker() {
        const picker = document.getElementById('floatingEmojiPicker');
        
        const emojis = [
            '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
            '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
            '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
            '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
            '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
            '🤧', '🥵', '🥶', '😶‍🌫️', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
            '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
            '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏',
            '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
            '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️'
        ];
        
        picker.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <span style="font-size: 14px; font-weight: 600;">😊 Emotikony</span>
                <button onclick="window.floatingChat.closeEmojiPicker()" 
                        style="background: transparent; border: none; color: white; font-size: 18px; cursor: pointer; padding: 4px 8px;"
                        title="Zamknij">
                    ✕
                </button>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px; padding: 8px;">
                ${emojis.map(emoji => 
                    `<span class="emoji-item" onclick="window.floatingChat.addEmoji('${emoji}')">${emoji}</span>`
                ).join('')}
            </div>
        `;
    }

    addEmoji(emoji) {
        const input = document.getElementById('floatingMessageInput');
        if (input) {
            input.value += emoji;
            input.focus();
            
            // AUTO-ZAMKNIJ po wyborze
            this.closeEmojiPicker();
            console.log('✅ [FLOATING] Dodano emoji i zamknięto picker:', emoji);
        }
    }
    
    closeEmojiPicker() {
        const picker = document.getElementById('floatingEmojiPicker');
        if (picker) {
            picker.style.display = 'none';
            console.log('✅ [FLOATING] Emoji picker zamknięty');
        }
    }

    handleAttachments() {
        if (!this.currentUser) {
            alert('Wybierz użytkownika aby wysłać załącznik');
            return;
        }
        
        // Oznacz że wysyłanie jest z floating chat
        window.floatingChatSending = true;
        window.floatingChatCurrentUser = this.currentUser;
        
        // Użyj funkcji z głównego czatu
        if (window.chatManager) {
            window.chatManager.currentUser = this.currentUser;
            window.chatManager.showAttachmentDialog();
        }
    }

    handleVoiceRecording() {
        if (!this.currentUser) {
            alert('Wybierz użytkownika aby nagrać audio');
            return;
        }
        
        // Oznacz że nagrywanie jest z floating chat
        window.floatingChatRecording = true;
        window.floatingChatCurrentUser = this.currentUser;
        
        // Użyj globalnej funkcji nagrywania
        if (window.toggleVoiceRecording) {
            // Ustaw currentUser w chatManager
            if (window.chatManager) {
                window.chatManager.currentUser = this.currentUser;
            }
            window.toggleVoiceRecording();
        }
    }

    handleVideoRecording() {
        if (!this.currentUser) {
            alert('Wybierz użytkownika aby nagrać wideo');
            return;
        }
        
        // Oznacz że nagrywanie jest z floating chat
        window.floatingChatRecording = true;
        window.floatingChatCurrentUser = this.currentUser;
        
        // Użyj globalnej funkcji nagrywania
        if (window.toggleVideoRecording) {
            // Ustaw currentUser w chatManager
            if (window.chatManager) {
                window.chatManager.currentUser = this.currentUser;
            }
            window.toggleVideoRecording();
        }
    }
    };

} // Zamknięcie if (!window.FloatingChat)

// Funkcja pobierania mediów
window.downloadMedia = function(dataUrl, type, messageId) {
    const link = document.createElement('a');
    link.href = dataUrl;
    const extension = type === 'audio' ? 'webm' : 'mp4';
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `${type}_${timestamp}_${messageId}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('✅ Pobrano:', link.download);
};

// Funkcja pobierania załączników z floating chat
window.downloadFloatingAttachment = async function(messageId, fileIndex) {
    try {
        if (!window.floatingChat || !window.floatingChat.messages) {
            console.error('❌ Brak dostępu do wiadomości floating chat');
            return;
        }
        
        const msg = window.floatingChat.messages.find(m => m.id === messageId);
        if (!msg || !msg.attachments) {
            alert('Plik nie został znaleziony');
            return;
        }
        
        let attachments = msg.attachments;
        if (typeof attachments === 'string') {
            try {
                attachments = JSON.parse(attachments);
            } catch (e) {
                alert('Błąd parsowania załączników');
                return;
            }
        }
        
        if (!Array.isArray(attachments) || !attachments[fileIndex]) {
            alert('Plik nie został znaleziony');
            return;
        }
        
        const file = attachments[fileIndex];
        const link = document.createElement('a');
        link.href = file.data;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Pobrano załącznik z floating chat:', file.name);
    } catch (error) {
        console.error('❌ Błąd pobierania załącznika:', error);
        alert('Nie udało się pobrać pliku!');
    }
};

// Initialize after auth
window.initFloatingChat = function() {
    if (!window.floatingChat) {
        window.floatingChat = new FloatingChat();
        console.log('✅ Floating Chat Widget Ready!');
    }
};

console.log('✅ Floating Chat Widget Loaded!');
