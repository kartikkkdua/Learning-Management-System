// Test API connectivity from frontend
const API_URL = 'http://localhost:3001/api';

async function testAPI() {
  console.log('Testing API connectivity...');
  
  try {
    // Test basic connectivity
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.success) {
      console.log('✅ API is working correctly');
    } else {
      console.log('⚠️ API responded but with error:', data.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    console.log('Make sure the backend server is running on port 3001');
  }
}

testAPI();