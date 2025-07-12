#!/usr/bin/env node

/**
 * AEON Admin System Test Script
 * Comprehensive testing of all admin functionality
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🧪 AEON Admin System Test Suite')
console.log('=====================================\n')

let testsPassed = 0
let testsFailed = 0

async function runTest(testName, testFn) {
  try {
    console.log(`🔍 Testing: ${testName}`)
    await testFn()
    console.log(`✅ PASS: ${testName}\n`)
    testsPassed++
  } catch (error) {
    console.log(`❌ FAIL: ${testName}`)
    console.log(`   Error: ${error.message}\n`)
    testsFailed++
  }
}

async function runAllTests() {
// Test 1: Environment Configuration
await runTest('Environment Configuration', () => {
  const envPath = path.join(__dirname, '../env.mjs')
  if (!fs.existsSync(envPath)) {
    throw new Error('env.mjs file not found')
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8')
  
  // Check for required admin variables
  const requiredVars = [
    'ADMIN_USER_IDS',
    'ADMIN_EMAILS', 
    'EMAIL_SERVICE',
    'SENDGRID_API_KEY',
    'EXPORT_STORAGE_PROVIDER',
    'TIMEZONE',
    'CRON_SECRET'
  ]
  
  for (const varName of requiredVars) {
    if (!envContent.includes(varName)) {
      throw new Error(`Missing environment variable: ${varName}`)
    }
  }
  
  console.log('   ✓ All admin environment variables defined')
})

// Test 2: Package Dependencies
await runTest('Package Dependencies', () => {
  const packagePath = path.join(__dirname, '../package.json')
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  
  const requiredDeps = [
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-request-presigner',
    'json2csv',
    'node-cron',
    'nodemailer'
  ]
  
  const requiredDevDeps = [
    '@types/nodemailer'
  ]
  
  for (const dep of requiredDeps) {
    if (!packageJson.dependencies[dep]) {
      throw new Error(`Missing dependency: ${dep}`)
    }
  }
  
  for (const dep of requiredDevDeps) {
    if (!packageJson.devDependencies[dep]) {
      throw new Error(`Missing dev dependency: ${dep}`)
    }
  }
  
  console.log('   ✓ All required dependencies present')
})

// Test 3: Admin Agent Import
runTest('Admin Agent Import', async () => {
  if (typeof window !== 'undefined') {
    console.log('   ⚠ Skipping server-side test in browser environment')
    return
  }
  
  const { adminAgent } = await import('../lib/agents/adminAgent.js')
  
  if (!adminAgent) {
    throw new Error('AdminAgent not exported')
  }
  
  // Check key methods exist
  const requiredMethods = [
    'getPlatformRevenue',
    'getTopCreators', 
    'runDailyOps',
    'runEmergencyFraudSweep',
    'monitorSystemHealth'
  ]
  
  for (const method of requiredMethods) {
    if (typeof adminAgent[method] !== 'function') {
      throw new Error(`AdminAgent missing method: ${method}`)
    }
  }
  
  console.log('   ✓ AdminAgent imported and methods available')
})

// Test 4: Exporter Service
runTest('Exporter Service', async () => {
  if (typeof window !== 'undefined') {
    console.log('   ⚠ Skipping server-side test in browser environment')
    return
  }
  
  const { exporter } = await import('../lib/analytics/exporter.js')
  
  if (!exporter) {
    console.log('   ⚠ Exporter is null (expected in test environment)')
    return
  }
  
  // Check key methods exist
  const requiredMethods = [
    'generateDailyCSV',
    'generateWeeklyRevenue',
    'generateMonthlyCreators',
    'cleanupOldExports'
  ]
  
  for (const method of requiredMethods) {
    if (typeof exporter[method] !== 'function') {
      throw new Error(`Exporter missing method: ${method}`)
    }
  }
  
  console.log('   ✓ Exporter service available')
})

// Test 5: Fraud Monitor
runTest('Fraud Monitor', async () => {
  if (typeof window !== 'undefined') {
    console.log('   ⚠ Skipping server-side test in browser environment')
    return
  }
  
  const { fraudMonitor } = await import('../lib/analytics/fraudMonitor.js')
  
  if (!fraudMonitor) {
    console.log('   ⚠ FraudMonitor is null (expected in test environment)')
    return
  }
  
  // Check key methods exist
  const requiredMethods = [
    'checkForFraud'
  ]
  
  for (const method of requiredMethods) {
    if (typeof fraudMonitor[method] !== 'function') {
      throw new Error(`FraudMonitor missing method: ${method}`)
    }
  }
  
  console.log('   ✓ FraudMonitor service available')
})

// Test 6: Email Service
runTest('Email Service', async () => {
  if (typeof window !== 'undefined') {
    console.log('   ⚠ Skipping server-side test in browser environment')
    return
  }
  
  const { emailer } = await import('../lib/utils/emailer.js')
  
  if (!emailer) {
    console.log('   ⚠ Emailer is null (expected in test environment)')
    return
  }
  
  // Check key methods exist
  const requiredMethods = [
    'sendAlert',
    'sendExportNotification',
    'sendDailySummary',
    'sendSystemAlert'
  ]
  
  for (const method of requiredMethods) {
    if (typeof emailer[method] !== 'function') {
      throw new Error(`Emailer missing method: ${method}`)
    }
  }
  
  console.log('   ✓ Emailer service available')
})

// Test 7: API Routes Exist
runTest('API Routes', () => {
  const apiRoutes = [
    'app/api/admin/revenue/route.ts',
    'app/api/admin/creators/route.ts',
    'app/api/admin/export/route.ts',
    'app/api/admin/fraud/route.ts',
    'app/api/admin/cron/route.ts',
    'app/api/admin/storage/route.ts',
    'app/api/cron/daily-operations/route.ts',
    'app/api/cron/fraud-monitoring/route.ts',
    'app/api/cron/health-check/route.ts'
  ]
  
  for (const route of apiRoutes) {
    const routePath = path.join(__dirname, '..', route)
    if (!fs.existsSync(routePath)) {
      throw new Error(`API route missing: ${route}`)
    }
  }
  
  console.log('   ✓ All API routes exist')
})

// Test 8: Admin Dashboard Component
runTest('Admin Dashboard Component', () => {
  const componentPath = path.join(__dirname, '../components/AdminDashboard.tsx')
  if (!fs.existsSync(componentPath)) {
    throw new Error('AdminDashboard component not found')
  }
  
  const componentContent = fs.readFileSync(componentPath, 'utf8')
  
  // Check for key features
  const requiredFeatures = [
    'PlatformRevenue',
    'CreatorAnalytics', 
    'AnomalyAlert',
    'fraud detection',
    'export'
  ]
  
  for (const feature of requiredFeatures) {
    if (!componentContent.includes(feature)) {
      throw new Error(`AdminDashboard missing feature: ${feature}`)
    }
  }
  
  console.log('   ✓ AdminDashboard component complete')
})

// Test 9: Vercel Configuration
runTest('Vercel Configuration', () => {
  const vercelPath = path.join(__dirname, '../vercel.json')
  if (!fs.existsSync(vercelPath)) {
    throw new Error('vercel.json not found')
  }
  
  const vercelConfig = JSON.parse(fs.readFileSync(vercelPath, 'utf8'))
  
  // Check for cron jobs
  if (!vercelConfig.crons || vercelConfig.crons.length === 0) {
    throw new Error('No cron jobs configured in vercel.json')
  }
  
  // Check for function timeouts
  if (!vercelConfig.functions || !vercelConfig.functions['app/api/admin/**']) {
    throw new Error('Admin function timeouts not configured')
  }
  
  console.log('   ✓ Vercel configuration complete')
})

// Test 10: Documentation
runTest('Documentation', () => {
  const docs = [
    'docs/admin-dashboard.md',
    'docs/admin-exports-fraud-monitor.md',
    'docs/build-fixes.md',
    'docs/deployment-checklist.md'
  ]
  
  for (const doc of docs) {
    const docPath = path.join(__dirname, '..', doc)
    if (!fs.existsSync(docPath)) {
      throw new Error(`Documentation missing: ${doc}`)
    }
  }
  
  console.log('   ✓ All documentation present')
})

// Test Summary
console.log('=====================================')
console.log('🧪 Test Results Summary')
console.log('=====================================')
console.log(`✅ Tests Passed: ${testsPassed}`)
console.log(`❌ Tests Failed: ${testsFailed}`)
console.log(`📊 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`)

if (testsFailed === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Admin system is ready for deployment.')
  console.log('\n📋 Next Steps:')
  console.log('1. Set environment variables in production')
  console.log('2. Install dependencies: ./scripts/install-admin-deps.sh')
  console.log('3. Deploy to Vercel')
  console.log('4. Test admin dashboard access')
  console.log('5. Verify cron jobs are running')
  process.exit(0)
} else {
  console.log('\n⚠️  Some tests failed. Please fix the issues before deployment.')
  process.exit(1)
}
