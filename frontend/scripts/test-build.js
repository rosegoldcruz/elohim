#!/usr/bin/env node

/**
 * Test build script to verify the build process works locally
 * This helps catch build issues before deploying to Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Testing AEON Frontend Build Process...\n');

// Check if we're in the right directory
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found. Please run this script from the frontend directory.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
if (packageJson.name !== 'aeon-platform') {
  console.error('❌ Error: This doesn\'t appear to be the AEON frontend directory.');
  process.exit(1);
}

try {
  // Step 1: Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  try {
    execSync('rm -rf .next', { stdio: 'inherit' });
  } catch (e) {
    // Ignore if .next doesn't exist
  }

  // Step 2: Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('pnpm install --frozen-lockfile', { stdio: 'inherit' });

  // Step 3: Run build
  console.log('🏗️  Building application...');
  execSync('pnpm run build', { stdio: 'inherit' });

  console.log('\n✅ Build completed successfully!');
  console.log('🚀 Ready for deployment to Vercel.');

} catch (error) {
  console.error('\n❌ Build failed with error:');
  console.error(error.message);
  process.exit(1);
}
