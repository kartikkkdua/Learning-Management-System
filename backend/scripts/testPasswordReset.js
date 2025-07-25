const mongoose = require('mongoose');
const User = require('../models/User');
const emailService = require('../services/emailService');
require('dotenv').config();

async function testPasswordReset() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lms');
    console.log('✅ Connected to MongoDB');

    // Test email service connection
    const emailTest = await emailService.testConnection();
    console.log('📧 Email service test:', emailTest);

    // Find a test user (or create one)
    let testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = new User({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: 'student',
        profile: {
          firstName: 'Test',
          lastName: 'User'
        }
      });
      await testUser.save();
      console.log('✅ Test user created');
    }

    // Test password reset email
    console.log('🔄 Testing password reset email...');
    
    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    testUser.resetPasswordToken = resetToken;
    testUser.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await testUser.save();

    // Send password reset email
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const emailResult = await emailService.sendPasswordResetEmail(testUser, resetUrl);
    
    if (emailResult.success) {
      console.log('✅ Password reset email sent successfully!');
      console.log('📧 Message ID:', emailResult.messageId);
      console.log('🔗 Reset URL:', resetUrl);
      console.log('⏰ Token expires:', testUser.resetPasswordExpires);
    } else {
      console.log('❌ Failed to send password reset email:', emailResult.error);
    }

    // Test token validation
    console.log('🔄 Testing token validation...');
    const foundUser = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (foundUser) {
      console.log('✅ Reset token validation successful');
      console.log('👤 User found:', foundUser.email);
    } else {
      console.log('❌ Reset token validation failed');
    }

    // Test 2FA code generation and email
    console.log('🔄 Testing 2FA email...');
    const code = testUser.generate2FACode();
    await testUser.save();
    
    const twoFAResult = await emailService.send2FACode(testUser, code);
    if (twoFAResult.success) {
      console.log('✅ 2FA email sent successfully!');
      console.log('🔢 2FA Code:', code);
    } else {
      console.log('❌ Failed to send 2FA email:', twoFAResult.error);
    }

    console.log('\n🎉 Password reset functionality test completed!');
    console.log('\n📋 Summary:');
    console.log('- Email service connection:', emailTest.success ? '✅' : '❌');
    console.log('- Password reset email:', emailResult.success ? '✅' : '❌');
    console.log('- Token validation:', foundUser ? '✅' : '❌');
    console.log('- 2FA email:', twoFAResult.success ? '✅' : '❌');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
}

// Run the test
testPasswordReset();