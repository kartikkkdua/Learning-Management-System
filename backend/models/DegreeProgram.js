const mongoose = require('mongoose');

const degreeProgramSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  totalCreditsRequired: {
    type: Number,
    required: true,
    default: 120
  },
  requirements: {
    coreRequirements: [{
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      },
      credits: Number,
      required: { type: Boolean, default: true }
    }],
    electiveRequirements: [{
      category: String, // e.g., "Technical Electives", "General Electives"
      creditsRequired: Number,
      courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }]
    }],
    generalEducation: [{
      category: String, // e.g., "Mathematics", "Science", "Humanities"
      creditsRequired: Number,
      courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }]
    }]
  },
  duration: {
    years: { type: Number, default: 4 },
    semesters: { type: Number, default: 8 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('DegreeProgram', degreeProgramSchema);