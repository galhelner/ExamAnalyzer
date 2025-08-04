const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher'], default: 'student' },
  exams: [
    {
      examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }
    }
  ],
});

module.exports = mongoose.model('User', userSchema);
