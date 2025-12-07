class SocketManager {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.listeners = {};
    }

    connect(token) {
        if (this.socket) {
            this.socket.disconnect();
        }

        this.socket = io('https://web-production-7504.up.railway.app');

        this.socket.on('connect', () => {
            console.log('✅ Połączono z serwerem Socket.IO');
            this.connected = true;
            this.socket.emit('authenticate', token);
        });

        this.socket.on('authenticated', (data) => {
            console.log('✅ Autoryzacja Socket.IO udana');
        });

        this.socket.on('authentication-error', (data) => {
            console.error('❌ Błąd autoryzacji Socket.IO:', data.error);
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Rozłączono z serwerem Socket.IO');
            this.connected = false;
        });

        this.socket.on('new-chat-message', (message) => {
            console.log('🔔 [SOCKET.JS] Otrzymano new-chat-message:', message);
            this.emit('new-chat-message', message);
            
            // Pokazuj powiadomienie TYLKO gdy czat zamknięty
            if (window.showGlobalChatNotification) {
                // ✅ NAPRAWA: NIE pokazuj powiadomienia o WŁASNYCH wiadomościach!
                const myUserId = Number(window.authManager?.currentUser?.id);
                const senderId = Number(message.sender_id);
                
                if (senderId === myUserId) {
                    console.log('🔕 Pomijam powiadomienie (to moja wiadomość)');
                    return;
                }
                
                const floatingChatOpen = window.floatingChat?.isOpen;
                const bigChatOpen = document.getElementById('chatPanel')?.classList.contains('active');
                
                if (!floatingChatOpen && !bigChatOpen) {
                    console.log('🔔 Pokazuję powiadomienie (czat zamknięty)');
                    window.showGlobalChatNotification(message);
                } else {
                    console.log('🔕 Pomijam powiadomienie (czat otwarty)');
                }
            }
        });

        this.socket.on('user-status-changed', (data) => {
            this.emit('user-status-changed', data);
        });

        this.socket.on('user-typing', (data) => {
            this.emit('user-typing', data);
        });

        this.socket.on('messages-read', (data) => {
            this.emit('messages-read', data);
        });

        this.socket.on('message-sent', (message) => {
            this.emit('message-sent', message);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    }

    sendMessage(receiverId, message, attachments = []) {
        if (!this.connected) {
            console.error('Socket nie jest połączony');
            return;
        }

        this.socket.emit('send-chat-message', {
            receiverId,
            message,
            attachments
        });
    }

    typing(receiverId, isTyping) {
        if (!this.connected) return;

        this.socket.emit('typing', {
            receiverId,
            isTyping
        });
    }

    markAsRead(senderId) {
        if (!this.connected) return;

        this.socket.emit('mark-as-read', { senderId });
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event, data) {
        if (!this.listeners[event]) return;

        this.listeners[event].forEach(callback => {
            callback(data);
        });
    }
}

const socketManager = new SocketManager();

