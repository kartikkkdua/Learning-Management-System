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

// Static method to create and emit notification
notificationSchema.statics.createAndEmit = async function(notificationData, io) {
  const notification = new this(notificationData);
  await notification.save();
  
  // Populate related data
  await notification.populate([
    { path: 'metadata.course', select: 'name code' },
    { path: 'metadata.assignment', select: 'title dueDate' }
  ]);
  
  // Emit to specific user
  if (io) {
    io.to(`user_${notification.recipient}`).emit('newNotification', notification);
    
    // Also emit count update
    const unreadCount = await this.countDocuments({ 
      recipient: notification.recipient, 
      isRead: false 
    });
    io.to(`user_${notification.recipient}`).emit('notificationCount', unreadCount);
  }
  
  return notification;
};

// Static method to broadcast to multiple users
notificationSchema.statics.broadcastToUsers = async function(userIds, notificationData, io) {
  const notifications = userIds.map(userId => ({
    ...notificationData,
    recipient: userId
  }));
  
  const createdNotifications = await this.insertMany(notifications);
  
  if (io) {
    // Emit to each user
    for (const notification of createdNotifications) {
      io.to(`user_${notification.recipient}`).emit('newNotification', notification);
      
      // Update count
      const unreadCount = await this.countDocuments({ 
        recipient: notification.recipient, 
        isRead: false 
      });
      io.to(`user_${notification.recipient}`).emit('notificationCount', unreadCount);
    }
  }
  
  return createdNotifications;
};

module.exports = mongoose.model('Notification', notificationSchema);