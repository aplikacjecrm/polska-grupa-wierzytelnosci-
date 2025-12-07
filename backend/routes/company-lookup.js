// ==========================================
// COMPANY LOOKUP ROUTES
// Endpointy do weryfikacji kontrahentów
// ==========================================

const express = require('express');
const router = express.Router();

// ==========================================
// TEST ENDPOINT - Sprawdź czy backend działa
// ==========================================

router.get('/api/company/test', async (req, res) => {
    res.json({ 
        success: true, 
        message: 'Company Lookup API is working!',
        apifyConfigured: !!process.env.APIFY_API_TOKEN
    });
});

// ==========================================
// APIFY - Facebook Groups
// ==========================================

// WAŻNE: Wymuszam wczytanie przy starcie aby załadować grupy FB z config!
const apifyService = require('../services/api-integrations/apify-service');
console.log('✅ Apify Service załadowany w company-lookup.js');

// DEBUG ENDPOINT - pokaż wczytane grupy
router.get('/api/company/facebook-groups/debug', async (req, res) => {
    const apifyServiceModule = require('../services/api-integrations/apify-service');
    res.json({
        message: 'Debug info',
        moduleLoaded: !!apifyServiceModule,
        functionExists: typeof apifyServiceModule.searchFacebookGroups === 'function'
    });
});

router.post('/api/company/facebook-groups', async (req, res) => {
    const { query, groups } = req.body;
    
    if (!query) {
        return res.status(400).json({ 
            success: false, 
            error: 'Brak zapytania wyszukiwania' 
        });
    }
    
    try {
        console.log(`🔍 Company Lookup - Facebook Groups search for: ${query}`);
        const data = await apifyService.searchFacebookGroups(query, groups);
        res.json({ success: true, data });
    } catch (error) {
        console.error('❌ Facebook Groups search error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
