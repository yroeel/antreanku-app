const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'antreanku_secret_key_2026_super_secure_123!');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Token tidak valid atau kadaluwarsa.' });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Akses dilarang. Role tidak memiliki izin.' });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };