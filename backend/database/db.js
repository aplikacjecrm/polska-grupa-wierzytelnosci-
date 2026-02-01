/**
 * Database connection using Knex.js
 * Supports SQLite (development) and PostgreSQL (production/Supabase)
 */
const knex = require('knex');
const knexConfig = require('../../knexfile');

// Determine environment
const environment = process.env.NODE_ENV || 'development';
console.log(`🗄️ Database environment: ${environment}`);

// Initialize Knex with appropriate config
const db = knex(knexConfig[environment]);

// Test connection
db.raw('SELECT 1')
  .then(() => {
    console.log(`✅ Database connected (${environment === 'production' ? 'PostgreSQL/Supabase' : 'SQLite'})`);
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
  });

module.exports = db;
