// Knex.js configuration - supports SQLite (dev) and PostgreSQL (production)
require('dotenv').config();

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './data/komunikator.db'
    },
    useNullAsDefault: true,
    pool: {
      afterCreate: (conn, cb) => {
        conn.run('PRAGMA foreign_keys = ON', cb);
      }
    }
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL + '?sslmode=require',
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './backend/database/migrations'
    }
  }
};
