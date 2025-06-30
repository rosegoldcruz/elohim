/**
 * Test script for the Universal Doc Harvester API
 * 
 * Usage:
 * node scripts/test-harvester.js
 */

const API_BASE = 'http://localhost:3000';

async function testHarvester() {
  console.log('🧪 Testing Universal Doc Harvester API...\n');

  // Test 1: Auto-discover from base URL
  console.log('📋 Test 1: Auto-discover documentation URLs');
  try {
    const response = await fetch(`${API_BASE}/api/harvester`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base_url: 'https://nextjs.org',
        max_depth: 1,
        use_js: false
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log(`📄 File: ${result.file}`);
      console.log(`📊 Count: ${result.count}`);
      console.log(`✅ Successful: ${result.successful}`);
      console.log(`❌ Failed: ${result.failed}`);
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Use specific URLs
  console.log('📋 Test 2: Harvest specific URLs');
  try {
    const response = await fetch(`${API_BASE}/api/harvester`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        urls: [
          'https://nextjs.org/docs',
          'https://nextjs.org/docs/getting-started'
        ],
        use_js: true
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log(`📄 File: ${result.file}`);
      console.log(`📊 Count: ${result.count}`);
      console.log(`✅ Successful: ${result.successful}`);
      console.log(`❌ Failed: ${result.failed}`);
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Error handling - no URLs provided
  console.log('📋 Test 3: Error handling (no URLs)');
  try {
    const response = await fetch(`${API_BASE}/api/harvester`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        max_depth: 2
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.log('✅ Expected error handled correctly:', result.error);
    } else {
      console.log('❌ Should have returned an error');
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n🏁 Testing complete!');
}

// Example usage patterns
function showUsageExamples() {
  console.log('\n📚 Usage Examples:\n');

  console.log('1. Auto-discover documentation:');
  console.log(`
POST /api/harvester
{
  "base_url": "https://docs.example.com",
  "max_depth": 2,
  "use_js": false
}
  `);

  console.log('2. Harvest specific URLs:');
  console.log(`
POST /api/harvester
{
  "urls": [
    "https://docs.example.com/api",
    "https://docs.example.com/guides"
  ],
  "use_js": true
}
  `);

  console.log('3. Deep crawl with JavaScript:');
  console.log(`
POST /api/harvester
{
  "base_url": "https://spa-docs.example.com",
  "max_depth": 3,
  "use_js": true
}
  `);
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  showUsageExamples();
  
  // Uncomment to run actual tests (requires server to be running)
  // testHarvester();
}
