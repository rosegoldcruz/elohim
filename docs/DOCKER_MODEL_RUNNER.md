# AEON Docker Model Runner Integration

This document describes the Docker Model Runner integration for AEON's AI platform, enabling local LLM execution alongside cloud-based models.

## Overview

The Docker Model Runner integration allows AEON to:
- Run local LLM models via Docker containers
- Switch between local and cloud-based models dynamically
- Maintain consistent API interfaces across different model sources
- Provide offline AI capabilities for enhanced privacy and control

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AEON Frontend │    │   Model Manager  │    │ Docker Model    │
│                 │◄──►│                  │◄──►│ Runner          │
│ - Dashboard     │    │ - Mode Switching │    │ - Local LLM     │
│ - Settings      │    │ - State Mgmt     │    │ - HTTP API      │
│ - Status Banner │    │ - Health Checks  │    │ - OpenAI Compat │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ ScriptWriterAgent│
                       │                  │
                       │ - Dynamic Model  │
                       │ - Fallback Logic │
                       │ - Error Handling │
                       └──────────────────┘
```

## Components

### 1. Local LLM Integration (`local-llm.ts`)
- **Purpose**: HTTP client for Docker Model Runner
- **Features**: 
  - OpenAI-compatible API interface
  - Health checks and model discovery
  - Timeout and error handling
  - Automatic retry logic

### 2. Model Manager (`model-manager.ts`)
- **Purpose**: Centralized model switching and configuration
- **Features**:
  - Dynamic mode switching (local/openai/claude/replicate)
  - State persistence via localStorage
  - Event-driven architecture for UI updates
  - Model availability checking

### 3. Enhanced ScriptWriterAgent
- **Purpose**: AI agent with multi-model support
- **Features**:
  - Environment-based model selection
  - Graceful fallbacks on model failures
  - Consistent response formatting
  - Performance monitoring

### 4. UI Components
- **ModelSourceSettings**: Dashboard configuration panel
- **ModelStatusBanner**: Real-time status display
- **Test Interface**: Development and debugging tools

## Setup Instructions

### 1. Environment Configuration

Add to your `.env.local`:

```bash
# LLM Configuration
LLM_MODE=local
LOCAL_LLM_HOST=http://localhost:12434
```

### 2. Docker Model Runner Setup

```bash
# Pull the model runner image
docker pull your-registry/model-runner:latest

# Run the container
docker run -d \
  --name aeon-model-runner \
  -p 12434:12434 \
  -v model-cache:/app/models \
  your-registry/model-runner:latest

# Verify it's running
curl http://localhost:12434/health
```

### 3. Model Installation

```bash
# Install a model (example with Llama 2)
docker exec aeon-model-runner \
  python -m model_manager install llama2-7b-chat

# List available models
docker exec aeon-model-runner \
  python -m model_manager list
```

## Usage

### Dashboard Configuration

1. Navigate to the AEON Dashboard
2. Go to the "Settings" tab
3. Use the "Model Source Configuration" panel to:
   - Select your preferred model source
   - Check local model availability
   - Switch between models in real-time

### Programmatic Usage

```typescript
import { modelManager } from '~/lib/utils/model-manager';
import { ScriptWriterAgent } from '~/lib/agents/script-writer-agent';

// Switch to local model
await modelManager.switchMode('local');

// Use the agent (will automatically use local model)
const agent = new ScriptWriterAgent();
const result = await agent.execute({
  topic: 'AI Introduction',
  tone: 'educational',
  duration: 60,
  targetAudience: 'beginners'
});
```

### Direct Local LLM Usage

```typescript
import { runLocalLLM } from '~/lib/integrations/local-llm';

const response = await runLocalLLM([
  {
    role: 'system',
    content: 'You are a helpful assistant.'
  },
  {
    role: 'user',
    content: 'Write a short introduction to AI.'
  }
], {
  temperature: 0.7,
  maxTokens: 500
});
```

## API Endpoints

### Health Check
```
GET /health
Response: { "status": "healthy", "model": "llama2-7b-chat" }
```

### Chat Completion
```
POST /v1/chat/completions
Content-Type: application/json

{
  "model": "local-model",
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "temperature": 0.7,
  "max_tokens": 100
}
```

### Model List
```
GET /v1/models
Response: {
  "data": [
    {"id": "llama2-7b-chat", "object": "model"},
    {"id": "codellama-7b", "object": "model"}
  ]
}
```

## Testing

### Automated Tests
```bash
# Run the test suite
npm run test:llm

# Or visit the test page
http://localhost:3000/test-llm
```

### Manual Testing
1. Visit `/test-llm` in your browser
2. Use the "Single Model Test" to test specific models
3. Use "Full Integration Test" for comprehensive testing
4. Check the console for detailed logs

## Troubleshooting

### Common Issues

**1. "Cannot connect to Docker Model Runner"**
- Ensure Docker is running
- Check if the container is started: `docker ps`
- Verify port mapping: `docker port aeon-model-runner`
- Test connectivity: `curl http://localhost:12434/health`

**2. "Local LLM request timed out"**
- Model may be loading (first request can be slow)
- Check container logs: `docker logs aeon-model-runner`
- Increase timeout in local-llm.ts if needed

**3. "Model switching not working"**
- Clear localStorage: `localStorage.removeItem('aeon-llm-mode')`
- Check environment variables
- Restart the development server

### Debug Commands

```bash
# Check container status
docker ps | grep model-runner

# View container logs
docker logs -f aeon-model-runner

# Test API directly
curl -X POST http://localhost:12434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"local-model","messages":[{"role":"user","content":"Hello"}]}'

# Check model usage
docker exec aeon-model-runner nvidia-smi  # If using GPU
```

## Performance Considerations

### Local Model Performance
- **First Request**: May take 10-30 seconds (model loading)
- **Subsequent Requests**: 1-5 seconds depending on model size
- **Memory Usage**: 4-16GB RAM depending on model
- **GPU Acceleration**: Recommended for larger models

### Optimization Tips
1. **Model Selection**: Use smaller models for development
2. **Caching**: Keep container running to avoid reload times
3. **Resource Limits**: Set appropriate Docker memory limits
4. **Batch Processing**: Group multiple requests when possible

## Security Notes

- Local models run entirely on your infrastructure
- No data sent to external APIs when using local mode
- Docker container should not be exposed to public internet
- Consider using Docker secrets for sensitive configurations

## Future Enhancements

- [ ] Model auto-downloading and management
- [ ] GPU acceleration support
- [ ] Model quantization options
- [ ] Batch processing capabilities
- [ ] Model performance metrics
- [ ] A/B testing between models
- [ ] Custom model fine-tuning integration
