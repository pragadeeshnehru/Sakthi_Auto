const express = require('express');
const { validateRequest, schemas } = require('../middleware/validation');
const { auth, authorize } = require('../middleware/auth');
const {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getLeaderboard
} = require('../controllers/userController');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/', auth, authorize('admin'), getUsers);

// @route   POST /api/users
// @desc    Create a new user
// @access  Private (Admin)
router.post('/', auth, authorize('admin'), validateRequest(schemas.createUser), createUser);

// @route   GET /api/users/leaderboard
// @desc    Get leaderboard
// @access  Private
router.get('/leaderboard', auth, getLeaderboard);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private (Admin)
router.get('/:id', auth, authorize('admin'), getUserById);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin)
router.put('/:id', auth, authorize('admin'), updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin)
router.delete('/:id', auth, authorize('admin'), deleteUser);

module.exports = router;