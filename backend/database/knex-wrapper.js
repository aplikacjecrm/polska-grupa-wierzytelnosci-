/**
 * Knex Compatibility Wrapper
 * Provides SQLite-style callback API (db.all, db.run, db.get) using Knex
 * This allows gradual migration from raw SQLite to Knex
 */
const knex = require('knex');
const knexConfig = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const knexInstance = knex(knexConfig[environment]);

/**
 * Wrapper that provides SQLite-compatible interface
 */
class KnexWrapper {
  constructor(knexDb) {
    this.knex = knexDb;
    this.isPostgres = environment === 'production';
  }

  /**
   * Execute SELECT query - returns all rows
   * SQLite: db.all(sql, params, callback)
   */
  all(sql, params, callback) {
    // Handle optional params
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];

    // Convert ? placeholders to $1, $2 for PostgreSQL
    const { query, values } = this._convertQuery(sql, params);

    this.knex.raw(query, values)
      .then(result => {
        // PostgreSQL returns { rows: [...] }, SQLite returns array directly
        const rows = this.isPostgres ? result.rows : result;
        callback(null, rows);
      })
      .catch(err => callback(err));
  }

  /**
   * Execute INSERT/UPDATE/DELETE query
   * SQLite: db.run(sql, params, callback)
   */
  run(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];
    callback = callback || (() => {});

    const { query, values } = this._convertQuery(sql, params);

    this.knex.raw(query, values)
      .then(result => {
        // Simulate SQLite's this context with lastID and changes
        const context = {
          lastID: this.isPostgres ? (result.rows?.[0]?.id || 0) : result.lastInsertRowid,
          changes: this.isPostgres ? result.rowCount : result.changes
        };
        callback.call(context, null);
      })
      .catch(err => callback(err));
  }

  /**
   * Execute SELECT query - returns first row only
   * SQLite: db.get(sql, params, callback)
   */
  get(sql, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = [];
    }
    params = params || [];

    const { query, values } = this._convertQuery(sql, params);

    this.knex.raw(query, values)
      .then(result => {
        const rows = this.isPostgres ? result.rows : result;
        callback(null, rows[0]);
      })
      .catch(err => callback(err));
  }

  /**
   * Execute multiple statements in sequence
   */
  serialize(callback) {
    // In Knex, queries are already serialized by default
    callback();
  }

  /**
   * Convert SQLite ? placeholders to PostgreSQL $1, $2, etc.
   * Also handles some SQL syntax differences
   */
  _convertQuery(sql, params) {
    let query = sql;
    let values = Array.isArray(params) ? params : [params];

    if (this.isPostgres) {
      // Convert ? to $1, $2, etc.
      let paramIndex = 0;
      query = query.replace(/\?/g, () => `$${++paramIndex}`);

      // Convert SQLite-specific syntax to PostgreSQL
      query = query
        .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
        .replace(/DATETIME/gi, 'TIMESTAMP')
        .replace(/datetime\('now'\)/gi, 'NOW()')
        .replace(/IFNULL/gi, 'COALESCE')
        .replace(/\|\|/g, ' || ')  // String concat is same
        .replace(/LIKE/gi, 'ILIKE'); // Case-insensitive LIKE
    }

    return { query, values };
  }

  /**
   * Direct access to Knex for new code
   */
  getKnex() {
    return this.knex;
  }

  /**
   * Close connection
   */
  close(callback) {
    this.knex.destroy()
      .then(() => callback && callback())
      .catch(err => callback && callback(err));
  }
}

const wrappedDb = new KnexWrapper(knexInstance);

// Test connection on load
knexInstance.raw('SELECT 1')
  .then(() => {
    console.log(`✅ Database connected via Knex (${environment === 'production' ? 'PostgreSQL/Supabase' : 'SQLite'})`);
  })
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
  });

module.exports = wrappedDb;
