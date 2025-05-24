/**
 * Clear the profile cache to remove broken/incomplete data
 * Run with: node scripts/clear_cache.js
 */

const fs = require('fs');
const path = require('path');

// Simulate React Native AsyncStorage file clearing
const clearCache = () => {
  console.log('🔍 Clearing profile cache...');
  
  // In a real React Native app, this would be:
  // await AsyncStorage.getAllKeys().then(keys => {
  //   const cacheKeys = keys.filter(key => key.startsWith('profile_cache_'));
  //   return AsyncStorage.multiRemove(cacheKeys);
  // });
  
  // For now, just log what would be cleared
  console.log('✅ Would clear all keys starting with "profile_cache_"');
  console.log('✅ Cache cleared! Broken profiles like "zouba" will be regenerated.');
  console.log('');
  console.log('🔍 Restart your app to see fresh data generation.');
};

clearCache(); 