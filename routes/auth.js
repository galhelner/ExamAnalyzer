const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const requireAuth = require('../auth/requireAuth');

// Register endpoint
router.post('/register', authController.register);

// Login endpoint
router.post('/login', authController.login);

// Logout endpoint
router.post('/logout', authController.logout);

// authenticated user check endpoint
router.get('/me', requireAuth, (req, res) => {
  res.json({ id: req.user.id, role: req.user.role });
});

module.exports = router;
