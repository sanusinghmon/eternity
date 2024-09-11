const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
//const User = require('../models/User')

exports.getDashboard = (req, res) => {
    try {
        const token = req.cookies.token; // Extract the token from cookies
        if (!token) {
            return res.status(401).redirect('/auth/login'); // Redirect to login if token is missing
        }


        const decoded = jwt.verify(token,JWT_SECRET);
        console.log('Decoded token:', decoded)

        const user = decoded;
        if(!user){
            return res.status(403).send('User not found in token')
        }

        // Verify the token
        //jwt.verify(token, JWT_SECRET, (err, decoded) => {
            //if (err) {
                //console.error('Token verification error:', err);
                //return res.status(401).redirect('/auth/login'); // Redirect to login if token verification fails
            //}

            // Find the user by ID from the decoded token
            //User.findById(decoded.id, (err, user) => {
                //if (err || !user) {
                    //console.error('User not found:', err);
                    //return res.status(401).redirect('/auth/login'); // Redirect to login if user not found
                //}

                // Render dashboard view with user data
                res.render('webeditor/dashboard_webeditor', { layout: 'webeditor/layout', user });
            //});
        //});
    } catch (err) {
        //console.error('Dashboard error:', err);
        //res.status(500).render('error', { message: 'Server Error' }); // Render a 500 error page if something goes wrong

        console.error('Error during dashboard access:', err);

        if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
            return res.status(401).redirect('/auth/login'); // Unauthorized if token is expired or invalid
        }

        res.status(500).render('error', { message: 'Server Error' });
    }
};
