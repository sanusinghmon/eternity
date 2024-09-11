const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const managerController = require('../controllers/managerController');

// Manager Dashboard Route
router.get('/dashboard', isAuthenticated, hasRole('manager'), managerController.getDashboard);

module.exports = router;
