const express = require('express');
const router = express.Router();

// Example frontend routes
router.get('/index', (req, res) => {
    res.render('Frontend/index', { layout: false });
});
router.get('/about', (req, res) => {
    res.render('Frontend/about', { layout: false });
});
router.get('/appointment', (req, res) => {
    res.render('Frontend/appointment', { layout: false });
});
router.get('/blog-single', (req, res) => {
    res.render('Frontend/blog-single', { layout: false });
});
router.get('/blog', (req, res) => {
    res.render('Frontend/blog', { layout: false });
});
router.get('/case-details', (req, res) => {
    res.render('Frontend/case-details', { layout: false });
});
router.get('/contact', (req, res) => {
    res.render('Frontend/contact', { layout: false });
});
router.get('/service-single', (req, res) => {
    res.render('Frontend/service-single', { layout: false });
});
router.get('/services', (req, res) => {
    res.render('Frontend/services', { layout: false });
});
router.get('/study-case', (req, res) => {
    res.render('Frontend/study-case', { layout: false });
});
router.get('/faq', (req, res) => {
    res.render('Frontend/faq', { layout: false });
});
router.get('/school-college', (req, res) => {
    res.render('Frontend/school-college', { layout: false });
});
router.get('/individual', (req, res) => {
    res.render('Frontend/individual', { layout: false });
});
router.get('/corporate', (req, res) => {
    res.render('Frontend/corporate', { layout: false });
});

// Export the router
module.exports = router;
