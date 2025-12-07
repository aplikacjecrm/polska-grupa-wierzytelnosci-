// ==========================================
// DOCUMENT PARSER SERVICE
// Ekstrakcja tekstu z PDF i DOCX dla AI
// ==========================================

const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const vision = require('@google-cloud/vision');

/**
 * Wyciąga tekst z pliku PDF
 */
async function extractTextFromPDF(filePath) {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);
        
        return {
            success: true,
            text: data.text,
            pages: data.numpages,
            metadata: data.metadata
        };
    } catch (error) {
        console.error('❌ Błąd parsowania PDF:', error);
        return {
            success: false,
            error: error.message,
            text: ''
        };
    }
}

/**
 * Wyciąga tekst z pliku DOCX
 */
async function extractTextFromDOCX(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        
        return {
            success: true,
            text: result.value,
            warnings: result.messages
        };
    } catch (error) {
        console.error('❌ Błąd parsowania DOCX:', error);
        return {
            success: false,
            error: error.message,
            text: ''
        };
    }
}

/**
 * Wyciąga tekst z obrazu za pomocą Google Cloud Vision OCR
 */
async function extractTextFromImage(filePath) {
    try {
        // Sprawdź czy Vision API jest skonfigurowane
        const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
        
        if (!apiKey) {
            console.log('⚠️ Google Cloud Vision API key brak - pomijam OCR');
            return {
                success: false,
                error: 'Brak klucza API Google Cloud Vision',
                text: '',
                ocr_skipped: true
            };
        }
        
        // Inicjalizuj klienta Vision API
        const client = new vision.ImageAnnotatorClient({
            apiKey: apiKey
        });
        
        // Wykonaj OCR
        const [result] = await client.textDetection(filePath);
        const detections = result.textAnnotations;
        
        if (!detections || detections.length === 0) {
            return {
                success: true,
                text: '',
                message: 'Nie wykryto tekstu na obrazie'
            };
        }
        
        // Pierwszy element zawiera cały tekst
        const fullText = detections[0].description || '';
        
        return {
            success: true,
            text: fullText,
            detections: detections.length,
            confidence: 'high'
        };
        
    } catch (error) {
        console.error('❌ Błąd OCR obrazu:', error.message);
        return {
            success: false,
            error: error.message,
            text: '',
            ocr_failed: true
        };
    }
}

/**
 * Wyciąga tekst z dowolnego dokumentu (auto-detect)
 */
async function extractTextFromDocument(filePath) {
    try {
        // Sprawdź czy plik istnieje
        await fs.access(filePath);
        
        const ext = path.extname(filePath).toLowerCase();
        
        console.log(`📄 Parsowanie dokumentu: ${path.basename(filePath)} (${ext})`);
        
        switch (ext) {
            case '.pdf':
                return await extractTextFromPDF(filePath);
            
            case '.docx':
                return await extractTextFromDOCX(filePath);
            
            case '.doc':
                // .doc wymaga LibreOffice lub innego konwertera
                console.warn('⚠️ Format .doc nie jest jeszcze obsługiwany. Użyj .docx');
                return {
                    success: false,
                    error: 'Format .doc nie jest obsługiwany. Przekonwertuj na .docx',
                    text: ''
                };
            
            case '.txt':
                // Zwykły tekst
                const txtContent = await fs.readFile(filePath, 'utf-8');
                return {
                    success: true,
                    text: txtContent
                };
            
            case '.jpg':
            case '.jpeg':
            case '.png':
            case '.gif':
                // Obrazy - OCR za pomocą Google Cloud Vision
                return await extractTextFromImage(filePath);
            
            default:
                console.warn(`⚠️ Nieobsługiwane rozszerzenie: ${ext}`);
                return {
                    success: false,
                    error: `Nieobsługiwany format pliku: ${ext}`,
                    text: ''
                };
        }
        
    } catch (error) {
        console.error('❌ Błąd ekstrakcji tekstu:', error);
        return {
            success: false,
            error: error.message,
            text: ''
        };
    }
}

/**
 * Pobiera treść wszystkich dokumentów sprawy
 * @param {Array} documents - Lista dokumentów z bazy
 * @param {string} uploadsDir - Ścieżka do katalogu uploads
 * @param {number} maxCharsPerDoc - Max znaków z pojedynczego dokumentu
 * @returns {Object} - { success, documents: [{filename, text, truncated}], totalChars }
 */
async function extractCaseDocuments(documents, uploadsDir, maxCharsPerDoc = 5000) {
    const results = [];
    let totalChars = 0;
    
    console.log(`📚 Ekstrakcja ${documents.length} dokumentów sprawy...`);
    
    for (const doc of documents) {
        // Konstruuj pełną ścieżkę do pliku
        let filePath = doc.file_path || doc.filepath || '';
        
        // Jeśli ścieżka nie jest absolutna, dołącz uploadsDir
        if (!path.isAbsolute(filePath)) {
            filePath = path.join(uploadsDir, filePath);
        }
        
        console.log(`📄 Próba parsowania: ${doc.filename}`);
        console.log(`   Ścieżka: ${filePath}`);
        
        const result = await extractTextFromDocument(filePath);
        
        if (result.success) {
            // Ogranicz długość tekstu
            let text = result.text.trim();
            let truncated = false;
            
            if (text.length > maxCharsPerDoc) {
                text = text.substring(0, maxCharsPerDoc);
                truncated = true;
            }
            
            results.push({
                id: doc.id,
                filename: doc.filename,
                title: doc.title,
                category: doc.category,
                text: text,
                charCount: result.text.length,
                truncated: truncated,
                pages: result.pages || null
            });
            
            totalChars += text.length;
            
            console.log(`   ✅ Wyekstrahowano ${result.text.length} znaków (${truncated ? 'skrócono' : 'pełny'})`);
        } else {
            console.log(`   ❌ Nie udało się: ${result.error}`);
            
            results.push({
                id: doc.id,
                filename: doc.filename,
                title: doc.title,
                category: doc.category,
                text: '',
                error: result.error,
                truncated: false
            });
        }
    }
    
    console.log(`📚 Ekstrakcja zakończona: ${totalChars} znaków z ${results.filter(r => r.text).length}/${documents.length} dokumentów`);
    
    return {
        success: true,
        documents: results,
        totalChars: totalChars,
        successCount: results.filter(r => r.text).length,
        totalCount: documents.length
    };
}

/**
 * Formatuje wyekstrahowane dokumenty do promptu dla AI
 */
function formatDocumentsForPrompt(extractedDocs) {
    if (!extractedDocs.documents || extractedDocs.documents.length === 0) {
        return '';
    }
    
    let prompt = '\n\n📄 DOKUMENTY SPRAWY:\n';
    
    extractedDocs.documents.forEach((doc, index) => {
        if (doc.text) {
            prompt += `\n--- DOKUMENT ${index + 1}: ${doc.filename} ---\n`;
            if (doc.category) prompt += `Kategoria: ${doc.category}\n`;
            if (doc.title) prompt += `Tytuł: ${doc.title}\n`;
            prompt += `\nTreść:\n${doc.text}\n`;
            if (doc.truncated) {
                prompt += `\n[...dokument skrócony, wyświetlono ${doc.charCount} znaków...]\n`;
            }
            prompt += `--- KONIEC DOKUMENTU ${index + 1} ---\n`;
        }
    });
    
    prompt += `\nŁącznie: ${extractedDocs.successCount}/${extractedDocs.totalCount} dokumentów, ${extractedDocs.totalChars} znaków.\n`;
    
    return prompt;
}

/**
 * Pobiera i parsuje wszystkie dokumenty sprawy
 * @param {number} caseId - ID sprawy
 * @returns {Array} - Tablica dokumentów z wyekstrahowanym tekstem
 */
async function getCaseDocuments(caseId) {
    const { getDatabase } = require('../database/init');
    const db = getDatabase();
    
    try {
        console.log(`📄 getCaseDocuments: Pobieram dokumenty sprawy ${caseId}...`);
        
        // NOWA WERSJA: Pobierz z ATTACHMENTS (dokumenty + obrazy do OCR!)
        const documents = await new Promise((resolve, reject) => {
            db.all(
                `SELECT id, case_id, entity_type, entity_id,
                        file_name as filename,
                        file_path as filepath,
                        file_type,
                        title,
                        category,
                        uploaded_at
                 FROM attachments 
                 WHERE case_id = ?
                 AND (
                    file_type IN ('application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain')
                    OR file_type IN ('image/jpeg', 'image/png', 'image/gif')
                 )
                 ORDER BY uploaded_at DESC
                 LIMIT 15`,
                [caseId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });
        
        if (documents.length === 0) {
            console.log('📄 Brak dokumentów w sprawie');
            return [];
        }
        
        console.log(`📄 Znaleziono ${documents.length} dokumentów`);
        
        // Ścieżka do uploads
        const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
        
        // Parsuj dokumenty
        const extracted = await extractCaseDocuments(documents, uploadsDir, 3000);
        
        if (extracted.successCount === 0) {
            console.log('⚠️ Nie udało się sparsować żadnego dokumentu');
            return [];
        }
        
        console.log(`✅ Sparsowano ${extracted.successCount}/${documents.length} dokumentów`);
        
        // Zwróć tylko dokumenty z tekstem
        return extracted.documents.filter(doc => doc.text);
        
    } catch (error) {
        console.error('❌ Błąd getCaseDocuments:', error);
        return [];
    }
}

module.exports = {
    extractTextFromPDF,
    extractTextFromDOCX,
    extractTextFromImage,  // 🆕 OCR dla obrazów!
    extractTextFromDocument,
    extractCaseDocuments,
    formatDocumentsForPrompt,
    getCaseDocuments
};
