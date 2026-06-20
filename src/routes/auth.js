const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const {
    registerValidation,
    loginValidation,
    monitorValidation,
    checkValidation,
    checkExistingUser
} = require('../middleware/validation');

const {
    register,
    login
} = require('../controllers/auth');


router.post('/register', registerValidation, checkExistingUser, checkValidation, register);
router.post('/login', loginValidation, checkValidation, login);

module.exports = router;