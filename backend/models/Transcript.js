const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  
  // Academic information
  academicYear: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    enum: ['Fall', 'Spring', 'Summer'],
    required: true
  },
  
  // Course grades
  courses: [{
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    courseName: String,
    courseCode: String,
    credits: Number,
    finalGrade: {
      percentage: Number,
      letterGrade: String,
      gradePoints: Number
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedDate: Date,
    
    // Detailed breakdown
    categoryGrades: [{
      categoryName: String,
      weight: Number,
      score: Number,
      assignments: [{
        name: String,
        score: Number,
        maxPoints: Number,
        percentage: Number,
        submittedDate: Date
      }]
    }]
  }],
  
  // GPA calculations
  semesterGPA: {
    type: Number,
    default: 0
  },
  cumulativeGPA: {
    type: Number,
    default: 0
  },
  totalCredits: {
    type: Number,
    default: 0
  },
  totalGradePoints: {
    type: Number,
    default: 0
  },
  
  // Academic standing
  academicStanding: {
    type: String,
    enum: ['Good Standing', 'Academic Warning', 'Academic Probation', 'Academic Suspension'],
    default: 'Good Standing'
  },
  
  // Honors and achievements
  honors: [{
    type: String,
    semester: String,
    year: String
  }],
  
  // Status
  isOfficial: {
    type: Boolean,
    default: false
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Verification
  verificationCode: String,
  digitalSignature: String
}, {
  timestamps: true
});

// Calculate GPA
transcriptSchema.methods.calculateGPA = function() {
  let totalGradePoints = 0;
  let totalCredits = 0;
  
  this.courses.forEach(course => {
    if (course.finalGrade && course.credits) {
      totalGradePoints += course.finalGrade.gradePoints * course.credits;
      totalCredits += course.credits;
    }
  });
  
  this.semesterGPA = totalCredits > 0 ? totalGradePoints / totalCredits : 0;
  this.totalCredits = totalCredits;
  this.totalGradePoints = totalGradePoints;
  
  return this.semesterGPA;
};

// Convert letter grade to grade points
transcriptSchema.statics.letterToGradePoints = function(letterGrade) {
  const gradeScale = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  };
  return gradeScale[letterGrade] || 0.0;
};

// Pre-save middleware to calculate GPA
transcriptSchema.pre('save', function(next) {
  // Calculate grade points for each course
  this.courses.forEach(course => {
    if (course.finalGrade && course.finalGrade.letterGrade) {
      course.finalGrade.gradePoints = this.constructor.letterToGradePoints(course.finalGrade.letterGrade);
    }
  });
  
  // Calculate semester GPA
  this.calculateGPA();
  
  // Determine academic standing
  if (this.semesterGPA >= 3.5) {
    this.academicStanding = 'Good Standing';
    // Check for honors
    if (this.semesterGPA >= 3.8) {
      this.honors.push({
        type: 'Dean\'s List',
        semester: this.semester,
        year: this.academicYear
      });
    }
  } else if (this.semesterGPA >= 2.0) {
    this.academicStanding = 'Good Standing';
  } else if (this.semesterGPA >= 1.5) {
    this.academicStanding = 'Academic Warning';
  } else if (this.semesterGPA >= 1.0) {
    this.academicStanding = 'Academic Probation';
  } else {
    this.academicStanding = 'Academic Suspension';
  }
  
  next();
});

// Indexes for better query performance
transcriptSchema.index({ student: 1, academicYear: 1, semester: 1 });
transcriptSchema.index({ student: 1, isOfficial: 1 });

module.exports = mongoose.model('Transcript', transcriptSchema);