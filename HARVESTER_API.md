# 🌾 Universal Doc Harvester API

A production-ready Next.js API route that replaces Flask-based documentation harvesting with native TypeScript implementation using Puppeteer.

## 🚀 Features

- **Auto-Discovery**: Crawls websites to find documentation pages automatically
- **Manual URLs**: Process specific URLs directly
- **JavaScript Support**: Handles SPAs and dynamic content
- **Depth Control**: Configurable crawling depth (0-5 levels)
- **Smart Filtering**: Identifies doc pages using keyword matching
- **Robust Error Handling**: Graceful failure handling with detailed logging
- **JSON Output**: Structured data export with metadata
- **Resource Cleanup**: Automatic browser cleanup to prevent memory leaks

## 📡 API Endpoint

```
POST /api/harvester
```

## 📋 Request Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `base_url` | string | No* | - | Base URL for auto-discovery |
| `urls` | string[] | No* | - | Specific URLs to harvest |
| `max_depth` | number | No | 2 | Maximum crawling depth (0-5) |
| `use_js` | boolean | No | false | Enable JavaScript rendering |

*Either `base_url` or `urls` must be provided.

## 🔍 Auto-Discovery Keywords

The harvester identifies documentation pages using these keywords:
- `docs`, `documentation`, `api`, `guide`, `reference`, `manual`
- `tutorial`, `help`, `support`, `wiki`, `knowledge`, `faq`

## 📤 Response Format

### Success Response
```json
{
  "message": "Harvest complete",
  "file": "/path/to/harvest_1234567890.json",
  "count": 15,
  "successful": 14,
  "failed": 1
}
```

### Error Response
```json
{
  "error": "Either base_url or urls array must be provided",
  "details": "Additional error information"
}
```

## 📄 Output File Structure

```json
{
  "metadata": {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "base_url": "https://docs.example.com",
    "urls": null,
    "max_depth": 2,
    "use_js": false,
    "total_urls": 15,
    "successful": 14,
    "failed": 1
  },
  "results": [
    {
      "url": "https://docs.example.com/api",
      "title": "API Documentation",
      "content": "Full page text content...",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "success": true
    }
  ]
}
```

## 🧪 Usage Examples

### 1. Auto-Discover Documentation
```bash
curl -X POST http://localhost:3000/api/harvester \
  -H "Content-Type: application/json" \
  -d '{
    "base_url": "https://nextjs.org",
    "max_depth": 2,
    "use_js": false
  }'
```

### 2. Harvest Specific URLs
```bash
curl -X POST http://localhost:3000/api/harvester \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://nextjs.org/docs",
      "https://nextjs.org/docs/getting-started"
    ],
    "use_js": true
  }'
```

### 3. JavaScript-Heavy Sites
```bash
curl -X POST http://localhost:3000/api/harvester \
  -H "Content-Type: application/json" \
  -d '{
    "base_url": "https://spa-docs.example.com",
    "max_depth": 1,
    "use_js": true
  }'
```

## 🔧 Configuration

### Puppeteer Settings
The harvester uses optimized Puppeteer settings for production:
- Headless mode enabled
- Sandbox disabled for Docker compatibility
- GPU acceleration disabled
- Memory usage optimized
- 30-second timeout per page

### Browser Configuration
- User Agent: Modern Chrome
- Viewport: 1920x1080
- Network idle detection
- Script/style removal for clean text

## 📁 File Output

Files are saved to: `./output/harvest/harvest_TIMESTAMP.json`

The output directory is automatically created if it doesn't exist.

## ⚠️ Error Handling

Common error scenarios:
- Invalid URLs or network failures
- Timeout errors (30s per page)
- JavaScript execution errors
- File system write errors
- Browser launch failures

All errors are logged with context and return appropriate HTTP status codes.

## 🚀 Production Deployment

### Environment Requirements
- Node.js 20+
- Sufficient memory for Puppeteer (recommend 2GB+)
- Write permissions for output directory

### Docker Considerations
Add these Puppeteer args for containerized environments:
```javascript
args: [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage'
]
```

### Performance Tips
- Use `use_js: false` when possible (faster)
- Limit `max_depth` to avoid excessive crawling
- Monitor memory usage with large harvests
- Consider rate limiting for production use

## 🔄 Migration from Flask

This API route provides 100% compatibility with the original Flask harvester:

| Flask Endpoint | Next.js Route | Status |
|----------------|---------------|---------|
| `POST /discover` | `POST /api/harvester` (with base_url) | ✅ |
| `POST /fetch` | `POST /api/harvester` (with urls) | ✅ |
| `POST /process` | Built into main endpoint | ✅ |

## 🧪 Testing

Run the test script:
```bash
node scripts/test-harvester.js
```

Or test manually with your development server running on port 3000.

## 📊 Monitoring

The harvester provides detailed logging:
- Request parameters
- Discovery progress
- Harvest status per URL
- Error details
- Performance metrics

Monitor these logs in production for debugging and optimization.
