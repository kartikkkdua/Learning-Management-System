const express = require('express');
const User = require('../models/User');
const FacultyMember = require('../models/FacultyMember');
const Student = require('../models/Student');
const emailService = require('../services/emailService');
const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying admin status'
    });
  }
};

// Get all pending faculty approvals
router.get('/faculty/pending', requireAdmin, async (req, res) => {
  try {
    const pendingFaculty = await FacultyMember.find({ status: 'pending' })
      .populate('user', 'username email profile createdAt')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pendingFaculty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all faculty members with their status
router.get('/faculty', requireAdmin, async (req, res) => {
  try {
    const faculty = await FacultyMember.find()
      .populate('user', 'username email profile createdAt')
      .populate('department', 'name code')
      .populate('approvedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: faculty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Approve faculty member
router.post('/faculty/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { position, department } = req.body;

    const facultyMember = await FacultyMember.findById(id).populate('user');
    if (!facultyMember) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    if (facultyMember.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Faculty member is not pending approval'
      });
    }

    // Update faculty member status
    facultyMember.status = 'approved';
    facultyMember.isApproved = true;
    facultyMember.approvedBy = req.user.userId;
    facultyMember.approvedAt = new Date();
    
    if (position) facultyMember.position = position;
    if (department) facultyMember.department = department;

    await facultyMember.save();

    // Send approval email
    try {
      await emailService.sendFacultyApprovalEmail(facultyMember.user, true);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
    }

    res.json({
      success: true,
      message: 'Faculty member approved successfully',
      data: facultyMember
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Reject faculty member
router.post('/faculty/:id/reject', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const facultyMember = await FacultyMember.findById(id).populate('user');
    if (!facultyMember) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    if (facultyMember.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Faculty member is not pending approval'
      });
    }

    // Update faculty member status
    facultyMember.status = 'rejected';
    facultyMember.isApproved = false;
    facultyMember.rejectionReason = reason;
    facultyMember.approvedBy = req.user.userId;
    facultyMember.approvedAt = new Date();

    await facultyMember.save();

    // Send rejection email
    try {
      await emailService.sendFacultyApprovalEmail(facultyMember.user, false, reason);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
    }

    res.json({
      success: true,
      message: 'Faculty member rejected',
      data: facultyMember
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get system statistics
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalFaculty,
      pendingFaculty,
      approvedFaculty,
      rejectedFaculty
    ] = await Promise.all([
      User.countDocuments(),
      Student.countDocuments(),
      FacultyMember.countDocuments(),
      FacultyMember.countDocuments({ status: 'pending' }),
      FacultyMember.countDocuments({ status: 'approved' }),
      FacultyMember.countDocuments({ status: 'rejected' })
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: totalStudents,
          faculty: totalFaculty
        },
        faculty: {
          total: totalFaculty,
          pending: pendingFaculty,
          approved: approvedFaculty,
          rejected: rejectedFaculty
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;