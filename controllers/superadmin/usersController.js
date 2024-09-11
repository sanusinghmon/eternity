const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const csrf = require('csurf')
const cookieParser = require('cookie-parser')


const setCsrfTokenInLocals = (req, res,) => {
    // If CSRF token is available in the headers, extract it
    //const csrfTokenFromHeaders = req.headers['csrf-token'] || req.cookies._csrf;
    
    const cookieString = req.headers.cookie;

    const cookies = cookieString.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=').map(c => c.trim());
    if (key && value) {
        acc[key] = value;
    }
    return acc;
    }, {});

   const csrfTokenFromHeaders = cookies['_csrf'];

   console.log("_csrf token is gotted here in the superadmin folder in the usersController and the function setCsrfTokenInLocals triggered from the getCreateUser : ",csrfTokenFromHeaders); // Output: '5bKJKQ5HpXwYWtqLTTrGmSWq'

    if (csrfTokenFromHeaders) {
        console.log("Print this if block condition true ,,,,file in the supadmin folder in the usersController.")
        res.locals.csrfToken = csrfTokenFromHeaders;
    } else {
        res.locals.csrfToken = req.csrfToken ? req.csrfToken() : 'No token';
    }

   // next();
   return csrfTokenFromHeaders
};

// List all users
exports.listUsers = async (req, res, next) => {
    try {
        console.log("user is printed in the listUsers function in the usersController's of superadmin upper one.....")
        const user = req.user; // Get user from JWT payload
        console.log("user is printed in the listUsers function in the usersController's of superadmin",user)
        if (!user || user.role !== 'superadmin') {
            return res.status(403).send('Forbidden');
        }
        const csrfTokenKey = setCsrfTokenInLocals(req,res);
        console.log("The csrfTokenKey in the listUsers function in the usersController's superadmin, url --> http://localhost:9080/superadmin/user_management : ",csrfTokenKey)
        const users = await User.find();
        res.render('superadmin/user_management', {
            layout: 'superadmin/layout',
            users,
            user,
            //csrfToken: req.csrfToken // Pass CSRF token to the view
            
            csrfToken : csrfTokenKey
        });
    } catch (err) {
        next(err);
    }
};

exports.getEditUser = async (req, res, next) => {
    try {
        const userId = req.params.id; // Assuming the user ID is passed as a URL parameter
        const targetUser = await User.findById(userId);

        if (!targetUser) {
            return res.status(404).send('User not found');
        }
        
        const csrfTokenKey = setCsrfTokenInLocals(req, res); // Assuming this function sets the CSRF token
        res.render('superadmin/edit_user', {
            layout: 'superadmin/layout', // Specifying layout
            user: targetUser, // Pass the targetUser object as 'user' to match the template's expectations
            csrfToken: csrfTokenKey // Pass the CSRF token
        });
    } catch (err) {
        console.error('Error in getEditUser controller:', err);
        next(err);
    }
};

// Render create user form
exports.getCreateUser = (req, res) => {
    const user = req.user; // Get user from JWT payload
    if (!user || user.role !== 'superadmin') {
        return res.status(403).send('Forbidden');
    }
    const csrfTokenKey = setCsrfTokenInLocals(req,res);
    res.render('superadmin/create_user', {
        layout: 'superadmin/layout',
        //csrfToken: req.csrfToken // Pass CSRF token to the view
        csrfToken:csrfTokenKey
    });
};

// Handle create user form submission
exports.postCreateUser = async (req, res, next) => {
    const { username, password, role } = req.body;
    try {
        const user = req.user; // Get user from JWT payload
        console.log("the data in the user...",user)
        if (!user || user.role !== 'superadmin') {
            return res.status(403).send('Forbidden');
        }

        // Validate input
        if (!username || !password || !role) {
            return res.status(400).send('Username, password, and role are required');
        }

        // Validate role
        const validRoles = ['admin', 'manager', 'branch', 'user', 'webeditor'];
        if (!validRoles.includes(role)) {
            return res.status(400).send('Invalid role specified');
        }

        // Check for existing user
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the hashed password and role
        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save();

        res.redirect('/superadmin/user_management');
    } catch (err) {
        console.error('Error creating user:', err);
        next(err);
    }
};

// Handle edit user form submission
exports.postEditUser = async (req, res, next) => {
    const { id } = req.params;
    const { username, role } = req.body;
    try {
        const user = req.user; // Get user from JWT payload
        if (!user || user.role !== 'superadmin') {
            return res.status(403).send('Forbidden');
        }

        const targetUser = await User.findById(id);
        if (!targetUser) {
            return res.status(404).send('User not found');
        }

        if (username) targetUser.username = username;
        if (role) targetUser.role = role;

        await targetUser.save();
        res.redirect('/superadmin/user_management');
    } catch (err) {
        console.error('Error updating user:', err);
        next(err);
    }
};

// Handle delete user
exports.postDeleteUser = async (req, res, next) => {
    const { id } = req.params;
    try {
        const user = req.user; // Get user from JWT payload
        if (!user || user.role !== 'superadmin') {
            return res.status(403).send('Forbidden');
        }

        const result = await User.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).send('User not found');
        }

        res.redirect('/superadmin/user_management');
    } catch (err) {
        console.error('Error deleting user:', err);
        next(err);
    }
};
