const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: [
        {
            description: { type: String, required: true },
            options: { type: [String], required: true },
        }
    ],
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    examCode: { type: String, required: true, unique: true },
    status: { type: String, enum: ['done', 'in_progress', 'private'], default: 'private' },
    submittions: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            answers: { type: [Number], required: true },
            submittedAt: { type: Date, default: Date.now },
            score: { type: Number, default: 0 }
        }
    ]
});

module.exports = mongoose.model('Exam', examSchema);
