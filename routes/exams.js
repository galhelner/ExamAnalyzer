const express = require('express');
const router = express.Router();
const examsController = require('../controllers/examsController');
const requireAuth = require('../auth/requireAuth');

// delete exam endpoint
router.delete('/:id', examsController.deleteExam);

// edit exam endpoint
router.put('/:id', examsController.editExam);

// get my exams endpoint
router.get('/my-exams', requireAuth, examsController.getMyExams);

// get exam by ID endpoint
router.get('/:id', requireAuth, examsController.getExamById);

// create exam endpoint
router.post('/create-exam', requireAuth, examsController.createExam);

// publish exam endpoint
router.post('/publish-exam', examsController.publishExam);

// finish exam endpoint
router.post('/finish-exam', examsController.finishExam);

// validate exam code endpoint
router.post('/validate-exam-code', requireAuth, examsController.validateExamCode);

// submit exam endpoint
router.post('/submit-exam', requireAuth, examsController.submitExam);

module.exports = router;