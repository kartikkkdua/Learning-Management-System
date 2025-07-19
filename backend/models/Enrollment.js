const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['enrolled', 'dropped', 'completed', 'failed'],
    default: 'enrolled'
  },
  grade: {
    letterGrade: {
      type: String,
      enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', 'I', 'W']
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4.0
    }
  },
  semester: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  droppedAt: Date,
  completedAt: Date,
  notes: String
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1, status: 1 });

// Index for efficient queries
enrollmentSchema.index({ student: 1, status: 1 });
enrollmentSchema.index({ course: 1, status: 1 });
enrollmentSchema.index({ semester: 1, year: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);