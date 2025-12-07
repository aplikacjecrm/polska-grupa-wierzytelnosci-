// 📚 IMPORT PEŁNEGO KODEKSU Z WALIDACJĄ

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const ArticleValidator = require('./bulk-import-validator');

const DB_PATH = path.join(__dirname, '../../data/komunikator.db');

class CodeImporter {
    constructor(codeType, codeName) {
        this.codeType = codeType;  // 'KC', 'KK', etc.
        this.codeName = codeName;  // 'Kodeks cywilny'
        this.db = new sqlite3.Database(DB_PATH);
        this.validator = new ArticleValidator();
        this.progress = {
            total: 0,
            processed: 0,
            imported: 0,
            skipped: 0,
            errors: 0
        };
    }

    // Import z tablicy artykułów
    async importArticles(articles) {
        console.log(`\n╔${'═'.repeat(60)}╗`);
        console.log(`║  IMPORT: ${this.codeName.padEnd(50)}║`);
        console.log(`╚${'═'.repeat(60)}╝\n`);
        
        this.progress.total = articles.length;
        const today = new Date().toISOString().split('T')[0];
        
        // URL do ISAP
        const isapUrls = {
            'KC': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640160093',
            'KPC': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19640430296',
            'KK': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970880553',
            'KPK': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19970890555',
            'KP': 'https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=wdu19740240141'
        };
        
        const url = isapUrls[this.codeType] || 'https://isap.sejm.gov.pl';
        
        // KROK 1: WALIDACJA
        console.log('🔍 KROK 1/3: Walidacja artykułów...\n');
        const validArticles = [];
        
        for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            const validation = this.validator.validateArticle(article, this.codeType);
            
            this.progress.processed++;
            
            // Progress bar
            const percent = Math.floor((this.progress.processed / this.progress.total) * 100);
            const bar = '█'.repeat(Math.floor(percent / 2)) + '░'.repeat(50 - Math.floor(percent / 2));
            process.stdout.write(`\r[${bar}] ${percent}% - Art. ${article.number}`);
            
            if (validation.valid) {
                validArticles.push(article);
                this.validator.stats.valid++;
            } else {
                this.validator.stats.invalid++;
                validation.issues.forEach(issue => {
                    if (issue.level === 'ERROR') {
                        this.validator.errors.push(`Art. ${article.number}: ${issue.message}`);
                    }
                });
                this.progress.errors++;
            }
            
            // Ostrzeżenia
            validation.issues.filter(i => i.level === 'WARNING').forEach(issue => {
                this.validator.warnings.push(`Art. ${article.number}: ${issue.message}`);
            });
            
            this.validator.stats.total++;
        }
        
        console.log('\n\n✅ Walidacja zakończona!\n');
        
        // KROK 2: RAPORT WALIDACJI
        console.log('📊 KROK 2/3: Raport walidacji\n');
        const report = this.validator.printReport();
        
        // Jeśli są błędy - pytaj użytkownika
        if (this.validator.stats.invalid > 0) {
            console.log('\n⚠️  UWAGA: Znaleziono błędne artykuły!');
            console.log('Czy kontynuować import tylko poprawnych artykułów? (y/n)');
            console.log('(Naciśnij Enter aby kontynuować lub Ctrl+C aby przerwać)\n');
            
            // W skrypcie zawsze kontynuuj z poprawnymi
        }
        
        // KROK 3: IMPORT DO BAZY
        console.log('\n💾 KROK 3/3: Import do bazy danych...\n');
        
        // Buduj pełny content z wszystkich artykułów
        const fullContent = validArticles.map(a => 
            `Art. ${a.number} - ${a.content}`
        ).join('\n\n');
        
        return new Promise((resolve, reject) => {
            this.db.run(`
                INSERT OR REPLACE INTO legal_acts 
                (title, date, url, content, source, created_at)
                VALUES (?, ?, ?, ?, ?, datetime('now'))
            `, [
                `Ustawa - ${this.codeName}`,
                today,
                url,
                fullContent,
                'bulk-import-validated'
            ], (err) => {
                if (err) {
                    console.error('❌ Błąd zapisu do bazy:', err.message);
                    reject(err);
                } else {
                    this.progress.imported = validArticles.length;
                    console.log(`\n✅ SUKCES! Zaimportowano ${validArticles.length} artykułów do bazy!\n`);
                    
                    // Podsumowanie
                    this.printSummary();
                    
                    // Zapisz raport do pliku
                    this.saveReport(report);
                    
                    resolve({
                        success: true,
                        imported: validArticles.length,
                        errors: this.progress.errors,
                        report: report
                    });
                }
            });
        });
    }

    // Wydrukuj podsumowanie
    printSummary() {
        console.log('╔═══════════════════════════════════════╗');
        console.log('║        PODSUMOWANIE IMPORTU          ║');
        console.log('╠═══════════════════════════════════════╣');
        console.log(`║ 📚 Kodeks: ${this.codeName.padEnd(26)}║`);
        console.log(`║ 📊 Wszystkich:  ${String(this.progress.total).padStart(5)} artykułów     ║`);
        console.log(`║ ✅ Zaimportowano: ${String(this.progress.imported).padStart(5)}           ║`);
        console.log(`║ ❌ Błędów:        ${String(this.progress.errors).padStart(5)}           ║`);
        console.log(`║ ⚠️  Ostrzeżeń:    ${String(this.validator.warnings.length).padStart(5)}           ║`);
        console.log('╚═══════════════════════════════════════╝\n');
    }

    // Zapisz raport do pliku
    saveReport(report) {
        const reportPath = path.join(__dirname, `../../logs/import-${this.codeType}-${Date.now()}.json`);
        const logsDir = path.join(__dirname, '../../logs');
        
        // Utwórz katalog logs jeśli nie istnieje
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📄 Raport zapisany: ${reportPath}\n`);
    }

    // Zamknij połączenie
    close() {
        this.db.close();
    }
}

module.exports = CodeImporter;
