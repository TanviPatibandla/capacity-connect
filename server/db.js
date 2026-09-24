import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialData } from './data/initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'data', 'db.json');

// Ensure directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Load or initialize DB
let dbData = null;

function loadDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      dbData = JSON.parse(raw);
    } catch (e) {
      console.warn('Corrupt DB file detected, re-seeding with initial data...');
      dbData = JSON.parse(JSON.stringify(initialData));
      saveDb();
    }
  } else {
    dbData = JSON.parse(JSON.stringify(initialData));
    saveDb();
  }
  return dbData;
}

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
}

// Initialize on load
loadDb();

export const db = {
  get: () => dbData,
  save: () => saveDb(),
  reset: () => {
    dbData = JSON.parse(JSON.stringify(initialData));
    saveDb();
    return dbData;
  }
};
