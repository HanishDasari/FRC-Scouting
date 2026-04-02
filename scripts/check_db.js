const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'scouting.db');
const db = new Database(dbPath);

console.log("--- Reports Table ---");
try {
  const reports = db.prepare('SELECT id, status, teamNumber, matchNumber, scouterName FROM reports LIMIT 10').all();
  console.log(JSON.stringify(reports, null, 2));
} catch (e) {
  console.log("Error reading reports:", e.message);
}

console.log("\n--- Drafts Table ---");
try {
  const drafts = db.prepare('SELECT id, status, teamNumber, matchNumber, scouterName FROM drafts LIMIT 10').all();
  console.log(JSON.stringify(drafts, null, 2));
} catch (e) {
  console.log("Error reading drafts:", e.message);
}

console.log("\n--- Matches Table ---");
try {
  const matches = db.prepare('SELECT * FROM matches').all();
  console.log(JSON.stringify(matches, null, 2));
} catch (e) {
  console.log("Error reading matches:", e.message);
}
