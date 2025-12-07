const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/komunikator.db');

console.log('\n╔═══════════════════════════════════════════════════════════════╗');
console.log('║           🔍 PEŁNA WERYFIKACJA IMPORTU                       ║');
console.log('╚═══════════════════════════════════════════════════════════════╝\n');

// 1. Ogólne statystyki
console.log('📊 STATYSTYKI OGÓLNE:\n');

db.get('SELECT COUNT(*) as total FROM legal_acts', (err, row) => {
    console.log(`   Wszystkie artykuły: ${row.total}`);
    
    // 2. Artykuły z cyframi górnymi (331, 332, etc)
    db.all(`
        SELECT title, length(content) as len
        FROM legal_acts 
        WHERE title LIKE '%Art. 33_'
        ORDER BY title
    `, (err, rows) => {
        console.log(`\n🔢 ARTYKUŁY Z CYFRAMI GÓRNYMI (33x):\n`);
        rows.forEach(r => {
            console.log(`   ${r.title} - ${r.len} znaków`);
        });
        
        // 3. Test Art. 33, 33¹, 34 - czy są rozdzielone?
        console.log('\n\n✅ TEST ROZDZIELENIA:\n');
        
        db.get(`SELECT content FROM legal_acts WHERE title = 'Kodeks cywilny - Art. 33'`, (e, r33) => {
            const contains331 = r33 && r33.content.includes('Art. 331');
            console.log(`   Art. 33 zawiera "Art. 331"? ${contains331 ? '❌ TAK (ZŁE!)' : '✅ NIE (DOBRZE!)'}`);
            console.log(`   Art. 33 długość: ${r33 ? r33.content.length : 0} znaków`);
            
            db.get(`SELECT content FROM legal_acts WHERE title = 'Kodeks cywilny - Art. 331' AND content LIKE '%jednostek organizacyjnych%'`, (e, r331) => {
                console.log(`   Art. 33¹ istnieje? ${r331 ? '✅ TAK' : '❌ NIE'}`);
                console.log(`   Art. 33¹ długość: ${r331 ? r331.content.length : 0} znaków`);
                
                db.get(`SELECT content FROM legal_acts WHERE title = 'Kodeks cywilny - Art. 34'`, (e, r34) => {
                    const contains331_in_34 = r34 && r34.content.includes('Art. 331');
                    console.log(`   Art. 34 zawiera "Art. 331"? ${contains331_in_34 ? '❌ TAK (ZŁE!)' : '✅ NIE (DOBRZE!)'}`);
                    console.log(`   Art. 34 długość: ${r34 ? r34.content.length : 0} znaków`);
                    
                    // 4. Sprawdź duplikaty
                    console.log('\n\n🔍 DUPLIKATY:\n');
                    
                    db.all(`
                        SELECT title, COUNT(*) as count 
                        FROM legal_acts 
                        GROUP BY title 
                        HAVING count > 1
                        LIMIT 10
                    `, (e, dups) => {
                        if (dups && dups.length > 0) {
                            console.log('   ⚠️  ZNALEZIONO DUPLIKATY:');
                            dups.forEach(d => {
                                console.log(`   - ${d.title} (${d.count}x)`);
                            });
                        } else {
                            console.log('   ✅ Brak duplikatów');
                        }
                        
                        // 5. Przykładowe artykuły różnych typów
                        console.log('\n\n📝 PRZYKŁADOWE ARTYKUŁY:\n');
                        
                        db.all(`
                            SELECT title, substr(content, 1, 100) as preview, length(content) as len
                            FROM legal_acts
                            WHERE title IN (
                                'Kodeks cywilny - Art. 1',
                                'Kodeks cywilny - Art. 415',
                                'Kodeks cywilny - Art. 444',
                                'Kodeks cywilny - Art. 1000'
                            )
                        `, (e, examples) => {
                            examples.forEach(ex => {
                                console.log(`   ${ex.title}:`);
                                console.log(`      ${ex.len} znaków`);
                                console.log(`      "${ex.preview}..."\n`);
                            });
                            
                            // 6. Sprawdź artykuły z literami
                            console.log('🔤 ARTYKUŁY Z LITERAMI (a, b, c):\n');
                            
                            db.all(`
                                SELECT title, length(content) as len
                                FROM legal_acts
                                WHERE title LIKE '%Art. __a' OR title LIKE '%Art. __b'
                                ORDER BY title
                                LIMIT 5
                            `, (e, letters) => {
                                if (letters && letters.length > 0) {
                                    letters.forEach(l => {
                                        console.log(`   ${l.title} - ${l.len} znaków`);
                                    });
                                } else {
                                    console.log('   (brak w próbce)');
                                }
                                
                                console.log('\n╔═══════════════════════════════════════════════════════════════╗');
                                console.log('║                    ✅ WERYFIKACJA ZAKOŃCZONA                 ║');
                                console.log('╚═══════════════════════════════════════════════════════════════╝\n');
                                
                                db.close();
                            });
                        });
                    });
                });
            });
        });
    });
});
