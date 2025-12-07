const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

// 🔍 GLOBALNE WYSZUKIWANIE - szuka po wszystkim!
router.get('/', verifyToken, async (req, res) => {
    const db = getDatabase();
    const { q } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    if (!q || q.trim().length < 3) {
        return res.json({ cases: [], events: [], documents: [], clients: [], evidence: [], witnesses: [], testimonies: [] });
    }
    
    // Normalizuj polskie znaki dla wyszukiwania (małe I duże)
    const normalizePolish = (str) => str
        .replace(/[ĄĄ]/g, 'a').replace(/[ąą]/g, 'a')
        .replace(/[ĆĆ]/g, 'c').replace(/[ćć]/g, 'c')
        .replace(/[ĘĘ]/g, 'e').replace(/[ęę]/g, 'e')
        .replace(/[ŁŁ]/g, 'l').replace(/[łł]/g, 'l')
        .replace(/[ŃŃ]/g, 'n').replace(/[ńń]/g, 'n')
        .replace(/[ÓÓ]/g, 'o').replace(/[óó]/g, 'o')
        .replace(/[ŚŚ]/g, 's').replace(/[śś]/g, 's')
        .replace(/[ŹŹ]/g, 'z').replace(/[źź]/g, 'z')
        .replace(/[ŻŻ]/g, 'z').replace(/[żż]/g, 'z')
        .toLowerCase();
    
    const searchTerm = `%${q}%`;
    const searchTermLower = `%${q.toLowerCase()}%`;
    const searchTermNormalized = `%${normalizePolish(q)}%`;
    
    console.log('🔍 Search terms:', { original: q, lower: q.toLowerCase(), normalized: normalizePolish(q) });
    
    console.log('🔍 Universal Search:', { query: q, normalized: normalizePolish(q), user: userId, role: userRole });
    
    try {
        // 1. SPRAWY - pokazuje wszystkie, kontrola dostępu przy otwarciu!
        let casesQuery = `
            SELECT c.id, c.case_number, c.title, c.case_type, c.status,
                   COALESCE(cl.company_name, cl.first_name || ' ' || cl.last_name) as client_name
            FROM cases c
            LEFT JOIN clients cl ON c.client_id = cl.id
            WHERE (c.case_number LIKE ? OR c.title LIKE ?)
        `;
        const casesParams = [searchTerm, searchTerm];
        
        // Klient widzi tylko swoje sprawy
        if (userRole === 'client') {
            casesQuery += ` AND c.client_id IN (SELECT id FROM clients WHERE user_id = ?)`;
            casesParams.push(userId);
        }
        // Pozostali użytkownicy (admin, pracownicy) widzą wszystkie sprawy w wyszukiwarce
        // Kontrola dostępu następuje przy próbie otwarcia sprawy (middleware checkCaseAccess)
        
        casesQuery += ` ORDER BY c.created_at DESC LIMIT 10`;
        
        const cases = await new Promise((resolve, reject) => {
            db.all(casesQuery, casesParams, (err, rows) => {
                if (err) {
                    console.error('❌ Błąd wyszukiwania spraw:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
        
        // 2. WYDARZENIA - pokazuje wszystkie, kontrola przy otwarciu sprawy!
        let eventsQuery = `
            SELECT e.id, e.event_code, e.title, e.event_type, e.start_date, e.location,
                   c.case_number
            FROM events e
            LEFT JOIN cases c ON e.case_id = c.id
            WHERE (
                e.event_code = ? COLLATE NOCASE OR
                e.event_code LIKE ? COLLATE NOCASE OR 
                e.title LIKE ? COLLATE NOCASE OR 
                e.location LIKE ? COLLATE NOCASE
            )
        `;
        const eventsParams = [q, searchTerm, searchTerm, searchTerm];
        
        if (userRole === 'client') {
            eventsQuery += ` AND e.client_id IN (SELECT id FROM clients WHERE user_id = ?)`;
            eventsParams.push(userId);
        }
        // Pozostali widzą wszystkie wydarzenia w wyszukiwarce
        
        eventsQuery += ` ORDER BY e.start_date DESC LIMIT 10`;
        
        const events = await new Promise((resolve, reject) => {
            db.all(eventsQuery, eventsParams, (err, rows) => {
                if (err) {
                    console.error('❌ Błąd wyszukiwania wydarzeń:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
        
        // 3. DOKUMENTY - case-insensitive + numer dokumentu + sprawa
        let documentsQuery = `
            SELECT d.id, d.title, d.file_name, d.file_size, d.file_type, d.uploaded_at, d.category, 
                   d.document_number, d.document_code, d.case_id,
                   c.case_number
            FROM documents d
            LEFT JOIN cases c ON d.case_id = c.id
            WHERE (
                LOWER(d.title) LIKE ? OR 
                LOWER(d.file_name) LIKE ? OR 
                LOWER(d.document_number) LIKE ? OR 
                LOWER(d.document_code) LIKE ?
            )
        `;
        const documentsParams = [searchTermLower, searchTermLower, searchTermLower, searchTermLower];
        
        if (userRole === 'client') {
            documentsQuery += ` AND d.client_id IN (SELECT id FROM clients WHERE user_id = ?)`;
            documentsParams.push(userId);
        }
        
        documentsQuery += ` ORDER BY d.uploaded_at DESC LIMIT 10`;
        
        const documents = await new Promise((resolve, reject) => {
            db.all(documentsQuery, documentsParams, (err, rows) => {
                if (err) {
                    console.error('❌ Błąd wyszukiwania dokumentów:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
        
        // 4. DOWODY
        let evidenceQuery = `
            SELECT e.id, e.evidence_code, e.name, e.evidence_type, e.case_id,
                   c.case_number
            FROM case_evidence e
            LEFT JOIN cases c ON e.case_id = c.id
            WHERE (
                e.evidence_code = ? COLLATE NOCASE OR
                e.evidence_code LIKE ? COLLATE NOCASE OR 
                e.name LIKE ? COLLATE NOCASE OR 
                e.description LIKE ? COLLATE NOCASE
            )
        `;
        const evidenceParams = [q, searchTerm, searchTerm, searchTerm];
        
        if (userRole === 'client') {
            evidenceQuery += ` AND e.case_id IN (SELECT id FROM cases WHERE client_id IN (SELECT id FROM clients WHERE user_id = ?))`;
            evidenceParams.push(userId);
        }
        
        evidenceQuery += ` ORDER BY e.created_at DESC LIMIT 10`;
        
        const evidence = await new Promise((resolve, reject) => {
            db.all(evidenceQuery, evidenceParams, (err, rows) => {
                if (err) {
                    console.error('❌ Błąd wyszukiwania dowodów:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
        
        // 5. ŚWIADKOWIE - uproszczone zapytanie
        let witnessesQuery = `
            SELECT w.id, w.witness_code, w.first_name, w.last_name, w.side, w.relation_to_case, w.case_id,
                   c.case_number
            FROM case_witnesses w
            LEFT JOIN cases c ON w.case_id = c.id
            WHERE (
                LOWER(REPLACE(w.witness_code, char(346), char(115))) LIKE ? OR
                LOWER(w.first_name) LIKE ? OR 
                LOWER(w.last_name) LIKE ?
            )
        `;
        const witnessesParams = [searchTermNormalized, searchTermLower, searchTermLower];
        
        console.log('🔍🔍🔍 ŚWIADKOWIE params:', JSON.stringify(witnessesParams));
        
        if (userRole === 'client') {
            witnessesQuery += ` AND w.case_id IN (SELECT id FROM cases WHERE client_id IN (SELECT id FROM clients WHERE user_id = ?))`;
            witnessesParams.push(userId);
        }
        
        witnessesQuery += ` ORDER BY w.created_at DESC LIMIT 10`;
        
        console.log('🔍 DEBUG świadkowie - params:', witnessesParams);
        const witnesses = await new Promise((resolve, reject) => {
            db.all(witnessesQuery, witnessesParams, (err, rows) => {
                if (err) {
                    console.error('❌ Błąd wyszukiwania świadków:', err);
                    resolve([]);
                } else {
                    console.log('✅ Znaleziono świadków:', (rows || []).length);
                    resolve(rows || []);
                }
            });
        });
        
        // 6. ZEZNANIA ŚWIADKÓW
        let testimoniesQuery = `
            SELECT t.id, t.testimony_content, t.testimony_date, t.testimony_type, t.version_number,
                   w.witness_code, w.first_name, w.last_name, w.case_id,
                   c.case_number
            FROM witness_testimonies t
            LEFT JOIN case_witnesses w ON t.witness_id = w.id
            LEFT JOIN cases c ON w.case_id = c.id
            WHERE (
                w.witness_code = ? COLLATE NOCASE OR
                w.witness_code LIKE ? COLLATE NOCASE OR
                t.testimony_content LIKE ? COLLATE NOCASE
            )
        `;
        const testimoniesParams = [q, searchTerm, searchTerm];
        
        if (userRole === 'client') {
            testimoniesQuery += ` AND w.case_id IN (SELECT id FROM cases WHERE client_id IN (SELECT id FROM clients WHERE user_id = ?))`;
            testimoniesParams.push(userId);
        }
        
        testimoniesQuery += ` ORDER BY t.testimony_date DESC LIMIT 10`;
        
        const testimonies = await new Promise((resolve, reject) => {
            db.all(testimoniesQuery, testimoniesParams, (err, rows) => {
                if (err) {
                    console.error('❌ Błąd wyszukiwania zeznań:', err);
                    resolve([]);
                } else {
                    resolve(rows || []);
                }
            });
        });
        
        // 7. KLIENCI - Z FILTROWANIEM WEDŁUG ROLI
        let clients = [];
        console.log(`🔍 Sprawdzam klientów - rola: ${userRole}`);
        
        if (userRole === 'admin') {
            // Admin widzi wszystkich klientów
            console.log('✅ ADMIN - wyszukuję wszystkich klientów...');
            const clientsQuery = `
                SELECT id, first_name, last_name, company_name, email, phone
                FROM clients
                WHERE (
                    first_name LIKE ? COLLATE NOCASE OR 
                    last_name LIKE ? COLLATE NOCASE OR 
                    company_name LIKE ? COLLATE NOCASE OR 
                    email LIKE ? COLLATE NOCASE OR 
                    phone LIKE ? COLLATE NOCASE
                )
                ORDER BY first_name ASC
                LIMIT 10
            `;
            
            clients = await new Promise((resolve, reject) => {
                db.all(clientsQuery, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
                    if (err) {
                        console.error('❌ Błąd wyszukiwania klientów:', err);
                        resolve([]);
                    } else {
                        console.log(`✅ Znaleziono klientów: ${rows?.length || 0}`);
                        resolve(rows || []);
                    }
                });
            });
        } else if (userRole === 'lawyer') {
            // Mecenas widzi TYLKO klientów ze swoich spraw (assigned_to)
            console.log('✅ LAWYER - wyszukuję klientów ze swoich spraw...');
            const clientsQuery = `
                SELECT DISTINCT c.id, c.first_name, c.last_name, c.company_name, c.email, c.phone
                FROM clients c
                INNER JOIN cases ca ON c.id = ca.client_id
                WHERE ca.assigned_to = ?
                AND (
                    c.first_name LIKE ? COLLATE NOCASE OR 
                    c.last_name LIKE ? COLLATE NOCASE OR 
                    c.company_name LIKE ? COLLATE NOCASE OR 
                    c.email LIKE ? COLLATE NOCASE OR 
                    c.phone LIKE ? COLLATE NOCASE
                )
                ORDER BY c.first_name ASC
                LIMIT 10
            `;
            
            clients = await new Promise((resolve, reject) => {
                db.all(clientsQuery, [userId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
                    if (err) {
                        console.error('❌ Błąd wyszukiwania klientów:', err);
                        resolve([]);
                    } else {
                        console.log(`✅ Znaleziono klientów mecenasa: ${rows?.length || 0}`);
                        resolve(rows || []);
                    }
                });
            });
        } else if (userRole === 'case_manager') {
            // Case manager widzi klientów ze spraw gdzie jest opiekunem
            console.log('✅ CASE_MANAGER - wyszukuję klientów ze swoich spraw...');
            const clientsQuery = `
                SELECT DISTINCT c.id, c.first_name, c.last_name, c.company_name, c.email, c.phone
                FROM clients c
                INNER JOIN cases ca ON c.id = ca.client_id
                WHERE (ca.additional_caretaker = ? OR ca.case_manager_id = ?)
                AND (
                    c.first_name LIKE ? COLLATE NOCASE OR 
                    c.last_name LIKE ? COLLATE NOCASE OR 
                    c.company_name LIKE ? COLLATE NOCASE OR 
                    c.email LIKE ? COLLATE NOCASE OR 
                    c.phone LIKE ? COLLATE NOCASE
                )
                ORDER BY c.first_name ASC
                LIMIT 10
            `;
            
            clients = await new Promise((resolve, reject) => {
                db.all(clientsQuery, [userId, userId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
                    if (err) {
                        console.error('❌ Błąd wyszukiwania klientów:', err);
                        resolve([]);
                    } else {
                        console.log(`✅ Znaleziono klientów opiekuna: ${rows?.length || 0}`);
                        resolve(rows || []);
                    }
                });
            });
        } else if (userRole === 'client_manager') {
            // Client manager widzi TYLKO swoich klientów (assigned_to)
            console.log('✅ CLIENT_MANAGER - wyszukuję swoich klientów...');
            const clientsQuery = `
                SELECT id, first_name, last_name, company_name, email, phone
                FROM clients
                WHERE assigned_to = ?
                AND (
                    first_name LIKE ? COLLATE NOCASE OR 
                    last_name LIKE ? COLLATE NOCASE OR 
                    company_name LIKE ? COLLATE NOCASE OR 
                    email LIKE ? COLLATE NOCASE OR 
                    phone LIKE ? COLLATE NOCASE
                )
                ORDER BY first_name ASC
                LIMIT 10
            `;
            
            clients = await new Promise((resolve, reject) => {
                db.all(clientsQuery, [userId, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, rows) => {
                    if (err) {
                        console.error('❌ Błąd wyszukiwania klientów:', err);
                        resolve([]);
                    } else {
                        console.log(`✅ Znaleziono klientów opiekuna klienta: ${rows?.length || 0}`);
                        resolve(rows || []);
                    }
                });
            });
        }
        
        console.log(`✅ Wyniki: sprawy=${cases.length}, wydarzenia=${events.length}, dokumenty=${documents.length}, dowody=${evidence.length}, świadkowie=${witnesses.length}, zeznania=${testimonies.length}, klienci=${clients.length}`);
        
        res.json({
            cases,
            events,
            documents,
            evidence,
            witnesses,
            testimonies,
            clients
        });
        
    } catch (error) {
        console.error('❌ Błąd wyszukiwania uniwersalnego:', error);
        res.status(500).json({ 
            error: 'Błąd wyszukiwania',
            cases: [],
            events: [],
            documents: [],
            evidence: [],
            witnesses: [],
            testimonies: [],
            clients: []
        });
    }
});

module.exports = router;
