const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database/init');

const JWT_SECRET = process.env.JWT_SECRET || 'zmien-to-na-bezpieczny-klucz';

const connectedUsers = new Map(); // userId -> socketId

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log('🔌 Nowe połączenie Socket.IO:', socket.id);

    // Autoryzacja
    socket.on('authenticate', (token) => {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.userId;
        socket.join(`user_${decoded.userId}`);
        
        connectedUsers.set(decoded.userId, socket.id);

        // Aktualizuj status użytkownika
        const db = getDatabase();
        db.run('UPDATE users SET status = ? WHERE id = ?', ['online', decoded.userId]);

        // Powiadom innych o zmianie statusu
        socket.broadcast.emit('user-status-changed', {
          userId: decoded.userId,
          status: 'online'
        });

        socket.emit('authenticated', { success: true });
        console.log(`✅ Użytkownik ${decoded.userId} zalogowany przez Socket.IO`);
      } catch (error) {
        socket.emit('authentication-error', { error: 'Nieprawidłowy token' });
      }
    });

    // Wysyłanie wiadomości czatu
    socket.on('send-chat-message', (data) => {
      if (!socket.userId) {
        return socket.emit('error', { message: 'Nie jesteś zalogowany' });
      }

      const { receiverId, message, attachments } = data;
      const db = getDatabase();

      db.run(
        `INSERT INTO chat_messages (sender_id, receiver_id, message, attachments)
         VALUES (?, ?, ?, ?)`,
        [socket.userId, receiverId, message, JSON.stringify(attachments || [])],
        function(err) {
          if (err) {
            return socket.emit('error', { message: 'Błąd wysyłania wiadomości' });
          }

          // Pobierz zapisaną wiadomość
          db.get(
            `SELECT cm.*, u.name as sender_name, u.avatar as sender_avatar
             FROM chat_messages cm
             JOIN users u ON cm.sender_id = u.id
             WHERE cm.id = ?`,
            [this.lastID],
            (err, msg) => {
              if (!err && msg) {
                console.log('📨 [BACKEND] Nowa wiadomość zapisana:', {
                  id: msg.id,
                  sender_id: msg.sender_id,
                  receiver_id: msg.receiver_id,
                  message: msg.message.substring(0, 50)
                });
                
                // ✅ POPRAWKA: Wyślij do OBIE STRONY (nadawca I odbiorca)
                // Wyślij do odbiorcy
                io.to(`user_${receiverId}`).emit('new-chat-message', msg);
                console.log('✅ [BACKEND] Wysłano do odbiorcy user_' + receiverId);
                
                // WAŻNE: Wyślij RÓWNIEŻ do nadawcy! (aby jego chat się odświeżył)
                io.to(`user_${socket.userId}`).emit('new-chat-message', msg);
                console.log('✅ [BACKEND] Wysłano do nadawcy user_' + socket.userId);
                
                // Potwierdź nadawcy (dla kompatybilności wstecznej)
                socket.emit('message-sent', msg);
              }
            }
          );
        }
      );
    });

    // Pisanie...
    socket.on('typing', (data) => {
      if (socket.userId) {
        io.to(`user_${data.receiverId}`).emit('user-typing', {
          userId: socket.userId,
          isTyping: data.isTyping
        });
      }
    });

    // Oznacz jako przeczytane
    socket.on('mark-as-read', (data) => {
      if (!socket.userId) return;

      const db = getDatabase();
      db.run(
        `UPDATE chat_messages SET read = 1
         WHERE sender_id = ? AND receiver_id = ? AND read = 0`,
        [data.senderId, socket.userId],
        (err) => {
          if (!err) {
            // Powiadom nadawcę że wiadomości zostały przeczytane
            io.to(`user_${data.senderId}`).emit('messages-read', {
              readBy: socket.userId
            });
          }
        }
      );
    });

    // Rozłączenie
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);

        const db = getDatabase();
        db.run(
          'UPDATE users SET status = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?',
          ['offline', socket.userId]
        );

        socket.broadcast.emit('user-status-changed', {
          userId: socket.userId,
          status: 'offline'
        });

        console.log(`👋 Użytkownik ${socket.userId} rozłączony`);
      }
    });
  });
}

module.exports = { setupSocketHandlers };
