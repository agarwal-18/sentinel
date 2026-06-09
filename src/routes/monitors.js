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
    deleteMonitor
} = require('../controllers/monitors');

const {
    getPings,
    getUptime
} = require('../controllers/pings');

router.get('/', validateToken, getMonitors);
router.get('/:id', validateToken, getMonitorById);
router.post('/', validateToken, monitorValidation, checkValidation, createMonitor);
router.delete('/:id', validateToken, deleteMonitor);

router.get('/:id/pings', validateToken, getPings);
router.get('/:id/uptime', validateToken, getUptime);

module.exports = router;