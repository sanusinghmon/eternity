const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.getDashboard = (req, res) => {
    try {
        const token = req.cookies.token; // Extract the token from cookies
        if (!token) {
            return res.status(401).redirect('/auth/login'); // Unauthorized if token is missing
        }

        // Verify the token
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error(err);
                return res.status(401).redirect('/auth/login'); // Unauthorized if token verification fails
            }

            // Extract user info from the decoded token
            const user = decoded;
            if (!user) {
                return res.status(403).send('User not found in token');
            }

            // Render the dashboard with user information
            res.render('Manager/dashboard_manager', { layout: 'Manager/layout', user });
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Server Error' });
    }
};
 