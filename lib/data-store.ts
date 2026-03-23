import { query, initDb } from './db';

type Student = {
  name: string;
  id: string;
  division: string;
  isLocked: boolean;
  content: string;
  isSubmitted: boolean;
};

// Internal helper to get a value by key
async function getValue(key: string, defaultValue: any): Promise<any> {
  await initDb();
  const res = await query('SELECT value FROM app_storage WHERE key = $1', [key]);
  if (res.rowCount === 0) {
    return defaultValue;
  }
  return res.rows[0].value;
}

// Internal helper to save a value by key
async function saveValue(key: string, value: any) {
  await initDb();
  await query(`
    INSERT INTO app_storage (key, value)
    VALUES ($1, $2)
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
  `, [key, JSON.stringify(value)]);
}

export async function getStudents(): Promise<Student[]> {
  return getValue('students', []);
}

export async function saveStudents(students: Student[]) {
  await saveValue('students', students);
}

export async function getTopic(): Promise<string> {
  const data = await getValue('topic', { topic: "자율 글쓰기 영역" });
  return data.topic;
}

export async function saveTopic(topic: string) {
  await saveValue('topic', { topic });
}

export async function getAdminPassword(): Promise<string> {
  const data = await getValue('admin', { password: "admin123" });
  return data.password;
}

export async function saveAdminPassword(password: string) {
  await saveValue('admin', { password });
}
