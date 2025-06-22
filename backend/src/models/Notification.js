const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientEmployeeNumber: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['idea_submitted', 'idea_approved', 'idea_rejected', 'idea_implementing', 'idea_implemented', 'review_assigned'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  relatedIdea: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipientEmployeeNumber: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);