const express = require('express');
const { getDatabase } = require('../database/init');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Pobierz listę użytkowników
router.get('/users', verifyToken, (req, res) => {
  const currentUserId = req.user.userId;
  const db = getDatabase();

  db.all(
    'SELECT id, email, name, avatar, status, last_seen FROM users WHERE id != ?',
    [currentUserId],
    (err, users) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd pobierania użytkowników' });
      }

      res.json({ users });
    }
  );
});

// Pobierz historię czatu z użytkownikiem
router.get('/messages/:userId', verifyToken, (req, res) => {
  const currentUserId = req.user.userId;
  const { userId } = req.params;
  const db = getDatabase();

  db.all(
    `SELECT cm.*, u.name as sender_name, u.avatar as sender_avatar
     FROM chat_messages cm
     JOIN users u ON cm.sender_id = u.id
     WHERE (cm.sender_id = ? AND cm.receiver_id = ?)
        OR (cm.sender_id = ? AND cm.receiver_id = ?)
     ORDER BY cm.created_at ASC`,
    [currentUserId, userId, userId, currentUserId],
    (err, messages) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd pobierania wiadomości' });
      }

      res.json({ messages });
    }
  );
});

// Wyślij wiadomość czatu
router.post('/messages', verifyToken, (req, res) => {
  const senderId = req.user.userId;
  const senderRole = req.user.role;
  const { receiverId, message, attachments } = req.body;
  const db = getDatabase();
  
  // Jeśli nadawca to klient, sprawdź czy może pisać do odbiorcy
  if (senderRole === 'client') {
    // Pobierz dane klienta
    db.get(
      `SELECT c.*, u.id as user_id
       FROM clients c
       JOIN users u ON c.user_id = u.id
       WHERE u.id = ?`,
      [senderId],
      (err, client) => {
        if (err || !client) {
          return res.status(500).json({ error: 'Błąd pobierania danych klienta' });
        }
        
        // Sprawdź czy odbiorca to mecenas, opiekun sprawy lub opiekun klienta
        db.get(
          `SELECT DISTINCT u.id
           FROM users u
           LEFT JOIN cases ca ON (ca.assigned_to = u.id OR ca.case_manager_id = u.id)
           WHERE ca.client_id = ? AND u.id = ?
           UNION
           SELECT user_id as id FROM clients WHERE id = ? AND user_id = ?`,
          [client.id, receiverId, client.id, receiverId],
          (err, allowed) => {
            if (err || !allowed) {
              return res.status(403).json({ 
                error: 'Brak uprawnień',
                message: 'Możesz pisać tylko do swojego mecenasa lub opiekuna'
              });
            }
            
            // Klient może pisać - kontynuuj wysyłanie
            sendMessageToDb();
          }
        );
      }
    );
    return;
  }
  
  // Dla innych ról - mogą pisać do wszystkich
  sendMessageToDb();
  
  function sendMessageToDb() {

  db.run(
    `INSERT INTO chat_messages (sender_id, receiver_id, message, attachments)
     VALUES (?, ?, ?, ?)`,
    [senderId, receiverId, message, JSON.stringify(attachments || [])],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd wysyłania wiadomości' });
      }

      // Pobierz zapisaną wiadomość z danymi nadawcy
      db.get(
        `SELECT cm.*, u.name as sender_name, u.avatar as sender_avatar
         FROM chat_messages cm
         JOIN users u ON cm.sender_id = u.id
         WHERE cm.id = ?`,
        [this.lastID],
        (err, msg) => {
          if (err) {
            return res.status(500).json({ error: 'Błąd pobierania wiadomości' });
          }

          // Wyślij przez Socket.IO
          const io = req.app.get('io');
          
          console.log('📨 [HTTP] Nowa wiadomość:', msg.id);
          
          // ✅ WYŚLIJ DO OBIE STRONY!
          io.to(`user_${receiverId}`).emit('new-chat-message', msg);
          console.log('✅ [HTTP] Wysłano do odbiorcy user_' + receiverId);
          
          io.to(`user_${senderId}`).emit('new-chat-message', msg);
          console.log('✅ [HTTP] Wysłano do nadawcy user_' + senderId);

          res.json({ success: true, message: msg });
        }
      );
    }
  );
  } // Zamknięcie funkcji sendMessageToDb
});

// Oznacz wiadomości jako przeczytane
router.put('/messages/read/:userId', verifyToken, (req, res) => {
  const currentUserId = req.user.userId;
  const { userId } = req.params;
  const db = getDatabase();

  db.run(
    `UPDATE chat_messages SET read = 1
     WHERE sender_id = ? AND receiver_id = ? AND read = 0`,
    [userId, currentUserId],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd aktualizacji' });
      }

      res.json({ success: true });
    }
  );
});

// Pobierz liczbę nieprzeczytanych wiadomości
router.get('/unread', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const db = getDatabase();

  db.get(
    `SELECT COUNT(*) as count FROM chat_messages
     WHERE receiver_id = ? AND read = 0`,
    [userId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd pobierania' });
      }

      res.json({ unread: result.count });
    }
  );
});

// 🔐 BROADCAST - Wyślij wiadomość do wszystkich pracowników (hasło do sprawy)
router.post('/broadcast-case-password', verifyToken, async (req, res) => {
  const senderId = req.user.userId;
  const { caseNumber, accessPassword, caseId, caseTitle } = req.body;
  const db = getDatabase();

  if (!caseNumber || !accessPassword) {
    return res.status(400).json({ error: 'caseNumber i accessPassword są wymagane' });
  }

  try {
    // Pobierz wszystkich pracowników (nie-klientów)
    const staff = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, name, email FROM users 
         WHERE user_role != 'client' AND id != ? AND is_active = 1`,
        [senderId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });

    console.log(`📢 Wysyłanie hasła sprawy ${caseNumber} do ${staff.length} pracowników`);

    // Wiadomość z hasłem
    const message = `🔐 **Nowa sprawa utworzona**\n\n` +
                   `**Numer:** ${caseNumber}\n` +
                   `${caseTitle ? `**Tytuł:** ${caseTitle}\n` : ''}` +
                   `**Hasło dostępu:** \`${accessPassword}\`\n\n` +
                   `Możesz użyć tego hasła aby uzyskać dostęp do szczegółów sprawy.`;

    // Wyślij wiadomość do każdego pracownika
    const io = req.app.get('io');
    const sentTo = [];

    for (const user of staff) {
      try {
        // Zapisz wiadomość do bazy
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO chat_messages (sender_id, receiver_id, message, attachments, created_at)
             VALUES (?, ?, ?, ?, datetime('now'))`,
            [senderId, user.id, message, JSON.stringify([])],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });

        // Wyślij przez Socket.IO
        if (io) {
          io.to(`user_${user.id}`).emit('new-chat-message', {
            sender_id: senderId,
            receiver_id: user.id,
            message: message,
            created_at: new Date().toISOString(),
            read: 0
          });
        }

        sentTo.push(user.name);
        console.log(`✅ Wysłano do: ${user.name} (${user.email})`);
      } catch (error) {
        console.error(`❌ Błąd wysyłania do ${user.name}:`, error);
      }
    }

    console.log(`📢 Hasło sprawy ${caseNumber} wysłane do ${sentTo.length} pracowników`);

    res.json({
      success: true,
      message: 'Hasło wysłane na czat firmowy',
      sentTo: sentTo,
      count: sentTo.length
    });

  } catch (error) {
    console.error('❌ Błąd broadcast:', error);
    res.status(500).json({ error: 'Błąd wysyłania wiadomości broadcast' });
  }
});

// WIADOMOŚCI GŁOSOWE - nowy endpoint
router.post('/voice', verifyToken, (req, res) => {
  const senderId = req.user.userId;
  const { receiver_id, audio } = req.body;
  const db = getDatabase();

  if (!receiver_id || !audio) {
    return res.status(400).json({ error: 'Brak danych odbiorcy lub audio' });
  }

  console.log('🎤 Zapisuję wiadomość głosową od użytkownika:', senderId, 'do:', receiver_id);

  // Zapisz wiadomość głosową do bazy (base64 w polu attachments)
  db.run(
    `INSERT INTO chat_messages (sender_id, receiver_id, message, attachments, created_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [senderId, receiver_id, '[VOICE MESSAGE]', JSON.stringify([{ type: 'voice', data: audio }])],
    function(err) {
      if (err) {
        console.error('❌ Błąd zapisu wiadomości głosowej:', err);
        return res.status(500).json({ error: 'Błąd zapisu wiadomości' });
      }

      const messageId = this.lastID;

      // Pobierz szczegóły wiadomości
      db.get(
        `SELECT cm.*, u.name as sender_name, u.avatar as sender_avatar
         FROM chat_messages cm
         JOIN users u ON cm.sender_id = u.id
         WHERE cm.id = ?`,
        [messageId],
        (err, message) => {
          if (err) {
            console.error('❌ Błąd pobierania wiadomości:', err);
            return res.status(500).json({ error: 'Błąd pobierania wiadomości' });
          }

          // Wyślij przez Socket.IO
          const io = req.app.get('io');
          if (io) {
            io.to(`user_${receiver_id}`).emit('new-chat-message', message);
          }

          console.log('✅ Wiadomość głosowa zapisana, ID:', messageId);

          res.json({
            success: true,
            message: 'Wiadomość głosowa wysłana',
            messageId: messageId
          });
        }
      );
    }
  );
});

// WIADOMOŚCI WIDEO - nowy endpoint
router.post('/video', verifyToken, (req, res) => {
  const senderId = req.user.userId;
  const { receiver_id, video } = req.body;
  const db = getDatabase();

  if (!receiver_id || !video) {
    return res.status(400).json({ error: 'Brak danych odbiorcy lub wideo' });
  }

  console.log('📹 Zapisuję wiadomość wideo od użytkownika:', senderId, 'do:', receiver_id);
  console.log('📹 Video size:', (video.length / 1024 / 1024).toFixed(2), 'MB');

  // Zapisz wiadomość wideo do bazy (base64 w polu attachments)
  db.run(
    `INSERT INTO chat_messages (sender_id, receiver_id, message, attachments, created_at)
     VALUES (?, ?, ?, ?, datetime('now'))`,
    [senderId, receiver_id, '[VIDEO MESSAGE]', JSON.stringify([{ type: 'video', data: video }])],
    function(err) {
      if (err) {
        console.error('❌ Błąd zapisu wiadomości wideo:', err);
        return res.status(500).json({ error: 'Błąd zapisu wiadomości' });
      }

      const messageId = this.lastID;

      // Pobierz szczegóły wiadomości
      db.get(
        `SELECT cm.*, u.name as sender_name, u.avatar as sender_avatar
         FROM chat_messages cm
         JOIN users u ON cm.sender_id = u.id
         WHERE cm.id = ?`,
        [messageId],
        (err, message) => {
          if (err) {
            console.error('❌ Błąd pobierania wiadomości:', err);
            return res.status(500).json({ error: 'Błąd pobierania wiadomości' });
          }

          // Wyślij przez Socket.IO
          const io = req.app.get('io');
          if (io) {
            io.to(`user_${receiver_id}`).emit('new-chat-message', message);
          }

          console.log('✅ Wiadomość wideo zapisana, ID:', messageId);

          res.json({
            success: true,
            message: 'Wiadomość wideo wysłana',
            messageId: messageId
          });
        }
      );
    }
  );
});

module.exports = router;
