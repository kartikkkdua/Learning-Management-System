const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  downloadUrl: String,
  category: {
    type: String,
    enum: ['syllabus', 'lecture_notes', 'assignment', 'reading_material', 'exam', 'project', 'other'],
    default: 'other'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploaderType: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    required: true
  },
  visibility: {
    type: String,
    enum: ['public', 'course', 'private'],
    default: 'course'
  },
  accessPermissions: {
    canDownload: {
      type: Boolean,
      default: true
    },
    canView: {
      type: Boolean,
      default: true
    },
    allowedRoles: [{
      type: String,
      enum: ['student', 'faculty', 'admin']
    }]
  },
  version: {
    type: Number,
    default: 1
  },
  previousVersions: [{
    version: Number,
    filename: String,
    filePath: String,
    uploadedAt: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  downloadCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes for efficient queries
documentSchema.index({ course: 1, category: 1 });
documentSchema.index({ uploadedBy: 1, createdAt: -1 });
documentSchema.index({ course: 1, visibility: 1 });
documentSchema.index({ tags: 1 });

module.exports = mongoose.model('Document', documentSchema);