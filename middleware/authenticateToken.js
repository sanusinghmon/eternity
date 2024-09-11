const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) return res.redirect('/Auth/login');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id); // Attach the user to the request
        next();
    } catch (err) {
        res.redirect('/Auth/login');
    }
};

module.exports = authenticateToken;
