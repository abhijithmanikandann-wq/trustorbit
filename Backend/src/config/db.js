import pg from 'pg';

const { Pool } = pg;

let pool;

function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is missing. Add it to Backend/.env.');
    }

    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  return pool;
}

export async function connectDatabase() {
  await getPool().query('SELECT 1');
  console.log('PostgreSQL database connected');
}

export function query(text, parameters) {
  return getPool().query(text, parameters);
}

export async function closeDatabase() {
  if (pool) await pool.end();
}
