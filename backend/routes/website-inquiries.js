const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Sprawdź czy używamy bazy danych (lokalnie) czy tylko email (produkcja)
const USE_DATABASE = process.env.NODE_ENV !== 'production';
let getDatabase;

if (USE_DATABASE) {
  try {
    getDatabase = require('../database/init').getDatabase;
    console.log('✅ Używam bazy danych dla zapytań');
  } catch (err) {
    console.log('⚠️ Baza danych niedostępna - tylko email');
  }
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER || 'info@polska-grupa-wierzytelnosci.pl',
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

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
    
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('user-agent');
    const inquiryId = Date.now(); // Tymczasowe ID
    
    console.log(`✅ Nowe zapytanie ze strony: ${name} (${email}) - ${subject}`);
    
    // Funkcja wysyłania emaila
    const sendEmail = async () => {
      try {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #c9b037; border-bottom: 2px solid #c9b037; padding-bottom: 10px;">
                🌐 Nowe zapytanie ze strony kancelaria-pro-meritum.pl
              </h2>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">📋 Szczegóły zapytania:</h3>
                <p><strong>Imię i nazwisko:</strong> ${name}</p>
                <p><strong>Telefon:</strong> ${phone}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temat:</strong> ${subject}</p>
              </div>
              
              <div style="background: #fff; padding: 20px; border-left: 4px solid #c9b037; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">💬 Wiadomość:</h3>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              
              <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>📌 ID zapytania:</strong> ${inquiryId}</p>
                <p style="margin: 5px 0;"><strong>🕐 Data:</strong> ${new Date().toLocaleString('pl-PL')}</p>
                <p style="margin: 5px 0;"><strong>🌐 IP:</strong> ${ip_address}</p>
              </div>
              
              <p style="color: #666; font-size: 0.9em; margin-top: 30px;">
                <em>To zapytanie zostało automatycznie zapisane w systemie komunikatora.</em>
              </p>
            </div>
          `;
          
          await transporter.sendMail({
            from: `"Formularz Kontaktowy - Pro Meritum" <${process.env.GMAIL_USER || 'info@polska-grupa-wierzytelnosci.pl'}>`,
            to: process.env.INQUIRY_EMAIL || 'info@polska-grupa-wierzytelnosci.pl',
            subject: `🌐 Nowe zapytanie: ${subject}`,
            html: emailHtml,
            replyTo: email
          });
          
        console.log(`📧 Email wysłany na: ${process.env.INQUIRY_EMAIL || 'info@polska-grupa-wierzytelnosci.pl'}`);
        return true;
      } catch (emailError) {
        console.error('⚠️ Błąd wysyłania emaila:', emailError.message);
        throw emailError;
      }
    };
    
    // Zapisz do bazy (jeśli dostępna)
    const saveToDatabase = () => {
      return new Promise((resolve, reject) => {
        if (!USE_DATABASE || !getDatabase) {
          console.log('📝 Pomijam bazę danych (tylko email)');
          return resolve();
        }
        
        try {
          const db = getDatabase();
          db.run(
            `INSERT INTO website_inquiries 
             (name, phone, email, subject, message, ip_address, user_agent, status, priority) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'new', 'normal')`,
            [name, phone, email, subject, message, ip_address, user_agent],
            function(err) {
              if (err) {
                console.error('⚠️ Błąd zapisywania do bazy:', err.message);
                return resolve(); // Kontynuuj mimo błędu
              }
              console.log('💾 Zapytanie zapisane w bazie ID:', this.lastID);
              resolve();
            }
          );
        } catch (err) {
          console.error('⚠️ Błąd dostępu do bazy:', err.message);
          resolve(); // Kontynuuj mimo błędu
        }
      });
    };
    
    // Wyślij email i zapisz do bazy
    try {
      await sendEmail();
      await saveToDatabase();
      
      res.json({ 
        success: true, 
        message: 'Dziękujemy! Twoje zapytanie zostało przesłane. Skontaktujemy się wkrótce.',
        inquiryId: inquiryId
      });
    } catch (error) {
      console.error('❌ Błąd krytyczny:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas wysyłania. Spróbuj ponownie lub skontaktuj się telefonicznie.' 
      });
    }
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
