/**
 * AEON Creator Payout Testing Script
 * Tests the creator payout functionality including Stripe and crypto payouts
 */

import { creatorAgent } from '../lib/agents/creatorAgent'

// Test configuration
const TEST_CREATOR_ID = 'test-creator-uuid'
const TEST_AMOUNT = 50 // credits

async function testCreatorWallet() {
  console.log('🧪 Testing Creator Wallet Operations...\n')

  try {
    // Test 1: Get or create wallet
    console.log('1. Testing wallet creation/retrieval...')
    const wallet = await creatorAgent.getWallet(TEST_CREATOR_ID)
    console.log('✅ Wallet:', wallet ? 'Found/Created' : 'Failed')
    console.log('   Balance:', wallet?.balance || 0, 'credits')
    console.log('   Payout method:', wallet?.payout_method || 'none')
    console.log('')

    // Test 2: Add earnings
    console.log('2. Testing earnings addition...')
    const earningsResult = await creatorAgent.addEarnings(
      TEST_CREATOR_ID,
      TEST_AMOUNT,
      'Test earnings from video royalties',
      'test-video-123'
    )
    console.log('✅ Add earnings:', earningsResult ? 'Success' : 'Failed')
    console.log('')

    // Test 3: Get updated wallet
    const updatedWallet = await creatorAgent.getWallet(TEST_CREATOR_ID)
    console.log('3. Updated wallet balance:', updatedWallet?.balance || 0, 'credits')
    console.log('')

    // Test 4: Get transaction history
    console.log('4. Testing transaction history...')
    const transactions = await creatorAgent.getTransactions(TEST_CREATOR_ID, 10)
    console.log('✅ Transactions found:', transactions.length)
    transactions.forEach((tx, index) => {
      console.log(`   ${index + 1}. ${tx.type}: ${tx.amount} credits - ${tx.description}`)
    })
    console.log('')

    // Test 5: Get wallet summary
    console.log('5. Testing wallet summary...')
    const summary = await creatorAgent.getWalletSummary(TEST_CREATOR_ID)
    console.log('✅ Summary:')
    console.log('   Balance:', summary.wallet?.balance || 0, 'credits')
    console.log('   Monthly earnings:', summary.monthlyEarnings, 'credits')
    console.log('   Recent transactions:', summary.recentTransactions.length)
    console.log('')

  } catch (error) {
    console.error('❌ Wallet test failed:', error)
  }
}

async function testStripePayoutValidation() {
  console.log('🏦 Testing Stripe Payout Validation...\n')

  try {
    // Test insufficient balance
    console.log('1. Testing insufficient balance...')
    const insufficientResult = await creatorAgent.payoutStripe(TEST_CREATOR_ID, 10000)
    console.log('✅ Insufficient balance check:', !insufficientResult.success ? 'Passed' : 'Failed')
    console.log('   Error:', insufficientResult.error)
    console.log('')

    // Test minimum threshold
    console.log('2. Testing minimum threshold...')
    const thresholdResult = await creatorAgent.payoutStripe(TEST_CREATOR_ID, 1)
    console.log('✅ Minimum threshold check:', !thresholdResult.success ? 'Passed' : 'Failed')
    console.log('   Error:', thresholdResult.error)
    console.log('')

    // Test missing Stripe account
    console.log('3. Testing missing Stripe account...')
    const noAccountResult = await creatorAgent.payoutStripe(TEST_CREATOR_ID, 20)
    console.log('✅ Missing account check:', !noAccountResult.success ? 'Passed' : 'Failed')
    console.log('   Error:', noAccountResult.error)
    console.log('')

  } catch (error) {
    console.error('❌ Stripe validation test failed:', error)
  }
}

async function testCryptoPayoutValidation() {
  console.log('🪙 Testing Crypto Payout Validation...\n')

  try {
    // Test insufficient balance
    console.log('1. Testing insufficient balance...')
    const insufficientResult = await creatorAgent.payoutCrypto(TEST_CREATOR_ID, 10000)
    console.log('✅ Insufficient balance check:', !insufficientResult.success ? 'Passed' : 'Failed')
    console.log('   Error:', insufficientResult.error)
    console.log('')

    // Test missing crypto wallet
    console.log('2. Testing missing crypto wallet...')
    const noWalletResult = await creatorAgent.payoutCrypto(TEST_CREATOR_ID, 20)
    console.log('✅ Missing wallet check:', !noWalletResult.success ? 'Passed' : 'Failed')
    console.log('   Error:', noWalletResult.error)
    console.log('')

  } catch (error) {
    console.error('❌ Crypto validation test failed:', error)
  }
}

async function testPayoutPreferences() {
  console.log('⚙️ Testing Payout Preferences...\n')

  try {
    // Test updating preferences
    console.log('1. Testing preference updates...')
    const updateResult = await creatorAgent.updatePayoutPreferences(TEST_CREATOR_ID, {
      payout_method: 'crypto',
      payout_threshold: 25,
      auto_payout: true,
      crypto_wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
      crypto_wallet_type: 'metamask'
    })
    console.log('✅ Preference update:', updateResult ? 'Success' : 'Failed')
    console.log('')

    // Test getting updated wallet
    const updatedWallet = await creatorAgent.getWallet(TEST_CREATOR_ID)
    console.log('2. Updated preferences:')
    console.log('   Payout method:', updatedWallet?.payout_method)
    console.log('   Threshold:', updatedWallet?.payout_threshold, 'credits')
    console.log('   Auto-payout:', updatedWallet?.auto_payout)
    console.log('   Crypto address:', updatedWallet?.crypto_wallet_address)
    console.log('')

  } catch (error) {
    console.error('❌ Preferences test failed:', error)
  }
}

async function testAutoPayoutCheck() {
  console.log('🤖 Testing Auto-Payout Logic...\n')

  try {
    // Test auto-payout check
    console.log('1. Testing auto-payout check...')
    await creatorAgent.checkAutoPayout(TEST_CREATOR_ID)
    console.log('✅ Auto-payout check completed (check logs for actual payout attempts)')
    console.log('')

  } catch (error) {
    console.error('❌ Auto-payout test failed:', error)
  }
}

async function runAllTests() {
  console.log('🚀 AEON Creator Payout Testing Suite\n')
  console.log('=' .repeat(50))
  console.log('')

  try {
    await testCreatorWallet()
    await testStripePayoutValidation()
    await testCryptoPayoutValidation()
    await testPayoutPreferences()
    await testAutoPayoutCheck()

    console.log('✅ All tests completed!')
    console.log('')
    console.log('Note: This test suite validates the business logic and error handling.')
    console.log('Actual Stripe and crypto payouts require proper API keys and wallet setup.')

  } catch (error) {
    console.error('❌ Test suite failed:', error)
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Fatal error:', error)
      process.exit(1)
    })
}

export {
  testCreatorWallet,
  testStripePayoutValidation,
  testCryptoPayoutValidation,
  testPayoutPreferences,
  testAutoPayoutCheck,
  runAllTests
}
