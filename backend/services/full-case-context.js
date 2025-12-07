// ==========================================
// FULL CASE CONTEXT SERVICE
// Agreguje WSZYSTKIE dane sprawy dla AI
// Dokumenty + Obrazy + Komentarze + Wydarzenia + Zeznania
// ==========================================

const documentParser = require('./document-parser');
const { getDatabase } = require('../database/init');
const path = require('path');

/**
 * Pobiera PEŁNY kontekst sprawy dla AI
 * @param {number} caseId - ID sprawy
 * @returns {Object} - Pełny kontekst z wszystkimi danymi
 */
async function getFullCaseContext(caseId) {
    const db = getDatabase();
    const context = {
        caseData: null,
        documents: [],
        images: [],
        comments: [],
        events: [],
        witnesses: [],
        evidence: [],
        notes: [],
        totalChars: 0
    };
    
    try {
        console.log(`📚 Pobieranie PEŁNEGO kontekstu sprawy ${caseId}...`);
        
        // 1. DANE PODSTAWOWE SPRAWY
        context.caseData = await new Promise((resolve, reject) => {
            db.get(
                `SELECT c.*, 
                        cl.first_name || ' ' || cl.last_name as client_name,
                        cl.company_name,
                        cl.email as client_email,
                        cl.phone as client_phone
                 FROM cases c
                 LEFT JOIN clients cl ON c.client_id = cl.id
                 WHERE c.id = ?`,
                [caseId],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
        
        if (!context.caseData) {
            console.log('❌ Sprawa nie znaleziona');
            return context;
        }
        
        console.log('✅ Pobrano dane sprawy');
        
        // 2. DOKUMENTY (PDF/DOCX/TXT)
        try {
            const docs = await documentParser.getCaseDocuments(caseId);
            context.documents = docs;
            console.log(`✅ Pobrano ${docs.length} dokumentów`);
        } catch (error) {
            console.error('⚠️ Błąd pobierania dokumentów:', error.message);
        }
        
        // 3. OBRAZY (TODO: OCR w przyszłości)
        try {
            const images = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT id, file_name as filename, file_path as filepath, 
                            title, category, uploaded_at
                     FROM attachments 
                     WHERE case_id = ?
                     AND file_type IN ('image/jpeg', 'image/png', 'image/gif')
                     ORDER BY uploaded_at DESC
                     LIMIT 15`,
                    [caseId],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    }
                );
            });
            
            context.images = images;
            console.log(`✅ Znaleziono ${images.length} obrazów (OCR niedostępne)`);
        } catch (error) {
            console.error('⚠️ Błąd pobierania obrazów:', error.message);
        }
        
        // 4. KOMENTARZE
        try {
            const comments = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT c.*, u.name as author_name
                     FROM case_comments c
                     LEFT JOIN users u ON c.user_id = u.id
                     WHERE c.case_id = ?
                     ORDER BY c.created_at DESC
                     LIMIT 20`,
                    [caseId],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    }
                );
            });
            
            context.comments = comments;
            console.log(`✅ Pobrano ${comments.length} komentarzy`);
        } catch (error) {
            console.error('⚠️ Błąd pobierania komentarzy:', error.message);
        }
        
        // 5. WYDARZENIA/TERMINY
        try {
            const events = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT id, title, description, start_date, end_date, 
                            location, event_type, status
                     FROM events
                     WHERE case_id = ?
                     ORDER BY start_date DESC
                     LIMIT 20`,
                    [caseId],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    }
                );
            });
            
            context.events = events;
            console.log(`✅ Pobrano ${events.length} wydarzeń`);
        } catch (error) {
            console.error('⚠️ Błąd pobierania wydarzeń:', error.message);
        }
        
        // 6. ŚWIADKOWIE/ZEZNANIA
        try {
            const witnesses = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT id, name, role, testimony, contact_info, 
                            credibility_rating, notes
                     FROM witnesses
                     WHERE case_id = ?
                     ORDER BY created_at DESC
                     LIMIT 10`,
                    [caseId],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    }
                );
            });
            
            context.witnesses = witnesses;
            console.log(`✅ Pobrano ${witnesses.length} świadków/zeznań`);
        } catch (error) {
            console.error('⚠️ Błąd pobierania świadków:', error.message);
        }
        
        // 7. DOWODY
        try {
            const evidence = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT id, title, description, evidence_type, 
                            source, relevance, notes
                     FROM evidence
                     WHERE case_id = ?
                     ORDER BY created_at DESC
                     LIMIT 15`,
                    [caseId],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    }
                );
            });
            
            context.evidence = evidence;
            console.log(`✅ Pobrano ${evidence.length} dowodów`);
        } catch (error) {
            console.error('⚠️ Błąd pobierania dowodów:', error.message);
        }
        
        // 8. NOTATKI
        try {
            const notes = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT id, content, note_type, created_at
                     FROM case_notes
                     WHERE case_id = ?
                     ORDER BY created_at DESC
                     LIMIT 10`,
                    [caseId],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    }
                );
            });
            
            context.notes = notes;
            console.log(`✅ Pobrano ${notes.length} notatek`);
        } catch (error) {
            console.error('⚠️ Błąd pobierania notatek:', error.message);
        }
        
        // Oblicz łączną ilość znaków
        context.totalChars = context.documents.reduce((sum, doc) => sum + (doc.text?.length || 0), 0);
        
        console.log(`✅ PEŁNY KONTEKST SPRAWY ${caseId}:`);
        console.log(`   📄 Dokumenty: ${context.documents.length}`);
        console.log(`   🖼️ Obrazy: ${context.images.length}`);
        console.log(`   💬 Komentarze: ${context.comments.length}`);
        console.log(`   📅 Wydarzenia: ${context.events.length}`);
        console.log(`   👥 Świadkowie: ${context.witnesses.length}`);
        console.log(`   📎 Dowody: ${context.evidence.length}`);
        console.log(`   📝 Notatki: ${context.notes.length}`);
        console.log(`   💾 Łącznie znaków: ${context.totalChars}`);
        
        return context;
        
    } catch (error) {
        console.error('❌ Błąd pobierania pełnego kontekstu:', error);
        return context;
    }
}

/**
 * Formatuje pełny kontekst do promptu dla AI
 */
function formatFullContextForAI(fullContext, maxChars = 15000) {
    let prompt = '\n\n═══════════════════════════════════════\n';
    prompt += '📋 PEŁNY KONTEKST SPRAWY\n';
    prompt += '═══════════════════════════════════════\n\n';
    
    // 1. DANE SPRAWY
    if (fullContext.caseData) {
        const c = fullContext.caseData;
        prompt += '📊 DANE PODSTAWOWE:\n';
        prompt += `Numer sprawy: ${c.case_number}\n`;
        prompt += `Tytuł: ${c.title}\n`;
        prompt += `Typ: ${c.case_type}\n`;
        prompt += `Status: ${c.status}\n`;
        if (c.description) prompt += `Opis: ${c.description}\n`;
        if (c.client_name) prompt += `Klient: ${c.client_name}\n`;
        if (c.company_name) prompt += `Firma: ${c.company_name}\n`;
        prompt += '\n';
    }
    
    // 2. DOKUMENTY
    if (fullContext.documents.length > 0) {
        prompt += `📄 DOKUMENTY (${fullContext.documents.length}):\n\n`;
        fullContext.documents.forEach((doc, index) => {
            if (doc.text) {
                prompt += `--- DOKUMENT ${index + 1}: ${doc.filename} ---\n`;
                prompt += `${doc.text.substring(0, 2000)}\n`;
                if (doc.text.length > 2000) {
                    prompt += `[...skrócono, pełna długość: ${doc.text.length} znaków...]\n`;
                }
                prompt += '\n';
            }
        });
    }
    
    // 3. OBRAZY (lista)
    if (fullContext.images.length > 0) {
        prompt += `🖼️ OBRAZY/ZDJĘCIA (${fullContext.images.length}):\n`;
        fullContext.images.forEach((img, index) => {
            prompt += `${index + 1}. ${img.filename}`;
            if (img.title) prompt += ` - ${img.title}`;
            if (img.category) prompt += ` [${img.category}]`;
            prompt += '\n';
        });
        prompt += '✅ Uwaga: Tekst z obrazów jest rozpoznawany przez Google Cloud Vision OCR\n\n';
    }
    
    // 4. KOMENTARZE
    if (fullContext.comments.length > 0) {
        prompt += `💬 KOMENTARZE (${fullContext.comments.length}):\n\n`;
        fullContext.comments.slice(0, 5).forEach((comment, index) => {
            prompt += `${index + 1}. ${comment.author_name || 'Nieznany'} (${comment.created_at}):\n`;
            prompt += `   ${comment.comment_text || comment.content}\n\n`;
        });
    }
    
    // 5. WYDARZENIA
    if (fullContext.events.length > 0) {
        prompt += `📅 WYDARZENIA/TERMINY (${fullContext.events.length}):\n\n`;
        fullContext.events.slice(0, 10).forEach((event, index) => {
            prompt += `${index + 1}. ${event.title} - ${event.start_date}\n`;
            if (event.description) prompt += `   ${event.description}\n`;
            if (event.location) prompt += `   Miejsce: ${event.location}\n`;
            prompt += '\n';
        });
    }
    
    // 6. ŚWIADKOWIE/ZEZNANIA
    if (fullContext.witnesses.length > 0) {
        prompt += `👥 ŚWIADKOWIE/ZEZNANIA (${fullContext.witnesses.length}):\n\n`;
        fullContext.witnesses.forEach((witness, index) => {
            prompt += `${index + 1}. ${witness.name} - ${witness.role}\n`;
            if (witness.contact_info) {
                prompt += `   Kontakt: ${witness.contact_info}\n`;
            }
            if (witness.notes) {
                // NOTATKI - to jest KLUCZOWA informacja o świadku!
                prompt += `   📝 SZCZEGÓŁOWY OPIS ŚWIADKA:\n`;
                prompt += `   ${witness.notes.substring(0, 1000)}\n`;
                if (witness.notes.length > 1000) prompt += '   [...]\n';
            }
            if (witness.testimony) {
                prompt += `   💬 Zeznanie: ${witness.testimony.substring(0, 500)}\n`;
                if (witness.testimony.length > 500) prompt += '   [...]\n';
            }
            if (witness.credibility_rating) {
                prompt += `   ⭐ Wiarygodność: ${witness.credibility_rating}/10\n`;
            }
            prompt += '\n';
        });
    }
    
    // 7. DOWODY
    if (fullContext.evidence.length > 0) {
        prompt += `📎 DOWODY (${fullContext.evidence.length}):\n\n`;
        fullContext.evidence.forEach((ev, index) => {
            prompt += `${index + 1}. ${ev.title} [${ev.evidence_type}]\n`;
            if (ev.description) {
                prompt += `   Opis: ${ev.description}\n`;
            }
            if (ev.notes) {
                // NOTATKI o dowodzie - szczegółowe informacje!
                prompt += `   📝 Szczegóły: ${ev.notes.substring(0, 500)}\n`;
                if (ev.notes.length > 500) prompt += '   [...]\n';
            }
            if (ev.source) {
                prompt += `   Źródło: ${ev.source}\n`;
            }
            if (ev.relevance) {
                prompt += `   Istotność: ${ev.relevance}\n`;
            }
            prompt += '\n';
        });
    }
    
    // 8. NOTATKI
    if (fullContext.notes.length > 0) {
        prompt += `📝 NOTATKI (${fullContext.notes.length}):\n\n`;
        fullContext.notes.slice(0, 5).forEach((note, index) => {
            prompt += `${index + 1}. [${note.note_type}] ${note.created_at}\n`;
            prompt += `   ${note.content.substring(0, 200)}\n`;
            if (note.content.length > 200) prompt += '   [...]\n';
            prompt += '\n';
        });
    }
    
    prompt += '═══════════════════════════════════════\n';
    
    // Ogranicz długość jeśli za długi
    if (prompt.length > maxChars) {
        prompt = prompt.substring(0, maxChars) + '\n\n[...kontekst skrócony...]';
    }
    
    return prompt;
}

module.exports = {
    getFullCaseContext,
    formatFullContextForAI
};
