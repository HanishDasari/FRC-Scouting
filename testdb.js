const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.query('SELECT NOW()')
  .then(res => { console.log("DB SUCCESS:", res.rows[0]); process.exit(0); })
  .catch(err => { console.error("DB ERROR:", err.message); process.exit(1); });
