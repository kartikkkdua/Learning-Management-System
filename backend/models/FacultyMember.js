const mongoose = require('mongoose');

const facultyMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty', // References the Faculty department
    required: true
  },
  position: {
    type: String,
    enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Instructor'],
    default: 'Instructor'
  },
  specialization: [String],
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: {
    type: Number, // Years of experience
    default: 0
  },
  officeLocation: String,
  officeHours: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  researchInterests: [String],
  publications: [{
    title: String,
    journal: String,
    year: Number,
    url: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isApproved: {
    type: Boolean,
    default: false // Requires admin approval
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate employee ID automatically
facultyMemberSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await this.constructor.countDocuments();
    this.employeeId = `FAC${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('FacultyMember', facultyMemberSchema);