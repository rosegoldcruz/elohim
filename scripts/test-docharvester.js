#!/usr/bin/env node

/**
 * Test script for DocHarvester integration
 * Validates that all components are working correctly
 */

const http = require('http');
const https = require('https');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testEndpoint(name, url, options = {}) {
  try {
    log(`Testing ${name}...`, 'blue');
    const response = await makeRequest(url, options);
    
    if (response.status >= 200 && response.status < 300) {
      log(`✅ ${name} - OK (${response.status})`, 'green');
      return true;
    } else {
      log(`❌ ${name} - Failed (${response.status})`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${name} - Error: ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('🧪 Starting DocHarvester Integration Tests', 'yellow');
  log('=' .repeat(50), 'yellow');
  
  const tests = [
    {
      name: 'AEON Main App',
      url: 'http://localhost:3000',
    },
    {
      name: 'Docs Page',
      url: 'http://localhost:3000/docs',
    },
    {
      name: 'DocHarvester Page',
      url: 'http://localhost:3000/docs/docharvester',
    },
    {
      name: 'Our Docs Page',
      url: 'http://localhost:3000/docs/our-docs',
    },
    {
      name: 'DocHarvester Frontend (Direct)',
      url: 'http://localhost:3001',
    },
    {
      name: 'DocHarvester Backend Health',
      url: 'http://localhost:5001/health',
    },
    {
      name: 'DocHarvester API Proxy - Health',
      url: 'http://localhost:3000/api/docharvester/discover',
      options: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          base_url: 'https://docs.stripe.com',
          max_depth: 1
        })
      }
    }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  for (const test of tests) {
    const success = await testEndpoint(test.name, test.url, test.options);
    if (success) passed++;
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  log('=' .repeat(50), 'yellow');
  log(`📊 Test Results: ${passed}/${total} passed`, passed === total ? 'green' : 'red');
  
  if (passed === total) {
    log('🎉 All tests passed! DocHarvester integration is working correctly.', 'green');
  } else {
    log('⚠️  Some tests failed. Please check the services and try again.', 'yellow');
    log('', 'reset');
    log('Troubleshooting steps:', 'blue');
    log('1. Make sure Docker services are running:', 'reset');
    log('   docker-compose -f docker-compose.root.yml up -d', 'reset');
    log('2. Check service status:', 'reset');
    log('   docker-compose -f docker-compose.root.yml ps', 'reset');
    log('3. View logs for errors:', 'reset');
    log('   docker-compose -f docker-compose.root.yml logs', 'reset');
  }
  
  process.exit(passed === total ? 0 : 1);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  log('\n🛑 Tests interrupted by user', 'yellow');
  process.exit(1);
});

// Run tests
runTests().catch(error => {
  log(`💥 Test runner error: ${error.message}`, 'red');
  process.exit(1);
});
