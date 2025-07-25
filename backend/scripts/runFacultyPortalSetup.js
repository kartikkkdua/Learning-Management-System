#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🎯 Faculty Portal Setup & Verification Tool\n');

const args = process.argv.slice(2);
const command = args[0] || 'help';

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, scriptName);
    const child = spawn('node', [scriptPath], { stdio: 'inherit' });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
  });
}

async function main() {
  try {
    switch (command) {
      case 'check':
        console.log('🔍 Checking Faculty Portal Status...\n');
        await runScript('checkFacultyPortalStatus.js');
        break;
        
      case 'setup':
        console.log('🚀 Setting up Faculty Portal Data...\n');
        await runScript('setupFacultyPortalData.js');
        break;
        
      case 'full':
        console.log('🔄 Running Full Setup Process...\n');
        console.log('Step 1: Checking current status...');
        await runScript('checkFacultyPortalStatus.js');
        console.log('\n' + '='.repeat(50) + '\n');
        console.log('Step 2: Setting up data...');
        await runScript('setupFacultyPortalData.js');
        console.log('\n' + '='.repeat(50) + '\n');
        console.log('Step 3: Verifying setup...');
        await runScript('checkFacultyPortalStatus.js');
        break;
        
      case 'help':
      default:
        console.log('Usage: node runFacultyPortalSetup.js <command>');
        console.log('');
        console.log('Commands:');
        console.log('  check  - Check current faculty portal status');
        console.log('  setup  - Set up sample data for faculty portal');
        console.log('  full   - Run complete setup process (check → setup → verify)');
        console.log('  help   - Show this help message');
        console.log('');
        console.log('Examples:');
        console.log('  node runFacultyPortalSetup.js check');
        console.log('  node runFacultyPortalSetup.js setup');
        console.log('  node runFacultyPortalSetup.js full');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();