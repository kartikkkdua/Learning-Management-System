const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Grading details
  rubric: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GradingRubric'
  },
  
  // Rubric-based grading
  criteriaGrades: [{
    criteriaId: mongoose.Schema.Types.ObjectId,
    criteriaName: String,
    pointsEarned: Number,
    maxPoints: Number,
    level: String,
    feedback: String
  }],
  
  // Overall grade
  totalPoints: {
    type: Number,
    required: true
  },
  maxPoints: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  letterGrade: {
    type: String,
    required: true
  },
  
  // Feedback and comments
  feedback: String,
  privateNotes: String, // Only visible to instructor
  
  // Grading status
  status: {
    type: String,
    enum: ['draft', 'published', 'returned'],
    default: 'draft'
  },
  
  // Timestamps
  gradedAt: Date,
  publishedAt: Date,
  
  // Late submission penalty
  latePenalty: {
    applied: {
      type: Boolean,
      default: false
    },
    percentage: Number,
    reason: String
  },
  
  // Revision tracking
  revisions: [{
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    totalPoints: Number,
    percentage: Number,
    letterGrade: String,
    feedback: String,
    gradedAt: Date,
    reason: String
  }]
}, {
  timestamps: true
});

// Calculate letter grade based on percentage
gradeSchema.methods.calculateLetterGrade = function(percentage) {
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
};

// Pre-save middleware to calculate grades
gradeSchema.pre('save', function(next) {
  this.percentage = (this.totalPoints / this.maxPoints) * 100;
  this.letterGrade = this.calculateLetterGrade(this.percentage);
  
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  if (!this.gradedAt) {
    this.gradedAt = new Date();
  }
  
  next();
});

// Indexes for better query performance
gradeSchema.index({ student: 1, course: 1 });
gradeSchema.index({ assignment: 1 });
gradeSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model('Grade', gradeSchema);