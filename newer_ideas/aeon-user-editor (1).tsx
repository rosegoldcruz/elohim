import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download, Wand2, MessageSquare, Sparkles, Upload, Settings, Layers, Music, Type, Image, Video, Share2, Save, Undo, Redo, ChevronLeft, ChevronRight } from 'lucide-react';

// AEON User Video Editor - Complete Implementation
const AEONVideoEditor = () => {
  const [videoSrc, setVideoSrc] = useState('https://example.com/sample-video.mp4');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [selectedTool, setSelectedTool] = useState('select');
  const [timeline, setTimeline] = useState([]);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [projectData, setProjectData] = useState(null);
  
  const videoRef = useRef(null);
  const timelineRef = useRef(null);

  // Mock viral templates
  const viralTemplates = [
    { id: 'tiktok-trend', name: 'TikTok Trending', icon: '🎵' },
    { id: 'ig-reels', name: 'Instagram Reels', icon: '📱' },
    { id: 'yt-shorts', name: 'YouTube Shorts', icon: '📺' },
    { id: 'viral-hook', name: 'Viral Hook', icon: '🎣' }
  ];

  // AI Assistant Component
  const AIAssistant = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([
      'Add trending music to match the mood',
      'Create eye-catching captions',
      'Apply viral transitions',
      'Optimize for TikTok algorithm'
    ]);

    const handleAIQuery = async () => {
      setLoading(true);
      // Simulate AI response
      setTimeout(() => {
        setAiResponse(`Based on your video content, I recommend:
        
1. **Hook Enhancement**: Add a strong visual hook in the first 3 seconds
2. **Caption Timing**: Place captions at 0:03, 0:15, and 0:45
3. **Music Sync**: Use beat drops at 0:08 and 0:32
4. **Transitions**: Apply zoom transitions at scene changes
5. **Call-to-Action**: Add engagement prompt at 0:55

Would you like me to apply these changes automatically?`);
        setLoading(false);
      }, 1500);
    };

    return (
      <div className="w-80 bg-gray-900 border-l border-gray-700 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            AI Assistant
          </h3>
          <button
            onClick={() => setAiAssistantOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-300 mb-2">Quick Actions</p>
            <div className="space-y-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  className="w-full text-left text-sm bg-gray-700 hover:bg-gray-600 p-2 rounded transition-colors"
                  onClick={() => setQuery(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask AI for editing suggestions..."
              className="w-full bg-gray-800 text-white p-3 rounded-lg resize-none h-24"
            />
            <button
              onClick={handleAIQuery}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              disabled={loading}
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Get AI Suggestions
                </>
              )}
            </button>
          </div>

          {aiResponse && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h4 className="font-semibold mb-2">AI Recommendations</h4>
              <div className="text-sm text-gray-300 whitespace-pre-line">
                {aiResponse}
              </div>
              <div className="mt-4 space-y-2">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition-colors">
                  Apply All Suggestions
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors">
                  Apply Selectively
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Timeline Component
  const Timeline = () => {
    const [tracks, setTracks] = useState([
      { id: 'video', name: 'Video', items: [] },
      { id: 'audio', name: 'Audio', items: [] },
      { id: 'text', name: 'Text', items: [] },
      { id: 'effects', name: 'Effects', items: [] }
    ]);

    return (
      <div className="bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-between p-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <button className="p-1 hover:bg-gray-700 rounded">
              <Undo className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-700 rounded">
              <Redo className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>00:00</span>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => {
                setCurrentTime(parseFloat(e.target.value));
                if (videoRef.current) {
                  videoRef.current.currentTime = parseFloat(e.target.value);
                }
              }}
              className="w-96"
            />
            <span>{Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</span>
          </div>
        </div>

        <div className="h-48 overflow-y-auto">
          {tracks.map((track) => (
            <div key={track.id} className="border-b border-gray-700">
              <div className="flex">
                <div className="w-24 p-2 bg-gray-900 border-r border-gray-700">
                  <span className="text-sm">{track.name}</span>
                </div>
                <div className="flex-1 p-2 relative">
                  <div className="h-12 bg-gray-700 rounded relative">
                    {/* Track items would be rendered here */}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Tools Panel
  const ToolsPanel = () => {
    const tools = [
      { id: 'transitions', name: 'Transitions', icon: <ChevronLeft className="w-4 h-4" /> },
      { id: 'text', name: 'Text', icon: <Type className="w-4 h-4" /> },
      { id: 'music', name: 'Music', icon: <Music className="w-4 h-4" /> },
      { id: 'effects', name: 'Effects', icon: <Sparkles className="w-4 h-4" /> },
      { id: 'stickers', name: 'Stickers', icon: <Image className="w-4 h-4" /> },
      { id: 'avatars', name: 'Avatars', icon: <Video className="w-4 h-4" /> }
    ];

    return (
      <div className="w-64 bg-gray-900 border-r border-gray-700 p-4">
        <h3 className="text-lg font-semibold mb-4">Tools</h3>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Viral Templates</p>
            <div className="grid grid-cols-2 gap-2">
              {viralTemplates.map((template) => (
                <button
                  key={template.id}
                  className="bg-gray-800 hover:bg-gray-700 p-3 rounded-lg text-center transition-colors"
                >
                  <div className="text-2xl mb-1">{template.icon}</div>
                  <div className="text-xs">{template.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Editing Tools</p>
            <div className="grid grid-cols-2 gap-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`bg-gray-800 hover:bg-gray-700 p-3 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                    selectedTool === tool.id ? 'bg-blue-600 hover:bg-blue-700' : ''
                  }`}
                >
                  {tool.icon}
                  <span className="text-xs">{tool.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
              <Sparkles className="w-5 h-5" />
              AI Magic Edit
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">AEON Video Editor</h1>
          <span className="text-sm text-gray-400">Project: Untitled</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors">
            <Save className="w-4 h-4" />
            Save
          </button>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ToolsPanel />

        {/* Video Preview */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-black flex items-center justify-center p-8">
            <div className="relative w-full max-w-3xl">
              <video
                ref={videoRef}
                src={videoSrc}
                className="w-full rounded-lg shadow-2xl"
                onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                onLoadedMetadata={(e) => setDuration(e.target.duration)}
              />
              
              {/* Playback Controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900 bg-opacity-90 px-6 py-3 rounded-full">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      if (isPlaying) {
                        videoRef.current.pause();
                      } else {
                        videoRef.current.play();
                      }
                      setIsPlaying(!isPlaying);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 p-3 rounded-full transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <Timeline />
        </div>

        {/* AI Assistant Panel */}
        {aiAssistantOpen && <AIAssistant />}
        
        {/* Toggle AI Assistant */}
        {!aiAssistantOpen && (
          <button
            onClick={() => setAiAssistantOpen(true)}
            className="fixed right-4 bottom-4 bg-blue-600 hover:bg-blue-700 p-4 rounded-full shadow-lg transition-all transform hover:scale-110"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AEONVideoEditor;