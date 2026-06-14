const pool = require('../db/index')

async function calculateMonitorStats(monitorId) {
    const result = await pool.query(`
        SELECT
        AVG(latency) as avg_latency,
        COUNT (*) AS total,
        COUNT (*) FILTER (WHERE is_up = $1) AS up_count
        FROM pings
        WHERE monitor_id = $2
        AND checked_at >= NOW() - INTERVAL '90 days'
        `, [true, monitorId]
    );
    const { avg_latency, total, up_count } = result.rows[0];
    if (parseInt(total) === 0) return null;
    
    const uptime = ( parseInt(up_count) / parseInt(total) ) * 100;
    return { 
        latency: parseInt(avg_latency), 
        uptime: parseFloat(uptime.toFixed(2))};
}

async function verifyMonitor(userId, monitorId) {
    const result = await pool.query(`
        SELECT id, title, url, is_active, created_at FROM monitors 
        WHERE monitors.user_id = $1 
        AND monitors.id = $2
        `, [userId, monitorId]
    );
    return result;
}

async function failedPings(monitorId) {
    const result = await pool.query(`
        SELECT checked_at, status_code, error_log
        FROM pings
        WHERE monitor_id = $1 
        AND is_up = false
        AND checked_at >= NOW() - INTERVAL '24 hours'
        ORDER BY checked_at DESC
        LIMIT 50
        `, [monitorId]
    );
    return result;
}

module.exports = { calculateMonitorStats, verifyMonitor, failedPings };