// Znajdź wszystkie PDFy w bazie
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'komunikator.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Szukam wszystkich PDFów w bazie...\n');

db.all(`
    SELECT d.id, d.case_id, d.filename, d.filepath, 
           c.case_number, c.title as case_title
    FROM documents d
    LEFT JOIN cases c ON d.case_id = c.id
    WHERE d.filename LIKE '%.pdf'
    ORDER BY d.case_id, d.uploaded_at DESC
`, [], (err, docs) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }
    
    if (docs.length === 0) {
        console.log('⚠️ NIE ZNALEZIONO ŻADNYCH PDFów!');
        db.close();
        return;
    }
    
    console.log(`📄 Znaleziono ${docs.length} plików PDF:\n`);
    
    // Grupuj po sprawach
    const byCaseId = {};
    docs.forEach(doc => {
        if (!byCaseId[doc.case_id]) {
            byCaseId[doc.case_id] = [];
        }
        byCaseId[doc.case_id].push(doc);
    });
    
    Object.keys(byCaseId).forEach(caseId => {
        const caseDocs = byCaseId[caseId];
        const firstDoc = caseDocs[0];
        
        console.log(`📁 SPRAWA ${caseId}: ${firstDoc.case_number} - ${firstDoc.case_title}`);
        console.log(`   PDFów: ${caseDocs.length}\n`);
        
        caseDocs.forEach((doc, index) => {
            console.log(`   ${index + 1}. ${doc.filename}`);
            console.log(`      ID dokumentu: ${doc.id}`);
            console.log(`      Ścieżka: ${doc.filepath}`);
        });
        console.log('');
    });
    
    db.close();
});
