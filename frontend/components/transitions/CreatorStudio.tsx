'use client';

/**
 * AEON Creator Studio - Live GLSL Editor for Custom Transitions
 * Real-time preview, testing, and publishing workflow for user-created transitions
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Play, Save, Upload, Eye, Code, Settings, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { marketplaceAgent } from '@/lib/agents/MarketplaceAgent';
import { transitionCore } from '@/lib/transitions/core';

interface TransitionPreview {
  isPlaying: boolean;
  progress: number;
  error?: string;
}

interface GLSLError {
  line: number;
  message: string;
  type: 'error' | 'warning';
}

export default function CreatorStudio() {
  // Form state
  const [transitionName, setTransitionName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [price, setPrice] = useState(0);
  const [isPublic, setIsPublic] = useState(true);

  // GLSL Editor state
  const [glslCode, setGlslCode] = useState(DEFAULT_GLSL_TEMPLATE);
  const [glslErrors, setGlslErrors] = useState<GLSLError[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationSuccess, setCompilationSuccess] = useState(false);

  // Preview state
  const [preview, setPreview] = useState<TransitionPreview>({
    isPlaying: false,
    progress: 0
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Publishing state
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<any>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  // Real-time GLSL compilation
  useEffect(() => {
    const compileGLSL = async () => {
      if (!glslCode.trim()) return;

      setIsCompiling(true);
      try {
        const result = await transitionCore.compileShader('preview', glslCode);
        setCompilationSuccess(!!result);
        setGlslErrors([]);
      } catch (error) {
        setCompilationSuccess(false);
        setGlslErrors([{
          line: 1,
          message: error instanceof Error ? error.message : 'Compilation failed',
          type: 'error'
        }]);
      } finally {
        setIsCompiling(false);
      }
    };

    const debounceTimer = setTimeout(compileGLSL, 500);
    return () => clearTimeout(debounceTimer);
  }, [glslCode]);

  // Preview animation loop
  useEffect(() => {
    if (!preview.isPlaying || !canvasRef.current) return;

    const animate = () => {
      setPreview(prev => ({
        ...prev,
        progress: (prev.progress + 0.016) % 1 // 60fps
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [preview.isPlaying]);

  const handlePreview = useCallback(async () => {
    if (!compilationSuccess) {
      alert('Fix GLSL errors before previewing');
      return;
    }

    setIsGeneratingPreview(true);
    try {
      // Generate preview using the transition core
      const previewData = await fetch('/api/transitions/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          glslCode,
          name: transitionName || 'Preview'
        })
      });

      const result = await previewData.json();
      if (result.success) {
        setPreviewUrl(result.previewUrl);
        setPreview({ isPlaying: true, progress: 0 });
      } else {
        setPreview({ isPlaying: false, progress: 0, error: result.error });
      }
    } catch (error) {
      setPreview({
        isPlaying: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Preview failed'
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  }, [glslCode, transitionName, compilationSuccess]);

  const handlePublish = useCallback(async () => {
    if (!transitionName || !glslCode || !category) {
      alert('Please fill in all required fields');
      return;
    }

    if (!compilationSuccess) {
      alert('Fix GLSL errors before publishing');
      return;
    }

    setIsPublishing(true);
    try {
      const result = await marketplaceAgent.publishTransition({
        name: transitionName,
        description,
        glslCode,
        creatorId: 'current-user-id', // Would get from auth
        category,
        tags,
        price,
        royaltyPercentage: 0.15,
        isPublic,
        isApproved: false
      });

      setPublishResult(result);
    } catch (error) {
      setPublishResult({
        success: false,
        error: error instanceof Error ? error.message : 'Publishing failed'
      });
    } finally {
      setIsPublishing(false);
    }
  }, [transitionName, description, glslCode, category, tags, price, isPublic, compilationSuccess]);

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Zap className="text-yellow-400" />
            AEON Creator Studio
          </h1>
          <p className="text-gray-300">Create viral transitions with live GLSL editing and real-time preview</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Editor */}
          <div className="space-y-6">
            {/* Transition Details */}
            <Card className="bg-black/20 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Transition Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Name *</Label>
                  <Input
                    id="name"
                    value={transitionName}
                    onChange={(e) => setTransitionName(e.target.value)}
                    placeholder="Epic Zoom Punch"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A high-energy zoom transition perfect for viral content..."
                    className="bg-gray-800 border-gray-600 text-white"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-gray-300">Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tiktok-essentials">TikTok Essentials</SelectItem>
                        <SelectItem value="glitch">Glitch Effects</SelectItem>
                        <SelectItem value="3d-transforms">3D Transforms</SelectItem>
                        <SelectItem value="cinematic">Cinematic</SelectItem>
                        <SelectItem value="organic">Organic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-gray-300">Price (Credits)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      min={0}
                      max={1000}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-purple-600 text-white cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <Input
                    placeholder="Add tags (press Enter)"
                    className="bg-gray-800 border-gray-600 text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addTag(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                  />
                  <Label htmlFor="public" className="text-gray-300">
                    Make public in marketplace
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* GLSL Editor */}
            <Card className="bg-black/20 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  GLSL Shader Code
                  {isCompiling && <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />}
                  {compilationSuccess && <div className="w-4 h-4 bg-green-400 rounded-full" />}
                  {glslErrors.length > 0 && <AlertCircle className="w-4 h-4 text-red-400" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={glslCode}
                  onChange={(e) => setGlslCode(e.target.value)}
                  className="bg-gray-900 border-gray-600 text-green-400 font-mono text-sm min-h-[400px]"
                  placeholder="Enter your GLSL transition code..."
                />
                
                {glslErrors.length > 0 && (
                  <Alert className="mt-4 border-red-500/20 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300">
                      {glslErrors.map((error, i) => (
                        <div key={i}>Line {error.line}: {error.message}</div>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Preview & Actions */}
          <div className="space-y-6">
            {/* Preview */}
            <Card className="bg-black/20 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  {previewUrl ? (
                    <video
                      src={previewUrl}
                      controls
                      autoPlay
                      loop
                      className="w-full h-full rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Play className="w-12 h-12 mx-auto mb-2" />
                      Click "Generate Preview" to see your transition
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={handlePreview}
                    disabled={!compilationSuccess || isGeneratingPreview}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isGeneratingPreview ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Generate Preview
                      </>
                    )}
                  </Button>

                  {preview.error && (
                    <Alert className="border-red-500/20 bg-red-500/10">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-300">
                        {preview.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Publishing */}
            <Card className="bg-black/20 border-purple-500/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Publish to Marketplace
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Share your transition with the AEON community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handlePublish}
                  disabled={!compilationSuccess || isPublishing || !transitionName || !category}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isPublishing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Publish Transition
                    </>
                  )}
                </Button>

                {publishResult && (
                  <Alert className={`mt-4 ${publishResult.success ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10'}`}>
                    <AlertCircle className={`h-4 w-4 ${publishResult.success ? 'text-green-400' : 'text-red-400'}`} />
                    <AlertDescription className={publishResult.success ? 'text-green-300' : 'text-red-300'}>
                      {publishResult.success ? (
                        <>
                          Transition published successfully! 
                          {publishResult.requiresApproval && ' (Pending approval)'}
                        </>
                      ) : (
                        publishResult.error
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_GLSL_TEMPLATE = `// AEON Transition Template
// Create your viral transition effect here

vec4 transition(sampler2D tex1, sampler2D tex2, vec2 uv, float progress) {
  // Get colors from both textures
  vec4 color1 = texture2D(tex1, uv);
  vec4 color2 = texture2D(tex2, uv);
  
  // Example: Simple crossfade with zoom effect
  vec2 center = vec2(0.5, 0.5);
  float zoom = 1.0 + progress * 0.5;
  vec2 zoomedUV = center + (uv - center) / zoom;
  
  vec4 zoomedColor1 = texture2D(tex1, zoomedUV);
  
  // Mix the colors based on progress
  return mix(zoomedColor1, color2, progress);
}

// Tips:
// - Use 'progress' (0.0 to 1.0) to animate your transition
// - 'uv' is the texture coordinate (0.0 to 1.0)
// - Return vec4(r, g, b, a) for the final color
// - Keep it optimized for real-time rendering`;
