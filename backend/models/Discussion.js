const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['general', 'assignments', 'lectures', 'exams', 'projects', 'announcements'],
    default: 'general'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorType: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    required: true
  },
  posts: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorType: {
      type: String,
      enum: ['student', 'faculty', 'admin'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    attachments: [{
      filename: String,
      url: String,
      fileType: String,
      fileSize: Number
    }],
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      likedAt: {
        type: Date,
        default: Date.now
      }
    }],
    replies: [{
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      authorType: {
        type: String,
        enum: ['student', 'faculty', 'admin'],
        required: true
      },
      content: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  tags: [String],
  viewCount: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
discussionSchema.index({ course: 1, createdAt: -1 });
discussionSchema.index({ course: 1, category: 1 });
discussionSchema.index({ course: 1, isPinned: -1, lastActivity: -1 });

module.exports = mongoose.model('Discussion', discussionSchema);