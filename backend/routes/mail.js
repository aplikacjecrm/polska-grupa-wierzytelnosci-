const express = require('express');
const nodemailer = require('nodemailer');
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Dodaj konto email
router.post('/accounts', verifyToken, (req, res) => {
  const { email, imapHost, imapPort, smtpHost, smtpPort, password } = req.body;
  const userId = req.user.userId;

  const db = getDatabase();

  db.run(
    `INSERT INTO email_accounts (user_id, email, imap_host, imap_port, smtp_host, smtp_port, password)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, email, imapHost, imapPort || 993, smtpHost, smtpPort || 587, password],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Błąd dodawania konta' });
      }

      res.json({ success: true, accountId: this.lastID });
    }
  );
});

// Pobierz konta email
router.get('/accounts', verifyToken, (req, res) => {
  const userId = req.user.userId;
  const db = getDatabase();

  db.all('SELECT id, email, imap_host, smtp_host, is_default FROM email_accounts WHERE user_id = ?', [userId], (err, accounts) => {
    if (err) {
      return res.status(500).json({ error: 'Błąd pobierania kont' });
    }

    res.json({ accounts });
  });
});

// Pobierz wiadomości z IMAP
router.get('/messages/:accountId', verifyToken, async (req, res) => {
  const { accountId } = req.params;
  const userId = req.user.userId;
  const db = getDatabase();

  db.get('SELECT * FROM email_accounts WHERE id = ? AND user_id = ?', [accountId, userId], (err, account) => {
    if (err || !account) {
      return res.status(404).json({ error: 'Konto nie znalezione' });
    }

    const imap = new Imap({
      user: account.email,
      password: account.password,
      host: account.imap_host,
      port: account.imap_port,
      tls: account.imap_secure,
      tlsOptions: { rejectUnauthorized: false }
    });

    const messages = [];

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          imap.end();
          return res.status(500).json({ error: 'Błąd otwierania skrzynki' });
        }

        const fetch = imap.seq.fetch('1:50', {
          bodies: '',
          struct: true
        });

        fetch.on('message', (msg, seqno) => {
          msg.on('body', (stream, info) => {
            simpleParser(stream, (err, parsed) => {
              if (!err) {
                messages.push({
                  id: seqno,
                  from: parsed.from?.text,
                  to: parsed.to?.text,
                  subject: parsed.subject,
                  date: parsed.date,
                  text: parsed.text,
                  html: parsed.html,
                  attachments: parsed.attachments?.map(a => ({
                    filename: a.filename,
                    size: a.size,
                    contentType: a.contentType
                  }))
                });
              }
            });
          });
        });

        fetch.once('end', () => {
          imap.end();
          res.json({ messages: messages.reverse() });
        });

        fetch.once('error', (err) => {
          imap.end();
          res.status(500).json({ error: 'Błąd pobierania wiadomości' });
        });
      });
    });

    imap.once('error', (err) => {
      res.status(500).json({ error: 'Błąd połączenia z serwerem IMAP' });
    });

    imap.connect();
  });
});

// Wyślij email
router.post('/send', verifyToken, async (req, res) => {
  const { accountId, to, subject, text, html, attachments } = req.body;
  const userId = req.user.userId;
  const db = getDatabase();

  db.get('SELECT * FROM email_accounts WHERE id = ? AND user_id = ?', [accountId, userId], async (err, account) => {
    if (err || !account) {
      return res.status(404).json({ error: 'Konto nie znalezione' });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: account.smtp_host,
        port: account.smtp_port,
        secure: account.smtp_secure,
        auth: {
          user: account.email,
          pass: account.password
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const info = await transporter.sendMail({
        from: account.email,
        to,
        subject,
        text,
        html,
        attachments
      });

      res.json({ success: true, messageId: info.messageId });
    } catch (error) {
      console.error('Błąd wysyłania:', error);
      res.status(500).json({ error: 'Błąd wysyłania wiadomości' });
    }
  });
});

module.exports = router;
