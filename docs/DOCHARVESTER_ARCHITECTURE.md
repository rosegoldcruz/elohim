# 🌾 DocHarvester Architecture & Enhancement Guide

## 🚨 **ISSUE RESOLVED**

The DocHarvester HTTP 500 errors were caused by broken API routes trying to connect to a non-existent Docker backend. **This has been fixed!**

### **What Was Wrong**
- `/api/harvest/*` routes were trying to connect to `http://docharvester-backend:5000` (Docker container that was removed)
- Frontend was calling broken endpoints instead of the working Puppeteer implementation

### **What Was Fixed**
- ✅ **Removed broken `/api/harvest/*` routes** that depended on Docker backend
- ✅ **Updated DocHarvester page** to use working `/api/harvester` endpoint
- ✅ **Added better error handling** and logging to Puppeteer browser launch
- ✅ **Fixed URL discovery and fetching** to use the working implementation

---

## 📁 **Current File Structure**

```
AEON DocHarvester/
├── 🎨 Frontend
│   └── app/docs/harvester/page.tsx          # Main DocHarvester UI
│
├── 🔧 API Backend  
│   └── app/api/harvester/route.ts           # Working Puppeteer implementation
│
├── 📚 Documentation
│   ├── HARVESTER_API.md                     # API documentation
│   ├── docs/DOCHARVESTER_ARCHITECTURE.md   # This file
│   └── README.md                            # Platform overview
│
└── 🗂️ Types & Config
    ├── package.json                         # Puppeteer dependency
    └── lib/supabase.ts                      # Database client
```

---

## 🔧 **Core Components**

### **1. Frontend UI (`app/docs/harvester/page.tsx`)**
- **Auto Discovery**: Crawls websites to find documentation pages
- **Manual URLs**: Process specific URLs directly  
- **Real-time Progress**: Shows fetching progress with batch processing
- **Export Options**: JSON, Markdown, Text, CSV formats
- **Error Handling**: Retry logic and graceful failure handling

### **2. API Backend (`app/api/harvester/route.ts`)**
- **Puppeteer Integration**: Headless browser for content extraction
- **Smart Filtering**: Identifies doc pages using keyword matching
- **Depth Control**: Configurable crawling depth (0-5 levels)
- **JavaScript Support**: Handles SPAs and dynamic content
- **Resource Cleanup**: Automatic browser cleanup

---

## 🚀 **How It Works**

### **Auto Discovery Mode**
```typescript
// 1. User enters base URL (e.g., https://docs.stripe.com)
// 2. Frontend calls API
const response = await fetch('/api/harvester', {
  method: 'POST',
  body: JSON.stringify({
    base_url: 'https://docs.stripe.com',
    max_depth: 2,
    use_js: false
  })
});

// 3. API launches Puppeteer browser
// 4. Crawls site looking for doc-related links
// 5. Extracts content from discovered pages
// 6. Returns structured data
```

### **Manual URL Mode**
```typescript
// 1. User pastes specific URLs
// 2. Frontend calls API
const response = await fetch('/api/harvester', {
  method: 'POST', 
  body: JSON.stringify({
    urls: [
      'https://docs.stripe.com/api',
      'https://docs.stripe.com/payments'
    ],
    use_js: true
  })
});

// 3. API processes each URL individually
// 4. Returns content for each page
```

---

## 🎯 **Enhancement Opportunities**

### **1. Advanced Content Processing**

#### **Current**: Basic text extraction
```typescript
// Current implementation
const { title, content } = await page.evaluate(() => {
  return {
    title: document.title || '',
    content: document.body?.innerText || ''
  };
});
```

#### **Enhanced**: Smart content parsing
```typescript
// Enhanced implementation
const { title, content, metadata } = await page.evaluate(() => {
  // Remove navigation, ads, footers
  const contentSelectors = [
    'main', 'article', '.content', '.documentation',
    '[role="main"]', '.docs-content'
  ];
  
  // Extract structured content
  const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4'))
    .map(h => ({ level: h.tagName, text: h.textContent }));
    
  const codeBlocks = Array.from(document.querySelectorAll('pre, code'))
    .map(code => code.textContent);
    
  return {
    title: document.title,
    content: getMainContent(),
    headings,
    codeBlocks,
    links: extractInternalLinks(),
    lastModified: getLastModified()
  };
});
```

### **2. AI-Powered Content Enhancement**

```typescript
// Add to app/api/harvester/route.ts
import OpenAI from 'openai';

async function enhanceWithAI(content: string, url: string) {
  const openai = new OpenAI();
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "Extract key concepts, API endpoints, and code examples from this documentation."
    }, {
      role: "user", 
      content: `URL: ${url}\n\nContent: ${content}`
    }],
    max_tokens: 1000
  });
  
  return {
    summary: response.choices[0].message.content,
    keyTopics: extractKeyTopics(content),
    apiEndpoints: extractAPIEndpoints(content),
    codeExamples: extractCodeExamples(content)
  };
}
```

### **3. Database Integration**

```typescript
// Add to app/api/harvester/route.ts
import { createClient } from '@/lib/supabase';

async function saveToDatabase(results: HarvestResult[]) {
  const supabase = createClient();
  
  for (const result of results) {
    await supabase.from('harvested_docs').insert({
      url: result.url,
      title: result.title,
      content: result.content,
      domain: new URL(result.url).hostname,
      harvested_at: new Date().toISOString(),
      content_hash: generateHash(result.content)
    });
  }
}
```

### **4. Advanced Export Formats**

```typescript
// Add to app/docs/harvester/page.tsx
const exportFormats = {
  // Training data for fine-tuning
  jsonl: (results) => results.map(r => 
    JSON.stringify({ 
      prompt: `Documentation for ${r.title}`, 
      completion: r.content 
    })
  ).join('\n'),
  
  // Vector embeddings ready
  embeddings: async (results) => {
    const openai = new OpenAI();
    const embeddings = await Promise.all(
      results.map(r => openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: r.content
      }))
    );
    return embeddings;
  },
  
  // Knowledge graph format
  graph: (results) => ({
    nodes: results.map(r => ({ id: r.url, label: r.title })),
    edges: extractLinkRelationships(results)
  })
};
```

---

## 🔥 **Advanced Features to Add**

### **1. Intelligent Site Mapping**
```typescript
// Auto-detect documentation structure
const siteMap = await analyzeSiteStructure(baseUrl);
// Returns: { sections: [], apiDocs: [], tutorials: [], examples: [] }
```

### **2. Content Deduplication**
```typescript
// Avoid harvesting duplicate content
const contentHash = generateHash(content);
if (await isDuplicate(contentHash)) {
  return { skipped: true, reason: 'duplicate' };
}
```

### **3. Rate Limiting & Politeness**
```typescript
// Respect robots.txt and rate limits
await respectRateLimit(domain);
await checkRobotsTxt(baseUrl);
```

### **4. Multi-format Support**
```typescript
// Handle PDFs, Word docs, etc.
if (url.endsWith('.pdf')) {
  return await extractPDFContent(url);
}
```

### **5. Real-time Streaming**
```typescript
// Stream results as they're processed
const stream = new ReadableStream({
  start(controller) {
    // Send results as they complete
    controller.enqueue(JSON.stringify(result));
  }
});
```

---

## 🛠️ **Development Workflow**

### **1. Local Testing**
```bash
# Start development server
pnpm dev

# Test DocHarvester
curl -X POST http://localhost:3000/api/harvester \
  -H "Content-Type: application/json" \
  -d '{"base_url": "https://nextjs.org/docs", "max_depth": 1}'
```

### **2. Adding New Features**
1. **Update API** (`app/api/harvester/route.ts`)
2. **Update Frontend** (`app/docs/harvester/page.tsx`)
3. **Add Types** (if needed)
4. **Test & Deploy**

### **3. Performance Optimization**
- **Parallel Processing**: Process multiple URLs simultaneously
- **Caching**: Cache results to avoid re-harvesting
- **Compression**: Compress large content before storage
- **CDN**: Use CDN for static assets

---

## 🎯 **Client Use Cases**

### **For Your Clients**
1. **API Documentation**: Harvest Stripe, Twilio, etc.
2. **Competitor Analysis**: Extract competitor documentation
3. **Knowledge Base**: Build internal knowledge bases
4. **Training Data**: Create LLM training datasets
5. **Content Migration**: Migrate from old documentation systems

### **Business Value**
- **Time Savings**: Automate manual documentation extraction
- **Consistency**: Standardized format across all sources
- **Scalability**: Process hundreds of sites automatically
- **Integration**: Direct integration with LLM workflows

---

## 🚀 **Next Steps**

1. **Test the fixed DocHarvester** at `/docs/harvester`
2. **Try harvesting Stripe docs** (should work now!)
3. **Implement AI enhancement** for better content processing
4. **Add database storage** for harvested content
5. **Create client-specific features** based on their needs

**The DocHarvester is now fully functional and ready for your clients!** 🎉
