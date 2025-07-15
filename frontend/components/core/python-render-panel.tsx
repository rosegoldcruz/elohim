'use client';

import React, { useState, useEffect } from 'react';
import { Scene } from '@/types/video-editor';
import { Play, Download, Settings, Zap, Music, Sparkles, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface PythonRenderPanelProps {
  scenes: Scene[];
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface RenderJob {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  outputUrl?: string;
  error?: string;
  processingTime?: number;
  stats?: {
    duration: number;
    transitions: number;
    beatSync: boolean;
    gpuAcceleration: boolean;
  };
}

export const PythonRenderPanel: React.FC<PythonRenderPanelProps> = ({
  scenes,
  isOpen,
  onClose,
  projectId,
}) => {
  const [voiceoverScript, setVoiceoverScript] = useState('');
  const [renderOptions, setRenderOptions] = useState({
    useGPU: true,
    enableBeatSync: true,
    viralMode: true,
    outputFormat: '1080x1920' as '1080x1920' | '1080x1080' | '1920x1080',
  });
  const [currentJob, setCurrentJob] = useState<RenderJob | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  // Poll job status
  useEffect(() => {
    if (currentJob && currentJob.status === 'processing') {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/python/render?jobId=${currentJob.jobId}`);
          const data = await response.json();
          
          if (data.success) {
            setCurrentJob(prev => prev ? { ...prev, ...data } : null);
            
            if (data.progress === 100 || data.error) {
              setIsRendering(false);
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('Error polling job status:', error);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [currentJob]);

  const startRender = async () => {
    if (!voiceoverScript.trim()) {
      alert('Please enter a voiceover script');
      return;
    }

    if (scenes.length === 0) {
      alert('No scenes available to render');
      return;
    }

    setIsRendering(true);

    try {
      const response = await fetch('/api/python/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: scenes.map(scene => ({
            id: scene.id,
            videoUrl: scene.videoUrl,
            name: scene.name,
            duration: scene.duration,
          })),
          voiceoverScript,
          options: renderOptions,
          projectId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentJob({
          jobId: data.jobId,
          status: 'queued',
          progress: 0,
        });
      } else {
        throw new Error(data.error || 'Failed to start render');
      }
    } catch (error) {
      console.error('Error starting render:', error);
      alert('Failed to start render: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsRendering(false);
    }
  };

  const downloadVideo = () => {
    if (currentJob?.outputUrl) {
      const link = document.createElement('a');
      link.href = currentJob.outputUrl;
      link.download = `aeon_video_${currentJob.jobId}.mp4`;
      link.click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🐍</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Python Pipeline Render</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Scene Summary */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Scenes to Render</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {scenes.map((scene, index) => (
                <div key={scene.id} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={scene.thumbnail}
                      alt={scene.name}
                      className="w-12 h-8 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        Scene {index + 1}: {scene.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {Math.floor(scene.duration / 60)}:{String(Math.floor(scene.duration % 60)).padStart(2, '0')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Voiceover Script */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Voiceover Script</h3>
            <textarea
              value={voiceoverScript}
              onChange={(e) => setVoiceoverScript(e.target.value)}
              placeholder="Enter your voiceover script here. This will be converted to speech and added to your video..."
              className="w-full h-32 bg-gray-700 text-white p-3 rounded-lg resize-none border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-xs text-gray-400 mt-2">
              Estimated speech duration: ~{Math.ceil(voiceoverScript.length / 150)} seconds
            </p>
          </div>

          {/* Render Options */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Render Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={renderOptions.useGPU}
                    onChange={(e) => setRenderOptions(prev => ({ ...prev, useGPU: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="text-white">GPU Acceleration (4x faster)</span>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={renderOptions.enableBeatSync}
                    onChange={(e) => setRenderOptions(prev => ({ ...prev, enableBeatSync: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-purple-500" />
                    <span className="text-white">Beat Synchronization</span>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={renderOptions.viralMode}
                    onChange={(e) => setRenderOptions(prev => ({ ...prev, viralMode: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    <span className="text-white">Viral Effects (hooks, transitions)</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Output Format
                </label>
                <select
                  value={renderOptions.outputFormat}
                  onChange={(e) => setRenderOptions(prev => ({ 
                    ...prev, 
                    outputFormat: e.target.value as '1080x1920' | '1080x1080' | '1920x1080'
                  }))}
                  className="w-full bg-gray-700 text-white p-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="1080x1920">TikTok/Instagram Stories (9:16)</option>
                  <option value="1080x1080">Instagram Post (1:1)</option>
                  <option value="1920x1080">YouTube/Landscape (16:9)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Render Status */}
          {currentJob && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Render Status</h3>
              
              <div className="space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm text-white">{currentJob.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${currentJob.progress}%` }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-3">
                  {currentJob.status === 'processing' && (
                    <>
                      <Clock className="w-5 h-5 text-blue-500 animate-spin" />
                      <span className="text-white">Processing video...</span>
                    </>
                  )}
                  {currentJob.status === 'completed' && (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-white">Render completed!</span>
                    </>
                  )}
                  {currentJob.status === 'failed' && (
                    <>
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="text-white">Render failed</span>
                    </>
                  )}
                </div>

                {/* Stats */}
                {currentJob.stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="bg-gray-700 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">Duration</p>
                      <p className="text-white font-semibold">{currentJob.stats.duration}s</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">Transitions</p>
                      <p className="text-white font-semibold">{currentJob.stats.transitions}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">Beat Sync</p>
                      <p className="text-white font-semibold">{currentJob.stats.beatSync ? 'Yes' : 'No'}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400">GPU</p>
                      <p className="text-white font-semibold">{currentJob.stats.gpuAcceleration ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                )}

                {/* Error */}
                {currentJob.error && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-200 text-sm">{currentJob.error}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {scenes.length} scenes • Estimated render time: {scenes.length * (renderOptions.useGPU ? 10 : 40)}s
            </div>
            <div className="flex items-center gap-3">
              {currentJob?.status === 'completed' && currentJob.outputUrl && (
                <button
                  type="button"
                  onClick={downloadVideo}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Video
                </button>
              )}
              <button
                type="button"
                onClick={startRender}
                disabled={isRendering || !voiceoverScript.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4" />
                {isRendering ? 'Rendering...' : 'Start Render'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
