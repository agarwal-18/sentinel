const express = require('express');
require('dotenv').config();
const pool = require('./src/db/index');
const auth = require('./src/routes/auth');
const monitor = require('./src/routes/monitors');
const statusPage = require('./src/routes/statusPage');
const cors = require('cors');

require('./src/jobs/pingMonitors');

const app = express();

const allowedOrigins = [
    'http://localhost:5173', 
    process.env.FRONTEND_URL 
]

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}))

app.use(cors());
app.use(express.json());

app.use('/auth', auth);
app.use('/monitors', monitor);
app.use('/status', statusPage);

app.get('/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()')
        return res.status(200).json({ connected: true, result: result.rows[0] })
    }
    catch (err) {
        return res.status(500).json({ connected: false, error: err.message })
    }
})

app.listen(process.env.PORT, () => {
    console.log(`Sentinel running on port ${process.env.PORT}`);
});