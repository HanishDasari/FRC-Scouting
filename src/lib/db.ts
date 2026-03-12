import Database from 'better-sqlite3';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

const isPostgres = !!process.env.DATABASE_URL;

let sqliteDb: any = null;
let pgPool: Pool | null = null;

if (isPostgres) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbPath = path.join(dataDir, 'scouting.db');
  sqliteDb = new Database(dbPath);
}

const db = {
  async exec(query: string) {
    if (isPostgres && pgPool) {
      await pgPool.query(query);
    } else if (sqliteDb) {
      sqliteDb.exec(query);
    }
  },
  async prepare(query: string) {
    const pgQuery = query.replace(/\?/g, (_, __, offset, fullQuery) => {
      let count = 0;
      for (let i = 0; i < offset; i++) {
        if (fullQuery[i] === '?') count++;
      }
      return `$${count + 1}`;
    });

    return {
      run: async (...params: any[]) => {
        if (isPostgres && pgPool) {
          await pgPool.query(pgQuery, params);
        } else if (sqliteDb) {
          sqliteDb.prepare(query).run(...params);
        }
      },
      all: async (...params: any[]) => {
        if (isPostgres && pgPool) {
          const res = await pgPool.query(pgQuery, params);
          return res.rows;
        } else if (sqliteDb) {
          return sqliteDb.prepare(query).all(...params);
        }
        return [];
      },
      get: async (...params: any[]) => {
        if (isPostgres && pgPool) {
          const res = await pgPool.query(pgQuery, params);
          return res.rows[0];
        } else if (sqliteDb) {
          return sqliteDb.prepare(query).get(...params);
        }
        return null;
      }
    };
  }
};

// Initialize Schema
const initSchema = async () => {
  // Initialize schema only if tables don't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY,
      matchNumber INTEGER,
      teams TEXT
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      status TEXT,
      ourTeamNumber TEXT,
      matchNumber INTEGER,
      teamNumber INTEGER,
      gameStrategy TEXT,
      driveTrain TEXT,
      robotWeight TEXT,
      scoringRange TEXT,
      storageCapacity TEXT,
      outtakeType TEXT,
      driverExperience TEXT,
      autonomousCapabilities TEXT,
      autoStartPositions TEXT,
      autoAccuracy TEXT,
      hasHang TEXT,
      shootingAccuracy TEXT,
      cycleTime TEXT,
      intakeType TEXT,
      avgFuelScored TEXT,
      hasVision TEXT,
      majorIssues TEXT,
      commonIssue TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS drafts (
      id TEXT PRIMARY KEY,
      status TEXT,
      ourTeamNumber TEXT,
      matchNumber INTEGER,
      teamNumber INTEGER,
      gameStrategy TEXT,
      driveTrain TEXT,
      robotWeight TEXT,
      scoringRange TEXT,
      storageCapacity TEXT,
      outtakeType TEXT,
      driverExperience TEXT,
      autonomousCapabilities TEXT,
      autoStartPositions TEXT,
      autoAccuracy TEXT,
      hasHang TEXT,
      shootingAccuracy TEXT,
      cycleTime TEXT,
      intakeType TEXT,
      avgFuelScored TEXT,
      hasVision TEXT,
      majorIssues TEXT,
      commonIssue TEXT,
      updatedAt TEXT
    );
  `);
};

initSchema().catch(err => console.error('Database initialization failed:', err));

export default db;
