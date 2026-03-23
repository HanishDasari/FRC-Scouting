import { Pool } from 'pg';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const isDev = process.env.NODE_ENV !== 'production';

let localDb: any;
let pool: any;

if (isDev) {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  localDb = new Database(path.join(dataDir, 'scouting.db'));
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
}

export async function query(text: string, params: any[] = []) {
  if (isDev) {
    let sqliteText = text.replace(/\$\d+/g, '?');
    sqliteText = sqliteText.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT');
    
    if (sqliteText.includes('CREATE TABLE')) {
      localDb.exec(sqliteText);
      return { rows: [] };
    }

    const sqliteParams = params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);
    const isSelect = sqliteText.trim().toUpperCase().startsWith('SELECT');

    try {
      const stmt = localDb.prepare(sqliteText);
      if (isSelect) {
        const rows = stmt.all(...sqliteParams);
        const boolFields = ['hasHang', 'hasVision', 'hasMajorIssues'];
        rows.forEach((row: any) => {
          boolFields.forEach(f => {
            if (row[f] !== undefined) row[f] = row[f] === 1;
          });
        });
        return { rows };
      } else {
        const info = stmt.run(...sqliteParams);
        return { rows: [], rowCount: info.changes };
      }
    } catch (err) {
      console.error('SQLite Error:', err);
      throw err;
    }
  } else {
    const client = await pool.connect();
    try {
      return await client.query(text, params);
    } finally {
      client.release();
    }
  }
}

export async function initDB() {
  await query(`
    CREATE TABLE IF NOT EXISTS matches (
      id SERIAL PRIMARY KEY,
      "matchNumber" INTEGER UNIQUE,
      teams TEXT
    );
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      status TEXT,
      "scouterName" TEXT,
      "teamNumber" INTEGER,
      "matchNumber" INTEGER,
      "gameStrategy" TEXT,
      "drivetrainType" TEXT,
      "robotWeight" TEXT,
      "scoringRange" TEXT,
      "storageCapacity" TEXT,
      "outtakeType" TEXT,
      "driverExperience" TEXT,
      "autoDescription" TEXT,
      "autoStartPositions" TEXT,
      "autoAccuracy" TEXT,
      "hasHang" BOOLEAN,
      "shootingAccuracy" TEXT,
      "cycleTime" TEXT,
      "intakeType" TEXT,
      "avgFuelScored" TEXT,
      "hasVision" BOOLEAN,
      "hasMajorIssues" BOOLEAN,
      "commonIssue" TEXT,
      "createdAt" TEXT
    );
    CREATE TABLE IF NOT EXISTS drafts (
      id TEXT PRIMARY KEY,
      status TEXT,
      "scouterName" TEXT,
      "teamNumber" INTEGER,
      "matchNumber" INTEGER,
      "gameStrategy" TEXT,
      "drivetrainType" TEXT,
      "robotWeight" TEXT,
      "scoringRange" TEXT,
      "storageCapacity" TEXT,
      "outtakeType" TEXT,
      "driverExperience" TEXT,
      "autoDescription" TEXT,
      "autoStartPositions" TEXT,
      "autoAccuracy" TEXT,
      "hasHang" BOOLEAN,
      "shootingAccuracy" TEXT,
      "cycleTime" TEXT,
      "intakeType" TEXT,
      "avgFuelScored" TEXT,
      "hasVision" BOOLEAN,
      "hasMajorIssues" BOOLEAN,
      "commonIssue" TEXT,
      "updatedAt" TEXT
    );
    CREATE TABLE IF NOT EXISTS live_matches (
      id SERIAL PRIMARY KEY,
      "matchNumber" INTEGER UNIQUE,
      "time" TEXT,
      "qualRound" TEXT,
      teams TEXT
    );
    CREATE TABLE IF NOT EXISTS live_reports (
      id TEXT PRIMARY KEY,
      "scouterName" TEXT,
      "teamNumber" INTEGER,
      "matchNumber" INTEGER,
      scored INTEGER,
      "autonScored" INTEGER,
      "hasHang" BOOLEAN,
      comments TEXT,
      "createdAt" TEXT
    );
  `);
}
