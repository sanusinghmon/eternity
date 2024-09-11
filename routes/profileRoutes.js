const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const User = require('../models/User'); // Ensure the correct path to your User model
const { isAuthenticated } = require('../middleware/auth');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/profile_pictures');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${req.session.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ storage });

// Profile view
router.get('/profile', isAuthenticated, csrfProtection, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('profile/view_profile', { layout: 'Admin/layout', user, csrfToken: req.csrfToken() });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Profile edit form
router.get('/profile/edit', isAuthenticated, csrfProtection, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('profile/edit_profile', { layout: 'Admin/layout', user, csrfToken: req.csrfToken() });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Profile update handler
router.post('/profile/edit', isAuthenticated, csrfProtection, upload.single('picture'), async (req, res) => {
    const { email, phone, address } = req.body;
    const updateData = { email, phone, address };

    if (req.file) {
        updateData.picture = req.file.path;
    }

    try {
        const user = await User.findByIdAndUpdate(req.session.user.id, updateData, { new: true });
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
