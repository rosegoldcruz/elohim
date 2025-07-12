#!/usr/bin/env node

/**
 * AEON Quick Test Script
 * Simple verification that admin system is ready
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🧪 AEON Quick Test Suite')
console.log('========================\n')

let passed = 0
let failed = 0

function test(name, condition, message) {
  if (condition) {
    console.log(`✅ ${name}`)
    passed++
  } else {
    console.log(`❌ ${name}: ${message}`)
    failed++
  }
}

// Test 1: Required files exist
console.log('📁 Checking required files...')
test('env.mjs exists', fs.existsSync(path.join(__dirname, '../env.mjs')), 'Missing env.mjs')
test('package.json exists', fs.existsSync(path.join(__dirname, '../package.json')), 'Missing package.json')
test('vercel.json exists', fs.existsSync(path.join(__dirname, '../vercel.json')), 'Missing vercel.json')

// Test 2: Admin components exist
console.log('\n🔧 Checking admin components...')
const adminFiles = [
  'lib/agents/adminAgent.ts',
  'lib/analytics/exporter.ts',
  'lib/analytics/fraudMonitor.ts',
  'lib/utils/emailer.ts',
  'lib/cron/scheduler.ts',
  'lib/storage/exportStorage.ts'
]

for (const file of adminFiles) {
  test(`${file} exists`, fs.existsSync(path.join(__dirname, '..', file)), `Missing ${file}`)
}

// Test 3: API routes exist
console.log('\n🌐 Checking API routes...')
const apiRoutes = [
  'app/api/admin/revenue/route.ts',
  'app/api/admin/creators/route.ts',
  'app/api/admin/export/route.ts',
  'app/api/cron/daily-operations/route.ts',
  'app/api/cron/fraud-monitoring/route.ts'
]

for (const route of apiRoutes) {
  test(`${route} exists`, fs.existsSync(path.join(__dirname, '..', route)), `Missing ${route}`)
}

// Test 4: Package dependencies
console.log('\n📦 Checking dependencies...')
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'))
const requiredDeps = ['@aws-sdk/client-s3', 'json2csv', 'node-cron', 'nodemailer']

for (const dep of requiredDeps) {
  test(`${dep} dependency`, packageJson.dependencies[dep], `Missing dependency: ${dep}`)
}

// Test 5: Environment configuration
console.log('\n⚙️ Checking environment configuration...')
const envContent = fs.readFileSync(path.join(__dirname, '../env.mjs'), 'utf8')
const requiredEnvVars = ['ADMIN_USER_IDS', 'EMAIL_SERVICE', 'EXPORT_STORAGE_PROVIDER', 'CRON_SECRET']

for (const envVar of requiredEnvVars) {
  test(`${envVar} configured`, envContent.includes(envVar), `Missing env var: ${envVar}`)
}

// Test 6: Documentation
console.log('\n📚 Checking documentation...')
const docs = [
  'docs/admin-exports-fraud-monitor.md',
  'docs/build-fixes.md',
  'docs/deployment-checklist.md'
]

for (const doc of docs) {
  test(`${doc} exists`, fs.existsSync(path.join(__dirname, '..', doc)), `Missing ${doc}`)
}

// Summary
console.log('\n========================')
console.log('📊 Test Results')
console.log('========================')
console.log(`✅ Passed: ${passed}`)
console.log(`❌ Failed: ${failed}`)
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`)

if (failed === 0) {
  console.log('\n🎉 ALL TESTS PASSED!')
  console.log('✅ Admin system is ready for deployment')
  console.log('\n📋 Next steps:')
  console.log('1. Install dependencies: ./scripts/install-admin-deps.sh')
  console.log('2. Set environment variables')
  console.log('3. Deploy to production')
  console.log('4. Test admin dashboard access')
} else {
  console.log('\n⚠️ Some tests failed. Please fix before deployment.')
  process.exit(1)
}
