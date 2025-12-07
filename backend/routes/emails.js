// 📧 WYSYŁANIE EMAILI - API
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

console.log('📧 Email routes loaded');

// Konfiguracja nodemailer
// UWAGA: Skonfiguruj swoje dane SMTP poniżej
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true dla 465, false dla innych portów
    auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
    }
});

// Sprawdź połączenie z SMTP
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP connection error:', error);
        console.warn('⚠️ Email sending will NOT work - configure SMTP settings in .env');
    } else {
        console.log('✅ SMTP server ready to send emails');
    }
});

/**
 * POST /api/emails/send
 * Wyślij email
 */
router.post('/send', async (req, res) => {
    console.log('📧 POST /api/emails/send');
    
    try {
        const { to, subject, html, text, client_id, event_id, event_code } = req.body;
        
        if (!to || !subject || (!html && !text)) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: to, subject, and (html or text)'
            });
        }
        
        // Przygotuj dane emaila
        const mailOptions = {
            from: process.env.SMTP_FROM || '"Kancelaria Prawna" <kancelaria@example.com>',
            to: to,
            subject: subject,
            html: html || undefined,
            text: text || undefined
        };
        
        console.log('📧 Sending email to:', to);
        console.log('📋 Subject:', subject);
        
        // Wyślij email
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ Email sent successfully:', info.messageId);
        
        // Zapisz log w bazie danych (opcjonalne)
        try {
            const db = req.app.get('db');
            await db.run(`
                INSERT INTO email_logs (client_id, event_id, event_code, recipient, subject, sent_at, message_id)
                VALUES (?, ?, ?, ?, ?, datetime('now'), ?)
            `, [client_id, event_id, event_code, to, subject, info.messageId]);
        } catch (dbError) {
            console.warn('⚠️ Failed to log email in database:', dbError.message);
            // Nie przerywaj - email został wysłany pomyślnie
        }
        
        res.json({
            success: true,
            message: 'Email sent successfully',
            messageId: info.messageId
        });
        
    } catch (error) {
        console.error('❌ Error sending email:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send email'
        });
    }
});

/**
 * GET /api/emails/logs
 * Pobierz logi wysłanych emaili
 */
router.get('/logs', async (req, res) => {
    console.log('📧 GET /api/emails/logs');
    
    try {
        const db = req.app.get('db');
        const { limit = 50, offset = 0 } = req.query;
        
        const logs = await db.all(`
            SELECT * FROM email_logs
            ORDER BY sent_at DESC
            LIMIT ? OFFSET ?
        `, [parseInt(limit), parseInt(offset)]);
        
        res.json({
            success: true,
            logs: logs,
            count: logs.length
        });
        
    } catch (error) {
        console.error('❌ Error fetching email logs:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
