// Supabase removed - using Clerk for authentication
import { stripe } from './stripe'
import { openai, claude, replicate, elevenlabs } from './ai-services'
import { telemetry, elohimTelemetry } from './telemetry'
import { env } from '../env.mjs'

// Test all service connections
export async function testConnections() {
  const results = {
    supabase: false,
    supabaseAdmin: false,
    stripe: false,
    openai: false,
    claude: false,
    replicate: false,
    elevenlabs: false,
    telemetry: false,
    elohimTelemetry: false,
  }

  console.log('🧪 Testing AEON service connections...\n')

  // Test Supabase connection
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (!error) {
      results.supabase = true
      console.log('✅ Supabase client connection successful')
    } else {
      console.log('❌ Supabase client connection failed:', error.message)
    }
  } catch (error) {
    console.log('❌ Supabase client connection failed:', error)
  }

  // Test Supabase Admin connection
  try {
    const { data, error } = await supabaseAdmin.from('users').select('count').limit(1)
    if (!error) {
      results.supabaseAdmin = true
      console.log('✅ Supabase admin connection successful')
    } else {
      console.log('❌ Supabase admin connection failed:', error.message)
    }
  } catch (error) {
    console.log('❌ Supabase admin connection failed:', error)
  }

  // Test Stripe connection
  try {
    const account = await stripe.accounts.retrieve()
    if (account) {
      results.stripe = true
      console.log('✅ Stripe connection successful')
    }
  } catch (error) {
    console.log('❌ Stripe connection failed:', error)
  }

  // Test OpenAI connection
  try {
    const models = await openai.models.list()
    if (models.data.length > 0) {
      results.openai = true
      console.log('✅ OpenAI connection successful')
    }
  } catch (error) {
    console.log('❌ OpenAI connection failed:', error)
  }

  // Test Claude connection
  try {
    const message = await claude.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hello' }],
    })
    if (message) {
      results.claude = true
      console.log('✅ Claude connection successful')
    }
  } catch (error) {
    console.log('❌ Claude connection failed:', error)
  }

  // Test Replicate connection
  try {
    const models = await replicate.models.list()
    if (models.results.length > 0) {
      results.replicate = true
      console.log('✅ Replicate connection successful')
    }
  } catch (error) {
    console.log('❌ Replicate connection failed:', error)
  }

  // Test ElevenLabs connection
  try {
    const voices = await elevenlabs.getVoices()
    if (voices.voices && voices.voices.length > 0) {
      results.elevenlabs = true
      console.log('✅ ElevenLabs connection successful')
    }
  } catch (error) {
    console.log('❌ ElevenLabs connection failed:', error)
  }

  // Test Telemetry logging
  try {
    await telemetry.logEvent({
      level: 'info',
      message: 'Connection test',
      metadata: { test: true },
    })
    results.telemetry = true
    console.log('✅ Telemetry logging successful')
  } catch (error) {
    console.log('❌ Telemetry logging failed:', error)
  }

  // Test Elohim Telemetry logging
  try {
    await elohimTelemetry.logElohimEvent({
      level: 'info',
      message: 'Elohim connection test',
      metadata: { test: true },
    })
    results.elohimTelemetry = true
    console.log('✅ Elohim telemetry logging successful')
  } catch (error) {
    console.log('❌ Elohim telemetry logging failed:', error)
  }

  // Summary
  const successCount = Object.values(results).filter(Boolean).length
  const totalCount = Object.keys(results).length
  
  console.log(`\n📊 Connection Test Results: ${successCount}/${totalCount} services connected`)
  
  if (successCount === totalCount) {
    console.log('🎉 All services are properly connected!')
  } else {
    console.log('⚠️  Some services need attention. Check your environment variables.')
  }

  return results
}

// Test environment variables
export function testEnvironmentVariables() {
  console.log('🔍 Testing environment variables...\n')

  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'STRIPE_SECRET_KEY',
    'OPENAI_API_KEY',
    'CLAUDE_API_KEY',
    'REPLICATE_API_TOKEN',
    'ELEVENLABS_API_KEY',
    'DASH0_AUTH_TOKEN',
  ]

  const missing = []
  const present = []

  for (const varName of requiredVars) {
    if (env[varName as keyof typeof env]) {
      present.push(varName)
      console.log(`✅ ${varName}`)
    } else {
      missing.push(varName)
      console.log(`❌ ${varName} - MISSING`)
    }
  }

  console.log(`\n📊 Environment Variables: ${present.length}/${requiredVars.length} configured`)
  
  if (missing.length === 0) {
    console.log('🎉 All required environment variables are set!')
  } else {
    console.log('⚠️  Missing environment variables:', missing.join(', '))
  }

  return { present, missing }
}

// Run all tests
export async function runAllTests() {
  console.log('🚀 AEON Platform Connection Tests\n')
  console.log('=' .repeat(50))
  
  const envResults = testEnvironmentVariables()
  console.log('\n' + '=' .repeat(50))
  
  const connectionResults = await testConnections()
  
  console.log('\n' + '=' .repeat(50))
  console.log('🏁 Test Complete!')
  
  return {
    environment: envResults,
    connections: connectionResults,
  }
}
