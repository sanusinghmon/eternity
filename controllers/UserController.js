const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const csrf = require('csurf');

// CSRF protection middleware
const csrfProtection = csrf({ cookie: true });

const JWT_SECRET = process.env.JWT_SECRET; // Ensure JWT_SECRET is defined in your .env file
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; // Default to '1d' if not defined

// Render the login page
exports.getLoginPage = (req, res) => {
    res.render('Auth/login', { layout: false, csrfToken: req.csrfToken() });
};

// Render the signup page
exports.getSignupPage = (req, res) => {
    res.render('Auth/signup', { layout: false, csrfToken: req.csrfToken() });
};

exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        console.log("This is printing the user in the Usercontroller which is the postLogin",user)
        if (!user) {
            console.log(`Login attempt failed: User ${username} not found`);
            return res.render('Auth/login', { error: 'Invalid username or password', layout: false, csrfToken: req.csrfToken() });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.log(`Login attempt failed: Incorrect password for user ${username}`);
            return res.render('Auth/login', { error: 'Invalid username or password', layout: false, csrfToken: req.csrfToken() });
        }

        console.log(`Password match successful for user ${username}`);
        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

        res.cookie('token', token, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 }); // 1 week

        // Save user to session
        req.session.user = { id: user._id, role: user.role };

        console.log(`Login successful: User ${username}, Role: ${user.role}`);// printing the superadmin and rishabh1999
        
        const redirectUrl = {
            'superadmin': '/superadmin/dashboard',
            'admin': '/admin/dashboard',
            'manager': '/manager/dashboard',
            'branch': '/branch/dashboard',
            'webeditor': '/webeditor/dashboard'
        }[user.role.toLowerCase()] || '/';

        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).send('Server Error');
    }
};



// Handle signup
exports.postSignup = async (req, res) => {
    const { username, password } = req.body;
    const user = req.user; // Ensure req.user is set by your authentication middleware
    
    try {
        // Default role to 'user'
        let role = 'user';

        // If the logged-in user is a superadmin, they can assign roles
        if (user && user.role === 'superadmin') {
            role = req.body.role || 'user';
        }

        // Check if username already exists
        const userExists = await User.findOne({ username });

        if (userExists) {
            console.log(`Signup attempt failed: Username ${username} already exists`);
            return res.render('Auth/signup', { error: 'Username already exists', layout: false, csrfToken: req.csrfToken() });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the determined role
        await User.create({ username, password: hashedPassword, role });

        // Log successful signup
        console.log(`User created: ${username}, Role: ${role}`);

        // Redirect to login page
        res.redirect('/Auth/login');
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).send('Error creating user');
    }
};

// Handle logout
exports.getLogout = (req, res) => {
    res.clearCookie('token', { path: '/' }); // Clear JWT cookie
    console.log('User logged out');
    res.redirect('/Auth/login');
};