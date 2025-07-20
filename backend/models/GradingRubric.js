const mongoose = require('mongoose');

const gradingRubricSchema = new mongoose.Schema({
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Rubric criteria
  criteria: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    maxPoints: {
      type: Number,
      required: true
    },
    weight: {
      type: Number,
      default: 1
    },
    levels: [{
      name: String, // Excellent, Good, Fair, Poor
      description: String,
      points: Number,
      percentage: Number // 90-100%, 80-89%, etc.
    }]
  }],
  
  // Total points and settings
  totalPoints: {
    type: Number,
    required: true
  },
  passingGrade: {
    type: Number,
    default: 60
  },
  
  // Usage tracking
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsed: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('GradingRubric', gradingRubricSchema);