const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.js');
const examsRoutes = require('./routes/exams.js');
const path = require('path');
const { fileURLToPath } = require('url');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/auth', authRoutes);
app.use('/exams', examsRoutes);
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
