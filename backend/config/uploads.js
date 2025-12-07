/**
 * Centralna konfiguracja ścieżek uploadu plików
 * Na Railway używamy Volume mount w /app/data, lokalnie używamy standardowe ścieżki
 */

const path = require('path');
const fs = require('fs');

// Wykryj środowisko
const isProduction = process.env.RAILWAY_ENVIRONMENT === 'production' || process.env.NODE_ENV === 'production';

// Bazowa ścieżka dla uploadów
const UPLOADS_BASE = isProduction 
    ? '/app/data/uploads' 
    : path.join(__dirname, '../../uploads');

// Funkcja do tworzenia folderu jeśli nie istnieje
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log('📁 Utworzono folder:', dirPath);
    }
    return dirPath;
}

// Eksportuj ścieżki dla różnych typów plików
module.exports = {
    isProduction,
    UPLOADS_BASE,
    
    // Ścieżki dla różnych typów plików
    getUploadPath: (subFolder) => {
        const fullPath = path.join(UPLOADS_BASE, subFolder);
        return ensureDir(fullPath);
    },
    
    // Predefiniowane ścieżki
    paths: {
        documents: () => ensureDir(path.join(UPLOADS_BASE, 'documents')),
        caseDocuments: () => ensureDir(path.join(UPLOADS_BASE, 'case-documents')),
        attachments: () => ensureDir(path.join(UPLOADS_BASE, 'attachments')),
        clientFiles: () => ensureDir(path.join(UPLOADS_BASE, 'client-files')),
        comments: () => ensureDir(path.join(UPLOADS_BASE, 'comment-attachments')),
        contracts: () => ensureDir(path.join(UPLOADS_BASE, 'contracts')),
        cv: () => ensureDir(path.join(UPLOADS_BASE, 'cv')),
        employeeDocuments: () => ensureDir(path.join(UPLOADS_BASE, 'employee-documents')),
        taskAttachments: () => ensureDir(path.join(UPLOADS_BASE, 'task-attachments')),
        invoices: () => ensureDir(path.join(UPLOADS_BASE, 'invoices')),
        payments: () => ensureDir(path.join(UPLOADS_BASE, 'payment-receipts'))
    },
    
    // Log konfiguracji przy starcie
    logConfig: () => {
        console.log('📁 Upload config:');
        console.log('   - isProduction:', isProduction);
        console.log('   - UPLOADS_BASE:', UPLOADS_BASE);
    }
};
