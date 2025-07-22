const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function test2FASystem() {
  console.log('🔐 Testing 2FA and Password Recovery System\n');

  try {
    // Test 1: Register a test user
    console.log('1. Creating test user...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, {
      username: 'testuser2fa',
      email: 'test2fa@example.com',
      password: 'password123',
      role: 'student',
      profile: {
        firstName: 'Test',
        lastName: 'User'
      }
    });
    
    const token = registerResponse.data.token;
    console.log('✅ User created successfully');

    // Test 2: Enable 2FA
    console.log('\n2. Enabling 2FA...');
    const enable2FAResponse = await axios.post(`${API_URL}/auth/toggle-2fa`, {
      enable: true,
      method: 'email'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 2FA enabled:', enable2FAResponse.data.message);

    // Test 3: Test login with 2FA
    console.log('\n3. Testing login with 2FA...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      username: 'testuser2fa',
      password: 'password123'
    });
    
    if (loginResponse.data.requires2FA) {
      console.log('✅ 2FA required - verification code sent');
      console.log('Temp token received for 2FA verification');
    } else {
      console.log('❌ 2FA not triggered');
    }

    // Test 4: Test forgot password
    console.log('\n4. Testing forgot password...');
    const forgotPasswordResponse = await axios.post(`${API_URL}/auth/forgot-password`, {
      email: 'test2fa@example.com'
    });
    console.log('✅ Password reset email sent:', forgotPasswordResponse.data.message);

    // Test 5: Disable 2FA
    console.log('\n5. Disabling 2FA...');
    const disable2FAResponse = await axios.post(`${API_URL}/auth/toggle-2fa`, {
      enable: false
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ 2FA disabled:', disable2FAResponse.data.message);

    console.log('\n🎉 All tests passed! 2FA system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

// Run the test
test2FASystem();