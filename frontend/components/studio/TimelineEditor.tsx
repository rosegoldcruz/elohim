/**
 * AEON Timeline Editor - Professional video editing timeline
 * Multi-track editing with drag-drop, transitions, and real-time preview
 */

'use client';

import React, { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Scissors, Copy, Trash2, Plus, Minus, ZoomIn, ZoomOut,
  Layers, Music, Type, Image, Video, Wand2, Settings
} from 'lucide-react';

// Types
interface TimelineTrack {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'effects';
  height: number;
  muted: boolean;
  locked: boolean;
  clips: TimelineClip[];
}

interface TimelineClip {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'text' | 'image' | 'effect';
  startTime: number;
  duration: number;
  url?: string;
  content?: any;
  properties: {
    volume?: number;
    opacity?: number;
    speed?: number;
    filters?: string[];
  };
  transitions?: {
    in?: TransitionEffect;
    out?: TransitionEffect;
  };
}

interface TransitionEffect {
  type: 'fade' | 'slide' | 'zoom' | 'wipe' | 'dissolve';
  duration: number;
  properties?: Record<string, any>;
}

interface TimelineEditorProps {
  project: any;
  onProjectUpdate: (project: any) => void;
  onPreview: (time: number) => void;
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
}

export type TimelineHandle = {
  addVideoClip: (name: string, url: string, startTime?: number, duration?: number) => void;
  addAudioClip: (name: string, url: string, startTime?: number, duration?: number) => void;
  replaceClipByUrl: (oldUrl: string, newUrl: string) => void;
};

export const TimelineEditor = forwardRef<TimelineHandle, TimelineEditorProps>(function TimelineEditor(
  {
    project,
    onProjectUpdate,
    onPreview,
    duration,
    currentTime,
    isPlaying,
    onPlayPause,
    onSeek
  }: TimelineEditorProps,
  ref
) {
  const [tracks, setTracks] = useState<TimelineTrack[]>([
    {
      id: 'video-main',
      name: 'Main Video',
      type: 'video',
      height: 80,
      muted: false,
      locked: false,
      clips: []
    },
    {
      id: 'audio-music',
      name: 'Background Music',
      type: 'audio',
      height: 60,
      muted: false,
      locked: false,
      clips: []
    },
    {
      id: 'text-captions',
      name: 'Captions',
      type: 'text',
      height: 50,
      muted: false,
      locked: false,
      clips: []
    },
    {
      id: 'effects',
      name: 'Effects',
      type: 'effects',
      height: 40,
      muted: false,
      locked: false,
      clips: []
    }
  ]);

  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [draggedClip, setDraggedClip] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [playheadPosition, setPlayheadPosition] = useState(0);

  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);

  // Convert time to pixels
  const timeToPixels = useCallback((time: number) => {
    return (time / duration) * 800 * zoom; // 800px base width
  }, [duration, zoom]);

  // Convert pixels to time
  const pixelsToTime = useCallback((pixels: number) => {
    return (pixels / (800 * zoom)) * duration;
  }, [duration, zoom]);

  // Update playhead position
  useEffect(() => {
    setPlayheadPosition(timeToPixels(currentTime));
  }, [currentTime, timeToPixels]);

  // Handle timeline click for seeking
  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const time = pixelsToTime(x);
    
    onSeek(Math.max(0, Math.min(time, duration)));
  }, [pixelsToTime, onSeek, duration]);

  // Handle clip drag start
  const handleClipDragStart = useCallback((clipId: string, e: React.DragEvent) => {
    setDraggedClip(clipId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  // Handle clip drop
  const handleClipDrop = useCallback((trackId: string, e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedClip || !timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newStartTime = pixelsToTime(x);
    
    // Update clip position
    setTracks(prevTracks => 
      prevTracks.map(track => ({
        ...track,
        clips: track.clips.map(clip => 
          clip.id === draggedClip 
            ? { ...clip, startTime: Math.max(0, newStartTime) }
            : clip
        )
      }))
    );
    
    setDraggedClip(null);
  }, [draggedClip, pixelsToTime]);

  // Add clip to track
  const addClipToTrack = useCallback((trackId: string, clipData: Partial<TimelineClip>) => {
    const newClip: TimelineClip = {
      id: `clip_${Date.now()}`,
      name: clipData.name || 'New Clip',
      type: clipData.type || 'video',
      startTime: clipData.startTime || 0,
      duration: clipData.duration || 5,
      url: clipData.url,
      content: clipData.content,
      properties: {
        volume: 1,
        opacity: 1,
        speed: 1,
        ...clipData.properties
      }
    };

    setTracks(prevTracks =>
      prevTracks.map(track =>
        track.id === trackId
          ? { ...track, clips: [...track.clips, newClip] }
          : track
      )
    );
  }, []);

  // Remove clip
  const removeClip = useCallback((clipId: string) => {
    setTracks(prevTracks =>
      prevTracks.map(track => ({
        ...track,
        clips: track.clips.filter(clip => clip.id !== clipId)
      }))
    );
    setSelectedClip(null);
  }, []);

  // Split clip at current time
  const splitClip = useCallback((clipId: string) => {
    setTracks(prevTracks =>
      prevTracks.map(track => ({
        ...track,
        clips: track.clips.flatMap(clip => {
          if (clip.id !== clipId) return clip;
          
          const splitTime = currentTime - clip.startTime;
          if (splitTime <= 0 || splitTime >= clip.duration) return clip;
          
          // Create two clips from the split
          const firstClip = {
            ...clip,
            id: `${clip.id}_1`,
            duration: splitTime
          };
          
          const secondClip = {
            ...clip,
            id: `${clip.id}_2`,
            startTime: clip.startTime + splitTime,
            duration: clip.duration - splitTime
          };
          
          return [firstClip, secondClip];
        })
      }))
    );
  }, [currentTime]);

  useImperativeHandle(ref, () => ({
    addVideoClip: (name: string, url: string, startTime: number = 0, durationSec: number = 5) => {
      setTracks(prev => prev.map(t => t.id === 'video-main' ? {
        ...t,
        clips: [...t.clips, {
          id: `clip_${Date.now()}`,
          name,
          type: 'video',
          startTime,
          duration: durationSec,
          url,
          properties: { volume: 1, opacity: 1, speed: 1 }
        }]
      } : t));
    },
    addAudioClip: (name: string, url: string, startTime: number = 0, durationSec: number = 5) => {
      setTracks(prev => prev.map(t => t.id === 'audio-music' ? {
        ...t,
        clips: [...t.clips, {
          id: `clip_${Date.now()}`,
          name,
          type: 'audio',
          startTime,
          duration: durationSec,
          url,
          properties: { volume: 1 }
        }]
      } : t));
    },
    replaceClipByUrl: (oldUrl: string, newUrl: string) => {
      setTracks(prev => prev.map(t => ({
        ...t,
        clips: t.clips.map(c => c.url === oldUrl ? { ...c, url: newUrl } : c)
      })));
    }
  }), []);

  // Render timeline ruler
  const renderRuler = () => {
    const markers = [];
    const step = duration / 10; // 10 major markers
    
    for (let i = 0; i <= 10; i++) {
      const time = i * step;
      const x = timeToPixels(time);
      
      markers.push(
        <div
          key={i}
          className="absolute top-0 bottom-0 border-l border-gray-600"
          style={{ left: x }}
        >
          <span className="absolute -top-5 -translate-x-1/2 text-xs text-gray-400">
            {Math.floor(time / 60)}:{String(Math.floor(time % 60)).padStart(2, '0')}
          </span>
        </div>
      );
    }
    
    return markers;
  };

  // Render track clips
  const renderTrackClips = (track: TimelineTrack) => {
    return track.clips.map(clip => {
      const x = timeToPixels(clip.startTime);
      const width = timeToPixels(clip.duration);
      
      return (
        <div
          key={clip.id}
          className={`absolute h-full rounded cursor-move transition-all ${
            selectedClip === clip.id 
              ? 'ring-2 ring-blue-500' 
              : 'hover:ring-1 hover:ring-gray-400'
          } ${
            clip.type === 'video' ? 'bg-blue-600' :
            clip.type === 'audio' ? 'bg-green-600' :
            clip.type === 'text' ? 'bg-yellow-600' :
            'bg-purple-600'
          }`}
          style={{ left: x, width: Math.max(width, 20) }}
          draggable
          onDragStart={(e) => handleClipDragStart(clip.id, e)}
          onClick={() => setSelectedClip(clip.id)}
          onDoubleClick={() => splitClip(clip.id)}
        >
          <div className="p-1 text-xs text-white truncate">
            {clip.name}
          </div>
          
          {/* Resize handles */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-white opacity-0 hover:opacity-100 cursor-ew-resize" />
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-0 hover:opacity-100 cursor-ew-resize" />
        </div>
      );
    });
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={onPlayPause}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          <button className="p-2 hover:bg-gray-700 rounded">
            <SkipBack className="w-4 h-4" />
          </button>
          
          <button className="p-2 hover:bg-gray-700 rounded">
            <SkipForward className="w-4 h-4" />
          </button>
          
          <div className="mx-4 text-sm font-mono">
            {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedClip && (
            <>
              <button
                onClick={() => splitClip(selectedClip)}
                className="p-2 hover:bg-gray-700 rounded"
                title="Split Clip"
              >
                <Scissors className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => removeClip(selectedClip)}
                className="p-2 hover:bg-gray-700 rounded text-red-400"
                title="Delete Clip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
          
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-2 hover:bg-gray-700 rounded"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
          
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="p-2 hover:bg-gray-700 rounded"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Ruler */}
        <div className="h-8 bg-gray-900 border-b border-gray-700 relative overflow-hidden">
          {renderRuler()}
        </div>

        {/* Tracks */}
        <div className="overflow-y-auto max-h-96">
          {tracks.map(track => (
            <div key={track.id} className="flex border-b border-gray-700">
              {/* Track Header */}
              <div className="w-48 bg-gray-900 p-2 border-r border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {track.type === 'video' && <Video className="w-4 h-4" />}
                  {track.type === 'audio' && <Music className="w-4 h-4" />}
                  {track.type === 'text' && <Type className="w-4 h-4" />}
                  {track.type === 'effects' && <Wand2 className="w-4 h-4" />}
                  <span className="text-sm">{track.name}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setTracks(prev => prev.map(t => 
                      t.id === track.id ? { ...t, muted: !t.muted } : t
                    ))}
                    className={`p-1 rounded ${track.muted ? 'text-red-400' : 'text-gray-400'}`}
                  >
                    {track.muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                </div>
              </div>

              {/* Track Content */}
              <div
                ref={timelineRef}
                className="flex-1 relative bg-gray-800 cursor-pointer"
                style={{ height: track.height }}
                onClick={handleTimelineClick}
                onDrop={(e) => handleClipDrop(track.id, e)}
                onDragOver={(e) => e.preventDefault()}
              >
                {renderTrackClips(track)}
              </div>
            </div>
          ))}
        </div>

        {/* Playhead */}
        <div
          ref={playheadRef}
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10"
          style={{ left: playheadPosition + 192 }} // 192px = track header width
        >
          <div className="absolute -top-2 -left-1 w-3 h-3 bg-red-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}
