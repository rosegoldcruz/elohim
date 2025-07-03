import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Browser, Page } from "puppeteer";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

interface HarvestRequest {
  base_url?: string;
  urls?: string[];
  max_depth?: number;
  use_js?: boolean;
}

interface CrawlItem {
  url: string;
  depth: number;
}

interface HarvestResult {
  url: string;
  title: string;
  content: string;
  timestamp: string;
  success: boolean;
  error?: string;
}

// Keywords to identify documentation pages
const DOC_KEYWORDS = [
  'docs', 'documentation', 'api', 'guide', 'reference', 'manual', 
  'tutorial', 'help', 'support', 'wiki', 'knowledge', 'faq'
];

export async function POST(req: NextRequest) {
  let browser: Browser | null = null;

  try {
    console.log('🌾 DocHarvester: Starting request...');
    const body: HarvestRequest = await req.json();
    const { base_url, urls, max_depth = 2, use_js = false } = body;

    console.log('📋 Request params:', { base_url, urls: urls?.length || 0, max_depth, use_js });

    // Validation
    if (!base_url && (!urls || urls.length === 0)) {
      console.error('❌ Validation failed: No base_url or urls provided');
      return NextResponse.json(
        { error: "Either base_url or urls array must be provided" },
        { status: 400 }
      );
    }

    if (max_depth < 0 || max_depth > 5) {
      console.error('❌ Validation failed: Invalid max_depth:', max_depth);
      return NextResponse.json(
        { error: "max_depth must be between 0 and 5" },
        { status: 400 }
      );
    }

    console.log('🚀 Starting harvest process...');
    console.log(`Base URL: ${base_url}`);
    console.log(`Max Depth: ${max_depth}`);
    console.log(`Use JS: ${use_js}`);

    // Launch Puppeteer
    try {
      console.log('🚀 Launching Puppeteer browser...');
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      console.log('✅ Browser launched successfully');
    } catch (browserError) {
      console.error('❌ Failed to launch browser:', browserError);
      return NextResponse.json(
        { error: `Failed to launch browser: ${browserError instanceof Error ? browserError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    const page = await browser.newPage();
    
    // Configure page
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    let targetUrls: string[] = [];

    // Auto-discover URLs if base_url is provided
    if (base_url) {
      console.log('🔍 Auto-discovering documentation URLs...');
      targetUrls = await discoverDocUrls(page, base_url, max_depth);
      console.log(`📋 Discovered ${targetUrls.length} URLs`);
    } else {
      // Use provided URLs directly
      targetUrls = urls!;
      console.log(`📋 Using ${targetUrls.length} provided URLs`);
    }

    if (targetUrls.length === 0) {
      await browser.close();
      return NextResponse.json({
        message: "No URLs found to harvest",
        file: null,
        count: 0
      });
    }

    // Harvest content from all URLs
    console.log('📥 Harvesting content...');
    const results: HarvestResult[] = [];
    
    for (let i = 0; i < targetUrls.length; i++) {
      const url = targetUrls[i];
      console.log(`Processing ${i + 1}/${targetUrls.length}: ${url}`);
      
      try {
        const result = await harvestUrl(page, url, use_js);
        results.push(result);
      } catch (error) {
        console.error(`Error harvesting ${url}:`, error);
        results.push({
          url,
          title: '',
          content: '',
          timestamp: new Date().toISOString(),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Save results to file
    const timestamp = Date.now();
    const outputDir = path.resolve(process.cwd(), 'output', 'harvest');
    await mkdir(outputDir, { recursive: true });
    
    const fileName = `harvest_${timestamp}.json`;
    const filePath = path.join(outputDir, fileName);
    
    const harvestData = {
      metadata: {
        timestamp: new Date().toISOString(),
        base_url,
        urls: urls || null,
        max_depth,
        use_js,
        total_urls: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      },
      results
    };

    await writeFile(filePath, JSON.stringify(harvestData, null, 2));
    
    console.log(`✅ Harvest complete! Saved to ${fileName}`);
    
    return NextResponse.json({
      message: "Harvest complete",
      file: filePath,
      count: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

  } catch (error) {
    console.error('❌ Harvest error:', error);
    return NextResponse.json(
      { 
        error: "Harvest failed", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  } finally {
    // Ensure browser is always closed
    if (browser) {
      try {
        await browser.close();
        console.log('🔒 Browser closed');
      } catch (error) {
        console.error('Error closing browser:', error);
      }
    }
  }
}

async function discoverDocUrls(page: Page, baseUrl: string, maxDepth: number): Promise<string[]> {
  const discovered = new Set<string>();
  const toVisit: CrawlItem[] = [{ url: baseUrl, depth: 0 }];
  const visited = new Set<string>();

  while (toVisit.length > 0) {
    const { url, depth } = toVisit.shift()!;
    
    if (visited.has(url) || depth > maxDepth) {
      continue;
    }

    visited.add(url);
    
    try {
      console.log(`🔍 Crawling depth ${depth}: ${url}`);
      await page.goto(url, { 
        waitUntil: 'networkidle0', 
        timeout: 30000 
      });

      // Extract all links
      const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href]'));
        return anchors.map(a => ({
          href: (a as HTMLAnchorElement).href,
          text: a.textContent?.toLowerCase() || '',
          title: (a as HTMLAnchorElement).title?.toLowerCase() || ''
        }));
      });

      // Filter for documentation-related links
      for (const link of links) {
        try {
          const linkUrl = new URL(link.href);
          const baseUrlObj = new URL(baseUrl);
          
          // Only process links from the same domain
          if (linkUrl.hostname !== baseUrlObj.hostname) {
            continue;
          }

          const fullText = `${link.text} ${link.title} ${linkUrl.pathname}`.toLowerCase();
          const isDocLink = DOC_KEYWORDS.some(keyword => fullText.includes(keyword));
          
          if (isDocLink && !visited.has(link.href)) {
            discovered.add(link.href);
            if (depth < maxDepth) {
              toVisit.push({ url: link.href, depth: depth + 1 });
            }
          }
        } catch (urlError) {
          // Skip invalid URLs
          continue;
        }
      }
    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
    }
  }

  return Array.from(discovered);
}

async function harvestUrl(page: Page, url: string, useJs: boolean): Promise<HarvestResult> {
  try {
    const waitUntil = useJs ? 'networkidle0' : 'domcontentloaded';
    await page.goto(url, { waitUntil, timeout: 30000 });

    // Wait a bit more if JS is enabled
    if (useJs) {
      await page.waitForTimeout(2000);
    }

    // Extract content
    const { title, content } = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style, noscript');
      scripts.forEach(el => el.remove());

      return {
        title: document.title || '',
        content: document.body?.innerText || document.documentElement.innerText || ''
      };
    });

    return {
      url,
      title: title.trim(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      success: true
    };
  } catch (error) {
    throw new Error(`Failed to harvest ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
