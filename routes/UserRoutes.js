const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { isAuthenticated } = require('../middleware/auth');
const csrfProtection = require('../middleware/csrfProtection');

// Ensure authController methods are functions
router.get('/login', csrfProtection, UserController.getLoginPage);
router.get('/signup', csrfProtection, UserController.getSignupPage);
router.post('/login', csrfProtection, UserController.postLogin);
router.post('/signup', csrfProtection, UserController.postSignup);
router.get('/logout', isAuthenticated, UserController.getLogout);

module.exports = router;
