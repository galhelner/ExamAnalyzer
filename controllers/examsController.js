const User = require('../models/User');
const Exam = require('../models/Exam');

/* return basic exam data for the frontend.
    this includes the exam title, status(for teachers), date, time, grade(students).
    for teachers: return the status and the date time of creation.
    for students: return the grade and the date time of submission.
*/
exports.getMyExams = async (req, res) => {
    try {
        const userID = req.user.id;
        const userRole = req.user.role;

        if (userRole === 'teacher') {
            // Find all exams created by the teacher, but only select the fields we need.
            // .lean() returns plain JS objects, which is faster.
            const exams = await Exam.find({ createdBy: userID })
                .select('title createdAt status')
                .lean();

            // Map the data to the format the frontend expects.
            const formattedExams = exams.map(exam => ({
                id: exam._id,
                title: exam.title,
                status: exam.status,
                date: new Date(exam.createdAt).toLocaleDateString(),
                time: new Date(exam.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }));

            return res.status(200).json({ success: true, data: formattedExams });
        }

        if (userRole === 'student') {
            // Find exams where the student has a submission.
            // The projection {'submittions.$': 1} efficiently returns only the matching submission.
            const exams = await Exam.find(
                { 'submittions.userId': userID },
                { title: 1, 'submittions.$': 1 }
            ).lean();

            // Map the data to the format the frontend expects.
            const formattedExams = exams.map(exam => {
                const submission = exam.submittions[0]; // The '$' operator returns only one
                return {
                    id: exam._id,
                    title: exam.title,
                    grade: submission.score,
                    date: new Date(submission.submittedAt).toLocaleDateString(),
                    time: new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
            });

            return res.status(200).json({ success: true, data: formattedExams });
        }
    } catch (error) {
        console.error('Error fetching my exams:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching exams.' });
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
            options: q.answers,
            points: q.points
        })),
        createdBy: req.user.id,
        examCode: Math.floor(100000 + Math.random() * 900000), // Generate a random exam code
        status: 'private'
    });

    try {
        const savedExam = await exam.save();
        res.status(201).json({ success: true, message: 'Exam created successfully!', examId: savedExam._id });
    } catch (err) {
        console.error('Error creating exam:', err);
        res.status(500).json({ success: false, message: 'Failed to create exam.' });
    }
};

exports.getExamById = async (req, res) => {
    const examId = req.params.id;
    const userID = req.user.id;
    const userRole = req.user.role;
   
    const exam = await Exam.findById(examId)
        .populate('createdBy', 'fullName email') // Populate teacher info
        .populate('submittions.userId', 'fullName email'); // Populate student info

    if (!exam) {
        return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    if (userRole === 'student') {
        // remove all submittions except the one from the current user
        exam.submittions = exam.submittions.filter(submission => submission.userId._id.toString() === userID);
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
    const { examData } = req.body;

    try {
        // check if exam exists and user owns it
        const exam = await Exam.findById(examId);
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found.' });
        }

        // Only allow editing of private exams
        if (exam.status !== 'private') {
            return res.status(400).json({ success: false, message: 'Only private exams can be edited.' });
        }

        // Only update specific fields, preserving important metadata
        const updateData = {
            title: examData.title,
            questions: examData.questions.map(q => ({
                description: q.description,
                options: q.answers, // Convert answers to options for storage
                points: q.points
            }))
        };

        await Exam.updateOne({ _id: examId }, updateData);
        res.status(200).json({ success: true, message: 'Exam updated successfully!' });
    } catch (err) {
        console.error('Error updating exam:', err);
        res.status(500).json({ success: false, message: 'Failed to update exam.' });
    }
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