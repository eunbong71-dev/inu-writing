import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

let pool: Pool | null = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });
}

export const isDbConfigured = !!connectionString;

export async function query(text: string, params?: any[]) {
  if (!pool) {
    throw new Error('Database not configured. Set DATABASE_URL environment variable.');
  }
  return pool.query(text, params);
}

export async function initDb() {
  if (!isDbConfigured) return;
  
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS app_storage (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL
      );
    `);
  } catch (err) {
    console.warn('Failed to initialize DB, falling back to local storage behavior if possible.', err);
    throw err;
  }
}

export default pool;
