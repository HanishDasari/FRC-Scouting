const mysql = require('mysql2/promise');

// This script wipes the database for a fresh competition.
// It uses the DATABASE_URL environment variable.

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL not found in environment.");
    process.exit(1);
  }

  console.log("Connecting to TiDB for full reset...");
  const connection = await mysql.createConnection({
    uri: url,
    ssl: {
      rejectUnauthorized: true
    }
  });

  try {
    const tables = ['reports', 'drafts', 'matches', 'live_reports', 'live_matches'];
    for (const table of tables) {
      console.log(`Clearing ${table}...`);
      await connection.execute(`DELETE FROM ${table}`);
    }
    console.log("SUCCESS: Database is now empty and ready for a fresh competition.");
    process.exit(0);
  } catch (err) {
    console.error("Reset failed:", err);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

run();
