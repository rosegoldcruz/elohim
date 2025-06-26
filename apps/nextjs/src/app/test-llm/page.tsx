"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@aeon/ui/card";
import { Button } from "@aeon/ui/button";
import { Badge } from "@aeon/ui/badge";
import { Input } from "@aeon/ui/input";
import { Label } from "@aeon/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aeon/ui/select";
import * as Icons from "@aeon/ui/icons";
import { ModelStatusPanel } from "~/components/model-status-banner";

export default function TestLLMPage() {
  const [selectedModel, setSelectedModel] = useState<string>('local');
  const [prompt, setPrompt] = useState<string>('Introduction to Artificial Intelligence');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const models = [
    { value: 'local', label: 'Local Model' },
    { value: 'openai', label: 'OpenAI' },
    { value: 'claude', label: 'Claude' },
    { value: 'replicate', label: 'Replicate' }
  ];

  const handleTest = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/test-llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          prompt: prompt
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Unknown error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const runFullTests = async () => {
    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/test-llm');
      const data = await response.json();

      if (data.success) {
        setResult({
          ...data,
          logs: data.logs
        });
      } else {
        setError(data.error || 'Test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-aeon-gold to-aeon-violet bg-clip-text text-transparent">
            AEON LLM Integration Test
          </h1>
          <p className="text-gray-400">
            Test Docker Model Runner and LLM switching functionality
          </p>
        </div>

        {/* Model Status */}
        <ModelStatusPanel className="justify-center" />

        {/* Test Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Single Model Test</CardTitle>
              <CardDescription className="text-gray-400">
                Test a specific model with a custom prompt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model-select" className="text-white">Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {models.map((model) => (
                      <SelectItem key={model.value} value={model.value} className="text-white">
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-white">Prompt</Label>
                <Input
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your test prompt..."
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <Button
                onClick={handleTest}
                disabled={isLoading || !prompt.trim()}
                className="w-full bg-aeon-gold text-black hover:bg-aeon-gold/90"
              >
                {isLoading ? (
                  <>
                    <Icons.Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Icons.Play className="h-4 w-4 mr-2" />
                    Test Model
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Full Integration Test</CardTitle>
              <CardDescription className="text-gray-400">
                Run comprehensive tests for all components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-gray-300 text-sm space-y-2">
                <p>This will test:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Local LLM connectivity</li>
                  <li>Model Manager functionality</li>
                  <li>ScriptWriterAgent with all models</li>
                  <li>Model switching capabilities</li>
                </ul>
              </div>

              <Button
                onClick={runFullTests}
                disabled={isLoading}
                className="w-full bg-aeon-violet text-white hover:bg-aeon-violet/90"
              >
                {isLoading ? (
                  <>
                    <Icons.Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Icons.TestTube className="h-4 w-4 mr-2" />
                    Run Full Tests
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {error && (
          <Card className="bg-red-900/20 border-red-800">
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center">
                <Icons.AlertCircle className="h-5 w-5 mr-2" />
                Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-300">{error}</p>
            </CardContent>
          </Card>
        )}

        {result && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Icons.CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.result && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="border-aeon-gold text-aeon-gold">
                      Model: {result.model}
                    </Badge>
                    <Badge variant="outline" className="border-green-400 text-green-400">
                      Success
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Scenes</p>
                      <p className="text-white font-semibold">{result.result.scenes}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Duration</p>
                      <p className="text-white font-semibold">{result.result.duration}s</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Words</p>
                      <p className="text-white font-semibold">{result.result.wordCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Length</p>
                      <p className="text-white font-semibold">{result.result.script.length} chars</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Generated Script:</Label>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 min-h-[200px] max-h-[300px] overflow-y-auto">
                      <pre className="text-white text-sm whitespace-pre-wrap">
                        {result.result.script}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {result.logs && (
                <div className="space-y-2">
                  <Label className="text-white">Test Logs:</Label>
                  <div className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-gray-300 text-xs whitespace-pre-wrap">
                      {result.logs.join('\n')}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
