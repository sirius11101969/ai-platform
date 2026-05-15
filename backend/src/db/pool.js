const { Pool } = require('pg')

const databaseUrl = process.env.DATABASE_URL

const pool = new Pool(
  databaseUrl
    ? { connectionString: databaseUrl }
    : {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: Number(process.env.POSTGRES_PORT || 5432),
        database: process.env.POSTGRES_DB || 'aibot',
        user: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'password',
      }
)

module.exports = pool
