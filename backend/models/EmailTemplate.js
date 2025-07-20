const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['welcome', 'assignment', 'announcement', 'reminder', 'marketing', 'system', 'custom'],
    default: 'custom'
  },
  
  // Template Content
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  htmlContent: String,
  
  // Variables that can be used in the template
  variables: [{
    name: String,
    description: String,
    defaultValue: String,
    required: {
      type: Boolean,
      default: false
    }
  }],
  
  // Template Settings
  isSystem: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Usage Statistics
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: Date,
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Template Design
  design: {
    backgroundColor: {
      type: String,
      default: '#ffffff'
    },
    primaryColor: {
      type: String,
      default: '#007bff'
    },
    fontFamily: {
      type: String,
      default: 'Arial, sans-serif'
    },
    layout: {
      type: String,
      enum: ['simple', 'header-footer', 'sidebar', 'newsletter'],
      default: 'simple'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);