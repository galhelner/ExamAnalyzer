const mongoose = require('mongoose');
const Counter = require('./Counter'); // Import the Counter model

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

// Auto-generate examCode before validation
examSchema.pre('validate', async function(next) {
    if (this.isNew && !this.examCode) {
        try {
            const counter = await Counter.findOneAndUpdate(
                { name: 'examCode' },
                { $inc: { value: 1 } },
                { new: true, upsert: true }
            );
            // Convert to 6-digit string
            this.examCode = counter.value.toString().padStart(6, '0');
            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

module.exports = mongoose.model('Exam', examSchema);
