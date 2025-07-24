#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up environment files for local development...\n');

// Backend .env setup
const backendEnvPath = path.join(__dirname, '../backend/.env');
const backendEnvExamplePath = path.join(__dirname, '../backend/.env.example');

if (!fs.existsSync(backendEnvPath)) {
  if (fs.existsSync(backendEnvExamplePath)) {
    fs.copyFileSync(backendEnvExamplePath, backendEnvPath);
    console.log('✅ Created backend/.env from .env.example');
  } else {
    console.log('❌ backend/.env.example not found');
  }
} else {
  console.log('ℹ️  backend/.env already exists');
}

// Frontend .env setup
const frontendEnvPath = path.join(__dirname, '../frontend/.env');
const frontendEnvExamplePath = path.join(__dirname, '../frontend/.env.example');

if (!fs.existsSync(frontendEnvPath)) {
  if (fs.existsSync(frontendEnvExamplePath)) {
    fs.copyFileSync(frontendEnvExamplePath, frontendEnvPath);
    console.log('✅ Created frontend/.env from .env.example');
  } else {
    console.log('❌ frontend/.env.example not found');
  }
} else {
  console.log('ℹ️  frontend/.env already exists');
}

console.log('\n📝 Next steps:');
console.log('1. Update backend/.env with your MongoDB URI and email credentials');
console.log('2. Update frontend/.env if needed (defaults should work for local development)');
console.log('3. Run "npm run dev" to start both frontend and backend');
console.log('\n🔗 For production deployment, see RENDER_DEPLOYMENT.md');