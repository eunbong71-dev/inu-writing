import fs from 'fs';
import path from 'path';
import { query, initDb, isDbConfigured } from './db';

const DATA_DIR = path.join(process.cwd(), 'data');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const TOPIC_FILE = path.join(DATA_DIR, 'topic.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

type Student = {
  name: string;
  id: string;
  division: string;
  isLocked: boolean;
  content: string;
  isSubmitted: boolean;
};

// Ensure data directory exists if DB is not used
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Database helper for KV storage
async function getDbValue(key: string): Promise<any> {
    try {
        await initDb();
        const res = await query('SELECT value FROM app_storage WHERE key = $1', [key]);
        return (res && res.rowCount && res.rowCount > 0) ? res.rows[0].value : null;
    } catch (err) {
        console.error(`DB get error for key "${key}", failing over to file if possible.`, err);
        return null;
    }
}

async function saveDbValue(key: string, value: any) {
    try {
        await initDb();
        await query(`
          INSERT INTO app_storage (key, value)
          VALUES ($1, $2)
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
        `, [key, JSON.stringify(value)]);
    } catch (err) {
        console.error(`DB save error for key "${key}".`, err);
        throw err;
    }
}

// Global get logic - checks for DB first
async function getValue(key: string, file: string, defaultValueIfMissing: any): Promise<any> {
  if (isDbConfigured) {
    const val = await getDbValue(key);
    if (val !== null) return val;
  }
  
  // File fallback
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch (e) {
      console.error(`JSON parse error for ${file}`, e);
    }
  }
  return defaultValueIfMissing;
}

// Global save logic - both DB and File if possible
async function saveValue(key: string, file: string, value: any) {
  if (isDbConfigured) {
    try {
        await saveDbValue(key, value);
    } catch (err) {
        console.error(`DB save failed for ${key}, but will attempt file save.`, err);
    }
  }
  
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(value, null, 2), 'utf-8');
}

export async function getStudents(): Promise<Student[]> {
  return await getValue('students', STUDENTS_FILE, []);
}

export async function saveStudents(students: Student[]) {
  await saveValue('students', STUDENTS_FILE, students);
}

export async function getTopic(): Promise<string> {
  const data = await getValue('topic', TOPIC_FILE, { topic: "자율 글쓰기 영역" });
  return data.topic;
}

export async function saveTopic(topic: string) {
  await saveValue('topic', TOPIC_FILE, { topic });
}

export async function getAdminPassword(): Promise<string> {
  const data = await getValue('admin', ADMIN_FILE, { password: "bong0925" });
  return data.password;
}

export async function saveAdminPassword(password: string) {
  await saveValue('admin', ADMIN_FILE, { password });
}
