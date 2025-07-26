const User = require('../models/User');
const FacultyMember = require('../models/FacultyMember');

// Middleware to check if user is faculty and approved
const requireApprovedFaculty = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Faculty access required'
      });
    }

    // Check if faculty member is approved
    const facultyMember = await FacultyMember.findOne({ user: user._id });

    if (!facultyMember) {
      return res.status(403).json({
        success: false,
        message: 'Faculty profile not found'
      });
    }

    if (!facultyMember.isApproved || facultyMember.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your faculty account is pending approval. Please contact an administrator.'
      });
    }

    // Add faculty member info to request
    req.facultyMember = facultyMember;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying faculty status'
    });
  }
};

// Middleware to check if user is faculty (approved or not)
const requireFaculty = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user || user.role !== 'faculty') {
      return res.status(403).json({
        success: false,
        message: 'Faculty access required'
      });
    }

    // Get faculty member info
    const facultyMember = await FacultyMember.findOne({ user: user._id });
    req.facultyMember = facultyMember;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying faculty status'
    });
  }
};

// Middleware to check if user is admin or approved faculty
const requireAdminOrApprovedFaculty = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (user.role === 'admin') {
      return next();
    }

    if (user.role === 'faculty') {
      const facultyMember = await FacultyMember.findOne({ user: user._id });

      if (!facultyMember || !facultyMember.isApproved || facultyMember.status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: 'Your faculty account is pending approval. Please contact an administrator.'
        });
      }

      req.facultyMember = facultyMember;
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Admin or faculty access required'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying access'
    });
  }
};

module.exports = {
  requireApprovedFaculty,
  requireFaculty,
  requireAdminOrApprovedFaculty
};