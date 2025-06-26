"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aeon/ui/card";
import { Button } from "@aeon/ui/button";
import { Badge } from "@aeon/ui/badge";
import { Label } from "@aeon/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aeon/ui/select";
import * as Icons from "@aeon/ui/icons";
import { cn } from "@aeon/ui";
import { ScriptWriterAgent } from "~/lib/agents/script-writer-agent";
import { isLocalLLMAvailable } from "~/lib/integrations/local-llm";
import { modelManager, type LLMMode } from "~/lib/utils/model-manager";

export interface ModelSourceSettingsProps {
  className?: string;
  onModelChange?: (model: string) => void;
}

export function ModelSourceSettings({ className, onModelChange }: ModelSourceSettingsProps) {
  const [selectedModel, setSelectedModel] = useState<string>('openai');
  const [isLocalAvailable, setIsLocalAvailable] = useState<boolean>(false);
  const [isCheckingLocal, setIsCheckingLocal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const availableModels = ScriptWriterAgent.getAvailableLLMModes();

  // Load saved model preference on mount
  useEffect(() => {
    const savedModel = localStorage.getItem('aeon-llm-mode') || 'openai';
    setSelectedModel(savedModel);
    checkLocalLLMAvailability();
  }, []);

  // Check if local LLM is available
  const checkLocalLLMAvailability = async () => {
    setIsCheckingLocal(true);
    try {
      const available = await isLocalLLMAvailable();
      setIsLocalAvailable(available);
    } catch (error) {
      console.error('Error checking local LLM availability:', error);
      setIsLocalAvailable(false);
    } finally {
      setIsCheckingLocal(false);
    }
  };

  // Handle model selection change
  const handleModelChange = async (value: string) => {
    if (value === 'local' && !isLocalAvailable) {
      // Don't allow selection of local if not available
      return;
    }

    setIsSaving(true);
    try {
      // Use model manager to switch modes
      await modelManager.switchMode(value as LLMMode);
      setSelectedModel(value);

      // Notify parent component
      onModelChange?.(value);

    } catch (error) {
      console.error('Error switching model:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getModelIcon = (modelValue: string) => {
    switch (modelValue) {
      case 'local':
        return <Icons.Server className="h-4 w-4" />;
      case 'openai':
        return <Icons.Zap className="h-4 w-4" />;
      case 'claude':
        return <Icons.Brain className="h-4 w-4" />;
      case 'replicate':
        return <Icons.Repeat className="h-4 w-4" />;
      default:
        return <Icons.Settings className="h-4 w-4" />;
    }
  };

  const getModelStatus = (modelValue: string) => {
    if (modelValue === 'local') {
      return isLocalAvailable ? 'Available' : 'Unavailable';
    }
    return 'Available';
  };

  const getModelStatusColor = (modelValue: string) => {
    if (modelValue === 'local') {
      return isLocalAvailable ? 'text-green-400' : 'text-red-400';
    }
    return 'text-green-400';
  };

  return (
    <Card className={cn("bg-gray-900/50 border-gray-800", className)}>
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Icons.Settings className="h-5 w-5 mr-2 text-aeon-gold" />
          Model Source Configuration
        </CardTitle>
        <CardDescription className="text-gray-400">
          Select the AI model source for script generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Model Display */}
        <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
          <div className="flex items-center space-x-3">
            {getModelIcon(selectedModel)}
            <div>
              <p className="text-white font-medium">
                Current Model: {availableModels.find(m => m.value === selectedModel)?.label}
              </p>
              <p className={cn("text-sm", getModelStatusColor(selectedModel))}>
                Status: {getModelStatus(selectedModel)}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "border-aeon-gold text-aeon-gold",
              selectedModel === 'local' && !isLocalAvailable && "border-red-400 text-red-400"
            )}
          >
            {selectedModel === 'local' && !isLocalAvailable ? 'Offline' : 'Active'}
          </Badge>
        </div>

        {/* Model Selection */}
        <div className="space-y-2">
          <Label htmlFor="model-select" className="text-white">
            Select Model Source
          </Label>
          <Select
            value={selectedModel}
            onValueChange={handleModelChange}
            disabled={isSaving}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select a model source" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              {availableModels.map((model) => (
                <SelectItem
                  key={model.value}
                  value={model.value}
                  disabled={model.value === 'local' && !isLocalAvailable}
                  className="text-white hover:bg-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    {getModelIcon(model.value)}
                    <span>{model.label}</span>
                    {model.value === 'local' && !isLocalAvailable && (
                      <Badge variant="outline" className="border-red-400 text-red-400 text-xs">
                        Offline
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Local LLM Status Check */}
        {selectedModel === 'local' && (
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Docker Model Runner</p>
                <p className="text-gray-400 text-xs">
                  {isLocalAvailable 
                    ? 'Connected and ready' 
                    : 'Not available - check Docker container'
                  }
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={checkLocalLLMAvailability}
                disabled={isCheckingLocal}
                className="border-aeon-gold text-aeon-gold hover:bg-aeon-gold hover:text-black"
              >
                {isCheckingLocal ? (
                  <>
                    <Icons.Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Icons.RefreshCw className="h-3 w-3 mr-1" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Model Information */}
        <div className="text-xs text-gray-400 space-y-1">
          <p><strong>Local:</strong> Uses Docker Model Runner on your machine</p>
          <p><strong>OpenAI:</strong> GPT models via OpenAI API</p>
          <p><strong>Claude:</strong> Anthropic's Claude models</p>
          <p><strong>Replicate:</strong> Various open-source models via Replicate</p>
        </div>

        {/* Save Status */}
        {isSaving && (
          <div className="flex items-center space-x-2 text-aeon-gold text-sm">
            <Icons.Loader2 className="h-3 w-3 animate-spin" />
            <span>Saving preferences...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
