const Paper = require('../../models/Paper');
const fastcsv = require('fast-csv');
const fs = require('fs');
const Coupon = require('../../models/Coupon')


const setCsrfTokenInLocals = (req, res,) => {
    // If CSRF token is available in the headers, extract it
    //const csrfTokenFromHeaders = req.headers['csrf-token'] || req.cookies._csrf;
    
    const cookieString = req.headers.cookie;

    const cookies = cookieString.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.split('=').map(c => c.trim());
    if (key && value) {
        acc[key] = value;
    }
    return acc;
    }, {});
    const csrfTokenFromHeaders = cookies['_csrf'];

   console.log("_csrf token is gotted here in the superadmin folder in the usersController and the function setCsrfTokenInLocals triggered from the getCreateUser : ",csrfTokenFromHeaders); // Output: '5bKJKQ5HpXwYWtqLTTrGmSWq'

    if (csrfTokenFromHeaders) {
        console.log("Print this if block condition true ,,,,file in the supadmin folder in the usersController.")
        res.locals.csrfToken = csrfTokenFromHeaders;
    } else {
        res.locals.csrfToken = req.csrfToken ? req.csrfToken() : 'No token';
    }

   // next();
   return csrfTokenFromHeaders
};


// Render dashboard
exports.getDashboard = (req, res) => {
    try {
        const user = req.user; // Get user from JWT payload
        if (!user) {
            return res.status(403).send('User not found');
        }
        res.render('Superadmin/dashboard_superadmin', { layout: 'Superadmin/layout', user });
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Server Error' });
    }
};

// Render create paper form
exports.getCreatePaper = (req, res) => {
    const csrfTokenKey = setCsrfTokenInLocals(req,res);
    res.render('Superadmin/create_paper', { 
        layout: 'Superadmin/layout', 
        user: req.user, 
        csrfToken: csrfTokenKey });
};

// Handle create paper form submission
exports.postCreatePaper = async (req, res, next) => {
    const { title, questions } = req.body;
    console.log("Title in the postCreatePaper:", title);
    console.log("Questions in the postCreatePaper:", questions);

    try {
        if (!title || !questions) {
            return res.status(400).send('Title and questions are required');
        }

        // Parse the questions if they are in string format
        let parsedQuestions;
        if (typeof questions === 'string') {
            try {
                parsedQuestions = JSON.parse(questions);
                // If parsedQuestions is an array of strings, parse each string
                console.log("parsedQuestions data in the console  ",parsedQuestions)
                if (Array.isArray(parsedQuestions) && typeof parsedQuestions[0] === 'string') {
                    parsedQuestions = parsedQuestions.map(item => JSON.parse(item));
                }
            } catch (error) {
                console.error("Error parsing questions:", error);
                return res.status(400).send('Invalid questions format');
            }
        } else {
            parsedQuestions = questions;
            console.log("We came up in the else block parsedQuestions : ", parsedQuestions)
        }

        // Ensure parsedQuestions is an array of objects
        parsedQuestions = parsedQuestions.filter(q => typeof q === 'object' && q !== null);

        console.log("Parsed Questions in the postCreatePaper:", parsedQuestions);

        // Validate each question
        const validatedQuestions = parsedQuestions.map((q, index) => {
            if (!q.questionText) {
                console.log("The data received in the q.questionText:", q.questionText);
                throw new Error(`Question ${index + 1}: questionText is required.`);
            }
            if (!q.correctAnswer && q.correctAnswer !== 0) {
                throw new Error(`Question ${index + 1}: correctAnswer is required.`);
            }
            if (!q.options || q.options.length < 2) {
                throw new Error(`Question ${index + 1}: There must be at least two options.`);
            }
            return {
                questionText: q.questionText,
                options: q.options,
                correctAnswer: q.correctAnswer
            };
        });

        const paper = new Paper({ title, questions: validatedQuestions, couponCodes: [] });
        await paper.save();
        res.redirect('/superadmin/papers');
    } catch (err) {
        console.log("We came up in the catch block postCreatePaper:", err.message);
        next(err);
    }
};


// List all papers
exports.listPapers = async (req, res, next) => {
    try {
        const papers = await Paper.find();
        res.render('Superadmin/papers', { 
            layout: 'Superadmin/layout', 
            papers, 
            user: req.user });
    } catch (err) {
        next(err);
    }
};

// Handle coupon generation
exports.postGenerateCoupons = async (req, res, next) => {
    const { id } = req.params;
    const { numCoupons } = req.body;
    console.log("the id of the coupon controller  ",id)
    console.log("the numCoupons of the coupon controller  ",numCoupons)
    try {
        if (!numCoupons || isNaN(numCoupons) || numCoupons <= 0) {
            return res.status(400).send('Invalid number of coupons');
        }

        const paper = await Paper.findById(id);
        if (!paper) {
            return res.status(404).send('Paper not found');
        }

        const existingCoupons = new Set(paper.couponCodes);
        for (let i = 0; i < numCoupons; i++) {
            let couponCode;
            do {
                couponCode = `COUPON-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            } while (existingCoupons.has(couponCode)); // Ensure unique coupon codes
            paper.couponCodes.push(couponCode);
            existingCoupons.add(couponCode);
        }
        console.log("What we got into the paper  :   ",paper)
        await paper.save();
        const {_id,title,couponCodes} = paper;
        //const couponCodesString = JSON.stringify(couponCodes); // or use join(',');

        const newCoupon = new Coupon({
            code: couponCodes,
            paperId: _id, // replace with actual paper ID
            paperName: title, // replace with actual paper name
                            
        });

        const savedCoupon = await newCoupon.save();
        console.log('Coupon saved:', savedCoupon);


        res.redirect('/superadmin/papers');
    } catch (err) {
        next(err);
    }
};
