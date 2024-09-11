const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const {
    getDashboard,
    getCreatePaper,
    postCreatePaper,
    listPapers,
    postGenerateCoupons
} = require('../controllers/superadmin/paperController');
const { uploadCSV } = require('../controllers/superadmin/csvController');
const {
    listUsers,
    getEditUser,
    getCreateUser,
    postCreateUser,
    postEditUser,
    postDeleteUser
} = require('../controllers/superadmin/usersController');
const { isAuthenticated, hasRole } = require('../middleware/auth');

// Set up Multer for file uploads
const upload = multer({ 
    dest: path.join(__dirname, '../../uploads'), 
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
    fileFilter: (req, file, cb) => {
        // Accept only CSV files
        if (file.mimetype === 'text/csv') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type, only CSV is allowed!'), false);
        }
    }
});

// Dashboard
router.get('/dashboard', isAuthenticated, hasRole('superadmin'), getDashboard);

// Paper Routes
router.get('/create-paper', isAuthenticated, hasRole('superadmin'), getCreatePaper);
router.post('/create-paper', isAuthenticated, hasRole('superadmin'), postCreatePaper);
router.get('/papers', isAuthenticated, hasRole('superadmin'), listPapers);
router.post('/generate-coupons/:id', isAuthenticated, hasRole('superadmin'), postGenerateCoupons);

// CSV Upload
router.post('/upload-csv/:id', isAuthenticated, hasRole('superadmin'), upload.single('file'), uploadCSV);

// User Management
router.get('/user_management', isAuthenticated, hasRole('superadmin'), listUsers);

router.get('/create-user', isAuthenticated, hasRole('superadmin'), getCreateUser);


router.post('/create-user', isAuthenticated, hasRole('superadmin'), postCreateUser);// focus on this createUser

router.get('/edit_user/:id', isAuthenticated, hasRole('superadmin'),getEditUser);

router.post('/edit_user/:id', isAuthenticated, hasRole('superadmin'), postEditUser);
router.post('/delete_user/:id', isAuthenticated, hasRole('superadmin'), postDeleteUser);

module.exports = router;
