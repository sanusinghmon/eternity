const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const branchController = require('../controllers/branchController');

// Branch Dashboard Route
router.get('/dashboard', isAuthenticated, hasRole('branch'), branchController.getDashboard);

module.exports = router;
