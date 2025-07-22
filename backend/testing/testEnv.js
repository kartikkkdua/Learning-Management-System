require('dotenv').config();

console.log('🔧 Environment Variables Test:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***HIDDEN***' : 'NOT SET');

if (!process.env.EMAIL_HOST) {
  console.log('❌ EMAIL_HOST is not set!');
} else if (process.env.EMAIL_HOST === 'smtp.gmail.com') {
  console.log('✅ EMAIL_HOST is correctly set to Gmail');
} else {
  console.log('⚠️ EMAIL_HOST is set to:', process.env.EMAIL_HOST);
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('❌ Email credentials are missing!');
} else {
  console.log('✅ Email credentials are set');
}