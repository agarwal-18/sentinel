const pool = require('../db/index');
const { calculateMonitorStats } = require('../services/monitorService');


async function getUserMonitors(req, res) {
    
    try {
        const username = req.params.username;
        const userRecord = await pool.query(`
            SELECT id FROM users
            WHERE username = $1`,
            [username]
        );
        if (userRecord.rowCount === 0) {
            return res.status(404).json({error: 'Invalid username'});
        }

        const latestPing = await pool.query(`
            SELECT DISTINCT ON (monitors.id)
                monitors.id,
                monitors.title,
                monitors.url,
                monitors.is_active,
                pings.is_up,
                pings.latency,
                pings.checked_at
            FROM monitors
            LEFT JOIN pings ON pings.monitor_id = monitors.id
            WHERE monitors.user_id = $1
            ORDER BY monitors.id, pings.checked_at DESC
            `, [userRecord.rows[0].id]
        );
        
        const userMonitorRecords = [];

        for (const monitor of latestPing.rows) {
            const monitorId = monitor.id;
            const monitorStats = await calculateMonitorStats(monitorId);
            const monitorRecord = {...monitor, ...monitorStats};
            userMonitorRecords.push(monitorRecord);
        }
        return res.status(200).json({ monitors: userMonitorRecords });
    }
    catch (err) {
        return res.status(500).json({error: err.message});
    }
}

module.exports = { getUserMonitors };