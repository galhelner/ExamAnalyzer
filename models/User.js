const e = require('express');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher'], default: 'user' },
  exams: [
    {
      examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }
    }
  ],
});

module.exports = mongoose.model('User', userSchema);
