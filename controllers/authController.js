const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// register functionality
exports.register = async (req, res) => {
  const { fullName, email, password, role } = req.body;
  try {
    // hash the password
    const hashed = await bcrypt.hash(password, 10);

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: `User with email: ${email} already exists` });

    // create a new user in mongoDB
    const user = new User({ fullName, email, password: hashed, role });
    await user.save();

    // create JWT access token
    const token = jwt.sign({ id: user._id, role: user.role, name: user.fullName }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // set it in an HTTP-only cookie
    res.cookie('access_token', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 3600000 // 1 hour
    });
    
    res.status(201).json({ success: true, message: 'User registered' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ success: false, message: 'Server Failed to register the user' });
  }
}

// login functionality
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // find user in mongoDB
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    // create JWT access token
    const token = jwt.sign({ id: user._id, role: user.role, name: user.fullName }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // set it in an HTTP-only cookie
    res.cookie('access_token', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 3600000 // 1 hour
    });

    res.status(200).json({ success: true, message: 'Login successful'});
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
}

// logout functionality
exports.logout = (req, res) => {
  res.clearCookie('access_token', { 
    httpOnly: true,
    sameSite: 'Strict', 
    secure: process.env.NODE_ENV === 'production' 
  });
  res.status(204).json({ success: true, message: 'Logout successful' });
}