'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Edit, 
  Settings, 
  Download, 
  Play, 
  Square, 
  CheckSquare, 
  X,
  FileText,
  Database,
  Code,
  FileSpreadsheet,
  Target
} from 'lucide-react';

type TabType = 'discover' | 'manual' | 'process';

interface SiteExample {
  name: string;
  url: string;
  description: string;
  emoji: string;
}

interface DiscoveredUrl {
  url: string;
  selected: boolean;
}

interface ProcessingResult {
  url: string;
  status: 'success' | 'error';
  title?: string;
  content?: string;
  error?: string;
  size?: number;
}

export default function DocHarvesterPage() {
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [isRunning, setIsRunning] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  
  // Discovery state
  const [baseUrl, setBaseUrl] = useState('');
  const [maxDepth, setMaxDepth] = useState(2);
  const [useJS, setUseJS] = useState(false);
  const [discoveredUrls, setDiscoveredUrls] = useState<DiscoveredUrl[]>([]);
  const [showDiscovered, setShowDiscovered] = useState(false);
  
  // Manual state
  const [urlList, setUrlList] = useState('');
  const [delay, setDelay] = useState(1000);
  const [maxRetries, setMaxRetries] = useState(3);
  const [batchSize, setBatchSize] = useState(5);
  
  // Progress state
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [progressStats, setProgressStats] = useState('0/0');
  const [showProgress, setShowProgress] = useState(false);
  
  // Results state
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const siteExamples: SiteExample[] = [
    { name: 'Stripe Docs', url: 'https://docs.stripe.com', description: 'Payment processing documentation', emoji: '🏦' },
    { name: 'Python Docs', url: 'https://docs.python.org', description: 'Python language reference', emoji: '🐍' },
    { name: 'React Docs', url: 'https://react.dev', description: 'React framework documentation', emoji: '⚛️' },
    { name: 'Docker Docs', url: 'https://docs.docker.com', description: 'Container platform docs', emoji: '🐳' },
    { name: 'Next.js Docs', url: 'https://nextjs.org/docs', description: 'React framework documentation', emoji: '⚡' },
    { name: 'Anthropic Docs', url: 'https://docs.anthropic.com', description: 'Claude API documentation', emoji: '🤖' }
  ];

  const handleSiteExampleClick = (url: string) => {
    setBaseUrl(url);
  };

  const handleDiscoverUrls = async () => {
    if (!baseUrl.trim()) {
      alert('Please enter a base URL');
      return;
    }

    setIsRunning(true);
    setProgressText('Discovering documentation URLs...');
    setShowProgress(true);

    try {
      const response = await fetch('/api/harvester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_url: baseUrl,
          max_depth: maxDepth,
          use_js: useJS
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Extract URLs from the harvested results
      const urls = data.results ? data.results.map((result: any) => result.url) : [];
      const urlsWithSelection = urls.map((url: string) => ({ url, selected: true }));
      setDiscoveredUrls(urlsWithSelection);
      setShowDiscovered(true);
      setProgressText(`Discovered ${urls.length} URLs`);
      
    } catch (error) {
      console.error('Discovery failed:', error);
      alert(`Failed to discover URLs: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowProgress(false);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectAll = () => {
    setDiscoveredUrls(urls => urls.map(url => ({ ...url, selected: true })));
  };

  const handleSelectNone = () => {
    setDiscoveredUrls(urls => urls.map(url => ({ ...url, selected: false })));
  };

  const handleUrlToggle = (index: number) => {
    setDiscoveredUrls(urls => 
      urls.map((url, i) => 
        i === index ? { ...url, selected: !url.selected } : url
      )
    );
  };

  const handleFetchSelected = async () => {
    const selectedUrls = discoveredUrls.filter(url => url.selected).map(url => url.url);
    if (selectedUrls.length === 0) {
      alert('Please select at least one URL');
      return;
    }
    await fetchUrls(selectedUrls);
  };

  const handleStartManualFetching = async () => {
    const urls = getCleanUrls();
    if (urls.length === 0) {
      alert('Please enter at least one valid URL');
      return;
    }
    await fetchUrls(urls);
  };

  const getCleanUrls = (): string[] => {
    const text = urlList.trim();
    if (!text) return [];
    
    return text.split('\n')
      .map(url => url.trim())
      .filter(url => url && url.startsWith('http'))
      .filter((url, index, arr) => arr.indexOf(url) === index);
  };

  const fetchUrls = async (urls: string[]) => {
    setIsRunning(true);
    setShouldStop(false);
    setResults([]);
    setShowProgress(true);
    setShowResults(true);
    
    abortControllerRef.current = new AbortController();
    
    try {
      for (let i = 0; i < urls.length; i += batchSize) {
        if (shouldStop) break;
        
        const batch = urls.slice(i, i + batchSize);
        const promises = batch.map(url => fetchSingleDocument(url));
        
        await Promise.allSettled(promises);
        
        const completed = Math.min(i + batchSize, urls.length);
        setProgress((completed / urls.length) * 100);
        setProgressStats(`${completed}/${urls.length}`);
        
        if (i + batchSize < urls.length && !shouldStop) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      setProgressText(`Completed! Fetched ${results.length} documents`);
    } catch (error) {
      console.error('Fetching failed:', error);
      setProgressText('Fetching interrupted');
    } finally {
      setIsRunning(false);
      setShouldStop(false);
      abortControllerRef.current = null;
    }
  };

  const fetchSingleDocument = async (url: string): Promise<void> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      if (shouldStop) return;

      try {
        setProgressText(`Fetching: ${getDisplayUrl(url)} (attempt ${attempt})`);

        const response = await fetch('/api/harvester', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            urls: [url],
            use_js: useJS
          }),
          signal: abortControllerRef.current?.signal
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // Extract the first result from the harvester response
        const harvestResult = data.results && data.results[0];
        if (!harvestResult) {
          throw new Error('No content returned from harvester');
        }

        const result: ProcessingResult = {
          url,
          status: harvestResult.success ? 'success' : 'error',
          content: harvestResult.content || '',
          title: harvestResult.title || '',
          size: harvestResult.content ? harvestResult.content.length : 0
        };

        setResults(prev => [...prev, result]);
        return;
        
      } catch (error) {
        console.error(`Attempt ${attempt} failed for ${url}:`, error);
        
        if (attempt === maxRetries) {
          const result: ProcessingResult = {
            url,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error'
          };
          
          setResults(prev => [...prev, result]);
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
  };

  const getDisplayUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.substring(1) || urlObj.hostname;
    } catch {
      return url;
    }
  };

  const handleStop = () => {
    setShouldStop(true);
    abortControllerRef.current?.abort();
    setProgressText('Stopping...');
  };

  const handleProcessForLLM = async () => {
    if (results.length === 0) {
      alert('No documents to process. Please fetch some documents first.');
      return;
    }

    setProgressText('Processing documents for LLM use...');
    setShowProgress(true);

    try {
      const response = await fetch('/api/harvest/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: results })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setProgressText(`✅ Created ${data.chunks_created} LLM-ready chunks`);
      alert(`Successfully processed! Created ${data.chunks_created} chunks.`);
      
    } catch (error) {
      console.error('Processing failed:', error);
      alert(`Failed to process documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setShowProgress(false);
    }
  };

  const handleExport = async (format: string) => {
    if (results.length === 0) {
      alert('No results to export');
      return;
    }

    try {
      const response = await fetch('/api/harvest/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          documents: results,
          format 
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `docharvester_export.${format === 'training' ? 'jsonl' : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white p-8 rounded-2xl">
            <h1 className="text-4xl font-bold mb-2">🌾 DocHarvester</h1>
            <p className="text-xl opacity-90">Extract and process documentation from ANY website for your LLM agents</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-black/20 p-1 rounded-lg backdrop-blur-xl border border-white/10">
            {[
              { id: 'discover', label: '🔍 Auto Discover', icon: Search },
              { id: 'manual', label: '✏️ Manual URLs', icon: Edit },
              { id: 'process', label: '⚙️ Process & Export', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`
                    flex items-center space-x-2 px-6 py-3 rounded-md font-medium transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Auto Discovery Tab */}
          {activeTab === 'discover' && (
            <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Auto-Discover Documentation</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Automatically discover documentation URLs from a base URL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Base URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="baseUrl" className="text-white">Base Documentation URL:</Label>
                  <Input
                    id="baseUrl"
                    type="url"
                    placeholder="https://docs.stripe.com"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    className="bg-black/20 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                {/* Site Examples */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {siteExamples.map((site, index) => (
                    <div
                      key={index}
                      onClick={() => handleSiteExampleClick(site.url)}
                      className="p-4 bg-black/20 border border-white/10 rounded-lg cursor-pointer hover:bg-black/30 transition-all duration-200"
                    >
                      <h4 className="text-white font-medium flex items-center space-x-2">
                        <span>{site.emoji}</span>
                        <span>{site.name}</span>
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">{site.description}</p>
                    </div>
                  ))}
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="maxDepth" className="text-white">Max Depth:</Label>
                    <Input
                      id="maxDepth"
                      type="number"
                      min="1"
                      max="5"
                      value={maxDepth}
                      onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                      className="w-20 bg-black/20 border-white/20 text-white text-center"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useJS"
                      checked={useJS}
                      onCheckedChange={(checked) => setUseJS(checked as boolean)}
                    />
                    <Label htmlFor="useJS" className="text-white">Enable JavaScript (for modern sites)</Label>
                  </div>

                  <Button
                    onClick={handleDiscoverUrls}
                    disabled={isRunning}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Discover URLs
                  </Button>
                </div>

                {/* Discovered URLs */}
                {showDiscovered && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-medium">📋 Discovered URLs</h3>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={handleSelectAll}>
                          <CheckSquare className="h-4 w-4 mr-1" />
                          Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSelectNone}>
                          <X className="h-4 w-4 mr-1" />
                          Select None
                        </Button>
                        <Button onClick={handleFetchSelected} disabled={isRunning}>
                          <Play className="h-4 w-4 mr-1" />
                          Fetch Selected
                        </Button>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto bg-black/20 border border-white/10 rounded-lg p-4 space-y-2">
                      {discoveredUrls.map((urlItem, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded">
                          <Checkbox
                            checked={urlItem.selected}
                            onCheckedChange={() => handleUrlToggle(index)}
                          />
                          <span className="text-gray-300 text-sm break-all">{urlItem.url}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Manual URLs Tab */}
          {activeTab === 'manual' && (
            <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Edit className="h-5 w-5" />
                  <span>Manual URL Entry</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enter URLs manually for precise control over what gets extracted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* URL List */}
                <div className="space-y-2">
                  <Label htmlFor="urlList" className="text-white">Enter URLs (one per line):</Label>
                  <Textarea
                    id="urlList"
                    placeholder={`https://docs.stripe.com/api
https://docs.stripe.com/payments
https://docs.stripe.com/billing
...`}
                    value={urlList}
                    onChange={(e) => setUrlList(e.target.value)}
                    className="min-h-40 bg-black/20 border-white/20 text-white placeholder:text-gray-400 font-mono"
                  />
                </div>

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="delay" className="text-white">Delay (ms):</Label>
                    <Input
                      id="delay"
                      type="number"
                      min="500"
                      max="5000"
                      value={delay}
                      onChange={(e) => setDelay(parseInt(e.target.value))}
                      className="w-24 bg-black/20 border-white/20 text-white text-center"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label htmlFor="maxRetries" className="text-white">Max retries:</Label>
                    <Input
                      id="maxRetries"
                      type="number"
                      min="1"
                      max="10"
                      value={maxRetries}
                      onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                      className="w-20 bg-black/20 border-white/20 text-white text-center"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label htmlFor="batchSize" className="text-white">Batch size:</Label>
                    <Input
                      id="batchSize"
                      type="number"
                      min="1"
                      max="20"
                      value={batchSize}
                      onChange={(e) => setBatchSize(parseInt(e.target.value))}
                      className="w-20 bg-black/20 border-white/20 text-white text-center"
                    />
                  </div>

                  <Button
                    onClick={handleStartManualFetching}
                    disabled={isRunning}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Fetching
                  </Button>

                  <Button
                    onClick={handleStop}
                    disabled={!isRunning}
                    variant="outline"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Process & Export Tab */}
          {activeTab === 'process' && (
            <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Process & Export</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Convert your fetched documentation into LLM-ready formats with embeddings and search capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Processing Controls */}
                <div className="flex space-x-4">
                  <Button
                    onClick={handleProcessForLLM}
                    disabled={results.length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Process for LLM
                  </Button>

                  <Button
                    onClick={() => alert('Embeddings generation requires the Python script. Please run the generate_embeddings.py script from your output directory.')}
                    variant="outline"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Generate Embeddings
                  </Button>
                </div>

                {/* Export Section */}
                <div className="border-t border-white/10 pt-6">
                  <h3 className="text-white font-medium mb-4 flex items-center space-x-2">
                    <Download className="h-5 w-5" />
                    <span>Export Results</span>
                  </h3>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                      { format: 'json', label: 'JSON', icon: FileText, description: 'Structured data' },
                      { format: 'markdown', label: 'Markdown', icon: FileText, description: 'Human readable' },
                      { format: 'text', label: 'Text', icon: FileText, description: 'Plain text' },
                      { format: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Spreadsheet' },
                      { format: 'training', label: 'Training', icon: Target, description: 'LLM training' }
                    ].map((exportOption) => {
                      const Icon = exportOption.icon;
                      return (
                        <Button
                          key={exportOption.format}
                          onClick={() => handleExport(exportOption.format)}
                          disabled={results.length === 0}
                          variant="outline"
                          className="h-auto p-4 flex flex-col items-center space-y-2 border-white/20 hover:bg-white/5"
                        >
                          <Icon className="h-6 w-6" />
                          <div className="text-center">
                            <div className="font-medium">{exportOption.label}</div>
                            <div className="text-xs text-gray-400">{exportOption.description}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Progress Section */}
        {showProgress && (
          <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Progress value={progress} className="w-full" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-300">{progressText}</span>
                  <span className="text-gray-400">{progressStats}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {showResults && results.length > 0 && (
          <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white">📊 Processing Results</CardTitle>
              <CardDescription className="text-gray-400">
                {results.length} documents processed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="p-4 bg-black/20 border border-white/10 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-white font-medium text-sm break-all">
                        {getDisplayUrl(result.url)}
                      </div>
                      <Badge
                        variant={result.status === 'success' ? 'default' : 'destructive'}
                        className={result.status === 'success' ? 'bg-green-600' : 'bg-red-600'}
                      >
                        {result.status === 'success' ? 'Success' : 'Error'}
                      </Badge>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {result.status === 'success'
                        ? `📄 ${result.title} (${result.size || 0} characters)`
                        : `❌ ${result.error}`
                      }
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
