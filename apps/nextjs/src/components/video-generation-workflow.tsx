"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aeon/ui/card";
import { Button } from "@aeon/ui/button";
import { Input } from "@aeon/ui/input";
import { Label } from "@aeon/ui/label";
import { Textarea } from "@aeon/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@aeon/ui/select";
import { Badge } from "@aeon/ui/badge";
import { Progress } from "@aeon/ui/progress";
import * as Icons from "@aeon/ui/icons";
import { cn } from "@aeon/ui";
import { ModelStatusBadge } from "./model-status-banner";

interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  icon: any;
  estimatedTime: string;
}

export function VideoGenerationWorkflow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    description: '',
    tone: 'professional',
    duration: '60',
    style: 'realistic',
    resolution: '1080p',
    targetAudience: ''
  });

  const workflowSteps: WorkflowStep[] = [
    {
      id: 'script',
      name: 'Script Generation',
      agent: 'ScriptWriter Agent',
      status: 'pending',
      progress: 0,
      icon: Icons.FileText,
      estimatedTime: '30s'
    },
    {
      id: 'visuals',
      name: 'Visual Generation',
      agent: 'VisualGenerator Agent',
      status: 'pending',
      progress: 0,
      icon: Icons.Image,
      estimatedTime: '2-3 min'
    },
    {
      id: 'editing',
      name: 'Video Editing',
      agent: 'Editor Agent',
      status: 'pending',
      progress: 0,
      icon: Icons.Video,
      estimatedTime: '1-2 min'
    },
    {
      id: 'optimization',
      name: 'Business Optimization',
      agent: 'Business Agent',
      status: 'pending',
      progress: 0,
      icon: Icons.TrendingUp,
      estimatedTime: '15s'
    }
  ];

  const [steps, setSteps] = useState(workflowSteps);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startGeneration = async () => {
    setIsGenerating(true);
    
    // Simulate workflow execution
    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(i);
      
      // Update step to processing
      setSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'processing' as const }
          : step
      ));

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setSteps(prev => prev.map((step, index) => 
          index === i 
            ? { ...step, progress }
            : step
        ));
      }

      // Mark as completed
      setSteps(prev => prev.map((step, index) => 
        index === i 
          ? { ...step, status: 'completed' as const, progress: 100 }
          : step
      ));
    }

    setIsGenerating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'border-aeon-violet bg-aeon-violet/10';
      case 'completed': return 'border-aeon-gold bg-aeon-gold/10';
      case 'error': return 'border-red-500 bg-red-500/10';
      default: return 'border-gray-600 bg-gray-800/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <Icons.Loader2 className="h-4 w-4 animate-spin text-aeon-violet" />;
      case 'completed': return <Icons.Check className="h-4 w-4 text-aeon-gold" />;
      case 'error': return <Icons.X className="h-4 w-4 text-red-500" />;
      default: return <Icons.Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-aeon-gold to-aeon-violet bg-clip-text text-transparent">
            AI Video Generation
          </h1>
          <ModelStatusBadge />
        </div>
        <p className="text-gray-400 text-lg">
          Create professional videos with our modular AI agent system
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Icons.Settings className="h-5 w-5 mr-2 text-aeon-gold" />
              Video Configuration
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure your video generation parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-white">Video Topic</Label>
              <Input
                id="topic"
                placeholder="Enter your video topic..."
                value={formData.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what you want your video to cover..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Tone</Label>
                <Select value={formData.tone} onValueChange={(value) => handleInputChange('tone', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="entertaining">Entertaining</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Duration</Label>
                <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="120">2 minutes</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Visual Style</Label>
                <Select value={formData.style} onValueChange={(value) => handleInputChange('style', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="animated">Animated</SelectItem>
                    <SelectItem value="abstract">Abstract</SelectItem>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Resolution</Label>
                <Select value={formData.resolution} onValueChange={(value) => handleInputChange('resolution', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">720p HD</SelectItem>
                    <SelectItem value="1080p">1080p Full HD</SelectItem>
                    <SelectItem value="4k">4K Ultra HD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="audience" className="text-white">Target Audience</Label>
              <Input
                id="audience"
                placeholder="e.g., Business professionals, Students, General audience..."
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <Button
              onClick={startGeneration}
              disabled={isGenerating || !formData.topic}
              className="w-full bg-gradient-to-r from-aeon-gold to-aeon-violet text-black hover:opacity-90 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Icons.Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Icons.Play className="h-4 w-4 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Workflow Progress */}
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Icons.Workflow className="h-5 w-5 mr-2 text-aeon-violet" />
              Generation Workflow
            </CardTitle>
            <CardDescription className="text-gray-400">
              AI agents working on your video
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "p-4 rounded-lg border transition-all duration-300",
                  getStatusColor(step.status),
                  currentStep === index && isGenerating ? 'ring-2 ring-aeon-violet/50' : ''
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      step.status === 'completed' ? 'bg-aeon-gold' : 
                      step.status === 'processing' ? 'bg-aeon-violet' : 'bg-gray-700'
                    )}>
                      <step.icon className="h-4 w-4 text-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{step.name}</h3>
                      <p className="text-sm text-gray-400">{step.agent}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {step.estimatedTime}
                    </Badge>
                    {getStatusIcon(step.status)}
                  </div>
                </div>
                
                {step.status === 'processing' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Progress</span>
                      <span>{step.progress}%</span>
                    </div>
                    <Progress value={step.progress} className="h-2" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
