// Test parsowania PDFów ze sprawy 21
const fullContextService = require('./backend/services/full-case-context');
const documentParser = require('./backend/services/document-parser');

async function testParsing() {
    console.log('🧪 TEST PARSOWANIA DOKUMENTÓW SPRAWY 21\n');
    
    try {
        // Test 1: Pobierz pełny kontekst
        console.log('📚 Test 1: Pełny kontekst sprawy...');
        const context = await fullContextService.getFullCaseContext(21);
        
        console.log('\n📊 WYNIKI:');
        console.log(`   Dokumenty: ${context.documents.length}`);
        console.log(`   Obrazy: ${context.images.length}`);
        console.log(`   Komentarze: ${context.comments.length}`);
        console.log(`   Wydarzenia: ${context.events.length}`);
        console.log(`   Świadkowie: ${context.witnesses.length}`);
        console.log(`   Dowody: ${context.evidence.length}`);
        console.log(`   Notatki: ${context.notes.length}`);
        console.log(`   Łącznie znaków: ${context.totalChars}`);
        
        if (context.documents.length > 0) {
            console.log('\n📄 DOKUMENTY:');
            context.documents.forEach((doc, index) => {
                console.log(`   ${index + 1}. ${doc.filename}`);
                console.log(`      Kategoria: ${doc.category}`);
                console.log(`      Tekst: ${doc.text ? doc.text.length + ' znaków' : 'BRAK TEKSTU!'}`);
                if (doc.error) {
                    console.log(`      ❌ Błąd: ${doc.error}`);
                }
                if (doc.text) {
                    console.log(`      Początek: ${doc.text.substring(0, 100)}...`);
                }
            });
        } else {
            console.log('\n⚠️ BRAK DOKUMENTÓW!');
        }
        
        // Test 2: Format do AI
        console.log('\n📋 Test 2: Formatowanie do AI...');
        const formatted = fullContextService.formatFullContextForAI(context);
        console.log(`   Długość promptu: ${formatted.length} znaków`);
        console.log(`   Pierwszy fragment:\n${formatted.substring(0, 500)}...`);
        
    } catch (error) {
        console.error('❌ BŁĄD TESTU:', error);
        console.error(error.stack);
    }
}

testParsing();
