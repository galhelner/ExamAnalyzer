const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    questions: [
        {
            description: { type: String, required: true },
            options: { type: [String], required: true },
            points: { type: Number, required: true },
        }
    ],
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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

// Add an index to the userId within the submittions array for faster lookups for students.
examSchema.index({ 'submittions.userId': 1 });

module.exports = mongoose.model('Exam', examSchema);
