#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running Password Reset Functionality Test...\n');

const testScript = path.join(__dirname, 'testPasswordReset.js');
const nodeProcess = spawn('node', [testScript], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..')
});

nodeProcess.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Password reset test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Check your email inbox for test emails');
    console.log('2. Try the forgot password flow on the frontend');
    console.log('3. Test the reset password link');
    console.log('4. Verify 2FA functionality');
  } else {
    console.log(`\n❌ Test failed with exit code ${code}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check email configuration in .env file');
    console.log('3. Verify EMAIL_USER and EMAIL_PASS are correct');
    console.log('4. Check if Gmail app password is valid');
  }
});

nodeProcess.on('error', (error) => {
  console.error('❌ Failed to start test:', error);
});