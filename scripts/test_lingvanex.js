/**
 * Test script for Lingvanex API
 * Run with: node scripts/test_lingvanex.js
 */

const apiKey = '';
const url = 'https://api-b2b.backenster.com/b1/api/v3/translate';

const testWords = ['你好', '学习', '中文', '谢谢'];

async function testLingvanexAPI() {
  console.log('🔍 Testing Lingvanex API...\n');

  for (const word of testWords) {
    try {
      console.log(`Testing word: "${word}"`);
      
      const data = {
        platform: 'api',
        from: 'zh-Hans',
        to: 'en',
        data: word,
        translateMode: 'html',
        enableTransliteration: false
      };

      console.log('Request data:', JSON.stringify(data, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      console.log(`Response status: ${response.status} ${response.statusText}`);

      const result = await response.json();
      console.log('Response body:', JSON.stringify(result, null, 2));

      if (result.result) {
        console.log(`✅ SUCCESS: "${word}" → "${result.result}"`);
      } else if (result.err) {
        console.log(`❌ ERROR: ${result.err}`);
      } else {
        console.log(`⚠️ UNEXPECTED: No result or error field`);
      }

      console.log('---\n');

    } catch (error) {
      console.error(`❌ FETCH ERROR for "${word}":`, error.message);
      console.log('---\n');
    }
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ for built-in fetch support.');
  console.log('Please upgrade Node.js or install a fetch polyfill.');
  process.exit(1);
}

testLingvanexAPI(); 