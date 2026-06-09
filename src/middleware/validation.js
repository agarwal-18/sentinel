const { body, validationResult } = require("express-validator");

const registerValidation = [
    body('name').notEmpty().withMessage('Name cannot be empty.'),
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required.')
        .isLength({min: 3, max: 20}).withMessage('Username must be 3-20 characters.')
        .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contains letters, numbers, underscores.'),
    body('email')
        .notEmpty().withMessage('Email is required.')
        .isEmail().withMessage('Invalid Email'),
    body('password')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        })  
        .withMessage('Password must be at least 8 characters long and contain uppercase, lowercase, number, special character')
];

const loginValidation = [
    body('email')
        .notEmpty()
        .isEmail().withMessage('Invalid email'),
    body('password')
        .trim() 
        .notEmpty().withMessage('Password is required')
];

const monitorValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required'),
    body('url')
        .notEmpty().withMessage('URL is required')
        .isURL().withMessage('Invalid URL')
    ]

function checkValidation(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty())
        return res.status(400).json({errors: errors.array()});
    next();
}

module.exports = { registerValidation, loginValidation, monitorValidation, checkValidation };
