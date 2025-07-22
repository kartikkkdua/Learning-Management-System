const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function testPasswordResetFlow() {
  console.log('🔐 Testing Enhanced Password Reset Flow\n');

  try {
    // Test 1: Create a test user
    console.log('1. Creating test user...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      username: 'resettest',
      email: 'resettest@example.com',
      password: 'oldpassword123',
      role: 'student',
      profile: {
        firstName: 'Reset',
        lastName: 'Test'
      }
    });
    console.log('✅ User created successfully');

    // Test 2: Request password reset
    console.log('\n2. Requesting password reset...');
    const forgotResponse = await axios.post(`${API_URL}/auth/forgot-password`, {
      email: 'resettest@example.com'
    });
    console.log('✅ Password reset email sent:', forgotResponse.data.message);

    // Test 3: Get the reset token from database (in real scenario, user gets this from email)
    console.log('\n3. Simulating token extraction from email...');
    const User = require('../models/User');
    const user = await User.findOne({ email: 'resettest@example.com' });
    const resetToken = user.resetPasswordToken;
    console.log('✅ Reset token obtained');

    // Test 4: Validate reset token
    console.log('\n4. Validating reset token...');
    const validateResponse = await axios.get(`${API_URL}/auth/validate-reset-token/${resetToken}`);
    console.log('✅ Token validation:', validateResponse.data.message);
    console.log('   Email preview:', validateResponse.data.email);

    // Test 5: Reset password
    console.log('\n5. Resetting password...');
    const resetResponse = await axios.post(`${API_URL}/auth/reset-password`, {
      token: resetToken,
      newPassword: 'newpassword123'
    });
    console.log('✅ Password reset successful:', resetResponse.data.message);

    // Test 6: Try to use the same token again (should fail)
    console.log('\n6. Testing token invalidation...');
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token: resetToken,
        newPassword: 'anothernewpassword123'
      });
      console.log('❌ Token should have been invalidated');
    } catch (error) {
      console.log('✅ Token correctly invalidated:', error.response.data.message);
    }

    // Test 7: Try to validate the used token (should fail)
    console.log('\n7. Testing token validation after use...');
    try {
      await axios.get(`${API_URL}/auth/validate-reset-token/${resetToken}`);
      console.log('❌ Token validation should have failed');
    } catch (error) {
      console.log('✅ Token validation correctly failed:', error.response.data.message);
    }

    // Test 8: Test login with new password
    console.log('\n8. Testing login with new password...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: 'resettest',
      password: 'newpassword123'
    });
    console.log('✅ Login successful with new password');

    console.log('\n🎉 All password reset tests passed!');
    console.log('\n📧 Check your email for the password reset confirmation message.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the test
testPasswordResetFlow();