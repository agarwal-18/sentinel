const { analyseIncident } = require("../services/aiService");
const { verifyMonitor, failedPings } = require("../services/monitorService");


async function analysis(req, res) {
    try {    
        const monitor = await verifyMonitor(req.user.userId, req.params.id);
        if (monitor.rowCount === 0) return res.status(404).json({ error: 'Monitor not found.' });

        const pings = await failedPings(monitor.rows[0].id);
        if (pings.rowCount === 0) return res.status(200).json({ 
            analysed: false,
            message: 'No failure detected.'
        });

        const result = await analyseIncident(monitor.rows[0].title, pings.rows);

        return res.status(200).json({ 
            analysed: true,
            result });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = { analysis };