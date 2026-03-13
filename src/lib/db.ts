import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
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
  `);
}

export default pool;
