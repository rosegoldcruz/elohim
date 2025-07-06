#!/usr/bin/env node

/**
 * Test script for the new DeepSeek + OpenAI unified pipeline
 * Demonstrates script generation with DeepSeek and scene planning with GPT-4o
 */

const { DeepSeekScriptScenePipeline } = require('../lib/agents/DeepSeekScriptScenePipeline');

async function testDeepSeekPipeline() {
  console.log('🚀 Testing DeepSeek + OpenAI Unified Pipeline\n');

  try {
    // Initialize the pipeline
    const pipeline = new DeepSeekScriptScenePipeline();

    // Sample trend package
    const trendPackage = {
      topic: "AI video generation revolution",
      hashtags: ["#AI", "#VideoGeneration", "#TikTok", "#Viral", "#Tech"],
      viral_elements: ["trending audio", "split screen effect", "before/after reveal"],
      target_audience: "content creators and tech enthusiasts",
      platform_specific_tips: [
        "Use vertical 9:16 format",
        "Hook viewers in first 3 seconds",
        "Include trending sounds",
        "Add text overlays for accessibility"
      ]
    };

    console.log('📦 Trend Package:', JSON.stringify(trendPackage, null, 2));
    console.log('\n🎬 Generating script and scene plan...\n');

    // Test with streaming callbacks
    let scriptChunks = '';
    let sceneChunks = '';

    const result = await pipeline.createTikTokScriptAndScene(
      trendPackage,
      "engaging",
      (chunk) => {
        scriptChunks += chunk;
        process.stdout.write(chunk); // Real-time script output
      },
      (chunk) => {
        sceneChunks += chunk;
        process.stdout.write(chunk); // Real-time scene output
      }
    );

    console.log('\n\n✅ Pipeline Complete!\n');
    console.log('📊 Metadata:', JSON.stringify(result.metadata, null, 2));
    console.log('\n🎯 Viral Techniques Detected:', result.metadata.viralTechniques.join(', '));

    // Test script-only generation
    console.log('\n\n🧪 Testing script-only generation...\n');
    const scriptOnly = await pipeline.generateScriptOnly(
      "How to make viral TikTok videos with AI",
      "educational",
      (chunk) => process.stdout.write(chunk)
    );

    console.log('\n\n✅ Script-only generation complete!');
    console.log(`📝 Script length: ${scriptOnly.length} characters`);

  } catch (error) {
    console.error('❌ Pipeline test failed:', error);
    process.exit(1);
  }
}

// Test individual ScriptWriterAgent with DeepSeek
async function testScriptWriterAgent() {
  console.log('\n\n🧪 Testing ScriptWriterAgent with DeepSeek...\n');

  try {
    const { ScriptWriterAgent } = require('../lib/agents/ScriptWriterAgent');
    const scriptAgent = new ScriptWriterAgent();

    const script = await scriptAgent.generateScript("AI revolutionizing content creation", {
      duration: 60,
      tone: 'entertaining',
      platform: 'tiktok',
      sceneCount: 6
    });

    console.log('✅ ScriptWriterAgent test complete!');
    console.log(`📝 Generated ${script.scenes.length} scenes`);
    console.log(`🎯 Viral techniques: ${script.metadata.viralTechniques.join(', ')}`);
    console.log(`⏱️ Total duration: ${script.metadata.duration}s`);

    // Test streaming version
    console.log('\n🌊 Testing streaming script generation...\n');
    const streamingScript = await scriptAgent.generateScriptStream(
      "The future of AI video creation",
      { duration: 45, tone: 'conversational', platform: 'tiktok' },
      (chunk) => process.stdout.write(chunk)
    );

    console.log('\n\n✅ Streaming test complete!');
    console.log(`📝 Generated ${streamingScript.scenes.length} scenes with streaming`);

  } catch (error) {
    console.error('❌ ScriptWriterAgent test failed:', error);
  }
}

// Run tests
async function runAllTests() {
  console.log('🔬 AEON DeepSeek Integration Tests\n');
  console.log('=' .repeat(50));

  await testDeepSeekPipeline();
  await testScriptWriterAgent();

  console.log('\n' + '=' .repeat(50));
  console.log('🎉 All tests completed!');
  console.log('\n💡 Key Features Tested:');
  console.log('  ✅ DeepSeek script generation');
  console.log('  ✅ OpenAI GPT-4o scene planning');
  console.log('  ✅ Streaming support');
  console.log('  ✅ Viral technique detection');
  console.log('  ✅ TikTok-optimized output');
  console.log('  ✅ Unified pipeline workflow');
}

// Handle command line execution
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testDeepSeekPipeline,
  testScriptWriterAgent,
  runAllTests
};
