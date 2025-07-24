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

// Test endpoint to check if admin routes are working
router.get('/test', requireAdmin, async (req, res) => {
  res.json({
    success: true,
    message: 'Admin routes are working!',
    user: req.user
  });
});

// Debug endpoint to check faculty member data
router.get('/faculty/debug', requireAdmin, async (req, res) => {
  try {
    const allFaculty = await FacultyMember.find()
      .populate('user', 'username email profile')
      .populate('department', 'name code');
    
    const facultyUsers = await User.find({ role: 'faculty' });
    
    res.json({
      success: true,
      data: {
        facultyMembers: allFaculty.map(f => ({
          id: f._id,
          employeeId: f.employeeId,
          status: f.status,
          isApproved: f.isApproved,
          position: f.position,
          user: f.user ? {
            id: f.user._id,
            username: f.user.username,
            email: f.user.email,
            name: `${f.user.profile?.firstName || ''} ${f.user.profile?.lastName || ''}`.trim()
          } : null,
          department: f.department
        })),
        facultyUsers: facultyUsers.map(u => ({
          id: u._id,
          username: u.username,
          email: u.email,
          role: u.role,
          name: `${u.profile?.firstName || ''} ${u.profile?.lastName || ''}`.trim()
        })),
        counts: {
          facultyMembers: allFaculty.length,
          facultyUsers: facultyUsers.length,
          pending: allFaculty.filter(f => f.status === 'pending').length,
          approved: allFaculty.filter(f => f.status === 'approved').length,
          rejected: allFaculty.filter(f => f.status === 'rejected').length
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

// Get all pending faculty approvals
router.get('/faculty/pending', requireAdmin, async (req, res) => {
  try {
    console.log('Fetching pending faculty approvals...');
    
    // First, let's see all faculty members and their status
    const allFaculty = await FacultyMember.find()
      .populate('user', 'username email profile createdAt')
      .populate('department', 'name code');
    
    console.log('All faculty members:', allFaculty.map(f => ({
      id: f._id,
      user: f.user?.username,
      status: f.status,
      isApproved: f.isApproved
    })));

    const pendingFaculty = await FacultyMember.find({ status: 'pending' })
      .populate('user', 'username email profile createdAt')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    console.log(`Found ${pendingFaculty.length} pending faculty members`);

    res.json({
      success: true,
      data: pendingFaculty
    });
  } catch (error) {
    console.error('Error fetching pending faculty:', error);
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

    console.log('Approving faculty member:', id);
    console.log('Request body:', req.body);

    const facultyMember = await FacultyMember.findById(id).populate('user');
    if (!facultyMember) {
      console.log('Faculty member not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    console.log('Faculty member status:', facultyMember.status);
    console.log('Faculty member isApproved:', facultyMember.isApproved);

    if (facultyMember.status !== 'pending') {
      console.log('Faculty member is not pending. Current status:', facultyMember.status);
      return res.status(400).json({
        success: false,
        message: `Faculty member is not pending approval. Current status: ${facultyMember.status}`
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

    // Send approval email (optional - don't fail if email fails)
    try {
      await emailService.sendFacultyApprovalEmail(facultyMember.user, true);
      console.log('Approval email sent successfully');
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the approval process if email fails
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

    // Send rejection email (optional - don't fail if email fails)
    try {
      await emailService.sendFacultyApprovalEmail(facultyMember.user, false, reason);
      console.log('Rejection email sent successfully');
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the rejection process if email fails
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

// Get all students (Admin only)
router.get('/students', requireAdmin, async (req, res) => {
  try {
    const students = await Student.find()
      .populate('user', 'username email profile createdAt')
      .populate('faculty', 'name code')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: students
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
      rejectedFaculty,
      studentUsers,
      facultyUsers
    ] = await Promise.all([
      User.countDocuments(),
      Student.countDocuments(),
      FacultyMember.countDocuments(),
      FacultyMember.countDocuments({ status: 'pending' }),
      FacultyMember.countDocuments({ status: 'approved' }),
      FacultyMember.countDocuments({ status: 'rejected' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'faculty' })
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students: studentUsers,
          faculty: facultyUsers,
          admin: totalUsers - studentUsers - facultyUsers
        },
        students: {
          total: totalStudents,
          userRecords: studentUsers,
          needsSync: studentUsers - totalStudents
        },
        faculty: {
          total: totalFaculty,
          pending: pendingFaculty,
          approved: approvedFaculty,
          rejected: rejectedFaculty,
          userRecords: facultyUsers,
          needsSync: facultyUsers - totalFaculty
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

// Utility route to sync student users with Student records
router.post('/students/sync-users', requireAdmin, async (req, res) => {
  try {
    console.log('Syncing student users with Student records...');
    
    // First, find all users with student role
    const studentUsers = await User.find({ role: 'student' });
    console.log(`Found ${studentUsers.length} student users`);
    
    // Get all existing Student records
    const existingStudents = await Student.find().populate('user');
    console.log(`Found ${existingStudents.length} existing Student records`);
    
    let createdCount = 0;
    let updatedCount = 0;
    let errors = [];
    
    for (const user of studentUsers) {
      try {
        // Check if Student record exists
        let student = await Student.findOne({ user: user._id });
        
        // Also check by email if user record doesn't exist
        if (!student) {
          student = await Student.findOne({ email: user.email });
          if (student && !student.user) {
            // Link existing student record to user
            student.user = user._id;
            await student.save();
            updatedCount++;
            console.log(`🔗 Linked existing Student record to user: ${user.username}`);
            continue;
          }
        }
        
        if (!student) {
          // Create missing Student record
          const Faculty = require('../models/Faculty');
          
          // Get or create default faculty department
          let defaultFaculty = await Faculty.findOne();
          if (!defaultFaculty) {
            defaultFaculty = new Faculty({
              name: 'General Faculty',
              code: 'GEN',
              description: 'General Faculty Department'
            });
            await defaultFaculty.save();
            console.log('Created default faculty department');
          }
          
          // Generate unique studentId
          let studentId;
          let isUnique = false;
          let attempts = 0;
          
          while (!isUnique && attempts < 10) {
            const studentCount = await Student.countDocuments();
            studentId = `STU${String(studentCount + attempts + 1).padStart(4, '0')}`;
            
            const existingWithId = await Student.findOne({ studentId });
            if (!existingWithId) {
              isUnique = true;
            } else {
              attempts++;
            }
          }
          
          if (!isUnique) {
            // Fallback to timestamp-based ID
            studentId = `STU${Date.now().toString().slice(-4)}`;
          }
          
          // Extract name from user profile or use defaults
          const firstName = user.profile?.firstName || user.username || 'Student';
          const lastName = user.profile?.lastName || 'User';
          
          student = new Student({
            user: user._id,
            studentId: studentId,
            firstName: firstName,
            lastName: lastName,
            email: user.email,
            faculty: defaultFaculty._id,
            status: 'active',
            year: 1
          });
          
          await student.save();
          createdCount++;
          console.log(`✅ Created Student record for user: ${user.username} (${user.email}) with ID: ${studentId}`);
          
        } else {
          // Update existing Student if needed
          let needsUpdate = false;
          
          if (!student.user) {
            student.user = user._id;
            needsUpdate = true;
          }
          
          if (!student.studentId) {
            const studentCount = await Student.countDocuments();
            student.studentId = `STU${String(studentCount + 1).padStart(4, '0')}`;
            needsUpdate = true;
          }
          
          if (!student.firstName && user.profile?.firstName) {
            student.firstName = user.profile.firstName;
            needsUpdate = true;
          }
          
          if (!student.lastName && user.profile?.lastName) {
            student.lastName = user.profile.lastName;
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            await student.save();
            updatedCount++;
            console.log(`🔄 Updated Student record for user: ${user.username}`);
          } else {
            console.log(`✓ Student record already exists for user: ${user.username}`);
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.username}:`, userError);
        errors.push(`${user.username}: ${userError.message}`);
      }
    }

    // Verify the sync worked
    const finalStudentCount = await Student.countDocuments();
    const finalUserCount = await User.countDocuments({ role: 'student' });
    
    console.log(`Sync complete: ${finalStudentCount} Student records for ${finalUserCount} student users`);

    res.json({
      success: true,
      message: `Sync complete: Created ${createdCount} new records, updated ${updatedCount} existing records`,
      data: {
        created: createdCount,
        updated: updatedCount,
        totalStudentUsers: studentUsers.length,
        totalStudentRecords: finalStudentCount,
        errors: errors
      }
    });
  } catch (error) {
    console.error('Error syncing student users:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Utility route to sync faculty users with FacultyMember records
router.post('/faculty/sync-users', requireAdmin, async (req, res) => {
  try {
    console.log('Syncing faculty users with FacultyMember records...');
    
    // First, find all users with faculty role
    const facultyUsers = await User.find({ role: 'faculty' });
    console.log(`Found ${facultyUsers.length} faculty users`);
    
    // Get all existing FacultyMember records
    const existingFacultyMembers = await FacultyMember.find().populate('user');
    console.log(`Found ${existingFacultyMembers.length} existing FacultyMember records`);
    
    let createdCount = 0;
    let updatedCount = 0;
    let errors = [];
    
    for (const user of facultyUsers) {
      try {
        // Check if FacultyMember record exists
        let facultyMember = await FacultyMember.findOne({ user: user._id });
        
        if (!facultyMember) {
          // Create missing FacultyMember record
          const Faculty = require('../models/Faculty');
          
          // Get or create default faculty department
          let defaultFaculty = await Faculty.findOne();
          if (!defaultFaculty) {
            defaultFaculty = new Faculty({
              name: 'General Faculty',
              code: 'GEN',
              description: 'General Faculty Department'
            });
            await defaultFaculty.save();
            console.log('Created default faculty department');
          }
          
          // Generate unique employeeId
          let employeeId;
          let isUnique = false;
          let attempts = 0;
          
          while (!isUnique && attempts < 10) {
            const facultyCount = await FacultyMember.countDocuments();
            employeeId = `FAC${String(facultyCount + attempts + 1).padStart(4, '0')}`;
            
            const existingWithId = await FacultyMember.findOne({ employeeId });
            if (!existingWithId) {
              isUnique = true;
            } else {
              attempts++;
            }
          }
          
          if (!isUnique) {
            // Fallback to timestamp-based ID
            employeeId = `FAC${Date.now().toString().slice(-4)}`;
          }
          
          facultyMember = new FacultyMember({
            user: user._id,
            employeeId: employeeId,
            department: defaultFaculty._id,
            position: 'Instructor',
            status: 'pending',
            isApproved: false,
            joinDate: new Date()
          });
          
          await facultyMember.save();
          createdCount++;
          console.log(`✅ Created FacultyMember record for user: ${user.username} (${user.email}) with ID: ${employeeId}`);
          
        } else {
          // Update existing FacultyMember if needed
          let needsUpdate = false;
          
          if (!facultyMember.status || facultyMember.status === null) {
            facultyMember.status = 'pending';
            needsUpdate = true;
          }
          
          if (facultyMember.isApproved === undefined || facultyMember.isApproved === null) {
            facultyMember.isApproved = false;
            needsUpdate = true;
          }
          
          if (!facultyMember.employeeId) {
            const facultyCount = await FacultyMember.countDocuments();
            facultyMember.employeeId = `FAC${String(facultyCount + 1).padStart(4, '0')}`;
            needsUpdate = true;
          }
          
          if (needsUpdate) {
            await facultyMember.save();
            updatedCount++;
            console.log(`🔄 Updated FacultyMember record for user: ${user.username}`);
          } else {
            console.log(`✓ FacultyMember record already exists for user: ${user.username}`);
          }
        }
      } catch (userError) {
        console.error(`Error processing user ${user.username}:`, userError);
        errors.push(`${user.username}: ${userError.message}`);
      }
    }

    // Verify the sync worked
    const finalFacultyCount = await FacultyMember.countDocuments();
    const finalUserCount = await User.countDocuments({ role: 'faculty' });
    
    console.log(`Sync complete: ${finalFacultyCount} FacultyMember records for ${finalUserCount} faculty users`);

    res.json({
      success: true,
      message: `Sync complete: Created ${createdCount} new records, updated ${updatedCount} existing records`,
      data: {
        created: createdCount,
        updated: updatedCount,
        totalFacultyUsers: facultyUsers.length,
        totalFacultyMembers: finalFacultyCount,
        errors: errors
      }
    });
  } catch (error) {
    console.error('Error syncing faculty users:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update faculty member details (Admin only)
router.put('/faculty/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, position, department, status } = req.body;

    const facultyMember = await FacultyMember.findById(id);
    if (!facultyMember) {
      return res.status(404).json({
        success: false,
        message: 'Faculty member not found'
      });
    }

    // Update faculty member fields
    if (employeeId !== undefined) facultyMember.employeeId = employeeId;
    if (position !== undefined) facultyMember.position = position;
    if (department !== undefined) facultyMember.department = department;
    if (status !== undefined) {
      facultyMember.status = status;
      facultyMember.isApproved = status === 'approved';
      if (status === 'approved') {
        facultyMember.approvedBy = req.user.userId;
        facultyMember.approvedAt = new Date();
      }
    }

    await facultyMember.save();

    // Populate the updated faculty member
    const updatedFaculty = await FacultyMember.findById(id)
      .populate('user', 'username email profile')
      .populate('department', 'name code')
      .populate('approvedBy', 'username');

    res.json({
      success: true,
      message: 'Faculty member updated successfully',
      data: updatedFaculty
    });
  } catch (error) {
    console.error('Error updating faculty member:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user details (Admin only)
router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { profile, email } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (email !== undefined) user.email = email;
    if (profile !== undefined) {
      user.profile = { ...user.profile, ...profile };
    }

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;