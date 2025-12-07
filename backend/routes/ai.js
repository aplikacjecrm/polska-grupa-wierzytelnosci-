const express = require('express');
const router = express.Router();
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');
const legalScraper = require('../utils/legal-scraper');
const documentParser = require('../services/document-parser'); // 📄 Parser PDF/DOCX
const path = require('path');

// Pobierz instancję bazy danych
const db = getDatabase();

// Anthropic API integration - WYŁĄCZONE (nie opłacone, używamy Gemini)
// const Anthropic = require('@anthropic-ai/sdk');
// const anthropic = new Anthropic({
//     apiKey: process.env.ANTHROPIC_API_KEY
// });
const anthropic = null; // Wyłączone

// Log AI usage - WYŁĄCZONE dla maksymalnej dyskrecji
async function logAIUsage(userId, action, caseId, tokens) {
    // LOGI WYŁĄCZONE - żadne dane nie są zapisywane
    // Odkomentuj poniżej jeśli chcesz włączyć logi:
    /*
    try {
        await db.query(
            'INSERT INTO ai_logs (user_id, action, case_id, tokens_used, created_at) VALUES (?, ?, ?, ?, NOW())',
            [userId, action, caseId, tokens]
        );
    } catch (error) {
        console.error('Error logging AI usage:', error);
    }
    */
}

// Filtr danych wrażliwych - anonimizacja przed wysłaniem do AI
function sanitizeData(data) {
    const sanitized = { ...data };
    
    // Usuń/zamaskuj dane wrażliwe
    if (sanitized.pesel) sanitized.pesel = '[UKRYTE]';
    if (sanitized.nip) sanitized.nip = '[UKRYTE]';
    if (sanitized.regon) sanitized.regon = '[UKRYTE]';
    if (sanitized.krs) sanitized.krs = '[UKRYTE]';
    
    // Zamaskuj adresy - zostaw tylko miasto
    if (sanitized.address) {
        const parts = sanitized.address.split(',');
        sanitized.address = parts.length > 1 ? `[ADRES UKRYTY], ${parts[parts.length - 1].trim()}` : '[ADRES UKRYTY]';
    }
    
    // Zamaskuj email - zostaw tylko domenę
    if (sanitized.email) {
        const emailParts = sanitized.email.split('@');
        sanitized.email = emailParts.length > 1 ? `[UKRYTE]@${emailParts[1]}` : '[UKRYTE]';
    }
    
    // Zamaskuj telefon - zostaw tylko kierunkowy
    if (sanitized.phone) {
        sanitized.phone = sanitized.phone.substring(0, 3) + 'XXX-XXX';
    }
    
    // Zamaskuj numer konta bankowego
    if (sanitized.bank_account) sanitized.bank_account = '[UKRYTE]';
    
    // Zamaskuj wartość sprawy - zaokrąglij do rzędu wielkości
    if (sanitized.value_amount && sanitized.value_amount > 0) {
        const rounded = Math.round(sanitized.value_amount / 10000) * 10000;
        sanitized.value_amount = `~${rounded}`;
    }
    
    return sanitized;
}

// Analyze case with AI
router.post('/analyze-case', verifyToken, async (req, res) => {
    const db = getDatabase();
    try {
        // Sprawdź czy Claude jest dostępny
        if (!anthropic) {
            return res.status(503).json({ 
                error: 'Claude AI nie jest dostępny',
                message: 'Używaj endpointu /api/ai/gemini/* zamiast tego. Claude wymaga płatnego klucza API.'
            });
        }

        const { caseId, question } = req.body;
        const userId = req.user.userId; // JWT używa userId nie id!
        const userRole = req.user.role;

        // Check permissions
        if (!['lawyer', 'admin'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień do AI' });
        }

        // Get case data (READ ONLY) - SQLite version
        const caseData = await new Promise((resolve, reject) => {
            db.get(
                `SELECT c.*, 
                        cl.first_name || ' ' || cl.last_name as client_name,
                        cl.company_name,
                        u.name as lawyer_name
                 FROM cases c
                 LEFT JOIN clients cl ON c.client_id = cl.id
                 LEFT JOIN users u ON c.assigned_to = u.id
                 WHERE c.id = ? AND (c.assigned_to = ? OR ? = 'admin')`,
                [caseId, userId, userRole],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (!caseData) {
            return res.status(404).json({ error: 'Sprawa nie znaleziona lub brak dostępu' });
        }

        // Get related data - SQLite version
        const events = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM events WHERE case_id = ? ORDER BY start_date', [caseId],
                (err, rows) => err ? reject(err) : resolve(rows || []));
        });

        const documents = await new Promise((resolve, reject) => {
            db.all('SELECT id, title, file_type, uploaded_at FROM documents WHERE case_id = ?', [caseId],
                (err, rows) => err ? reject(err) : resolve(rows || []));
        });

        const comments = await new Promise((resolve, reject) => {
            db.all('SELECT comment, created_at, is_internal FROM case_comments WHERE case_id = ? ORDER BY created_at DESC LIMIT 10', [caseId],
                (err, rows) => err ? reject(err) : resolve(rows || []));
        });

        // ANONIMIZACJA DANYCH przed wysłaniem do AI
        const sanitizedCase = sanitizeData(caseData);

        // Prepare context for AI - TYLKO zanonimizowane dane
        const context = {
            case_number: sanitizedCase.case_number,
            title: sanitizedCase.title,
            type: sanitizedCase.case_type,
            status: sanitizedCase.status,
            priority: sanitizedCase.priority,
            client: sanitizedCase.client_name + (sanitizedCase.company_name ? ` (${sanitizedCase.company_name})` : ''),
            description: sanitizedCase.description,
            court: sanitizedCase.court_name,
            signature: sanitizedCase.court_signature,
            opposing_party: sanitizedCase.opposing_party,
            value: sanitizedCase.value_amount,
            events_count: events.length,
            documents_count: documents.length,
            recent_comments: comments.length
        };

        // Call AI
        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 2048,
            system: `Jesteś ekspertem prawnym specjalizującym się w polskim prawie.

ZASADY ANALIZY SPRAW:
1. Możesz TYLKO analizować i doradzać (nie modyfikujesz danych)
2. ZAWSZE odwołuj się do konkretnych przepisów prawa:
   - Kodeks cywilny (k.c.)
   - Kodeks postępowania cywilnego (k.p.c.)
   - Kodeks karny (k.k.) / Kodeks postępowania karnego (k.p.k.)
   - Inne ustawy szczególne
3. Używaj profesjonalnego języka prawniczego
4. Podawaj KONKRETNE podstawy prawne dla każdej rekomendacji

STRUKTURA ODPOWIEDZI:
💡 ANALIZA PRAWNA:
   - Kwalifikacja prawna sprawy (typ sprawy, podstawa prawna)
   - Kluczowe przepisy prawne (podaj artykuły!)
   - Stan faktyczny vs. stan prawny

⚖️ PODSTAWA PRAWNA:
   - Art. X k.c./k.p.c. - [zwięzły opis przepisu]
   - Powołaj minimum 2-3 konkretne artykuły
   - Wskaż związek przepisów z faktami

✅ ZALECENIA PROCESOWE:
   - Konkretne kroki (z podstawą prawną)
   - Terminy procesowe (art. X k.p.c.)
   - Wnioski dowodowe

⚠️ RYZYKA I UWAGI:
   - Zagrożenia procesowe
   - Terminy do zachowania
   - Kwestie do wyjaśnienia

📋 NASTĘPNE KROKI:
   - Priorytetowe działania (z terminami)

PRZYKŁAD PRAWIDŁOWEJ ODPOWIEDZI:
"Na podstawie art. 455 k.c. w zw. z art. 471 k.c., powód może dochodzić..."

ZAWSZE kończ: "⚠️ To sugestia AI - wymaga weryfikacji prawnika i sprawdzenia aktualności przepisów"`,
            messages: [{
                role: "user",
                content: `Sprawa: ${JSON.stringify(context, null, 2)}

Pytanie użytkownika: ${question}

Przeanalizuj i udziel konkretnej odpowiedzi.`
            }]
        });

        const aiResponse = message.content[0].text;
        const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

        // Log usage
        await logAIUsage(userId, 'analyze-case', caseId, tokensUsed);

        res.json({
            success: true,
            response: aiResponse,
            tokens: tokensUsed,
            warning: "To sugestia AI. Zawsze weryfikuj przed użyciem."
        });

    } catch (error) {
        console.error('AI analyze error:', error);
        res.status(500).json({ error: 'Błąd analizy AI: ' + error.message });
    }
});

// Generate document draft
router.post('/generate-document', verifyToken, async (req, res) => {
    const db = getDatabase();
    try {
        // Sprawdź czy Claude jest dostępny
        if (!anthropic) {
            return res.status(503).json({ 
                error: 'Claude AI nie jest dostępny',
                message: 'Funkcja generowania dokumentów wymaga Claude AI (płatny). Używaj Gemini dla innych funkcji.'
            });
        }

        const { caseId, documentType, additionalInfo } = req.body;
        const userId = req.user.userId; // JWT używa userId nie id!
        const userRole = req.user.role;

        if (!['lawyer', 'admin'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }

        // Get case data - SQLite version
        const caseData = await new Promise((resolve, reject) => {
            db.get(
                `SELECT c.*, 
                        cl.first_name || ' ' || cl.last_name as client_name,
                        cl.company_name, 
                        cl.address_street || ', ' || cl.address_city as address, 
                        cl.pesel, 
                        cl.nip
                 FROM cases c
                 LEFT JOIN clients cl ON c.client_id = cl.id
                 WHERE c.id = ? AND (c.assigned_to = ? OR ? = 'admin')`,
                [caseId, userId, userRole],
                (err, row) => err ? reject(err) : resolve(row)
            );
        });

        if (!caseData) {
            return res.status(404).json({ error: 'Brak dostępu do sprawy' });
        }

        // ANONIMIZACJA DANYCH przed wysłaniem do AI
        const sanitizedCase = sanitizeData(caseData);

        // Document type prompts - specjalistyczne dla różnych typów spraw
        const documentPrompts = {
            // Podstawowe pisma procesowe
            pozew: 'Napisz profesjonalny pozew zawierający: oznaczenie sądu, stron, żądanie z podstawą prawną, uzasadnienie faktyczne i prawne, wnioski dowodowe, podpis.',
            odpowiedz_na_pozew: 'Napisz odpowiedź na pozew z odniesieniem do faktów, stanowiskiem prawnym, zarzutami procesowymi i wnioskami.',
            wniosek_procesowy: 'Napisz wniosek procesowy z uzasadnieniem prawnym, podstawą art. k.p.c. i wnioskiem końcowym.',
            pismo_do_sadu: 'Napisz pismo procesowe w odpowiednim formacie prawnym z podstawą prawną.',
            sprzeciw_od_nakazu: 'Napisz sprzeciw od nakazu zapłaty z zarzutami co do istoty roszczenia, podstawą prawną art. 485 k.p.c. i wnioskami.',
            
            // Odszkodowania
            pozew_odszkodowawczy: 'Napisz pozew o odszkodowanie na podstawie art. 415 k.c., 361 k.c. z opisem zdarzenia, szkody, związku przyczynowego i wyliczeniem odszkodowania.',
            pozew_zadoscuczynienie: 'Napisz pozew o zadośćuczynienie na podstawie art. 445 k.c., 448 k.c. z opisem doznanej krzywdy, skutków, wpływu na życie i uzasadnieniem kwoty.',
            wezwanie_do_zaplaty: 'Napisz przedsądowe wezwanie do zapłaty z opisem zobowiązania, podstawą prawną, wyznaczeniem terminu (14 dni) i ostrzeżeniem o pozwie.',
            reklamacja_ubezpieczenie: 'Napisz reklamację do ubezpieczyciela z opisem zdarzenia, zgłoszenia szkody, kwestionowaniem decyzji, podstawą prawną i żądaniem wypłaty.',
            odwolanie_od_decyzji_ubezpieczyciel: 'Napisz odwołanie od decyzji ubezpieczyciela do Rzecznika Finansowego z uzasadnieniem, podstawą prawną i wnioskami.',
            pozew_wypadek_komunikacyjny: 'Napisz pozew o odszkodowanie z wypadku komunikacyjnego na podstawie art. 436 k.c. (odpowiedzialność posiadacza pojazdu) z opisem wypadku, obrażeń, kosztów leczenia.',
            pozew_wypadek_przy_pracy: 'Napisz pozew o odszkodowanie z wypadku przy pracy na podstawie art. 415 k.c. w zw. z Kodeksem pracy, z opisem okoliczności, naruszenia BHP, skutków.',
            
            // Upadłość konsumencka
            wniosek_upadlosc_konsumencka: 'Napisz wniosek o ogłoszenie upadłości konsumenckiej zgodnie z ustawą Prawo upadłościowe, zawierający: dane osobowe, wykaz majątku, wykaz wierzycieli i długów, okoliczności niewypłacalności, wniosek o wyznaczenie syndyka.',
            plan_splaty_upadlosc: 'Napisz plan spłaty wierzycieli w postępowaniu upadłościowym konsumenckim zgodnie z art. 4911-4918 Prawa upadłościowego, z podziałem na kategorie wierzycieli i harmonogramem spłat.',
            uzupelnienie_wniosku_upadlosc: 'Napisz uzupełnienie wniosku o ogłoszenie upadłości konsumenckiej w odpowiedzi na wezwanie sądu.',
            
            // Restrukturyzacja
            wniosek_restrukturyzacja: 'Napisz wniosek o otwarcie postępowania restrukturyzacyjnego zgodnie z Prawem restrukturyzacyjnym, zawierający: dane dłużnika, sytuację finansową, przyczyny niewypłacalności lub zagrożenia niewypłacalnością, propozycję układu.',
            plan_restrukturyzacyjny: 'Napisz plan restrukturyzacyjny zgodnie z Prawem restrukturyzacyjnym, zawierający: kategoryzację wierzycieli, proponowane warunki spłaty, źródła finansowania, harmonogram działań.',
            propozycja_ukladu: 'Napisz propozycję układu z wierzycielami w postępowaniu restrukturyzacyjnym z podziałem na kategorie, warunkami spłaty i skutkami przyjęcia układu.',
            wniosek_zawieszenie_egzekucji: 'Napisz wniosek o zawieszenie postępowania egzekucyjnego na podstawie art. 177 k.p.c. lub art. 82 Prawa restrukturyzacyjnego z uzasadnieniem i podstawą prawną.',
            
            // Prawo pracy
            pozew_przywrocenie_do_pracy: 'Napisz pozew o przywrócenie do pracy na podstawie art. 45 Kodeksu pracy z opisem okoliczności rozwiązania umowy, naruszenia przepisów, wnioskiem o przywrócenie i odszkodowanie.',
            pozew_odszkodowanie_zwolnienie: 'Napisz pozew o odszkodowanie za niezgodne z prawem rozwiązanie umowy o pracę na podstawie art. 471 k.p. z opisem okoliczności i wyliczeniem odszkodowania.',
            pozew_wynagrodzenie: 'Napisz pozew o wynagrodzenie za pracę na podstawie art. 85 k.p. z opisem okresu pracy, stawki, niewyp łaconego wynagrodzenia i wyliczeniem należności.',
            
            // Nieruchomości
            pozew_eksmisja: 'Napisz pozew o eksmisję na podstawie art. 222 k.c. (ochrona własności) z opisem tytułu prawnego, bezprawnego zajmowania, wezwania do opuszczenia.',
            pozew_zniesienie_wspolwlasnosci: 'Napisz pozew o zniesienie współwłasności na podstawie art. 210 k.c. z propozycją sposobu zniesienia (podział rzeczowy lub sprzedaż).',
            
            // Inne
            umowa_zlecenie: 'Napisz umowę zlecenia zgodnie z art. 734 k.c. zawierającą: strony, przedmiot, wynagrodzenie, czas trwania, obowiązki stron.',
            pelnomocnictwo: 'Napisz pełnomocnictwo procesowe zgodnie z art. 88-91 k.p.c. do reprezentowania w postępowaniu sądowym.',
            ugoda: 'Napisz ugodę sądową lub pozasądową zgodnie z art. 917 k.c. z określeniem wzajemnych ustępstw i zobowiązań stron.',
            oswiadczenie: 'Napisz oświadczenie w formie odpowiedniej dla wywołania skutków prawnych.'
        };

        // Jeśli to niestandardowy typ dokumentu, użyj jego nazwy jako promptu
        const prompt = documentPrompts[documentType] || `Napisz profesjonalny dokument: ${documentType}. Zachowaj odpowiednią strukturę i format prawny.`;

        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 4096,
            system: `Jesteś ekspertem prawnym specjalizującym się w polskim prawie procesowym i materialnym.

OBOWIĄZKOWE ZASADY TWORZENIA PISM:
1. Zawsze powoływaj się na KONKRETNE PRZEPISY PRAWA:
   - Kodeks cywilny (k.c.) - art. X
   - Kodeks postępowania cywilnego (k.p.c.) - art. X
   - Kodeks pracy (k.p.) - art. X
   - Ustawa o... - art. X
   
2. UZASADNIENIE PRAWNE musi zawierać:
   - Podstawę prawną żądania (art. X k.c./k.p.c.)
   - Powołanie się na orzecznictwo (gdy istotne)
   - Argumentację prawną opartą na przepisach
   
3. JĘZYK PRAWNICZY:
   - Używaj profesjonalnej terminologii urzędowej
   - Stosuj zwroty "w świetle przepisu art. X...", "na podstawie art. X...", "zgodnie z art. X..."
   - Pisz formalnie i precyzyjnie
   
4. STRUKTURA DOKUMENTU:
   - Oznaczenie sądu/adresata
   - Strony postępowania
   - Żądanie z podstawą prawną (art. X k.p.c.)
   - Uzasadnienie faktyczne
   - Uzasadnienie prawne (OBOWIĄZKOWO z przepisami!)
   - Wnioski końcowe
   - Podpis

5. PRZYKŁADY PRAWIDŁOWEGO POWOŁANIA:
   ✅ "na podstawie art. 187 § 1 pkt 1 k.p.c."
   ✅ "zgodnie z art. 455 k.c. w zw. z art. 471 k.c."
   ✅ "w świetle art. 6 k.c. ciężar dowodu spoczywa na..."
   
ZAWSZE:
- Dodaj podstawę prawną każdego żądania
- W uzasadnieniu powołaj minimum 3-5 konkretnych artykułów
- Cytuj treść kluczowych przepisów
- Oznacz miejsca do uzupełnienia jako [DO UZUPEŁNIENIA]
- Na końcu: "⚠️ SZKIC - WYMAGA WERYFIKACJI PRAWNIKA I SPRAWDZENIA AKTUALNOŚCI PRZEPISÓW"
- Dane osobowe są zanonimizowane dla bezpieczeństwa`,
            messages: [{
                role: "user",
                content: `${prompt}

Dane sprawy (zanonimizowane):
- Numer: ${sanitizedCase.case_number}
- Tytuł: ${sanitizedCase.title}
- Klient: ${sanitizedCase.client_name}${sanitizedCase.company_name ? ` (${sanitizedCase.company_name})` : ''}
- Adres klienta: ${sanitizedCase.address || '[DO UZUPEŁNIENIA]'}
- Sąd: ${sanitizedCase.court_name || '[DO UZUPEŁNIENIA]'}
- Sygnatura: ${sanitizedCase.court_signature || '[DO UZUPEŁNIENIA]'}
- Strona przeciwna: ${sanitizedCase.opposing_party || '[DO UZUPEŁNIENIA]'}
- Wartość przedmiotu sporu: ${sanitizedCase.value_amount || '[DO UZUPEŁNIENIA]'} PLN

Opis sprawy: ${sanitizedCase.description || '[DO UZUPEŁNIENIA]'}

Dodatkowe informacje: ${additionalInfo || 'Brak'}

UWAGA: Dane osobowe zostały zanonimizowane. W finalnym dokumencie użyj [DO UZUPEŁNIENIA] tam gdzie potrzebne szczegóły klienta.

Wygeneruj profesjonalny dokument.`
            }]
        });

        const documentDraft = message.content[0].text;
        const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

        await logAIUsage(userId, `generate-${documentType}`, caseId, tokensUsed);

        res.json({
            success: true,
            draft: documentDraft,
            tokens: tokensUsed,
            warning: "SZKIC - wymaga edycji i weryfikacji przez prawnika przed użyciem!"
        });

    } catch (error) {
        console.error('AI document generation error:', error);
        res.status(500).json({ error: 'Błąd generowania dokumentu: ' + error.message });
    }
});

// Client chatbot (limited functionality)
router.post('/client-chat', verifyToken, async (req, res) => {
    const db = getDatabase();
    try {
        // Sprawdź czy Claude jest dostępny
        if (!anthropic) {
            return res.status(503).json({ 
                error: 'Claude AI nie jest dostępny',
                message: 'Chatbot wymaga Claude AI (płatny).'
            });
        }

        const { question, caseId } = req.body;
        const userId = req.user.userId; // JWT używa userId nie id!

        // Verify client access to case - SQLite version
        const caseData = await new Promise((resolve, reject) => {
            db.get(
                'SELECT c.*, cl.id as client_id FROM cases c LEFT JOIN clients cl ON c.client_id = cl.id WHERE c.id = ? AND cl.id = (SELECT client_id FROM users WHERE id = ?)',
                [caseId, userId],
                (err, row) => err ? reject(err) : resolve(row)
            );
        });

        if (!caseData) {
            return res.status(403).json({ error: 'Brak dostępu do sprawy' });
        }

        // ANONIMIZACJA DANYCH - nawet dla chatbota
        const sanitizedCase = sanitizeData(caseData);

        // Get basic info - SQLite version
        const events = await new Promise((resolve, reject) => {
            db.all(
                "SELECT title, start_date as event_date, location FROM events WHERE case_id = ? AND date(start_date) >= date('now') ORDER BY start_date LIMIT 3",
                [caseId],
                (err, rows) => err ? reject(err) : resolve(rows || [])
            );
        });

        const message = await anthropic.messages.create({
            model: "claude-3-haiku-20240307", // Cheaper model for client chat
            max_tokens: 512,
            system: `Jesteś pomocnym asystentem kancelarii prawnej odpowiadającym klientom.

ZASADY:
1. Odpowiadaj tylko o podstawowe informacje ze sprawy
2. NIE udzielaj porad prawnych
3. NIE podawaj się za prawnika
4. Kieruj do prawnika w sprawach merytorycznych
5. Bądź uprzejmy i pomocny
6. Używaj prostego języka
7. Dane osobowe są chronione i zanonimizowane

Mów: "Zgodnie z danymi w systemie..." lub "Widzę że..."
ZAWSZE kończ: "📞 W razie pytań skontaktuj się z prawnikiem"`,
            messages: [{
                role: "user",
                content: `Sprawa: ${sanitizedCase.case_number} - ${sanitizedCase.title}
Status: ${sanitizedCase.status}
Nadchodzące terminy: ${events.length}

Pytanie klienta: ${question}

Odpowiedz krótko i pomocnie.`
            }]
        });

        const response = message.content[0].text;
        const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;

        await logAIUsage(userId, 'client-chat', caseId, tokensUsed);

        res.json({
            success: true,
            response: response,
            isBot: true
        });

    } catch (error) {
        console.error('Client chat error:', error);
        res.status(500).json({ error: 'Błąd chatbota' });
    }
});

// Get AI usage statistics (admin only) - DISABLED (logi wyłączone)
router.get('/usage-stats', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Tylko admin' });
        }

        // Logi są wyłączone, więc zwróć pusty wynik
        res.json({ 
            success: true, 
            stats: [], 
            message: 'Logi AI są wyłączone dla maksymalnej prywatności' 
        });

    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Błąd statystyk' });
    }
});

// 🤖 AI LEGAL SEARCH - Wyszukiwanie prawne z Claude
router.post('/legal-search', verifyToken, async (req, res) => {
    // Sprawdź czy Claude jest dostępny
    if (!anthropic) {
        return res.status(503).json({ 
            error: 'Claude AI nie jest dostępny',
            message: 'Wyszukiwanie prawne wymaga Claude AI (płatny). Używaj Gemini dla innych funkcji.'
        });
    }

    const { query, type, includeCaseContext, searchJurisprudence, caseContext } = req.body;
    const userId = req.user.userId;
    
    console.log('🤖 AI Legal Search:', { 
        type, 
        query: query.substring(0, 100),
        includeCaseContext,
        searchJurisprudence,
        hasCaseContext: !!caseContext
    });
    
    try {
        let systemPrompt = '';
        let userPrompt = query;
        
        // Dodaj kontekst sprawy do pytania jeśli dostępny
        if (includeCaseContext && caseContext) {
            userPrompt = `KONTEKST SPRAWY:
Numer: ${caseContext.case_number}
Tytuł: ${caseContext.title}
Typ: ${caseContext.case_type}
Status: ${caseContext.status}
${caseContext.description ? 'Opis: ' + caseContext.description : ''}
${caseContext.court_name ? 'Sąd: ' + caseContext.court_name : ''}
${caseContext.court_signature ? 'Sygnatura: ' + caseContext.court_signature : ''}

PYTANIE UŻYTKOWNIKA:
${query}

Proszę uwzględnić powyższy kontekst sprawy w swojej odpowiedzi.`;
            
            console.log('📁 Dodano kontekst sprawy do promptu');
        }
        
        // Dodaj info o opcjach do systemu
        let additionalContext = '\n\nOPCJE ZAAWANSOWANE:\n';
        if (searchJurisprudence) {
            additionalContext += '- Użytkownik prosi również o przytoczenie orzecznictwa sądowego i precedensów\n';
        }
        if (includeCaseContext && caseContext) {
            additionalContext += '- Uwzględnij kontekst aktualnie otwartej sprawy podany w pytaniu użytkownika\n';
        }
        
        // 📚 POBIERZ AKTUALNE PRZEPISY PRAWNE
        const relevantLaws = await legalScraper.searchRelevantLaws(query, 3);
        const lawsContext = legalScraper.formatLawsForPrompt(relevantLaws);
        
        if (lawsContext) {
            userPrompt += lawsContext;
            console.log(`📚 Dodano ${relevantLaws.length} aktualnych przepisów do kontekstu`);
        }
        
        // Dostosuj prompt w zależności od typu wyszukiwania
        if (type === 'legal') {
            systemPrompt = `Jesteś ekspertem prawnym w polskim prawie. Twoim zadaniem jest pomóc użytkownikowi znaleźć odpowiednie przepisy prawne i artykuły.

Odpowiadaj ZAWSZE PO POLSKU i cytuj konkretne artykuły z:
- Kodeks Cywilny (KC)
- Kodeks Postępowania Cywilnego (KPC)
- Kodeks Pracy (KP)
- Kodeks Karny (KK)
- Kodeks Postępowania Karnego (KPK)
- Inne ustawy jeśli potrzeba

Format odpowiedzi:
1. Krótkie podsumowanie sytuacji prawnej
2. Podstawy prawne (konkretne artykuły z cytatami)
3. Praktyczne wskazówki
${searchJurisprudence ? '4. Orzecznictwo sądowe i precedensy' : ''}

Bądź precyzyjny i fachowy.${additionalContext}`;
        } else if (type === 'analyze') {
            systemPrompt = `Jesteś ekspertem prawnym analizującym dokumenty. Twoim zadaniem jest analiza prawna przedstawionej sytuacji lub dokumentu.

Analizuj dokładnie i zwróć uwagę na:
- Podstawy prawne
- Mocne i słabe strony argumentacji
- Ryzyka prawne
- Zalecenia działań
${searchJurisprudence ? '- Precedensy i orzecznictwo' : ''}

Odpowiadaj ZAWSZE PO POLSKU.${additionalContext}`;
        } else if (type === 'case') {
            systemPrompt = `Jesteś ekspertem prawnym analizującym sprawy sądowe. Twoim zadaniem jest kompleksowa analiza sprawy i strategii procesowej.

W swojej analizie uwzględnij:
- Podstawy prawne
- Argumenty za i przeciw
- Przewidywany przebieg sprawy
- Propozycje działań strategicznych
${searchJurisprudence ? '- Podobne sprawy i orzecznictwo' : ''}

Odpowiadaj ZAWSZE PO POLSKU.${additionalContext}`;
        }
        
        // Wywołaj Claude API
        const message = await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 2048,
            system: systemPrompt,
            messages: [
                {
                    role: 'user',
                    content: userPrompt
                }
            ]
        });
        
        const answer = message.content[0].text;
        
        // Wyciągnij źródła (artykuły prawne) z odpowiedzi - ULEPSZONE!
        const sources = [];
        
        // Pattern 1: Artykuły z kodeksem - WSZYSTKIE KODEKSY!
        const withCodeRegex = /(?:art\.|artykuł)\s*(\d+[a-z]?)\s*(?:§\s*(\d+))?\s+(KC|KPC|KK|KPK|KP|KKW|KKS|KW|KPW|KRO|KSH|KPA|PPSA|KW_WYBORCZY|KM|PRD|k\.c\.|k\.p\.c\.|k\.k\.|k\.p\.k\.|k\.p\.|k\.r\.o\.|k\.s\.h\.|k\.p\.a\.)/gi;
        let matches = answer.match(withCodeRegex);
        if (matches) {
            matches.forEach(m => {
                let normalized = m.replace(/artykuł/gi, 'art.')
                                  .replace(/k\.c\./gi, 'KC')
                                  .replace(/k\.p\.c\./gi, 'KPC')
                                  .replace(/k\.k\./gi, 'KK')
                                  .replace(/k\.p\.k\./gi, 'KPK')
                                  .replace(/k\.p\./gi, 'KP')
                                  .replace(/k\.r\.o\./gi, 'KRO')
                                  .replace(/k\.s\.h\./gi, 'KSH')
                                  .replace(/k\.p\.a\./gi, 'KPA')
                                  .trim();
                sources.push(normalized);
            });
        }
        
        // Pattern 2: Artykuły bez kodeksu (np. "art. 118", "Artykuł 94 § 2")
        // Tylko jeśli nie ma już tego artykułu z kodeksem
        const withoutCodeRegex = /(?:art\.|artykuł)\s+(\d+[a-z]?)(?:\s+§\s+(\d+))?(?!\s+[A-Z]{2,})/gi;
        matches = answer.match(withoutCodeRegex);
        if (matches) {
            matches.forEach(m => {
                let normalized = m.replace(/artykuł/gi, 'art.').trim();
                // Dodaj tylko jeśli nie ma już z kodeksem
                const articleNum = normalized.match(/\d+/)[0];
                const hasWithCode = sources.some(s => s.includes(`art. ${articleNum}`));
                if (!hasWithCode) {
                    sources.push(normalized);
                }
            });
        }
        
        // Usuń duplikaty i ogranicz do 10
        const uniqueSources = [...new Set(sources)].slice(0, 10);
        
        console.log('✅ AI Legal Search completed:', uniqueSources.length, 'sources found:', uniqueSources);
        
        res.json({
            answer: answer,
            sources: uniqueSources,
            tokensUsed: message.usage.input_tokens + message.usage.output_tokens
        });
        
    } catch (error) {
        console.error('❌ AI Legal Search error:', error);
        console.error('❌ Error details:', error.response?.data || error.message);
        
        res.status(500).json({ 
            success: false,
            error: 'Błąd wyszukiwania AI',
            message: error.message,
            details: error.response?.data?.error?.message || 'Sprawdź klucz API i połączenie'
        });
    }
});

// 🔍 FUNKCJA POMOCNICZA - Wyciągnij tekst artykułu
function extractArticleText(content, articleNum, paragraph) {
    if (!content) return null;
    
    // KRYTYCZNA POPRAWKA: Usuń ^ z numeru artykułu (353^1 → 353)
    const cleanArticleNum = articleNum.toString().replace(/\^.*$/, '');
    
    console.log('🔍 Szukam Art. ' + cleanArticleNum + (paragraph ? ' § ' + paragraph : ''));
    console.log('🔍 Oryginalny numer:', articleNum, '→ Wyczyszczony:', cleanArticleNum);
    
    // JEŚLI SZUKAMY KONKRETNEGO PARAGRAFU
    if (paragraph) {
        const paragraphPatterns = [
            `§\\s*${paragraph}[^\\d]`,           // § 2 (nie § 20)
            `§\\s*${paragraph}\\.`,               // § 2.
            `§\\s*${paragraph}\\s+-`,            // § 2 -
            `§\\s*${paragraph}\\s+[A-ZŁĄĆĘŃÓŚŹŻ]` // § 2 Tekst
        ];
        
        // Najpierw znajdź cały artykuł (użyj oczyszczonego numeru!)
        const articlePattern = `Art\\. ${cleanArticleNum}[^\\d]`;
        const articleMatch = content.match(new RegExp(articlePattern, 'i'));
        
        if (articleMatch) {
            const articleStart = articleMatch.index;
            // Szukaj końca artykułu
            const nextArticle = content.substring(articleStart + 10).match(/Art\. \d+/);
            const articleEnd = nextArticle ? articleStart + 10 + nextArticle.index : articleStart + 5000;
            const articleContent = content.substring(articleStart, articleEnd);
            
            // Teraz szukaj paragrafu WEWNĄTRZ artykułu
            for (const pattern of paragraphPatterns) {
                const regex = new RegExp(pattern, 'i');
                const paragraphMatch = articleContent.match(regex);
                
                if (paragraphMatch) {
                    const paragraphStart = articleStart + paragraphMatch.index;
                    // Szukaj końca paragrafu (do następnego § lub końca artykułu)
                    const restOfArticle = content.substring(paragraphStart);
                    const nextParagraph = restOfArticle.substring(5).match(/§\s*\d+/);
                    const paragraphEnd = nextParagraph ? 
                        paragraphStart + 5 + nextParagraph.index : 
                        Math.min(paragraphStart + 1000, articleEnd);
                    
                    const extracted = content.substring(paragraphStart, paragraphEnd).trim();
                    console.log('✅ Znaleziono paragraf:', extracted.substring(0, 150) + '...');
                    return `Art. ${cleanArticleNum} ` + extracted;
                }
            }
            
            // Paragraf nie znaleziony - sprawdź ile paragrafów jest w artykule
            const allParagraphs = articleContent.match(/§\s*\d+/g);
            if (allParagraphs) {
                console.log('⚠️ Paragraf § ' + paragraph + ' nie znaleziony. Dostępne paragrafy:', allParagraphs);
                console.log('⚠️ Zwracam cały artykuł');
            } else {
                console.log('⚠️ Artykuł nie ma numerowanych paragrafów w bazie');
                console.log('⚠️ Zwracam cały artykuł');
            }
            return articleContent.trim();
        }
    }
    
    // JEŚLI SZUKAMY CAŁEGO ARTYKUŁU (bez konkretnego paragrafu)
    const patterns = [
        `Art\\. ${cleanArticleNum}[^\\d]`,                  // Art. 1 (nie Art. 10)
        `art\\. ${cleanArticleNum}[^\\d]`,                  // art. 1
        `Artykuł ${cleanArticleNum}[^\\d]`                  // Artykuł 1
    ];
    
    for (const pattern of patterns) {
        const regex = new RegExp(pattern, 'i');
        const match = content.match(regex);
        
        if (match) {
            const startIndex = match.index;
            // Szukaj do następnego artykułu lub końca (max 2000 znaków)
            const endMatch = content.substring(startIndex + 10).match(/Art\. \d+/);
            const endIndex = endMatch ? startIndex + 10 + endMatch.index : startIndex + 2000;
            
            const extracted = content.substring(startIndex, endIndex).trim();
            console.log('✅ Znaleziono artykuł:', extracted.substring(0, 150) + '...');
            return extracted;
        }
    }
    
    console.log('⚠️ Nie znaleziono artykułu');
    return null;
}

// 🔥 Import hybrydowego klienta
const { client: legalAPIClient } = require('../utils/legal-api-client');

// 📖 POBIERZ TREŚĆ ARTYKUŁU Z BAZY (z fallbackiem do API)
// PUBLICZNY ENDPOINT - NIE WYMAGA TOKENU (prawo jest publiczne!)
router.post('/legal-acts/article', async (req, res) => {
    const { code, article, paragraph } = req.body;
    
    console.log('📖 [ENDPOINT HIT] Pobieranie artykułu:', { code, article, paragraph });
    console.log('📖 [REQUEST] Headers:', req.headers);
    console.log('📖 [REQUEST] Body:', req.body);
    
    try {
        // Mapowanie kodów na pełne nazwy - WSZYSTKIE KODEKSY!
        const codeNames = {
            // Podstawowe
            'KC': 'Kodeks cywilny',
            'KPC': 'Kodeks postępowania cywilnego',
            'KK': 'Kodeks karny',
            'KPK': 'Kodeks postępowania karnego',
            'KP': 'Kodeks pracy',
            // Karne specjalne
            'KKW': 'Kodeks karny wykonawczy',
            'KKS': 'Kodeks karny skarbowy',
            'KW': 'Kodeks wykroczeń',
            'KPW': 'Kodeks postępowania w sprawach o wykroczenia',
            // Rodzinne i gospodarcze
            'KRO': 'Kodeks rodzinny i opiekuńczy',
            'KSH': 'Kodeks spółek handlowych',
            // Administracyjne
            'KPA': 'Kodeks postępowania administracyjnego',
            'PPSA': 'Prawo o postępowaniu przed sądami administracyjnymi',
            // Specjalne
            'KW_WYBORCZY': 'Kodeks wyborczy',
            'KM': 'Kodeks morski',
            'PRD': 'Prawo o ruchu drogowym'
        };
        
        const codeName = codeNames[code] || code;
        
        // KRYTYCZNA POPRAWKA: Usuń ^ z article przed wyszukiwaniem
        const cleanArticle = article.toString().replace(/\^.*$/, '');
        console.log('🔍 [SQL] Szukam artykułu:', article, '→ Oczyszczony:', cleanArticle);
        
        // Szukaj w bazie legal_acts
        db.get(
            `SELECT * FROM legal_acts 
             WHERE title LIKE ? 
             AND content LIKE ?
             ORDER BY date DESC LIMIT 1`,
            [`%${codeName}%`, `%Art. ${cleanArticle}%`],
            async (err, row) => {
                if (err) {
                    console.error('❌ Błąd bazy:', err);
                    return res.status(500).json({ error: 'Błąd bazy danych' });
                }
                
                if (row) {
                    // Znaleziono w bazie
                    console.log('📖 [BACKEND] Znaleziono akt w bazie');
                    console.log('📖 [BACKEND] Content length:', row.content?.length);
                    console.log('📖 [BACKEND] Content preview:', row.content?.substring(0, 200));
                    
                    const articleText = extractArticleText(row.content, article, paragraph);
                    console.log('📖 [BACKEND] Extracted text:', articleText?.substring(0, 200));
                    console.log('✅ Znaleziono artykuł w bazie:', { article, hasText: !!articleText, textLength: articleText?.length });
                    
                    if (articleText) {
                        // Sprawdź czy szukaliśmy paragrafu ale go nie znaleziono
                        const requestedParagraph = paragraph;
                        const foundParagraph = articleText.includes(`§ ${paragraph}`);
                        
                        res.json({
                            answer: articleText,
                            source: 'database',
                            title: row.title,
                            date: row.date,
                            url: row.url,
                            warning: (requestedParagraph && !foundParagraph) ? 
                                `⚠️ Paragraf § ${paragraph} nie jest szczegółowo dostępny w cache. Pokazano cały Art. ${article}.` : 
                                null
                        });
                    } else {
                        // Znaleziono akt ale nie artykuł - zwróć fallback
                        res.json({
                            answer: null,
                            source: 'none',
                            url: row.url,
                            note: 'Artykuł nie znaleziony w cache. Dostępny w oficjalnym źródle ISAP.'
                        });
                    }
                } else {
                    // ⚠️ BRAK W BAZIE - Spróbuj pobrać przez API/scraping
                    console.log('⚠️ Artykuł nie znaleziony w bazie:', { code, article });
                    console.log('🔄 Próbuję pobrać przez hybrydowy system API...');
                    
                    try {
                        const apiResult = await legalAPIClient.getArticle(code, article);
                        
                        if (apiResult && apiResult.text) {
                            console.log('✅ Pobrano przez hybrydowy system!');
                            
                            // Zapisz do bazy na przyszłość
                            const fullCodeName = codeNames[code] || code;
                            db.run(`
                                INSERT OR REPLACE INTO legal_acts 
                                (title, date, url, content, source, created_at)
                                VALUES (?, ?, ?, ?, ?, datetime('now'))
                            `, [
                                `Ustawa - ${fullCodeName}`,
                                new Date().toISOString().split('T')[0],
                                apiResult.url,
                                apiResult.text,
                                apiResult.source
                            ], (err) => {
                                if (err) {
                                    console.error('⚠️ Nie udało się zapisać do cache:', err);
                                } else {
                                    console.log('💾 Zapisano do cache');
                                }
                            });
                            
                            // Wyciągnij konkretny paragraf jeśli trzeba
                            const finalText = extractArticleText(apiResult.text, article, paragraph);
                            
                            res.json({
                                answer: finalText || apiResult.text,
                                source: apiResult.source,
                                url: apiResult.url,
                                note: '🔥 Automatycznie pobrano i zapisano do cache!',
                                validated: apiResult.validated
                            });
                        } else {
                            // Fallback do linku
                            console.log('⚠️ Nie udało się pobrać, zwracam link');
                            res.json({
                                answer: null,
                                source: 'none',
                                url: apiResult.url,
                                note: 'Artykuł dostępny w oficjalnym źródle ISAP.'
                            });
                        }
                    } catch (apiError) {
                        console.error('❌ Błąd hybrydowego systemu:', apiError);
                        
                        // Ostateczny fallback
                        const isapLinks = {
                            'KC': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640160093',
                            'KPC': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640430296',
                            'KK': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970880553',
                            'KPK': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970890555',
                            'KP': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19740240141',
                            'KKW': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970900557',
                            'KKS': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19991831158',
                            'KW': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19710120114',
                            'KRO': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640090059',
                            'KSH': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu20000941037',
                            'KPA': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19600300168'
                        };
                        
                        res.json({
                            answer: null,
                            source: 'none',
                            url: isapLinks[code] || 'https://isap.sejm.gov.pl',
                            note: 'Artykuł dostępny w oficjalnym źródle ISAP.'
                        });
                    }
                }
            }
        );
        
    } catch (error) {
        console.error('❌ Błąd pobierania artykułu:', error);
        res.status(500).json({ error: error.message });
    }
});

// 🔄 RĘCZNE WYMUSZENIE AKTUALIZACJI BAZY PRZEPISÓW
router.post('/force-legal-update', verifyToken, async (req, res) => {
    try {
        console.log('🔄 Ręczne wymuszenie aktualizacji przepisów...');
        const legalScraper = require('../utils/legal-scraper');
        const count = await legalScraper.autoUpdate();
        res.json({ 
            success: true, 
            message: `Zaktualizowano ${count} aktów prawnych`,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Błąd aktualizacji:', error);
        res.status(500).json({ error: error.message });
    }
});

// Funkcja pomocnicza do wyciągania tekstu artykułu
function extractArticleText(fullText, articleNumber, paragraph) {
    if (!fullText) {
        console.log('❌ [extractArticleText] Brak fullText');
        return null;
    }
    
    console.log(`🔍 [extractArticleText] Szukam Art. ${articleNumber} w tekście (${fullText.length} znaków)`);
    
    // Bardziej elastyczny regex - dopasowanie "Art. X" lub "art. X"
    const patterns = [
        // Wzorzec 1: "Art. 400 -" (z myślnikiem)
        new RegExp(`Art\\.?\\s*${articleNumber}\\s*-[\\s\\S]{0,1500}?(?=Art\\.?\\s*\\d|$)`, 'i'),
        // Wzorzec 2: "Art. 400 §" (z paragrafem)
        new RegExp(`Art\\.?\\s*${articleNumber}\\s*§[\\s\\S]{0,1500}?(?=Art\\.?\\s*\\d|$)`, 'i'),
        // Wzorzec 3: Ogólny "Art. 400" (dowolny separator)
        new RegExp(`Art\\.?\\s*${articleNumber}\\b[\\s\\S]{0,1500}?(?=Art\\.?\\s*\\d|$)`, 'i')
    ];
    
    for (let i = 0; i < patterns.length; i++) {
        const match = fullText.match(patterns[i]);
        if (match) {
            console.log(`✅ [extractArticleText] Znaleziono używając wzorca ${i + 1}`);
            let text = match[0].trim();
            
            // Jeśli szukamy konkretnego paragrafu
            if (paragraph) {
                const paraRegex = new RegExp(`§\\s*${paragraph}\\b[\\s\\S]{0,500}?(?=§\\s*\\d|Art\\.|$)`, 'i');
                const paraMatch = text.match(paraRegex);
                if (paraMatch) {
                    text = paraMatch[0].trim();
                }
            }
            
            return text;
        }
    }
    
    console.log(`⚠️ [extractArticleText] Nie znaleziono Art. ${articleNumber} używając żadnego wzorca`);
    return null;
}

// ==========================================
// GEMINI AI ENDPOINTS
// Google Generative AI jako alternatywa dla Claude
// ==========================================

const geminiService = require('../services/ai/gemini-service');

// Analizuj dokument sprawy z Gemini
router.post('/gemini/analyze-document', verifyToken, async (req, res) => {
    try {
        const { documentText, caseType } = req.body;
        const userRole = req.user.role;

        if (!['lawyer', 'admin'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }

        if (!geminiService.isConfigured()) {
            return res.status(503).json({ 
                error: 'Gemini AI nie jest skonfigurowane',
                message: 'Ustaw GEMINI_API_KEY w zmiennych środowiskowych'
            });
        }

        const result = await geminiService.analyzeDocument(documentText, caseType);
        res.json(result);

    } catch (error) {
        console.error('Gemini analyze error:', error);
        res.status(500).json({ error: 'Błąd analizy Gemini: ' + error.message });
    }
});

// Zadaj pytanie z Gemini + PEŁNY KONTEKST (dokumenty + komentarze + wydarzenia + zeznania + dowody)
router.post('/gemini/ask', verifyToken, async (req, res) => {
    try {
        const { question, context, caseId } = req.body;
        const userRole = req.user.role;

        console.log('🤖 /gemini/ask - caseId:', caseId, 'hasContext:', !!context);

        if (!['lawyer', 'admin'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }

        if (!geminiService.isConfigured()) {
            return res.status(503).json({ 
                error: 'Gemini AI nie jest skonfigurowane'
            });
        }

        // 📚 POBIERZ PEŁNY KONTEKST SPRAWY (wszystko!)
        let fullCaseContext = '';
        if (caseId) {
            console.log('📚 Pobieram PEŁNY kontekst sprawy:', caseId);
            const fullContextService = require('../services/full-case-context');
            const caseData = await fullContextService.getFullCaseContext(caseId);
            fullCaseContext = fullContextService.formatFullContextForAI(caseData);
        }

        // Rozszerz context o pełny kontekst sprawy
        const finalContext = (context || '') + fullCaseContext;

        const result = await geminiService.askQuestion(question, finalContext);
        
        // 🧠 Zapisz odpowiedź do pamięci kontekstu jeśli dotyczy analizy sprawy
        if (caseId && result.answer) {
            const questionLower = question.toLowerCase();
            
            if (questionLower.includes('przeanalizuj') || questionLower.includes('analiz')) {
                geminiService.saveCaseAnalysis(caseId, 'analysis', result.answer);
            } else if (questionLower.includes('ryzyk') || questionLower.includes('słabe punkty')) {
                geminiService.saveCaseAnalysis(caseId, 'risks', result.answer);
            } else if (questionLower.includes('strategi') || questionLower.includes('następne kroki')) {
                geminiService.saveCaseAnalysis(caseId, 'strategy', result.answer);
            }
        }
        
        res.json(result);

    } catch (error) {
        console.error('Gemini ask error:', error);
        res.json({ error: 'Błąd Gemini: ' + error.message });
    }
});

// Generuj podsumowanie sprawy z Gemini
router.post('/gemini/summary', verifyToken, async (req, res) => {
    try {
        const { caseData } = req.body;
        const userRole = req.user.role;

        if (!['lawyer', 'admin'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }

        if (!geminiService.isConfigured()) {
            return res.status(503).json({ 
                error: 'Gemini AI nie jest skonfigurowane'
            });
        }

        const result = await geminiService.generateCaseSummary(caseData);
        res.json(result);

    } catch (error) {
        console.error('Gemini summary error:', error);
        res.status(500).json({ error: 'Błąd Gemini: ' + error.message });
    }
});

// Sugeruj precedensy z Gemini
router.post('/gemini/precedents', verifyToken, async (req, res) => {
    try {
        const { caseDescription } = req.body;
        const userRole = req.user.role;

        if (!['lawyer', 'admin'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }

        if (!geminiService.isConfigured()) {
            return res.status(503).json({ 
                error: 'Gemini AI nie jest skonfigurowane'
            });
        }

        const result = await geminiService.suggestPrecedents(caseDescription);
        res.json(result);

    } catch (error) {
        console.error('Gemini precedents error:', error);
        res.status(500).json({ error: 'Błąd Gemini: ' + error.message });
    }
});

// Generuj dokument prawny z Gemini
router.post('/gemini/generate-document', verifyToken, async (req, res) => {
    try {
        const { caseId, documentType, additionalInfo, style, detail, autoFill } = req.body;
        const userRole = req.user.role;

        if (!['lawyer', 'admin'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień' });
        }

        if (!geminiService.isConfigured()) {
            return res.status(503).json({ 
                error: 'Gemini AI nie jest skonfigurowane'
            });
        }

        // Pobierz dane sprawy
        const dbInstance = getDatabase();
        const caseData = await new Promise((resolve, reject) => {
            dbInstance.get('SELECT * FROM cases WHERE id = ?', [caseId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!caseData) {
            return res.status(404).json({ error: 'Nie znaleziono sprawy' });
        }

        // Przygotuj opcje dla generatora
        const options = {
            additionalInfo,
            style: style || 'formal',
            detail: detail || 'normal',
            autoFill: autoFill || {},
            caseId: caseId  // 🧠 Przekaż caseId dla pamięci kontekstu
        };

        const result = await geminiService.generateDocument(caseData, documentType, options);
        res.json(result);

    } catch (error) {
        console.error('Gemini generate document error:', error);
        res.status(500).json({ error: 'Błąd Gemini: ' + error.message });
    }
});

// 📋 LIST MODELI - Pokaż dostępne modele Gemini (REST API)
router.get('/list-gemini-models', verifyToken, async (req, res) => {
    console.log('📋 [LIST] /api/ai/list-gemini-models - Listowanie modeli');
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (!apiKey) {
            return res.status(503).json({ 
                error: 'Brak klucza API',
                message: 'GEMINI_API_KEY nie jest ustawiony'
            });
        }

        console.log('📋 Pobieranie listy modeli przez REST API...');
        
        // Bezpośrednie wywołanie REST API Google
        const fetch = require('node-fetch');
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('📋 API Error:', response.status, errorText);
            throw new Error(`API Error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📋 Znaleziono modeli:', data.models?.length || 0);
        
        // Wyciągnij tylko nazwy i podstawowe info
        const modelList = (data.models || []).map(m => ({
            name: m.name.replace('models/', ''),
            displayName: m.displayName || m.name,
            supportedMethods: m.supportedGenerationMethods || []
        }));

        res.json({
            success: true,
            count: modelList.length,
            models: modelList
        });

    } catch (error) {
        console.error('📋 LIST ERROR:', error);
        res.status(500).json({ 
            error: 'Błąd listowania modeli',
            message: error.message 
        });
    }
});

// 🧪 TEST GEMINI - Prosty test bez dodatków
router.post('/test-gemini', verifyToken, async (req, res) => {
    console.log('🧪 [TEST] /api/ai/test-gemini - Prosty test Gemini');
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Brak pytania' });
        }

        console.log('🧪 Pytanie:', query);
        
        // Sprawdź czy Gemini jest skonfigurowany
        if (!geminiService.isConfigured()) {
            return res.status(503).json({ 
                error: 'Gemini nie jest skonfigurowane',
                message: 'Sprawdź GEMINI_API_KEY w .env'
            });
        }

        // PROSTY prompt bez kontekstu prawnego
        const simplePrompt = `Odpowiedz krótko (max 3 zdania) po polsku na pytanie: ${query}`;
        
        console.log('🧪 Wywołuję Gemini z prostym promptem...');
        
        // Wywołaj askQuestion zamiast legalSearch (prostsza funkcja)
        const result = await geminiService.askQuestion(simplePrompt);
        
        console.log('🧪 Odpowiedź otrzymana:', result.success);
        
        if (!result.success) {
            console.error('🧪 BŁĄD:', result.error);
            return res.status(500).json({ 
                error: result.error,
                details: result.details || 'Brak szczegółów'
            });
        }

        res.json({
            success: true,
            answer: result.answer,
            test: true
        });

    } catch (error) {
        console.error('🧪 TEST ERROR:', error);
        res.status(500).json({ 
            error: 'Test error',
            message: error.message 
        });
    }
});

// 🔍 GEMINI LEGAL SEARCH - Wyszukiwanie prawne z przepisami z bazy
router.post('/gemini/legal-search', verifyToken, async (req, res) => {
    console.log('🎯 [ENDPOINT HIT] /api/ai/gemini/legal-search - Request received!');
    try {
        const { query, type = 'legal', includeCaseContext, searchJurisprudence, caseContext, caseId } = req.body;
        const userRole = req.user.role;

        if (!['lawyer', 'admin'].includes(userRole)) {
            return res.status(403).json({ error: 'Brak uprawnień do AI' });
        }

        if (!geminiService.isConfigured()) {
            return res.status(503).json({ 
                error: 'Gemini AI nie jest skonfigurowane',
                message: 'Ustaw GEMINI_API_KEY w zmiennych środowiskowych'
            });
        }

        console.log('🤖 Gemini Legal Search:', { 
            type, 
            query: query.substring(0, 100),
            includeCaseContext,
            searchJurisprudence,
            hasCaseContext: !!caseContext
        });

        // 📚 POBIERZ AKTUALNE PRZEPISY PRAWNE Z BAZY
        const relevantLaws = await legalScraper.searchRelevantLaws(query, 3);
        const lawsContext = legalScraper.formatLawsForPrompt(relevantLaws);

        if (lawsContext) {
            console.log(`📚 Dodano ${relevantLaws.length} aktualnych przepisów do kontekstu`);
        }

        // Ogranicz kontekst przepisów do 2000 znaków (safety limit)
        let safeLawsContext = lawsContext;
        if (lawsContext && lawsContext.length > 2000) {
            safeLawsContext = lawsContext.substring(0, 2000) + '\n\n[...kontekst skrócony dla bezpieczeństwa...]';
            console.log('⚠️ Kontekst przepisów skrócony z', lawsContext.length, 'do 2000 znaków');
        }

        // 📄 PARSUJ DOKUMENTY SPRAWY (PDF/DOCX)
        let documentsContext = null;
        let documentsMetadata = { count: 0, successCount: 0, totalChars: 0 };
        
        if (includeCaseContext && caseId) {
            try {
                console.log(`📄 Pobieranie dokumentów sprawy ID: ${caseId}...`);
                
                // Pobierz dokumenty z bazy
                const documents = await new Promise((resolve, reject) => {
                    db.all(
                        `SELECT id, case_id, title, filename, 
                                filepath, category, uploaded_at
                         FROM documents 
                         WHERE case_id = ?
                         ORDER BY uploaded_at DESC
                         LIMIT 5`,
                        [caseId],
                        (err, rows) => {
                            if (err) reject(err);
                            else resolve(rows || []);
                        }
                    );
                });
                
                if (documents.length > 0) {
                    console.log(`📄 Znaleziono ${documents.length} dokumentów w sprawie`);
                    
                    // Ścieżka do uploads
                    const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
                    
                    // Parsuj dokumenty (max 3000 znaków z każdego)
                    const extracted = await documentParser.extractCaseDocuments(
                        documents, 
                        uploadsDir, 
                        3000  // Max znaków z 1 dokumentu
                    );
                    
                    if (extracted.successCount > 0) {
                        // Formatuj do promptu
                        documentsContext = documentParser.formatDocumentsForPrompt(extracted);
                        
                        documentsMetadata = {
                            count: documents.length,
                            successCount: extracted.successCount,
                            totalChars: extracted.totalChars
                        };
                        
                        console.log(`✅ Wyekstrahowano ${extracted.successCount}/${documents.length} dokumentów (${extracted.totalChars} znaków)`);
                    } else {
                        console.log('⚠️ Nie udało się wyekstrahować tekstu z żadnego dokumentu');
                    }
                } else {
                    console.log('📄 Brak dokumentów w sprawie');
                }
            } catch (error) {
                console.error('❌ Błąd parsowania dokumentów:', error.message);
                // Kontynuuj bez dokumentów - nie przerywaj requestu
            }
        }

        // Wywołaj Gemini Legal Search z pełnym kontekstem (PRZEPISY + DOKUMENTY!)
        const result = await geminiService.legalSearch(query, type, {
            caseContext: includeCaseContext && caseContext ? caseContext : null,
            searchJurisprudence: searchJurisprudence,
            lawsContext: safeLawsContext,
            documentsContext: documentsContext  // 🆕 DOKUMENTY PDF/DOCX!
        });

        if (!result.success) {
            console.error('❌ Gemini zwrócił błąd:', result.error);
            console.error('❌ Szczegóły:', result.details || 'Brak szczegółów');
            return res.status(500).json({ 
                error: result.error,
                message: 'Gemini AI zwrócił błąd',
                details: result.details || result.error
            });
        }

        console.log(`✅ Gemini Legal Search completed: ${result.sources?.length || 0} sources found`);

        res.json({
            success: true,
            answer: result.answer,
            sources: result.sources || [],
            context: {
                usedCaseContext: !!caseContext && includeCaseContext,
                usedLawsContext: !!lawsContext,
                searchedJurisprudence: searchJurisprudence,
                lawsCount: relevantLaws.length,
                // 🆕 Informacja o dokumentach
                usedDocuments: documentsMetadata.successCount > 0,
                documentsCount: documentsMetadata.count,
                documentsSuccessCount: documentsMetadata.successCount,
                documentsTotalChars: documentsMetadata.totalChars
            }
        });

    } catch (error) {
        console.error('❌ Gemini Legal Search error:', error);
        res.status(500).json({ 
            error: 'Błąd wyszukiwania AI',
            message: error.message 
        });
    }
});

// Sprawdź status konfiguracji AI
router.get('/status', verifyToken, async (req, res) => {
    try {
        const geminiStatus = geminiService.isConfigured();
        const claudeStatus = !!anthropic && !!process.env.ANTHROPIC_API_KEY;

        res.json({
            gemini: {
                configured: geminiStatus,
                available: geminiStatus,
                model: 'gemini-pro',
                free: true
            },
            claude: {
                configured: false,
                available: false,
                model: 'claude-3-haiku-20240307',
                disabled: true,
                reason: 'Wyłączony - wymaga płatnego klucza API'
            },
            recommendation: geminiStatus ? 'gemini' : 'none',
            activeProvider: 'gemini'
        });

    } catch (error) {
        console.error('AI status error:', error);
        res.status(500).json({ error: 'Błąd sprawdzania statusu AI' });
    }
});

module.exports = router;
