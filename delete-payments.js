// Usuń WSZYSTKIE płatności
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'komunikator.db');
const db = new sqlite3.Database(dbPath);

console.log('🗑️ Usuwam WSZYSTKIE płatności...\n');

// Sprawdź ile jest
db.get('SELECT COUNT(*) as count FROM payments', (err, row) => {
    if (err) {
        console.error('❌ Błąd:', err);
        db.close();
        return;
    }
    
    console.log(`📊 Znaleziono ${row.count} płatności\n`);
    
    // Usuń wszystkie
    db.run('DELETE FROM payments', (err) => {
        if (err) {
            console.error('❌ Błąd usuwania:', err);
        } else {
            console.log('✅ Wszystkie płatności usunięte!');
        }
        
        // Usuń też powiązane
        db.run('DELETE FROM payment_history', () => {
            console.log('✅ payment_history wyczyszczona');
        });
        
        db.run('DELETE FROM payment_installments', () => {
            console.log('✅ payment_installments wyczyszczona');
        });
        
        db.run('DELETE FROM payment_receipts', () => {
            console.log('✅ payment_receipts wyczyszczona');
        });
        
        setTimeout(() => {
            db.close();
            console.log('\n🎉 GOTOWE! Wszystkie płatności usunięte!');
        }, 500);
    });
});
