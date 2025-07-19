const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
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
  description: {
    type: String,
    trim: true
  },
  dean: {
    type: String,
    trim: true
  },
  established: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);