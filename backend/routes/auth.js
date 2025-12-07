const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET is not defined in environment variables');
}

// Rejestracja
router.post('/register', async (req, res) => {
  const { email, password, name, role, client_id } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
  }

  try {
    const db = getDatabase();
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Użyj roli z formularza lub automatycznie rozpoznaj po domenie email
    let userRole = role;
    if (!userRole) {
      const emailDomain = email.split('@')[1];
      if (emailDomain === 'pro-meritum.pl') {
        userRole = 'admin';
      } else if (emailDomain === 'kancelaria-pro-meritum.pl') {
        userRole = 'lawyer';
      } else {
        // Dla klientów - sprawdź czy email istnieje w tabeli clients
        userRole = 'client';
      }
    }

    // Generuj inicjały dla pracowników (nie dla klientów)
    let initials = null;
    if (userRole !== 'client' && name) {
      const nameParts = name.trim().split(' ');
      initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
    }

    db.run(
      'INSERT INTO users (email, password, name, role, user_role, client_id, initials) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, name, userRole, userRole, client_id || null, initials],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Email już istnieje' });
          }
          return res.status(500).json({ error: 'Błąd serwera' });
        }

        const token = jwt.sign({ userId: this.lastID, email, role: userRole }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
          success: true,
          token,
          user: { id: this.lastID, email, name, role: userRole }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Logowanie
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email i hasło są wymagane' });
  }

  try {
    const db = getDatabase();

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd serwera' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
      }

      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' });
      }

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

      // Aktualizuj status
      db.run('UPDATE users SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?', ['online', user.id]);

      // 📊 ZAPISZ SESJĘ LOGOWANIA
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      // DEBUG: Pokaż aktualny czas lokalny
      const nowLocal = new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' });
      console.log(`🕐 Login timestamp - Warszawa: ${nowLocal}`);
      
      db.run(`
        INSERT INTO login_sessions (user_id, login_time, ip_address, user_agent)
        VALUES (?, datetime('now', 'localtime'), ?, ?)
      `, [user.id, ipAddress, userAgent], (logErr) => {
        if (logErr) {
          console.error('⚠️ Błąd zapisu sesji logowania:', logErr);
        } else {
          console.log(`📊 Sesja logowania zapisana dla user_id=${user.id}`);
          // Odczytaj co faktycznie zostało zapisane
          db.get('SELECT login_time FROM login_sessions WHERE user_id = ? ORDER BY id DESC LIMIT 1', [user.id], (err, row) => {
            if (!err && row) {
              console.log(`🕐 Zapisano w bazie: ${row.login_time}`);
            }
          });
        }
      });

      res.json({
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          status: 'online'
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Weryfikacja tokenu
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDatabase();

    db.get('SELECT id, email, name, role, avatar, status FROM users WHERE id = ?', [decoded.userId], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Nieprawidłowy token' });
      }

      res.json({ success: true, user });
    });
  } catch (error) {
    res.status(401).json({ error: 'Nieprawidłowy token' });
  }
});

// Wylogowanie
router.post('/logout', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const db = getDatabase();

      db.run('UPDATE users SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?', ['offline', decoded.userId]);
      
      // 📊 ZAKTUALIZUJ SESJĘ LOGOWANIA - znajdź ostatnią otwartą sesję i zamknij ją
      db.get(`
        SELECT id, login_time FROM login_sessions 
        WHERE user_id = ? AND logout_time IS NULL
        ORDER BY login_time DESC LIMIT 1
      `, [decoded.userId], (err, session) => {
        if (err) {
          console.error('⚠️ Błąd pobierania sesji:', err);
        } else if (session) {
          // Oblicz czas trwania sesji
          const loginTime = new Date(session.login_time);
          const logoutTime = new Date();
          const durationSeconds = Math.floor((logoutTime - loginTime) / 1000);
          
          db.run(`
            UPDATE login_sessions 
            SET logout_time = datetime('now', 'localtime'), duration_seconds = ?
            WHERE id = ?
          `, [durationSeconds, session.id], (updateErr) => {
            if (updateErr) {
              console.error('⚠️ Błąd aktualizacji sesji:', updateErr);
            } else {
              console.log(`📊 Sesja zamknięta dla user_id=${decoded.userId}, czas trwania: ${durationSeconds}s`);
            }
          });
        }
      });
    } catch (error) {
      // Token nieprawidłowy, ale i tak wylogowujemy
    }
  }

  res.json({ success: true });
});

// Aktywacja konta klienta (bez tokenu - publiczny endpoint)
router.post('/activate-client', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email i hasło są wymagane' });
  }

  try {
    const db = getDatabase();
    
    // Sprawdź czy klient istnieje w bazie
    db.get('SELECT * FROM clients WHERE email = ?', [email], async (err, client) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd serwera' });
      }

      if (!client) {
        return res.status(404).json({ error: 'Nie znaleziono klienta z tym adresem email. Skontaktuj się z kancelarią.' });
      }

      // Sprawdź czy użytkownik już istnieje
      db.get('SELECT * FROM users WHERE email = ?', [email], async (err2, existingUser) => {
        if (err2) {
          return res.status(500).json({ error: 'Błąd serwera' });
        }

        if (existingUser) {
          return res.status(400).json({ error: 'Konto już zostało aktywowane. Możesz się zalogować.' });
        }

        // Utwórz konto użytkownika
        const hashedPassword = await bcrypt.hash(password, 10);
        const name = `${client.first_name} ${client.last_name}`;

        db.run(
          'INSERT INTO users (email, password, name, role, client_id) VALUES (?, ?, ?, ?, ?)',
          [email, hashedPassword, name, 'client', client.id],
          function(err3) {
            if (err3) {
              return res.status(500).json({ error: 'Błąd tworzenia konta' });
            }

            const token = jwt.sign({ userId: this.lastID, email, role: 'client' }, JWT_SECRET, { expiresIn: '7d' });

            res.json({
              success: true,
              message: 'Konto zostało aktywowane!',
              token,
              user: { id: this.lastID, email, name, role: 'client' }
            });
          }
        );
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Pobierz listę użytkowników (tylko dla admina i prawników)
router.get('/users', verifyToken, (req, res) => {
  const db = getDatabase();
  const { role } = req.query;
  
  let query = 'SELECT id, name, email, role, user_role, is_active, initials, created_at FROM users WHERE 1=1';
  const params = [];
  
  if (role) {
    query += ' AND (role = ? OR user_role = ?)';
    params.push(role, role);
  }
  
  query += ' ORDER BY name ASC';
  
  db.all(query, params, (err, users) => {
    if (err) {
      console.error('❌ Błąd pobierania użytkowników:', err);
      return res.status(500).json({ error: 'Błąd pobierania użytkowników' });
    }
    
    console.log(`✅ Pobrano ${users.length} użytkowników:`);
    users.forEach(u => console.log(`   - ${u.id}: ${u.name} (${u.email})`));
    res.json({ users });
  });
});

// Zmiana hasła użytkownika
router.put('/change-password', verifyToken, async (req, res) => {
  const db = getDatabase();
  const { userId, newPassword, currentPassword } = req.body;
  
  // Sprawdź czy użytkownik zmienia swoje hasło lub czy to admin
  const targetUserId = userId || req.user.userId;
  const isAdmin = req.user.role === 'admin';
  const isOwnPassword = parseInt(targetUserId) === req.user.userId;
  
  if (!isAdmin && !isOwnPassword) {
    return res.status(403).json({ error: 'Brak uprawnień do zmiany hasła tego użytkownika' });
  }
  
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Nowe hasło musi mieć minimum 8 znaków, wielką literę i znak specjalny' });
  }
  
  try {
    // Jeśli użytkownik zmienia swoje hasło (nie admin), wymagaj starego hasła
    if (isOwnPassword && !isAdmin) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Wymagane jest obecne hasło' });
      }
      
      // Sprawdź obecne hasło
      db.get('SELECT password FROM users WHERE id = ?', [targetUserId], async (err, user) => {
        if (err || !user) {
          return res.status(500).json({ error: 'Błąd serwera' });
        }
        
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: 'Nieprawidłowe obecne hasło' });
        }
        
        // Zmień hasło
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, targetUserId], function(err2) {
          if (err2) {
            return res.status(500).json({ error: 'Błąd zmiany hasła' });
          }
          
          res.json({ success: true, message: 'Hasło zostało zmienione' });
        });
      });
    } else {
      // Admin zmienia hasło innego użytkownika - nie wymagaj starego hasła
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, targetUserId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Błąd zmiany hasła' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
        }
        
        res.json({ success: true, message: 'Hasło zostało zmienione' });
      });
    }
  } catch (error) {
    console.error('❌ Błąd zmiany hasła:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Usuń użytkownika (tylko dla admina)
router.delete('/users/:id', verifyToken, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  
  // Sprawdź czy użytkownik to admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Brak uprawnień' });
  }
  
  // Nie pozwól usunąć samego siebie
  if (parseInt(id) === req.user.userId) {
    return res.status(400).json({ error: 'Nie możesz usunąć swojego konta' });
  }
  
  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Błąd usuwania użytkownika' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }
    
    res.json({ success: true });
  });
});

module.exports = router;
