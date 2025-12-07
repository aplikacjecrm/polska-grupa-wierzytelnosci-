// ==========================================
// CACHE SERVICE - SQLite jako storage
// Używany przez wszystkie API integrations
// ==========================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../database/kancelaria.db');
const db = new sqlite3.Database(DB_PATH);

class CacheService {
    constructor() {
        this.createTable();
    }
    
    createTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS api_cache (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                expires_at INTEGER NOT NULL
            )
        `;
        
        db.run(sql, (err) => {
            if (err) {
                console.error('❌ Błąd tworzenia tabeli api_cache:', err);
            } else {
                console.log('✅ Tabela api_cache gotowa');
            }
        });
    }
    
    async get(key) {
        return new Promise((resolve, reject) => {
            const now = Date.now();
            db.get(
                'SELECT value FROM api_cache WHERE key = ? AND expires_at > ?',
                [key, now],
                (err, row) => {
                    if (err) {
                        console.error('❌ Cache GET error:', err);
                        reject(err);
                    } else if (row) {
                        try {
                            resolve(JSON.parse(row.value));
                        } catch (parseError) {
                            console.error('❌ Cache parse error:', parseError);
                            resolve(null);
                        }
                    } else {
                        resolve(null);
                    }
                }
            );
        });
    }
    
    async set(key, value, ttlSeconds) {
        const expiresAt = Date.now() + (ttlSeconds * 1000);
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT OR REPLACE INTO api_cache (key, value, expires_at) VALUES (?, ?, ?)',
                [key, JSON.stringify(value), expiresAt],
                (err) => {
                    if (err) {
                        console.error('❌ Cache SET error:', err);
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    }
    
    async invalidate(key) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM api_cache WHERE key = ?', [key], (err) => {
                if (err) {
                    console.error('❌ Cache INVALIDATE error:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    
    async cleanup() {
        // Usuń przeterminowane wpisy
        const now = Date.now();
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM api_cache WHERE expires_at < ?', [now], (err) => {
                if (err) {
                    console.error('❌ Cache CLEANUP error:', err);
                    reject(err);
                } else {
                    console.log('✅ Cache cleanup completed');
                    resolve();
                }
            });
        });
    }
}

module.exports = new CacheService();
