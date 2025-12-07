// 🔍 WALIDATOR MASOWEGO IMPORTU ARTYKUŁÓW

class ArticleValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.stats = {
            total: 0,
            valid: 0,
            invalid: 0,
            duplicates: 0
        };
    }

    // Waliduj pojedynczy artykuł
    validateArticle(article, codeType) {
        const issues = [];
        
        // 1. Sprawdź numer artykułu
        if (!article.number || !/^\d+$/.test(article.number)) {
            issues.push({
                level: 'ERROR',
                message: `Nieprawidłowy numer artykułu: "${article.number}"`
            });
        }
        
        // 2. Sprawdź treść
        if (!article.content || article.content.length < 10) {
            issues.push({
                level: 'ERROR',
                message: `Art. ${article.number}: Treść za krótka (${article.content?.length} znaków)`
            });
        }
        
        // 3. Sprawdź czy treść zawiera numer artykułu
        const artPattern = new RegExp(`Art\\.?\\s*${article.number}[^\\d]`, 'i');
        if (!artPattern.test(article.content)) {
            issues.push({
                level: 'WARNING',
                message: `Art. ${article.number}: Treść nie zawiera "Art. ${article.number}"`
            });
        }
        
        // 4. Sprawdź czy nie jest placeholder
        const placeholders = ['dostępny', 'placeholder', 'TODO', 'brak treści'];
        if (placeholders.some(p => article.content.toLowerCase().includes(p))) {
            issues.push({
                level: 'WARNING',
                message: `Art. ${article.number}: Podejrzana treść (placeholder?)`
            });
        }
        
        // 5. Sprawdź minimalną długość dla konkretnych kodeksów
        const minLengths = {
            'KC': 50,   // Kodeks cywilny - dłuższe artykuły
            'KK': 30,   // Kodeks karny
            'KP': 40    // Kodeks pracy
        };
        
        const minLength = minLengths[codeType] || 20;
        if (article.content.length < minLength) {
            issues.push({
                level: 'WARNING',
                message: `Art. ${article.number}: Podejrzanie krótki (${article.content.length} < ${minLength})`
            });
        }
        
        return {
            valid: issues.filter(i => i.level === 'ERROR').length === 0,
            issues: issues
        };
    }

    // Raport walidacji
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            errors: this.errors,
            warnings: this.warnings,
            summary: `
╔═══════════════════════════════════════╗
║     RAPORT WALIDACJI ARTYKUŁÓW       ║
╠═══════════════════════════════════════╣
║ ✅ POPRAWNE:    ${String(this.stats.valid).padStart(5)} / ${this.stats.total}      ║
║ ❌ BŁĘDNE:      ${String(this.stats.invalid).padStart(5)}            ║
║ 🔁 DUPLIKATY:   ${String(this.stats.duplicates).padStart(5)}            ║
║ ⚠️  OSTRZEŻENIA: ${String(this.warnings.length).padStart(5)}            ║
╚═══════════════════════════════════════╝
            `.trim()
        };
        
        return report;
    }

    // Wyświetl raport
    printReport() {
        const report = this.generateReport();
        console.log('\n' + report.summary);
        
        if (this.errors.length > 0) {
            console.log('\n❌ BŁĘDY:');
            this.errors.forEach((err, idx) => {
                console.log(`  ${idx + 1}. ${err}`);
            });
        }
        
        if (this.warnings.length > 0 && this.warnings.length <= 10) {
            console.log('\n⚠️  OSTRZEŻENIA (pierwsze 10):');
            this.warnings.slice(0, 10).forEach((warn, idx) => {
                console.log(`  ${idx + 1}. ${warn}`);
            });
        }
        
        return report;
    }
}

module.exports = ArticleValidator;
