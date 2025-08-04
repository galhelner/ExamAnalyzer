const User = require('../models/User');
const Exam = require('../models/Exam');

exports.getMyExams = async (req, res) => {
    const userID = req.user.id;
    const userRole = req.user.role;
    
    if (userRole === 'teacher') {
        // find all exams created by the teacher
        const exams = await Exam.find({ createdBy: userID });
        if (!exams || exams.length === 0) {
            return res.status(404).json({ success: false, message: 'No exams found for this teacher.' });
        }
        return res.status(200).json({ success: true, data: exams });
    }

    if (userRole === 'student') {
        // find all exams that the student has submitted
        const exams = await Exam.find({ 'submittions.userId': userID });
        if (!exams || exams.length === 0) {
            return res.status(404).json({ success: false, message: 'No exams found for this student.' });
        }
        return res.status(200).json({ success: true, data: exams });
    }
};

exports.createExam = async (req, res) => {
    // get the exam data from the request body
    const { examName, questions } = req.body;

    // create a new exam model instance
    const exam = new Exam({
        title: examName,
        questions: questions.map(q => ({
            description: q.description,
            options: q.answers
        })),
        createdBy: req.user.id,
        examCode: Math.floor(100000 + Math.random() * 900000), // Generate a random exam code
        status: 'private'
    });

    // save the exam to the database
    await exam.save()
        .then(() => {
            res.status(201).json({ success: true, message: 'Exam created successfully!' });
        })
        .catch(err => {
            console.error('Error creating exam:', err);
            res.status(500).json({ success: false, message: 'Failed to create exam.' });
        });
}

exports.getExamById = async (req, res) => {
    const examId = req.params.id;
    const exam = await Exam.findById(examId).populate('createdBy', 'fullName');
    if (!exam) {
        return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    return res.status(200).json({ success: true, data: exam });
}

exports.deleteExam = async (req, res) => {
    // delete the exam by ID in mongoDB
    const examId = req.params.id;
    const exam = await Exam.findByIdAndDelete(examId);

    if (!exam) {
        return res.status(404).json({ success: false, message: 'Exam not found.' });
    }
    return res.status(200).json({ success: true, message: 'Exam deleted successfully.' });
}

exports.editExam = async (req, res) => {
    const examId = req.params.id;
    const examData = req.body.examData;

    // find the exam by ID in mongoDB and update it
    await Exam.replaceOne({ _id: examId }, examData)
        .then(() => {
            res.status(200).json({ success: true, message: 'Exam updated successfully!' });
        })
        .catch(err => {
            console.error('Error updating exam:', err);
            res.status(500).json({ success: false, message: 'Failed to update exam.' });
        });
}

exports.submitExam = async (req, res) => {
    const examID = req.body.examID;
    const userID = req.user.id;
    const answers = req.body.answers;

    // find the exam by ID in mongoDB
    const exam = await Exam.findById(examID);
    if (!exam) {
        return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    // calculate the score based on the submitted answers
    const score = calculateScore(exam, answers);

    // update the exam with the user's answers and score
    exam.submittions.push({
        userId: userID,
        answers: answers,
        score: score
    });

    await exam.save()
        .then(() => {
            res.status(200).json({ success: true, message: 'Exam submitted successfully!', data: score });
        })
        .catch(err => { 
            console.error('Error submitting exam:', err);
            res.status(500).json({ success: false, message: 'Failed to submit exam.' });
        });
}

function calculateScore(exam, answers) {
    let score = 0;
    const questionsCount = exam.questions.length;
    const questionScore = 100 / questionsCount; // Assuming each question is worth equal points
    exam.questions.forEach((question, index) => {
        if (question.options[answers[index]] === question.options[0]) {
            score += questionScore; // Assuming the first option is the correct answer
        }
    });
    return Math.ceil(score);
}

exports.validateExamCode = async (req, res) => {
    // find the exam by exam code
    const examCode = req.body.examCode;
    const exam = await Exam.findOne({ examCode: examCode });

    // Check if the exam not exists
    if (!exam) {
        return res.status(404).json({ success: false, message: 'Invalid exam code.' });
    }

    // Check if the exam is unavailable
    if (exam.status === 'private' || exam.status === 'done') {
        return res.status(400).json({ success: false, message: 'Exam is unavailable.' });
    }

    // Check if the user has already submitted this exam
    const userID = req.user.id;
    const alreadySubmitted = exam.submittions.some(submission => submission.userId.toString() === userID);
    if (alreadySubmitted) {
        return res.status(400).json({ success: false, message: 'You have already submitted this exam.' });
    }

    // Return the exam ID if the code is valid
    return res.status(200).json({ success: true, message: 'Valid exam code.', data: exam._id });
}

exports.publishExam = async (req, res) => {
    // find the exam by ID in mongoDB
    const examId = req.body.examId;
    const exam = await Exam.findById(examId);

    if (!exam) {
        return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    // update the exam status to 'in_progress'
    exam.status = 'in_progress';
    await exam.save()
        .then(() => {
            res.status(200).json({ success: true, message: 'Exam published successfully!' });
        })
        .catch(err => { 
            console.error('Error publishing exam:', err);
            res.status(500).json({ success: false, message: 'Failed to publish exam.' });
        });
}

exports.finishExam = async (req, res) => {
    // find the exam by ID in mongoDB
    const examId = req.body.examId;
    const exam = await Exam.findById(examId);

    if (!exam) {
        return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    // update the exam status to 'done'
    exam.status = 'done';
    await exam.save()
        .then(() => {
            res.status(200).json({ success: true, message: 'Exam finished successfully!' });
        })
        .catch(err => { 
            console.error('Error finishing exam:', err);
            res.status(500).json({ success: false, message: 'Failed to finish exam.' });
        });
}