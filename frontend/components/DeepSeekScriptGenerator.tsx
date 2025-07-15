'use client';

/**
 * DeepSeek Script Generator Component
 * Demonstrates real-time streaming script generation with DeepSeek
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Brain, Video } from 'lucide-react';

interface GenerationResult {
  script?: string;
  scenePlan?: string;
  metadata?: {
    viralTechniques: string[];
    scriptModel: string;
    sceneModel?: string;
    totalDuration: number;
  };
}

export default function DeepSeekScriptGenerator() {
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('engaging');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [includeScenes, setIncludeScenes] = useState(false);

  const generateScript = async (streaming: boolean = false) => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setStreamingContent('');
    setResult(null);

    try {
      const requestBody = {
        topic,
        tone,
        duration: 60,
        platform: 'tiktok',
        streaming,
        includeScenePlan: includeScenes,
        ...(includeScenes && {
          trendPackage: {
            topic,
            hashtags: ['#AI', '#Viral', '#TikTok'],
            viral_elements: ['trending audio', 'split screen'],
            target_audience: 'content creators',
            platform_specific_tips: ['Use vertical format', 'Hook in 3 seconds']
          }
        })
      };

      if (streaming) {
        const response = await fetch('/api/agents/deepseek-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.body) throw new Error('No response body');

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'script_chunk' || data.type === 'scene_chunk') {
                  setStreamingContent(prev => prev + data.content);
                } else if (data.type === 'complete') {
                  setResult(data.result || data.script);
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (e) {
                // Skip invalid JSON lines
              }
            }
          }
        }
      } else {
        const response = await fetch('/api/agents/deepseek-script', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.error);
        
        setResult(data.data);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert(`Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            DeepSeek Script Generator
            <Badge variant="secondary">Powered by DeepSeek + GPT-4o</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Topic</label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., AI revolutionizing video creation"
              disabled={isGenerating}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tone-select" className="block text-sm font-medium mb-2">Tone</label>
              <select
                id="tone-select"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                disabled={isGenerating}
                className="w-full p-2 border rounded-md"
              >
                <option value="engaging">Engaging</option>
                <option value="educational">Educational</option>
                <option value="entertaining">Entertaining</option>
                <option value="conversational">Conversational</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="includeScenes"
                checked={includeScenes}
                onChange={(e) => setIncludeScenes(e.target.checked)}
                disabled={isGenerating}
              />
              <label htmlFor="includeScenes" className="text-sm">
                Include Scene Plan (GPT-4o)
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => generateScript(false)}
              disabled={isGenerating || !topic.trim()}
              className="flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              Generate Script
            </Button>

            <Button
              onClick={() => generateScript(true)}
              disabled={isGenerating || !topic.trim()}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
              Stream Generation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Streaming Output */}
      {isGenerating && streamingContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Live Generation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={streamingContent}
              readOnly
              className="min-h-[200px] font-mono text-sm"
              placeholder="Streaming content will appear here..."
            />
          </CardContent>
        </Card>
      )}

      {/* Final Result */}
      {result && (
        <div className="space-y-4">
          {result.script && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-500" />
                  Generated Script
                  {result.metadata && (
                    <Badge variant="outline">
                      {result.metadata.scriptModel || 'deepseek-chat'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={typeof result.script === 'string' ? result.script : JSON.stringify(result.script, null, 2)}
                  readOnly
                  className="min-h-[300px]"
                />
              </CardContent>
            </Card>
          )}

          {result.scenePlan && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-blue-500" />
                  Scene Plan
                  {result.metadata && (
                    <Badge variant="outline">
                      {result.metadata.sceneModel || 'gpt-4o'}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={result.scenePlan}
                  readOnly
                  className="min-h-[300px]"
                />
              </CardContent>
            </Card>
          )}

          {result.metadata && (
            <Card>
              <CardHeader>
                <CardTitle>Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <strong>Viral Techniques:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.metadata.viralTechniques.map((technique, index) => (
                        <Badge key={index} variant="secondary">
                          {technique}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong>Duration:</strong> {result.metadata.totalDuration}s
                  </div>
                  <div>
                    <strong>Models Used:</strong> {result.metadata.scriptModel}
                    {result.metadata.sceneModel && ` + ${result.metadata.sceneModel}`}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
