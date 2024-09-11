exports.isAuthenticated = (req, res, next) => {
    console.log('Session this in the isAuthenticated function:', req.session);
    if (req.session && req.session.user) {
        req.user = req.session.user; // Attach user info from session
        return next(); // Proceed to the next middleware or route handler
    }
    console.log("the isAuthenticated is printed and not gone in the if block")
    // Redirect to login if not authenticated
    // Ensure the login route is not protected by the same middleware
    const requestedUrl = req.originalUrl.toLowerCase();

    if (requestedUrl === '/auth/login') {
        return next(); // Allow access to login page
    }
    res.redirect('/auth/login'); // Redirect to login if not authenticated
};

// Middleware to check user role
exports.hasRole = (role) => (req, res, next) => {
    if (req.user && req.user.role === role) {
        return next(); // Proceed if user has the required role
    }
    res.status(403).send('Forbidden'); // Send forbidden response if role does not match
};



