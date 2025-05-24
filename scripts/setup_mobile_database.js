#!/usr/bin/env node
/**
 * Sets up the Unihan database for mobile deployment
 * Moves database to assets folder and creates proper configuration
 */

const fs = require('fs');
const path = require('path');

function setupAssetsDirectory() {
  const assetsDir = 'assets';
  const databasesDir = path.join(assetsDir, 'databases');
  
  console.log('📁 Setting up assets directory structure...');
  
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
    console.log('✅ Created assets/ directory');
  }
  
  if (!fs.existsSync(databasesDir)) {
    fs.mkdirSync(databasesDir);
    console.log('✅ Created assets/databases/ directory');
  }
  
  return databasesDir;
}

function copyDatabaseToAssets() {
  const sourceDb = path.join(__dirname, '../data/databases/unihan.db');
  const targetDir = setupAssetsDirectory();
  const targetDb = path.join(targetDir, 'unihan.db');
  
  console.log('📋 Copying database to assets...');
  console.log(`   From: ${sourceDb}`);
  console.log(`   To: ${targetDb}`);
  
  if (!fs.existsSync(sourceDb)) {
    console.error('❌ Source database not found!');
    console.error('   Run: python scripts/etl_unihan.py');
    return false;
  }
  
  try {
    fs.copyFileSync(sourceDb, targetDb);
    
    const stats = fs.statSync(targetDb);
    console.log(`✅ Database copied to assets (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    return true;
  } catch (error) {
    console.error('❌ Failed to copy database:', error.message);
    return false;
  }
}

function updateAppConfig() {
  const configPath = 'app.config.ts';
  
  console.log('🔧 Updating app.config.ts...');
  
  if (!fs.existsSync(configPath)) {
    console.error('❌ app.config.ts not found!');
    return false;
  }
  
  try {
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Add database to assets if not already there
    if (!content.includes('assets/databases/unihan.db')) {
      // Look for the assets array
      const assetsRegex = /assets:\s*\[([\s\S]*?)\]/;
      const match = content.match(assetsRegex);
      
      if (match) {
        const assetsContent = match[1];
        const newAssetsContent = assetsContent.trim() 
          ? `${assetsContent.trim()},\n      "assets/databases/unihan.db"`
          : `"assets/databases/unihan.db"`;
        
        content = content.replace(assetsRegex, `assets: [\n      ${newAssetsContent}\n    ]`);
      } else {
        // Add assets array if it doesn't exist
        const exportMatch = content.match(/export\s+default\s*\{([^}]*)\}/s);
        if (exportMatch) {
          const configContent = exportMatch[1];
          const newConfigContent = `${configContent.trim()},\n    assets: [\n      "assets/databases/unihan.db"\n    ]`;
          content = content.replace(/export\s+default\s*\{([^}]*)\}/s, `export default {${newConfigContent}\n  }`);
        }
      }
      
      fs.writeFileSync(configPath, content);
      console.log('✅ Updated app.config.ts with database asset');
      return true;
    } else {
      console.log('⚠️  Database already in app.config.ts assets');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to update app.config.ts:', error.message);
    return false;
  }
}

function createDatabaseInitializer() {
  const initializerPath = 'src/infra/storage/databaseInitializer.ts';
  
  console.log('📄 Creating database initializer...');
  
  // Ensure directory exists
  const dir = path.dirname(initializerPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const initializerCode = `/**
 * Database initializer for mobile apps
 * Copies database from assets to documents directory
 */

import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

export class DatabaseInitializer {
  private static isInitialized = false;
  
  static async initializeDatabase(): Promise<string> {
    if (this.isInitialized) {
      const dbPath = \`\${FileSystem.documentDirectory}unihan.db\`;
      return dbPath;
    }
    
    try {
      console.log('📱 Initializing database for mobile...');
      
      // Load database asset
      const asset = Asset.fromModule(require('../../../assets/databases/unihan.db'));
      await asset.downloadAsync();
      
      // Copy to documents directory
      const dbPath = \`\${FileSystem.documentDirectory}unihan.db\`;
      
      // Check if database already exists
      const dbExists = await FileSystem.getInfoAsync(dbPath);
      
      if (!dbExists.exists && asset.localUri) {
        console.log('📋 Copying database to documents directory...');
        await FileSystem.copyAsync({
          from: asset.localUri,
          to: dbPath
        });
        console.log('✅ Database copied successfully');
      }
      
      this.isInitialized = true;
      return dbPath;
      
    } catch (error) {
      console.error('❌ Failed to initialize database:', error);
      throw new Error(\`Failed to initialize database: \${error}\`);
    }
  }
}
`;

  try {
    fs.writeFileSync(initializerPath, initializerCode);
    console.log('✅ Created database initializer');
    return true;
  } catch (error) {
    console.error('❌ Failed to create initializer:', error.message);
    return false;
  }
}

function updateEnvConfig() {
  const envPath = 'env.ts';
  
  console.log('🔧 Updating env.ts for mobile database...');
  
  if (!fs.existsSync(envPath)) {
    console.error('❌ env.ts not found!');
    return false;
  }
  
  try {
    let content = fs.readFileSync(envPath, 'utf8');
    
    // Add mobile database configuration
    if (!content.includes('MOBILE_UNIHAN_DB')) {
      const addition = `
// Mobile database configuration
export const MOBILE_UNIHAN_DB = true; // Use asset-based database initialization
export const UNIHAN_ASSET_PATH = 'assets/databases/unihan.db';`;
      
      content = content + addition;
      fs.writeFileSync(envPath, content);
      console.log('✅ Added mobile database configuration to env.ts');
      return true;
    } else {
      console.log('⚠️  Mobile database config already exists');
      return true;
    }
  } catch (error) {
    console.error('❌ Failed to update env.ts:', error.message);
    return false;
  }
}

function showNextSteps() {
  console.log('\n📋 Next Steps');
  console.log('=============');
  
  console.log('1. 🔄 Update UnihanRepository to use DatabaseInitializer:');
  console.log('   ```typescript');
  console.log('   import { DatabaseInitializer } from "./databaseInitializer";');
  console.log('   ');
  console.log('   // In constructor or initialize method:');
  console.log('   const dbPath = await DatabaseInitializer.initializeDatabase();');
  console.log('   this.db = await SQLite.openDatabaseAsync(dbPath);');
  console.log('   ```');
  console.log('');
  
  console.log('2. 📱 Install required dependencies:');
  console.log('   npm install expo-file-system expo-asset');
  console.log('');
  
  console.log('3. 🔄 Restart your development server');
  console.log('');
  
  console.log('4. 🧪 Test on Android device/emulator');
}

async function main() {
  const args = process.argv.slice(2);
  const skipSteps = args.includes('--quick');
  
  console.log('📱 Mobile Database Setup');
  console.log('========================\n');
  
  let success = true;
  
  success = copyDatabaseToAssets() && success;
  console.log('');
  
  if (!skipSteps) {
    success = updateAppConfig() && success;
    console.log('');
    
    success = createDatabaseInitializer() && success;
    console.log('');
    
    success = updateEnvConfig() && success;
    console.log('');
  }
  
  if (success) {
    console.log('✅ Mobile database setup completed!');
    showNextSteps();
  } else {
    console.log('⚠️  Some steps failed. Check errors above.');
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { 
  copyDatabaseToAssets, 
  updateAppConfig, 
  createDatabaseInitializer,
  updateEnvConfig 
}; 