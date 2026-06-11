const pool = require('../db/index');
const { calculateMonitorStats } = require('../services/monitorService');

async function verifyMonitor(monitorId, userId) {
    
    const monitor = await pool.query(`
        SELECT id FROM monitors
        WHERE id = $1 AND user_id = $2`,
        [monitorId, userId]
    );
    return monitor.rowCount;
}

async function getPings(req, res) {
    try {
        const monitor = await verifyMonitor(req.params.id, req.user.userId);
        if (monitor === 0) return res.status(404).json({ error: 'Monitor not found.' });
        
        const pingRecord = await pool.query(`
            SELECT * FROM pings
            WHERE monitor_id = $1
            `, [req.params.id]
        );

        if (pingRecord.rowCount === 0) return res.status(200).json({pings: []});
        return res.status(200).json({pings: pingRecord.rows});
    }
    catch (err) {
        return res.status(500).json({error: err.message});
    }
}

async function getUptime(req, res) {
    try {
        const monitor = await verifyMonitor(req.params.id, req.user.userId);
        if (monitor === 0) return res.status(404).json({ error: 'Monitor not found.' });
        
        const result =  await calculateMonitorStats(req.params.id);
        return res.status(200).json({ uptime: result });
    }

    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = { getPings, getUptime };
