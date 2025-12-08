const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const { logEmployeeActivity } = require('../utils/employee-activity');
const uploadConfig = require('../config/uploads');
const { documentsStorage, getFileUrl, deleteFile: deleteCloudinaryFile } = require('../config/cloudinary');

const router = express.Router();

// Wybierz storage: Cloudinary (produkcja) lub lokalny (dev)
const USE_CLOUDINARY = process.env.USE_CLOUDINARY !== 'false'; // Domyślnie używa Cloudinary
console.log('☁️ Documents storage:', USE_CLOUDINARY ? 'CLOUDINARY' : 'LOCAL');

// DEBUG: Log wszystkich requestów do /api/documents
router.use((req, res, next) => {
    console.log('🔵 DOCUMENTS ROUTER:', req.method, req.path, req.params);
    next();
});

// Pobierz dokumenty (dla klienta - po client_id)
router.get('/', verifyToken, (req, res) => {
    const db = getDatabase();
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { case_id } = req.query;
    
    let query = `
        SELECT d.*, u.name as uploaded_by_name, c.case_number, c.title as case_title
        FROM documents d
        LEFT JOIN users u ON d.uploaded_by = u.id
        LEFT JOIN cases c ON d.case_id = c.id
        WHERE 1=1
    `;
    const params = [];
    
    // FILTRUJ po case_id jeśli podano
    if (case_id) {
        query += ' AND d.case_id = ?';
        params.push(case_id);
    }
    
    // Klient widzi tylko swoje dokumenty (po client_id)
    if (userRole === 'client') {
        query += ' AND d.client_id IN (SELECT id FROM clients WHERE user_id = ?)';
        params.push(userId);
    }
    
    query += ' ORDER BY d.uploaded_at DESC';
    
    db.all(query, params, (err, documents) => {
        if (err) {
            console.error('Błąd pobierania dokumentów:', err);
            return res.status(500).json({ error: 'Błąd pobierania dokumentów' });
        }
        
        res.json({ documents: documents || [] });
    });
});

// Konfiguracja multer dla uploadu plików
// Używa Cloudinary (cloud) lub lokalny storage
const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = uploadConfig.paths.documents();
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Unikalna nazwa: timestamp_originalname
        const uniqueName = Date.now() + '_' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage: USE_CLOUDINARY ? documentsStorage : localStorage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB max
    },
    fileFilter: function (req, file, cb) {
        // Dozwolone typy plików
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Niedozwolony typ pliku. Dozwolone: PDF, obrazy, DOC, DOCX, XLS, XLSX, TXT'));
        }
    }
});

// Generuj unikalny kod dokumentu
router.post('/generate-code', verifyToken, async (req, res) => {
    const db = getDatabase();
    const { client_id, case_id } = req.body;

    try {
        // KLUCZOWE: Pobierz dane sprawy
        let caseData = null;
        if (case_id) {
            caseData = await new Promise((resolve, reject) => {
                db.get('SELECT case_number, case_type, client_id FROM cases WHERE id = ?', [case_id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
        }

        if (!caseData) {
            return res.status(404).json({ error: 'Sprawa jest wymagana do wygenerowania kodu dokumentu' });
        }

        // Pobierz client_id ze sprawy
        const clientId = caseData.client_id;

        // Pobierz dane klienta dla inicjałów
        const client = await new Promise((resolve, reject) => {
            db.get('SELECT first_name, last_name, company_name FROM clients WHERE id = ?', [clientId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!client) {
            return res.status(404).json({ error: 'Nie znaleziono klienta' });
        }

        // Generuj inicjały z obsługą duplikatów
        const firstName = client.first_name || '';
        const lastName = client.last_name || client.company_name || '';
        let initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'XX';
        
        // NOWY SYSTEM: Sprawdź duplikaty inicjałów
        const clientsWithSameInitials = await new Promise((resolve, reject) => {
          db.all(
            `SELECT id FROM clients 
             WHERE substr(upper(first_name), 1, 1) || substr(upper(COALESCE(last_name, company_name, '')), 1, 1) = ?
             AND id <= ?
             ORDER BY id ASC`,
            [initials, clientId],
            (err, rows) => {
              if (err) reject(err);
              else resolve(rows || []);
            }
          );
        });
        
        if (clientsWithSameInitials.length > 1) {
          const clientIndex = clientsWithSameInitials.findIndex(row => row.id === clientId) + 1;
          initials = `${initials}${clientIndex.toString().padStart(2, '0')}`;
          console.log(`📌 DOKUMENTY: Duplikat inicjałów! Klient ${clientId} to ${clientIndex}. inicjały → ${initials}`);
        }

        // NOWY FORMAT: Używamy pełnego numeru sprawy!
        // Np. sprawa: ODS/TK01/001 → dokument: ODS/TK01/001/DOK/005
        const caseNumber = caseData.case_number; // np. ODS/TK01/001
        
        // Znajdź NAJWYŻSZY numer dokumentu dla TEJ SPRAWY
        const searchPattern = `${caseNumber}/DOK/%`;
        
        const allCodes = await new Promise((resolve, reject) => {
            db.all(
                `SELECT document_code FROM documents 
                 WHERE case_id = ? 
                 AND document_code LIKE ?`,
                [case_id, searchPattern],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                }
            );
        });

        let nextNumber = 1;
        if (allCodes.length > 0) {
            // Wyciągnij wszystkie numery i znajdź MAX numerycznie
            const numbers = allCodes.map(row => {
                const parts = row.document_code.split('/');
                return parseInt(parts[parts.length - 1]) || 0; // ostatni segment jako liczba
            });
            const maxNumber = Math.max(...numbers);
            nextNumber = maxNumber + 1;
        }

        // NOWY FORMAT: ODS/TK01/001/DOK/005
        // Zawiera pełny numer sprawy + typ DOK + numer dokumentu
        const documentCode = `${caseNumber}/DOK/${nextNumber.toString().padStart(3, '0')}`;
        
        console.log(`✅ Wygenerowano kod dokumentu: ${documentCode} dla sprawy ${caseNumber}`);
        
        res.json({ documentCode });
    } catch (error) {
        console.error('Błąd generowania kodu dokumentu:', error);
        res.status(500).json({ error: 'Błąd generowania kodu dokumentu' });
    }
});

// Upload dokumentu do sprawy lub bezpośrednio do klienta
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    const db = getDatabase();
    const userId = req.user.userId;
    const { case_id, client_id, document_code, title, description, category } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: 'Brak pliku' });
    }
    
    // KLUCZOWE: Obsłuż zarówno case_id (sprawa) jak i client_id (bezpośredni upload do klienta)
    let finalClientId = client_id ? parseInt(client_id) : null;
    let finalCaseId = case_id ? parseInt(case_id) : null;
    
    // Jeśli jest case_id, pobierz client_id ze sprawy
    if (case_id && !finalClientId) {
        try {
            const caseData = await new Promise((resolve, reject) => {
                db.get('SELECT client_id FROM cases WHERE id = ?', [case_id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            
            if (caseData && caseData.client_id) {
                finalClientId = caseData.client_id;
                console.log(`✅ Auto-przypisano client_id=${finalClientId} dla dokumentu w sprawie ${case_id}`);
            }
        } catch (err) {
            console.error('Błąd pobierania client_id:', err);
        }
    }
    
    // Jeśli mamy client_id (bezpośrednio lub ze sprawy), wszystko OK
    if (!finalClientId && !finalCaseId) {
        return res.status(400).json({ error: 'Wymagany case_id lub client_id' });
    }
    
    console.log(`📎 Upload dokumentu: case_id=${finalCaseId}, client_id=${finalClientId}, category=${category}`);
    
    // Dla Cloudinary: req.file.path to URL, dla local to ścieżka
    const fileData = {
        case_id: finalCaseId,
        client_id: finalClientId,
        document_code: document_code || null,
        title: title || req.file.originalname,
        description: description || '',
        file_name: req.file.originalname,
        file_path: USE_CLOUDINARY ? req.file.path : req.file.path, // Cloudinary = URL, Local = path
        file_size: req.file.size,
        file_type: req.file.mimetype,
        category: category || 'general',
        uploaded_by: userId,
        cloudinary_id: USE_CLOUDINARY ? req.file.filename : null // ID w Cloudinary do usuwania
    };
    
    console.log(`☁️ Uploaded to ${USE_CLOUDINARY ? 'CLOUDINARY' : 'LOCAL'}:`, fileData.file_path);
    
    db.run(
        `INSERT INTO documents (case_id, client_id, document_code, title, description, file_name, file_path, file_size, file_type, category, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [fileData.case_id, fileData.client_id, fileData.document_code, fileData.title, fileData.description, fileData.file_name, 
         fileData.file_path, fileData.file_size, fileData.file_type, fileData.category, fileData.uploaded_by],
        function(err) {
            if (err) {
                // Usuń plik jeśli zapis do bazy się nie powiódł
                fs.unlinkSync(req.file.path);
                return res.status(500).json({ error: 'Błąd zapisu do bazy danych' });
            }
            
            const documentId = this.lastID;
            
            // 📊 LOGUJ AKTYWNOSĆ DO HR DASHBOARD
            logEmployeeActivity({
              userId: userId,
              actionType: 'document_upload',
              actionCategory: 'document',
              description: `Dodano dokument: ${fileData.title}`,
              caseId: finalCaseId,
              clientId: finalClientId,
              documentId: documentId
            });
            
            res.json({ 
                success: true, 
                documentId: documentId,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                client_id: finalClientId
            });
        }
    );
});

// Dodaj dokument z base64 (dla załączników wydarzeń)
router.post('/from-base64', verifyToken, async (req, res) => {
    const db = getDatabase();
    const userId = req.user.userId;
    const { case_id, event_id, file_name, file_data, file_type, file_size, title, description } = req.body;
    
    console.log('📎 Tworzę dokument z base64:', file_name);
    
    try {
        // Pobierz client_id ze sprawy
        let client_id = null;
        if (case_id) {
            const caseData = await new Promise((resolve, reject) => {
                db.get('SELECT client_id FROM cases WHERE id = ?', [case_id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });
            if (caseData) client_id = caseData.client_id;
        }
        
        // Utwórz folder uploads/documents jeśli nie istnieje (używa centralnej konfiguracji)
        const uploadDir = uploadConfig.paths.documents();
        console.log('📁 Base64 upload dir:', uploadDir);
        
        // Generuj unikalną nazwę pliku
        const uniqueName = Date.now() + '_' + file_name;
        const filePath = path.join(uploadDir, uniqueName);
        
        // Konwertuj base64 na plik
        const base64Data = file_data.replace(/^data:.*;base64,/, '');
        fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        
        console.log('✅ Plik zapisany:', filePath);
        
        // Zapisz w bazie
        db.run(
            `INSERT INTO documents (case_id, client_id, title, description, file_name, file_path, file_size, file_type, category, uploaded_by, event_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [case_id, client_id, title || file_name, description || `Załącznik z wydarzenia ${event_id}`, file_name, 
             filePath, file_size, file_type, 'event_attachment', userId, event_id],
            function(err) {
                if (err) {
                    console.error('❌ Błąd zapisu do bazy:', err);
                    // Usuń plik jeśli zapis do bazy się nie powiódł
                    try { fs.unlinkSync(filePath); } catch(e) {}
                    return res.status(500).json({ error: 'Błąd zapisu do bazy danych: ' + err.message });
                }
                
                console.log('✅ Dokument zapisany w bazie, ID:', this.lastID);
                
                res.json({ 
                    success: true, 
                    documentId: this.lastID,
                    fileName: file_name,
                    fileSize: file_size
                });
            }
        );
        
    } catch (error) {
        console.error('❌ Błąd tworzenia dokumentu:', error);
        res.status(500).json({ error: 'Błąd tworzenia dokumentu: ' + error.message });
    }
});

// Pobierz dokumenty sprawy (documents + attachments)
router.get('/case/:caseId', verifyToken, (req, res) => {
    const db = getDatabase();
    const { caseId } = req.params;
    
    console.log('📄 Pobieranie dokumentów dla sprawy:', caseId);
    
    // Pobierz zarówno documents jak i attachments
    db.all(
        `SELECT
            d.id,
            d.case_id,
            d.document_number,
            NULL as attachment_code,
            d.title,
            d.description,
            d.category,
            d.filename,
            d.filepath as file_path,
            d.file_size,
            d.file_type,
            d.uploaded_at,
            d.uploaded_by,
            u.name as uploaded_by_name,
            'document' as source_type
         FROM documents d
         LEFT JOIN users u ON d.uploaded_by = u.id
         WHERE d.case_id = ?

         UNION ALL

         SELECT
            a.id,
            a.case_id,
            NULL as document_number,
            a.attachment_code,
            a.title,
            a.description,
            a.category,
            a.file_name as filename,
            a.file_path,
            a.file_size,
            a.file_type,
            a.uploaded_at,
            a.uploaded_by,
            u.name as uploaded_by_name,
            'attachment' as source_type
         FROM attachments a
         LEFT JOIN users u ON a.uploaded_by = u.id
         WHERE a.case_id = ?

         ORDER BY uploaded_at DESC`,
        [caseId, caseId],
        (err, documents) => {
            if (err) {
                console.error('❌ Błąd pobierania dokumentów:', err);
                return res.status(500).json({ error: 'Błąd pobierania dokumentów' });
            }
            
            console.log(`✅ Znaleziono ${documents.length} dokumentów dla sprawy ${caseId}`);
            
            // Dodaj informację o rozmiarze w czytelnej formie
            const documentsWithSize = documents.map(doc => ({
                ...doc,
                file_size_readable: formatFileSize(doc.file_size)
            }));
            
            res.json({ documents: documentsWithSize });
        }
    );
});

// TEST endpoint - bez auth, tylko logging
router.get('/test-download/:id', (req, res) => {
    console.log('🧪 TEST DOWNLOAD ENDPOINT HIT! ID:', req.params.id);
    res.json({ 
        success: true, 
        message: 'Test endpoint działa!', 
        id: req.params.id,
        timestamp: new Date().toISOString()
    });
});

// Pobierz/wyświetl dokument (download endpoint)
router.get('/download/:id', verifyToken, (req, res) => {
    try {
        console.log('🔥 DOWNLOAD ENDPOINT HIT! ID:', req.params.id);
        console.log('🔥 User from token:', req.user);
        console.log('🔥 Query params:', req.query);
        
        const db = getDatabase();
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;
        
        console.log('📥 Pobieranie dokumentu ID:', id, 'przez użytkownika:', userId);
        
        db.get('SELECT * FROM documents WHERE id = ?', [id], (err, document) => {
            try {
                if (err) {
                    console.error('❌ Błąd pobierania dokumentu z DB:', err);
                    return res.status(500).json({ error: 'Błąd pobierania dokumentu' });
                }
                
                if (!document) {
                    console.error('❌ Dokument nie znaleziony ID:', id);
                    return res.status(404).json({ error: 'Dokument nie znaleziony' });
                }
                
                console.log('✅ Dokument znaleziony, sprawdzam uprawnienia...');
                
                // Sprawdź uprawnienia
                if (userRole === 'client') {
                    // Klient może pobrać tylko swoje dokumenty
                    db.get('SELECT id FROM clients WHERE user_id = ?', [userId], (clientErr, client) => {
                        if (clientErr || !client || document.client_id !== client.id) {
                            console.error('❌ Brak uprawnień dla klienta');
                            return res.status(403).json({ error: 'Brak uprawnień' });
                        }
                        console.log('✅ Uprawnienia OK, wysyłam plik...');
                        sendFile(document, req, res);
                    });
                } else {
                    // Admin/Lawyer może pobrać wszystkie
                    console.log('✅ Admin/Lawyer, wysyłam plik...');
                    sendFile(document, req, res);
                }
            } catch (innerErr) {
                console.error('💥 CRASH w db.get callback:', innerErr);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Internal error', details: innerErr.message });
                }
            }
        });
    } catch (outerErr) {
        console.error('💥 CRASH w download endpoint:', outerErr);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal error', details: outerErr.message });
        }
    }
});

function sendFile(document, req, res) {
    try {
        const filePath = document.filepath || document.file_path;
    
    console.log('📄 SEND FILE START - Path:', filePath);
    console.log('📄 Document:', {
        id: document.id,
        filename: document.filename || document.file_name,
        file_type: document.file_type,
        has_base64: !!document.file_data
    });
    
    // CLOUDINARY: Jeśli file_path to URL (zaczyna się od http), przekieruj
    if (filePath && (filePath.startsWith('http://') || filePath.startsWith('https://'))) {
        console.log('☁️ Cloudinary URL - przekierowuję:', filePath);
        return res.redirect(filePath);
    }
    
    // Sprawdź istnienie pliku
    const fileExists = filePath && fs.existsSync(filePath);
    console.log('📄 File exists?', fileExists);
    
    // Jeśli plik nie istnieje na dysku, użyj base64 z bazy
    if (!fileExists) {
        if (document.file_data) {
            console.log('📎 Plik nie na dysku, używam base64 z bazy');
            const buffer = Buffer.from(document.file_data, 'base64');
            const fileName = document.filename || document.file_name;
            const encodedFileName = encodeURIComponent(fileName);
            const safeFileName = fileName.replace(/[^\x00-\x7F]/g, '_');
            
            res.setHeader('Content-Type', document.file_type || 'application/octet-stream');
            res.setHeader('Content-Length', buffer.length);
            res.setHeader('Content-Disposition', `inline; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`);
            return res.send(buffer);
        }
        console.error('❌ Plik nie istnieje i brak base64:', filePath);
        return res.status(404).json({ error: 'Plik nie znaleziony' });
    }
    
    // Sprawdź czy to media (audio/wideo) - użyj streamingu z Range requests
    const isMedia = document.file_type && (
        document.file_type.startsWith('audio/') || 
        document.file_type.startsWith('video/')
    );
    
    if (isMedia) {
        // Streaming z obsługą Range requests (szybsze ładowanie wideo)
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;
        
        const fileName = document.filename || document.file_name;
        const encodedFileName = encodeURIComponent(fileName);
        // Bezpieczna nazwa ASCII dla starych przeglądarek (bez polskich znaków)
        const safeFileName = fileName.replace(/[^\x00-\x7F]/g, '_');
        
        if (range) {
            // Obsługa Range request - streaming częściowy
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = (end - start) + 1;
            
            console.log(`📹 Streaming wideo: ${start}-${end}/${fileSize} (${(chunkSize/1024/1024).toFixed(2)} MB)`);
            
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': document.file_type,
                'Content-Disposition': `inline; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`
            });
            
            const readStream = fs.createReadStream(filePath, { start, end });
            readStream.pipe(res);
        } else {
            // Pełny plik (pierwszy request)
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': document.file_type,
                'Accept-Ranges': 'bytes',
                'Content-Disposition': `inline; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`
            });
            
            const readStream = fs.createReadStream(filePath);
            readStream.pipe(res);
        }
        console.log('✅ Media streaming:', document.filename || document.file_name);
    } else {
        // Dla innych plików - standardowe wysyłanie
        const fileName = document.filename || document.file_name;
        const encodedFileName = encodeURIComponent(fileName);
        // Bezpieczna nazwa ASCII dla starych przeglądarek (bez polskich znaków)
        const safeFileName = fileName.replace(/[^\x00-\x7F]/g, '_');
        
        res.setHeader('Content-Type', document.file_type || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${safeFileName}"; filename*=UTF-8''${encodedFileName}`);
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
        fileStream.on('error', (err) => {
            console.error('❌ Błąd odczytu pliku:', err);
            res.status(500).json({ error: 'Błąd odczytu pliku' });
        });
        
        console.log('✅ Plik wysłany:', document.filename || document.file_name);
    }
    } catch (err) {
        console.error('💥 CRASH w sendFile:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal error in sendFile', details: err.message });
        }
    }
}

// Usuń dokument
router.delete('/:id', verifyToken, (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    db.get('SELECT * FROM documents WHERE id = ?', [id], (err, document) => {
        if (err) {
            return res.status(500).json({ error: 'Błąd pobierania dokumentu' });
        }
        
        if (!document) {
            return res.status(404).json({ error: 'Dokument nie znaleziony' });
        }
        
        // Tylko właściciel lub admin/lawyer może usunąć
        if (document.uploaded_by !== userId && !['admin', 'lawyer'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }
        
        // Usuń plik z dysku
        if (fs.existsSync(document.file_path)) {
            fs.unlinkSync(document.file_path);
        }
        
        // Usuń z bazy
        db.run('DELETE FROM documents WHERE id = ?', [id], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Błąd usuwania dokumentu' });
            }
            
            res.json({ success: true });
        });
    });
});

// 🗑️ TYMCZASOWY ENDPOINT - Usuwa problematyczny dokument (polskie znaki w nazwie)
// TYLKO DLA ADMINA - do usunięcia crashującego pliku na Railway
router.delete('/emergency-cleanup/:id', verifyToken, (req, res) => {
    const db = getDatabase();
    const { id } = req.params;
    
    // TYLKO ADMIN
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Tylko admin może usuwać dokumenty przez cleanup' });
    }
    
    console.log(`🗑️ EMERGENCY CLEANUP: Usuwam dokument ID: ${id} przez użytkownika: ${req.user.email}`);
    
    // Pobierz info o dokumencie
    db.get('SELECT * FROM documents WHERE id = ?', [id], (err, doc) => {
        if (err) {
            console.error('❌ Błąd odczytu:', err);
            return res.status(500).json({ error: err.message });
        }
        
        if (!doc) {
            return res.json({ message: `Dokument ${id} już nie istnieje`, deleted: false });
        }
        
        console.log('📄 Dokument do usunięcia:', {
            id: doc.id,
            filename: doc.filename || doc.file_name,
            filepath: doc.file_path || doc.filepath
        });
        
        // Usuń plik fizyczny jeśli istnieje
        const filePath = doc.file_path || doc.filepath;
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log('✅ Plik fizyczny usunięty:', filePath);
            } catch (e) {
                console.log('⚠️ Nie można usunąć pliku fizycznego:', e.message);
            }
        }
        
        // Usuń z bazy
        db.run('DELETE FROM documents WHERE id = ?', [id], (err) => {
            if (err) {
                console.error('❌ Błąd usuwania z bazy:', err);
                return res.status(500).json({ error: err.message });
            }
            
            console.log(`✅ Dokument ${id} usunięty z bazy przez ${req.user.email}`);
            
            // DODAJ WPIS DO HISTORII SPRAWY
            if (doc.case_id) {
                const historyEntry = `🗑️ Administrator usunął dokument: "${doc.filename || doc.file_name || doc.title || 'Dokument'}" (ID: ${doc.id})`;
                
                db.run(
                    `INSERT INTO case_history (case_id, action_type, description, performed_by, created_at) 
                     VALUES (?, ?, ?, ?, datetime('now'))`,
                    [doc.case_id, 'document_deleted', historyEntry, req.user.userId],
                    (histErr) => {
                        if (histErr) {
                            console.error('⚠️ Nie można dodać wpisu do historii:', histErr);
                        } else {
                            console.log(`✅ Dodano wpis do historii sprawy ${doc.case_id}`);
                        }
                    }
                );
            }
            
            res.json({
                message: `Dokument ${id} (${doc.filename || doc.file_name}) został usunięty`,
                deleted: true,
                document: {
                    id: doc.id,
                    filename: doc.filename || doc.file_name
                }
            });
        });
    });
});

// 🧹 ENDPOINT DO CZYSZCZENIA PUSTYCH WPISÓW DOKUMENTÓW (bez fizycznych plików)
// TYLKO DLA ADMINA
router.delete('/cleanup-empty', verifyToken, (req, res) => {
    const db = getDatabase();
    
    // TYLKO ADMIN
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Tylko admin może czyścić puste wpisy' });
    }
    
    console.log(`🧹 CLEANUP: Admin ${req.user.email} czyści puste wpisy dokumentów`);
    
    // Pobierz wszystkie dokumenty
    db.all('SELECT * FROM documents ORDER BY case_id, uploaded_at', [], (err, docs) => {
        if (err) {
            console.error('❌ Błąd odczytu dokumentów:', err);
            return res.status(500).json({ error: err.message });
        }
        
        console.log(`📄 Znaleziono ${docs.length} dokumentów w bazie`);
        
        const toDelete = [];
        const existing = [];
        
        docs.forEach(doc => {
            const filePath = doc.file_path || doc.filepath;
            const fileExists = filePath && fs.existsSync(filePath);
            
            if (!fileExists) {
                toDelete.push(doc);
                console.log(`❌ Plik nie istnieje: ID ${doc.id} - "${doc.title || doc.file_name}"`);
            } else {
                existing.push(doc);
                console.log(`✅ Plik istnieje: ID ${doc.id} - "${doc.title || doc.file_name}"`);
            }
        });
        
        if (toDelete.length === 0) {
            console.log('✅ Brak pustych wpisów!');
            return res.json({ 
                message: 'Brak pustych wpisów do usunięcia',
                total: docs.length,
                deleted: 0,
                remaining: existing.length
            });
        }
        
        // Usuń puste wpisy
        let deleted = 0;
        const deletedIds = [];
        
        toDelete.forEach((doc, index) => {
            db.run('DELETE FROM documents WHERE id = ?', [doc.id], (err) => {
                if (err) {
                    console.error(`❌ Błąd usuwania ID ${doc.id}:`, err);
                } else {
                    console.log(`✅ Usunięto ID ${doc.id}: "${doc.title || doc.file_name}"`);
                    deleted++;
                    deletedIds.push(doc.id);
                }
                
                // Odpowiedź po ostatnim
                if (index === toDelete.length - 1) {
                    setTimeout(() => {
                        res.json({
                            message: `Usunięto ${deleted} pustych wpisów`,
                            total: docs.length,
                            deleted: deleted,
                            deletedIds: deletedIds,
                            remaining: existing.length
                        });
                    }, 500);
                }
            });
        });
    });
});

// Pomocnicza funkcja formatowania rozmiaru pliku
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

module.exports = router;
