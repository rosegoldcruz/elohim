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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Globe, Download, CheckCircle2, XCircle, FileText, Code, Zap, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Interfaces
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

interface HarvestJob {
  id: string;
  url: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  results: HarvestResult[];
  logs: string[];
  summary?: {
    total_pages: number;
    successful: number;
    failed: number;
    total_words: number;
    total_code_blocks: number;
    total_api_endpoints: number;
  };
}

export default function DocHarvesterPage() {
  const [url, setUrl] = useState('');
  const [manualUrls, setManualUrls] = useState('');
  const [currentJob, setCurrentJob] = useState<HarvestJob | null>(null);
  const [advancedOptions, setAdvancedOptions] = useState({
    max_depth: 3,
    max_pages: 50,
    use_js: true,
    scroll_to_bottom: true,
    extract_code_blocks: true,
    extract_api_endpoints: true,
    wait_for_selector: '',
    click_selectors: '',
    custom_content_selectors: '',
    custom_exclude_selectors: ''
  });
  const { toast } = useToast();

  const addLog = useCallback((message: string) => {
    setCurrentJob(prev => prev ? {
      ...prev,
      logs: [...prev.logs, `${new Date().toLocaleTimeString()}: ${message}`]
    } : null);
  }, []);

  const startHarvest = async () => {
    if (!url.trim() && !manualUrls.trim()) {
      toast({ title: 'Error', description: 'Please provide a URL or manual URLs.', variant: 'destructive' });
      return;
    }

    const newJob: HarvestJob = {
      id: Date.now().toString(),
      url: url || 'Manual URLs',
      status: 'running',
      results: [],
      logs: []
    };

    setCurrentJob(newJob);
    addLog(`🚀 Starting ADVANCED DocHarvester with Puppeteer...`);
    addLog(`🔥 JavaScript rendering: ${advancedOptions.use_js ? 'ENABLED' : 'DISABLED'}`);
    addLog(`📜 Auto-scrolling: ${advancedOptions.scroll_to_bottom ? 'ENABLED' : 'DISABLED'}`);
    addLog(`💻 Code extraction: ${advancedOptions.extract_code_blocks ? 'ENABLED' : 'DISABLED'}`);

    try {
      const request: HarvestRequest = {
        max_depth: advancedOptions.max_depth,
        max_pages: advancedOptions.max_pages,
        use_js: advancedOptions.use_js,
        scroll_to_bottom: advancedOptions.scroll_to_bottom,
        extract_code_blocks: advancedOptions.extract_code_blocks,
        extract_api_endpoints: advancedOptions.extract_api_endpoints,
      };

      // Add optional fields
      if (url.trim()) {
        request.base_url = url.trim();
        addLog(`🎯 Auto-discovery mode: ${url}`);
      } else if (manualUrls.trim()) {
        request.urls = manualUrls.split('\n').map(u => u.trim()).filter(u => u);
        addLog(`📝 Manual URLs mode: ${request.urls.length} URLs`);
      }

      if (advancedOptions.wait_for_selector) {
        request.wait_for_selector = advancedOptions.wait_for_selector;
        addLog(`⏳ Waiting for selector: ${advancedOptions.wait_for_selector}`);
      }

      if (advancedOptions.click_selectors) {
        request.click_selectors = advancedOptions.click_selectors.split(',').map(s => s.trim());
        addLog(`🖱️ Will click selectors: ${request.click_selectors.join(', ')}`);
      }

      if (advancedOptions.custom_content_selectors || advancedOptions.custom_exclude_selectors) {
        request.custom_selectors = {};
        if (advancedOptions.custom_content_selectors) {
          request.custom_selectors.content = advancedOptions.custom_content_selectors.split(',').map(s => s.trim());
        }
        if (advancedOptions.custom_exclude_selectors) {
          request.custom_selectors.exclude = advancedOptions.custom_exclude_selectors.split(',').map(s => s.trim());
        }
      }

      addLog(`🔧 Launching headless browser...`);

      const response = await fetch('/api/harvester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setCurrentJob(prev => prev ? {
          ...prev,
          status: 'completed',
          results: data.results,
          summary: data.summary
        } : null);

        addLog(`✅ SUCCESS: Harvested ${data.summary.total_pages} pages!`);
        addLog(`📊 Stats: ${data.summary.successful} successful, ${data.summary.failed} failed`);
        addLog(`📝 Content: ${data.summary.total_words} words, ${data.summary.total_code_blocks} code blocks`);
        addLog(`🔗 Found ${data.summary.total_api_endpoints} API endpoints`);

        toast({
          title: 'Success!',
          description: `Harvested ${data.summary.total_pages} pages with ${data.summary.total_words} words`
        });
      } else {
        throw new Error(data.error || 'Unknown error');
      }

    } catch (error) {
      addLog(`❌ FAILED: ${error}`);
      setCurrentJob(prev => prev ? {
        ...prev,
        status: 'failed'
      } : null);
      toast({ title: 'Error', description: String(error), variant: 'destructive' });
    }
  };

  const downloadFile = (result: HarvestResult, format: 'txt' | 'md' | 'json') => {
    let content = '';
    let filename = '';
    let mimeType = '';

    const sanitizedTitle = result.title.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '-').toLowerCase().substring(0, 50) || 'untitled';

    switch (format) {
      case 'txt':
        content = result.content;
        filename = `${sanitizedTitle}.txt`;
        mimeType = 'text/plain';
        break;
      case 'md':
        content = result.markdown || result.content;
        filename = `${sanitizedTitle}.md`;
        mimeType = 'text/markdown';
        break;
      case 'json':
        content = JSON.stringify(result, null, 2);
        filename = `${sanitizedTitle}.json`;
        mimeType = 'application/json';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllResults = (format: 'txt' | 'md' | 'json') => {
    if (!currentJob?.results?.length) return;

    const results = currentJob.results.filter(r => r.status === 'success');
    if (!results.length) {
      toast({ title: 'No Results', description: 'No successful results to download.', variant: 'destructive' });
      return;
    }

    let content = '';
    let filename = '';
    let mimeType = '';

    const timestamp = new Date().toISOString().split('T')[0];
    const domain = new URL(currentJob.url).hostname.replace(/[^a-zA-Z0-9]/g, '-');

    switch (format) {
      case 'txt':
        content = results.map(r => `=== ${r.title} ===\nURL: ${r.url}\n\n${r.content}\n\n`).join('\n');
        filename = `docharvester-${domain}-${timestamp}.txt`;
        mimeType = 'text/plain';
        break;
      case 'md':
        content = results.map(r => `# ${r.title}\n\n**URL:** ${r.url}\n\n${r.markdown || r.content}\n\n---\n\n`).join('\n');
        filename = `docharvester-${domain}-${timestamp}.md`;
        mimeType = 'text/markdown';
        break;
      case 'json':
        content = JSON.stringify({
          harvested_at: new Date().toISOString(),
          source: currentJob.url,
          summary: currentJob.summary,
          results
        }, null, 2);
        filename = `docharvester-${domain}-${timestamp}.json`;
        mimeType = 'application/json';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: 'Downloaded!', description: `${results.length} files downloaded as ${format.toUpperCase()}` });
  };

// FileTable Component
interface FileTableProps {
  results: HarvestResult[];
  onDownload: (result: HarvestResult, format: 'txt' | 'md' | 'json') => void;
}

const FileTable: React.FC<FileTableProps> = ({ results, onDownload }) => {
  if (!results.length) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FileText className="w-12 h-12 mx-auto mb-4 text-[#FFD700]" />
        <p>No files available yet. Start harvesting to see results here.</p>
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
            <TableHead className="text-gray-300">Code</TableHead>
            <TableHead className="text-gray-300">APIs</TableHead>
            <TableHead className="text-gray-300">Actions</TableHead>
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
                {result.metadata.word_count.toLocaleString()}
              </TableCell>
              <TableCell className="text-gray-300">
                <Badge variant="outline" className="text-[#00FFFF] border-[#00FFFF]/30">
                  <Code className="w-3 h-3 mr-1" />
                  {result.code_blocks.length}
                </Badge>
              </TableCell>
              <TableCell className="text-gray-300">
                <Badge variant="outline" className="text-[#FFD700] border-[#FFD700]/30">
                  <Zap className="w-3 h-3 mr-1" />
                  {result.api_endpoints.length}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => onDownload(result, 'txt')}
                    disabled={result.status !== 'success'}
                    className="bg-gradient-to-r from-[#FFD700] to-[#00FFFF] hover:from-[#00FFFF] hover:to-[#FFD700] text-black border-0 text-xs px-2"
                  >
                    TXT
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onDownload(result, 'md')}
                    disabled={result.status !== 'success'}
                    className="bg-gradient-to-r from-[#00FFFF] to-[#FFD700] hover:from-[#FFD700] hover:to-[#00FFFF] text-black border-0 text-xs px-2"
                  >
                    MD
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onDownload(result, 'json')}
                    disabled={result.status !== 'success'}
                    className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white border-0 text-xs px-2"
                  >
                    JSON
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] via-[#1a1a3a] to-[#2a2a4a]">
      <div className="container mx-auto p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFD700] to-[#00FFFF] bg-clip-text text-transparent">
            🌾 DocHarvester Pro
          </h1>
          <p className="text-gray-300">Advanced documentation extraction with Puppeteer - JavaScript rendering, scrolling, clicking & more!</p>
        </div>

        {/* Main Input Card */}
        <Card className="glass-effect border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-[#FFD700]" />
              Advanced Web Harvesting
            </CardTitle>
            <CardDescription className="text-gray-300">
              Powered by headless Chrome with full JavaScript support, auto-scrolling, and smart content extraction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="auto" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5">
                <TabsTrigger value="auto" className="data-[state=active]:bg-[#FFD700] data-[state=active]:text-black">
                  Auto Discovery
                </TabsTrigger>
                <TabsTrigger value="manual" className="data-[state=active]:bg-[#00FFFF] data-[state=active]:text-black">
                  Manual URLs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="auto" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-gray-300">Documentation Website URL</Label>
                  <Input
                    id="url"
                    placeholder="https://docs.stripe.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={currentJob?.status === 'running'}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-urls" className="text-gray-300">Manual URLs (one per line)</Label>
                  <Textarea
                    id="manual-urls"
                    placeholder="https://docs.stripe.com/api&#10;https://docs.stripe.com/payments&#10;https://docs.stripe.com/webhooks"
                    value={manualUrls}
                    onChange={(e) => setManualUrls(e.target.value)}
                    disabled={currentJob?.status === 'running'}
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Advanced Options */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-gray-300">
                  <Settings className="w-4 h-4" />
                  Advanced Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-400">Max Depth</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={advancedOptions.max_depth}
                      onChange={(e) => setAdvancedOptions(prev => ({ ...prev, max_depth: parseInt(e.target.value) || 3 }))}
                      className="bg-white/5 border-white/20 text-white text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-400">Max Pages</Label>
                    <Input
                      type="number"
                      min="1"
                      max="500"
                      value={advancedOptions.max_pages}
                      onChange={(e) => setAdvancedOptions(prev => ({ ...prev, max_pages: parseInt(e.target.value) || 50 }))}
                      className="bg-white/5 border-white/20 text-white text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-js"
                      checked={advancedOptions.use_js}
                      onCheckedChange={(checked) => setAdvancedOptions(prev => ({ ...prev, use_js: !!checked }))}
                    />
                    <Label htmlFor="use-js" className="text-xs text-gray-300">JavaScript Rendering</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="scroll"
                      checked={advancedOptions.scroll_to_bottom}
                      onCheckedChange={(checked) => setAdvancedOptions(prev => ({ ...prev, scroll_to_bottom: !!checked }))}
                    />
                    <Label htmlFor="scroll" className="text-xs text-gray-300">Auto Scroll</Label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="code-blocks"
                      checked={advancedOptions.extract_code_blocks}
                      onCheckedChange={(checked) => setAdvancedOptions(prev => ({ ...prev, extract_code_blocks: !!checked }))}
                    />
                    <Label htmlFor="code-blocks" className="text-xs text-gray-300">Extract Code Blocks</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="api-endpoints"
                      checked={advancedOptions.extract_api_endpoints}
                      onCheckedChange={(checked) => setAdvancedOptions(prev => ({ ...prev, extract_api_endpoints: !!checked }))}
                    />
                    <Label htmlFor="api-endpoints" className="text-xs text-gray-300">Extract API Endpoints</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-400">Wait for Selector (optional)</Label>
                  <Input
                    placeholder=".content, #main, [data-loaded]"
                    value={advancedOptions.wait_for_selector}
                    onChange={(e) => setAdvancedOptions(prev => ({ ...prev, wait_for_selector: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-gray-400">Click Selectors (comma-separated)</Label>
                  <Input
                    placeholder="button.load-more, .expand-all"
                    value={advancedOptions.click_selectors}
                    onChange={(e) => setAdvancedOptions(prev => ({ ...prev, click_selectors: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={startHarvest}
              disabled={(!url.trim() && !manualUrls.trim()) || currentJob?.status === 'running'}
              className="w-full bg-gradient-to-r from-[#FFD700] to-[#00FFFF] hover:from-[#00FFFF] hover:to-[#FFD700] text-black font-semibold border-0"
            >
              {currentJob?.status === 'running' ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                  Harvesting...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Start Advanced Harvest
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results and Status */}
        {currentJob && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Card */}
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Globe className="w-5 h-5 text-[#00FFFF]" />
                  Harvest Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${
                      currentJob.status === 'running' ? 'bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30' :
                      currentJob.status === 'completed' ? 'bg-green-600/20 text-green-400 border-green-500/30' :
                      currentJob.status === 'failed' ? 'bg-red-600/20 text-red-400 border-red-500/30' :
                      'bg-gray-600/20 text-gray-400 border-gray-500/30'
                    }`}
                  >
                    {currentJob.status === 'running' && <Zap className="w-3 h-3 mr-1 animate-spin" />}
                    {currentJob.status === 'completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {currentJob.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                    {currentJob.status.toUpperCase()}
                  </Badge>
                  <span className="text-gray-300 text-sm">{currentJob.url}</span>
                </div>

                {currentJob.summary && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <div className="text-gray-400">Pages Harvested</div>
                      <div className="text-white font-semibold">{currentJob.summary.total_pages}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-400">Success Rate</div>
                      <div className="text-green-400 font-semibold">
                        {Math.round((currentJob.summary.successful / currentJob.summary.total_pages) * 100)}%
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-400">Total Words</div>
                      <div className="text-[#FFD700] font-semibold">{currentJob.summary.total_words.toLocaleString()}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-gray-400">Code Blocks</div>
                      <div className="text-[#00FFFF] font-semibold">{currentJob.summary.total_code_blocks}</div>
                    </div>
                  </div>
                )}

                {currentJob.status === 'completed' && currentJob.results.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => downloadAllResults('txt')}
                      className="bg-gradient-to-r from-[#FFD700] to-[#00FFFF] hover:from-[#00FFFF] hover:to-[#FFD700] text-black border-0"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      All TXT
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => downloadAllResults('md')}
                      className="bg-gradient-to-r from-[#00FFFF] to-[#FFD700] hover:from-[#FFD700] hover:to-[#00FFFF] text-black border-0"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      All MD
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => downloadAllResults('json')}
                      className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-500 hover:to-gray-400 text-white border-0"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      All JSON
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Logs Card */}
            <Card className="glass-effect border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-[#FFD700]" />
                  Live Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64 w-full rounded-md border border-white/10 bg-black/20 p-4">
                  {currentJob.logs.length > 0 ? (
                    <div className="space-y-1">
                      {currentJob.logs.map((log, index) => (
                        <div key={index} className="text-xs text-gray-300 font-mono">
                          {log}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">No logs yet...</div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Table */}
        {currentJob?.results && currentJob.results.length > 0 && (
          <Card className="glass-effect border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="w-5 h-5 text-[#00FFFF]" />
                Harvested Files ({currentJob.results.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FileTable results={currentJob.results} onDownload={downloadFile} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );


