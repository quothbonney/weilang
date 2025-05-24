#!/usr/bin/env node
/**
 * Minimal test for Unihan database connectivity and table existence
 * Helps diagnose "no such table: main.unihan" errors
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  expectedDbPath: path.join(__dirname, '../data/databases/unihan.db'),
  appDbPath: 'unihan.db', // What the app is looking for
  expectedTables: ['unihan', 'radicals'],
  testCharacters: ['一', '人', '水', '火']
};

function logResult(test, success, message) {
  const status = success ? '✅' : '❌';
  console.log(`${status} ${test}: ${message}`);
}

function checkDatabaseFile() {
  console.log('\n=== Database File Tests ===');
  
  // Check if database exists at expected location
  const dbExists = fs.existsSync(TEST_CONFIG.expectedDbPath);
  logResult('Database File Exists', dbExists, 
    dbExists ? `Found at ${TEST_CONFIG.expectedDbPath}` : `Missing at ${TEST_CONFIG.expectedDbPath}`);
  
  if (dbExists) {
    const stats = fs.statSync(TEST_CONFIG.expectedDbPath);
    logResult('Database Size', stats.size > 0, `${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }
  
  // Check if app can find database at its expected path
  const appDbExists = fs.existsSync(TEST_CONFIG.appDbPath);
  logResult('App Database Path', appDbExists, 
    appDbExists ? `Found at ${TEST_CONFIG.appDbPath}` : `Missing at ${TEST_CONFIG.appDbPath} (app's expected path)`);
  
  return dbExists;
}

async function testDatabaseConnection() {
  console.log('\n=== Database Connection Tests ===');
  
  try {
    // Try to import SQLite (Node.js compatible version)
    let sqlite3;
    try {
      sqlite3 = require('sqlite3').verbose();
    } catch (e) {
      console.log('❌ SQLite3 not available in Node.js, skipping connection tests');
      console.log('💡 Run: npm install sqlite3 --save-dev');
      return false;
    }

    return new Promise((resolve) => {
      const db = new sqlite3.Database(TEST_CONFIG.expectedDbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
          logResult('Database Connection', false, err.message);
          resolve(false);
          return;
        }
        
        logResult('Database Connection', true, 'Successfully opened database');
        
        // Test table existence
        let tablesChecked = 0;
        const totalTables = TEST_CONFIG.expectedTables.length;
        
        TEST_CONFIG.expectedTables.forEach(tableName => {
          db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
            tablesChecked++;
            
            if (err) {
              logResult(`Table ${tableName}`, false, err.message);
            } else {
              logResult(`Table ${tableName}`, !!row, row ? 'Table exists' : 'Table missing');
            }
            
            // Test some sample queries if unihan table exists
            if (tableName === 'unihan' && row) {
              db.get('SELECT COUNT(*) as count FROM unihan', (err, countRow) => {
                if (!err && countRow) {
                  logResult('Unihan Data Count', true, `${countRow.count} characters`);
                  
                  // Test sample character lookups
                  testSampleCharacters(db);
                }
              });
            }
            
            if (tablesChecked === totalTables) {
              db.close();
              resolve(true);
            }
          });
        });
      });
    });
  } catch (error) {
    logResult('Database Module', false, error.message);
    return false;
  }
}

function testSampleCharacters(db) {
  console.log('\n=== Sample Character Tests ===');
  
  TEST_CONFIG.testCharacters.forEach(char => {
    db.get('SELECT character, pinyin, definition, radical, total_strokes FROM unihan WHERE character = ?', [char], (err, row) => {
      if (err) {
        logResult(`Character ${char}`, false, err.message);
      } else if (row) {
        logResult(`Character ${char}`, true, `pinyin: ${row.pinyin || 'N/A'}, strokes: ${row.total_strokes || 'N/A'}`);
      } else {
        logResult(`Character ${char}`, false, 'Character not found in database');
      }
    });
  });
}

function suggestFixes() {
  console.log('\n=== Suggested Fixes ===');
  
  const dbExists = fs.existsSync(TEST_CONFIG.expectedDbPath);
  const appDbExists = fs.existsSync(TEST_CONFIG.appDbPath);
  
  if (dbExists && !appDbExists) {
    console.log('🔧 Path mismatch detected:');
    console.log(`   Database exists at: ${TEST_CONFIG.expectedDbPath}`);
    console.log(`   App looking for: ${TEST_CONFIG.appDbPath}`);
    console.log('');
    console.log('💡 Solutions:');
    console.log('   1. Copy database to app location:');
    console.log(`      cp "${TEST_CONFIG.expectedDbPath}" "${TEST_CONFIG.appDbPath}"`);
    console.log('');
    console.log('   2. Update app configuration to use correct path:');
    console.log('      Change UNIHAN_DB_PATH in env.ts to "data/databases/unihan.db"');
    console.log('');
    console.log('   3. Update UnihanRepository constructor to use full path');
  }
  
  if (!dbExists) {
    console.log('🔧 Database missing:');
    console.log('   1. Run data setup scripts:');
    console.log('      ./scripts/download_unihan.ps1');
    console.log('      python ./scripts/etl_unihan.py');
    console.log('');
    console.log('   2. Or run complete setup:');
    console.log('      ./scripts/setup_data.ps1');
  }
}

async function main() {
  console.log('🔍 Unihan Database Diagnostic Test');
  console.log('===================================');
  
  const dbExists = checkDatabaseFile();
  
  if (dbExists) {
    await testDatabaseConnection();
  }
  
  suggestFixes();
  
  console.log('\n✨ Test completed');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TEST_CONFIG, checkDatabaseFile, testDatabaseConnection }; 