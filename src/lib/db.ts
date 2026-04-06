import mysql from 'mysql2/promise';
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
  // Use a more robust connection config for TiDB Cloud
  pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: true
    }
  });
}

export async function query(text: string, params: any[] = []) {
  // Common placeholders: replace $1, $2 with ? for MySQL and SQLite
  let sql = text.replace(/\$\d+/g, '?');
  const queryParams = params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);

  if (isDev) {
    sql = sql.replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT');
    
    if (sql.includes('CREATE TABLE')) {
      localDb.exec(sql);
      return { rows: [] };
    }

    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');

    try {
      const stmt = localDb.prepare(sql);
      if (isSelect) {
        const rows = stmt.all(...queryParams);
        const boolFields = ['hasHang', 'hasVision', 'hasMajorIssues'];
        rows.forEach((row: any) => {
          boolFields.forEach(f => {
            if (row[f] !== undefined) row[f] = row[f] === 1;
          });
        });
        return { rows };
      } else {
        const info = stmt.run(...queryParams);
        return { rows: [], rowCount: info.changes };
      }
    } catch (err) {
      console.error('SQLite Error:', err);
      throw err;
    }
  } else {
    try {
      sql = sql.replace(/SERIAL PRIMARY KEY/g, 'INT AUTO_INCREMENT PRIMARY KEY');
      // MySQL uses backticks instead of double quotes for identifiers
      sql = sql.replace(/"([^"]+)"/g, '`$1`');
      
      const [rows, fields] = await pool.query(sql, queryParams);
      
      // Handle the case where initDB might return nothing or multiple results
      const results = Array.isArray(rows) ? rows : [rows];
      
      // Map Boolean-like TINYINTs back to actual booleans if needed
      if (Array.isArray(results)) {
        const boolFields = ['hasHang', 'hasVision', 'hasMajorIssues'];
        results.forEach((row: any) => {
          if (row && typeof row === 'object') {
            boolFields.forEach(f => {
              if (row[f] !== undefined) row[f] = !!row[f];
            });
          }
        });
      }

      return { rows: results };
    } catch (err) {
      console.error('MySQL Error:', err);
      throw err;
    }
  }
}

export async function initDB() {
  // Split multiple queries for MySQL if needed, or wrap in a transaction
  // mysql2 pool.query can't do multiple statements by default unless enabled
  const queries = `
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
  `.split(';').filter(q => q.trim().length > 0);

  for (const q of queries) {
    await query(q);
  }
}
