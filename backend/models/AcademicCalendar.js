const mongoose = require('mongoose');

const academicCalendarSchema = new mongoose.Schema({
  academicYear: {
    type: String,
    required: true // e.g., "2024-2025"
  },
  semester: {
    type: String,
    enum: ['Fall', 'Spring', 'Summer'],
    required: true
  },
  events: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    type: {
      type: String,
      enum: ['registration', 'classes_start', 'classes_end', 'exam_period', 'holiday', 'deadline', 'graduation'],
      required: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    isImportant: {
      type: Boolean,
      default: false
    },
    targetAudience: {
      type: String,
      enum: ['all', 'students', 'faculty', 'staff'],
      default: 'all'
    }
  }],
  registrationPeriods: {
    earlyRegistration: {
      startDate: Date,
      endDate: Date,
      eligibleStudents: [String] // e.g., ["senior", "junior"]
    },
    regularRegistration: {
      startDate: Date,
      endDate: Date
    },
    lateRegistration: {
      startDate: Date,
      endDate: Date,
      lateFee: Number
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);