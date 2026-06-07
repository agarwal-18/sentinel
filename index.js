const express = require('express');
require('dotenv').config();
const pool = require('./src/db/index');
const auth = require('./src/routes/auth');

const app = express();
app.use(express.json());

app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ connected: true, time: result.rows[0].now });
    }
    catch (err) {
        res.status(500).json({connected: false, error: err.message});
        console.log(err);
    }
})

app.use('/auth', auth);

app.listen(process.env.PORT, () => {
    console.log(`Sentinel running on port ${process.env.PORT}`)
})