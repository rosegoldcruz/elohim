import { NextRequest, NextResponse } from 'next/server';

// Dynamic import for Puppeteer to handle Vercel deployment
let puppeteer: any = null;
try {
  puppeteer = require('puppeteer');
} catch (error) {
  console.log('Puppeteer not available, falling back to fetch-based harvesting');
}

interface HarvestRequest {
  base_url?: string;
  urls?: string[];
  max_depth?: number;
  max_pages?: number;
  use_js?: boolean;
  wait_for_selector?: string;
  scroll_to_bottom?: boolean;
  click_selectors?: string[];
  extract_code_blocks?: boolean;
  extract_api_endpoints?: boolean;
  custom_selectors?: {
    content?: string[];
    exclude?: string[];
  };
}

interface HarvestResult {
  url: string;
  title: string;
  content: string;
  markdown: string;
  code_blocks: string[];
  api_endpoints: string[];
  links: string[];
  images: string[];
  metadata: {
    word_count: number;
    last_modified?: string;
    description?: string;
    keywords?: string[];
  };
  status: 'success' | 'failed';
  error?: string;
}

class AdvancedDocHarvester {
  private browser: any = null;
  private visited = new Set<string>();
  private discovered = new Set<string>();
  private results: HarvestResult[] = [];
  private usePuppeteer = false;

  async initialize() {
    if (puppeteer && !this.browser) {
      try {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        });
        this.usePuppeteer = true;
      } catch (error) {
        console.log('Failed to launch Puppeteer, falling back to fetch:', error);
        this.usePuppeteer = false;
      }
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async harvestSite(request: HarvestRequest): Promise<HarvestResult[]> {
    await this.initialize();
    
    try {
      if (request.base_url) {
        // Auto-discovery mode
        await this.crawlSite(request.base_url, request);
      } else if (request.urls) {
        // Manual URLs mode
        for (const url of request.urls) {
          await this.harvestPage(url, request);
        }
      }
      
      return this.results;
    } finally {
      await this.cleanup();
    }
  }

  private async crawlSite(startUrl: string, request: HarvestRequest) {
    const queue = [startUrl];
    const maxDepth = request.max_depth || 3;
    const maxPages = request.max_pages || 50;
    let depth = 0;

    while (queue.length > 0 && depth < maxDepth && this.results.length < maxPages) {
      const currentLevelUrls = [...queue];
      queue.length = 0;

      for (const url of currentLevelUrls) {
        if (this.visited.has(url) || this.results.length >= maxPages) continue;
        
        const result = await this.harvestPage(url, request);
        if (result && result.status === 'success') {
          // Extract and queue documentation links
          const docLinks = this.filterDocumentationLinks(result.links, startUrl);
          for (const link of docLinks) {
            if (!this.visited.has(link) && !this.discovered.has(link)) {
              queue.push(link);
              this.discovered.add(link);
            }
          }
        }
      }
      depth++;
    }
  }

  private async harvestPage(url: string, request: HarvestRequest): Promise<HarvestResult | null> {
    if (this.visited.has(url)) return null;
    this.visited.add(url);

    if (this.usePuppeteer && this.browser) {
      return this.harvestPageWithPuppeteer(url, request);
    } else {
      return this.harvestPageWithFetch(url, request);
    }
  }

  private async harvestPageWithPuppeteer(url: string, request: HarvestRequest): Promise<HarvestResult | null> {
    const page = await this.browser!.newPage();
    
    try {
      // Set user agent and viewport
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate with timeout
      await page.goto(url, { 
        waitUntil: request.use_js ? 'networkidle0' : 'domcontentloaded',
        timeout: 30000 
      });

      // Wait for specific selector if provided
      if (request.wait_for_selector) {
        await page.waitForSelector(request.wait_for_selector, { timeout: 10000 });
      }

      // Click elements if specified
      if (request.click_selectors) {
        for (const selector of request.click_selectors) {
          try {
            await page.click(selector);
            await page.waitForTimeout(1000); // Wait for content to load
          } catch (e) {
            console.log(`Could not click selector ${selector}: ${e}`);
          }
        }
      }

      // Scroll to bottom if requested
      if (request.scroll_to_bottom) {
        await this.autoScroll(page);
      }

      // Extract comprehensive content
      const result = await page.evaluate((options) => {
        const { custom_selectors, extract_code_blocks, extract_api_endpoints } = options;

        // Smart content extraction
        const getMainContent = () => {
          const contentSelectors = custom_selectors?.content || [
            'main', 'article', '.content', '.documentation', '.docs-content',
            '[role="main"]', '.markdown-body', '.post-content', '.entry-content'
          ];
          
          for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element) return element;
          }
          return document.body;
        };

        // Remove unwanted elements
        const excludeSelectors = custom_selectors?.exclude || [
          'nav', 'header', 'footer', '.sidebar', '.navigation', '.menu',
          '.ads', '.advertisement', '.social', '.comments', 'script', 'style'
        ];
        
        excludeSelectors.forEach(selector => {
          document.querySelectorAll(selector).forEach(el => el.remove());
        });

        const mainContent = getMainContent();
        const title = document.title || document.querySelector('h1')?.textContent || '';
        
        // Extract text content
        const content = mainContent?.innerText || '';
        
        // Convert to markdown-like format
        const markdown = Array.from(mainContent?.querySelectorAll('h1,h2,h3,h4,h5,h6,p,pre,code,ul,ol,li') || [])
          .map(el => {
            const tag = el.tagName.toLowerCase();
            const text = el.textContent?.trim() || '';
            
            if (tag.startsWith('h')) {
              const level = '#'.repeat(parseInt(tag[1]));
              return `${level} ${text}`;
            } else if (tag === 'pre' || tag === 'code') {
              return `\`\`\`\n${text}\n\`\`\``;
            } else if (tag === 'li') {
              return `- ${text}`;
            }
            return text;
          })
          .filter(text => text.length > 0)
          .join('\n\n');

        // Extract code blocks
        const codeBlocks = extract_code_blocks ? 
          Array.from(document.querySelectorAll('pre, code, .highlight, .code-block'))
            .map(el => el.textContent?.trim() || '')
            .filter(code => code.length > 10) : [];

        // Extract API endpoints
        const apiEndpoints = extract_api_endpoints ? 
          Array.from(document.querySelectorAll('code, pre'))
            .map(el => el.textContent || '')
            .filter(text => /\/(api|v\d+)\/|GET|POST|PUT|DELETE|PATCH/.test(text))
            .map(text => text.match(/[A-Z]+\s+\/[^\s]+|\/api[^\s]*/g))
            .flat()
            .filter(Boolean) as string[] : [];

        // Extract links
        const links = Array.from(document.querySelectorAll('a[href]'))
          .map(a => (a as HTMLAnchorElement).href)
          .filter(href => href.startsWith('http'));

        // Extract images
        const images = Array.from(document.querySelectorAll('img[src]'))
          .map(img => (img as HTMLImageElement).src);

        // Extract metadata
        const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
        const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content')?.split(',') || [];
        const lastModified = document.querySelector('meta[name="last-modified"]')?.getAttribute('content') || '';

        return {
          title,
          content,
          markdown,
          code_blocks: codeBlocks,
          api_endpoints: apiEndpoints,
          links,
          images,
          metadata: {
            word_count: content.split(/\s+/).length,
            description,
            keywords: keywords.map(k => k.trim()),
            last_modified: lastModified
          }
        };
      }, { 
        custom_selectors: request.custom_selectors,
        extract_code_blocks: request.extract_code_blocks,
        extract_api_endpoints: request.extract_api_endpoints
      });

      const harvestResult: HarvestResult = {
        url,
        ...result,
        status: 'success'
      };

      this.results.push(harvestResult);
      return harvestResult;

    } catch (error) {
      const errorResult: HarvestResult = {
        url,
        title: 'Failed to load',
        content: '',
        markdown: '',
        code_blocks: [],
        api_endpoints: [],
        links: [],
        images: [],
        metadata: { word_count: 0 },
        status: 'failed',
        error: String(error)
      };
      
      this.results.push(errorResult);
      return errorResult;
    } finally {
      await page.close();
    }
  }

  private async harvestPageWithFetch(url: string, request: HarvestRequest): Promise<HarvestResult | null> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const html = await response.text();

      // Simple HTML parsing without DOM
      const title = this.extractTitle(html);
      const content = this.extractContent(html);
      const links = this.extractLinks(html, url);
      const codeBlocks = request.extract_code_blocks ? this.extractCodeBlocks(html) : [];
      const apiEndpoints = request.extract_api_endpoints ? this.extractApiEndpoints(html) : [];

      const harvestResult: HarvestResult = {
        url,
        title,
        content,
        markdown: content, // Simple fallback
        code_blocks: codeBlocks,
        api_endpoints: apiEndpoints,
        links,
        images: [],
        metadata: {
          word_count: content.split(/\s+/).length,
          description: '',
          keywords: []
        },
        status: 'success'
      };

      this.results.push(harvestResult);
      return harvestResult;

    } catch (error) {
      const errorResult: HarvestResult = {
        url,
        title: 'Failed to load',
        content: '',
        markdown: '',
        code_blocks: [],
        api_endpoints: [],
        links: [],
        images: [],
        metadata: { word_count: 0 },
        status: 'failed',
        error: String(error)
      };

      this.results.push(errorResult);
      return errorResult;
    }
  }

  private extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) return titleMatch[1].trim();

    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) return h1Match[1].replace(/<[^>]*>/g, '').trim();

    return 'Untitled';
  }

  private extractContent(html: string): string {
    // Remove scripts, styles, and other unwanted elements
    let content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');

    // Extract text content
    content = content.replace(/<[^>]*>/g, ' ');
    content = content.replace(/\s+/g, ' ').trim();

    return content;
  }

  private extractLinks(html: string, baseUrl: string): string[] {
    const linkMatches = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
    const links: string[] = [];

    for (const match of linkMatches) {
      const hrefMatch = match.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) {
        try {
          const absoluteUrl = new URL(hrefMatch[1], baseUrl).href;
          links.push(absoluteUrl);
        } catch (e) {
          // Invalid URL, skip
        }
      }
    }

    return [...new Set(links)];
  }

  private extractCodeBlocks(html: string): string[] {
    const codeMatches = html.match(/<(?:pre|code)[^>]*>([^<]+)<\/(?:pre|code)>/gi) || [];
    return codeMatches
      .map(match => match.replace(/<[^>]*>/g, '').trim())
      .filter(code => code.length > 10);
  }

  private extractApiEndpoints(html: string): string[] {
    const content = html.replace(/<[^>]*>/g, ' ');
    const endpoints = content.match(/(?:GET|POST|PUT|DELETE|PATCH)\s+\/[^\s]+|\/api[^\s]*/gi) || [];
    return [...new Set(endpoints)];
  }

  private async autoScroll(page: Page) {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  private filterDocumentationLinks(links: string[], baseUrl: string): string[] {
    const baseDomain = new URL(baseUrl).hostname;
    const docKeywords = ['doc', 'api', 'guide', 'tutorial', 'reference', 'manual', 'help'];
    
    return links.filter(link => {
      try {
        const url = new URL(link);
        // Same domain only
        if (url.hostname !== baseDomain) return false;
        
        // Check if URL contains documentation keywords
        const path = url.pathname.toLowerCase();
        return docKeywords.some(keyword => path.includes(keyword));
      } catch {
        return false;
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: HarvestRequest = await request.json();
    
    if (!body.base_url && !body.urls) {
      return NextResponse.json(
        { error: 'Either base_url or urls must be provided' },
        { status: 400 }
      );
    }

    const harvester = new AdvancedDocHarvester();
    const results = await harvester.harvestSite(body);

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total_pages: results.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'failed').length,
        total_words: results.reduce((sum, r) => sum + r.metadata.word_count, 0),
        total_code_blocks: results.reduce((sum, r) => sum + r.code_blocks.length, 0),
        total_api_endpoints: results.reduce((sum, r) => sum + r.api_endpoints.length, 0)
      }
    });

  } catch (error) {
    console.error('DocHarvester error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
