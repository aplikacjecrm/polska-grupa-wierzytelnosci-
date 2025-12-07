// Start server z debug logami dla payments
console.log('🚀 URUCHAMIANIE BACKENDU Z DEBUG...\n');
console.log('📁 CWD:', process.cwd());
console.log('📁 __dirname:', __dirname);

// Test czy payments.js istnieje
const fs = require('fs');
const path = require('path');
const paymentsPath = path.join(__dirname, 'routes', 'payments.js');
console.log('\n📍 Ścieżka do payments.js:', paymentsPath);
console.log('✅ Plik istnieje:', fs.existsSync(paymentsPath));

if (fs.existsSync(paymentsPath)) {
    const stats = fs.statSync(paymentsPath);
    console.log('📊 Rozmiar pliku:', stats.size, 'bajtów');
    console.log('🕐 Ostatnia modyfikacja:', stats.mtime.toLocaleString('pl-PL'));
}

console.log('\n🔄 Ładowanie payments.js...');
const paymentsRouter = require('./routes/payments');
console.log('✅ payments.js załadowany!');

// Sprawdź endpointy
if (paymentsRouter && paymentsRouter.stack) {
    console.log(`\n📋 WSZYSTKIE ENDPOINTY PAYMENTS (${paymentsRouter.stack.length}):`);
    paymentsRouter.stack.forEach((layer, index) => {
        if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
            const path = layer.route.path;
            const marker = path === '/top-up' ? ' ⭐ TOP-UP!' : '';
            console.log(`   ${index + 1}. ${methods} /api/payments${path}${marker}`);
        }
    });
}

console.log('\n✅ Test zakończony - teraz urucham normalny server...\n');

// Uruchom normalny server
require('./server.js');
