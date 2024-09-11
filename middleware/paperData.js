const Paper = require('../models/Paper');

module.exports = async (req, res, next) => {
    try {
        const papers = await Paper.find();
        res.locals.papers = papers; // Make papers available in all views
        next();
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Server Error' });
    }
};
