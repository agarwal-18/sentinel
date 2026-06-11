const express = require('express');
const router = express.Router();

const { getUserMonitors } = require('../controllers/statusPage');

router.get('/:username', getUserMonitors);

module.exports = router;