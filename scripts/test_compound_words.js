/**
 * Test compound words to understand character meanings in context
 */

const apiKey = '';
const url = 'https://api-b2b.backenster.com/b1/api/v3/translate';

const compounds = [
  { word: '科学', chars: ['科', '学'] },
  { word: '研究', chars: ['研', '究'] },
  { word: '科技', chars: ['科', '技'] },
  { word: '研发', chars: ['研', '发'] }
];

async function testCompounds() {
  console.log('🔍 Testing compound words vs individual characters...\n');

  for (const compound of compounds) {
    console.log(`=== Testing compound: ${compound.word} ===`);
    
    // Test the compound word
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform: 'api',
          from: 'zh-Hans',
          to: 'en',
          data: compound.word,
          translateMode: 'html',
          enableTransliteration: false
        })
      });

      const result = await response.json();
      
      if (result.result) {
        console.log(`Compound "${compound.word}" → "${result.result.trim()}"`);
      }
    } catch (error) {
      console.error(`Error testing compound: ${error.message}`);
    }

    // Test individual characters
    for (const char of compound.chars) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            platform: 'api',
            from: 'zh-Hans',
            to: 'en',
            data: char,
            translateMode: 'html',
            enableTransliteration: false
          })
        });

        const result = await response.json();
        
        if (result.result) {
          console.log(`Character "${char}" → "${result.result.trim()}"`);
        }
      } catch (error) {
        console.error(`Error testing character: ${error.message}`);
      }
    }
    
    console.log('---\n');
  }
}

if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ for built-in fetch support.');
  process.exit(1);
}

testCompounds(); 