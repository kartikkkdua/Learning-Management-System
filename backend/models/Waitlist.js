const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  priority: {
    type: String,
    enum: ['normal', 'senior', 'honors', 'special'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['waiting', 'notified', 'enrolled', 'expired', 'removed'],
    default: 'waiting'
  },
  notifiedAt: Date,
  expiresAt: Date, // How long student has to respond to enrollment opportunity
  semester: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  notes: String
}, {
  timestamps: true
});

// Compound index to prevent duplicate waitlist entries
waitlistSchema.index({ course: 1, student: 1 }, { unique: true });

// Index for efficient position queries
waitlistSchema.index({ course: 1, position: 1 });
waitlistSchema.index({ course: 1, status: 1, position: 1 });

module.exports = mongoose.model('Waitlist', waitlistSchema);