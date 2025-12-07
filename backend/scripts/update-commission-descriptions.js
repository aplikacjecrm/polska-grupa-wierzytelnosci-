/**
 * Aktualizuje opisy prowizji - zamienia ID sprawy na numer sprawy
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');
const db = new sqlite3.Database(DB_PATH);

async function updateCommissionDescriptions() {
    console.log('🔧 Aktualizuję opisy prowizji...\n');
    
    try {
        // Pobierz wszystkie prowizje z ID sprawy w opisie
        const commissions = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    ec.id,
                    ec.case_id,
                    ec.description,
                    c.case_number
                FROM employee_commissions ec
                LEFT JOIN cases c ON ec.case_id = c.id
                WHERE ec.description LIKE '%ID:%' OR ec.description LIKE '%(ID:%'
                ORDER BY ec.id
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        if (commissions.length === 0) {
            console.log('✅ Wszystkie prowizje mają już poprawne opisy!\n');
            db.close();
            process.exit(0);
        }
        
        console.log(`⚠️ Znaleziono ${commissions.length} prowizji do aktualizacji:\n`);
        
        let updated = 0;
        
        for (const comm of commissions) {
            console.log(`\n📋 Prowizja ID: ${comm.id}`);
            console.log(`   PRZED: ${comm.description}`);
            
            // Zamień "Prowizja za sprawę (ID: 27)" na "Prowizja za sprawę ODS/TN01/001"
            // lub "Prowizja mecenasa za sprawę ID: 27" na "Prowizja mecenasa za sprawę ODS/TN01/001"
            let newDescription = comm.description;
            
            // Wariant 1: "Prowizja za sprawę (ID: 27)" -> "Prowizja za sprawę ODS/TN01/001"
            newDescription = newDescription.replace(/\(ID:\s*\d+\)/gi, comm.case_number);
            
            // Wariant 2: "za sprawę ID: 27" -> "za sprawę ODS/TN01/001"
            newDescription = newDescription.replace(/ID:\s*\d+/gi, comm.case_number);
            
            // Jeśli opis się nie zmienił, spróbuj innej metody
            if (newDescription === comm.description && comm.case_number) {
                // Jeśli jest "Prowizja ... za sprawę" bez numeru, dodaj numer
                if (newDescription.includes('za sprawę') && !newDescription.includes(comm.case_number)) {
                    newDescription = newDescription.replace(/za sprawę/, `za sprawę ${comm.case_number}`);
                }
            }
            
            console.log(`   PO:    ${newDescription}`);
            
            if (newDescription !== comm.description) {
                await new Promise((resolve, reject) => {
                    db.run(`
                        UPDATE employee_commissions 
                        SET description = ?
                        WHERE id = ?
                    `, [newDescription, comm.id], (err) => {
                        if (err) reject(err);
                        else {
                            console.log(`   ✅ Zaktualizowano`);
                            updated++;
                            resolve();
                        }
                    });
                });
            } else {
                console.log(`   ⚠️ Nie zmieniono (brak dopasowania)`);
            }
        }
        
        console.log(`\n\n📊 PODSUMOWANIE:`);
        console.log(`   ✅ Zaktualizowano: ${updated} prowizji`);
        console.log(`   📋 Sprawdzono: ${commissions.length}`);
        
        db.close();
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Błąd:', error);
        db.close();
        process.exit(1);
    }
}

updateCommissionDescriptions();
