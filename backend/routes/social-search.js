// ==========================================
// SOCIAL SEARCHER ROUTES
// Weryfikacja firmy/osoby w social media
// ==========================================

const express = require('express');
const router = express.Router();
const socialSearcher = require('../services/api-integrations/social-searcher-service');

/**
 * POST /api/company/social-search
 * Wyszukaj w social media
 */
router.post('/', async (req, res) => {
    console.log('📨 POST /api/company/social-search');
    
    try {
        const { query, options } = req.body;
        
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Brak zapytania'
            });
        }
        
        console.log('🔍 Wyszukiwanie w social media:', query);
        const result = await socialSearcher.searchSocialMedia(query, options || {});
        
        return res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('❌ Error in /social-search:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
