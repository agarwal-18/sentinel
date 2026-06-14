const express = require('express');
require('dotenv').config();
const pool = require('./src/db/index');
const auth = require('./src/routes/auth');
const monitor = require('./src/routes/monitors');
const statusPage = require('./src/routes/statusPage');
const cors = require('cors');


require('./src/jobs/pingMonitors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', auth);
app.use('/monitors', monitor);
app.use('/status', statusPage);

app.get('/health', async (req, res) => {
    const result = pool.query('SELECT NOW()')
    return res.status(200).json({ connected: true, result: result.rows[0]})
})

app.listen(process.env.PORT, () => {
    console.log(`Sentinel running on port ${process.env.PORT}`);
});