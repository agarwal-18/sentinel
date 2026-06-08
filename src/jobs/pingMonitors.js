const pool = require('../db/index')
const axios = require('axios');
const cron = require('node-cron');

async function pingMonitor(monitor) {
    try {
        const start = Date.now();
        const ping = await axios.get(monitor.url);
        const end = Date.now();
        const latency = end - start;
        await pool.query('INSERT INTO pings (monitor_id, is_up, status_code, latency) VALUES ($1, $2, $3, $4)', [monitor.id, true, ping.status, latency]);
    }
    catch (err) {
        await pool.query('INSERT INTO pings (monitor_id, is_up, status_code, error_log) VALUES ($1, $2, $3, $4)', [monitor.id, false, null, err.message]);
    }
}

async function pingAllMonitors() {
    try {
        const activeMonitors = await pool.query('SELECT id, url FROM monitors WHERE is_active = $1', [true]);
        for (const monitor of activeMonitors.rows) {
            await pingMonitor(monitor);
        }
    }
    catch (err) {
        return {error: err.message};
    }
}

cron.schedule('* * * * *', () => {
    pingAllMonitors();
})