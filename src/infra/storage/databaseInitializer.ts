/**
 * Database initializer for mobile apps
 * Copies database from assets to documents directory
 */

import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

export class DatabaseInitializer {
  private static isInitialized = false;
  
  static async initializeDatabase(
    dbFileName = 'unihan.db'
  ): Promise<string> {
    if (this.isInitialized) {
      const dbPath = `${FileSystem.documentDirectory}${dbFileName}`;
      return dbPath;
    }
    
    try {
      console.log('📱 Initializing database for mobile...');
      
      // Load database asset - use static require instead of dynamic
      const asset = Asset.fromModule(require('../../../assets/databases/unihan.db'));
      await asset.downloadAsync();

      // Copy to documents directory
      const dbPath = `${FileSystem.documentDirectory}${dbFileName}`;
      
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
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }
}
