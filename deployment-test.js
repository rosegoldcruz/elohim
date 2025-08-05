#!/usr/bin/env node

/**
 * AEON Platform Deployment Verification Script
 * Tests all critical endpoints to ensure successful deployment
 */

const BASE_URL = 'https://smart4technology.com';

const endpoints = [
  { path: '/', name: 'Homepage' },
  { path: '/api/health', name: 'Health Check API' },
  { path: '/docs/harvester', name: 'DocHarvester Page' },
  { path: '/studio', name: 'Studio Page' },
  { path: '/pricing', name: 'Pricing Page' }
];

async function testEndpoint(endpoint) {
  try {
    console.log(`Testing ${endpoint.name}...`);
    const response = await fetch(`${BASE_URL}${endpoint.path}`);
    
    if (response.ok) {
      console.log(`✅ ${endpoint.name}: ${response.status} OK`);
      return true;
    } else {
      console.log(`❌ ${endpoint.name}: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${endpoint.name}: Error - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🚀 AEON Platform Deployment Verification\n');
  console.log(`Testing deployment at: ${BASE_URL}\n`);
  
  let passed = 0;
  let total = endpoints.length;
  
  for (const endpoint of endpoints) {
    const success = await testEndpoint(endpoint);
    if (success) passed++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
  }
  
  console.log('\n📊 Test Results:');
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${Math.round((passed/total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 All tests passed! Deployment successful!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above.');
    process.exit(1);
  }
}

runTests().catch(console.error);
