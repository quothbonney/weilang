/**
 * Test that mimics exactly what the app does (same timeouts, same structure)
 */

const apiKey = 'a_PB1BUkyso2SnP1HPzowYQkQfeRPu5lxbiXALYPft25rz56vYvjzNzodEx5B1dmiy5wPxU6Ng0aVuseo1';
const url = 'https://api-b2b.backenster.com/b1/api/v3/translate';
const timeout = 5000; // Same as app

async function makeRequest(data) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log(`🔍 Request timeout after ${timeout}ms`);
    controller.abort();
  }, timeout);

  console.log(`🔍 Starting request...`);

  try {
    console.log(`🔍 Calling fetch...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    console.log(`🔍 Fetch completed with status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log(`🔍 Parsing JSON...`);
    const result = await response.json();
    console.log(`🔍 Request completed successfully`);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`🔍 Request failed:`, error);
    throw error;
  }
}

async function testCharacterAnalysis() {
  console.log('🔍 Testing character analysis like the app...\n');

  const hanzi = '科研';
  const chars = hanzi.split('');

  // Test parallel requests like the app does
  const promises = chars.map(async (char, index) => {
    try {
      console.log(`🔍 Getting meaning for "${char}"...`);
      const result = await makeRequest({
        platform: 'api',
        from: 'zh-Hans',
        to: 'en',
        data: char,
        translateMode: 'html',
        enableTransliteration: false
      });

      const meaning = result.result?.trim() || 'unknown';
      console.log(`✅ "${char}" → "${meaning}"`);
      return { char, meaning };
    } catch (error) {
      console.error(`❌ Failed for "${char}":`, error.message);
      return { char, meaning: 'failed' };
    }
  });

  console.log('🔍 Waiting for all parallel requests...');
  const results = await Promise.all(promises);
  console.log('🔍 All requests completed:', results);
}

if (typeof fetch === 'undefined') {
  console.error('❌ This script requires Node.js 18+ for built-in fetch support.');
  process.exit(1);
}

testCharacterAnalysis(); 