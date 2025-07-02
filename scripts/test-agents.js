/**
 * Test script for AEON Agents
 * Demonstrates usage of the complete agent ecosystem
 */

const API_BASE = 'http://localhost:3000';

async function testAgentPipeline() {
  console.log('🧪 Testing AEON Agent Pipeline...\n');

  // Test 1: Complete pipeline with topic
  console.log('📋 Test 1: Complete pipeline with trending topic');
  try {
    const response = await fetch(`${API_BASE}/api/agents/pipeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'AI video generation trends',
        user_id: 'test_user_123',
        duration: 60,
        style: 'educational',
        platform: 'youtube'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log(`📄 Video URL: ${result.video_url}`);
      console.log(`🖼️ Thumbnail: ${result.thumbnail_url}`);
      console.log(`📊 Agents Used: ${result.metadata.agents_used.join(', ')}`);
      console.log(`⏱️ Processing Time: ${result.metadata.processing_time}ms`);
      console.log(`📈 Quality Score: ${result.metadata.quality_score}`);
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Pipeline with preset
  console.log('📋 Test 2: Pipeline with preset configuration');
  try {
    const response = await fetch(`${API_BASE}/api/agents/pipeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'TikTok growth strategies',
        user_id: 'test_user_456',
        preset: 'quickVideo'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success with preset!');
      console.log(`📄 Video URL: ${result.video_url}`);
      console.log(`📝 Script Title: ${result.script.title}`);
      console.log(`🎬 Scenes Count: ${result.scenes.length}`);
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Custom script pipeline
  console.log('📋 Test 3: Pipeline with custom script');
  try {
    const response = await fetch(`${API_BASE}/api/agents/pipeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        custom_script: 'Welcome to my channel! Today we\'re going to explore the amazing world of AI video generation. This technology is revolutionizing how we create content.',
        user_id: 'test_user_789',
        duration: 45,
        style: 'professional',
        platform: 'general'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success with custom script!');
      console.log(`📄 Video URL: ${result.video_url}`);
      console.log(`📊 Processing Time: ${result.metadata.processing_time}ms`);
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Agent health check
  console.log('📋 Test 4: Agent health check');
  try {
    const response = await fetch(`${API_BASE}/api/agents/pipeline?action=health`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check successful!');
      console.log(`📊 Overall Status: ${result.status}`);
      result.agents.forEach(agent => {
        console.log(`  - ${agent.agent}: ${agent.status}`);
      });
    } else {
      console.log('❌ Health check failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Health check request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: Performance metrics
  console.log('📋 Test 5: Performance metrics');
  try {
    const response = await fetch(`${API_BASE}/api/agents/pipeline?action=metrics`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Metrics retrieved!');
      Object.entries(result.metrics).forEach(([agent, metrics]) => {
        console.log(`  - ${agent}:`);
        console.log(`    Response Time: ${metrics.avg_response_time}`);
        console.log(`    Success Rate: ${metrics.success_rate}`);
      });
    } else {
      console.log('❌ Metrics request failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Metrics request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 6: Available presets
  console.log('📋 Test 6: Available presets');
  try {
    const response = await fetch(`${API_BASE}/api/agents/pipeline?action=presets`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Presets retrieved!');
      console.log(`📋 Available Presets: ${result.presets.join(', ')}`);
      Object.entries(result.configurations).forEach(([preset, config]) => {
        console.log(`  - ${preset}: ${config.duration}s, ${config.style}, ${config.platform}`);
      });
    } else {
      console.log('❌ Presets request failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Presets request failed:', error.message);
  }

  console.log('\n🏁 Agent testing complete!');
}

// Example usage patterns
function showUsageExamples() {
  console.log('\n📚 AEON Agents Usage Examples:\n');

  console.log('1. Complete Pipeline:');
  console.log(`
POST /api/agents/pipeline
{
  "topic": "AI productivity tips",
  "user_id": "user123",
  "duration": 60,
  "style": "educational",
  "platform": "youtube"
}
  `);

  console.log('2. Quick Video with Preset:');
  console.log(`
POST /api/agents/pipeline
{
  "topic": "Viral TikTok trends",
  "user_id": "user123",
  "preset": "quickVideo"
}
  `);

  console.log('3. Custom Script:');
  console.log(`
POST /api/agents/pipeline
{
  "custom_script": "Your custom video script here...",
  "user_id": "user123",
  "duration": 45,
  "style": "professional"
}
  `);

  console.log('4. Health Check:');
  console.log(`
GET /api/agents/pipeline?action=health
  `);

  console.log('5. Performance Metrics:');
  console.log(`
GET /api/agents/pipeline?action=metrics
  `);

  console.log('6. Available Presets:');
  console.log(`
GET /api/agents/pipeline?action=presets
  `);
}

// Individual agent testing
async function testIndividualAgents() {
  console.log('\n🔧 Testing Individual Agents...\n');

  // This would require individual agent endpoints
  console.log('Individual agent testing requires separate endpoints:');
  console.log('- POST /api/agents/trends - TrendsAgent');
  console.log('- POST /api/agents/script - ScriptWriterAgent');
  console.log('- POST /api/agents/scenes - ScenePlannerAgent');
  console.log('- POST /api/agents/stitch - StitcherAgent');
  console.log('- POST /api/agents/edit - EditorAgent');
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  showUsageExamples();
  
  // Uncomment to run actual tests (requires server to be running)
  // testAgentPipeline();
  // testIndividualAgents();
}
