"use client";

import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { usePostHogAnalytics } from "@/lib/analytics/posthog";
import { supabaseAnalytics } from "@/lib/analytics/supabase-analytics";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { generateVideo, pollForCompletion, getVideoDimensions, parseDuration, VideoGenerationStatus } from "@/lib/generateVideo";

const VIDEO_MODELS = [
  { value: "kling", label: "Kling Pro" },
  { value: "luma", label: "Luma Dream" },
  { value: "gen3", label: "Runway Gen-3" },
  { value: "pika", label: "Pika Labs" },
  { value: "wan", label: "Wan Video" },
];

const VIDEO_STYLES = [
  { value: "cinematic", label: "Cinematic" },
  { value: "anime", label: "Anime" },
  { value: "realistic", label: "Realistic" },
  { value: "abstract", label: "Abstract" },
];

const DURATIONS = ["5 seconds", "10 seconds", "15 seconds"];
const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "1:1", label: "1:1 (Square)" }
];
const QUALITIES = ["HD 1080p", "HD 720p"];

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [model, setModel] = useState("");
  const [duration, setDuration] = useState(DURATIONS[0]);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0].value);
  const [quality, setQuality] = useState(QUALITIES[0]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Video generation state
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'starting' | 'processing' | 'done' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [predictionId, setPredictionId] = useState<string>("");
  const [progress, setProgress] = useState<VideoGenerationStatus | null>(null);

  const supabase = createClient();
  const { trackProjectCreated, trackVideoGeneration, trackFeatureUsage } = usePostHogAnalytics();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) return;

    setLoading(true);
    setGenerationStatus('starting');
    setVideoUrl("");
    setError("");
    setPredictionId("");
    setProgress(null);

    try {
      // Create project in Supabase with analytics tracking
      const { data: project, error } = await supabaseAnalytics.createProject({
        userId: user.id,
        name: `Video: ${prompt.substring(0, 50)}...`,
        description: prompt
      });

      if (error || !project) {
        console.error('Failed to create project:', error);
        setGenerationStatus('error');
        setError('Failed to create project');
        setLoading(false);
        return;
      }

      // Track project creation
      trackProjectCreated({
        projectId: project.id,
        projectName: project.name,
        description: project.description,
        sceneCount: 1 // Default single scene
      });

      // Get video dimensions based on aspect ratio
      const dimensions = getVideoDimensions(aspectRatio);
      const durationSeconds = parseDuration(duration);

      // Start video generation
      const predId = await generateVideo(
        prompt,
        model || 'kling',
        durationSeconds,
        dimensions.width,
        dimensions.height
      );

      setPredictionId(predId);
      setGenerationStatus('processing');

      // Track video generation start
      trackVideoGeneration({
        projectId: project.id,
        topic: prompt,
        style: style,
        duration: durationSeconds,
        model: model,
        creditsUsed: 100, // Default credit cost
      });

      // Track feature usage
      trackFeatureUsage('video_generation_form_submit', {
        project_id: project.id,
        model: model,
        style: style,
        duration: duration,
        aspectRatio: aspectRatio,
        quality: quality,
        promptLength: prompt.length,
      });

      // Poll for completion
      const result = await pollForCompletion(
        predId,
        (status) => {
          setProgress(status);
          console.log('Generation progress:', status);
        }
      );

      if (result.output && result.output.length > 0) {
        setVideoUrl(result.output[0]);
        setGenerationStatus('done');

        // Update project status to completed
        await supabaseAnalytics.updateProjectStatus(project.id, 'completed');
      } else {
        throw new Error('No video output received');
      }

    } catch (error: any) {
      console.error('Error generating video:', error);
      setGenerationStatus('error');
      setError(error.message || 'Error during generation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#19132c] to-black flex flex-col items-center justify-center py-12 px-2">
      <div className="w-full max-w-2xl bg-zinc-900/90 rounded-2xl shadow-2xl p-8 border border-purple-900">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">Generate Video</h1>
        <label className="text-white mb-2 block">Video Prompt</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          className="w-full mb-6 rounded-lg bg-black/70 border border-zinc-800 text-white p-3 resize-none focus:outline-none focus:border-purple-500"
          rows={4}
          placeholder="Describe your video idea in detail…"
        />

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="text-white mb-2 block">Video Style</label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="w-full bg-black text-white border border-white rounded-lg focus:ring-2 focus:ring-purple-500 shadow-xl">
                <SelectValue placeholder="Select style" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border border-purple-700 shadow-2xl rounded-lg">
                {VIDEO_STYLES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-white mb-2 block">AI Model</label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger className="w-full bg-black text-white border border-white rounded-lg focus:ring-2 focus:ring-purple-500 shadow-xl">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border border-purple-700 shadow-2xl rounded-lg">
                {VIDEO_MODELS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="text-white mb-2 block">Duration</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="w-full bg-black text-white border border-white rounded-lg focus:ring-2 focus:ring-purple-500 shadow-xl">
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border border-purple-700 shadow-2xl rounded-lg">
                {DURATIONS.map(val => (
                  <SelectItem key={val} value={val}>{val}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-white mb-2 block">Aspect Ratio</label>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger className="w-full bg-black text-white border border-white rounded-lg focus:ring-2 focus:ring-purple-500 shadow-xl">
                <SelectValue placeholder="Aspect Ratio" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border border-purple-700 shadow-2xl rounded-lg">
                {ASPECT_RATIOS.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-white mb-2 block">Quality</label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="w-full bg-black text-white border border-white rounded-lg focus:ring-2 focus:ring-purple-500 shadow-xl">
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border border-purple-700 shadow-2xl rounded-lg">
                {QUALITIES.map(val => (
                  <SelectItem key={val} value={val}>{val}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className="w-full py-3 mt-4 text-lg font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white rounded-xl hover:scale-[1.02] transition-transform shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleGenerate}
          disabled={loading || !prompt.trim() || !model}
        >
          {generationStatus === 'starting' && "Starting Generation..."}
          {generationStatus === 'processing' && "Processing Video..."}
          {generationStatus === 'idle' && "Generate Video (5 Credits)"}
          {generationStatus === 'done' && "Generate Another Video"}
          {generationStatus === 'error' && "Try Again"}
        </Button>

        {/* Progress and Status Display */}
        {generationStatus !== 'idle' && (
          <div className="mt-6 p-4 bg-black/50 rounded-lg border border-purple-900/50">
            {generationStatus === 'starting' && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                <p className="text-purple-300">Starting video generation...</p>
              </div>
            )}

            {generationStatus === 'processing' && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                  <p className="text-purple-300">Processing video with {model}...</p>
                </div>
                {progress && (
                  <div className="text-sm text-gray-400">
                    <p>Status: {progress.status}</p>
                    {progress.logs && progress.logs.length > 0 && (
                      <p>Latest: {progress.logs[progress.logs.length - 1]}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {generationStatus === 'done' && videoUrl && (
              <div className="space-y-4">
                <p className="text-green-400 font-semibold">✅ Video generated successfully!</p>
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  className={`w-full rounded-lg shadow-lg max-h-96 ${
                    aspectRatio === '16:9' ? 'aspect-video' :
                    aspectRatio === '1:1' ? 'aspect-square' :
                    'aspect-[9/16]'
                  }`}
                />
                <div className="flex space-x-2">
                  <a
                    href={videoUrl}
                    download
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Download Video
                  </a>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(videoUrl)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            )}

            {generationStatus === 'error' && (
              <div className="space-y-2">
                <p className="text-red-400 font-semibold">❌ Generation failed</p>
                <p className="text-red-300 text-sm">{error}</p>
                {predictionId && (
                  <p className="text-gray-400 text-xs">Prediction ID: {predictionId}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
