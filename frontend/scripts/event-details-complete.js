// ✅ KOMPLETNA FUNKCJA WYŚWIETLANIA SZCZEGÓŁÓW WYDARZENIA
// Wersja: v1.0 - WSZYSTKIE POLA

console.log('📋 Event Details Complete - Ładowanie...');

window.viewEventDetails = async function(eventId) {
    // Pokaż okienko ładowania
    const loadingModal = document.createElement('div');
    loadingModal.id = 'eventLoadingModal';
    loadingModal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.85); display: flex; align-items: center;
        justify-content: center; z-index: 10000;
    `;
    loadingModal.innerHTML = `
        <div style="text-align: center; color: white;">
            <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 1.5s infinite;">📅</div>
            <div style="font-size: 1.3rem; font-weight: 600; margin-bottom: 15px;">Ładowanie wydarzenia...</div>
            <div style="width: 200px; height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; overflow: hidden; margin: 0 auto;">
                <div style="width: 30%; height: 100%; background: linear-gradient(90deg, #FFD700, #d4af37); border-radius: 3px; animation: loadingBar 1.5s ease-in-out infinite;"></div>
            </div>
            <style>
                @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
                @keyframes loadingBar { 0% { width: 0%; margin-left: 0%; } 50% { width: 60%; margin-left: 20%; } 100% { width: 0%; margin-left: 100%; } }
            </style>
        </div>
    `;
    document.body.appendChild(loadingModal);
    
    try {
        console.log(`📋 Ładuję szczegóły wydarzenia ID: ${eventId}`);
        
        // Pobierz szczegóły wydarzenia
        const response = await window.api.request(`/events/${eventId}`);
        const event = response.event;
        
        if (!event) {
            const loadingEl = document.getElementById('eventLoadingModal');
            if (loadingEl) loadingEl.remove();
            alert('❌ Nie znaleziono wydarzenia');
            return;
        }
        
        console.log('✅ Pobrano wydarzenie:', event);
        
        // Parsuj extra_data
        let extraData = {};
        try {
            extraData = typeof event.extra_data === 'string' ? JSON.parse(event.extra_data) : (event.extra_data || {});
        } catch (e) {
            console.error('❌ Błąd parsowania extra_data:', e);
            extraData = {};
        }
        
        // Mapowanie typów wydarzeń
        const typeNames = {
            'negotiation': '🤝 Negocjacje',
            'court': '⚖️ Rozprawa sądowa',
            'meeting': '👥 Spotkanie',
            'deadline': '⏰ Termin procesowy',
            'mediation': '🕊️ Mediacja',
            'expertise': '🔬 Ekspertyza/Oględziny',
            'document': '📄 Złożenie dokumentu',
            'hearing': '🗣️ Przesłuchanie',
            'consultation': '💼 Konsultacja',
            'task': '✅ Zadanie',
            'other': '📝 Inne'
        };
        
        const typeColors = {
            'negotiation': '#3B82F6', 'court': '#3B82F6', 'meeting': '#3B82F6',
            'deadline': '#3B82F6', 'mediation': '#3B82F6', 'expertise': '#3B82F6',
            'document': '#60A5FA', 'hearing': '#3B82F6', 'consultation': '#34495e',
            'task': '#16a085', 'other': '#95a5a6'
        };
        
        const typeName = typeNames[event.event_type] || '📅 Wydarzenie';
        const color = typeColors[event.event_type] || '#3B82F6';
        
        // ✅ NAPRAWA STREFY CZASOWEJ: Używa DateTimeUtils do konwersji UTC → lokalny
        const eventDate = window.DateTimeUtils 
            ? window.DateTimeUtils.parseUTCDate(event.start_date)
            : new Date(event.start_date);
        const dateStr = eventDate.toLocaleDateString('pl-PL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Funkcja renderowania szczegółów według typu
        const renderExtraDetails = () => {
            let html = '';
            
            // NEGOCJACJE
            if (event.event_type === 'negotiation') {
                html += `
                    <div style="background: #F8FAFC; border: 2px solid #3B82F6; border-radius: 10px; padding: 20px; margin: 20px 0;">
                        <h4 style="margin: 0 0 15px 0; color: #1565c0; font-size: 1.1rem;">🤝 Szczegóły negocjacji</h4>
                        ${extraData.negotiation_with ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Z kim negocjacje:</strong><br><span style="color: #1a2332; font-size: 1rem;">${extraData.negotiation_with}</span></div>` : ''}
                        ${extraData.negotiation_subject ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Przedmiot negocjacji:</strong><br><span style="color: #1a2332;">${extraData.negotiation_subject}</span></div>` : ''}
                        ${extraData.expected_result ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Oczekiwany rezultat:</strong><br><span style="color: #1a2332;">${extraData.expected_result}</span></div>` : ''}
                    </div>
                `;
            }
            
            // ROZPRAWA SĄDOWA
            else if (event.event_type === 'court') {
                html += `
                    <div style="background: #ffebee; border: 2px solid #3B82F6; border-radius: 10px; padding: 20px; margin: 20px 0;">
                        <h4 style="margin: 0 0 15px 0; color: #b71c1c; font-size: 1.1rem;">⚖️ Szczegóły rozprawy sądowej</h4>
                        ${extraData.court_signature ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Sygnatura akt:</strong><br><span style="color: #1a2332; font-size: 1rem; font-weight: 600;">${extraData.court_signature}</span></div>` : ''}
                        ${extraData.judge_name ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Sędzia prowadzący:</strong><br><span style="color: #1a2332;">${extraData.judge_name}</span></div>` : ''}
                        ${extraData.hearing_type ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Typ rozprawy:</strong><br><span style="color: #1a2332;">${extraData.hearing_type === 'first' ? 'Pierwsza' : extraData.hearing_type === 'continuation' ? 'Kontynuowana' : extraData.hearing_type === 'final' ? 'Końcowa' : 'Wyrok'}</span></div>` : ''}
                        ${extraData.witnesses ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Świadkowie do przesłuchania:</strong><br><span style="color: #1a2332;">${extraData.witnesses}</span></div>` : ''}
                        ${extraData.documents_to_present ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Dokumenty do przedstawienia:</strong><br><span style="color: #1a2332;">${extraData.documents_to_present}</span></div>` : ''}
                        
                        ${extraData.witness_ids && extraData.witness_ids.length > 0 ? `
                            <div style="margin: 15px 0; padding: 12px; background: rgba(255,255,255,0.7); border-radius: 8px;">
                                <strong style="color: #555;">👥 Wybrani świadkowie z systemu:</strong>
                                <div style="margin-top: 8px; color: #1a2332;">
                                    ${extraData.witness_ids.length} świadków dodanych
                                </div>
                            </div>
                        ` : ''}
                        
                        ${extraData.witness_testimony_ids && extraData.witness_testimony_ids.length > 0 ? `
                            <div style="margin: 15px 0; padding: 12px; background: rgba(255,255,255,0.7); border-radius: 8px;">
                                <strong style="color: #555;">📝 Zeznania świadków:</strong>
                                <div style="margin-top: 8px; color: #1a2332;">
                                    ${extraData.witness_testimony_ids.length} zeznań dodanych
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }
            
            // SPOTKANIE
            else if (event.event_type === 'meeting') {
                html += `
                    <div style="background: #F8FAFC; border: 2px solid #3B82F6; border-radius: 10px; padding: 20px; margin: 20px 0;">
                        <h4 style="margin: 0 0 15px 0; color: #1b5e20; font-size: 1.1rem;">👥 Szczegóły spotkania</h4>
                        ${extraData.meeting_participants ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Uczestnicy:</strong><br><span style="color: #1a2332;">${extraData.meeting_participants}</span></div>` : ''}
                        ${extraData.meeting_goal ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Cel spotkania:</strong><br><span style="color: #1a2332;">${extraData.meeting_goal}</span></div>` : ''}
                        ${extraData.meeting_agenda ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Agenda:</strong><br><span style="color: #1a2332; white-space: pre-line;">${extraData.meeting_agenda}</span></div>` : ''}
                    </div>
                `;
            }
            
            // TERMIN PROCESOWY
            else if (event.event_type === 'deadline') {
                html += `
                    <div style="background: #ffe6e6; border: 2px solid #dc3545; border-radius: 10px; padding: 20px; margin: 20px 0;">
                        <h4 style="margin: 0 0 15px 0; color: #721c24; font-size: 1.1rem;">⏰ Termin procesowy</h4>
                        ${extraData.deadline_type ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Typ terminu:</strong><br><span style="color: #1a2332;">${extraData.deadline_type}</span></div>` : ''}
                        ${extraData.consequences ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Konsekwencje przekroczenia:</strong><br><span style="color: #dc3545; font-weight: 600;">${extraData.consequences}</span></div>` : ''}
                        ${extraData.critical_deadline ? `<div style="margin: 15px 0; padding: 15px; background: #F8FAFC; border: 2px solid #3B82F6; border-radius: 8px; color: #666; font-weight: 700; font-size: 1.1rem;">🚨 KRYTYCZNY TERMIN - PRIORYTET ABSOLUTNY!</div>` : ''}
                    </div>
                `;
            }
            
            // MEDIACJA
            else if (event.event_type === 'mediation') {
                html += `
                    <div style="background: #f3e5f5; border: 2px solid #9c27b0; border-radius: 10px; padding: 20px; margin: 20px 0;">
                        <h4 style="margin: 0 0 15px 0; color: #4a148c; font-size: 1.1rem;">🕊️ Szczegóły mediacji</h4>
                        ${extraData.mediator_name ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Mediator:</strong><br><span style="color: #1a2332;">${extraData.mediator_name}</span></div>` : ''}
                        ${extraData.mediation_outcome ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Oczekiwany wynik:</strong><br><span style="color: #1a2332;">${extraData.mediation_outcome}</span></div>` : ''}
                        ${extraData.settlement_proposals ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Propozycje ugodowe:</strong><br><span style="color: #1a2332;">${extraData.settlement_proposals}</span></div>` : ''}
                    </div>
                `;
            }
            
            // EKSPERTYZA
            else if (event.event_type === 'expertise') {
                html += `
                    <div style="background: #F8FAFC; border: 2px solid #3B82F6; border-radius: 10px; padding: 20px; margin: 20px 0;">
                        <h4 style="margin: 0 0 15px 0; color: #e65100; font-size: 1.1rem;">🔬 Szczegóły ekspertyzy</h4>
                        ${extraData.expertise_type ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Rodzaj ekspertyzy:</strong><br><span style="color: #1a2332;">${extraData.expertise_type}</span></div>` : ''}
                        ${extraData.expert_name ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Ekspert:</strong><br><span style="color: #1a2332;">${extraData.expert_name}</span></div>` : ''}
                        ${extraData.expertise_scope ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Zakres ekspertyzy:</strong><br><span style="color: #1a2332;">${extraData.expertise_scope}</span></div>` : ''}
                    </div>
                `;
            }
            
            // ZŁOŻENIE DOKUMENTU
            else if (event.event_type === 'document') {
                html += `
                    <div style="background: #e0f2f1; border: 2px solid #009688; border-radius: 10px; padding: 20px; margin: 20px 0;">
                        <h4 style="margin: 0 0 15px 0; color: #004d40; font-size: 1.1rem;">📄 Szczegóły złożenia dokumentu</h4>
                        ${extraData.document_list ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Dokumenty do złożenia:</strong><br><span style="color: #1a2332;">${extraData.document_list}</span></div>` : ''}
                        ${extraData.submission_location ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Gdzie składane:</strong><br><span style="color: #1a2332;">${extraData.submission_location}</span></div>` : ''}
                        ${extraData.document_deadline ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Termin złożenia:</strong><br><span style="color: #dc3545; font-weight: 600;">${new Date(extraData.document_deadline).toLocaleDateString('pl-PL')}</span></div>` : ''}
                    </div>
                `;
            }
            
            // PRZESŁUCHANIE
            else if (event.event_type === 'hearing') {
                html += `
                    <div style="background: #fce4ec; border: 2px solid #3B82F6; border-radius: 10px; padding: 20px; margin: 20px 0;">
                        <h4 style="margin: 0 0 15px 0; color: #880e4f; font-size: 1.1rem;">🗣️ Szczegóły przesłuchania</h4>
                        ${extraData.witness_name ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Świadek:</strong><br><span style="color: #1a2332; font-weight: 600;">${extraData.witness_name}</span></div>` : ''}
                        ${extraData.witness_role ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Rola świadka:</strong><br><span style="color: #1a2332;">${extraData.witness_role}</span></div>` : ''}
                        ${extraData.key_questions ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Kluczowe pytania:</strong><br><span style="color: #1a2332; white-space: pre-line;">${extraData.key_questions}</span></div>` : ''}
                    </div>
                `;
            }
            
            // KONSULTACJA
            else if (event.event_type === 'consultation') {
                html += `
                    <div style="background: #eceff1; border: 2px solid #607d8b; border-radius: 10px; padding: 20px; margin: 20px 0;">
                        <h4 style="margin: 0 0 15px 0; color: #263238; font-size: 1.1rem;">💼 Szczegóły konsultacji</h4>
                        ${extraData.consultation_with ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Z kim:</strong><br><span style="color: #1a2332;">${extraData.consultation_with}</span></div>` : ''}
                        ${extraData.consultation_person ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Osoba:</strong><br><span style="color: #1a2332;">${extraData.consultation_person}</span></div>` : ''}
                        ${extraData.consultation_topic ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Temat:</strong><br><span style="color: #1a2332;">${extraData.consultation_topic}</span></div>` : ''}
                    </div>
                `;
            }
            
            // ZADANIE
            else if (event.event_type === 'task') {
                html += `
                    <div style="background: #e0f7fa; border: 2px solid #00bcd4; border-radius: 10px; padding: 20px; margin: 20px 0;">
                        <h4 style="margin: 0 0 15px 0; color: #006064; font-size: 1.1rem;">✅ Szczegóły zadania</h4>
                        ${extraData.task_responsible ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Odpowiedzialny:</strong><br><span style="color: #1a2332; font-weight: 600;">${extraData.task_responsible}</span></div>` : ''}
                        ${extraData.task_priority ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Priorytet:</strong><br><span style="color: #1a2332; font-weight: 600; text-transform: uppercase;">${extraData.task_priority}</span></div>` : ''}
                        ${extraData.task_status ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">Status:</strong><br><span style="color: ${extraData.task_status === 'completed' ? '#3B82F6' : extraData.task_status === 'in_progress' ? '#3B82F6' : '#999'}; font-weight: 600;">${extraData.task_status === 'completed' ? '✓ Ukończone' : extraData.task_status === 'in_progress' ? '⟳ W trakcie' : '○ Do zrobienia'}</span></div>` : ''}
                    </div>
                `;
            }
            
            return html;
        };
        
        // Renderowanie załączników (pliki z zakładki Dokumenty)
        const renderAttachments = () => {
            if (!extraData.existing_case_document_ids || extraData.existing_case_document_ids.length === 0) {
                return '';
            }
            
            return `
                <div style="background: #F8FAFC; border: 2px solid #3B82F6; border-radius: 10px; padding: 20px; margin: 20px 0;">
                    <h4 style="margin: 0 0 15px 0; color: #1565c0; font-size: 1.1rem;">📎 Załączone pliki</h4>
                    <div style="background: white; padding: 12px; border-radius: 8px;">
                        <p style="color: #1a2332; margin: 0;">📄 Załączono <strong>${extraData.existing_case_document_ids.length}</strong> plików z zakładki Dokumenty</p>
                    </div>
                </div>
            `;
        };
        
        // Renderowanie opisu
        const renderDescription = () => {
            if (!event.description) return '';
            
            return `
                <div style="background: #fff8e1; border: 2px solid #3B82F6; border-radius: 10px; padding: 20px; margin: 20px 0;">
                    <h4 style="margin: 0 0 15px 0; color: #f57c00; font-size: 1.1rem;">📝 Opis / Notatki</h4>
                    <div style="color: #1a2332; line-height: 1.6; white-space: pre-line;">${event.description}</div>
                </div>
            `;
        };
        
        // Płynne przejście z ładowania do modala
        const loadingEl = document.getElementById('eventLoadingModal');
        if (loadingEl) {
            loadingEl.style.transition = 'opacity 0.3s ease';
            loadingEl.style.opacity = '0';
            setTimeout(() => loadingEl.remove(), 300);
        }
        
        // Stwórz modal
        const modal = document.createElement('div');
        modal.id = 'eventDetailsModal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="
                background: white;
                border-radius: 20px;
                max-width: 900px;
                width: 95%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 80px rgba(0,0,0,0.5);
            ">
                <!-- Nagłówek -->
                <div style="
                    background: linear-gradient(135deg, ${color}, ${color}dd);
                    color: white;
                    padding: 30px;
                    border-radius: 20px 20px 0 0;
                    position: sticky;
                    top: 0;
                    z-index: 1;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div style="flex: 1;">
                            <div style="font-size: 2.5rem; margin-bottom: 10px;">${typeName.split(' ')[0]}</div>
                            <h2 style="margin: 0; font-size: 1.8rem; font-weight: 700;">${event.title}</h2>
                            <div style="margin-top: 12px; font-size: 1rem; opacity: 0.95;">
                                📅 ${dateStr}
                            </div>
                            ${event.event_code ? `<div style="margin-top: 8px; font-size: 0.9rem; opacity: 0.9;">🔢 ${event.event_code}</div>` : ''}
                        </div>
                        <button onclick="document.getElementById('eventDetailsModal').remove()" style="
                            background: rgba(255,255,255,0.2);
                            color: white;
                            border: none;
                            border-radius: 50%;
                            width: 50px;
                            height: 50px;
                            cursor: pointer;
                            font-size: 1.8rem;
                            font-weight: 700;
                            flex-shrink: 0;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">✕</button>
                    </div>
                </div>
                
                <!-- Zawartość -->
                <div style="padding: 30px;">
                    <!-- Podstawowe informacje -->
                    <div style="background: #f5f5f5; border: 2px solid #e0e0e0; border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                        <h4 style="margin: 0 0 15px 0; color: #333; font-size: 1.1rem;">📋 Podstawowe informacje</h4>
                        ${event.location ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">📍 Lokalizacja:</strong><br><span style="color: #1a2332; font-size: 1rem;">${event.location}</span></div>` : ''}
                        ${event.case_number ? `<div style="margin-bottom: 12px;"><strong style="color: #555;">📋 Numer sprawy:</strong><br><span style="color: #1a2332; font-weight: 600;">${event.case_number}</span></div>` : ''}
                    </div>
                    
                    <!-- Szczegóły specyficzne dla typu -->
                    ${renderExtraDetails()}
                    
                    <!-- Załączone pliki -->
                    ${renderAttachments()}
                    
                    <!-- Opis -->
                    ${renderDescription()}
                </div>
                
                <!-- Stopka -->
                <div style="
                    background: #f5f5f5;
                    padding: 20px 30px;
                    border-radius: 0 0 20px 20px;
                    display: flex;
                    gap: 15px;
                    justify-content: space-between;
                ">
                    <button onclick="window.generateEventReport(${eventId})" style="
                        background: linear-gradient(135deg, #3B82F6, #1E40AF);
                        color: white;
                        border: none;
                        padding: 14px 32px;
                        border-radius: 10px;
                        cursor: pointer;
                        font-weight: 700;
                        font-size: 1rem;
                        transition: all 0.2s;
                        box-shadow: 0 4px 15px rgba(102,126,234,0.4);
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(102,126,234,0.6)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(102,126,234,0.4)'">
                        📋 Generuj szczegółowy raport
                    </button>
                    <button onclick="document.getElementById('eventDetailsModal').remove()" style="
                        background: #95a5a6;
                        color: white;
                        border: none;
                        padding: 14px 32px;
                        border-radius: 10px;
                        cursor: pointer;
                        font-weight: 700;
                        font-size: 1rem;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='#7f8c8d'" onmouseout="this.style.background='#95a5a6'">
                        Zamknij
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Płynne pojawienie się modala
        const modalContent = modal.querySelector('div');
        if (modalContent) {
            modalContent.style.opacity = '0';
            modalContent.style.transform = 'scale(0.95)';
            modalContent.style.transition = 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
            
            requestAnimationFrame(() => {
                modalContent.style.opacity = '1';
                modalContent.style.transform = 'scale(1)';
            });
        }
        
    } catch (error) {
        // Usuń okienko ładowania w przypadku błędu
        const loadingEl = document.getElementById('eventLoadingModal');
        if (loadingEl) loadingEl.remove();
        
        console.error('❌ Błąd ładowania szczegółów wydarzenia:', error);
        alert('❌ Błąd: ' + error.message);
    }
};

console.log('✅ Event Details Complete - Załadowano!');
