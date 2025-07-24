#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const environments = {
  local: 'local',
  development: 'local',
  dev: 'local',
  production: 'production',
  prod: 'production',
  render: 'production'
};

function setupEnvironment(env = 'local') {
  const targetEnv = environments[env.toLowerCase()] || 'local';
  
  console.log(`🔧 Setting up environment for: ${env} (using ${targetEnv} config)`);
  
  // Backend environment setup
  const backendSource = path.join(__dirname, '..', 'backend', `.env.${targetEnv}`);
  const backendTarget = path.join(__dirname, '..', 'backend', '.env');
  
  if (fs.existsSync(backendSource)) {
    fs.copyFileSync(backendSource, backendTarget);
    console.log(`✅ Backend: Copied .env.${targetEnv} to .env`);
  } else {
    console.log(`❌ Backend: .env.${targetEnv} not found`);
  }
  
  // Frontend environment setup
  const frontendSource = path.join(__dirname, '..', 'frontend', `.env.${targetEnv}`);
  const frontendTarget = path.join(__dirname, '..', 'frontend', '.env');
  
  if (fs.existsSync(frontendSource)) {
    fs.copyFileSync(frontendSource, frontendTarget);
    console.log(`✅ Frontend: Copied .env.${targetEnv} to .env`);
  } else {
    console.log(`❌ Frontend: .env.${targetEnv} not found`);
  }
  
  console.log(`\n🎉 Environment setup complete for ${env}!`);
  
  if (targetEnv === 'production') {
    console.log('\n⚠️  IMPORTANT: For production deployment on Render:');
    console.log('1. Set environment variables in Render dashboard');
    console.log('2. Do not commit sensitive data to git');
    console.log('3. Update MONGODB_URI, JWT_SECRET, and other secrets');
  }
}

function showHelp() {
  console.log(`
🔧 Environment Setup Script

Usage: node scripts/env-setup.js [environment]

Available environments:
  local, development, dev  → Use local development settings
  production, prod, render → Use production settings

Examples:
  node scripts/env-setup.js local
  node scripts/env-setup.js production
  npm run env:local
  npm run env:prod

This script copies the appropriate .env files for backend and frontend.
`);
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

const environment = args[0] || 'local';
setupEnvironment(environment);