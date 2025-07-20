const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  // Email Details
  messageId: String,
  subject: {
    type: String,
    required: true
  },
  content: String,
  
  // Sender & Recipients
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    email: String,
    name: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Campaign Association
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailCampaign'
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmailTemplate'
  },
  
  // Status & Delivery
  status: {
    type: String,
    enum: ['queued', 'sent', 'delivered', 'bounced', 'failed'],
    default: 'queued'
  },
  sentAt: Date,
  deliveredAt: Date,
  
  // Analytics Tracking
  tracking: {
    opened: {
      count: {
        type: Number,
        default: 0
      },
      firstOpenedAt: Date,
      lastOpenedAt: Date,
      openEvents: [{
        timestamp: Date,
        userAgent: String,
        ipAddress: String
      }]
    },
    clicked: {
      count: {
        type: Number,
        default: 0
      },
      firstClickedAt: Date,
      lastClickedAt: Date,
      clickEvents: [{
        timestamp: Date,
        url: String,
        userAgent: String,
        ipAddress: String
      }]
    },
    unsubscribed: {
      type: Boolean,
      default: false
    },
    unsubscribedAt: Date
  },
  
  // Error Information
  error: {
    message: String,
    code: String,
    timestamp: Date
  },
  
  // Metadata
  metadata: {
    emailProvider: String,
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal'
    },
    tags: [String]
  }
}, {
  timestamps: true
});

// Indexes for better query performance
emailLogSchema.index({ sender: 1, createdAt: -1 });
emailLogSchema.index({ campaign: 1 });
emailLogSchema.index({ status: 1 });
emailLogSchema.index({ 'recipients.email': 1 });
emailLogSchema.index({ sentAt: -1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);