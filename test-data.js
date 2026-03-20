const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const ADMIN_FILE = path.join(DATA_DIR, 'admin.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    console.log("Creating DATA_DIR:", DATA_DIR);
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } else {
    console.log("DATA_DIR exists:", DATA_DIR);
  }
}

function saveAdminPassword(password) {
  ensureDir();
  console.log("Writing to ADMIN_FILE:", ADMIN_FILE);
  fs.writeFileSync(ADMIN_FILE, JSON.stringify({ password }), 'utf-8');
}

function getAdminPassword() {
  if (!fs.existsSync(ADMIN_FILE)) {
    console.log("ADMIN_FILE does not exist");
    return "admin123";
  }
  const data = fs.readFileSync(ADMIN_FILE, 'utf-8');
  console.log("Read data:", data);
  const { password } = JSON.parse(data);
  return password;
}

saveAdminPassword("test_password");
const read = getAdminPassword();
console.log("Final Read Password:", read);
