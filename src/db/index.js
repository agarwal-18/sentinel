const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('DATABASE CONNECTION FAILED:', err.message)
    } else {
        console.log('DATABASE CONNECTED SUCCESSFULLY')
        release()
    }
})

module.exports = pool;