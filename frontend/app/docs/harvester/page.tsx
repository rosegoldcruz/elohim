'use client';

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, Download, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Interfaces
interface CrawlResult {
  url: string;
  title: string;
  content: string;
  links: string[];
  wordCount: number;
  status: 'success' | 'failed';
  error?: string;
  filename?: string;
}

interface CrawlOptions {
  maxDepth: number;
  maxPages: number;
  respectRobots: boolean;
  onProgress?: (progress: { discovered: number; processed: number; current: string }) => void;
  onLog?: (message: string) => void;
}

interface CrawlJob {
  id: string;
  url: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress: { discovered: number; processed: number; current: string };
  results: CrawlResult[];
  logs: string[];
}

// WebCrawler class adapted for browser environment
class WebCrawler {
  private visited = new Set<string>();
  private discovered = new Set<string>();
  private queue: string[] = [];
  private results: CrawlResult[] = [];
  private baseUrl: string = '';
  private baseDomain: string = '';

  async crawl(startUrl: string, options: CrawlOptions): Promise<CrawlResult[]> {
    this.reset();
    this.baseUrl = new URL(startUrl).origin;
    this.baseDomain = new URL(startUrl).hostname;

    this.queue.push(startUrl);
    this.discovered.add(startUrl);

    options.onLog?.(`Starting crawl from: ${startUrl}`);
    options.onLog?.(`Domain: ${this.baseDomain}`);

    let depth = 0;
    while (this.queue.length > 0 && depth < options.maxDepth && this.results.length < options.maxPages) {
      const currentBatch = [...this.queue];
      this.queue = [];

      options.onLog?.(`Processing depth ${depth + 1} with ${currentBatch.length} URLs`);

      for (const url of currentBatch) {
        if (this.visited.has(url) || this.results.length >= options.maxPages) continue;

        options.onProgress?.({
          discovered: this.discovered.size,
          processed: this.visited.size,
          current: url
        });

        try {
          const result = await this.crawlPage(url, options);
          this.results.push(result);
          this.visited.add(url);

          // Add discovered links to queue for next depth
          for (const link of result.links) {
            if (!this.discovered.has(link) && this.isValidDocLink(link)) {
              this.queue.push(link);
              this.discovered.add(link);
            }
          }

          options.onLog?.(`✓ ${result.title} (${result.wordCount} words, ${result.links.length} links found)`);
        } catch (error) {
          options.onLog?.(`✗ Failed: ${url} - ${error}`);
          this.results.push({
            url,
            title: 'Failed to load',
            content: '',
            links: [],
            wordCount: 0,
            status: 'failed',
            error: String(error)
          });
          this.visited.add(url);
        }

        // Delay to avoid overwhelming server
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      depth++;
    }

    options.onLog?.(`Crawl completed: ${this.results.length} pages processed, ${this.discovered.size} total discovered`);
    return this.results;
  }

  private async crawlPage(url: string, options: CrawlOptions): Promise<CrawlResult> {
    // Use fetch with proper headers to avoid being blocked
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DocHarvester/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract title with better fallbacks
    let title = doc.querySelector('title')?.textContent?.trim() || '';
    if (!title) {
      title = doc.querySelector('h1')?.textContent?.trim() || '';
    }
    if (!title) {
      const pathParts = new URL(url).pathname.split('/');
      title = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || 'Untitled';
    }

    // Clean title for filename
    const filename = this.sanitizeFilename(title);

    // Extract content with better selectors
    const content = this.extractContent(doc);

    // Extract all valid links
    const links = this.extractLinks(doc, url);

    return {
      url,
      title: title.trim(),
      content,
      links,
      wordCount: content.split(/\s+/).filter(w => w.length > 0).length,
      status: 'success',
      filename
    };
  }

  private extractContent(doc: Document): string {
    // Remove unwanted elements
    const unwanted = doc.querySelectorAll('script, style, nav, header, footer, .nav, .navbar, .sidebar, .menu, .advertisement, .ads');
    unwanted.forEach(el => el.remove());

    // Try multiple content selectors in order of preference
    const contentSelectors = [
      'main', '[role="main"]', '.main-content', '#main-content',
      '.content', '#content', '.documentation', '.docs',
      'article', '.article', '.post', '.entry-content',
      '.markdown-body', '.wiki-content', '.page-content'
    ];

    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector);
      if (element && element.textContent && element.textContent.trim().length > 100) {
        return this.cleanText(element.textContent);
      }
    }

    // Fallback: try to get meaningful content from body
    const body = doc.body;
    if (body) {
      return this.cleanText(body.textContent || '');
    }

    return '';
  }

  private extractLinks(doc: Document, baseUrl: string): string[] {
    const links: string[] = [];
    const anchors = doc.querySelectorAll('a[href]');

    for (const anchor of anchors) {
      const href = anchor.getAttribute('href');
      if (!href) continue;

      // Skip hash fragments, mailto, tel, etc.
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;

      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        const urlObj = new URL(absoluteUrl);

        // Only include links from the same domain
        if (urlObj.hostname === this.baseDomain) {
          // Remove hash fragments from the URL
          urlObj.hash = '';
          links.push(urlObj.href);
        }
      } catch (error) {
        // Invalid URL, skip
      }
    }

    return [...new Set(links)]; // Remove duplicates
  }

  private isValidDocLink(url: string): boolean {
    try {
      const urlObj = new URL(url);

      // Skip non-HTTP protocols
      if (!['http:', 'https:'].includes(urlObj.protocol)) return false;

      // Skip different domains
      if (urlObj.hostname !== this.baseDomain) return false;

      // Skip common non-doc file types
      const skipExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.css', '.js', '.zip', '.tar', '.gz', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
      if (skipExtensions.some(ext => urlObj.pathname.toLowerCase().endsWith(ext))) return false;

      // Skip common non-content paths
      const skipPaths = ['/api/', '/admin/', '/login', '/logout', '/register', '/search', '/contact'];
      if (skipPaths.some(path => urlObj.pathname.toLowerCase().includes(path))) return false;

      return true;
    } catch {
      return false;
    }
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
      .trim();
  }

  private sanitizeFilename(title: string): string {
    return title
      .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .toLowerCase()
      .substring(0, 50) // Limit length
      || 'untitled';
  }

  private reset() {
    this.visited.clear();
    this.discovered.clear();
    this.queue = [];
    this.results = [];
    this.baseUrl = '';
    this.baseDomain = '';
  }
}

// FileTable Component
interface FileTableProps {
  results: CrawlResult[];
  onDownload: (result: CrawlResult) => void;
}

const FileTable: React.FC<FileTableProps> = ({ results, onDownload }) => {
  if (!results.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FileText className="w-12 h-12 mx-auto mb-4 text-purple-400" />
        <p>No files available yet. Start a crawl to see results here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-white/10 bg-black/20 backdrop-blur-xl">
      <Table>
        <TableHeader>
          <TableRow className="border-white/10 hover:bg-white/5">
            <TableHead className="text-gray-300">Status</TableHead>
            <TableHead className="text-gray-300">Title</TableHead>
            <TableHead className="text-gray-300">URL</TableHead>
            <TableHead className="text-gray-300">Words</TableHead>
            <TableHead className="text-gray-300">Links</TableHead>
            <TableHead className="text-gray-300">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((result, index) => (
            <TableRow key={index} className="border-white/10 hover:bg-white/5">
              <TableCell>
                {result.status === 'success' ? (
                  <Badge className="bg-green-600/20 text-green-400 border-green-500/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Success
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="bg-red-600/20 text-red-400 border-red-500/30">
                    <XCircle className="w-3 h-3 mr-1" />
                    Failed
                  </Badge>
                )}
              </TableCell>
              <TableCell className="font-medium text-white max-w-xs truncate">
                {result.title || 'Untitled'}
              </TableCell>
              <TableCell className="text-gray-300 max-w-xs truncate">
                {result.url}
              </TableCell>
              <TableCell className="text-gray-300">
                {result.wordCount.toLocaleString()}
              </TableCell>
              <TableCell className="text-gray-300">
                {result.links.length}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  onClick={() => onDownload(result)}
                  disabled={result.status !== 'success'}
                  className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white border-0"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default function DocHarvesterPage() {
  const [url, setUrl] = useState('');
  const [currentJob, setCurrentJob] = useState<CrawlJob | null>(null);
  const [crawler] = useState(() => new WebCrawler());
  const { toast } = useToast();

  const addLog = useCallback((message: string) => {
    setCurrentJob(prev => prev ? {
      ...prev,
      logs: [...prev.logs, `${new Date().toLocaleTimeString()}: ${message}`]
    } : null);
  }, []);

  const updateProgress = useCallback((progress: { discovered: number; processed: number; current: string }) => {
    setCurrentJob(prev => prev ? {
      ...prev,
      progress
    } : null);
  }, []);

  const startCrawl = async () => {
    if (!url.trim()) {
      toast({ title: 'Error', description: 'Please enter a valid URL', variant: 'destructive' });
      return;
    }

    const newJob: CrawlJob = {
      id: Date.now().toString(),
      url: url.trim(),
      status: 'running',
      progress: { discovered: 0, processed: 0, current: '' },
      results: [],
      logs: []
    };

    setCurrentJob(newJob);
    addLog(`Starting crawl: ${newJob.url}`);

    try {
      const options: CrawlOptions = {
        maxDepth: 3,
        maxPages: 50,
        respectRobots: true,
        onProgress: updateProgress,
        onLog: addLog
      };

      const results = await crawler.crawl(newJob.url, options);

      setCurrentJob(prev => prev ? {
        ...prev,
        status: 'completed',
        results
      } : null);

      addLog(`SUCCESS: Crawl completed! ${results.length} pages processed`);
      toast({ title: 'Success', description: `Crawl completed! ${results.length} pages processed.` });
    } catch (error) {
      addLog(`FAILED: Crawl failed - ${error}`);
      setCurrentJob(prev => prev ? {
        ...prev,
        status: 'failed'
      } : null);
      toast({ title: 'Error', description: 'Crawl failed. Check logs for details.', variant: 'destructive' });
    }
  };

  const downloadFile = (result: CrawlResult) => {
    const filename = result.filename || 'untitled';
    const content = `# ${result.title}\n\n**URL:** ${result.url}\n\n${result.content}`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: 'Success', description: `Downloaded ${filename}.md` });
  };

  const downloadSummaryJSON = () => {
    if (!currentJob?.results.length) return;

    const summary = {
      crawl_summary: {
        total_pages: currentJob.results.length,
        successful_pages: currentJob.results.filter(r => r.status === 'success').length,
        failed_pages: currentJob.results.filter(r => r.status === 'failed').length,
        total_words: currentJob.results.reduce((sum, r) => sum + r.wordCount, 0),
        start_url: currentJob.url,
        timestamp: new Date().toISOString()
      },
      generated_files: currentJob.results
        .filter(r => r.status === 'success')
        .map(r => ({
          filename: `${r.filename}.md`,
          title: r.title,
          url: r.url,
          word_count: r.wordCount,
          links_found: r.links.length
        })),
      failed_urls: currentJob.results
        .filter(r => r.status === 'failed')
        .map(r => ({
          url: r.url,
          error: r.error
        }))
    };

    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'crawl-summary.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: 'Success', description: 'Downloaded crawl-summary.json' });
  };

  const successCount = currentJob?.results.filter(r => r.status === 'success').length || 0;
  const failedCount = currentJob?.results.filter(r => r.status === 'failed').length || 0;
  const totalWords = currentJob?.results.reduce((sum, r) => sum + r.wordCount, 0) || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            🌾 DocHarvester
          </h1>
          <p className="text-purple-200">Real website crawling with individual file downloads</p>
        </div>

        <Card className="bg-gradient-to-br from-purple-800/40 to-purple-700/20 border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Globe className="w-5 h-5 text-purple-400" />
              Start Website Crawl
            </CardTitle>
            <CardDescription className="text-purple-200">
              Enter a documentation website URL. Each page will be available for individual download.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url" className="text-purple-200">Documentation Website URL</Label>
              <Input
                id="url"
                placeholder="https://docs.soliditylang.org"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={currentJob?.status === 'running'}
                className="bg-purple-900/50 border-purple-500/50 text-white placeholder:text-purple-300"
              />
            </div>
            <Button
              onClick={startCrawl}
              disabled={!url.trim() || currentJob?.status === 'running'}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white border-0"
            >
              <Globe className="w-4 h-4 mr-2" />
              {currentJob?.status === 'running' ? 'Crawling...' : 'Start Crawl'}
            </Button>
          </CardContent>
        </Card>

        {currentJob && (
          <Card className="bg-gradient-to-br from-purple-800/40 to-purple-700/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-white">
                <span>Live Progress</span>
                <Badge variant={currentJob.status === 'completed' ? 'default' : 'secondary'}>
                  {currentJob.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-purple-200">
                  <span>Current: {currentJob.progress.current || 'Starting...'}</span>
                  <span>{currentJob.progress.processed}/{currentJob.progress.discovered}</span>
                </div>
                <Progress value={(currentJob.progress.processed / Math.max(currentJob.progress.discovered, 1)) * 100} className="bg-purple-900/50" />
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-400">{currentJob.progress.discovered}</div>
                  <div className="text-sm text-purple-200">Links Found</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{successCount}</div>
                  <div className="text-sm text-purple-200">Success</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-400">{failedCount}</div>
                  <div className="text-sm text-purple-200">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{totalWords.toLocaleString()}</div>
                  <div className="text-sm text-purple-200">Words</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="files" className="space-y-4">
          <TabsList className="bg-purple-900/50 border-purple-500/30">
            <TabsTrigger value="files" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Files</TabsTrigger>
            <TabsTrigger value="logs" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Logs</TabsTrigger>
            <TabsTrigger value="export" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="files">
            <Card className="bg-gradient-to-br from-purple-800/40 to-purple-700/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Downloaded Files</CardTitle>
                <CardDescription className="text-purple-200">
                  Click "Download" to get individual .md files named after page titles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileTable
                  results={currentJob?.results || []}
                  onDownload={downloadFile}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="bg-gradient-to-br from-purple-800/40 to-purple-700/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Live Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-1 font-mono text-sm">
                    {currentJob?.logs.map((log, index) => (
                      <div key={index} className="text-purple-200">{log}</div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export">
            <Card className="bg-gradient-to-br from-purple-800/40 to-purple-700/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Export Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={downloadSummaryJSON}
                  disabled={!currentJob?.results.length}
                  className="w-full h-16 flex-col bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white border-0"
                >
                  <Download className="w-5 h-5 mb-1" />
                  Download Summary JSON
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

