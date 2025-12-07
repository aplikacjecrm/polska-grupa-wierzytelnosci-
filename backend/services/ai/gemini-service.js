// ==========================================
// GEMINI AI SERVICE
// Google Generative AI - Asystent dla Spraw Prawnych
// Version: 3.0.0 - Updated: 2025-12-02 21:36 - Model: gemini-1.5-flash
// ==========================================

const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('🔄 [RELOAD] Loading gemini-service.js v3.0.0 - Model: gemini-1.5-flash');

// WAŻNE: Ustaw swój klucz API w zmiennej środowiskowej
// Pobierz darmowy klucz: https://makersuite.google.com/app/apikey
const API_KEY = process.env.GEMINI_API_KEY || '';
const PROJECT_ID = 'gen-lang-client-0343931291'; // Twój Project ID z Google Cloud

let genAI = null;
let model = null;

// 🧠 PAMIĘĆ KONTEKSTU - mapuje caseId -> historia analiz
const caseContextMemory = new Map();

/**
 * Zapisz analizę do pamięci kontekstu sprawy
 */
function saveCaseAnalysis(caseId, type, content) {
    if (!caseId) return;
    
    if (!caseContextMemory.has(caseId)) {
        caseContextMemory.set(caseId, {
            analysis: '',
            risks: '',
            strategy: '',
            timestamp: Date.now()
        });
    }
    
    const memory = caseContextMemory.get(caseId);
    memory[type] = content;
    memory.timestamp = Date.now();
    
    console.log(`🧠 Zapisano ${type} dla sprawy ${caseId} (${content.length} znaków)`);
}

/**
 * Wyczyść starą pamięć (starszą niż 1 godzina)
 */
function cleanOldMemory() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    for (const [caseId, memory] of caseContextMemory.entries()) {
        if (memory.timestamp < oneHourAgo) {
            caseContextMemory.delete(caseId);
            console.log(`🧹 Usunięto starą pamięć dla sprawy ${caseId}`);
        }
    }
}

// Czyszczenie pamięci co 30 minut
setInterval(cleanOldMemory, 30 * 60 * 1000);

// Inicjalizacja
if (API_KEY) {
    try {
        // Konfiguracja dla płatnych kont Google Cloud
        const config = {
            apiKey: API_KEY,
            project: PROJECT_ID
        };
        
        // Dodaj debug log
        console.log('🔑 GEMINI_API_KEY:', API_KEY.substring(0, 20) + '...');
        console.log('📁 PROJECT_ID:', PROJECT_ID);
        
        console.log('🔧 [INIT] Creating GoogleGenerativeAI instance...');
        genAI = new GoogleGenerativeAI(API_KEY);
        console.log('🔧 [INIT] GoogleGenerativeAI created successfully');
        
        // Używamy gemini-2.5-flash - najnowszy, szybki model (zweryfikowany jako dostępny)
        const MODEL_NAME = "gemini-2.5-flash";
        console.log('🔧 [INIT] Attempting to load model:', MODEL_NAME, '(verified available)');
        
        // WŁĄCZ GOOGLE SEARCH GROUNDING (dostęp do internetu!)
        model = genAI.getGenerativeModel({ 
            model: MODEL_NAME,
            tools: [{ googleSearch: {} }]  // 🌐 Włącza wyszukiwanie Google!
        });
        console.log('✅ Gemini AI: Initialized (' + MODEL_NAME + ') - TIMESTAMP: ' + Date.now());
    } catch (error) {
        console.error('❌ Gemini AI initialization error:', error.message);
        console.error('Sprawdź czy klucz API jest prawidłowy i API jest włączone w Google Cloud Console');
    }
} else {
    console.warn('⚠️  Gemini AI: API Key not set. Set GEMINI_API_KEY environment variable.');
}

/**
 * Analizuj dokument sprawy
 */
async function analyzeDocument(documentText, caseType = 'civil') {
    if (!model) {
        return {
            success: false,
            error: 'Gemini AI nie jest skonfigurowane. Ustaw GEMINI_API_KEY.'
        };
    }

    try {
        const prompt = `
Jesteś asystentem prawnym w polskiej kancelarii. Przeanalizuj poniższy dokument sprawy ${caseType === 'criminal' ? 'karnej' : 'cywilnej'}.

DOKUMENT:
${documentText}

Wykonaj następującą analizę:
1. PODSUMOWANIE (2-3 zdania)
2. KLUCZOWE INFORMACJE (strony, daty, kwoty, terminy)
3. GŁÓWNE ZARZUTY/ROSZCZENIA (lista punktowana)
4. ZALECANE DZIAŁANIA (co należy zrobić jako następne kroki)
5. POTENCJALNE RYZYKA (co może pójść nie tak)

Odpowiedz po polsku w formacie JSON:
{
  "summary": "...",
  "keyInfo": ["...", "..."],
  "claims": ["...", "..."],
  "recommendations": ["...", "..."],
  "risks": ["...", "..."]
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Spróbuj sparsować JSON
        let analysis;
        try {
            // Wyciągnij JSON z odpowiedzi (może być otoczony markdown blokiem)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                analysis = JSON.parse(jsonMatch[0]);
            } else {
                // Jeśli nie ma JSON, zwróć surowy tekst
                analysis = { rawText: text };
            }
        } catch (parseError) {
            analysis = { rawText: text };
        }

        return {
            success: true,
            analysis: analysis,
            rawResponse: text
        };

    } catch (error) {
        console.error('❌ Gemini AI Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Zadaj pytanie o dokument/sprawę
 */
async function askQuestion(question, context = '') {
    if (!model) {
        return {
            success: false,
            error: 'Gemini AI nie jest skonfigurowane. Ustaw GEMINI_API_KEY.'
        };
    }

    try {
        const prompt = `
Jesteś asystentem prawnym w polskiej kancelarii.

${context ? `KONTEKST SPRAWY:\n${context}\n\n` : ''}

PYTANIE UŻYTKOWNIKA:
${question}

Odpowiedz zwięźle i konkretnie po polsku, jako prawnik. Jeśli to możliwe, podaj podstawę prawną (artykuły kodeksu).
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = response.text();

        return {
            success: true,
            answer: answer
        };

    } catch (error) {
        console.error('❌ Gemini AI Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Generuj podsumowanie sprawy
 */
async function generateCaseSummary(caseData) {
    if (!model) {
        return {
            success: false,
            error: 'Gemini AI nie jest skonfigurowane. Ustaw GEMINI_API_KEY.'
        };
    }

    try {
        const prompt = `
Jesteś asystentem prawnym. Wygeneruj zwięzłe podsumowanie sprawy na podstawie danych:

DANE SPRAWY:
${JSON.stringify(caseData, null, 2)}

Wygeneruj:
1. Krótkie podsumowanie (1 akapit)
2. Status sprawy (aktywna/zamknięta/zawieszona)
3. Kluczowe daty i terminy
4. Następne zalecane kroki

Odpowiedz po polsku w czytelnym formacie.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const summary = response.text();

        return {
            success: true,
            summary: summary
        };

    } catch (error) {
        console.error('❌ Gemini AI Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Sugeruj precedensy prawne
 */
async function suggestPrecedents(caseDescription) {
    if (!model) {
        return {
            success: false,
            error: 'Gemini AI nie jest skonfigurowane. Ustaw GEMINI_API_KEY.'
        };
    }

    try {
        const prompt = `
Jesteś ekspertem prawa polskiego. Na podstawie opisu sprawy, zasugeruj podobne precedensy i orzecznictwo.

OPIS SPRAWY:
${caseDescription}

Podaj:
1. Podobne sprawy (jeśli znasz)
2. Relevantne artykuły kodeksów (karnego/cywilnego)
3. Kierunek argumentacji prawnej
4. Potencjalne strategie obrony/oskarżenia

Odpowiedz po polsku.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const suggestions = response.text();

        return {
            success: true,
            suggestions: suggestions
        };

    } catch (error) {
        console.error('❌ Gemini AI Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Generuj dokument prawny (pozew, wniosek, pismo procesowe) - ROZBUDOWANA WERSJA
 */
async function generateDocument(caseData, documentType, options = {}) {
    if (!model) {
        return {
            success: false,
            error: 'Gemini AI nie jest skonfigurowane. Ustaw GEMINI_API_KEY.'
        };
    }

    try {
        const {
            additionalInfo = '',
            style = 'formal',  // formal, simplified, draft
            detail = 'normal',  // short, normal, detailed
            autoFill = {},      // { parties, court, evidence, witnesses, events }
            caseId = null       // ID sprawy dla pamięci kontekstu
        } = options;
        
        // 🧠 Pobierz wcześniejsze analizy z pamięci
        let previousAnalysis = '';
        if (caseId && caseContextMemory.has(caseId)) {
            const memory = caseContextMemory.get(caseId);
            previousAnalysis = `\n\n🧠 WCZEŚNIEJSZE ANALIZY AI (użyj tych informacji!):\n\n`;
            previousAnalysis += `ANALIZA SPRAWY:\n${memory.analysis || 'Brak'}\n\n`;
            previousAnalysis += `ZIDENTYFIKOWANE RYZYKA:\n${memory.risks || 'Brak'}\n\n`;
            previousAnalysis += `STRATEGIA PROCESOWA:\n${memory.strategy || 'Brak'}\n\n`;
            console.log(`🧠 Używam pamięci kontekstu dla sprawy ${caseId}`);
        }

        // Określ styl dokumentu
        let styleGuide = '';
        if (style === 'formal') {
            styleGuide = 'Używaj formalnego, profesjonalnego języka prawniczego. Dokument dla sądu lub urzędu.';
        } else if (style === 'simplified') {
            styleGuide = 'Używaj uproszczonego, zrozumiałego języka. Dokument dla klienta lub użytku wewnętrznego.';
        } else {
            styleGuide = 'Utwórz roboczą notatkę/szkic. Może być w punktach, bez pełnej formalności.';
        }

        // Określ długość/szczegółowość
        let detailGuide = '';
        if (detail === 'short') {
            detailGuide = 'Dokument powinien być KRÓTKI (max 1 strona A4, ~300 słów). Skondensuj informacje.';
        } else if (detail === 'detailed') {
            detailGuide = 'Dokument powinien być SZCZEGÓŁOWY (5+ stron). Rozwiń wszystkie argumenty, dodaj obszerną argumentację prawną.';
        } else {
            detailGuide = 'Dokument powinien mieć NORMALNĄ długość (2-3 strony A4, ~800 słów).';
        }

        // Buduj kontekst z full-case-context
        let fullContext = '';
        if (caseData.id) {
            const fullContextService = require('../full-case-context');
            const fullCaseData = await fullContextService.getFullCaseContext(caseData.id);
            
            // Wydobądź dane z opisu (często tam są szczegóły!)
            let extractedParties = {};
            if (caseData.description) {
                const desc = caseData.description;
                // Szukaj nazw firm, kwot, dat
                const firmMatch = desc.match(/(?:Pozwany|Dłużnik|firma)\s*[:\-]?\s*([A-ZÀ-Ż][a-zà-ż\s]+(?:Sp\.|GmbH|Ltd|Inc)?[^\n,.]{5,50})/i);
                if (firmMatch) extractedParties.defendant = firmMatch[1].trim();
                
                const amountMatch = desc.match(/(\d+[\s,.]?\d*[\s,.]?\d*)\s*(EUR|PLN|USD)/i);
                if (amountMatch) extractedParties.amount = `${amountMatch[1]} ${amountMatch[2]}`;
                
                const plaintiffMatch = desc.match(/(?:Powód|Wierzyciel|Polska Grupa Wierzytelności|PGW)[^\n]*?([A-ZÀ-Ż][a-zà-ż\s]+Sp\.\s*z\s*o\.o\.)/i);
                if (plaintiffMatch) extractedParties.plaintiff = plaintiffMatch[1].trim();
            }
            
            // Dodaj tylko te sekcje, które użytkownik zaznaczył
            if (autoFill.parties && caseData) {
                fullContext += `\n\n═══ DANE SPRAWY ═══\n`;
                fullContext += `Numer sprawy: ${caseData.case_number || '[DO UZUPEŁNIENIA]'}\n`;
                fullContext += `Tytuł: ${caseData.title || '[DO UZUPEŁNIENIA]'}\n`;
                fullContext += `Typ: ${caseData.case_type === 'civil' ? 'Cywilna' : 'Karna'}\n`;
                
                // Użyj wydobytych danych
                if (extractedParties.plaintiff) {
                    fullContext += `\nPOWÓD: ${extractedParties.plaintiff}\n`;
                }
                if (extractedParties.defendant) {
                    fullContext += `POZWANY: ${extractedParties.defendant}\n`;
                }
                if (extractedParties.amount) {
                    fullContext += `WARTOŚĆ PRZEDMIOTU SPORU: ${extractedParties.amount}\n`;
                }
                
                if (caseData.description) {
                    // Usuń HTML tags i wyciągnij czysty tekst
                    const cleanDesc = caseData.description
                        .replace(/<[^>]*>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
                    fullContext += `\nOPIS STANU FAKTYCZNEGO:\n${cleanDesc.substring(0, 2000)}\n`;
                }
            }
            
            if (autoFill.court && caseData.court_name) {
                fullContext += `\n\nSĄD:\n`;
                fullContext += `Nazwa: ${caseData.court_name}\n`;
                if (caseData.court_signature) {
                    fullContext += `Sygnatura: ${caseData.court_signature}\n`;
                }
            }
            
            if (autoFill.evidence && fullCaseData.evidence?.length > 0) {
                fullContext += `\n\n📎 DOWODY W SPRAWIE (${fullCaseData.evidence.length}):\n`;
                fullCaseData.evidence.slice(0, 10).forEach((ev, i) => {
                    fullContext += `${i+1}. ${ev.title} [${ev.evidence_type}]\n`;
                    if (ev.description) {
                        fullContext += `   Opis: ${ev.description}\n`;
                    }
                    if (ev.notes) {
                        // SZCZEGÓŁOWE NOTATKI O DOWODZIE
                        fullContext += `   📝 Szczegóły: ${ev.notes}\n`;
                    }
                    if (ev.source) {
                        fullContext += `   Źródło: ${ev.source}\n`;
                    }
                    if (ev.relevance) {
                        fullContext += `   Istotność: ${ev.relevance}\n`;
                    }
                    fullContext += '\n';
                });
            }
            
            if (autoFill.witnesses && fullCaseData.witnesses?.length > 0) {
                fullContext += `\n\n👥 ŚWIADKOWIE (${fullCaseData.witnesses.length}):\n`;
                fullCaseData.witnesses.forEach((w, i) => {
                    fullContext += `${i+1}. ${w.name} - ${w.role}\n`;
                    if (w.contact_info) {
                        fullContext += `   Kontakt: ${w.contact_info}\n`;
                    }
                    if (w.notes) {
                        // PEŁNY OPIS ŚWIADKA - kluczowe informacje!
                        fullContext += `   📝 SZCZEGÓŁOWY OPIS:\n   ${w.notes}\n`;
                    }
                    if (w.testimony) {
                        fullContext += `   💬 Zeznanie: ${w.testimony.substring(0, 500)}\n`;
                        if (w.testimony.length > 500) fullContext += '   [...]\n';
                    }
                    if (w.credibility_rating) {
                        fullContext += `   ⭐ Wiarygodność: ${w.credibility_rating}/10\n`;
                    }
                    fullContext += '\n';
                });
            }
            
            if (autoFill.events && fullCaseData.events?.length > 0) {
                fullContext += `\n\nWYDARZENIA/TERMINY (${fullCaseData.events.length}):\n`;
                fullCaseData.events.slice(0, 5).forEach((e, i) => {
                    fullContext += `${i+1}. ${e.title} - ${e.start_date}\n`;
                });
            }
            
            // ZAWSZE dodaj dokumenty (niezależnie od checkboxów - to ważne!)
            if (fullCaseData.documents?.length > 0) {
                fullContext += `\n\n📄 DOKUMENTY W SPRAWIE (${fullCaseData.documents.length}):\n`;
                fullCaseData.documents.forEach((doc, i) => {
                    fullContext += `\n${i+1}. ${doc.filename} (${doc.file_type})\n`;
                    if (doc.text && doc.text.length > 0) {
                        // Dodaj fragment tekstu z dokumentu
                        const preview = doc.text.substring(0, 500).trim();
                        fullContext += `   Treść: ${preview}${doc.text.length > 500 ? '...' : ''}\n`;
                    }
                });
            }
            
            // ZAWSZE dodaj obrazy z OCR
            if (fullCaseData.images?.length > 0) {
                fullContext += `\n\n🖼️ OBRAZY/ZDJĘCIA (${fullCaseData.images.length}):\n`;
                fullCaseData.images.forEach((img, i) => {
                    fullContext += `${i+1}. ${img.filename}\n`;
                    if (img.text && img.text.length > 0) {
                        const preview = img.text.substring(0, 300).trim();
                        fullContext += `   Rozpoznany tekst (OCR): ${preview}...\n`;
                    }
                });
            }
            
            // Dodaj komentarze (ważne kontekstowo)
            if (fullCaseData.comments?.length > 0) {
                fullContext += `\n\n💬 KOMENTARZE (${fullCaseData.comments.length}):\n`;
                fullCaseData.comments.slice(0, 3).forEach((c, i) => {
                    fullContext += `${i+1}. ${c.author_name} (${c.created_at}):\n`;
                    fullContext += `   ${c.comment_text || c.content}\n`;
                });
            }
            
            // Dodaj notatki
            if (fullCaseData.notes?.length > 0) {
                fullContext += `\n\n📝 NOTATKI (${fullCaseData.notes.length}):\n`;
                fullCaseData.notes.slice(0, 3).forEach((n, i) => {
                    fullContext += `${i+1}. [${n.note_type}] ${n.content.substring(0, 200)}\n`;
                });
            }
        }

        const prompt = `
Jesteś doświadczonym prawnikiem w polskiej kancelarii. Wygeneruj profesjonalny dokument prawny.

TYP DOKUMENTU: ${documentType}

STYL: ${styleGuide}
SZCZEGÓŁOWOŚĆ: ${detailGuide}

DANE SPRAWY:
${JSON.stringify(caseData, null, 2)}
${fullContext}
${previousAnalysis}

DODATKOWE INFORMACJE:
${additionalInfo || 'Brak dodatkowych informacji.'}

═══ INSTRUKCJE GENEROWANIA - BARDZO SZCZEGÓŁOWY DOKUMENT ═══

Wygeneruj MAKSYMALNIE SZCZEGÓŁOWY, PROFESJONALNY dokument prawny zawierający:

1. **Nagłówek z PEŁNYMI danymi stron**
   - Użyj WSZYSTKICH danych POWÓD i POZWANY z kontekstu
   - Dodaj: NIP, REGON, KRS, adresy, telefony, emaile jeśli dostępne
   - Jeśli brakuje - wyszukaj w Google (masz dostęp do internetu!)
   
2. **Oznaczenie sądu**
   - Pełna nazwa sądu z właściwym wydziałem
   - Wywnioskuj na podstawie kwoty, typu sprawy i miejsca zamieszkania
   
3. **Tytuł dokumentu** z WARTOŚCIĄ PRZEDMIOTU SPORU

4. **BARDZO SZCZEGÓŁOWE Uzasadnienie faktyczne**
   - Wykorzystaj CAŁY opis stanu faktycznego
   - Wykorzystaj WSZYSTKIE szczegółowe opisy świadków (📝 SZCZEGÓŁOWY OPIS)
   - Cytuj z notatek świadków, dowodów, komentarzy
   - Przedstaw CHRONOLOGIĘ wydarzeń z konkretnymi datami
   - Uwzględnij WSZYSTKIE kwoty, faktury, dokumenty
   - Opisz dokładnie rolę każdego świadka
   - Wykorzystaj informacje z dokumentów PDF, obrazów OCR, WhatsApp
   - Dokument ma być KOMPLETNY i SZCZEGÓŁOWY
   
5. **Bardzo szczegółowe Uzasadnienie prawne**
   - Powołaj KONKRETNE artykuły kodeksów z pełnymi cytatami
   - Uzasadnij KAŻDE roszczenie podstawą prawną
   - Odwołaj się do orzecznictwa jeśli możliwe
   
6. **Szczegółowe Petitum (wnioski)**
   - Sformułuj WSZYSTKIE wnioski z konkretnymi kwotami
   - Rozpisz odsetki od każdej faktury z dokładnymi datami
   
7. **Dowody**
   - Wymień WSZYSTKIE dowody z ich szczegółami
   - Uwzględnij dokumenty, zeznania świadków, zdjęcia
   
8. **Załączniki**
   - Pełna lista załączników

9. **Podpis i data**
   - Data: [DO UZUPEŁNIENIA]
   - Podpis pełnomocnika: [DO UZUPEŁNIENIA]

═══ WAŻNE ZASADY ═══
✅ ZAWSZE używaj konkretnych danych z kontekstu (nazwy firm, kwoty, daty)
✅ Jeśli dana jest w kontekście - NIE WPISUJ [DO UZUPEŁNIENIA]
✅ [DO UZUPEŁNIENIA] TYLKO dla: dat bieżących, podpisów
✅ Wnioskuj brakujące dane na podstawie logiki (np. właściwy sąd)
✅ Dostosuj język do stylu: ${style}
✅ Dostosuj długość do: ${detail}
✅ Powołuj się na konkretne artykuły kodeksów

🌐 DOSTĘP DO INTERNETU:
Masz dostęp do Google Search! Jeśli brakuje ważnych danych:
✅ Wyszukaj adresy firm (np. "SK Tech Sp. z o.o. KRS adres")
✅ Sprawdź NIP/REGON/KRS firm polskich (Centralna Ewidencja KRS)
✅ Znajdź właściwy sąd na podstawie adresu firmy
✅ Zweryfikuj aktualny stan prawny przepisów

NIE WPISUJ [DO UZUPEŁNIENIA] jeśli możesz znaleźć dane w Google!

Odpowiedz TYLKO treścią dokumentu, bez dodatkowych komentarzy i wyjaśnień.
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const document = response.text();

        return {
            success: true,
            draft: document
        };

    } catch (error) {
        console.error('❌ Gemini AI Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Wyszukiwanie prawne AI - z kontekstem przepisów
 */
async function legalSearch(query, type = 'legal', options = {}) {
    if (!model) {
        return {
            success: false,
            error: 'Gemini AI nie jest skonfigurowane. Ustaw GEMINI_API_KEY.'
        };
    }

    try {
        const { 
            caseContext = null, 
            searchJurisprudence = false,
            lawsContext = null,
            documentsContext = null  // 🆕 Treść dokumentów PDF/DOCX
        } = options;

        // Buduj system prompt w zależności od typu
        let systemPrompt = '';
        
        if (type === 'legal') {
            systemPrompt = `Jesteś ekspertem prawnym w polskim prawie. Twoim zadaniem jest pomóc użytkownikowi znaleźć odpowiednie przepisy prawne i artykuły.

Odpowiadaj ZAWSZE PO POLSKU i cytuj konkretne artykuły z:
- Kodeks Cywilny (KC)
- Kodeks Postępowania Cywilnego (KPC)
- Kodeks Pracy (KP)
- Kodeks Karny (KK)
- Kodeks Postępowania Karnego (KPK)
- Kodeks Karny Wykonawczy (KKW)
- Kodeks Karny Skarbowy (KKS)
- Kodeks Wykroczeń (KW)
- Kodeks Rodzinny i Opiekuńczy (KRO)
- Kodeks Spółek Handlowych (KSH)
- Kodeks Postępowania Administracyjnego (KPA)
- Inne ustawy jeśli potrzeba

Format odpowiedzi:
1. 📋 Krótkie podsumowanie sytuacji prawnej
2. ⚖️ Podstawy prawne (konkretne artykuły z cytatami - ZAWSZE podawaj numer artykułu!)
3. 💡 Praktyczne wskazówki
${searchJurisprudence ? '4. 📚 Orzecznictwo sądowe i precedensy' : ''}

WAŻNE: ZAWSZE cytuj pełne referencje artykułów w formacie: "art. X KC" lub "art. X § Y KPC"

Bądź precyzyjny i fachowy.`;
        } else if (type === 'analyze') {
            systemPrompt = `Jesteś ekspertem prawnym analizującym dokumenty. Twoim zadaniem jest analiza prawna przedstawionej sytuacji lub dokumentu.

Analizuj dokładnie i zwróć uwagę na:
- Podstawy prawne (ZAWSZE podawaj konkretne artykuły!)
- Mocne i słabe strony argumentacji
- Ryzyka prawne
- Zalecenia działań
${searchJurisprudence ? '- Precedensy i orzecznictwo' : ''}

WAŻNE: Cytuj artykuły w formacie: "art. X KC" lub "art. X § Y KPC"

Odpowiadaj ZAWSZE PO POLSKU.`;
        } else if (type === 'case') {
            systemPrompt = `Jesteś ekspertem prawnym analizującym sprawy sądowe. Twoim zadaniem jest kompleksowa analiza sprawy i strategii procesowej.

W swojej analizie uwzględnij:
- Podstawy prawne (ZAWSZE podawaj konkretne artykuły!)
- Argumenty za i przeciw
- Przewidywany przebieg sprawy
- Propozycje działań strategicznych
${searchJurisprudence ? '- Podobne sprawy i orzecznictwo' : ''}

WAŻNE: Cytuj artykuły w formacie: "art. X KC" lub "art. X § Y KPC"

Odpowiadaj ZAWSZE PO POLSKU.`;
        }

        // Buduj user prompt
        let userPrompt = query;

        // Dodaj kontekst sprawy jeśli dostępny
        if (caseContext) {
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
        }

        // Dodaj kontekst przepisów prawnych z bazy jeśli dostępny
        if (lawsContext) {
            userPrompt += lawsContext;
            console.log('📚 Dodano kontekst przepisów prawnych do promptu Gemini');
        }

        // 🆕 Dodaj treść dokumentów PDF/DOCX jeśli dostępne
        if (documentsContext) {
            userPrompt += documentsContext;
            console.log('📄 Dodano treść dokumentów do promptu Gemini');
        }

        // Wywołaj Gemini
        const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
        const promptLength = fullPrompt.length;
        console.log(`📏 Długość promptu: ${promptLength} znaków (${Math.round(promptLength / 4)} tokenów w przybliżeniu)`);
        
        if (promptLength > 30000) {
            console.warn('⚠️ UWAGA: Prompt bardzo długi! Może przekroczyć limit Gemini.');
        }
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const answer = response.text();

        // Wyciągnij źródła (artykuły prawne) z odpowiedzi
        const sources = [];
        
        // Pattern dla artykułów z kodeksem
        const articleRegex = /art\.?\s*(\d+[a-z]?)(?:\s*§\s*(\d+))?\s+(KC|KPC|KK|KPK|KP|KKW|KKS|KW|KPW|KRO|KSH|KPA|PPSA|k\.c\.|k\.p\.c\.|k\.k\.|k\.p\.k\.|k\.p\.|k\.r\.o\.|k\.s\.h\.|k\.p\.a\.)/gi;
        
        let match;
        while ((match = articleRegex.exec(answer)) !== null) {
            let code = match[3].toUpperCase()
                .replace('K.C.', 'KC')
                .replace('K.P.C.', 'KPC')
                .replace('K.K.', 'KK')
                .replace('K.P.K.', 'KPK')
                .replace('K.P.', 'KP')
                .replace('K.R.O.', 'KRO')
                .replace('K.S.H.', 'KSH')
                .replace('K.P.A.', 'KPA');
            
            const sourceRef = `art. ${match[1]}${match[2] ? ' § ' + match[2] : ''} ${code}`;
            sources.push(sourceRef);
        }

        // Usuń duplikaty
        const uniqueSources = [...new Set(sources)].slice(0, 10);

        return {
            success: true,
            answer: answer,
            sources: uniqueSources
        };

    } catch (error) {
        console.error('❌ Gemini Legal Search Error:', error.message);
        console.error('❌ Full error:', error);
        console.error('❌ Error stack:', error.stack);
        return {
            success: false,
            error: error.message || 'Unknown Gemini error',
            details: error.toString()
        };
    }
}

/**
 * Sprawdź czy API Key jest ustawiony
 */
function isConfigured() {
    return !!API_KEY && !!model;
}

module.exports = {
    analyzeDocument,
    askQuestion,
    generateCaseSummary,
    suggestPrecedents,
    generateDocument,
    legalSearch,
    isConfigured,
    saveCaseAnalysis  // 🧠 Eksport funkcji pamięci
};
