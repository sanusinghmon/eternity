const express = require('express');
const router = express.Router();
const { isAuthenticated, hasRole } = require('../middleware/auth');
const webEditorController = require('../controllers/webeditorController');

// Web Editor Dashboard Route
router.get('/dashboard', isAuthenticated, hasRole('webeditor'), webEditorController.getDashboard);

module.exports = router;
