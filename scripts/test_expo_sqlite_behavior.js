#!/usr/bin/env node
/**
 * Test to diagnose Expo SQLite behavior with existing database files
 * Checks if Expo is creating new databases vs using existing ones
 */

const fs = require('fs');
const path = require('path');

function checkDatabaseTables() {
  console.log('🔍 Database Table Analysis');
  console.log('==========================\n');
  
  const dbPath = 'unihan.db';
  
  if (!fs.existsSync(dbPath)) {
    console.log('❌ Database file not found at:', dbPath);
    return;
  }
  
  try {
    const sqlite3 = require('sqlite3').verbose();
    
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error('❌ Failed to open database:', err.message);
        return;
      }
      
      console.log('✅ Successfully opened database:', dbPath);
      
      // Check what tables exist
      db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
          console.error('❌ Failed to query tables:', err.message);
          db.close();
          return;
        }
        
        console.log('\n📋 Tables in database:');
        if (tables.length === 0) {
          console.log('⚠️  No tables found! Database appears to be empty.');
        } else {
          tables.forEach(table => {
            console.log(`   ✅ ${table.name}`);
          });
        }
        
        // Check unihan table specifically
        const hasUnihan = tables.some(t => t.name === 'unihan');
        const hasRadicals = tables.some(t => t.name === 'radicals');
        
        console.log('\n🎯 Required tables:');
        console.log(`   unihan: ${hasUnihan ? '✅ Found' : '❌ Missing'}`);
        console.log(`   radicals: ${hasRadicals ? '✅ Found' : '❌ Missing'}`);
        
        if (hasUnihan) {
          // Check unihan table structure
          db.all("PRAGMA table_info(unihan)", [], (err, columns) => {
            if (err) {
              console.error('❌ Failed to get unihan table info:', err.message);
            } else {
              console.log('\n🏗️  Unihan table structure:');
              columns.forEach(col => {
                console.log(`   ${col.name} (${col.type})`);
              });
              
              // Check row count
              db.get("SELECT COUNT(*) as count FROM unihan", [], (err, result) => {
                if (err) {
                  console.error('❌ Failed to count unihan rows:', err.message);
                } else {
                  console.log(`\n📊 Unihan table has ${result.count} rows`);
                }
                
                db.close();
              });
            }
          });
        } else {
          db.close();
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Error accessing database:', error.message);
  }
}

function suggestFixes() {
  console.log('\n🔧 Potential Solutions');
  console.log('======================');
  
  console.log('1. 📱 **Expo SQLite Database Location Issue**:');
  console.log('   - Expo SQLite might create databases in app documents directory');
  console.log('   - Your database file might not be accessible to the app');
  console.log('');
  
  console.log('2. 🗂️  **Asset Bundling Solution**:');
  console.log('   - Move database to assets folder');
  console.log('   - Copy to app documents directory on startup');
  console.log('');
  
  console.log('3. 🛠️  **Immediate Fix - Update UnihanRepository**:');
  console.log('   - Add table existence check before creating indexes');
  console.log('   - Create tables if they don\'t exist');
  console.log('   - Better error handling');
  console.log('');
  
  console.log('4. 📋 **Database Verification**:');
  console.log('   - Check if app is creating empty database');
  console.log('   - Verify table creation during app startup');
}

function createImprovedRepository() {
  console.log('\n🔧 Creating Improved Repository Fix');
  console.log('===================================');
  
  const fixes = `
// Add this method to UnihanRepository class:

private async ensureTablesExist(): Promise<void> {
  if (!this.db) throw new Error('Database not initialized');

  // Check if unihan table exists
  const tableExists = await this.db.getFirstAsync(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='unihan'"
  );

  if (!tableExists) {
    console.warn('⚠️  Unihan table not found. Database may be empty or corrupted.');
    console.warn('🔧 Consider running the ETL script or checking database path.');
    
    // Optionally create empty tables as fallback
    // await this.createEmptyTables();
    
    throw new Error('Unihan table not found in database. Run ETL script to populate database.');
  }
}

// Update the initialize method:
async initialize(): Promise<void> {
  try {
    console.log(\`Initializing Unihan database: \${this.dbPath} on \${this.isWebPlatform ? 'web' : 'native'} platform\`);
    
    this.db = await SQLite.openDatabaseAsync(this.dbPath);
    
    // IMPORTANT: Check tables exist before creating indexes
    await this.ensureTablesExist();
    await this.createIndexes();
    
    this.initializationError = null;
    console.log('Unihan database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Unihan database:', error);
    this.initializationError = error instanceof Error ? error.message : 'Unknown database error';
    throw error;
  }
}
`;

  console.log(fixes);
}

async function main() {
  console.log('🧪 Expo SQLite Behavior Test');
  console.log('============================\n');
  
  checkDatabaseTables();
  
  // Give some time for async operations
  setTimeout(() => {
    suggestFixes();
    createImprovedRepository();
  }, 2000);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
} 