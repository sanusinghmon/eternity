const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.getDashboard = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).redirect('/auth/login'); // Unauthorized if token is missing
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded token:', decoded);

        // Extract user info from the decoded token
        const user = decoded;
        if (!user) {
            return res.status(403).send('User not found in token');
        }

        // Render the dashboard with user information
        res.render('Branch/dashboard_branch', { layout: 'Branch/layout', user });
    } catch (err) {
        console.error('Error during dashboard access:', err);

        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
            return res.status(401).redirect('/auth/login'); // Unauthorized if token is expired or invalid
        }

        res.status(500).render('error', { message: 'Server Error' });
    }
};
