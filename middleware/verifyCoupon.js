// verifyCoupon.js
const Paper = require('../models/Paper'); // Ensure your model path is correct
const verifyCoupon = async (req, res, next) => {
  console.log("I am in the verifyCoupon............................")
  const { id } = req.params;
  const { coupon } = req.body; // Assume coupon code is submitted via POST
   
  console.log("I am in the verifyCoupon............................")
  try {
    const paper = await Paper.findById(id);

    if (!paper) {
      return res.status(404).render('error', { message: 'Paper not found' });
    }

    // Check if the coupon is valid
    if (!paper.couponCodes.includes(coupon)) {
      return res.status(400).render('Student/coupon', { 
        message: 'Invalid or expired coupon. Please try again.', 
        paperId: id 
      });
    }

    // If coupon is valid, proceed to the next middleware/controller
    console.log("Verify coupon is executed successfully and now it is moved to the next controller")
    next();
  } catch (error) {
    console.error(error);
    res.status(500).render('error', { message: 'Server Error' });
  }
};

module.exports = verifyCoupon;
