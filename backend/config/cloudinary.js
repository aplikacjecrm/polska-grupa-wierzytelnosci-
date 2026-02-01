/**
 * Konfiguracja Cloudinary - darmowy cloud storage dla plików
 * 25GB storage, 25GB bandwidth/miesiąc - całkowicie za darmo!
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Konfiguracja Cloudinary
// SECURITY: Removed hardcoded fallback keys - MUST be set in .env!
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('⚠️ CLOUDINARY: Missing credentials in .env - file uploads will not work!');
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️ Cloudinary config:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
    api_key_present: !!process.env.CLOUDINARY_API_KEY
});

// Storage dla dokumentów
const documentsStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'promeritum/documents',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'zip'],
        resource_type: 'auto', // Automatycznie wykrywa typ pliku
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `doc-${uniqueSuffix}`;
        }
    }
});

// Storage dla załączników
const attachmentsStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'promeritum/attachments',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'mp4', 'avi', 'mov'],
        resource_type: 'auto',
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `att-${uniqueSuffix}`;
        }
    }
});

// Storage dla plików klientów
const clientFilesStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'promeritum/client-files',
        allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
        resource_type: 'auto',
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return `client-${uniqueSuffix}`;
        }
    }
});

// Funkcja do usuwania pliku z Cloudinary
async function deleteFile(publicId) {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('🗑️ Cloudinary file deleted:', publicId, result);
        return result;
    } catch (error) {
        console.error('❌ Cloudinary delete error:', error);
        throw error;
    }
}

// Funkcja do pobierania URL pliku
function getFileUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
        secure: true,
        sign_url: false,
        ...options
    });
}

// Funkcja do generowania signed URL (bezpieczny download)
function getSecureUrl(publicId, expiresIn = 3600) {
    const timestamp = Math.round(Date.now() / 1000) + expiresIn;
    return cloudinary.url(publicId, {
        secure: true,
        sign_url: true,
        expires_at: timestamp,
        type: 'authenticated'
    });
}

module.exports = {
    cloudinary,
    documentsStorage,
    attachmentsStorage,
    clientFilesStorage,
    deleteFile,
    getFileUrl,
    getSecureUrl
};
