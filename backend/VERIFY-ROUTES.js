// Weryfikacja endpointów przed uruchomieniem
console.log('🔍 WERYFIKACJA ROUTERÓW...\n');

const payments = require('./routes/payments');
console.log('✅ payments.js załadowany');

if (payments.stack) {
    console.log(`\n📋 WSZYSTKIE ENDPOINTY (/api/payments):\n`);
    let found = false;
    payments.stack.forEach((layer, i) => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
            const path = layer.route.path;
            const marker = path === '/top-up' ? ' ⭐ ZNALEZIONY!' : '';
            console.log(`   ${i+1}. ${methods.padEnd(6)} /api/payments${path}${marker}`);
            if (path === '/top-up') found = true;
        }
    });
    
    if (found) {
        console.log('\n✅ Endpoint /top-up ISTNIEJE w pliku!');
    } else {
        console.log('\n❌ BRAK endpointu /top-up!');
    }
}

console.log('\n✅ Weryfikacja zakończona\n');
