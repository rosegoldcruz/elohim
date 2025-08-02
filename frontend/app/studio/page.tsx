/**
 * AEON Studio - Main Studio Page
 * Complete CapCut-like video editing experience with AI generation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AEONViralStudio } from '@/components/studio/AEONViralStudio';
import { useStudioGeneration } from '@/hooks/useStudioGeneration';
import {
  Plus, Play, Folder, Trash2, Calendar, Clock,
  TrendingUp, Zap, Sparkles, Video, Music, FileText,
  ArrowRight, Download, Share2
} from 'lucide-react';

interface StudioPageProps {}

export default function StudioPage({}: StudioPageProps) {
  const [user, setUser] = useState<any>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [newProjectPrompt, setNewProjectPrompt] = useState('');
  const [newProjectStyle, setNewProjectStyle] = useState<'viral' | 'cinematic' | 'educational' | 'entertainment' | 'commercial'>('viral');
  const [newProjectPlatform, setNewProjectPlatform] = useState<'tiktok' | 'reels' | 'shorts' | 'youtube'>('tiktok');

  const router = useRouter();
  const supabase = createClient();

  // Get user and studio generation hook
  const {
    isGenerating,
    progress,
    currentStep,
    result,
    error,
    projects,
    loadingProjects,
    generateProject,
    generatePreset,
    fetchProjects,
    deleteProject,
    reset,
    progressPercentage
  } = useStudioGeneration(user?.id);
  // Get current user - run only once on mount
  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!mounted) return;

      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
    };

    getUser();

    return () => {
      mounted = false;
    };
  }, []); // Remove dependencies to prevent loops

  // Fetch projects when user is available
  useEffect(() => {
    if (user?.id) {
      fetchProjects();
    }
  }, [user?.id]); // Remove fetchProjects from dependencies to prevent loops

  // Handle new project creation
  const handleCreateProject = async () => {
    if (!newProjectPrompt.trim()) return;

    const result = await generateProject({
      creative_prompt: newProjectPrompt,
      style: newProjectStyle,
      platform: newProjectPlatform,
      duration: newProjectPlatform === 'tiktok' ? 30 : 60
    });

    if (result) {
      setShowNewProjectModal(false);
      setNewProjectPrompt('');
      // Optionally navigate to editor
      // router.push(result.editor_url);
    }
  };

  // Handle preset generation
  const handlePresetGeneration = async (preset: 'viral-tiktok' | 'educational' | 'commercial' | 'cinematic') => {
    const prompts = {
      'viral-tiktok': 'Create a viral TikTok video that will get millions of views',
      'educational': 'Explain a complex topic in simple terms',
      'commercial': 'Promote a product or service effectively',
      'cinematic': 'Tell a compelling story with cinematic visuals'
    };

    await generatePreset(preset, prompts[preset]);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // If a project is selected, show the editor
  if (selectedProject) {
    return (
      <AEONViralStudio
        user_id={user.id}
        project={selectedProject}
        onSave={(project) => {
          console.log('Saving project:', project);
          // Handle project save
        }}
        onExport={(project) => {
          console.log('Exporting project:', project);
          // Handle project export
        }}
      />
    );
  }
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              AEON Studio
            </h1>
            <p className="text-gray-400 mt-1">Create viral videos with AI-powered editing</p>
          </div>

          <button
            onClick={() => setShowNewProjectModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handlePresetGeneration('viral-tiktok')}
              className="p-6 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-700 transition-colors group"
              disabled={isGenerating}
            >
              <TrendingUp className="w-8 h-8 text-pink-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-2">Viral TikTok</h3>
              <p className="text-sm text-gray-400">Create trending content that goes viral</p>
            </button>

            <button
              onClick={() => handlePresetGeneration('educational')}
              className="p-6 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-700 transition-colors group"
              disabled={isGenerating}
            >
              <Sparkles className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-2">Educational</h3>
              <p className="text-sm text-gray-400">Explain complex topics simply</p>
            </button>

            <button
              onClick={() => handlePresetGeneration('commercial')}
              className="p-6 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-700 transition-colors group"
              disabled={isGenerating}
            >
              <Zap className="w-8 h-8 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-2">Commercial</h3>
              <p className="text-sm text-gray-400">Promote products effectively</p>
            </button>

            <button
              onClick={() => handlePresetGeneration('cinematic')}
              className="p-6 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-700 transition-colors group"
              disabled={isGenerating}
            >
              <Video className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold mb-2">Cinematic</h3>
              <p className="text-sm text-gray-400">Tell compelling stories</p>
            </button>
          </div>
        </div>

        {/* Generation Progress */}
        {isGenerating && (
          <div className="mb-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generating Your Project</h3>
              <span className="text-sm text-gray-400">{progressPercentage}%</span>
            </div>

            <div className="bg-gray-800 rounded-full h-2 mb-3">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <p className="text-sm text-gray-400">{currentStep}</p>
          </div>
        )}

        {/* Generation Result */}
        {result && (
          <div className="mb-8 p-6 bg-green-900/20 border border-green-700 rounded-lg">
            <h3 className="text-lg font-semibold text-green-400 mb-4">✅ Project Generated Successfully!</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {result.assets.script && (
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="font-medium">Script</p>
                    <p className="text-xs text-gray-400">Generated in {(result.assets.script.processing_time / 1000).toFixed(1)}s</p>
                  </div>
                </div>
              )}

              {result.assets.video && (
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                  <Video className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-medium">Video</p>
                    <p className="text-xs text-gray-400">Generated with {result.assets.video.model_used}</p>
                  </div>
                </div>
              )}

              {result.assets.music && (
                <div className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                  <Music className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="font-medium">Music</p>
                    <p className="text-xs text-gray-400">{result.assets.music.style} style</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push(result.editor_url)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded flex items-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4" />
                Open in Editor
              </button>

              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Create Another
              </button>
            </div>
          </div>
        )}
        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-700 rounded-lg">
            <p className="text-red-400">❌ {error}</p>
            <button
              onClick={reset}
              className="mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Projects</h2>
            {projects.length > 0 && (
              <button className="text-sm text-gray-400 hover:text-white transition-colors">
                View All
              </button>
            )}
          </div>

          {loadingProjects ? (
            <div className="text-center py-8 text-gray-400">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No projects yet. Create your first viral video!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.slice(0, 6).map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors group cursor-pointer"
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="aspect-video bg-gray-800 flex items-center justify-center">
                    {project.video_url ? (
                      <video
                        src={project.video_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : (
                      <Video className="w-12 h-12 text-gray-600" />
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold mb-2 truncate">{project.name}</h3>
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">{project.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(project.created_at).toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {project.duration}s
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        project.status === 'completed' ? 'bg-green-900 text-green-400' :
                        project.status === 'generating' ? 'bg-blue-900 text-blue-400' :
                        'bg-red-900 text-red-400'
                      }`}>
                        {project.status}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                          className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold mb-4">Create New Project</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Creative Prompt</label>
                <textarea
                  value={newProjectPrompt}
                  onChange={(e) => setNewProjectPrompt(e.target.value)}
                  placeholder="Describe the video you want to create..."
                  className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg resize-none h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Style</label>
                  <select
                    value={newProjectStyle}
                    onChange={(e) => setNewProjectStyle(e.target.value as any)}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                  >
                    <option value="viral">Viral</option>
                    <option value="cinematic">Cinematic</option>
                    <option value="educational">Educational</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Platform</label>
                  <select
                    value={newProjectPlatform}
                    onChange={(e) => setNewProjectPlatform(e.target.value as any)}
                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
                  >
                    <option value="tiktok">TikTok</option>
                    <option value="reels">Instagram Reels</option>
                    <option value="shorts">YouTube Shorts</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateProject}
                disabled={!newProjectPrompt.trim() || isGenerating}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
              >
                {isGenerating ? 'Generating...' : 'Create Project'}
              </button>

              <button
                onClick={() => setShowNewProjectModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
