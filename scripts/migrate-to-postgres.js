#!/usr/bin/env node
/**
 * SQLite to PostgreSQL Migration Script
 * Migrates data from local SQLite to Supabase PostgreSQL
 * 
 * Usage: node scripts/migrate-to-postgres.js
 */

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

// Configuration
const SQLITE_PATH = path.resolve(__dirname, '..', 'data', 'komunikator.db');
const BATCH_SIZE = 100;

// Tables to migrate in order (respecting foreign keys)
const TABLES_ORDER = [
  'users',
  'clients', 
  'cases',
  'employee_profiles',
  'employee_tasks',
  'employee_activity',
  'documents',
  'notes',
  'events',
  'chat_messages',
  'case_comments',
  'case_witnesses',
  'payments',
  'sessions',
  'login_sessions'
];

// PostgreSQL connection
const pgConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
};

async function getSqliteData(db, table) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${table}`, [], (err, rows) => {
      if (err) {
        // Table might not exist
        if (err.message.includes('no such table')) {
          console.log(`  ⚠️ Table ${table} not found in SQLite, skipping`);
          resolve([]);
        } else {
          reject(err);
        }
      } else {
        resolve(rows || []);
      }
    });
  });
}

async function getTableColumns(pgClient, table) {
  const result = await pgClient.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = $1 
    ORDER BY ordinal_position
  `, [table]);
  return result.rows.map(r => r.column_name);
}

async function migrateTable(sqliteDb, pgClient, table) {
  console.log(`\n📦 Migrating table: ${table}`);
  
  // Get data from SQLite
  const rows = await getSqliteData(sqliteDb, table);
  if (rows.length === 0) {
    console.log(`  ℹ️ No data to migrate`);
    return 0;
  }
  
  console.log(`  📊 Found ${rows.length} rows`);
  
  // Get PostgreSQL columns
  const pgColumns = await getTableColumns(pgClient, table);
  if (pgColumns.length === 0) {
    console.log(`  ⚠️ Table ${table} not found in PostgreSQL, skipping`);
    return 0;
  }
  
  // Filter SQLite columns to only include those that exist in PostgreSQL
  const sqliteColumns = Object.keys(rows[0] || {});
  const validColumns = sqliteColumns.filter(col => pgColumns.includes(col));
  
  if (validColumns.length === 0) {
    console.log(`  ⚠️ No matching columns found`);
    return 0;
  }
  
  // Migrate in batches
  let migrated = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    
    for (const row of batch) {
      const values = validColumns.map(col => {
        let val = row[col];
        // Convert SQLite boolean (0/1) to PostgreSQL boolean
        if (val === 0 || val === 1) {
          // Check if it's likely a boolean field
          if (col.startsWith('is_') || col === 'read' || col === 'is_active') {
            val = val === 1;
          }
        }
        return val;
      });
      
      const placeholders = validColumns.map((_, idx) => `$${idx + 1}`).join(', ');
      const columnNames = validColumns.join(', ');
      
      try {
        await pgClient.query(
          `INSERT INTO ${table} (${columnNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
        migrated++;
      } catch (err) {
        console.error(`  ❌ Error inserting row:`, err.message);
      }
    }
    
    process.stdout.write(`  ✅ Migrated ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}\r`);
  }
  
  console.log(`  ✅ Migrated ${migrated} rows`);
  return migrated;
}

async function resetSequences(pgClient) {
  console.log('\n🔄 Resetting PostgreSQL sequences...');
  
  for (const table of TABLES_ORDER) {
    try {
      await pgClient.query(`
        SELECT setval(pg_get_serial_sequence('${table}', 'id'), 
               COALESCE((SELECT MAX(id) FROM ${table}), 1))
      `);
    } catch (err) {
      // Sequence might not exist for this table
    }
  }
  
  console.log('✅ Sequences reset');
}

async function main() {
  console.log('🚀 SQLite to PostgreSQL Migration');
  console.log('==================================\n');
  
  // Check SQLite database
  if (!fs.existsSync(SQLITE_PATH)) {
    console.error('❌ SQLite database not found:', SQLITE_PATH);
    process.exit(1);
  }
  
  const stats = fs.statSync(SQLITE_PATH);
  console.log(`📁 SQLite database: ${SQLITE_PATH}`);
  console.log(`📊 Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB\n`);
  
  // Check PostgreSQL connection
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env');
    console.error('   Add: DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres');
    process.exit(1);
  }
  
  // Connect to databases
  const sqliteDb = new sqlite3.Database(SQLITE_PATH);
  const pgClient = new Client(pgConfig);
  
  try {
    await pgClient.connect();
    console.log('✅ Connected to PostgreSQL\n');
    
    // Run migrations first
    console.log('🔄 Running Knex migrations...');
    const knex = require('knex')(require('../knexfile').production);
    await knex.migrate.latest({
      directory: path.join(__dirname, '..', 'backend', 'database', 'migrations')
    });
    await knex.destroy();
    console.log('✅ Migrations completed\n');
    
    // Migrate each table
    let totalMigrated = 0;
    for (const table of TABLES_ORDER) {
      const count = await migrateTable(sqliteDb, pgClient, table);
      totalMigrated += count;
    }
    
    // Reset sequences
    await resetSequences(pgClient);
    
    console.log('\n==================================');
    console.log(`🎉 Migration complete! Total rows: ${totalMigrated}`);
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    sqliteDb.close();
    await pgClient.end();
  }
}

main();
