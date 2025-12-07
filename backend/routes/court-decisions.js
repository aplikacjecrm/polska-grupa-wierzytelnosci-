// 📥 API DLA ORZECZEŃ SĄDOWYCH

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');

// GET /api/court-decisions/article/:articleId - Orzeczenia dla artykułu
router.get('/article/:articleId', (req, res) => {
    const articleId = req.params.articleId;
    const db = new sqlite3.Database(DB_PATH);
    
    db.all(`
        SELECT 
            cd.id,
            cd.court_type,
            cd.signature,
            cd.decision_date,
            cd.decision_type,
            cd.result,
            cd.summary,
            cd.judge_name,
            cd.source_url,
            cd.legal_base,
            da.article_reference
        FROM court_decisions cd
        JOIN decision_articles da ON cd.id = da.decision_id
        WHERE da.legal_act_id = ?
        ORDER BY cd.decision_date DESC
        LIMIT 50
    `, [articleId], (err, rows) => {
        db.close();
        
        if (err) {
            console.error('❌ Błąd pobierania orzeczeń:', err.message);
            return res.status(500).json({ error: err.message });
        }
        
        res.json({
            success: true,
            count: rows.length,
            decisions: rows
        });
    });
});

// GET /api/court-decisions/search - Wyszukiwanie orzeczeń
router.get('/search', (req, res) => {
    const query = req.query.q || '';
    const limit = parseInt(req.query.limit) || 20;
    
    const db = new sqlite3.Database(DB_PATH);
    
    db.all(`
        SELECT 
            id,
            court_type,
            signature,
            decision_date,
            decision_type,
            summary,
            legal_base
        FROM court_decisions
        WHERE 
            signature LIKE ? OR
            summary LIKE ? OR
            legal_base LIKE ?
        ORDER BY decision_date DESC
        LIMIT ?
    `, [`%${query}%`, `%${query}%`, `%${query}%`, limit], (err, rows) => {
        db.close();
        
        if (err) {
            console.error('❌ Błąd wyszukiwania:', err.message);
            return res.status(500).json({ error: err.message });
        }
        
        res.json({
            success: true,
            count: rows.length,
            decisions: rows
        });
    });
});

// GET /api/court-decisions/:id - Szczegóły orzeczenia
router.get('/:id', (req, res) => {
    const id = req.params.id;
    const db = new sqlite3.Database(DB_PATH);
    
    db.get(`
        SELECT * FROM court_decisions WHERE id = ?
    `, [id], (err, row) => {
        if (err) {
            db.close();
            console.error('❌ Błąd:', err.message);
            return res.status(500).json({ error: err.message });
        }
        
        if (!row) {
            db.close();
            return res.status(404).json({ error: 'Orzeczenie nie znalezione' });
        }
        
        // Pobierz powiązane artykuły
        db.all(`
            SELECT 
                da.article_reference,
                la.title
            FROM decision_articles da
            JOIN legal_acts la ON da.legal_act_id = la.id
            WHERE da.decision_id = ?
        `, [id], (err, articles) => {
            db.close();
            
            res.json({
                success: true,
                decision: row,
                related_articles: articles || []
            });
        });
    });
});

// GET /api/court-decisions/stats/summary - Statystyki
router.get('/stats/summary', (req, res) => {
    const db = new sqlite3.Database(DB_PATH);
    
    db.all(`
        SELECT 
            (SELECT COUNT(*) FROM court_decisions) as total_decisions,
            (SELECT COUNT(*) FROM decision_articles) as total_links,
            (SELECT COUNT(DISTINCT court_type) FROM court_decisions) as court_types
    `, [], (err, rows) => {
        if (err) {
            db.close();
            return res.status(500).json({ error: err.message });
        }
        
        // Top artykuły
        db.all(`
            SELECT 
                article_reference,
                COUNT(*) as count
            FROM decision_articles
            GROUP BY article_reference
            ORDER BY count DESC
            LIMIT 10
        `, [], (err, topArticles) => {
            db.close();
            
            res.json({
                success: true,
                stats: rows[0],
                top_articles: topArticles || []
            });
        });
    });
});

module.exports = router;
