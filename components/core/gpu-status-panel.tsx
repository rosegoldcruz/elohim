'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Zap, AlertTriangle, CheckCircle, Info, Settings } from 'lucide-react';

interface GPUStatus {
  supported: boolean;
  gpu?: {
    name: string;
    memory: number;
    driver: string;
  };
  cudaVersion?: string;
  recommendations: {
    encoding: string;
    quality: string;
    concurrent: string;
    memory: string;
    settings?: {
      preset: string;
      crf: number;
      maxConcurrent: number;
      resolution: string;
    };
  };
  encoders?: {
    h264_nvenc: boolean;
    hevc_nvenc: boolean;
    av1_nvenc: boolean;
  };
}

interface GPUStatusPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GPUStatusPanel: React.FC<GPUStatusPanelProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState<GPUStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (isOpen && !status) {
      checkGPUStatus();
    }
  }, [isOpen]);

  const checkGPUStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/system/check-nvenc');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to check GPU status:', error);
    } finally {
      setLoading(false);
    }
  };

  const runPerformanceTest = async () => {
    setTesting(true);
    try {
      const response = await fetch('/api/system/check-nvenc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testDuration: 2 })
      });
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      console.error('Performance test failed:', error);
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-white">GPU Acceleration Status</h2>
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
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-400">Checking GPU capabilities...</p>
            </div>
          ) : status ? (
            <div className="space-y-6">
              {/* GPU Status Overview */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  {status.supported ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  )}
                  <h3 className="text-xl font-semibold text-white">
                    {status.supported ? 'GPU Acceleration Available' : 'GPU Acceleration Unavailable'}
                  </h3>
                </div>

                {status.gpu ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">GPU Model</h4>
                      <p className="text-white font-semibold">{status.gpu.name}</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">VRAM</h4>
                      <p className="text-white font-semibold">{status.gpu.memory} MB</p>
                    </div>
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">Driver</h4>
                      <p className="text-white font-semibold">{status.gpu.driver}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-200">
                      No NVIDIA GPU detected or drivers not installed. CPU encoding will be used.
                    </p>
                  </div>
                )}
              </div>

              {/* Encoder Support */}
              {status.encoders && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Supported Encoders</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(status.encoders).map(([encoder, supported]) => (
                      <div key={encoder} className="flex items-center gap-3">
                        {supported ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-gray-500" />
                        )}
                        <span className={`font-medium ${supported ? 'text-white' : 'text-gray-500'}`}>
                          {encoder.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Recommendations */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Recommendations</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white">Encoding</h4>
                      <p className="text-gray-400 text-sm">{status.recommendations.encoding}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white">Quality Settings</h4>
                      <p className="text-gray-400 text-sm">{status.recommendations.quality}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Cpu className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white">Concurrent Jobs</h4>
                      <p className="text-gray-400 text-sm">{status.recommendations.concurrent}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white">Memory</h4>
                      <p className="text-gray-400 text-sm">{status.recommendations.memory}</p>
                    </div>
                  </div>
                </div>

                {/* Optimal Settings */}
                {status.recommendations.settings && (
                  <div className="mt-6 bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-3">Optimal Settings</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Preset:</span>
                        <span className="text-white ml-2">{status.recommendations.settings.preset}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">CRF:</span>
                        <span className="text-white ml-2">{status.recommendations.settings.crf}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Max Jobs:</span>
                        <span className="text-white ml-2">{status.recommendations.settings.maxConcurrent}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Resolution:</span>
                        <span className="text-white ml-2">{status.recommendations.settings.resolution}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Performance Test */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Performance Test</h3>
                  <button
                    type="button"
                    onClick={runPerformanceTest}
                    disabled={testing || !status.supported}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {testing ? 'Testing...' : 'Run Test'}
                  </button>
                </div>

                {testResult && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-700 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-400">Processing Time</h4>
                        <p className="text-white font-semibold">{testResult.processingTime}ms</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-400">FPS</h4>
                        <p className="text-white font-semibold">{testResult.fps || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <h4 className="text-sm font-medium text-gray-400">Speed</h4>
                        <p className="text-white font-semibold">{testResult.speed ? `${testResult.speed}x` : 'N/A'}</p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${testResult.success ? 'bg-green-900/20 border border-green-500/30' : 'bg-red-900/20 border border-red-500/30'}`}>
                      <p className={testResult.success ? 'text-green-200' : 'text-red-200'}>
                        {testResult.recommendation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-400">Failed to check GPU status</p>
              <button
                type="button"
                onClick={checkGPUStatus}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
