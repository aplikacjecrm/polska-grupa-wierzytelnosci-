// 📋 GENERATOR KOMPLEKSOWEGO RAPORTU WYDARZENIA
// Szczegółowy raport do przygotowania się do rozprawy

console.log('📋 Event Report Generator - Ładowanie...');

window.generateEventReport = async function(eventId) {
    try {
        console.log(`📋 Generuję szczegółowy raport dla wydarzenia ${eventId}...`);
        
        // KROK 1: Wygeneruj raport w bazie i pobierz kod QR
        console.log('📡 Wysyłam żądanie generowania raportu do API...');
        const reportGenResponse = await window.api.request('/reports/generate', {
            method: 'POST',
            body: JSON.stringify({ eventId })
        });
        
        const reportCode = reportGenResponse.reportCode;
        const qrCodeUrl = reportGenResponse.qrCodeUrl;
        const reportUrl = reportGenResponse.reportUrl;
        const expiresAt = new Date(reportGenResponse.expiresAt);
        
        console.log(`✅ Raport wygenerowany: ${reportCode}`);
        console.log(`📱 QR Code URL: ${qrCodeUrl}`);
        console.log(`🔗 Report URL: ${reportUrl}`);
        console.log(`⏰ Wygasa: ${expiresAt.toLocaleString('pl-PL')}`);
        
        // Generuj AI rekomendacje w tle (nie blokuj)
        window.api.request(`/reports/${reportCode}/generate-ai`, {
            method: 'POST'
        }).then(aiResponse => {
            console.log('🤖 AI Rekomendacje wygenerowane:', aiResponse.recommendations);
        }).catch(aiError => {
            console.warn('⚠️ AI Rekomendacje nie zostały wygenerowane:', aiError.message);
        });
        
        // KROK 2: Pobierz szczegóły wydarzenia
        const eventResponse = await window.api.request(`/events/${eventId}`);
        const event = eventResponse.event;
        
        if (!event) {
            alert('❌ Nie znaleziono wydarzenia');
            return;
        }
        
        // Parsuj extra_data
        let extraData = {};
        try {
            extraData = typeof event.extra_data === 'string' ? JSON.parse(event.extra_data) : (event.extra_data || {});
        } catch (e) {
            extraData = {};
        }
        
        // Pobierz dane sprawy
        let caseData = null;
        let witnesses = [];
        let documents = [];
        let evidence = [];
        
        if (event.case_id) {
            try {
                const caseResponse = await window.api.request(`/cases/${event.case_id}`);
                caseData = caseResponse.case;
                
                // Pobierz świadków sprawy
                if (extraData.witness_ids && extraData.witness_ids.length > 0) {
                    const witnessesResponse = await window.api.request(`/cases/${event.case_id}/witnesses`);
                    const allWitnesses = witnessesResponse.witnesses || [];
                    witnesses = allWitnesses.filter(w => extraData.witness_ids.includes(w.id));
                    console.log('👤 Przykładowy świadek:', witnesses[0]); // Debug - sprawdź kod
                }
                
                // Pobierz dokumenty sprawy
                if (extraData.existing_case_document_ids && extraData.existing_case_document_ids.length > 0) {
                    const docsResponse = await window.api.request(`/cases/${event.case_id}/documents`);
                    const allDocs = docsResponse.documents || [];
                    documents = allDocs.filter(d => extraData.existing_case_document_ids.includes(d.id));
                    if (documents.length > 0) {
                        console.log('📄 Przykładowy dokument - WSZYSTKIE POLA:', documents[0]);
                    }
                }
                
                // Pobierz DOWODY sprawy
                try {
                    const evidenceResponse = await window.api.request(`/evidence?case_id=${event.case_id}`);
                    evidence = evidenceResponse.evidence || [];
                    console.log(`📋 Pobrano ${evidence.length} dowodów dla sprawy`);
                    if (evidence.length > 0) {
                        console.log('🔍 Przykładowy dowód:', evidence[0]); // Debug - sprawdź kod
                    }
                } catch (e) {
                    console.warn('Nie udało się pobrać dowodów:', e);
                }
            } catch (e) {
                console.warn('Nie udało się pobrać danych sprawy:', e);
            }
        }
        
        // Pobierz zeznania świadków
        let testimonies = [];
        if (extraData.witness_testimony_ids && extraData.witness_testimony_ids.length > 0) {
            try {
                const witnessesResponse = await window.api.request(`/cases/${event.case_id}/witnesses`);
                const allWitnesses = witnessesResponse.witnesses || [];
                
                for (const witness of allWitnesses) {
                    if (witness.testimony || witness.oral_testimony) {
                        testimonies.push({
                            witness_code: witness.witness_code || 'Brak kodu', // DODANO KOD ŚWIADKA
                            witness_name: `${witness.first_name} ${witness.last_name}`,
                            testimony: witness.oral_testimony || witness.testimony,
                            testimony_type: witness.oral_testimony ? 'Zeznania ustne' : 'Zeznania pisemne',
                            date: witness.created_at
                        });
                    }
                }
                if (testimonies.length > 0) {
                    console.log('📝 Przykładowe zeznanie:', testimonies[0]); // Debug - sprawdź kod
                }
            } catch (e) {
                console.warn('Nie udało się pobrać zeznań:', e);
            }
        }
        
        // Formatuj datę
        const eventDate = new Date(event.start_date);
        const dateStr = eventDate.toLocaleDateString('pl-PL', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Generuj HTML raportu
        const reportHtml = `
            <!DOCTYPE html>
            <html lang="pl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Raport - ${event.title}</title>
                <style>
                    * {
                        box-sizing: border-box;
                    }
                    
                    @page {
                        size: A4;
                        margin: 15mm 20mm;
                    }
                    
                    @media print {
                        body { 
                            margin: 0; 
                            padding: 0;
                            width: 100%;
                            max-width: none;
                        }
                        .no-print { display: none !important; }
                        .page-break { page-break-before: always; }
                        .section { 
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                        table { 
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                        tr { 
                            page-break-inside: avoid;
                            break-inside: avoid;
                        }
                        .header {
                            background: #3B82F6 !important;
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                            page-break-after: avoid;
                        }
                        h2 {
                            page-break-after: avoid;
                        }
                        * {
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                    }
                    
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #1a2332;
                        max-width: 210mm;
                        margin: 0 auto;
                        padding: 20px;
                        background: white;
                    }
                    
                    @media screen {
                        body {
                            padding: 20px;
                        }
                    }
                    
                    a img:hover {
                        border-color: #3B82F6 !important;
                        transform: scale(1.02);
                    }
                    
                    a:hover {
                        opacity: 0.8;
                    }
                    h1 { 
                        color: #3B82F6; 
                        border-bottom: 3px solid #3B82F6; 
                        padding-bottom: 10px;
                        margin-bottom: 30px;
                    }
                    h2 { 
                        color: #1E40AF; 
                        margin-top: 30px;
                        border-left: 5px solid #1E40AF;
                        padding-left: 15px;
                    }
                    h3 {
                        color: #555;
                        margin-top: 20px;
                    }
                    .section {
                        background: #f8f9fa;
                        padding: 20px;
                        border-radius: 10px;
                        margin-bottom: 20px;
                        border-left: 5px solid #3B82F6;
                    }
                    .critical {
                        background: #F8FAFC;
                        border-left: 5px solid #3B82F6;
                        padding: 15px;
                        margin: 20px 0;
                        font-weight: bold;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 15px 0;
                    }
                    th, td {
                        border: 1px solid #ddd;
                        padding: 12px;
                        text-align: left;
                    }
                    th {
                        background: #3B82F6;
                        color: white;
                        font-weight: 600;
                    }
                    tr:nth-child(even) {
                        background: #f8f9fa;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: 200px 1fr;
                        gap: 10px;
                        margin: 10px 0;
                    }
                    .label {
                        font-weight: 600;
                        color: #555;
                    }
                    .value {
                        color: #1a2332;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 40px;
                        padding: 30px;
                        background: linear-gradient(135deg, #3B82F6, #1E40AF);
                        color: white;
                        border-radius: 10px;
                    }
                    .footer {
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 2px solid #ddd;
                        text-align: center;
                        color: #666;
                        font-size: 0.9rem;
                    }
                    .witness-card {
                        background: white;
                        border: 2px solid #e0e0e0;
                        border-radius: 8px;
                        padding: 15px;
                        margin: 10px 0;
                    }
                    .testimony-box {
                        background: #f0f7ff;
                        border-left: 4px solid #3B82F6;
                        padding: 15px;
                        margin: 10px 0;
                        font-style: italic;
                    }
                    @media print {
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="no-print" style="position: fixed; top: 20px; right: 20px; z-index: 1000;">
                    <button onclick="window.print()" style="
                        background: #3B82F6;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 1rem;
                        box-shadow: 0 4px 15px rgba(102,126,234,0.4);
                    ">
                        🖨️ Drukuj raport
                    </button>
                    <button onclick="window.close()" style="
                        background: #95a5a6;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 1rem;
                        margin-left: 10px;
                    ">
                        ✕ Zamknij
                    </button>
                </div>
                
                <div class="header">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1;">
                            <h1 style="margin: 0; border: none; color: white;">📋 RAPORT PRZYGOTOWAWCZY</h1>
                            <p style="margin: 10px 0 0 0; font-size: 1.2rem;">Kod raportu: ${reportCode}</p>
                            <p style="margin: 5px 0 0 0; opacity: 0.9;">Wygenerowano: ${new Date().toLocaleString('pl-PL')}</p>
                            <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9rem;">⏰ Ważny do: ${expiresAt.toLocaleDateString('pl-PL')}</p>
                        </div>
                        <div style="text-align: center; background: white; padding: 15px; border-radius: 10px; margin-left: 20px;">
                            <a href="${reportUrl}" target="_blank" style="text-decoration: none; display: block;">
                                <img src="${qrCodeUrl}" alt="QR Code" style="display: block; width: 150px; height: 150px; margin: 0 auto 10px; cursor: pointer; border: 3px solid transparent; border-radius: 8px; transition: border-color 0.3s;">
                            </a>
                            <p style="margin: 5px 0 0 0; color: #3B82F6; font-weight: 600; font-size: 0.85rem;">📱 Zeskanuj lub kliknij</p>
                            <a href="${reportUrl}" target="_blank" style="display: block; margin-top: 8px; color: #1E40AF; font-size: 0.75rem; text-decoration: none; word-break: break-all; line-height: 1.3;">
                                🔗 Kliknij aby otworzyć
                            </a>
                        </div>
                    </div>
                </div>
                
                <!-- SEKCJA 1: DANE WYDARZENIA -->
                <div class="section">
                    <h2>📅 DANE WYDARZENIA</h2>
                    <div class="info-grid">
                        <div class="label">Kod wydarzenia:</div>
                        <div class="value"><strong>${event.event_code || 'Brak'}</strong></div>
                        
                        <div class="label">Data i godzina:</div>
                        <div class="value"><strong>${dateStr}</strong></div>
                        
                        ${event.case_number ? `
                            <div class="label">Numer sprawy:</div>
                            <div class="value"><strong>${event.case_number}</strong></div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- SEKCJA 2: DANE SPRAWY -->
                ${caseData ? `
                    <div class="section">
                        <h2>⚖️ DANE SPRAWY</h2>
                        <div class="info-grid">
                            <div class="label">Numer sprawy:</div>
                            <div class="value"><strong>${caseData.case_number}</strong></div>
                            
                            <div class="label">Typ sprawy:</div>
                            <div class="value">${caseData.case_type || 'Nie podano'}</div>
                        </div>
                    </div>
                ` : ''}
                
                <!-- SEKCJA 3: SZCZEGÓŁY ROZPRAWY -->
                ${event.event_type === 'court' ? `
                    <div class="section">
                        <h2>⚖️ SZCZEGÓŁY ROZPRAWY SĄDOWEJ</h2>
                        <div class="info-grid">
                            ${extraData.court_signature ? `
                                <div class="label">Sygnatura akt:</div>
                                <div class="value"><strong>${extraData.court_signature}</strong></div>
                            ` : ''}
                            
                            ${extraData.hearing_type ? `
                                <div class="label">Typ rozprawy:</div>
                                <div class="value">${extraData.hearing_type === 'first' ? 'Pierwsza' : extraData.hearing_type === 'continuation' ? 'Kontynuowana' : extraData.hearing_type === 'final' ? 'Końcowa' : 'Wyrok'}</div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
                
                ${extraData.critical_deadline ? `
                    <div class="critical">
                        🚨 <strong>UWAGA: KRYTYCZNY TERMIN - PRIORYTET ABSOLUTNY!</strong>
                    </div>
                ` : ''}
                
                <!-- SEKCJA 4: ŚWIADKOWIE -->
                ${witnesses.length > 0 ? `
                    <div class="section">
                        <h2>👥 ŚWIADKOWIE DO PRZESŁUCHANIA (${witnesses.length})</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Lp.</th>
                                    <th>Kod świadka</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${witnesses.map((witness, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td><strong>${witness.witness_code || 'Brak kodu'}</strong></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                
                <!-- SEKCJA 5: ZEZNANIA ŚWIADKÓW -->
                ${testimonies.length > 0 ? `
                    <div class="section">
                        <h2>📝 ZEZNANIA ŚWIADKÓW (${testimonies.length})</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Lp.</th>
                                    <th>Kod świadka</th>
                                    <th>Typ zeznania</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${testimonies.map((testimony, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td><strong>${testimony.witness_code}</strong></td>
                                        <td>${testimony.testimony_type}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                
                <!-- SEKCJA 6: DOWODY SPRAWY -->
                ${evidence.length > 0 ? `
                    <div class="section">
                        <h2>📋 DOWODY W SPRAWIE (${evidence.length})</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Lp.</th>
                                    <th>Kod dowodu</th>
                                    <th>Typ dowodu</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${evidence.map((item, index) => {
                                    const typeNames = {
                                        'document': '📄 Dokument',
                                        'photo': '📸 Zdjęcie',
                                        'video': '🎥 Wideo',
                                        'audio': '🎵 Audio',
                                        'physical': '📦 Fizyczny',
                                        'digital': '💾 Cyfrowy',
                                        'testimony': '🗣️ Zeznanie',
                                        'expert_opinion': '🔬 Opinia',
                                        'other': '📎 Inne'
                                    };
                                    const typeName = typeNames[item.evidence_type] || '📎 Inne';
                                    
                                    return `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td><strong>${item.evidence_code || 'Brak kodu'}</strong></td>
                                            <td>${typeName}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                
                <!-- SEKCJA 7: ZAŁĄCZONE DOKUMENTY -->
                ${documents.length > 0 ? `
                    <div class="section">
                        <h2>📎 ZAŁĄCZONE DOKUMENTY DO WYDARZENIA (${documents.length})</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Lp.</th>
                                    <th>Numer dokumentu</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${documents.map((doc, index) => {
                                    console.log(`📄 Dokument #${index + 1} WSZYSTKIE POLA:`, doc);
                                    
                                    // Spróbuj wszystkich możliwych pól
                                    const docCode = doc.file_code || doc.document_code || doc.code || doc.document_number || doc.file_number || doc.serial_code || 'BRAK KODU';
                                    
                                    return `
                                        <tr>
                                            <td>${index + 1}</td>
                                            <td><strong>${docCode}</strong></td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                
                <!-- STOPKA -->
                <div class="footer">
                    <p><strong>Raport wygenerowany przez system E-PGW</strong></p>
                    <p>Data wygenerowania: ${new Date().toLocaleString('pl-PL')}</p>
                    <p style="font-size: 0.85rem; margin-top: 10px;">
                        Ten raport zawiera informacje poufne. Należy go przechowywać w sposób bezpieczny.
                    </p>
                </div>
            </body>
            </html>
        `;
        
        // Otwórz raport w nowym oknie
        const reportWindow = window.open('', '_blank', 'width=900,height=800');
        reportWindow.document.write(reportHtml);
        reportWindow.document.close();
        
        console.log('✅ Raport wygenerowany pomyślnie!');
        
    } catch (error) {
        console.error('❌ Błąd generowania raportu:', error);
        alert('❌ Błąd generowania raportu: ' + error.message);
    }
};

console.log('✅ Event Report Generator - Załadowano!');
