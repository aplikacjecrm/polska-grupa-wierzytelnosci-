/**
 * API ENDPOINTS DLA KOMEND POLICJI
 */

const express = require('express');
const router = express.Router();
const { POLICE_DATABASE } = require('../utils/police-database');
const { verifyToken } = require('../middleware/auth');

console.log('🚔 Ładowanie routera komend policji...');

// 🧪 TEST - endpoint bez autoryzacji
router.get('/test', (req, res) => {
    console.log('🧪 TEST endpoint policji wywołany!');
    res.json({ 
        status: 'OK', 
        message: 'Police router działa!',
        database_size: Object.keys(POLICE_DATABASE).length 
    });
});

// Wszystkie endpointy wymagają autoryzacji
router.use(verifyToken);

// 🔍 Wyszukiwanie komend policji
router.get('/search', (req, res) => {
    console.log('🔍 Wyszukiwanie komend policji, query:', req.query.q);
    console.log('🔑 User:', req.user ? 'OK' : 'BRAK');
    console.log('📦 Database size:', Object.keys(POLICE_DATABASE).length);
    try {
        const query = req.query.q ? req.query.q.toLowerCase().trim() : '';
        
        if (!query || query.length < 2) {
            return res.json([]);
        }
        
        // Filtruj komendy policji
        const results = Object.values(POLICE_DATABASE).filter(police => {
            const searchableText = `
                ${police.name}
                ${police.shortName}
                ${police.city}
                ${police.voivodeship}
                ${police.type}
                ${police.district || ''}
                ${police.address}
            `.toLowerCase();
            
            return searchableText.includes(query);
        });
        
        // Sortuj: najpierw wojewódzkie, potem miejskie
        results.sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'wojewodzka' ? -1 : 1;
            }
            return a.name.localeCompare(b.name, 'pl');
        });
        
        console.log(`✅ Znaleziono ${results.length} komend policji`);
        res.json(results);
    } catch (error) {
        console.error('❌ Błąd wyszukiwania komend policji:', error);
        res.status(500).json({ error: 'Błąd wyszukiwania' });
    }
});

// 📋 Pobierz wszystkie komendy policji
router.get('/all', (req, res) => {
    console.log('📋 Pobieranie wszystkich komend policji...');
    try {
        const allPolice = Object.values(POLICE_DATABASE);
        console.log(`✅ Zwracam ${allPolice.length} komend policji`);
        res.json(allPolice);
    } catch (error) {
        console.error('❌ Błąd pobierania komend policji:', error);
        res.status(500).json({ error: 'Błąd pobierania danych' });
    }
});

// 📍 Pobierz komendę policji po ID
router.get('/:id', (req, res) => {
    console.log('📍 Pobieranie komendy policji ID:', req.params.id);
    try {
        const police = POLICE_DATABASE[req.params.id];
        if (!police) {
            console.log('❌ Nie znaleziono komendy policji:', req.params.id);
            return res.status(404).json({ error: 'Nie znaleziono komendy policji' });
        }
        console.log('✅ Zwracam komendę:', police.name);
        res.json(police);
    } catch (error) {
        console.error('❌ Błąd pobierania komendy policji:', error);
        res.status(500).json({ error: 'Błąd pobierania danych' });
    }
});

module.exports = router;
