const User = require('../models/User');
const Exam = require('../models/Exam');

exports.getMyExams = async (req, res) => {
    const userID = req.user.id;
    // TODO: find all exams for the specific user in mongoDB
    // TODO: return them in the response based on the user role
};

exports.createExam = async (req, res) => {
    // get the exam data from the request body
    const { examName, questions } = req.body;

    console.log('user', req.user);

    // create a new exam model instance
    const exam = new Exam({
        title: examName,
        questions: questions.map(q => ({
            description: q.description,
            options: q.answers
        })),
        createdBy: req.user.id,
        examCode: Math.random().toString(36).substring(2, 15), // Generate a random exam code
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
    // TODO: find the exam by ID in mongoDB
    // TODO: analyze the exam data (group by grades)
    // TODO: return the exam data in the response
}

exports.deleteExam = async (req, res) => {
    const examId = req.params.id;
    // TODO: delete the exam by ID in mongoDB
}

exports.editExam = async (req, res) => {
    const examId = req.params.id;
    // TODO: get the updated exam data from the request body
    // TODO: update the exam in mongoDB
}

exports.submitExam = async (req, res) => {
    const examId = req.body.examId;
    const userId = req.user.id;
    // TODO: find the exam by ID in mongoDB
    // TODO: calculate the score based on the submitted answers
    // TODO: update the exam with the user's answers and score
}

exports.validateExamCode = async (req, res) => {
    const examCode = req.body.examCode;
    // TODO: check if the exam code exists in mongoDB
    // TODO: return a response indicating whether the code is valid or not
}

exports.publishExam = async (req, res) => {
    const examId = req.body.examId;
    // TODO: find the exam by ID in mongoDB
    // TODO: update the exam status to 'in_progress'
}

exports.finishExam = async (req, res) => {
    const examId = req.body.examId;
    // TODO: find the exam by ID in mongoDB
    // TODO: update the exam status to 'done'
}