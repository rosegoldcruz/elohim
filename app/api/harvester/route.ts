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
  file: string;
  success: boolean;
  error?: string;
}

const DOC_KEYWORDS = [
  "docs", "documentation", "api", "guide", "reference",
  "manual", "tutorial", "help", "support", "wiki", "knowledge", "faq"
];

export async function POST(req: NextRequest) {
  let browser: Browser | null = null;

  try {
    const body: HarvestRequest = await req.json();
    const { base_url, urls, max_depth = 2, use_js = false } = body;

    if (!base_url && (!urls || urls.length === 0)) {
      return NextResponse.json({ error: "Either base_url or urls array must be provided" }, { status: 400 });
    }

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--no-zygote",
        "--disable-gpu"
      ]
    });

    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    await page.setViewport({ width: 1920, height: 1080 });

    const outputDir = path.resolve(process.cwd(), "output", "harvest", Date.now().toString());
    await mkdir(outputDir, { recursive: true });

    const targetUrls = base_url
      ? await discoverDocUrls(page, base_url, max_depth)
      : urls!;

    const results: HarvestResult[] = [];

    for (const url of targetUrls) {
      try {
        const fileName = await savePageAsMarkdown(page, url, outputDir, use_js);
        results.push({ url, file: fileName, success: true });
      } catch (err) {
        results.push({ url, file: "", success: false, error: err instanceof Error ? err.message : "Unknown error" });
      }
    }

    return NextResponse.json({
      message: "Harvest complete",
      count: results.length,
      results
    });

  } catch (err) {
    return NextResponse.json({ error: "Harvest failed", details: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  } finally {
    if (browser) await browser.close();
  }
}

async function discoverDocUrls(page: Page, baseUrl: string, maxDepth: number): Promise<string[]> {
  const discovered = new Set<string>();
  const toVisit: CrawlItem[] = [{ url: baseUrl, depth: 0 }];
  const visited = new Set<string>();

  while (toVisit.length > 0) {
    const { url, depth } = toVisit.shift()!;
    if (visited.has(url) || depth > maxDepth) continue;

    visited.add(url);
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });

    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]")).map(a => ({
        href: (a as HTMLAnchorElement).href,
        text: a.textContent?.toLowerCase() || "",
        title: (a as HTMLAnchorElement).title?.toLowerCase() || ""
      }))
    );

    for (const link of links) {
      try {
        const linkUrl = new URL(link.href);
        const baseUrlObj = new URL(baseUrl);
        if (linkUrl.hostname !== baseUrlObj.hostname) continue;

        const text = `${link.text} ${link.title} ${linkUrl.pathname}`.toLowerCase();
        if (DOC_KEYWORDS.some(k => text.includes(k)) && !visited.has(link.href)) {
          discovered.add(link.href);
          if (depth < maxDepth) toVisit.push({ url: link.href, depth: depth + 1 });
        }
      } catch {
        continue;
      }
    }
  }

  return Array.from(discovered);
}

async function savePageAsMarkdown(page: Page, url: string, outputDir: string, useJs: boolean): Promise<string> {
  const waitUntil = useJs ? "networkidle0" : "domcontentloaded";
  await page.goto(url, { waitUntil, timeout: 30000 });
  if (useJs) await new Promise(resolve => setTimeout(resolve, 2000));

  const { title, content } = await page.evaluate(() => {
    document.querySelectorAll("script, style, noscript").forEach(el => el.remove());
    return {
      title: document.title || "untitled",
      content: document.body?.innerText || document.documentElement.innerText || ""
    };
  });

  const safeTitle = title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").substring(0, 50);
  const fileName = `${safeTitle || "page"}.md`;
  const filePath = path.join(outputDir, fileName);

  await writeFile(filePath, `# ${title}\n\n${content.trim()}`);
  return fileName;
}

