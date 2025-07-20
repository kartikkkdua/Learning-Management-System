const mongoose = require('mongoose');

const emailCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['one-time', 'drip', 'scheduled', 'recurring'],
    default: 'one-time'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Email Content
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate'
  },
  
  // Recipients
  recipientType: {
    type: String,
    enum: ['all_students', 'all_faculty', 'course_students', 'specific', 'segment'],
    required: true
  },
  recipients: [String], // For specific emails
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  segment: {
    role: [String],
    enrollmentStatus: String,
    lastLoginBefore: Date,
    lastLoginAfter: Date
  },
  
  // Scheduling
  scheduledDate: Date,
  timezone: {
    type: String,
    default: 'UTC'
  },
  recurring: {
    enabled: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    interval: {
      type: Number,
      default: 1
    },
    endDate: Date
  },
  
  // Drip Campaign Settings
  dripSequence: [{
    step: Number,
    delay: Number, // in hours
    subject: String,
    content: String,
    sent: {
      type: Boolean,
      default: false
    }
  }],
  
  // A/B Testing
  abTest: {
    enabled: {
      type: Boolean,
      default: false
    },
    variants: [{
      name: String,
      subject: String,
      content: String,
      percentage: Number
    }],
    winningVariant: String
  },
  
  // Analytics
  analytics: {
    sent: {
      type: Number,
      default: 0
    },
    delivered: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    bounced: {
      type: Number,
      default: 0
    },
    unsubscribed: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailCampaign', emailCampaignSchema);