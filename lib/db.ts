import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function query(text: string, params?: any[]) {
  return pool.query(text, params);
}

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS app_storage (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    );
  `);
}

export default pool;
