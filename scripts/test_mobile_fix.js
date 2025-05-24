#!/usr/bin/env node
/**
 * Test the mobile database fix
 * Verifies that all components are in place for the Android fix
 */

const fs = require('fs');
const path = require('path');

function checkSetupComplete() {
  console.log('🔍 Mobile Database Fix Verification');
  console.log('===================================\n');
  
  const checks = [
    {
      name: 'Database in assets',
      path: 'assets/databases/unihan.db',
      required: true
    },
    {
      name: 'Database initializer',
      path: 'src/infra/storage/databaseInitializer.ts',
      required: true
    },
    {
      name: 'Updated UnihanRepository',
      path: 'src/infra/storage/unihanRepo.ts',
      required: true,
      checkContent: (content) => content.includes('DatabaseInitializer')
    },
    {
      name: 'Root database (fallback)',
      path: 'unihan.db',
      required: false
    }
  ];
  
  let allGood = true;
  
  checks.forEach(check => {
    const exists = fs.existsSync(check.path);
    let status = exists ? '✅' : '❌';
    let message = exists ? 'Found' : 'Missing';
    
    if (exists && check.checkContent) {
      const content = fs.readFileSync(check.path, 'utf8');
      const contentOk = check.checkContent(content);
      if (!contentOk) {
        status = '⚠️';
        message = 'Found but needs update';
      }
    }
    
    if (!exists && check.required) {
      allGood = false;
    }
    
    console.log(`${status} ${check.name}: ${message}`);
    
    if (exists && check.path.endsWith('.db')) {
      const stats = fs.statSync(check.path);
      console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    }
  });
  
  return allGood;
}

function showSummary() {
  console.log('\n📋 Fix Summary');
  console.log('==============');
  
  console.log('✅ **Problem**: "no such table: main.unihan"');
  console.log('   - Expo SQLite was creating empty database instead of using populated one');
  console.log('');
  
  console.log('✅ **Solution**: Asset-based database initialization');
  console.log('   1. Database moved to assets/databases/unihan.db');
  console.log('   2. DatabaseInitializer copies from assets to documents directory');
  console.log('   3. UnihanRepository uses proper path on mobile platforms');
  console.log('   4. Added table existence check before creating indexes');
  console.log('');
  
  console.log('🎯 **Next Steps**:');
  console.log('   1. Restart your development server');
  console.log('   2. Test on Android device/emulator');
  console.log('   3. Check console logs for "📱 Initializing database for mobile..."');
  console.log('   4. Verify "✅ Unihan database verified: XXXXX characters loaded"');
}

function main() {
  const setupComplete = checkSetupComplete();
  
  if (setupComplete) {
    console.log('\n🎉 Mobile database fix is ready!');
  } else {
    console.log('\n⚠️  Setup incomplete. Run: node scripts/setup_mobile_database.js');
  }
  
  showSummary();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { checkSetupComplete }; 