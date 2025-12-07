// GŁĘBOKA ANALIZA - CO DOKŁADNIE JEST W BAZIE
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'kancelaria.db');
const db = new sqlite3.Database(dbPath);

console.log('🔍 GŁĘBOKA ANALIZA BAZY DANYCH\n');
console.log('=' .repeat(60));

// 1. Sprawdź czy tabele istnieją
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('❌ Błąd:', err);
    db.close();
    return;
  }
  
  console.log('\n📊 TABELE W BAZIE:');
  const tableNames = tables.map(t => t.name);
  console.log('  -', tableNames.join(', '));
  
  const hasAttachments = tableNames.includes('attachments');
  const hasDocuments = tableNames.includes('documents');
  const hasCases = tableNames.includes('cases');
  
  console.log('\n✓ Czy jest tabela attachments?', hasAttachments ? '✅ TAK' : '❌ NIE');
  console.log('✓ Czy jest tabela documents?', hasDocuments ? '✅ TAK' : '❌ NIE');
  console.log('✓ Czy jest tabela cases?', hasCases ? '✅ TAK' : '❌ NIE');
  
  if (!hasCases) {
    console.log('\n❌ BRAK TABELI CASES - to główny problem!');
    db.close();
    return;
  }
  
  // 2. Sprawdź sprawy
  db.all('SELECT id, case_number, title FROM cases LIMIT 5', [], (err2, cases) => {
    if (err2) {
      console.error('❌ Błąd pobierania spraw:', err2);
      db.close();
      return;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📁 SPRAWY W BAZIE:');
    console.log('Znaleziono:', cases.length, 'spraw');
    
    if (cases.length === 0) {
      console.log('❌ BRAK SPRAW W BAZIE!');
      db.close();
      return;
    }
    
    cases.forEach((c, i) => {
      console.log(`\n  ${i + 1}. ID: ${c.id} | ${c.case_number} | ${c.title}`);
    });
    
    const firstCaseId = cases[0].id;
    console.log('\n' + '='.repeat(60));
    console.log(`📎 SPRAWDZAM DOKUMENTY DLA SPRAWY ID=${firstCaseId}:`);
    
    // 3. Sprawdź attachments
    if (hasAttachments) {
      db.all('SELECT id, title, attachment_code, category, file_name FROM attachments WHERE case_id = ?', [firstCaseId], (err3, atts) => {
        if (err3) {
          console.error('❌ Błąd pobierania attachments:', err3);
        } else {
          console.log('\n🔗 ATTACHMENTS:');
          console.log('Znaleziono:', atts.length);
          
          if (atts.length > 0) {
            atts.forEach((att, i) => {
              console.log(`\n  Załącznik #${i + 1}:`);
              console.log('    ID:', att.id);
              console.log('    Title:', att.title);
              console.log('    attachment_code:', att.attachment_code || '❌ NULL');
              console.log('    category:', att.category);
              console.log('    file_name:', att.file_name);
            });
          } else {
            console.log('  ⚠️ Brak załączników dla tej sprawy');
          }
        }
        
        // 4. Sprawdź documents
        if (hasDocuments) {
          db.all('SELECT id, title, document_number, category, filename FROM documents WHERE case_id = ?', [firstCaseId], (err4, docs) => {
            if (err4) {
              console.error('❌ Błąd pobierania documents:', err4);
            } else {
              console.log('\n📄 DOCUMENTS:');
              console.log('Znaleziono:', docs.length);
              
              if (docs.length > 0) {
                docs.forEach((doc, i) => {
                  console.log(`\n  Dokument #${i + 1}:`);
                  console.log('    ID:', doc.id);
                  console.log('    Title:', doc.title);
                  console.log('    document_number:', doc.document_number || '❌ NULL');
                  console.log('    category:', doc.category);
                  console.log('    filename:', doc.filename);
                });
              } else {
                console.log('  ⚠️ Brak dokumentów dla tej sprawy');
              }
            }
            
            // 5. UNION ALL - jak backend to robi
            console.log('\n' + '='.repeat(60));
            console.log('🔀 TEST UNION ALL (jak robi backend):');
            
            db.all(`
              SELECT 
                d.id,
                d.document_number,
                NULL as attachment_code,
                d.title,
                'document' as source_type
              FROM documents d
              WHERE d.case_id = ?
              
              UNION ALL
              
              SELECT 
                a.id,
                NULL as document_number,
                a.attachment_code,
                a.title,
                'attachment' as source_type
              FROM attachments a
              WHERE a.case_id = ?
              
              ORDER BY id DESC
            `, [firstCaseId, firstCaseId], (err5, combined) => {
              if (err5) {
                console.error('❌ Błąd UNION:', err5);
              } else {
                console.log('\nPołączone wyniki:', combined.length);
                
                if (combined.length > 0) {
                  console.log('\n📦 TO WŁAŚNIE ZWRACA BACKEND:');
                  combined.forEach((item, i) => {
                    console.log(`\n  #${i + 1}:`);
                    console.log('    ID:', item.id);
                    console.log('    Title:', item.title);
                    console.log('    document_number:', item.document_number || 'null');
                    console.log('    attachment_code:', item.attachment_code || 'null');
                    console.log('    source_type:', item.source_type);
                    console.log('    🔢 NUMER:', item.attachment_code || item.document_number || '❌ BRAK!');
                  });
                  
                  // Sprawdź czy KTÓRYKOLWIEK ma numer
                  const hasNumbers = combined.some(c => c.attachment_code || c.document_number);
                  
                  console.log('\n' + '='.repeat(60));
                  console.log('🎯 PODSUMOWANIE:');
                  console.log('Czy JAKIKOLWIEK dokument ma numer?', hasNumbers ? '✅ TAK!' : '❌ NIE!');
                  
                  if (!hasNumbers) {
                    console.log('\n❗ PROBLEM: Wszystkie dokumenty mają NULL w kodach!');
                    console.log('📌 ROZWIĄZANIE: Musisz dodać NOWE dokumenty');
                    console.log('   - Stare dokumenty nie mają kodów');
                    console.log('   - Tylko NOWE będą miały attachment_code');
                  }
                } else {
                  console.log('  ⚠️ Brak jakichkolwiek dokumentów/załączników');
                }
              }
              
              db.close();
            });
          });
        } else {
          db.close();
        }
      });
    } else {
      console.log('\n❌ Brak tabeli attachments!');
      db.close();
    }
  });
});
