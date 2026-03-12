import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'scouting.db');
const db = new Database(dbPath);

// Initialize Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matchNumber INTEGER UNIQUE,
    teams TEXT
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    status TEXT,
    scouterName TEXT,
    matchNumber INTEGER,
    teamNumber INTEGER,
    autoL1 INTEGER,
    autoL2 INTEGER,
    autoL3 INTEGER,
    autoMiss INTEGER,
    leaveLine INTEGER,
    teleopL1 INTEGER,
    teleopL2 INTEGER,
    teleopL3 INTEGER,
    teleopMiss INTEGER,
    cycleSpeed TEXT,
    driverSkill INTEGER,
    defense INTEGER,
    climbStatus TEXT,
    notes TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS drafts (
    id TEXT PRIMARY KEY,
    status TEXT,
    scouterName TEXT,
    matchNumber INTEGER,
    teamNumber INTEGER,
    autoL1 INTEGER,
    autoL2 INTEGER,
    autoL3 INTEGER,
    autoMiss INTEGER,
    leaveLine INTEGER,
    teleopL1 INTEGER,
    teleopL2 INTEGER,
    teleopL3 INTEGER,
    teleopMiss INTEGER,
    cycleSpeed TEXT,
    driverSkill INTEGER,
    defense INTEGER,
    climbStatus TEXT,
    notes TEXT,
    updatedAt TEXT
  );
`);

export default db;
