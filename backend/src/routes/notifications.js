const express = require('express');
const { auth } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, getNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, markAllAsRead);

module.exports = router;