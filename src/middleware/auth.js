const jwt = require('jsonwebtoken');

function validateToken(req, res, next) {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({error: 'No token provided.'});
    const token = header.split(' ')[1];

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
        next();
    }
    catch {
        res.status(401).json({error: 'Unauthorized user.'})
    }
}

module.exports = validateToken;