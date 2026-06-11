const express = require('express');
const router = express.Router();
const validateToken = require('../middleware/auth');
const {
    monitorValidation,
    checkValidation
} = require('../middleware/validation');

const {
    getMonitors,
    getMonitorById,
    createMonitor,
    deleteMonitor,
    toggle
} = require('../controllers/monitors');

const {
    getPings,
    getUptime
} = require('../controllers/pings');

const { analysis } = require('../controllers/analysis');




// GET Monitors
router.get('/', validateToken, getMonitors);
router.get('/:id', validateToken, getMonitorById);

// GET Monitor Pings and Uptime
router.get('/:id/pings', validateToken, getPings);
router.get('/:id/uptime', validateToken, getUptime);

// CREATE Monitor
router.post('/', validateToken, monitorValidation, checkValidation, createMonitor);

// PERFORM AI-analysis on Ping History
router.post('/:id/analysis', validateToken, analysis);

// TOGGLE Monitor status
router.patch('/:id/toggle', validateToken, toggle);

// DELETE Monitor
router.delete('/:id', validateToken, deleteMonitor);


module.exports = router;