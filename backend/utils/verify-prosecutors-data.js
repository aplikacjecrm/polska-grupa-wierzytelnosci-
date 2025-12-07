/**
 * WERYFIKACJA DANYCH PROKURATUR
 * Sprawdza poprawność telefonów, emaili, stron WWW i adresów
 */

const { PROSECUTORS_DATABASE } = require('./prosecutors-database');

console.log('\n🔍 WERYFIKACJA DANYCH PROKURATUR\n');
console.log('='.repeat(80));

let totalCount = 0;
let validCount = 0;
let issues = [];

// Regex do walidacji
const phoneRegex = /^\(\d{2}\)\s\d{3}\s\d{2}\s\d{2}$/; // (22) 695 70 00
const emailRegex = /^[a-z0-9\-]+@[a-z0-9\-]+\.(pr|po)\.gov\.pl$/; // nazwa@domena.pr.gov.pl
const websiteRegex = /^https:\/\/[a-z0-9\-]+\.(pr|po)\.gov\.pl$/; // https://domena.pr.gov.pl
const addressRegex = /^ul\.\s.+,\s\d{2}-\d{3}\s.+$/; // ul. Nazwa 1, 00-000 Miasto

Object.entries(PROSECUTORS_DATABASE).forEach(([key, prosecutor]) => {
    totalCount++;
    let prosecutorValid = true;
    let prosecutorIssues = [];

    // Sprawdź telefon
    if (!phoneRegex.test(prosecutor.phone)) {
        prosecutorIssues.push(`❌ Telefon: "${prosecutor.phone}" (oczekiwany format: (22) 695 70 00)`);
        prosecutorValid = false;
    }

    // Sprawdź email
    if (!emailRegex.test(prosecutor.email)) {
        prosecutorIssues.push(`❌ Email: "${prosecutor.email}" (oczekiwany format: nazwa@domena.pr.gov.pl)`);
        prosecutorValid = false;
    }

    // Sprawdź stronę WWW
    if (!websiteRegex.test(prosecutor.website)) {
        prosecutorIssues.push(`❌ Website: "${prosecutor.website}" (oczekiwany format: https://domena.pr.gov.pl)`);
        prosecutorValid = false;
    }

    // Sprawdź adres
    if (!addressRegex.test(prosecutor.address)) {
        prosecutorIssues.push(`❌ Adres: "${prosecutor.address}" (oczekiwany format: ul. Nazwa 1, 00-000 Miasto)`);
        prosecutorValid = false;
    }

    if (prosecutorValid) {
        validCount++;
        console.log(`✅ ${prosecutor.name}`);
    } else {
        console.log(`\n❌ ${prosecutor.name}`);
        prosecutorIssues.forEach(issue => console.log(`   ${issue}`));
        issues.push({ name: prosecutor.name, issues: prosecutorIssues });
    }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 PODSUMOWANIE:`);
console.log(`   Wszystkich prokuratur: ${totalCount}`);
console.log(`   Poprawnych: ${validCount} (${((validCount/totalCount)*100).toFixed(1)}%)`);
console.log(`   Z błędami: ${issues.length} (${((issues.length/totalCount)*100).toFixed(1)}%)`);

if (issues.length > 0) {
    console.log(`\n⚠️  WYMAGANE POPRAWKI:\n`);
    issues.forEach(issue => {
        console.log(`${issue.name}:`);
        issue.issues.forEach(i => console.log(`  ${i}`));
        console.log();
    });
}

console.log('\n' + '='.repeat(80));
console.log('\n💡 LINKI DO SPRAWDZENIA:');
console.log('\n📍 Google Maps (przykład):');
console.log(`   https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('ul. Rakowiecka 26/30, 02-517 Warszawa')}`);
console.log('\n📞 Telefon (przykład):');
console.log(`   tel:+48225425600 (z kodu: (22) 542 56 00)`);
console.log('\n✉️  Email (przykład):');
console.log(`   mailto:sekretariat@warszawa.pr.gov.pl`);
console.log('\n🌐 Strona WWW (przykład):');
console.log(`   https://warszawa.pr.gov.pl`);
console.log();
