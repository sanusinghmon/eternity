const express = require('express');
const router = express.Router();
const Paper = require('../models/Paper');
const Student = require('../models/Student');
const { body, validationResult } = require('express-validator');
const verifyCoupon = require('../middleware/verifyCoupon')

// Route to show the coupon submission page
router.get('/coupon-screen/:id', (req, res) => {
    const { id } = req.params;
    console.log("i am in the router.get('/start-test/:id') in the coupon UI")
    res.render('Student/coupon', { paperId:id , layout: 'Student/layout'});  // , layout: 'Student/layout'
  });

  // Route to verify coupon and proceed to the test
  router.post('/submit-coupon/:id', verifyCoupon, async (req, res) => {
  console.log("i am in the router.get('/start-test/:id') in the coupon UI when we have submitted the coupon")
    const { id } = req.params;
    try {
      const paper = await Paper.findById(id);
      if (!paper) {
        return res.status(404).send('Paper not found');
      }
      console.log("Printing the paper in the student Routes", paper);
      res.render('Student/student_information', { layout: 'Student/layout', paper }); // layout: 'Student/layout',
    } catch (err) {
      console.error(err);
      res.status(500).render('error', { message: 'Server Error' });
    }
  });

  // Route to handle form submission and save student details
router.post('/submit-student-info', async (req, res) => {
  try {

    const {paperId, paperTitle}= req.body;
    console.log(req.body)

    const student = new Student(req.body);
    await student.save();
    // Redirect to the instructions page after saving
    console.log("The _id in the student schema........ ",student._id)
    //res.redirect(`/student/instructions/${student._id}`);
    res.redirect(`/student/instructions/${student._id}?paperId=${paperId}&paperTitle=${encodeURIComponent(paperTitle)}`);
  } catch (err) {
    console.error(err);
    res.status(400).render('Student/student_information', {
      layout: 'Student/layout',
      error: 'Failed to save student information. Please try again.',
      student: req.body // Send back the data to prefill the form in case of error
    });
  }
});

// Route to render the instructions page
router.get('/instructions/:id', async (req, res) => {
  const { id } = req.params;
  const { paperId, paperTitle } = req.query; 
  console.log("the id from req.params printed....... ",id)
  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).send('Student not found');
    }

    const paper = { _id: paperId, title: paperTitle };
    res.render('Student/instructions', { layout: 'Student/layout', student, paper });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server Error' });
  }
});


router.get('/start-test/:id', async (req, res) => {
  const { id } = req.params;
  const { paperId, paperTitle } = req.query; // Get paper details from query params
  console.log("the id from req.params printed....... ", id);
  try {
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).send('Student not found');
    }

    // Construct paper object from query parameters
    //const paper = { _id: paperId, title: paperTitle };

    // Fetch the paper using the paperId
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).send('Paper not found');
    }

    res.render('Student/start_test', { layout: 'Student/layout', student, paper });
  } catch (err) {
    console.error(err);
    res.status(500).render('error', { message: 'Server Error' });
  }
});


// Handle Test Submission
router.post('/submit-test/:id', [
    body('answers').isArray().withMessage('Answers must be an array')
], async (req, res) => {
    const { id } = req.params;
    const { answers } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send('Invalid submission');
    }

    try {
        const paper = await Paper.findById(id);
        if (!paper) {
            return res.status(404).send('Paper not found');
        }

        let score = 0;
        paper.questions.forEach((question, index) => {
            if (question.correctAnswer === answers[index]) {
                score += 1;
            }
        });

        res.send(`Your score is: ${score}/${paper.questions.length}`);
    } catch (err) {
        console.error(err);
        res.status(500).render('error', { message: 'Server Error' });
    }
});

module.exports = router;
