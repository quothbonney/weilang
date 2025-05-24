/**
 * Test individual Chinese characters with Lingvanex API
 */

const apiKey = '';
const url = 'https://api-b2b.backenster.com/b1/api/v3/translate';

const testChars = ['科', '研', '学', '习'];

async function testIndividualChars() {
  console.log('🔍 Testing individual Chinese characters...\n');

  for (const char of testChars) {
    try {
      console.log(`Testing character: "${char}"`);
      
      const data = {
        platform: 'api',
        from: 'zh-Hans',
        to: 'en',
        data: char,
        translateMode: 'html',
        enableTransliteration: false
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (result.result) {
        const translation = result.result.trim();
        console.log(`✅ "${char}" → "${translation}" (length: ${translation.length})`);
      } else if (result.err) {
        console.log(`❌ ERROR: ${result.err}`);
      }

      console.log('---\n');

    } catch (error) {
      console.error(`❌ ERROR for "${char}":`, error.message);
      console.log('---\n');
    }
  }
}

if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ for built-in fetch support.');
  process.exit(1);
}

testIndividualChars(); 