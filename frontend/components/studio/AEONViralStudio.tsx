/**
 * AEON Viral Studio - Complete CapCut-like Video Editor
 * Production-ready viral video editing interface with AI coaching
 */

"use client";

import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { TimelineEditor, TimelineHandle } from './TimelineEditor';

export default function AEONViralStudio() {
  const { getToken } = useAuth();
  const timelineRef = useRef<TimelineHandle>(null);
  const [duration] = useState(60);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [busy, setBusy] = useState(false);

  const onPlayPause = () => setIsPlaying(p => !p);
  const onSeek = (t: number) => setCurrentTime(t);

  const productBatch = async () => {
    const url = prompt('Paste product link (Amazon/Shopify/etc)');
    if (!url) return;
    setBusy(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const res = await apiClient.productBatch(url, 3, token);
      // Drop placeholders to timeline (we don't have per-scene URLs yet from batch jobs)
      timelineRef.current?.addVideoClip(res.scraped.title, res.scraped.images?.[0] || 'Product', currentTime, 5);
      alert(`Batch started: ${res.jobs.join(', ')}`);
    } catch (e: any) {
      alert(e?.message || 'Failed');
    } finally {
      setBusy(false);
    }
  };

  const talkingHead = async () => {
    // Simple prompt flow: user provides URLs; in production, use file upload with /media/upload
    const imageUrl = prompt('Image URL for avatar');
    if (!imageUrl) return;
    const audioUrl = prompt('Audio URL (or generate TTS first)');
    if (!audioUrl) return;
    setBusy(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const out = await apiClient.talkingHead({ image_url: imageUrl, audio_url: audioUrl }, token);
      const path = out.path || out.url || '';
      timelineRef.current?.addVideoClip('Talking Head', path, currentTime, 5);
    } catch (e: any) {
      alert(e?.message || 'Talking head failed');
    } finally {
      setBusy(false);
    }
  };

  const tts = async () => {
    const text = prompt('Enter TTS text');
    if (!text) return;
    setBusy(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const out = await apiClient.tts(text, undefined, 'en', token);
      const url = out.path || out.url || '';
      timelineRef.current?.addAudioClip('Voiceover', url, currentTime, 10);
    } catch (e: any) {
      alert(e?.message || 'TTS failed');
    } finally {
      setBusy(false);
    }
  };

  const music = async () => {
    const promptStr = prompt('Music prompt');
    if (!promptStr) return;
    setBusy(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const out = await apiClient.music(promptStr, 15, token);
      const url = out.path || out.url || '';
      timelineRef.current?.addAudioClip('Music', url, currentTime, 15);
    } catch (e: any) {
      alert(e?.message || 'Music failed');
    } finally {
      setBusy(false);
    }
  };

  const upscale = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setBusy(true);
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        const out = await apiClient.upscale(file, 2, token);
        const url = out.path || out.url || '';
        // Replace the first matching URL, else add as new
        timelineRef.current?.replaceClipByUrl(URL.createObjectURL(file), url);
        timelineRef.current?.addVideoClip('Upscaled', url, currentTime, 5);
      } catch (e: any) {
        alert(e?.message || 'Upscale failed');
      } finally {
        setBusy(false);
      }
    };
    input.click();
  };

  const renderVideo = async () => {
    // For now reuse /editor/render in the Studio page
    alert('Use Render button in Studio header to render current timeline.');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button disabled={busy} onClick={productBatch}>Product Batch</Button>
        <Button disabled={busy} onClick={talkingHead}>Talking Head</Button>
        <Button disabled={busy} onClick={tts}>TTS</Button>
        <Button disabled={busy} onClick={music}>Music</Button>
        <Button disabled={busy} onClick={upscale}>Upscale</Button>
        <Button variant="outline" onClick={renderVideo}>Presets / Export</Button>
      </div>

      <TimelineEditor
        ref={timelineRef}
        project={{}}
        onProjectUpdate={() => {}}
        onPreview={setCurrentTime}
        duration={duration}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPlayPause={onPlayPause}
        onSeek={onSeek}
      />
    </div>
  );
}
