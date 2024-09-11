const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const { body } = require('express-validator');
const adminController = require('../controllers/adminController');
const profileRouter = require('./profileRoutes');

// Use the profile and manage users routers
router.use(profileRouter);

// Admin Dashboard
router.get('/dashboard', isAuthenticated, hasRole('admin'), adminController.getDashboard);

// Generate and view test paper URLs
router.get('/generate-url/:id', isAuthenticated, hasRole('admin'), adminController.generateUrl);

// View student coupon usage
router.get('/coupon-usage', isAuthenticated, hasRole('admin'), adminController.getCouponUsage);

// Mark coupon as used
router.post('/mark-coupon-used/:id', isAuthenticated, hasRole('admin'), adminController.markCouponUsed);

// Validate Coupon Code and Collect Student Details
router.get('/enter-coupon/:id', isAuthenticated, hasRole('admin'), adminController.enterCoupon);

router.post('/validate-coupon/:id', [
    body('couponCode').notEmpty().withMessage('Coupon code is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('school').notEmpty().withMessage('School is required')
], adminController.validateCoupon);

module.exports = router;
