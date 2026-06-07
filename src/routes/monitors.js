const express = require('express');
const router = express.Router();
const validateToken = require('../middleware/auth');

const {
    getMonitors,
    getMonitorById,
    createMonitor,
    deleteMonitor
} = require('../controllers/monitors');

router.get('/', validateToken, getMonitors);
router.get('/:id', validateToken, getMonitorById);
router.post('/', validateToken, createMonitor);
router.delete('/:id', validateToken, deleteMonitor);

module.exports = router;