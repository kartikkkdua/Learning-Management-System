const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users (admin only)
router.get('/', auth, async (req, res) => {
  try {
    console.log('User requesting users list:', req.user);
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    console.log(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { username, email, role, profile } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;
    if (profile) user.profile = { ...user.profile, ...profile };

    await user.save();
    
    const updatedUser = await User.findById(req.params.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.userId.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    // Delete related records based on user role
    if (user.role === 'student') {
      const Student = require('../models/Student');
      await Student.deleteOne({ user: user._id });
      console.log(`Deleted student profile for user: ${user.username}`);
    } else if (user.role === 'faculty') {
      const FacultyMember = require('../models/FacultyMember');
      await FacultyMember.deleteOne({ user: user._id });
      console.log(`Deleted faculty member profile for user: ${user.username}`);
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete user',
      error: error.message 
    });
  }
});

// Get user statistics (admin only)
router.get('/stats/overview', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    res.json({
      totalUsers,
      totalStudents,
      totalFaculty,
      totalAdmins,
      breakdown: {
        students: totalStudents,
        faculty: totalFaculty,
        admins: totalAdmins
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;