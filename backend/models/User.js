const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function() {
      // Password not required for social auth users
      return !this.socialAuth || (!this.socialAuth.googleId && !this.socialAuth.githubId && !this.socialAuth.facebookId && !this.socialAuth.microsoftId);
    },
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'faculty', 'student', 'parent'],
    required: true
  },
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    address: String,
    dateOfBirth: Date,
    profileImage: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  
  // Password Recovery
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Two-Factor Authentication
  twoFactorEnabled: {
    type: Boolean,
    default: true // Enable 2FA by default for all users
  },
  twoFactorSecret: String, // For TOTP
  twoFactorBackupCodes: [String], // Backup codes
  twoFactorMethod: {
    type: String,
    enum: ['email', 'sms', 'totp', 'none'],
    default: 'email' // Default to email-based 2FA
  },
  phoneNumber: String, // For SMS 2FA
  
  // Account Security
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Email Verification
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Email-based 2FA
  twoFactorCode: String,
  twoFactorCodeExpires: Date,
  twoFactorCodeAttempts: {
    type: Number,
    default: 0
  },
  
  // Social Authentication
  socialAuth: {
    googleId: String,
    githubId: String,
    facebookId: String,
    microsoftId: String,
    google: {
      id: String,
      email: String,
      name: String,
      picture: String
    },
    github: {
      id: String,
      username: String,
      email: String,
      name: String,
      avatar: String
    },
    facebook: {
      id: String,
      email: String,
      name: String,
      picture: String
    },
    microsoft: {
      id: String,
      email: String,
      name: String
    }
  },
  
  // Email verification
  isEmailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Check if account is locked
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Generate 2FA code
userSchema.methods.generate2FACode = function() {
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
  this.twoFactorCode = code;
  this.twoFactorCodeExpires = new Date(Date.now() + 4 * 60 * 1000); // 4 minutes
  this.twoFactorCodeAttempts = 0;
  return code;
};

// Validate 2FA code
userSchema.methods.validate2FACode = function(inputCode) {
  if (!this.twoFactorCode || !this.twoFactorCodeExpires) {
    return { valid: false, reason: 'No code generated' };
  }
  
  if (this.twoFactorCodeExpires < new Date()) {
    return { valid: false, reason: 'Code expired' };
  }
  
  if (this.twoFactorCodeAttempts >= 3) {
    return { valid: false, reason: 'Too many attempts' };
  }
  
  if (this.twoFactorCode !== inputCode) {
    this.twoFactorCodeAttempts += 1;
    return { valid: false, reason: 'Invalid code' };
  }
  
  return { valid: true };
};

// Clear 2FA code
userSchema.methods.clear2FACode = function() {
  this.twoFactorCode = undefined;
  this.twoFactorCodeExpires = undefined;
  this.twoFactorCodeAttempts = 0;
};

module.exports = mongoose.model('User', userSchema);