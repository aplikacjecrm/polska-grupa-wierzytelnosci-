// ==========================================
// EVENT BUS - KOMUNIKACJA MIĘDZY MODUŁAMI
// ==========================================

class EventBus {
    constructor() {
        this.listeners = new Map();
        this.debug = window.appConfig?.eventBus?.debug || false;
        console.log('📡 Event Bus zainicjalizowany');
    }
    
    // Emit (wyślij) wydarzenie
    emit(eventName, data = {}) {
        if (this.debug) {
            console.log(`📡 Event: ${eventName}`, data);
        }
        
        // Użyj CustomEvent dla zgodności
        const event = new CustomEvent(eventName, { 
            detail: {
                ...data,
                timestamp: new Date().toISOString(),
                eventName: eventName
            }
        });
        
        document.dispatchEvent(event);
        
        // Wywołaj również lokalne listenery
        if (this.listeners.has(eventName)) {
            this.listeners.get(eventName).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`❌ Błąd w handlerze ${eventName}:`, error);
                }
            });
        }
    }
    
    // On (nasłuchuj) wydarzenia
    on(eventName, handler) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        
        this.listeners.get(eventName).push(handler);
        
        if (this.debug) {
            console.log(`👂 Zarejestrowano listener: ${eventName}`);
        }
        
        // Zwróć funkcję do odrejestrowania
        return () => this.off(eventName, handler);
    }
    
    // Off (przestań nasłuchiwać)
    off(eventName, handler) {
        if (this.listeners.has(eventName)) {
            const handlers = this.listeners.get(eventName);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    
    // Once (nasłuchuj raz)
    once(eventName, handler) {
        const onceHandler = (data) => {
            handler(data);
            this.off(eventName, onceHandler);
        };
        return this.on(eventName, onceHandler);
    }
}

// Utwórz globalną instancję
window.eventBus = new EventBus();

// === STANDARDOWE WYDARZENIA W SYSTEMIE ===

// WYDARZENIA - EVENTS
// - event:created { eventId, caseId, eventType }
// - event:updated { eventId, changes }
// - event:deleted { eventId }

// SPRAWY - CASES
// - case:created { caseId, caseType }
// - case:updated { caseId, changes }
// - case:opened { caseId, caseData }
// - case:closed { caseId }

// KLIENCI - CLIENTS
// - client:created { clientId }
// - client:updated { clientId, changes }

// DOKUMENTY - DOCUMENTS
// - document:uploaded { documentId, caseId }
// - document:deleted { documentId }

// ŚWIADKOWIE - WITNESSES (nowy moduł)
// - witness:added { witnessId, caseId }
// - witness:withdrawn { witnessId, reason }
// - testimony:added { testimonyId, witnessId }
// - testimony:retracted { testimonyId }

// SCENARIUSZE - SCENARIOS (nowy moduł)
// - scenario:created { scenarioId, caseId }
// - scenario:activated { scenarioId }
// - scenario:completed { scenarioId, outcome }

// SPRAWY ZBIOROWE - COLLECTIVE (nowy moduł)
// - member:joined { memberId, caseId }
// - member:withdrawn { memberId, reason }
// - collective:threshold { caseId, count }

// === NOWE WYDARZENIA - ROZBUDOWA SYSTEMU ===

// DASHBOARDY - DASHBOARDS
// - dashboard:refresh { dashboardType }
// - dashboard:statsUpdated { stats }
// - dashboard:alertShow { title, message, type }
// - dashboard:chartUpdated { chartId, data }

// PŁATNOŚCI - PAYMENTS
// - payment:initiated { paymentId, amount, clientId }
// - payment:completed { paymentId, amount, clientId, method }
// - payment:failed { paymentId, amount, error }
// - payment:reminder { installmentId, amount, dueDate }
// - payment:overdue { installmentId, amount, daysOverdue }

// CZAT - CHAT
// - chat:newMessage { messageId, from, to, text }
// - chat:messageRead { messageId, readBy }
// - chat:typing { userId, conversationId }
// - chat:conversationOpened { conversationId, participants }
// - chat:autoMessage { to, text, triggeredBy }

// UŻYTKOWNICY - USERS
// - user:created { userId, role, name }
// - user:updated { userId, changes }
// - user:deleted { userId }
// - user:login { userId, timestamp }
// - user:logout { userId, timestamp }
// - user:roleChanged { userId, oldRole, newRole }

// KOSZTY - COSTS
// - cost:added { costId, caseId, amount }
// - cost:updated { costId, changes }
// - cost:paid { costId, amount, paymentDate }
// - cost:overdue { costId, amount, daysOverdue }
// - cost:approved { costId, approvedBy }

// FAKTURY - INVOICES
// - invoice:generated { invoiceId, invoiceNumber }
// - invoice:sent { invoiceId, sentTo }
// - invoice:paid { invoiceId, amount }
// - invoice:overdue { invoiceId, daysOverdue }

// GOOGLE WORKSPACE - GOOGLE
// - google:folderCreated { folderId, folderName, clientId }
// - google:fileUploaded { fileId, fileName, folderId }
// - google:emailSent { messageId, to, subject }
// - google:emailReceived { messageId, from, subject }

// LEADY - LEADS
// - lead:submitted { leadId, source }
// - lead:assigned { leadId, assignedTo }
// - lead:converted { leadId, clientId }
// - lead:rejected { leadId, reason }

console.log('✅ Event Bus gotowy do użycia - 50+ eventów zarejestrowanych');
