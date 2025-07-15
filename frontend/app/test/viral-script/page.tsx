'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, Zap, Target, Clock, Eye } from 'lucide-react';

interface ViralScriptResult {
  success: boolean;
  script: {
    scenes: Array<{
      scene: string;
      function: string;
      description: string;
      camera: string;
      audio: string;
      overlay: string;
      sceneNumber: number;
    }>;
    metadata: {
      topic: string;
      style: string;
      duration: number;
      sceneCount: number;
      viralTechniques: string[];
      generatedAt: string;
    };
  };
  plan: {
    scenes: Array<{
      timestamp: number;
      duration: number;
      emotion: string;
      shotType: string;
      transition: string;
      pacing: string;
      energy: number;
    }>;
    metadata: {
      totalDuration: number;
      viralMoments: number[];
      emotionalArc: string[];
      pacingPattern: string[];
    };
  };
  summary: {
    topic: string;
    style: string;
    duration: number;
    sceneCount: number;
    viralTechniques: string[];
    viralMoments: number[];
    emotionalArc: string[];
    pacingPattern: string[];
  };
}

export default function ViralScriptTestPage() {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('TikTok/Documentary');
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ViralScriptResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/script/viral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          style,
          duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exampleTopics = [
    "Why everyone is obsessed with AI",
    "The secret psychology behind viral videos",
    "How to make $1000 in 24 hours",
    "Things nobody tells you about success",
    "The truth about social media algorithms"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            🎬 AEON Viral Script Generator
          </h1>
          <p className="text-xl text-purple-200">
            Generate TikTok-optimized viral video scripts with AI-powered techniques
          </p>
        </div>

        {/* Input Form */}
        <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Script Generator
            </CardTitle>
            <CardDescription className="text-purple-200">
              Enter your topic and generate a viral-optimized video script
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="topic" className="text-white">Video Topic</Label>
                <Input
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your video topic..."
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-300"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {exampleTopics.map((example, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-purple-500/20 text-purple-200 border-purple-500/30"
                      onClick={() => setTopic(example)}
                    >
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="style" className="text-white">Style</Label>
                  <Input
                    id="style"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="bg-white/10 border-purple-500/30 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-white">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                    min="15"
                    max="180"
                    className="bg-white/10 border-purple-500/30 text-white"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Viral Script...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Generate Viral Script
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

        {/* Results */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Script Overview */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  Script Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-purple-200 text-sm">Duration</p>
                    <p className="text-white font-semibold flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {result.summary.duration}s
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-purple-200 text-sm">Scenes</p>
                    <p className="text-white font-semibold">{result.summary.sceneCount}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-purple-200 text-sm">Viral Techniques</p>
                  <div className="flex flex-wrap gap-2">
                    {result.summary.viralTechniques.map((technique, index) => (
                      <Badge key={index} className="bg-yellow-500/20 text-yellow-200 border-yellow-500/30">
                        {technique}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-purple-200 text-sm">Viral Moments (High Energy Scenes)</p>
                  <div className="flex flex-wrap gap-2">
                    {result.summary.viralMoments.map((moment, index) => (
                      <Badge key={index} className="bg-red-500/20 text-red-200 border-red-500/30">
                        Scene {moment + 1}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Scene Breakdown */}
            <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-400" />
                  Scene Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {result.script.scenes.map((scene, index) => {
                    const planScene = result.plan.scenes[index];
                    return (
                      <div key={index} className="p-3 bg-white/5 rounded-lg border border-purple-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-purple-500/20 text-purple-200">
                            Scene {scene.sceneNumber}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-200">
                              {planScene?.emotion}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-green-500/30 text-green-200">
                              Energy: {planScene?.energy}/10
                            </Badge>
                          </div>
                        </div>
                        <p className="text-white text-sm font-medium mb-1">{scene.function}</p>
                        <p className="text-purple-200 text-sm mb-2">{scene.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <p className="text-purple-300">📹 {scene.camera}</p>
                          <p className="text-purple-300">🎵 {scene.audio}</p>
                        </div>
                        {scene.overlay && (
                          <p className="text-yellow-200 text-xs mt-1">💬 {scene.overlay}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
