/**
 * Test script for AEON EditingAgent
 * Demonstrates production-grade video editing with FFmpeg
 */

const API_BASE = 'http://localhost:3000';

async function testEditingAgent() {
  console.log('🧪 Testing AEON EditingAgent...\n');

  // Test 1: Basic video concatenation
  console.log('📋 Test 1: Basic video concatenation with crossfade');
  try {
    const response = await fetch(`${API_BASE}/api/agents/editing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoClips: [
          'https://example.com/clip1.mp4',
          'https://example.com/clip2.mp4',
          'https://example.com/clip3.mp4'
        ],
        transitions: 'crossfade',
        fadeInOut: true,
        aspectRatio: '16:9'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log(`📄 Final Video: ${result.final_video_url}`);
      console.log(`📊 Clips Processed: ${result.metadata.clips_processed}`);
      console.log(`🎬 Transitions: ${result.metadata.transitions}`);
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Video with background music and avatar
  console.log('📋 Test 2: Video with BGM and avatar overlay');
  try {
    const response = await fetch(`${API_BASE}/api/agents/editing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoClips: [
          'https://example.com/scene1.mp4',
          'https://example.com/scene2.mp4'
        ],
        bgmUrl: 'https://example.com/background-music.mp3',
        avatarOverlayUrl: 'https://example.com/avatar.png',
        transitions: 'slide',
        fadeInOut: false,
        watermarkText: '🧠 AEON AI',
        addCaptions: true,
        aspectRatio: '9:16',
        scenePlan: {
          scenes: [
            { narration: 'Welcome to AEON video generation!' }
          ]
        }
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success with full features!');
      console.log(`📄 Final Video: ${result.final_video_url}`);
      console.log(`🎵 Has BGM: ${result.metadata.has_bgm}`);
      console.log(`👤 Has Avatar: ${result.metadata.has_avatar}`);
      console.log(`📝 Has Captions: ${result.metadata.has_captions}`);
      console.log(`💧 Has Watermark: ${result.metadata.has_watermark}`);
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Square format for Instagram
  console.log('📋 Test 3: Square format (1:1) for Instagram');
  try {
    const response = await fetch(`${API_BASE}/api/agents/editing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoClips: [
          'https://example.com/instagram-clip1.mp4',
          'https://example.com/instagram-clip2.mp4'
        ],
        transitions: 'cut',
        fadeInOut: true,
        watermarkText: '@aeon_ai',
        aspectRatio: '1:1'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Instagram format success!');
      console.log(`📄 Final Video: ${result.final_video_url}`);
      console.log(`📐 Aspect Ratio: ${result.metadata.aspect_ratio}`);
    } else {
      console.log('❌ Error:', result.error);
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Get capabilities
  console.log('📋 Test 4: Get editing capabilities');
  try {
    const response = await fetch(`${API_BASE}/api/agents/editing?action=capabilities`);
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Capabilities retrieved!');
      console.log(`📊 Max Clips: ${result.capabilities.maxClips}`);
      console.log(`🎬 Transitions: ${result.capabilities.supportedTransitions.join(', ')}`);
      console.log(`📐 Aspect Ratios: ${result.capabilities.supportedAspectRatios.join(', ')}`);
      console.log('🎯 Features:');
      result.capabilities.features.forEach(feature => {
        console.log(`  - ${feature}`);
      });
    } else {
      console.log('❌ Capabilities request failed:', result.error);
    }
  } catch (error) {
    console.log('❌ Capabilities request failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 5: Error handling - no clips
  console.log('📋 Test 5: Error handling (no video clips)');
  try {
    const response = await fetch(`${API_BASE}/api/agents/editing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        videoClips: [],
        transitions: 'cut'
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.log('✅ Expected error handled correctly:', result.error);
    } else {
      console.log('❌ Should have returned an error');
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }

  console.log('\n🏁 EditingAgent testing complete!');
}

// Example usage patterns
function showUsageExamples() {
  console.log('\n📚 AEON EditingAgent Usage Examples:\n');

  console.log('1. Basic Video Concatenation:');
  console.log(`
POST /api/agents/editing
{
  "videoClips": [
    "https://example.com/clip1.mp4",
    "https://example.com/clip2.mp4"
  ],
  "transitions": "crossfade",
  "fadeInOut": true,
  "aspectRatio": "16:9"
}
  `);

  console.log('2. Full-Featured Video with BGM and Avatar:');
  console.log(`
POST /api/agents/editing
{
  "videoClips": ["https://example.com/scene1.mp4"],
  "bgmUrl": "https://example.com/music.mp3",
  "avatarOverlayUrl": "https://example.com/avatar.png",
  "transitions": "slide",
  "watermarkText": "🧠 AEON AI",
  "addCaptions": true,
  "aspectRatio": "9:16"
}
  `);

  console.log('3. TikTok/Instagram Stories (9:16):');
  console.log(`
POST /api/agents/editing
{
  "videoClips": ["https://example.com/vertical.mp4"],
  "transitions": "cut",
  "fadeInOut": true,
  "watermarkText": "@your_handle",
  "aspectRatio": "9:16"
}
  `);

  console.log('4. Instagram Posts (1:1):');
  console.log(`
POST /api/agents/editing
{
  "videoClips": ["https://example.com/square.mp4"],
  "transitions": "crossfade",
  "aspectRatio": "1:1"
}
  `);

  console.log('5. Get Capabilities:');
  console.log(`
GET /api/agents/editing?action=capabilities
  `);
}

// FFmpeg command examples
function showFFmpegExamples() {
  console.log('\n🔧 Generated FFmpeg Command Examples:\n');

  console.log('Basic concatenation with crossfade:');
  console.log(`
ffmpeg -i clip1.mp4 -i clip2.mp4 \\
-filter_complex "[0:v]scale=1920:1080,setsar=1[v0];[1:v]scale=1920:1080,setsar=1[v1];[v0][v1]xfade=transition=fade:duration=0.5:offset=5[vout];[0:a][1:a]amix=inputs=2:duration=shortest[aout]" \\
-map "[vout]" -map "[aout]" \\
-c:v libx264 -pix_fmt yuv420p -r 30 -s 1920x1080 \\
-c:a aac -b:a 128k -shortest -movflags +faststart \\
output.mp4
  `);

  console.log('With BGM and avatar overlay:');
  console.log(`
ffmpeg -i clip1.mp4 -i bgm.mp3 -i avatar.png \\
-filter_complex "[0:v]scale=1920:1080,setsar=1[v0];[v0][2:v]overlay=W-w-30:30[vout];[0:a][1:a]amix=inputs=2:weights=0.8 0.3:duration=shortest[aout]" \\
-map "[vout]" -map "[aout]" \\
-c:v libx264 -pix_fmt yuv420p -r 30 -s 1920x1080 \\
-c:a aac -b:a 128k -shortest -movflags +faststart \\
output.mp4
  `);
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  showUsageExamples();
  showFFmpegExamples();
  
  // Uncomment to run actual tests (requires server to be running)
  // testEditingAgent();
}
