const User = require('../models/User');
const Exam = require('../models/Exam');

exports.getMyExams = async (req, res) => {
    const userID = req.user.id;
    // TODO: find all exams for the specific user in mongoDB
    // TODO: return them in the response based on the user role
};

exports.createExam = async (req, res) => {
    // TODO: get the exam data from the request body
    // TODO: create a new exam in mongoDB
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