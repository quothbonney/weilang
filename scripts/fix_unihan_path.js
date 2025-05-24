#!/usr/bin/env node
/**
 * Quick fix for Unihan database path issues
 * Copies database to expected location and optionally updates configuration
 */

const fs = require('fs');
const path = require('path');

const FIXES = {
  COPY_DATABASE: 'copy',
  UPDATE_CONFIG: 'config',
  UPDATE_REPO: 'repo'
};

function copyDatabaseToAppLocation() {
  const sourceDb = path.join(__dirname, '../data/databases/unihan.db');
  const targetDb = 'unihan.db';
  
  console.log('📋 Copying database to app location...');
  console.log(`   From: ${sourceDb}`);
  console.log(`   To: ${targetDb}`);
  
  if (!fs.existsSync(sourceDb)) {
    console.error('❌ Source database not found!');
    console.error('   Run the ETL script first: python scripts/etl_unihan.py');
    return false;
  }
  
  try {
    fs.copyFileSync(sourceDb, targetDb);
    
    const stats = fs.statSync(targetDb);
    console.log(`✅ Database copied successfully (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    return true;
  } catch (error) {
    console.error('❌ Failed to copy database:', error.message);
    return false;
  }
}

function updateEnvConfig() {
  const envPath = 'env.ts';
  
  console.log('🔧 Updating env.ts configuration...');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ env.ts not found!');
    return false;
  }
  
  try {
    let content = fs.readFileSync(envPath, 'utf8');
    
    // Replace the UNIHAN_DB_PATH
    const oldLine = "export const UNIHAN_DB_PATH = 'unihan.db';";
    const newLine = "export const UNIHAN_DB_PATH = 'data/databases/unihan.db';";
    
    if (content.includes(oldLine)) {
      content = content.replace(oldLine, newLine);
      fs.writeFileSync(envPath, content);
      console.log('✅ env.ts updated with correct database path');
      return true;
    } else {
      console.log('⚠️  UNIHAN_DB_PATH not found or already updated in env.ts');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to update env.ts:', error.message);
    return false;
  }
}

function updateUnihanRepository() {
  const repoPath = 'src/infra/storage/unihanRepo.ts';
  
  console.log('🔧 Updating UnihanRepository default path...');
  
  if (!fs.existsSync(repoPath)) {
    console.error('❌ UnihanRepository not found!');
    return false;
  }
  
  try {
    let content = fs.readFileSync(repoPath, 'utf8');
    
    // Replace the default constructor parameter
    const oldLine = "constructor(dbPath: string = 'unihan.db')";
    const newLine = "constructor(dbPath: string = 'data/databases/unihan.db')";
    
    if (content.includes(oldLine)) {
      content = content.replace(oldLine, newLine);
      fs.writeFileSync(repoPath, content);
      console.log('✅ UnihanRepository updated with correct default path');
      return true;
    } else {
      console.log('⚠️  Constructor signature not found or already updated');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to update UnihanRepository:', error.message);
    return false;
  }
}

function checkCurrentState() {
  console.log('🔍 Current State Check');
  console.log('=====================');
  
  const sourceDb = path.join(__dirname, '../data/databases/unihan.db');
  const appDb = 'unihan.db';
  
  const sourceExists = fs.existsSync(sourceDb);
  const appExists = fs.existsSync(appDb);
  
  console.log(`Source DB (${sourceDb}): ${sourceExists ? '✅ Found' : '❌ Missing'}`);
  console.log(`App DB (${appDb}): ${appExists ? '✅ Found' : '❌ Missing'}`);
  
  if (sourceExists) {
    const stats = fs.statSync(sourceDb);
    console.log(`Source DB size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }
  
  if (appExists) {
    const stats = fs.statSync(appDb);
    console.log(`App DB size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }
  
  return { sourceExists, appExists };
}

function showUsage() {
  console.log('Usage: node scripts/fix_unihan_path.js [option]');
  console.log('');
  console.log('Options:');
  console.log('  copy    - Copy database to app location (quick fix)');
  console.log('  config  - Update env.ts with correct path');
  console.log('  repo    - Update UnihanRepository default path');
  console.log('  all     - Apply all fixes');
  console.log('  check   - Only check current state');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/fix_unihan_path.js copy');
  console.log('  node scripts/fix_unihan_path.js all');
}

async function main() {
  const args = process.argv.slice(2);
  const action = args[0] || 'check';
  
  console.log('🔧 Unihan Database Path Fix');
  console.log('===========================\n');
  
  const state = checkCurrentState();
  
  switch (action) {
    case 'copy':
      if (!state.sourceExists) {
        console.error('\n❌ Cannot copy: source database missing!');
        console.error('Run: python scripts/etl_unihan.py');
        process.exit(1);
      }
      copyDatabaseToAppLocation();
      break;
      
    case 'config':
      updateEnvConfig();
      break;
      
    case 'repo':
      updateUnihanRepository();
      break;
      
    case 'all':
      console.log('\n🔧 Applying all fixes...\n');
      let success = true;
      
      if (state.sourceExists) {
        success = copyDatabaseToAppLocation() && success;
      } else {
        console.log('⚠️  Skipping database copy (source missing)');
      }
      
      console.log('');
      success = updateEnvConfig() && success;
      console.log('');
      success = updateUnihanRepository() && success;
      
      console.log('\n' + (success ? '✅ All fixes applied successfully!' : '⚠️  Some fixes failed or were skipped'));
      break;
      
    case 'check':
      // Already checked above
      break;
      
    default:
      showUsage();
      break;
  }
  
  console.log('\n✨ Fix completed');
  
  if (action !== 'check') {
    console.log('\n💡 Next steps:');
    console.log('1. Restart your development server');
    console.log('2. Test the app on Android');
    console.log('3. Check that Unihan data loads properly');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { 
  copyDatabaseToAppLocation, 
  updateEnvConfig, 
  updateUnihanRepository, 
  checkCurrentState 
}; 