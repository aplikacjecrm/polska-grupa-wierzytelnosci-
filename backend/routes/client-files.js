const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

console.log('✅ client-files.js router loaded');

// Konfiguracja multer dla uploadu plików
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/client-files');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'client-' + req.params.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        console.log('🔍 Multer fileFilter check:', file.originalname, file.mimetype);
        
        // Dozwolone rozszerzenia plików
        const allowedExtensions = /\.(pdf|doc|docx|txt|jpg|jpeg|png|gif|xls|xlsx|zip|rar|odt)$/i;
        const hasValidExtension = allowedExtensions.test(file.originalname);
        
        // Lista dozwolonych MIME types
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
            'text/plain',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'application/zip',
            'application/x-rar-compressed',
            'application/vnd.oasis.opendocument.text' // .odt
        ];
        
        const hasValidMimetype = allowedMimeTypes.includes(file.mimetype);
        
        if (hasValidExtension || hasValidMimetype) {
            console.log('✅ File accepted');
            return cb(null, true);
        } else {
            console.log('❌ File rejected - ext:', path.extname(file.originalname), 'mime:', file.mimetype);
            cb(new Error('Niedozwolony typ pliku! Dozwolone: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, GIF, ZIP, RAR'));
        }
    }
});

// GET /api/clients/:id/files - Pobierz listę plików klienta  
router.get('/:id/files', verifyToken, (req, res) => {
    const clientId = req.params.id;
    const db = getDatabase();
    
    console.log('📥 GET files for client:', clientId);
    
    // sqlite3 używa CALLBACK API
    db.all(
        `SELECT 
            cf.id, cf.client_id, cf.document_number, cf.filename, cf.original_name, cf.file_path, 
            cf.file_size, cf.file_type, cf.category, cf.description, 
            cf.uploaded_by, cf.uploaded_at,
            u.name as uploaded_by_name,
            c.case_number
        FROM client_files cf
        LEFT JOIN users u ON cf.uploaded_by = u.id
        LEFT JOIN cases c ON cf.case_id = c.id
        WHERE cf.client_id = ?
        ORDER BY cf.uploaded_at DESC`,
        [clientId],
        (err, files) => {
            if (err) {
                console.error('Error fetching client files:', err);
                return res.status(500).json({ success: false, message: err.message });
            }
            console.log('📥 Found files:', files.length);
            res.json({ success: true, files: files || [] });
        }
    );
});

// POST /api/clients/:id/files - Upload pliku dla klienta (lub do sprawy)
router.post('/:id/files', verifyToken, (req, res, next) => {
    console.log('🔵 POST request received for client:', req.params.id);
    console.log('🔵 Content-Type:', req.headers['content-type']);
    console.log('🔵 Body keys:', Object.keys(req.body));
    next();
}, upload.single('file'), (err, req, res, next) => {
    // Multer error handler
    if (err) {
        console.error('❌ Multer error:', err.message);
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
}, (req, res) => {
    const clientId = req.params.id;
    const { category, description, case_id } = req.body;
    const userId = req.user.userId;
    const db = getDatabase();
    
    console.log('📤 Upload file for client:', clientId);
    console.log('📤 case_id:', case_id);
    console.log('📤 File:', req.file ? req.file.originalname : 'NO FILE');
    
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Brak pliku!' });
    }
    
    // Pobierz dane klienta do generowania numeru dokumentu
    db.get(
        'SELECT first_name, last_name FROM clients WHERE id = ?',
        [clientId],
        (err, clientInfo) => {
            if (err || !clientInfo) {
                console.error('❌ Error fetching client info:', err);
                return res.status(500).json({ success: false, message: 'Błąd pobierania danych klienta' });
            }

            // Wygeneruj inicjały klienta
            const initials = (clientInfo.first_name.charAt(0) + clientInfo.last_name.charAt(0)).toUpperCase();

            // sqlite3 używa CALLBACK API
            if (case_id && case_id !== '') {
                // Plik do sprawy - generuj numer bazowany na numerze sprawy
                db.get(
                    'SELECT case_number FROM cases WHERE id = ?',
                    [case_id],
                    (err, caseInfo) => {
                        if (err || !caseInfo) {
                            console.error('❌ Error fetching case info:', err);
                            return res.status(500).json({ success: false, message: 'Błąd pobierania danych sprawy' });
                        }

                        const caseNumber = caseInfo.case_number || 'BRAK';
                        const prefix = `DOK/${caseNumber}/`;

                        // Znajdź ostatni numer dokumentu w tej sprawie
                        db.get(
                            `SELECT document_number FROM documents 
                             WHERE case_id = ? AND document_number LIKE ?
                             ORDER BY document_number DESC LIMIT 1`,
                            [case_id, `${prefix}%`],
                            (err, lastDoc) => {
                                let nextNumber = 1;
                                if (lastDoc && lastDoc.document_number) {
                                    const lastNumberPart = lastDoc.document_number.split('/').pop();
                                    nextNumber = parseInt(lastNumberPart) + 1;
                                }

                                const documentNumber = `${prefix}${String(nextNumber).padStart(3, '0')}`;
                                console.log('📋 Wygenerowany numer dokumentu sprawy:', documentNumber);

                                // Dodaj do documents (sprawy) z numerem
                                db.run(
                                    `INSERT INTO documents 
                                    (document_number, case_id, client_id, title, description, filename, filepath, file_size, file_type, category, uploaded_by) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                                    [
                                        documentNumber,
                                        case_id,
                                        clientId,
                                        req.file.originalname,
                                        description || null,
                                        req.file.originalname,
                                        req.file.path,
                                        req.file.size,
                                        req.file.mimetype,
                                        category || 'general',
                                        userId
                                    ],
                                    function(err) {
                                        if (err) {
                                            console.error('❌ Error uploading to documents:', err);
                                            return res.status(500).json({ success: false, message: err.message });
                                        }
                                        console.log('✅ File added to documents, ID:', this.lastID);
                                        res.json({ 
                                            success: true, 
                                            message: 'Plik został dodany do sprawy!',
                                            fileId: this.lastID,
                                            documentNumber: documentNumber
                                        });
                                    }
                                );
                            }
                        );
                    }
                );
            } else {
                // Plik ogólny klienta - generuj numer bazowany na inicjałach i dacie
                const now = new Date();
                const year = now.getFullYear();
                const month = String(now.getMonth() + 1).padStart(2, '0');
                const prefix = `DOK/${initials}/${year}/${month}/`;

                // Znajdź ostatni numer dokumentu dla tego klienta w tym miesiącu
                db.get(
                    `SELECT document_number FROM client_files 
                     WHERE client_id = ? AND document_number LIKE ?
                     ORDER BY document_number DESC LIMIT 1`,
                    [clientId, `${prefix}%`],
                    (err, lastDoc) => {
                        let nextNumber = 1;
                        if (lastDoc && lastDoc.document_number) {
                            const lastNumberPart = lastDoc.document_number.split('/').pop();
                            nextNumber = parseInt(lastNumberPart) + 1;
                        }

                        const documentNumber = `${prefix}${String(nextNumber).padStart(3, '0')}`;
                        console.log('📋 Wygenerowany numer dokumentu klienta:', documentNumber);

                        // Dodaj do client_files z numerem
                        db.run(
                            `INSERT INTO client_files 
                            (document_number, client_id, filename, original_name, file_path, file_size, file_type, category, description, uploaded_by) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                documentNumber,
                                clientId,
                                req.file.filename,
                                req.file.originalname,
                                req.file.path,
                                req.file.size,
                                req.file.mimetype,
                                category || 'document',
                                description || null,
                                userId
                            ],
                            function(err) {
                                if (err) {
                                    console.error('❌ Error uploading to client_files:', err);
                                    return res.status(500).json({ success: false, message: err.message });
                                }
                                console.log('✅ File added to client_files, ID:', this.lastID);
                                res.json({ 
                                    success: true, 
                                    message: 'Plik został dodany!',
                                    fileId: this.lastID,
                                    documentNumber: documentNumber
                                });
                            }
                        );
                    }
                );
            }
        }
    );
});

// DELETE /api/clients/:id/files/:fileId - Usuń plik klienta (z client_files lub documents)
router.delete('/:id/files/:fileId', verifyToken, (req, res) => {
    const { id, fileId } = req.params;
    const db = getDatabase();
    
    console.log('🗑️ Usuwanie pliku:', fileId, 'dla klienta:', id);
    
    // Najpierw szukaj w client_files
    db.get(
        'SELECT file_path FROM client_files WHERE id = ? AND client_id = ?',
        [fileId, id],
        (err, file) => {
            if (err) {
                console.error('Error fetching file from client_files:', err);
                return res.status(500).json({ success: false, message: err.message });
            }
            
            if (file) {
                console.log('✅ Plik znaleziony w client_files, usuwam...');
                
                // Usuń plik z dysku
                fs.unlink(file.file_path).catch(error => {
                    console.error('Error deleting file from disk:', error);
                });
                
                // Usuń rekord z bazy
                db.run('DELETE FROM client_files WHERE id = ?', [fileId], (err) => {
                    if (err) {
                        console.error('Error deleting from database:', err);
                        return res.status(500).json({ success: false, message: err.message });
                    }
                    console.log('✅ Plik usunięty z client_files');
                    res.json({ success: true, message: 'Plik został usunięty!' });
                });
                return;
            }
            
            // Jeśli nie ma w client_files, szukaj w documents
            db.get(
                `SELECT d.filepath 
                 FROM documents d
                 JOIN cases c ON d.case_id = c.id
                 WHERE d.id = ? AND c.client_id = ?`,
                [fileId, id],
                (err, docFile) => {
                    if (err) {
                        console.error('Error fetching file from documents:', err);
                        return res.status(500).json({ success: false, message: err.message });
                    }
                    
                    if (!docFile) {
                        console.log('❌ Plik nie znaleziony w żadnej tabeli');
                        return res.status(404).json({ success: false, message: 'Plik nie znaleziony!' });
                    }
                    
                    console.log('✅ Plik znaleziony w documents, usuwam...');
                    
                    // Usuń plik z dysku
                    fs.unlink(docFile.filepath).catch(error => {
                        console.error('Error deleting file from disk:', error);
                    });
                    
                    // Usuń rekord z bazy
                    db.run('DELETE FROM documents WHERE id = ?', [fileId], (err) => {
                        if (err) {
                            console.error('Error deleting from database:', err);
                            return res.status(500).json({ success: false, message: err.message });
                        }
                        console.log('✅ Plik usunięty z documents');
                        res.json({ success: true, message: 'Plik został usunięty!' });
                    });
                }
            );
        }
    );
});

// GET /api/clients/:id/files/:fileId/download - Pobierz plik
router.get('/:id/files/:fileId/download', verifyToken, (req, res) => {
    const { id, fileId } = req.params;
    const db = getDatabase();
    
    console.log('📥 Pobieranie pliku:', fileId, 'dla klienta:', id);
    
    // Najpierw sprawdź client_files
    db.get(
        'SELECT file_path, original_name, filename FROM client_files WHERE id = ? AND client_id = ?',
        [fileId, id],
        (err, file) => {
            if (err) {
                console.error('❌ Error fetching file from client_files:', err);
                return res.status(500).json({ success: false, message: err.message });
            }
            
            if (file) {
                console.log('✅ File found in client_files:', file.original_name);
                return res.download(file.file_path, file.original_name || file.filename);
            }
            
            // Jeśli nie ma w client_files, szukaj w documents
            db.get(
                `SELECT d.filepath, d.filename, d.title 
                 FROM documents d
                 JOIN cases c ON d.case_id = c.id
                 WHERE d.id = ? AND c.client_id = ?`,
                [fileId, id],
                (err, docFile) => {
                    if (err) {
                        console.error('❌ Error fetching file from documents:', err);
                        return res.status(500).json({ success: false, message: err.message });
                    }
                    
                    if (!docFile) {
                        console.log('❌ File not found:', fileId);
                        return res.status(404).json({ success: false, message: 'Plik nie znaleziony!' });
                    }
                    
                    console.log('✅ File found in documents:', docFile.filename);
                    res.download(docFile.filepath, docFile.filename || docFile.title);
                }
            );
        }
    );
});

module.exports = router;
