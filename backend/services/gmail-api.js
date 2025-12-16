const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path');

/**
 * Gmail API Service dla Promeritum Komunikator
 * Obsługuje:
 * - info@polska-grupa-wierzytelnosci.pl
 * - info@kancelaria-pro-meritum.pl (alias)
 */

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.labels',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

const TOKEN_PATH = path.join(__dirname, '../config/gmail-token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../config/gmail-credentials.json');

class GmailAPIService {
  constructor() {
    this.oauth2Client = null;
    this.gmail = null;
  }

  /**
   * Inicjalizacja OAuth2 Client
   */
  async initialize() {
    try {
      const credentials = await this.loadCredentials();
      
      const { client_secret, client_id, redirect_uris } = credentials.web || credentials.installed;
      
      this.oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );

      // Spróbuj załadować token
      try {
        const token = await this.loadToken();
        this.oauth2Client.setCredentials(token);
        this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
        console.log('✅ Gmail API zainicjalizowany z zapisanym tokenem');
      } catch (err) {
        console.log('⚠️ Brak tokenu - wymagana autoryzacja');
      }

      return true;
    } catch (error) {
      console.error('❌ Błąd inicjalizacji Gmail API:', error.message);
      throw error;
    }
  }

  /**
   * Załaduj credentials z pliku
   */
  async loadCredentials() {
    const content = await fs.readFile(CREDENTIALS_PATH);
    return JSON.parse(content);
  }

  /**
   * Załaduj token z pliku
   */
  async loadToken() {
    const content = await fs.readFile(TOKEN_PATH);
    return JSON.parse(content);
  }

  /**
   * Zapisz token do pliku
   */
  async saveToken(token) {
    await fs.writeFile(TOKEN_PATH, JSON.stringify(token, null, 2));
    console.log('💾 Token zapisany:', TOKEN_PATH);
  }

  /**
   * Generuj URL autoryzacji
   */
  getAuthUrl() {
    if (!this.oauth2Client) {
      throw new Error('OAuth2 Client nie został zainicjalizowany');
    }

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent'
    });
  }

  /**
   * Obsługa callback po autoryzacji
   */
  async handleCallback(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      await this.saveToken(tokens);
      
      this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });
      
      console.log('✅ Token otrzymany i zapisany');
      return tokens;
    } catch (error) {
      console.error('❌ Błąd podczas callback:', error.message);
      throw error;
    }
  }

  /**
   * Sprawdź czy API jest zautoryzowany
   */
  isAuthorized() {
    return this.gmail !== null && this.oauth2Client !== null;
  }

  /**
   * Pobierz listę wiadomości
   */
  async listMessages(options = {}) {
    if (!this.isAuthorized()) {
      throw new Error('Gmail API nie jest zautoryzowany');
    }

    const {
      maxResults = 50,
      labelIds = ['INBOX'],
      q = ''
    } = options;

    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        maxResults,
        labelIds,
        q
      });

      return response.data.messages || [];
    } catch (error) {
      console.error('❌ Błąd pobierania wiadomości:', error.message);
      throw error;
    }
  }

  /**
   * Pobierz szczegóły wiadomości
   */
  async getMessage(messageId) {
    if (!this.isAuthorized()) {
      throw new Error('Gmail API nie jest zautoryzowany');
    }

    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      return this.parseMessage(response.data);
    } catch (error) {
      console.error('❌ Błąd pobierania wiadomości:', error.message);
      throw error;
    }
  }

  /**
   * Parsuj wiadomość do czytelnego formatu
   */
  parseMessage(message) {
    const headers = message.payload.headers;
    const getHeader = (name) => {
      const header = headers.find(h => h.name.toLowerCase() === name.toLowerCase());
      return header ? header.value : '';
    };

    let body = '';
    
    // Znajdź treść wiadomości
    if (message.payload.body.data) {
      body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload.parts) {
      const part = message.payload.parts.find(p => p.mimeType === 'text/plain' || p.mimeType === 'text/html');
      if (part && part.body.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }

    // Pobierz załączniki
    const attachments = [];
    if (message.payload.parts) {
      message.payload.parts.forEach(part => {
        if (part.filename && part.body.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size,
            attachmentId: part.body.attachmentId
          });
        }
      });
    }

    return {
      id: message.id,
      threadId: message.threadId,
      labelIds: message.labelIds,
      snippet: message.snippet,
      internalDate: new Date(parseInt(message.internalDate)),
      from: getHeader('From'),
      to: getHeader('To'),
      cc: getHeader('Cc'),
      bcc: getHeader('Bcc'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      body,
      attachments,
      raw: message
    };
  }

  /**
   * Wyślij wiadomość
   */
  async sendMessage(options) {
    if (!this.isAuthorized()) {
      throw new Error('Gmail API nie jest zautoryzowany');
    }

    const {
      to,
      subject,
      body,
      from = 'info@polska-grupa-wierzytelnosci.pl',
      cc = '',
      bcc = '',
      replyTo = ''
    } = options;

    try {
      const message = this.createMessage({
        to,
        from,
        subject,
        body,
        cc,
        bcc,
        replyTo
      });

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message
        }
      });

      console.log('✅ Wiadomość wysłana:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Błąd wysyłania wiadomości:', error.message);
      throw error;
    }
  }

  /**
   * Stwórz surową wiadomość email (RFC 2822)
   */
  createMessage(options) {
    const { to, from, subject, body, cc, bcc, replyTo } = options;

    const messageParts = [
      `From: ${from}`,
      `To: ${to}`,
      cc ? `Cc: ${cc}` : '',
      bcc ? `Bcc: ${bcc}` : '',
      replyTo ? `Reply-To: ${replyTo}` : '',
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${subject}`,
      '',
      body
    ];

    const message = messageParts.filter(line => line).join('\r\n');
    
    // Encode to base64url
    return Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Odpowiedz na wiadomość
   */
  async replyToMessage(messageId, replyBody, from = 'info@polska-grupa-wierzytelnosci.pl') {
    const originalMessage = await this.getMessage(messageId);

    return this.sendMessage({
      to: originalMessage.from,
      subject: originalMessage.subject.startsWith('Re: ') 
        ? originalMessage.subject 
        : `Re: ${originalMessage.subject}`,
      body: replyBody,
      from,
      replyTo: from
    });
  }

  /**
   * Pobierz załącznik
   */
  async getAttachment(messageId, attachmentId) {
    if (!this.isAuthorized()) {
      throw new Error('Gmail API nie jest zautoryzowany');
    }

    try {
      const response = await this.gmail.users.messages.attachments.get({
        userId: 'me',
        messageId,
        id: attachmentId
      });

      return Buffer.from(response.data.data, 'base64');
    } catch (error) {
      console.error('❌ Błąd pobierania załącznika:', error.message);
      throw error;
    }
  }

  /**
   * Oznacz wiadomość jako przeczytaną
   */
  async markAsRead(messageId) {
    if (!this.isAuthorized()) {
      throw new Error('Gmail API nie jest zautoryzowany');
    }

    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });

      console.log('✅ Wiadomość oznaczona jako przeczytana:', messageId);
    } catch (error) {
      console.error('❌ Błąd oznaczania jako przeczytane:', error.message);
      throw error;
    }
  }

  /**
   * Pobierz profil użytkownika
   */
  async getProfile() {
    if (!this.isAuthorized()) {
      throw new Error('Gmail API nie jest zautoryzowany');
    }

    try {
      const response = await this.gmail.users.getProfile({
        userId: 'me'
      });

      return {
        email: response.data.emailAddress,
        messagesTotal: response.data.messagesTotal,
        threadsTotal: response.data.threadsTotal,
        historyId: response.data.historyId
      };
    } catch (error) {
      console.error('❌ Błąd pobierania profilu:', error.message);
      throw error;
    }
  }
}

// Singleton instance
const gmailService = new GmailAPIService();

module.exports = gmailService;
