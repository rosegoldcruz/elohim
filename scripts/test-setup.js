#!/usr/bin/env node

// Simple test script to verify AEON platform setup
import { runAllTests } from '../lib/test-connections.js'

async function main() {
  try {
    console.log('🧠 AEON Platform Setup Verification')
    console.log('=====================================\n')
    
    const results = await runAllTests()
    
    // Exit with appropriate code
    const envSuccess = results.environment.missing.length === 0
    const connectionSuccess = Object.values(results.connections).every(Boolean)
    
    if (envSuccess && connectionSuccess) {
      console.log('\n🎉 AEON platform is fully configured and ready!')
      process.exit(0)
    } else {
      console.log('\n⚠️  AEON platform setup needs attention.')
      process.exit(1)
    }
  } catch (error) {
    console.error('💥 Test script failed:', error)
    process.exit(1)
  }
}

main()
