const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  maxPoints: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    enum: ['assignment', 'quiz', 'exam', 'project'],
    default: 'assignment'
  },
  attachments: [{
    filename: String,
    url: String,
    uploadDate: Date
  }],
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    submittedAt: Date,
    files: [{
      filename: String,
      url: String
    }],
    grade: Number,
    feedback: String,
    isLate: Boolean
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);