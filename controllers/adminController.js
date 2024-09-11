const Paper = require('../models/Paper');
const Coupon = require('../models/Coupon');
const Student = require('../models/Student');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to verify JWT and check user role
const verifyTokenAndRole = (requiredRole) => {
    return (req, res, next) => {
        const token = req.cookies.token;
        if (!token) {
            return res.redirect('/auth/login');
        }
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.error('Token verification failed:', err.message);
                return res.status(401).redirect('/auth/login');
            }
            if (decoded.role !== requiredRole) {
                console.warn(`Access Denied: User role ${decoded.role} does not match required role ${requiredRole}`);
                return res.status(403).send('Access Denied');
            }
            req.user = decoded;
            next();
        });
    };
};

// Admin Dashboard
exports.getDashboard = [
    verifyTokenAndRole('admin'), // Middleware to verify admin role
    async (req, res) => {
        try {
            // Fetch all papers and coupons
            const papers = await Paper.find(); 
            const coupons = await Coupon.find(); 
            
            // Group coupons by paperId
            const groupedCoupons = {};
            coupons.forEach(coupon => {
                if (!groupedCoupons[coupon.paperId]) {
                    groupedCoupons[coupon.paperId] = {
                        paperName: coupon.paperName,
                        coupons: []
                    };
                }
                groupedCoupons[coupon.paperId].coupons.push(coupon);
            });

            res.render('Admin/dashboard_admin', { layout: 'Admin/layout', groupedCoupons, papers });
        } catch (err) {
            console.error(err);
            res.status(500).render('error', { message: 'Server Error' });
        }
    }
];


// Generate and view test paper URLs
exports.generateUrl = [
    verifyTokenAndRole('admin'),  // Middleware to verify admin role
    async (req, res) => {
        const { id } = req.params;
        try {
            const paper = await Paper.findById(id);
            if (!paper) {
                return res.status(404).send('Paper not found');
            }

            const url = `http://${req.get('host')}/student/coupon-screen/${paper._id}`;
            console.log("Paper and all the details in the generateUrl ---->  ",paper);
            res.render('Admin/generate_url', { layout: 'Admin/layout', paper, url });
        } catch (err) {
            console.error(err);
            res.status(500).render('error', { message: 'Server Error' });
        }
    }
];

// View student coupon usage
exports.getCouponUsage = [
    verifyTokenAndRole('admin'),  // Middleware to verify admin role
    async (req, res) => {
        try {
            const coupons = await Coupon.find();
            res.render('Admin/coupon_usage', { layout: 'Admin/layout', coupons });
        } catch (err) {
            console.error(err);
            res.status(500).render('error', { message: 'Server Error' });
        }
    }
];

// Mark coupon as used
exports.markCouponUsed = [
    verifyTokenAndRole('admin'),  // Middleware to verify admin role
    async (req, res) => {
        const { id } = req.params;
        try {
            const coupon = await Coupon.findById(id);
            if (!coupon) {
                return res.status(404).send('Coupon not found');
            }
            coupon.used = true;
            await coupon.save();
            res.redirect('/admin/coupon-usage');
        } catch (err) {
            console.error(err);
            res.status(500).render('error', { message: 'Server Error' });
        }
    }
];

// Validate Coupon Code and Collect Student Details
exports.enterCoupon = (req, res) => {
    const { id } = req.params;
    res.render('Admin/enter_coupon', { layout: 'Admin/layout', paperId: id });
};

exports.validateCoupon = async (req, res) => {
    const { id } = req.params;
    const { couponCode, name, email, school } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).render('Admin/enter_coupon', {
            layout: 'Admin/layout',
            paperId: id,
            errors: errors.array()
        });
    }

    try {
        const paper = await Paper.findById(id);
        if (!paper) {
            return res.status(404).send('Paper not found');
        }

        const coupon = await Coupon.findOne({ code: couponCode });
        if (!coupon || coupon.used) {
            return res.status(403).send('Invalid or already used coupon code');
        }

        const student = new Student({ name, email, school, couponCode });
        await student.save();
        coupon.used = true; // Mark the coupon as used
        await coupon.save();
        res.redirect(`/student/start-test/${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Server Error' });
    }
};
