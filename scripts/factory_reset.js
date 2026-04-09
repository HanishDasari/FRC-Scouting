const { query } = require('./src/lib/db');

async function wipe() {
  console.log('Starting full database wipe for fresh competition...');
  try {
    const tables = ['reports', 'drafts', 'matches', 'live_reports', 'live_matches'];
    for (const table of tables) {
      console.log(`Wiping ${table}...`);
      await query(`DELETE FROM ${table}`);
    }
    console.log('Successfully wiped all competition data. System is now clean.');
    process.exit(0);
  } catch (err) {
    console.error('Wipe failed:', err);
    process.exit(1);
  }
}

wipe();
