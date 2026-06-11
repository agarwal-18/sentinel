const pool = require('../db/index');
const { verifyMonitor } = require('../services/monitorService');

async function getMonitors(req, res) {
    try {
        const monitors = await pool.query(`
            SELECT id, title, url, is_active, created_at 
            FROM monitors 
            WHERE user_id = $1
            `, [req.user.userId]
        );

        if (monitors.rowCount === 0) return res.status(200).json({ monitors: [] });
        return res.status(200).json({ monitors: monitors.rows });
    }
    catch (err) {
        return res.status(500).json({error: err.message});
    }
}

async function getMonitorById(req, res) {
    try {
        const monitors = await verifyMonitor(req.user.userId, req.params.id);
        if (monitors.rowCount === 0) return res.status(404).json({error: 'Monitor not found!'});
        return res.status(200).json({ monitors: monitors.rows[0] });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function createMonitor(req, res) {
    try {
        const { title, url } = req.body;
        await pool.query(`
            INSERT INTO monitors (user_id, title, url) 
            VALUES ($1, $2, $3)
            `, [req.user.userId, title, url]
        );

        return res.status(201).json({message: 'Monitor created successfully.'})
    }
    catch (err) {
        return res.status(500).json({error: err.message});
    }
}

async function deleteMonitor(req, res) {
    try {
        const result = await pool.query(`
            DELETE FROM monitors 
            WHERE id = $1 AND user_id = $2
            `, [req.params.id, req.user.userId]
        );

        if (result.rowCount > 0) return res.status(200).json({ message: 'Monitor deleted successfully.' });
        return res.status(404).json({ error: 'Monitor does not exist.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function toggle(req, res) {
    try {
        const monitor = await verifyMonitor(req.user.userId, req.params.id);
        if (monitor.rowCount === 0) return res.status(404).json({ message: 'Monitor does not exist.' });

        const toggleMonitorStatus = await pool.query(`
            UPDATE monitors
            SET is_active = NOT is_active
            WHERE id = $1
            `, [req.params.id]
        );

        const newState = !monitor.rows[0].is_active;
        
        return res.status(200).json({ message: `Monitor ${newState ? 'activated' : 'paused'} successfully.` });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    getMonitors,
    getMonitorById,
    createMonitor,
    deleteMonitor,
    toggle
}