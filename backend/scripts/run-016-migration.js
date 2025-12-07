/**
 * Skrypt do uruchomienia migracji 016 - System zarządzania stawkami prowizji
 */

const path = require('path');

// Ustaw ścieżkę do bazy danych
process.env.DB_PATH = path.join(__dirname, '../../data/komunikator.db');

console.log('🚀 Uruchamianie migracji 016 - System zarządzania stawkami prowizji');
console.log('📍 Ścieżka do bazy:', process.env.DB_PATH);
console.log('');

// Uruchom migrację
require('../migrations/016-commission-rate-management.js');
