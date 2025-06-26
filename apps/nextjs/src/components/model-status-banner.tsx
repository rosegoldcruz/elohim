"use client";

import React, { useState, useEffect } from 'react';
import { Badge } from "@aeon/ui/badge";
import { Button } from "@aeon/ui/button";
import * as Icons from "@aeon/ui/icons";
import { cn } from "@aeon/ui";
import { isLocalLLMAvailable } from "~/lib/integrations/local-llm";

export interface ModelStatusBannerProps {
  className?: string;
  showRefresh?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ModelStatusBanner({ 
  className, 
  showRefresh = false, 
  size = 'md' 
}: ModelStatusBannerProps) {
  const [currentModel, setCurrentModel] = useState<string>('openai');
  const [isLocalAvailable, setIsLocalAvailable] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Load current model from localStorage
  useEffect(() => {
    const savedModel = localStorage.getItem('aeon-llm-mode') || 'openai';
    setCurrentModel(savedModel);
    
    if (savedModel === 'local') {
      checkLocalAvailability();
    }
  }, []);

  // Check local LLM availability
  const checkLocalAvailability = async () => {
    setIsChecking(true);
    try {
      const available = await isLocalLLMAvailable();
      setIsLocalAvailable(available);
    } catch (error) {
      console.error('Error checking local LLM:', error);
      setIsLocalAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  // Get model display info
  const getModelInfo = (model: string) => {
    switch (model) {
      case 'local':
        return {
          label: 'Local Model',
          icon: <Icons.Server className={cn("h-3 w-3", size === 'lg' && "h-4 w-4")} />,
          color: isLocalAvailable ? 'text-green-400 border-green-400' : 'text-red-400 border-red-400',
          status: isLocalAvailable ? 'Connected' : 'Offline'
        };
      case 'openai':
        return {
          label: 'OpenAI',
          icon: <Icons.Zap className={cn("h-3 w-3", size === 'lg' && "h-4 w-4")} />,
          color: 'text-aeon-gold border-aeon-gold',
          status: 'Active'
        };
      case 'claude':
        return {
          label: 'Claude',
          icon: <Icons.Brain className={cn("h-3 w-3", size === 'lg' && "h-4 w-4")} />,
          color: 'text-aeon-violet border-aeon-violet',
          status: 'Active'
        };
      case 'replicate':
        return {
          label: 'Replicate',
          icon: <Icons.Repeat className={cn("h-3 w-3", size === 'lg' && "h-4 w-4")} />,
          color: 'text-blue-400 border-blue-400',
          status: 'Active'
        };
      default:
        return {
          label: 'Unknown',
          icon: <Icons.Settings className={cn("h-3 w-3", size === 'lg' && "h-4 w-4")} />,
          color: 'text-gray-400 border-gray-400',
          status: 'Unknown'
        };
    }
  };

  const modelInfo = getModelInfo(currentModel);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-sm px-3 py-2';
      default:
        return 'text-xs px-2.5 py-1.5';
    }
  };

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Badge 
        variant="outline" 
        className={cn(
          "flex items-center space-x-1.5",
          modelInfo.color,
          getSizeClasses()
        )}
      >
        {modelInfo.icon}
        <span>Running on: {modelInfo.label}</span>
        {currentModel === 'local' && (
          <span className={cn(
            "text-xs",
            isLocalAvailable ? "text-green-400" : "text-red-400"
          )}>
            ({modelInfo.status})
          </span>
        )}
      </Badge>

      {showRefresh && currentModel === 'local' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={checkLocalAvailability}
          disabled={isChecking}
          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
        >
          {isChecking ? (
            <Icons.Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Icons.RefreshCw className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
}

/**
 * Compact version for use in headers or toolbars
 */
export function ModelStatusBadge({ className }: { className?: string }) {
  return (
    <ModelStatusBanner 
      className={className}
      size="sm"
      showRefresh={false}
    />
  );
}

/**
 * Full version with refresh button for settings or detailed views
 */
export function ModelStatusPanel({ className }: { className?: string }) {
  return (
    <ModelStatusBanner 
      className={className}
      size="lg"
      showRefresh={true}
    />
  );
}
