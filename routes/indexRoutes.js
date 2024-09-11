const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Route for Superadmin Dashboard
router.get('/superadmin/dashboard', isAuthenticated, hasRole('superadmin'), (req, res) => {
    try {
        const user = req.session.user;
        if (!user) {
            return res.status(403).send('User not found in session');
        }
        res.render('Superadmin/dashboard_superadmin', { layout: 'Superadmin/layout', user });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Server Error' });
    }
});

// Route for Admin Dashboard
router.get('/admin/dashboard', isAuthenticated, hasRole('admin'), (req, res) => {
    try {
        const user = req.session.user;
        if (!user) {
            return res.status(403).send('User not found in session');
        }
        res.render('Admin/dashboard_admin', { layout: 'Admin/layout', user });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Server Error' });
    }
});

// Route for Manager Dashboard
router.get('/manager/dashboard', isAuthenticated, hasRole('manager'), (req, res) => {
    try {
        const user = req.session.user;
        if (!user) {
            return res.status(403).send('User not found in session');
        }
        res.render('Manager/dashboard_manager', { layout: 'Manager/layout', user });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Server Error' });
    }
});

// Route for Branch Dashboard
router.get('/branch/dashboard', isAuthenticated, hasRole('branch'), (req, res) => {
    try {
        const user = req.session.user;
        if (!user) {
            return res.status(403).send('User not found in session');
        }
        res.render('Branch/dashboard_branch', { layout: 'Branch/layout', user });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Server Error' });
    }
});

// Route for Web Editor Dashboard
router.get('/webeditor/dashboard', isAuthenticated, hasRole('webeditor'), (req, res) => {
    try {
        const user = req.session.user;
        if (!user) {
            return res.status(403).send('User not found in session');
        }
        res.render('WebEditor/dashboard_webeditor', { layout: 'WebEditor/layout', user });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Server Error' });
    }
});

module.exports = router;
