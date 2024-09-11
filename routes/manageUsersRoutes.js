const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const {
    isAuthenticated,
    isSuperadmin,
    validateCreateRole,
    hasRole // Import hasRole middleware
} = require('../middleware/auth'); // Update the path to the auth middleware if necessary

const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// Centralized error handler
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
};

// Rest of the routes...

router.get('/manage_roles', isAuthenticated, hasRole('superadmin'), async (req, res, next) => {
    try {
        const users = await User.find();
        res.render('Superadmin/manage_roles', { layout: 'Superadmin/layout', users });
    } catch (err) {
        next(err);
    }
});

router.post('/manage_roles', [
    isAuthenticated,
    hasRole('superadmin'),
    check('username').notEmpty().withMessage('Username is required'),
    check('role').notEmpty().withMessage('Role is required')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('Superadmin/manage_roles', {
            layout: 'Superadmin/layout',
            errors: errors.array()
        });
    }
    const { username, role } = req.body;
    try {
        await User.findOneAndUpdate({ username }, { role });
        res.redirect('/superadmin/manage_roles');
    } catch (err) {
        next(err);
    }
});

// Manage Permissions
router.get('/manage_permissions', isAuthenticated, hasRole('superadmin'), async (req, res, next) => {
    try {
        const users = await User.find();
        const roles = await Role.find();
        res.render('Superadmin/manage_permissions', { layout: 'Superadmin/layout', users, roles });
    } catch (err) {
        next(err);
    }
});

router.post('/manage_permissions', [
    isAuthenticated,
    hasRole('superadmin'),
    check('username').notEmpty().withMessage('Username is required'),
    check('permissions').notEmpty().withMessage('Permissions are required')
], async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('Superadmin/manage_permissions', {
            layout: 'Superadmin/layout',
            errors: errors.array()
        });
    }
    const { username, permissions } = req.body;
    try {
        await User.findOneAndUpdate({ username }, { permissions: permissions.split(',').map(p => p.trim()) });
        res.redirect('/superadmin/manage_permissions');
    } catch (err) {
        next(err);
    }
});

// Error handling middleware
router.use(errorHandler);

module.exports = router;
