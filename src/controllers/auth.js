const pool = require('../db/index')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Return user record using email 

async function findUserByEmail(email) {
    return await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
}

// User Registration

async function register(req, res) {
    try {
        const { name, email, password } = req.body;
        const userRecord = await findUserByEmail(email);

        if (userRecord.rowCount > 0) {
            return res.status(400).json({error: 'Email is already in use.'});
        }
            
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)', [name, email, hashedPassword]); 
        return res.status(201).json({message: 'User Registered Successfully.'});
    }
    catch (err) {
        res.status(500).json({error: err.message});
    }
};

// User Login

async function login(req, res) {
    try {
        const { email, password } = req.body;
    
        const userRecord = await findUserByEmail(email);

        if (userRecord.rowCount <= 0) {
            return res.status(400).json({error: 'Email not registered.'});
        }
            
        const storedHash = userRecord.rows[0].password_hash;
        const passwordMatch = await bcrypt.compare(password, storedHash);

        if (passwordMatch) {
            const token = jwt.sign(
                { userId: userRecord.rows[0].id, email: email },
                process.env.JWT_SECRET,
                { expiresIn: '7d'}
            );
            return res.status(200).json({message: 'Login Successful.', token});
        }
            
        return res.status(400).json({error: 'Incorrect Password.'});
    }
    catch (err) {
        res.status(500).json({error: err.message});
    }
}


module.exports = { register, login };