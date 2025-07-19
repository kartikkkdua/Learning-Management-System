const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'assignment_due',
      'grade_posted',
      'enrollment_confirmation',
      'course_update',
      'announcement',
      'registration_reminder',
      'payment_due',
      'class_cancelled',
      'exam_schedule',
      'general'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['academic', 'administrative', 'financial', 'social', 'system'],
    default: 'academic'
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['course', 'assignment', 'announcement', 'enrollment', 'payment']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  actionUrl: String, // URL to navigate to when notification is clicked
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  scheduledFor: Date, // For scheduled notifications
  expiresAt: Date, // Auto-delete after this date
  metadata: {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment'
    },
    dueDate: Date,
    additionalData: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1, scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);