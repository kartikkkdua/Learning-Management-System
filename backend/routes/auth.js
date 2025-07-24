const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const emailService = require('../services/emailService');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role, profile } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }

    const user = new User({
      username,
      email,
      password,
      role,
      profile
    });

    await user.save();

    // Create corresponding Student or FacultyMember record based on role
    if (role === 'student') {
      const Student = require('../models/Student');
      try {
        const student = new Student({
          user: user._id,
          firstName: profile?.firstName || '',
          lastName: profile?.lastName || '',
          email: user.email,
          // Default faculty assignment - should be updated by admin
          faculty: null
        });
        await student.save();
        console.log(`Student profile created for user: ${user.username}`);
      } catch (studentError) {
        console.error('Failed to create student profile:', studentError);
      }
    } else if (role === 'faculty') {
      const FacultyMember = require('../models/FacultyMember');
      const Faculty = require('../models/Faculty');

      try {
        // Get a default faculty department (or create one if none exists)
        let defaultFaculty = await Faculty.findOne();
        if (!defaultFaculty) {
          defaultFaculty = new Faculty({
            name: 'General Faculty',
            code: 'GEN',
            description: 'General Faculty Department'
          });
          await defaultFaculty.save();
        }

        // Generate employeeId manually to avoid validation issues
        const facultyCount = await FacultyMember.countDocuments();
        const employeeId = `FAC${String(facultyCount + 1).padStart(4, '0')}`;
        
        const facultyMember = new FacultyMember({
          user: user._id,
          employeeId: employeeId,
          department: defaultFaculty._id,
          position: 'Instructor',
          status: 'pending', // Requires admin approval
          isApproved: false
        });
        await facultyMember.save();
        console.log(`Faculty member profile created for user: ${user.username} - Pending approval`);
      } catch (facultyError) {
        console.error('Failed to create faculty member profile:', facultyError);
      }
    }

    // Send welcome email with 2FA information
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    let message = 'Account created successfully! Two-factor authentication has been enabled by default for your security.';

    if (role === 'faculty') {
      message += ' Your faculty account is pending admin approval. You will receive an email once approved.';
    }

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        twoFactorEnabled: user.twoFactorEnabled,
        twoFactorMethod: user.twoFactorMethod
      },
      message
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login user (Step 1: Validate credentials)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: username }, { username }]
    });

    if (!user || !await user.comparePassword(password)) {
      // Increment failed login attempts
      if (user) {
        await user.incLoginAttempts();
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked due to too many failed attempts'
      });
    }

    // Reset login attempts on successful password validation
    await user.resetLoginAttempts();

    // Check faculty profile exists (but allow login even if pending)
    if (user.role === 'faculty') {
      const FacultyMember = require('../models/FacultyMember');
      const facultyMember = await FacultyMember.findOne({ user: user._id });
      
      if (!facultyMember) {
        return res.status(403).json({
          success: false,
          message: 'Faculty profile not found. Please contact an administrator.'
        });
      }
      
      // Add faculty approval status to user object for frontend
      user.facultyStatus = facultyMember.status;
      user.facultyApproved = facultyMember.isApproved;
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled && user.twoFactorMethod === 'email') {
      console.log('🔐 2FA is enabled for user:', user.email);

      // Generate and send 2FA code
      const code = user.generate2FACode();
      console.log('📱 Generated 2FA code:', code);
      await user.save();

      // Send 2FA code via email
      console.log('📧 Sending 2FA email to:', user.email);
      const emailResult = await emailService.send2FACode(user, code);
      console.log('📨 Email send result:', emailResult);

      if (!emailResult.success) {
        console.error('❌ Failed to send 2FA email:', emailResult.error);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification code'
        });
      }

      // Return temporary token for 2FA verification
      const tempToken = jwt.sign(
        { userId: user._id, step: '2fa_pending' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '15m' }
      );

      return res.json({
        success: true,
        requires2FA: true,
        tempToken,
        message: 'Verification code sent to your email'
      });
    }

    // Complete login without 2FA
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        twoFactorEnabled: user.twoFactorEnabled,
        facultyStatus: user.facultyStatus,
        facultyApproved: user.facultyApproved
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user (alias for profile)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify 2FA code (Step 2: Complete login with 2FA)
router.post('/verify-2fa', async (req, res) => {
  try {
    const { tempToken, code } = req.body;

    if (!tempToken || !code) {
      return res.status(400).json({
        success: false,
        message: 'Temporary token and verification code are required'
      });
    }

    // Verify temporary token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'fallback_secret');
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired temporary token'
      });
    }

    if (decoded.step !== '2fa_pending') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate 2FA code
    const validation = user.validate2FACode(code);
    if (!validation.valid) {
      await user.save(); // Save attempt count
      return res.status(400).json({
        success: false,
        message: validation.reason === 'Invalid code' ? 'Invalid verification code' : validation.reason
      });
    }

    // Check faculty profile exists (but allow login even if pending)
    if (user.role === 'faculty') {
      const FacultyMember = require('../models/FacultyMember');
      const facultyMember = await FacultyMember.findOne({ user: user._id });
      
      if (!facultyMember) {
        return res.status(403).json({
          success: false,
          message: 'Faculty profile not found. Please contact an administrator.'
        });
      }
      
      // Add faculty approval status to user object for frontend
      user.facultyStatus = facultyMember.status;
      user.facultyApproved = facultyMember.isApproved;
    }

    // Clear 2FA code and complete login
    user.clear2FACode();
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profile: user.profile,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Resend 2FA code
router.post('/resend-2fa', async (req, res) => {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(400).json({
        success: false,
        message: 'Temporary token is required'
      });
    }

    // Verify temporary token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'fallback_secret');
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired temporary token'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new 2FA code
    const code = user.generate2FACode();
    await user.save();

    // Send new code via email
    const emailResult = await emailService.send2FACode(user, code);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification code'
      });
    }

    res.json({
      success: true,
      message: 'New verification code sent to your email'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enable/Disable 2FA
router.post('/toggle-2fa', authenticateToken, async (req, res) => {
  try {
    const { enable, method = 'email' } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (enable) {
      user.twoFactorEnabled = true;
      user.twoFactorMethod = method;
    } else {
      user.twoFactorEnabled = false;
      user.twoFactorMethod = 'none';
      user.clear2FACode();
    }

    await user.save();

    res.json({
      success: true,
      message: `Two-factor authentication ${enable ? 'enabled' : 'disabled'}`,
      twoFactorEnabled: user.twoFactorEnabled,
      twoFactorMethod: user.twoFactorMethod
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const emailResult = await emailService.sendPasswordResetEmail(user, resetUrl);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email'
      });
    }

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Validate reset token
router.get('/validate-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.json({
      success: true,
      message: 'Reset token is valid',
      email: user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') // Partially hide email
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Reset login attempts and unlock account
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    await user.save();

    // Send password reset confirmation email
    try {
      await emailService.sendPasswordResetConfirmation(user);
    } catch (emailError) {
      console.error('Failed to send password reset confirmation email:', emailError);
      // Don't fail the password reset if email fails
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change password (authenticated user)
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get users endpoint (for compatibility)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;