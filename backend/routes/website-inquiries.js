const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');

// POST /api/website-inquiries - Nowe zapytanie ze strony WWW
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    
    // Walidacja
    if (!name || !phone || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Wszystkie pola są wymagane' 
      });
    }
    
    // Walidacja email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nieprawidłowy adres email' 
      });
    }
    
    const db = getDatabase();
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('user-agent');
    
    db.run(
      `INSERT INTO website_inquiries 
       (name, phone, email, subject, message, ip_address, user_agent, status, priority) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new', 'normal')`,
      [name, phone, email, subject, message, ip_address, user_agent],
      function(err) {
        if (err) {
          console.error('Błąd zapisywania zapytania:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Błąd serwera' 
          });
        }
        
        console.log(`✅ Nowe zapytanie ze strony: ${name} (${email}) - ${subject}`);
        
        res.json({ 
          success: true, 
          message: 'Dziękujemy! Twoje zapytanie zostało przesłane. Skontaktujemy się wkrótce.',
          inquiryId: this.lastID
        });
      }
    );
  } catch (error) {
    console.error('Błąd przetwarzania zapytania:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Wystąpił błąd' 
    });
  }
});

// GET /api/website-inquiries - Lista wszystkich zapytań (wymaga autoryzacji)
router.get('/', async (req, res) => {
  try {
    const { status, priority, limit = 50, offset = 0 } = req.query;
    const db = getDatabase();
    
    let query = `
      SELECT 
        wi.*,
        u1.name as assigned_to_name,
        u2.name as resolved_by_name
      FROM website_inquiries wi
      LEFT JOIN users u1 ON wi.assigned_to = u1.id
      LEFT JOIN users u2 ON wi.resolved_by = u2.id
      WHERE 1=1
    `;
    const params = [];
    
    if (status) {
      query += ' AND wi.status = ?';
      params.push(status);
    }
    
    if (priority) {
      query += ' AND wi.priority = ?';
      params.push(priority);
    }
    
    query += ' ORDER BY wi.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Błąd pobierania zapytań:', err);
        return res.status(500).json({ success: false, message: 'Błąd serwera' });
      }
      
      // Zlicz zapytania według statusu
      db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_count,
          SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
          SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_count
        FROM website_inquiries
      `, (err, stats) => {
        res.json({ 
          success: true, 
          inquiries: rows,
          stats: stats || {}
        });
      });
    });
  } catch (error) {
    console.error('Błąd:', error);
    res.status(500).json({ success: false, message: 'Błąd serwera' });
  }
});

// GET /api/website-inquiries/:id - Szczegóły zapytania
router.get('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    
    db.get(
      `SELECT 
        wi.*,
        u1.name as assigned_to_name,
        u2.name as resolved_by_name
       FROM website_inquiries wi
       LEFT JOIN users u1 ON wi.assigned_to = u1.id
       LEFT JOIN users u2 ON wi.resolved_by = u2.id
       WHERE wi.id = ?`,
      [id],
      (err, row) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        if (!row) {
          return res.status(404).json({ success: false, message: 'Zapytanie nie znalezione' });
        }
        res.json({ success: true, inquiry: row });
      }
    );
  } catch (error) {
    res.status(500).json({ success: false, message: 'Błąd serwera' });
  }
});

// PUT /api/website-inquiries/:id - Aktualizacja zapytania
router.put('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    const { status, priority, assigned_to, response, notes } = req.body;
    const userId = req.user?.id; // Z middleware autoryzacji
    
    const updates = [];
    const params = [];
    
    if (status) {
      updates.push('status = ?');
      params.push(status);
      
      if (status === 'resolved' || status === 'closed') {
        updates.push('resolved_at = CURRENT_TIMESTAMP');
        updates.push('resolved_by = ?');
        params.push(userId);
      }
    }
    
    if (priority) {
      updates.push('priority = ?');
      params.push(priority);
    }
    
    if (assigned_to !== undefined) {
      updates.push('assigned_to = ?');
      params.push(assigned_to || null);
    }
    
    if (response) {
      updates.push('response = ?');
      params.push(response);
    }
    
    if (notes) {
      updates.push('notes = ?');
      params.push(notes);
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    db.run(
      `UPDATE website_inquiries SET ${updates.join(', ')} WHERE id = ?`,
      params,
      function(err) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ success: false, message: 'Zapytanie nie znalezione' });
        }
        
        res.json({ 
          success: true, 
          message: 'Zapytanie zaktualizowane'
        });
      }
    );
  } catch (error) {
    res.status(500).json({ success: false, message: 'Błąd serwera' });
  }
});

// DELETE /api/website-inquiries/:id - Usunięcie zapytania
router.delete('/:id', async (req, res) => {
  try {
    const db = getDatabase();
    const { id } = req.params;
    
    db.run(
      'DELETE FROM website_inquiries WHERE id = ?',
      [id],
      function(err) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Błąd serwera' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ success: false, message: 'Zapytanie nie znalezione' });
        }
        
        res.json({ success: true, message: 'Zapytanie usunięte' });
      }
    );
  } catch (error) {
    res.status(500).json({ success: false, message: 'Błąd serwera' });
  }
});

module.exports = router;
