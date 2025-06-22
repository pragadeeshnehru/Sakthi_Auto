const express = require('express');
const { validateRequest, schemas } = require('../middleware/validation');
const { auth } = require('../middleware/auth');
const { login, getProfile, logout } = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateRequest(schemas.login), login);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, getProfile);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, logout);

module.exports = router;