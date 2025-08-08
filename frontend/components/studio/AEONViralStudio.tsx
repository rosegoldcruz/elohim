/**
 * AEON Viral Studio - Complete CapCut-like Video Editor
 * Production-ready viral video editing interface with AI coaching
 */

"use client";

import React, { useState, useEffect } from 'react';
import { TimelineEditor } from './TimelineEditor';
import { Button } from '@/components/ui/button';
import { apiClient, RenderTimelineRequest } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function AEONViralStudio() {
  const { getToken } = useAuth();
  const [duration, setDuration] = useState(60);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [project, setProject] = useState<any>({});
  const [timeline, setTimeline] = useState<any>({ tracks: [], duration: 60 });
  const [renderJobId, setRenderJobId] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string>('');

  const onPlayPause = () => setIsPlaying(p => !p);
  const onSeek = (t: number) => setCurrentTime(t);

  const handleProjectUpdate = (p: any) => setProject(p);

  const onPreview = (t: number) => setCurrentTime(t);

  const renderVideo = async () => {
    const token = await getToken();
    if (!token) return;
    const payload: RenderTimelineRequest = {
      timeline: timeline,
      settings: { aspect_ratio: '9:16', quality: 'high' },
    };
    const res = await apiClient.renderTimeline(payload, token);
    setRenderJobId(res.job_id);
    setDownloadUrl(apiClient.getDownloadUrl(res.job_id));
  };

  return (
    <div className="space-y-4">
      <div className="aspect-video bg-black/50 rounded-lg border border-zinc-800 flex items-center justify-center text-zinc-400">
        {downloadUrl ? (
          <video src={downloadUrl} controls className="w-full h-full" />
        ) : (
          <span>Preview</span>
        )}
      </div>

      <div className="flex gap-2">
        <Button onClick={onPlayPause}>{isPlaying ? 'Pause' : 'Play'}</Button>
        <Button variant="outline" onClick={() => setCurrentTime(0)}>Rewind</Button>
        <Button className="ml-auto" onClick={renderVideo}>Render</Button>
      </div>

      <TimelineEditor
        project={project}
        onProjectUpdate={handleProjectUpdate}
        onPreview={onPreview}
        duration={duration}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onSeek={onSeek}
      />
    </div>
  );
}
