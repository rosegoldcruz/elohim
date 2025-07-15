/**
 * AEON Music Generator Test Component
 * Simple interface for testing music generation functionality
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useMusicGenerator } from '@/hooks/useMusicGenerator';

interface MusicGeneratorTestProps {
  user_id: string;
  project_id?: string;
}

export function MusicGeneratorTest({ user_id, project_id }: MusicGeneratorTestProps) {
  const [prompt, setPrompt] = useState('upbeat electronic music for a tech video');
  const [duration, setDuration] = useState(30);
  const [style, setStyle] = useState<'upbeat' | 'chill' | 'dramatic' | 'ambient' | 'electronic' | 'orchestral' | 'rock' | 'jazz'>('upbeat');
  const [model, setModel] = useState<'musicgen' | 'riffusion' | 'bark' | 'auto'>('auto');

  const {
    isGenerating,
    result,
    error,
    progress,
    costEstimate,
    availableModels,
    generateMusic,
    generatePreset,
    fetchAvailableModels,
    estimateCost,
    reset,
    progressPercentage
  } = useMusicGenerator(user_id);

  useEffect(() => {
    fetchAvailableModels();
  }, [fetchAvailableModels]);

  useEffect(() => {
    if (duration && model) {
      estimateCost(duration, model).then(cost => {
        // Cost is automatically updated in the hook
      });
    }
  }, [duration, model, estimateCost]);

  const handleGenerate = async () => {
    await generateMusic({
      prompt,
      duration,
      style,
      model_preference: model,
      project_id
    });
  };

  const handlePresetGenerate = async (preset: 'background' | 'intro' | 'outro' | 'transition') => {
    await generatePreset(preset, prompt);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        🎵 AEON Music Generator Test
      </h2>

      {/* Generation Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Music Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            rows={3}
            placeholder="Describe the music you want to generate..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              min={5}
              max={30}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Style
            </label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as any)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="upbeat">Upbeat</option>
              <option value="chill">Chill</option>
              <option value="dramatic">Dramatic</option>
              <option value="ambient">Ambient</option>
              <option value="electronic">Electronic</option>
              <option value="orchestral">Orchestral</option>
              <option value="rock">Rock</option>
              <option value="jazz">Jazz</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as any)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="auto">Auto Select</option>
              <option value="musicgen">MusicGen</option>
              <option value="riffusion">Riffusion</option>
              <option value="bark">Bark</option>
            </select>
          </div>
        </div>

        {/* Cost Estimate */}
        {costEstimate > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💰 Estimated cost: ${costEstimate.toFixed(4)} USD
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? `Generating... ${progressPercentage}%` : '🎵 Generate Music'}
        </button>

        <button
          onClick={() => handlePresetGenerate('background')}
          disabled={isGenerating}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          🎼 Background
        </button>

        <button
          onClick={() => handlePresetGenerate('intro')}
          disabled={isGenerating}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
        >
          🎺 Intro
        </button>

        <button
          onClick={() => handlePresetGenerate('outro')}
          disabled={isGenerating}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          🎻 Outro
        </button>

        <button
          onClick={reset}
          disabled={isGenerating}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
        >
          🔄 Reset
        </button>
      </div>

      {/* Progress Bar */}
      {isGenerating && (
        <div className="mb-6">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Generating music... {progressPercentage}%
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-700 dark:text-red-300">❌ Error: {error}</p>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-3">
            ✅ Music Generated Successfully!
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Duration:</strong> {result.duration}s
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Style:</strong> {result.style}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Model:</strong> {result.model_used}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Processing Time:</strong> {(result.processing_time / 1000).toFixed(1)}s
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Format:</strong> {result.metadata.format}
              </p>
            </div>
          </div>

          {/* Audio Player */}
          <audio controls className="w-full mb-3">
            <source src={result.audio_url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>

          <div className="flex gap-2">
            <a
              href={result.audio_url}
              download
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
            >
              📥 Download
            </a>
            <button
              onClick={() => navigator.clipboard.writeText(result.audio_url)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              📋 Copy URL
            </button>
          </div>
        </div>
      )}

      {/* Available Models Info */}
      {availableModels.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Available Models
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableModels.map((model, index) => (
              <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                <h4 className="font-medium text-gray-900 dark:text-white">{model.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{model.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Max: {model.max_duration}s | ${model.price_per_second}/s
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
