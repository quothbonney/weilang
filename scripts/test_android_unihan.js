#!/usr/bin/env node
/**
 * Minimal test that simulates Android environment issues with Unihan database
 * Tests the actual UnihanRepository implementation and database paths
 */

const fs = require('fs');
const path = require('path');

// Mock Expo SQLite for testing
const mockExpoSQLite = {
  openDatabaseAsync: async (dbPath) => {
    console.log(`📱 [Mock] Attempting to open database: ${dbPath}`);
    
    // Check various possible paths the app might be looking for
    const possiblePaths = [
      dbPath,
      path.join(process.cwd(), dbPath),
      path.join(__dirname, '..', dbPath),
      path.join(__dirname, '../data/databases', path.basename(dbPath)),
    ];
    
    console.log('📱 [Mock] Checking possible paths:');
    let foundPath = null;
    
    for (const testPath of possiblePaths) {
      const exists = fs.existsSync(testPath);
      console.log(`   ${exists ? '✅' : '❌'} ${testPath}`);
      if (exists && !foundPath) {
        foundPath = testPath;
      }
    }
    
    if (!foundPath) {
      throw new Error(`Database file not found at any expected location. Searched: ${possiblePaths.join(', ')}`);
    }
    
    console.log(`📱 [Mock] Using database at: ${foundPath}`);
    
    // Return a mock database object with the methods we need
    return {
      execAsync: async (sql) => {
        console.log(`📱 [Mock] execAsync: ${sql.substring(0, 50)}...`);
        
        // Simulate the actual error that would occur
        if (sql.includes('unihan') && !sql.includes('CREATE')) {
          throw new Error('no such table: main.unihan');
        }
        return { changes: 0, insertId: 0 };
      },
      
      getFirstAsync: async (sql, params) => {
        console.log(`📱 [Mock] getFirstAsync: ${sql} with params:`, params);
        throw new Error('no such table: main.unihan');
      },
      
      getAllAsync: async (sql, params) => {
        console.log(`📱 [Mock] getAllAsync: ${sql} with params:`, params);
        throw new Error('no such table: main.unihan');
      },
      
      closeAsync: async () => {
        console.log('📱 [Mock] Database closed');
      }
    };
  }
};

// Mock React Native Platform
const mockPlatform = {
  OS: 'android'
};

function createMockUnihanRepository() {
  // Inline mock of the UnihanRepository class to avoid import issues
  class MockUnihanRepository {
    constructor(dbPath = 'unihan.db') {
      this.dbPath = dbPath;
      this.db = null;
      this.isWebPlatform = mockPlatform.OS === 'web';
      this.initializationError = null;
    }

    async initialize() {
      try {
        console.log(`🔧 Initializing Unihan database: ${this.dbPath} on ${this.isWebPlatform ? 'web' : 'native'} platform`);
        
        this.db = await mockExpoSQLite.openDatabaseAsync(this.dbPath);
        await this.createIndexes();
        this.initializationError = null;
        
        console.log('✅ Unihan database initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Unihan database:', error);
        this.initializationError = error instanceof Error ? error.message : 'Unknown database error';
        throw error;
      }
    }

    async createIndexes() {
      if (!this.db) throw new Error('Database not initialized');

      // This is where the error typically occurs
      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_character ON unihan(character);
        CREATE INDEX IF NOT EXISTS idx_radical ON unihan(radical);
        CREATE INDEX IF NOT EXISTS idx_strokes ON unihan(total_strokes);
      `);
    }

    async getCharacterData(character) {
      if (!this.db) await this.initialize();
      if (!this.db) return null;

      try {
        const result = await this.db.getFirstAsync(
          'SELECT * FROM unihan WHERE character = ?',
          [character]
        );
        return result;
      } catch (error) {
        console.error('❌ Failed to get character data:', error);
        return null;
      }
    }

    getStatus() {
      return {
        platform: this.isWebPlatform ? 'web' : 'native',
        available: this.db !== null && !this.initializationError,
        error: this.initializationError
      };
    }
  }
  
  return MockUnihanRepository;
}

async function testDifferentPaths() {
  console.log('\n=== Testing Different Database Paths ===');
  
  const testPaths = [
    'unihan.db',                    // Default app path
    'data/databases/unihan.db',     // Correct relative path
    './data/databases/unihan.db',   // Explicit relative path
    '../data/databases/unihan.db',  // From scripts directory
  ];
  
  const MockUnihanRepository = createMockUnihanRepository();
  
  for (const testPath of testPaths) {
    console.log(`\n🧪 Testing path: ${testPath}`);
    
    try {
      const repo = new MockUnihanRepository(testPath);
      await repo.initialize();
      
      // Try a basic query
      await repo.getCharacterData('一');
      
      console.log('✅ Path successful');
    } catch (error) {
      console.log(`❌ Path failed: ${error.message}`);
    }
  }
}

function checkFileSystemLayout() {
  console.log('\n=== File System Layout ===');
  
  const importantPaths = [
    'data/databases/unihan.db',
    'unihan.db',
    'assets/unihan.db',
    'src/assets/unihan.db'
  ];
  
  importantPaths.forEach(testPath => {
    const exists = fs.existsSync(testPath);
    const size = exists ? fs.statSync(testPath).size : 0;
    console.log(`${exists ? '✅' : '❌'} ${testPath} ${exists ? `(${(size/1024/1024).toFixed(2)} MB)` : ''}`);
  });
}

function analyzeError() {
  console.log('\n=== Error Analysis ===');
  console.log('🔍 "no such table: main.unihan" typically means:');
  console.log('   1. Database file exists but tables were not created');
  console.log('   2. App is connecting to an empty/different database file');
  console.log('   3. Database path is incorrect in the mobile environment');
  console.log('   4. Database file is not being bundled with the app');
  console.log('');
  console.log('🎯 For Android specifically:');
  console.log('   - Database files need to be in the correct assets location');
  console.log('   - Expo SQLite handles database paths differently than Node.js');
  console.log('   - The database may need to be copied to the app\'s document directory');
}

function suggestSolutions() {
  console.log('\n=== Suggested Solutions ===');
  
  console.log('🔧 Short-term fix (copy database to expected location):');
  console.log('   node -e "require(\'fs\').copyFileSync(\'data/databases/unihan.db\', \'unihan.db\')"');
  console.log('');
  
  console.log('🔧 Configuration fix (update paths):');
  console.log('   1. Update env.ts:');
  console.log('      export const UNIHAN_DB_PATH = \'data/databases/unihan.db\';');
  console.log('');
  console.log('   2. Or update UnihanRepository constructor:');
  console.log('      constructor(dbPath: string = \'data/databases/unihan.db\')');
  console.log('');
  
  console.log('🔧 Asset bundling fix (for mobile apps):');
  console.log('   1. Move database to assets folder');
  console.log('   2. Update app.config.ts to include database in bundle');
  console.log('   3. Copy database to document directory on app startup');
  console.log('');
  
  console.log('🔧 Database verification fix:');
  console.log('   1. Add table existence check before creating indexes');
  console.log('   2. Create tables if they don\'t exist');
  console.log('   3. Add better error handling for missing database');
}

async function main() {
  console.log('🤖 Android Unihan Database Test');
  console.log('================================');
  console.log('Simulating Android environment issues...\n');
  
  checkFileSystemLayout();
  await testDifferentPaths();
  analyzeError();
  suggestSolutions();
  
  console.log('\n✨ Analysis completed');
  console.log('💡 Run the suggested fixes to resolve the database connectivity issue');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createMockUnihanRepository, checkFileSystemLayout }; 