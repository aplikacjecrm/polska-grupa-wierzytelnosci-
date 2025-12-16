const express = require('express');
const router = express.Router();
const gmailService = require('../services/gmail-api');
const { verifyToken } = require('../middleware/auth');

/**
 * Gmail API Routes dla Promeritum Komunikator
 * 
 * Endpoints:
 * - GET  /api/gmail/auth-url          - Pobierz URL autoryzacji
 * - GET  /api/gmail/callback          - Callback po autoryzacji
 * - GET  /api/gmail/status            - Status autoryzacji
 * - GET  /api/gmail/profile           - Profil Gmail
 * - GET  /api/gmail/messages          - Lista wiadomości
 * - GET  /api/gmail/messages/:id      - Szczegóły wiadomości
 * - POST /api/gmail/send              - Wyślij wiadomość
 * - POST /api/gmail/reply/:id         - Odpowiedz na wiadomość
 * - GET  /api/gmail/attachment/:messageId/:attachmentId - Pobierz załącznik
 * - POST /api/gmail/mark-read/:id     - Oznacz jako przeczytane
 */

// Inicjalizacja przy starcie
(async () => {
  try {
    await gmailService.initialize();
    console.log('✅ Gmail Service zainicjalizowany');
  } catch (error) {
    console.error('⚠️ Gmail Service nie zainicjalizowany:', error.message);
  }
})();

/**
 * GET /api/gmail/auth-url
 * Generuj URL do autoryzacji OAuth
 */
router.get('/auth-url', verifyToken, (req, res) => {
  try {
    const authUrl = gmailService.getAuthUrl();
    res.json({ 
      success: true, 
      authUrl,
      message: 'Przekieruj użytkownika na ten URL aby autoryzować Gmail'
    });
  } catch (error) {
    console.error('❌ Błąd generowania auth URL:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/gmail/callback
 * Callback po autoryzacji OAuth
 */
router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Brak kodu autoryzacji');
  }

  try {
    await gmailService.handleCallback(code);
    
    // Przekieruj z powrotem do aplikacji
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Gmail autoryzowany</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .success-box {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
          }
          .checkmark {
            font-size: 64px;
            color: #4CAF50;
            margin-bottom: 20px;
          }
          h1 {
            color: #2c3e50;
            margin-bottom: 10px;
          }
          p {
            color: #666;
            margin-bottom: 30px;
          }
          button {
            background: #c9b037;
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
          }
          button:hover {
            background: #b89f2f;
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="success-box">
          <div class="checkmark">✓</div>
          <h1>Gmail połączony!</h1>
          <p>Twoje konto Gmail zostało pomyślnie zautoryzowane. Możesz teraz korzystać z poczty w aplikacji Promeritum.</p>
          <button onclick="window.close()">Zamknij</button>
        </div>
        <script>
          setTimeout(() => {
            window.close();
          }, 3000);
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('❌ Błąd callback:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Błąd autoryzacji</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }
          .error-box {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 400px;
          }
          .error-icon {
            font-size: 64px;
            color: #f44336;
            margin-bottom: 20px;
          }
          h1 {
            color: #2c3e50;
            margin-bottom: 10px;
          }
          p {
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="error-box">
          <div class="error-icon">✗</div>
          <h1>Błąd autoryzacji</h1>
          <p>${error.message}</p>
        </div>
      </body>
      </html>
    `);
  }
});

/**
 * GET /api/gmail/status
 * Sprawdź status autoryzacji
 */
router.get('/status', verifyToken, async (req, res) => {
  try {
    const isAuthorized = gmailService.isAuthorized();
    
    if (isAuthorized) {
      const profile = await gmailService.getProfile();
      res.json({
        success: true,
        authorized: true,
        profile
      });
    } else {
      res.json({
        success: true,
        authorized: false,
        message: 'Gmail nie jest autoryzowany'
      });
    }
  } catch (error) {
    console.error('❌ Błąd sprawdzania statusu:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/gmail/profile
 * Pobierz profil Gmail
 */
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const profile = await gmailService.getProfile();
    res.json({ 
      success: true, 
      profile 
    });
  } catch (error) {
    console.error('❌ Błąd pobierania profilu:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/gmail/messages
 * Pobierz listę wiadomości
 * Query params:
 * - maxResults: liczba wiadomości (default: 50)
 * - labelIds: labele (default: INBOX)
 * - q: query search
 */
router.get('/messages', verifyToken, async (req, res) => {
  try {
    const { maxResults, labelIds, q } = req.query;

    const options = {};
    if (maxResults) options.maxResults = parseInt(maxResults);
    if (labelIds) options.labelIds = labelIds.split(',');
    if (q) options.q = q;

    const messages = await gmailService.listMessages(options);
    
    // Pobierz szczegóły dla każdej wiadomości (snippet)
    const messagesWithDetails = await Promise.all(
      messages.slice(0, 20).map(async (msg) => {
        try {
          return await gmailService.getMessage(msg.id);
        } catch (err) {
          console.error('⚠️ Błąd pobierania wiadomości:', msg.id);
          return null;
        }
      })
    );

    res.json({ 
      success: true, 
      messages: messagesWithDetails.filter(m => m !== null),
      total: messages.length
    });
  } catch (error) {
    console.error('❌ Błąd pobierania wiadomości:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/gmail/messages/:id
 * Pobierz szczegóły wiadomości
 */
router.get('/messages/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const message = await gmailService.getMessage(id);
    
    res.json({ 
      success: true, 
      message 
    });
  } catch (error) {
    console.error('❌ Błąd pobierania wiadomości:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/gmail/send
 * Wyślij nową wiadomość
 * Body:
 * {
 *   to: string,
 *   subject: string,
 *   body: string,
 *   from?: string (default: info@polska-grupa-wierzytelnosci.pl),
 *   cc?: string,
 *   bcc?: string
 * }
 */
router.post('/send', verifyToken, async (req, res) => {
  try {
    const { to, subject, body, from, cc, bcc } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Brak wymaganych pól: to, subject, body' 
      });
    }

    const result = await gmailService.sendMessage({
      to,
      subject,
      body,
      from: from || 'info@polska-grupa-wierzytelnosci.pl',
      cc,
      bcc
    });

    res.json({ 
      success: true, 
      message: 'Wiadomość wysłana',
      messageId: result.id
    });
  } catch (error) {
    console.error('❌ Błąd wysyłania wiadomości:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/gmail/reply/:id
 * Odpowiedz na wiadomość
 * Body:
 * {
 *   body: string,
 *   from?: string (default: info@polska-grupa-wierzytelnosci.pl)
 * }
 */
router.post('/reply/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { body, from } = req.body;

    if (!body) {
      return res.status(400).json({ 
        success: false, 
        error: 'Brak treści odpowiedzi' 
      });
    }

    const result = await gmailService.replyToMessage(
      id, 
      body, 
      from || 'info@polska-grupa-wierzytelnosci.pl'
    );

    res.json({ 
      success: true, 
      message: 'Odpowiedź wysłana',
      messageId: result.id
    });
  } catch (error) {
    console.error('❌ Błąd wysyłania odpowiedzi:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * GET /api/gmail/attachment/:messageId/:attachmentId
 * Pobierz załącznik
 */
router.get('/attachment/:messageId/:attachmentId', verifyToken, async (req, res) => {
  try {
    const { messageId, attachmentId } = req.params;
    
    const attachmentData = await gmailService.getAttachment(messageId, attachmentId);
    
    // Pobierz nazwę pliku z wiadomości
    const message = await gmailService.getMessage(messageId);
    const attachment = message.attachments.find(a => a.attachmentId === attachmentId);
    
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
    res.setHeader('Content-Type', attachment.mimeType);
    res.send(attachmentData);
  } catch (error) {
    console.error('❌ Błąd pobierania załącznika:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * POST /api/gmail/mark-read/:id
 * Oznacz wiadomość jako przeczytaną
 */
router.post('/mark-read/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await gmailService.markAsRead(id);
    
    res.json({ 
      success: true, 
      message: 'Wiadomość oznaczona jako przeczytana' 
    });
  } catch (error) {
    console.error('❌ Błąd oznaczania jako przeczytane:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;
