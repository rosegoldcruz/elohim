#!/usr/bin/env node

/**
 * AEON Build Test Script
 * Tests that all admin system imports work correctly
 */

console.log('🧪 Testing AEON Admin System Build...')

// Test server-side imports
if (typeof window === 'undefined') {
  console.log('✅ Running on server side - testing imports...')
  
  try {
    // Test admin agent
    const { adminAgent } = require('../lib/agents/adminAgent')
    console.log('✅ AdminAgent imported successfully')
    
    // Test exporter
    const { exporter } = require('../lib/analytics/exporter')
    console.log('✅ Exporter imported successfully')
    
    // Test fraud monitor
    const { fraudMonitor } = require('../lib/analytics/fraudMonitor')
    console.log('✅ FraudMonitor imported successfully')
    
    // Test emailer
    const { emailer } = require('../lib/utils/emailer')
    console.log('✅ Emailer imported successfully')
    
    // Test cron scheduler
    const { cronScheduler } = require('../lib/cron/scheduler')
    console.log('✅ CronScheduler imported successfully')
    
    // Test storage
    const { exportStorage } = require('../lib/storage/exportStorage')
    console.log('✅ ExportStorage imported successfully')
    
    console.log('🎉 All admin system imports successful!')
    
  } catch (error) {
    console.error('❌ Import test failed:', error.message)
    process.exit(1)
  }
} else {
  console.log('🌐 Running on client side - skipping server imports')
}

console.log('✅ Build test completed successfully!')
