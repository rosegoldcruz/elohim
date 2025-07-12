/**
 * AEON Creator API Testing Script
 * Tests the creator API endpoints for wallet, transactions, and payouts
 */

// Test configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const TEST_AUTH_TOKEN = process.env.TEST_AUTH_TOKEN || 'test-token'

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
  details?: any
}

async function makeApiRequest(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' = 'GET',
  body?: any
): Promise<ApiResponse> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_AUTH_TOKEN}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    const result = await response.json()
    return result
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Request failed'
    }
  }
}

async function testWalletEndpoint() {
  console.log('🧪 Testing Wallet API Endpoint...\n')

  try {
    // Test GET wallet
    console.log('1. Testing GET /api/creator/wallet...')
    const walletResponse = await makeApiRequest('/api/creator/wallet')
    console.log('✅ Status:', walletResponse.success ? 'Success' : 'Failed')
    if (walletResponse.success) {
      console.log('   Balance:', walletResponse.data?.wallet?.balance || 0, 'credits')
      console.log('   Monthly earnings:', walletResponse.data?.monthlyEarnings || 0, 'credits')
    } else {
      console.log('   Error:', walletResponse.error)
    }
    console.log('')

    // Test PUT wallet preferences
    console.log('2. Testing PUT /api/creator/wallet (preferences)...')
    const preferencesResponse = await makeApiRequest('/api/creator/wallet', 'PUT', {
      payout_threshold: 15,
      auto_payout: false,
      payout_method: 'stripe'
    })
    console.log('✅ Status:', preferencesResponse.success ? 'Success' : 'Failed')
    if (!preferencesResponse.success) {
      console.log('   Error:', preferencesResponse.error)
    }
    console.log('')

    // Test POST add earnings
    console.log('3. Testing POST /api/creator/wallet (add earnings)...')
    const earningsResponse = await makeApiRequest('/api/creator/wallet', 'POST', {
      amount: 25,
      description: 'Test API earnings',
      source: 'api-test'
    })
    console.log('✅ Status:', earningsResponse.success ? 'Success' : 'Failed')
    if (!earningsResponse.success) {
      console.log('   Error:', earningsResponse.error)
    }
    console.log('')

  } catch (error) {
    console.error('❌ Wallet endpoint test failed:', error)
  }
}

async function testTransactionsEndpoint() {
  console.log('📊 Testing Transactions API Endpoint...\n')

  try {
    // Test GET transactions
    console.log('1. Testing GET /api/creator/transactions...')
    const transactionsResponse = await makeApiRequest('/api/creator/transactions?limit=5')
    console.log('✅ Status:', transactionsResponse.success ? 'Success' : 'Failed')
    if (transactionsResponse.success) {
      const transactions = transactionsResponse.data?.transactions || []
      console.log('   Transactions found:', transactions.length)
      console.log('   Total earnings:', transactionsResponse.data?.summary?.totalEarnings || 0)
      console.log('   Total payouts:', transactionsResponse.data?.summary?.totalPayouts || 0)
    } else {
      console.log('   Error:', transactionsResponse.error)
    }
    console.log('')

    // Test POST export transactions
    console.log('2. Testing POST /api/creator/transactions (export)...')
    const exportResponse = await makeApiRequest('/api/creator/transactions', 'POST', {
      format: 'json',
      dateFrom: '2024-01-01',
      dateTo: '2024-12-31'
    })
    console.log('✅ Status:', exportResponse.success ? 'Success' : 'Failed')
    if (exportResponse.success) {
      console.log('   Exported records:', exportResponse.data?.totalRecords || 0)
    } else {
      console.log('   Error:', exportResponse.error)
    }
    console.log('')

  } catch (error) {
    console.error('❌ Transactions endpoint test failed:', error)
  }
}

async function testStripePayoutEndpoint() {
  console.log('🏦 Testing Stripe Payout API Endpoint...\n')

  try {
    // Test GET Stripe status
    console.log('1. Testing GET /api/creator/payout/stripe...')
    const statusResponse = await makeApiRequest('/api/creator/payout/stripe')
    console.log('✅ Status:', statusResponse.success ? 'Success' : 'Failed')
    if (statusResponse.success) {
      console.log('   Stripe connected:', statusResponse.data?.stripeStatus?.connected || false)
      console.log('   Can payout:', statusResponse.data?.canPayout || false)
      console.log('   Available balance:', statusResponse.data?.availableBalance || 0)
    } else {
      console.log('   Error:', statusResponse.error)
    }
    console.log('')

    // Test POST Stripe payout (should fail without proper setup)
    console.log('2. Testing POST /api/creator/payout/stripe...')
    const payoutResponse = await makeApiRequest('/api/creator/payout/stripe', 'POST', {
      amount: 10
    })
    console.log('✅ Status:', payoutResponse.success ? 'Success' : 'Expected Failure')
    if (!payoutResponse.success) {
      console.log('   Expected error:', payoutResponse.error)
    }
    console.log('')

    // Test PUT Stripe settings
    console.log('3. Testing PUT /api/creator/payout/stripe...')
    const settingsResponse = await makeApiRequest('/api/creator/payout/stripe', 'PUT', {
      payout_threshold: 20,
      auto_payout: true
    })
    console.log('✅ Status:', settingsResponse.success ? 'Success' : 'Failed')
    if (!settingsResponse.success) {
      console.log('   Error:', settingsResponse.error)
    }
    console.log('')

  } catch (error) {
    console.error('❌ Stripe payout endpoint test failed:', error)
  }
}

async function testCryptoPayoutEndpoint() {
  console.log('🪙 Testing Crypto Payout API Endpoint...\n')

  try {
    // Test GET crypto status
    console.log('1. Testing GET /api/creator/payout/crypto...')
    const statusResponse = await makeApiRequest('/api/creator/payout/crypto')
    console.log('✅ Status:', statusResponse.success ? 'Success' : 'Failed')
    if (statusResponse.success) {
      console.log('   Crypto connected:', statusResponse.data?.cryptoStatus?.connected || false)
      console.log('   Can payout:', statusResponse.data?.canPayout || false)
      console.log('   Supported tokens:', statusResponse.data?.cryptoStatus?.supportedTokens || [])
    } else {
      console.log('   Error:', statusResponse.error)
    }
    console.log('')

    // Test PUT crypto settings
    console.log('2. Testing PUT /api/creator/payout/crypto...')
    const settingsResponse = await makeApiRequest('/api/creator/payout/crypto', 'PUT', {
      crypto_wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
      crypto_wallet_type: 'metamask',
      payout_threshold: 30
    })
    console.log('✅ Status:', settingsResponse.success ? 'Success' : 'Failed')
    if (!settingsResponse.success) {
      console.log('   Error:', settingsResponse.error)
    }
    console.log('')

    // Test POST crypto payout (should fail without proper setup)
    console.log('3. Testing POST /api/creator/payout/crypto...')
    const payoutResponse = await makeApiRequest('/api/creator/payout/crypto', 'POST', {
      amount: 15,
      tokenType: 'USDC'
    })
    console.log('✅ Status:', payoutResponse.success ? 'Success' : 'Expected Failure')
    if (!payoutResponse.success) {
      console.log('   Expected error:', payoutResponse.error)
    }
    console.log('')

  } catch (error) {
    console.error('❌ Crypto payout endpoint test failed:', error)
  }
}

async function runAllApiTests() {
  console.log('🚀 AEON Creator API Testing Suite\n')
  console.log('=' .repeat(50))
  console.log('Base URL:', BASE_URL)
  console.log('Auth Token:', TEST_AUTH_TOKEN ? 'Provided' : 'Missing')
  console.log('')

  try {
    await testWalletEndpoint()
    await testTransactionsEndpoint()
    await testStripePayoutEndpoint()
    await testCryptoPayoutEndpoint()

    console.log('✅ All API tests completed!')
    console.log('')
    console.log('Note: Some tests are expected to fail without proper authentication')
    console.log('and service setup (Stripe Connect, crypto wallets, etc.)')

  } catch (error) {
    console.error('❌ API test suite failed:', error)
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllApiTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export {
  testWalletEndpoint,
  testTransactionsEndpoint,
  testStripePayoutEndpoint,
  testCryptoPayoutEndpoint,
  runAllApiTests
}
