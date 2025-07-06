# 🤖 AEON DeepSeek Integration

## Overview

AEON now uses **DeepSeek** for creative script generation while maintaining **OpenAI GPT-4o** for scene planning. This hybrid approach leverages DeepSeek's enhanced creative capabilities for viral TikTok content while using GPT-4o's superior structured planning abilities.

## 🚀 Key Features

- **DeepSeek-Powered Script Generation**: Enhanced creativity for viral TikTok scripts
- **Streaming Support**: Real-time script generation with chunk-by-chunk delivery
- **Hybrid AI Pipeline**: DeepSeek + OpenAI GPT-4o for optimal results
- **Viral Technique Detection**: Automatic identification of TikTok viral elements
- **3-Act Structure**: Hook, Body, CTA optimized for retention
- **Complete Backward Compatibility**: Existing code continues to work

## 🔧 Setup

### 1. Environment Variables

Add your DeepSeek API key to your `.env` file:

```bash
# Required: DeepSeek API Key
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Still required: OpenAI for scene planning
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Install Dependencies

No additional dependencies required - DeepSeek uses the same OpenAI SDK with a different base URL.

## 📖 Usage

### Basic Script Generation

```typescript
import { ScriptWriterAgent } from '@/lib/agents';

const scriptAgent = new ScriptWriterAgent();

// Generate viral TikTok script with DeepSeek
const script = await scriptAgent.generateScript("AI video generation", {
  duration: 60,
  tone: 'entertaining',
  platform: 'tiktok',
  sceneCount: 6
});

console.log(`Generated ${script.scenes.length} scenes`);
console.log(`Viral techniques: ${script.metadata.viralTechniques.join(', ')}`);
```

### Streaming Script Generation

```typescript
// Real-time streaming for better UX
const script = await scriptAgent.generateScriptStream(
  "How to go viral on TikTok",
  { duration: 45, tone: 'educational' },
  (chunk) => {
    console.log('Received chunk:', chunk);
    // Update UI in real-time
  }
);
```

### Unified DeepSeek + OpenAI Pipeline

```typescript
import { DeepSeekScriptScenePipeline } from '@/lib/agents';

const pipeline = new DeepSeekScriptScenePipeline();

const trendPackage = {
  topic: "AI revolutionizing content creation",
  hashtags: ["#AI", "#VideoGeneration", "#Viral"],
  viral_elements: ["trending audio", "split screen"],
  target_audience: "content creators",
  platform_specific_tips: ["Use vertical format", "Hook in 3 seconds"]
};

// Generate both script and scene plan
const result = await pipeline.createTikTokScriptAndScene(
  trendPackage,
  "engaging",
  (scriptChunk) => console.log('Script:', scriptChunk),
  (sceneChunk) => console.log('Scene:', sceneChunk)
);

console.log('Script:', result.script);
console.log('Scene Plan:', result.scenePlan);
console.log('Metadata:', result.metadata);
```

## 🎯 Viral Techniques Automatically Detected

The system automatically identifies and incorporates these TikTok viral techniques:

- **First-frame hooks** - Attention-grabbing openers
- **Meme integration** - Trending references and audio
- **ASMR elements** - Satisfying visuals and sounds
- **Rapid cuts** - Dynamic pacing for retention
- **Text overlays** - Accessibility and engagement
- **Punch-in effects** - Visual emphasis and drama
- **Plot twists** - Surprise elements and irony
- **Visual graphics** - Emojis and on-screen elements

## 🔄 Migration Guide

### Existing Code (Still Works)

```typescript
// This continues to work unchanged
const scriptAgent = new ScriptWriterAgent();
const script = await scriptAgent.generateScript(topic, options);
```

### Enhanced with DeepSeek Features

```typescript
// New streaming capabilities
const script = await scriptAgent.generateScriptStream(topic, options, onChunk);

// New unified pipeline
const pipeline = new DeepSeekScriptScenePipeline();
const result = await pipeline.createTikTokScriptAndScene(trendPackage);
```

## 🧪 Testing

Run the test suite to verify the integration:

```bash
# Test the complete pipeline
node scripts/test-deepseek-pipeline.js

# Test individual components
npm test -- --grep "DeepSeek"
```

## 📊 Performance Benefits

- **Enhanced Creativity**: DeepSeek's superior creative writing for viral content
- **Streaming UX**: Real-time generation improves user experience
- **Hybrid Approach**: Best of both models (DeepSeek + GPT-4o)
- **Cost Optimization**: DeepSeek offers competitive pricing
- **Viral Optimization**: Specialized prompts for TikTok success

## 🔧 Configuration

### Model Settings

```typescript
// DeepSeek configuration (in ScriptWriterAgent)
{
  model: "deepseek-chat",
  temperature: 1.2,  // Higher creativity for viral content
  max_tokens: 1800,
  stream: true       // Enable streaming
}

// OpenAI GPT-4o configuration (for scene planning)
{
  model: "gpt-4o",
  temperature: 0.7,  // More structured for planning
  max_tokens: 2000
}
```

### Custom Prompts

The system uses specialized prompts optimized for:
- TikTok viral techniques
- 3-act structure (Hook, Body, CTA)
- Retention optimization
- Platform-specific requirements

## 🚨 Important Notes

1. **API Keys Required**: Both DEEPSEEK_API_KEY and OPENAI_API_KEY needed
2. **Backward Compatible**: All existing code continues to work
3. **Streaming Optional**: Can be used with or without streaming
4. **Error Handling**: Robust fallback mechanisms included
5. **Storage Integration**: Automatic saving of generated content

## 🎬 Example Output

### Generated Script Structure
```
Hook (0-3s): "Stop scrolling! I just discovered the AI that's replacing entire video teams..."
Body (3-45s): [Engaging content with viral techniques]
CTA (45-60s): "Follow for more AI secrets that'll blow your mind!"

Viral Techniques Used: First-frame hook, Meme integration, Text overlays
Target Retention: Pattern interrupt, Curiosity gap, Social proof
```

### Generated Scene Plan
```
Scene 1 (0:00-0:03): Hook Scene
Camera: Extreme close-up with quick zoom-out
Visual: Split screen showing before/after
Audio: Trending sound with bass drop
Text: "AI JUST CHANGED EVERYTHING" with fire emojis
Transition: Quick cut with glitch effect
```

## 🔮 Future Enhancements

- Multi-model ensemble for script generation
- A/B testing different creative approaches
- Real-time viral trend integration
- Advanced retention analytics
- Custom model fine-tuning
