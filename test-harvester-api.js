#!/usr/bin/env node

/**
 * Test DocHarvester API endpoint
 */

async function testHarvesterAPI() {
  console.log('🌾 Testing DocHarvester API...\n');
  
  const testData = {
    base_url: "https://example.com",
    max_pages: 1,
    max_depth: 1,
    use_js: false
  };
  
  try {
    console.log('Sending request to: https://smart4technology.com/api/harvester');
    console.log('Payload:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('https://smart4technology.com/api/harvester', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`\nResponse Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('\n✅ API Response:');
      console.log(JSON.stringify(data, null, 2));
      
      if (data.success && data.results) {
        console.log(`\n🎉 Success! Harvested ${data.results.length} pages`);
        console.log(`📊 Summary: ${JSON.stringify(data.summary, null, 2)}`);
      }
    } else {
      const errorText = await response.text();
      console.log('\n❌ API Error:');
      console.log(errorText);
    }
    
  } catch (error) {
    console.log('\n❌ Request failed:');
    console.log(error.message);
  }
}

testHarvesterAPI();
