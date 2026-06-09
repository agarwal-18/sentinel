const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const {
    registerValidation,
    loginValidation,
    monitorValidation,
    checkValidation
} = require('../middleware/validation');

const {
    register,
    login
} = require('../controllers/auth');


router.post('/register', registerValidation, checkValidation, register);
router.post('/login', loginValidation, checkValidation, login);

module.exports = router;