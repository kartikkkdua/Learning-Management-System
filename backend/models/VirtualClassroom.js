const mongoose = require('mongoose');

const virtualClassroomSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
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
  scheduledTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 60
  },
  platform: {
    type: String,
    enum: ['zoom', 'teams', 'meet'],
    default: 'zoom'
  },
  meetingId: {
    type: String,
    required: true
  },
  meetingPassword: {
    type: String
  },
  joinUrl: {
    type: String,
    required: true
  },
  hostUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  recordingEnabled: {
    type: Boolean,
    default: false
  },
  recordingUrl: {
    type: String
  },
  attendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: Date,
    leftAt: Date,
    duration: Number // in minutes
  }],
  settings: {
    waitingRoom: {
      type: Boolean,
      default: true
    },
    muteOnEntry: {
      type: Boolean,
      default: true
    },
    allowScreenShare: {
      type: Boolean,
      default: false
    },
    allowChat: {
      type: Boolean,
      default: true
    },
    allowRecording: {
      type: Boolean,
      default: false
    }
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    interval: Number,
    endDate: Date,
    daysOfWeek: [Number] // 0-6 (Sunday-Saturday)
  }
}, {
  timestamps: true
});

// Index for efficient queries
virtualClassroomSchema.index({ courseId: 1, scheduledTime: 1 });
virtualClassroomSchema.index({ facultyId: 1, scheduledTime: 1 });
virtualClassroomSchema.index({ status: 1, scheduledTime: 1 });

module.exports = mongoose.model('VirtualClassroom', virtualClassroomSchema);