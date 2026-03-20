import fs from 'fs';
import path from 'path';

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

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getStudents(): Student[] {
  ensureDir();
  if (!fs.existsSync(STUDENTS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(STUDENTS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error("Error reading students file", e);
    return [];
  }
}

export function saveStudents(students: Student[]) {
  ensureDir();
  fs.writeFileSync(STUDENTS_FILE, JSON.stringify(students, null, 2), 'utf-8');
}

export function getTopic(): string {
  ensureDir();
  if (!fs.existsSync(TOPIC_FILE)) {
    return "자율 글쓰기 영역";
  }
  try {
    const data = fs.readFileSync(TOPIC_FILE, 'utf-8');
    const { topic } = JSON.parse(data);
    return topic;
  } catch (e) {
    return "자율 글쓰기 영역";
  }
}

export function saveTopic(topic: string) {
  ensureDir();
  fs.writeFileSync(TOPIC_FILE, JSON.stringify({ topic }), 'utf-8');
}

export function getAdminPassword(): string {
  ensureDir();
  if (!fs.existsSync(ADMIN_FILE)) {
    return "admin123"; // Default password
  }
  try {
    const data = fs.readFileSync(ADMIN_FILE, 'utf-8');
    const { password } = JSON.parse(data);
    return password;
  } catch (e) {
    return "admin123";
  }
}

export function saveAdminPassword(password: string) {
  ensureDir();
  fs.writeFileSync(ADMIN_FILE, JSON.stringify({ password }), 'utf-8');
}
