const mongoose = require('mongoose');

const gradeCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  
  // Weight configuration
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // Category settings
  dropLowest: {
    type: Number,
    default: 0 // Number of lowest grades to drop
  },
  
  // Grading scale
  gradingScale: {
    type: String,
    enum: ['points', 'percentage'],
    default: 'points'
  },
  
  // Category type
  type: {
    type: String,
    enum: ['assignments', 'exams', 'quizzes', 'participation', 'projects', 'other'],
    default: 'assignments'
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Order for display
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GradeCategory', gradeCategorySchema);