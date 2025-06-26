// Test script for Local LLM Integration
// Run this to verify Docker Model Runner connectivity

import { runLocalLLM, isLocalLLMAvailable, LocalLLMClient } from './integrations/local-llm';
import { ScriptWriterAgent } from './agents/script-writer-agent';
import { modelManager } from './utils/model-manager';

/**
 * Test local LLM connectivity
 */
export async function testLocalLLMConnection(): Promise<void> {
  console.log('🧪 Testing Local LLM Connection...');
  
  try {
    // Test health check
    console.log('1. Checking if Local LLM is available...');
    const isAvailable = await isLocalLLMAvailable();
    console.log(`   ✅ Local LLM Available: ${isAvailable}`);
    
    if (!isAvailable) {
      console.log('   ❌ Local LLM is not available. Please ensure:');
      console.log('      - Docker is running');
      console.log('      - Model Runner container is started');
      console.log('      - Service is accessible at http://localhost:12434');
      return;
    }

    // Test basic API call
    console.log('2. Testing basic API call...');
    const testMessages = [
      {
        role: 'system' as const,
        content: 'You are a helpful assistant. Respond with exactly "Hello from local LLM!"'
      },
      {
        role: 'user' as const,
        content: 'Say hello'
      }
    ];

    const response = await runLocalLLM(testMessages, {
      temperature: 0.1,
      maxTokens: 50
    });
    
    console.log(`   ✅ Response: ${response}`);

    // Test model list
    console.log('3. Testing model list...');
    const client = new LocalLLMClient();
    const models = await client.getModels();
    console.log(`   ✅ Available models: ${models.join(', ')}`);

  } catch (error) {
    console.error('   ❌ Error testing Local LLM:', error);
  }
}

/**
 * Test ScriptWriterAgent with different models
 */
export async function testScriptWriterAgent(): Promise<void> {
  console.log('🎬 Testing ScriptWriterAgent with different models...');
  
  const agent = new ScriptWriterAgent();
  const testInput = {
    topic: 'Introduction to AI',
    tone: 'educational' as const,
    duration: 60,
    targetAudience: 'beginners',
    keywords: ['artificial intelligence', 'machine learning']
  };

  const models = ['local', 'openai', 'claude', 'replicate'];
  
  for (const model of models) {
    try {
      console.log(`\n📝 Testing with ${model.toUpperCase()} model...`);
      
      // Set environment variable for this test
      process.env.LLM_MODE = model;
      
      // Skip local if not available
      if (model === 'local') {
        const isAvailable = await isLocalLLMAvailable();
        if (!isAvailable) {
          console.log(`   ⏭️  Skipping ${model} - not available`);
          continue;
        }
      }
      
      const result = await agent.execute(testInput);
      console.log(`   ✅ Generated script (${result.script.length} chars)`);
      console.log(`   📊 Scenes: ${result.scenes.length}`);
      console.log(`   ⏱️  Duration: ${result.metadata.estimatedDuration}s`);
      
    } catch (error) {
      console.log(`   ❌ Error with ${model}:`, error instanceof Error ? error.message : error);
    }
  }
}

/**
 * Test model manager functionality
 */
export async function testModelManager(): Promise<void> {
  console.log('⚙️  Testing Model Manager...');
  
  try {
    // Test current mode
    console.log('1. Testing current mode...');
    const currentMode = modelManager.getCurrentMode();
    console.log(`   ✅ Current mode: ${currentMode}`);
    
    // Test available models
    console.log('2. Testing available models...');
    const availableModels = modelManager.getAvailableModels();
    console.log(`   ✅ Available models: ${availableModels.map(m => m.label).join(', ')}`);
    
    // Test model switching
    console.log('3. Testing model switching...');
    const originalMode = currentMode;
    
    for (const model of ['openai', 'local', 'claude'] as const) {
      try {
        await modelManager.switchMode(model);
        const newMode = modelManager.getCurrentMode();
        console.log(`   ✅ Switched to: ${newMode}`);
        
        const status = await modelManager.getModelStatus();
        console.log(`   📊 Status: ${status.status} (${status.available ? 'available' : 'unavailable'})`);
        
      } catch (error) {
        console.log(`   ❌ Failed to switch to ${model}:`, error instanceof Error ? error.message : error);
      }
    }
    
    // Restore original mode
    await modelManager.switchMode(originalMode);
    console.log(`   🔄 Restored to original mode: ${originalMode}`);
    
  } catch (error) {
    console.error('   ❌ Error testing Model Manager:', error);
  }
}

/**
 * Run all tests
 */
export async function runAllTests(): Promise<void> {
  console.log('🚀 Starting AEON Local LLM Integration Tests\n');
  
  await testLocalLLMConnection();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testModelManager();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testScriptWriterAgent();
  
  console.log('\n✨ All tests completed!');
}

// Export for use in development
if (typeof window === 'undefined' && require.main === module) {
  // Only run if this file is executed directly (not imported)
  runAllTests().catch(console.error);
}
