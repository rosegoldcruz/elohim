# DocHarvester - Universal Documentation Extractor

DocHarvester is a powerful tool integrated into the AEON platform that allows you to extract and process documentation from ANY website for LLM training and use.

## Features

- 🔍 **Auto-Discovery**: Automatically discover documentation URLs from a base URL
- ✏️ **Manual URL Entry**: Manually specify URLs to extract
- ⚙️ **LLM Processing**: Convert extracted content into LLM-ready formats
- 📥 **Multiple Export Formats**: JSON, Markdown, Text, CSV, and Training data formats
- 🌐 **Universal Compatibility**: Works with any documentation website
- 🚀 **Batch Processing**: Efficient handling of multiple URLs
- 🔄 **Retry Logic**: Robust error handling and retry mechanisms

## How to Use

### 1. Access DocHarvester

Navigate to `/docs` in your AEON platform and click on "DocHarvester" or go directly to `/docs/docharvester`.

### 2. Auto-Discovery Mode

1. Enter a base documentation URL (e.g., `https://docs.stripe.com`)
2. Set the maximum crawl depth (1-5)
3. Enable JavaScript if the site requires it
4. Click "Discover URLs" to automatically find documentation pages
5. Select the URLs you want to extract
6. Click "Fetch Selected" to start extraction

### 3. Manual Mode

1. Switch to the "Manual URLs" tab
2. Enter URLs one per line in the text area
3. Configure delay, retries, and batch size
4. Click "Start Fetching" to begin extraction

### 4. Processing & Export

1. Switch to the "Process & Export" tab
2. Click "Process for LLM" to convert content into LLM-ready chunks
3. Choose your export format:
   - **JSON**: Structured data format
   - **Markdown**: Human-readable format
   - **Text**: Plain text format
   - **CSV**: Spreadsheet format
   - **Training**: JSONL format for LLM training

## Supported Sites

DocHarvester works with virtually any documentation site, including:

- Stripe API Documentation
- Python Documentation
- React Documentation
- Docker Documentation
- Next.js Documentation
- Anthropic API Documentation
- And many more!

## Technical Details

### Architecture

- **Frontend**: HTML/CSS/JavaScript interface served via Nginx
- **Backend**: Python Flask API with Selenium for JavaScript-heavy sites
- **Processing**: Advanced text chunking and metadata extraction
- **Integration**: Seamlessly integrated into AEON platform via API proxy

### Docker Services

- `docharvester-frontend`: Nginx-served frontend interface
- `docharvester-backend`: Python Flask API server
- Data persistence via mounted volumes

### API Endpoints

- `POST /api/docharvester/discover`: Discover documentation URLs
- `POST /api/docharvester/fetch`: Fetch content from a URL
- `POST /api/docharvester/process`: Process documents for LLM use
- `GET /api/docharvester/app`: Access the DocHarvester interface

## Development

### Local Development

```bash
# Start DocHarvester services
cd apps/docharvester
docker-compose up --build

# Access directly
# Frontend: http://localhost:3001
# Backend: http://localhost:5001
```

### Production Deployment

```bash
# Start entire AEON platform with DocHarvester
docker-compose -f docker-compose.root.yml up --build -d
```

## Troubleshooting

### Common Issues

1. **JavaScript-heavy sites not loading**: Enable the "JavaScript" option in auto-discovery
2. **Rate limiting**: Increase the delay between requests in manual mode
3. **Memory issues**: Reduce batch size for large document sets
4. **Network timeouts**: Increase retry count and delay

### Logs

```bash
# View DocHarvester backend logs
docker-compose -f docker-compose.root.yml logs -f docharvester-backend

# View all logs
docker-compose -f docker-compose.root.yml logs -f
```

## Contributing

DocHarvester is part of the AEON platform. For issues or feature requests, please contact the development team.

## License

Part of the AEON platform. All rights reserved.
