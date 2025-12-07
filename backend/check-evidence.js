const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = 'c:\\Users\\horyz\\CascadeProjects\\windsurf-project\\kancelaria\\komunikator-app\\data\\komunikator.db';
const db = new sqlite3.Database(DB_PATH);

console.log('=== SPRAWDZANIE ZAŁĄCZNIKÓW DOWODÓW ===\n');

// Sprawdź wszystkie dowody
db.all('SELECT id, evidence_code, name FROM case_evidence LIMIT 10', (err, evidences) => {
    console.log('DOWODY w bazie:', err || evidences.length);
    if (evidences) {
        evidences.forEach(e => console.log(`  - ID ${e.id}: ${e.evidence_code} - ${e.name}`));
    }
    
    // Sprawdź załączniki z entity_type = 'evidence'
    db.all("SELECT * FROM attachments WHERE entity_type = 'evidence'", (err2, attachments) => {
        console.log('\nZAŁĄCZNIKI dla dowodów (entity_type=evidence):', err2 || attachments.length);
        if (attachments && attachments.length > 0) {
            attachments.forEach(a => console.log(`  - ID ${a.id}: entity_id=${a.entity_id}, file=${a.file_name}`));
        }
        
        // Sprawdź wszystkie załączniki
        db.all("SELECT entity_type, COUNT(*) as cnt FROM attachments GROUP BY entity_type", (err3, groups) => {
            console.log('\nZAŁĄCZNIKI wg entity_type:');
            if (groups) {
                groups.forEach(g => console.log(`  - ${g.entity_type}: ${g.cnt}`));
            }
            db.close();
        });
    });
});
