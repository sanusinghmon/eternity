require('dotenv').config();
const express = require('express');
const path = require('path');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const connectDB = require('./database/connection');
const expressLayout = require('express-ejs-layouts');
const jwt = require('jsonwebtoken');
const isAuthenticated = require('./middleware/auth').isAuthenticated;
const session = require('express-session'); // Import express-session
const MongoStore = require('connect-mongo'); // Optional, if using MongoDB for session storage

const app = express();

// Connect to MongoDB
connectDB();

// Middleware setup
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayout);
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URL + process.env.DB_NAME}), // Optional
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000*60*60*24*7
    } // 1 week
}));

// EJS setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// CSRF protection setup
const csrfProtection = csrf({ cookie: true });

// Apply CSRF protection only to state-changing routes
const applyCsrfProtection = (req, res, next) => {
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        csrfProtection(req, res, () => {
            // Add this logging inside the middleware
            console.log('CSRF Token function applyCsrfProtection:', req.csrfToken ? req.csrfToken() : 'No token');
            console.log('Headers printing in the applyCsrfProtection:', req.headers);

            // Manually set the CSRF token in the cookie if needed
            const csrfToken = req.csrfToken();
            console.log("csrfToken in the server.js file which is putted in the variable csrtToken and sending in the cookie in the function applyCsrfProtection : ",csrfToken);
            res.cookie('_csrf', csrfToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            
            next();
        });
    } else {
        next();
    }
};

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.redirect('/auth/login'); // Redirect to login if token is invalid
            }
            req.user = user;
            next();
        });
    } else {
        const publicRoutes = ['/auth/login','/auth/signup'];
        if (publicRoutes.includes(req.originalUrl.toLowerCase())) {
            next(); // Allow access to public routes
        } else {
            res.redirect('/auth/login'); // Redirect to login if no token and not accessing public routes
        }
    }
};

// Middleware to set CSRF token in locals
const setCsrfTokenInLocals = (req, res, next) => {
    // Extract CSRF token from the cookies or headers
    const csrfTokenFromCookies = req.cookies._csrf;
    console.log("_csrf token is got here is get from the request and then saving into the res.locals.csrfToken in the setCsrfTokenInLocals : ", csrfTokenFromCookies); // Output: '5bKJKQ5HpXwYWtqLTTrGmSWq'

    if (csrfTokenFromCookies) {
        res.locals.csrfToken = csrfTokenFromCookies;
    } else {
        res.locals.csrfToken = req.csrfToken ? req.csrfToken() : 'No token';
    }

    next();
};

// Import routes
const superadminRoutes = require('./routes/superadminRoutes');
const adminRoutes = require('./routes/adminRoutes');
const managerRoutes = require('./routes/managerRoutes');
const branchRoutes = require('./routes/branchRoutes');
const webEditorRoutes = require('./routes/webeditorRoutes');
const profileRoutes = require('./routes/profileRoutes');
const manageUsersRoutes = require('./routes/manageUsersRoutes');
const studentRoutes = require('./routes/studentRoutes');
const indexRoutes = require('./routes/indexRoutes');
const UserRoutes = require('./routes/UserRoutes');
const frontendRoutes = require('./routes/frontendRoutes');

// Middleware and route setup
app.use('/superadmin', authenticateJWT, applyCsrfProtection, setCsrfTokenInLocals, superadminRoutes);
app.use('/admin', authenticateJWT, applyCsrfProtection, setCsrfTokenInLocals, adminRoutes);
app.use('/manager', authenticateJWT, applyCsrfProtection, setCsrfTokenInLocals, managerRoutes);
app.use('/branch', authenticateJWT, applyCsrfProtection, setCsrfTokenInLocals, branchRoutes);
app.use('/webeditor', authenticateJWT, applyCsrfProtection, setCsrfTokenInLocals, webEditorRoutes);
app.use('/profile', authenticateJWT, applyCsrfProtection, setCsrfTokenInLocals, profileRoutes);
app.use('/manageUsers', authenticateJWT, applyCsrfProtection, setCsrfTokenInLocals, manageUsersRoutes);
app.use('/student', authenticateJWT, applyCsrfProtection, setCsrfTokenInLocals, studentRoutes);

app.use('/Auth', (req, res, next) => {
    const publicRoutes = ['/auth/login','/auth/signup'];
    if (publicRoutes.includes(req.originalUrl.toLowerCase())) {
        return next(); // Skip authentication check for public routes
    }
    isAuthenticated(req, res, () => {
        authenticateJWT(req, res, next);
    });
}, UserRoutes);

app.use('/', indexRoutes);
app.use('/', frontendRoutes);

// 404 Error handling
app.use((req, res) => {
    res.status(404).render('404', { layout: false });
});

// General error handling
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).render('500', { layout: false });
});

app.use((err, req, res, next) => {
    console.error('Middleware Error:', err); // Logs the error for debugging
    res.status(500).send('Internal Server Error'); // Sends a generic response to the client
});

// Server setup
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
