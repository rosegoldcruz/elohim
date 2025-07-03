'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Play, Zap, CheckCircle, XCircle, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ParallelTestResult {
  success: boolean;
  summary: {
    totalScenes: number;
    successfulScenes: number;
    failedScenes: number;
    totalProcessingTime: number;
    actualCost: number;
    estimatedCost: number;
    averageTimePerScene: number;
  };
  sceneResults: Array<{
    sceneIndex: number;
    prompt: string;
    success: boolean;
    videoUrl: string | null;
    agentId: number;
    modelUsed: string;
    processingTime: number;
    error?: string;
  }>;
  agentResults: Array<{
    agentId: number;
    modelName: string;
    success: boolean;
    scenesProcessed: number;
    totalProcessingTime: number;
    cost: number;
    error?: string;
  }>;
  videoUrls: string[];
  readyForStitcher: boolean;
  error?: string;
}

export default function ParallelVideoTestPage() {
  const [scenePrompts, setScenePrompts] = useState<string[]>([
    "A cinematic shot of a lone astronaut on Mars",
    "Close-up of alien technology glowing in the dark",
    "Wide shot of a futuristic city at sunset",
    "Macro shot of water droplets on a leaf",
    "Time-lapse of clouds moving over mountains",
    "Slow motion shot of a bird taking flight",
    "Underwater scene with colorful fish",
    "Night scene with stars and aurora",
    "Abstract geometric patterns morphing",
    "Final shot of Earth from space"
  ]);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParallelTestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (scenePrompts.length !== 10) {
      toast.error('Exactly 10 scene prompts are required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🚀 Starting parallel video generation test...');
      
      const response = await fetch('/api/video/parallel-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenePrompts: scenePrompts.filter(p => p.trim().length > 0),
          customInputs: scenePrompts.map((_, index) => ({
            aspect_ratio: '16:9',
            duration: 5 + (index % 2) // Vary duration between 5-6 seconds
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Parallel generation test failed');
      }

      setResult(data);
      
      if (data.success) {
        toast.success(`Parallel generation completed! ${data.summary.successfulScenes}/${data.summary.totalScenes} scenes successful`);
      } else {
        toast.error(`Parallel generation failed: ${data.error}`);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePrompt = (index: number, value: string) => {
    const newPrompts = [...scenePrompts];
    newPrompts[index] = value;
    setScenePrompts(newPrompts);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            🚀 Parallel Video Generation Test
          </h1>
          <p className="text-xl text-purple-200">
            Test 5 agents generating 10 video scenes in parallel (2 scenes per agent)
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel: Scene Prompts */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                Scene Prompts (10 Required)
              </CardTitle>
              <CardDescription className="text-purple-200">
                Each prompt will be processed by a different AI model in parallel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {scenePrompts.map((prompt, index) => (
                <div key={index} className="space-y-1">
                  <label className="text-sm text-purple-300">Scene {index + 1}</label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => updatePrompt(index, e.target.value)}
                    placeholder={`Scene ${index + 1} prompt...`}
                    className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-400 min-h-[60px]"
                  />
                </div>
              ))}
              
              <Button
                onClick={handleTest}
                disabled={loading || scenePrompts.filter(p => p.trim()).length !== 10}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Parallel Generation...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Parallel Test
                  </>
                )}
              </Button>

              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-200">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Panel: Results */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="text-center py-8">
                  <p className="text-purple-300">Run the test to see results</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-purple-200 text-sm">Success Rate</p>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={(result.summary.successfulScenes / result.summary.totalScenes) * 100} 
                          className="flex-1"
                        />
                        <span className="text-white text-sm">
                          {result.summary.successfulScenes}/{result.summary.totalScenes}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-purple-200 text-sm">Processing Time</p>
                      <p className="text-white font-semibold">
                        {formatTime(result.summary.totalProcessingTime)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-purple-200 text-sm">Cost</p>
                      <p className="text-white font-semibold">
                        ${result.summary.actualCost.toFixed(2)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-purple-200 text-sm">Avg Time/Scene</p>
                      <p className="text-white font-semibold">
                        {formatTime(result.summary.averageTimePerScene)}
                      </p>
                    </div>
                  </div>

                  {/* Agent Results */}
                  <div className="space-y-2">
                    <p className="text-purple-200 text-sm">Agent Performance</p>
                    <div className="space-y-2">
                      {result.agentResults.map((agent) => (
                        <div key={agent.agentId} className="flex items-center justify-between p-2 bg-white/5 rounded">
                          <div className="flex items-center gap-2">
                            <Badge className={agent.success ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}>
                              Agent {agent.agentId}
                            </Badge>
                            <span className="text-purple-300 text-sm">{agent.modelName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-purple-200">{agent.scenesProcessed} scenes</span>
                            <span className="text-purple-200">${agent.cost.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scene Results */}
                  <div className="space-y-2">
                    <p className="text-purple-200 text-sm">Scene Results</p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {result.sceneResults.map((scene) => (
                        <div key={scene.sceneIndex} className="p-2 bg-white/5 rounded">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-sm">Scene {scene.sceneIndex + 1}</span>
                            <div className="flex items-center gap-2">
                              {scene.success ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                              <Badge variant="outline" className="text-xs">
                                Agent {scene.agentId}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-purple-300 text-xs mb-1">{scene.prompt}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-purple-400">{scene.modelUsed}</span>
                            {scene.success && scene.videoUrl && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(scene.videoUrl!, '_blank')}
                                  className="h-6 px-2 text-xs border-purple-500/30"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                          {scene.error && (
                            <p className="text-red-300 text-xs mt-1">{scene.error}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ready for Stitcher */}
                  {result.readyForStitcher && (
                    <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <p className="text-green-200 text-sm">
                        ✅ Ready for StitcherAgent! {result.videoUrls.length} videos available for stitching.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
