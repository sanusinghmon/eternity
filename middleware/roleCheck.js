// middleware/roleCheck.js
module.exports = (roles) => {
    return (req, res, next) => {
        // Ensure req.user is defined and has a role
        if (!req.user || !req.user.role) {
            return res.status(401).send('Unauthorized');
        }

        // Check if the user's role is in the allowed roles
        if (roles.includes(req.user.role)) {
            return next();
        }

        // If the role is not allowed, send a 403 Forbidden response
        res.status(403).send('Access denied');
    };
};
