'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Transition, TransitionCategory, TransitionIntensity } from '@/types/video-editor';
import { Search, Filter, Star, Zap, Play, Download, Heart, TrendingUp } from 'lucide-react';

// Mock transition data - in real app, this would come from API
const MOCK_TRANSITIONS: Transition[] = [
  {
    id: 'zoom-punch',
    name: 'Zoom Punch',
    category: 'tiktok-essentials',
    duration: 0.3,
    intensity: 'extreme',
    viralScore: 9.2,
    previewUrl: '/transitions/zoom-punch.mp4',
    glslCode: 'uniform float progress; ...',
    parameters: [
      { name: 'intensity', type: 'float', value: 1.0, min: 0.5, max: 2.0, step: 0.1, description: 'Zoom intensity' },
      { name: 'rotation', type: 'float', value: 0.0, min: -180, max: 180, step: 1, description: 'Rotation angle' }
    ],
    description: 'High-energy zoom transition perfect for TikTok content',
    tags: ['viral', 'energetic', 'zoom', 'punch']
  },
  {
    id: 'glitch-blast',
    name: 'Glitch Blast',
    category: 'glitch',
    duration: 0.4,
    intensity: 'extreme',
    viralScore: 8.8,
    previewUrl: '/transitions/glitch-blast.mp4',
    glslCode: 'uniform float progress; ...',
    parameters: [
      { name: 'glitchAmount', type: 'float', value: 0.8, min: 0.1, max: 1.0, step: 0.1, description: 'Glitch intensity' }
    ],
    description: 'Digital glitch effect with RGB separation',
    tags: ['glitch', 'digital', 'cyberpunk', 'modern']
  },
  {
    id: 'film-burn',
    name: 'Film Burn',
    category: 'cinematic',
    duration: 0.6,
    intensity: 'moderate',
    viralScore: 7.5,
    previewUrl: '/transitions/film-burn.mp4',
    glslCode: 'uniform float progress; ...',
    parameters: [
      { name: 'burnSpeed', type: 'float', value: 1.0, min: 0.5, max: 2.0, step: 0.1, description: 'Burn speed' }
    ],
    description: 'Classic film burn transition for cinematic feel',
    tags: ['cinematic', 'vintage', 'film', 'classic']
  },
  {
    id: 'cube-rotate',
    name: 'Cube Rotate',
    category: '3d-transforms',
    duration: 0.5,
    intensity: 'strong',
    viralScore: 8.1,
    previewUrl: '/transitions/cube-rotate.mp4',
    glslCode: 'uniform float progress; ...',
    parameters: [
      { name: 'axis', type: 'int', value: 0, min: 0, max: 2, step: 1, description: 'Rotation axis (0=X, 1=Y, 2=Z)' }
    ],
    description: '3D cube rotation transition',
    tags: ['3d', 'rotation', 'geometric', 'modern']
  }
];

const CATEGORY_LABELS: Record<TransitionCategory, string> = {
  'tiktok-essentials': 'TikTok Essentials',
  'cinematic': 'Cinematic',
  '3d-transforms': '3D Transforms',
  'particle-fx': 'Particle FX',
  'ai-generated': 'AI Generated',
  'glitch': 'Glitch',
  'organic': 'Organic'
};

const INTENSITY_COLORS: Record<TransitionIntensity, string> = {
  'subtle': 'text-green-400',
  'moderate': 'text-yellow-400',
  'strong': 'text-orange-400',
  'extreme': 'text-red-400'
};

interface TransitionCardProps {
  transition: Transition;
  isSelected: boolean;
  onSelect: (transition: Transition) => void;
  onPreview: (transition: Transition) => void;
}

const TransitionCard: React.FC<TransitionCardProps> = ({
  transition,
  isSelected,
  onSelect,
  onPreview,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <div
      className={`
        relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer transition-all duration-200
        border-2 ${isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-gray-500'}
        transform hover:scale-105
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(transition)}
    >
      {/* Preview Video */}
      <div className="relative aspect-video bg-gray-900">
        <video
          src={transition.previewUrl}
          className="w-full h-full object-cover"
          autoPlay={isHovered}
          loop
          muted
          playsInline
        />
        
        {/* Overlay Controls */}
        <div className={`
          absolute inset-0 bg-black/50 flex items-center justify-center
          transition-opacity duration-200
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(transition);
            }}
            className="bg-white/20 hover:bg-white/30 rounded-full p-3 transition-colors"
            title="Preview Transition"
          >
            <Play className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Viral Score Badge */}
        <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {transition.viralScore.toFixed(1)}
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute top-2 left-2 text-white hover:text-red-400 transition-colors"
          title="Add to Favorites"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-400 text-red-400' : ''}`} />
        </button>
      </div>

      {/* Transition Info */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-white truncate">{transition.name}</h4>
          <span className={`text-xs font-medium ${INTENSITY_COLORS[transition.intensity]}`}>
            {transition.intensity.toUpperCase()}
          </span>
        </div>

        <p className="text-xs text-gray-400 mb-2 line-clamp-2">
          {transition.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{transition.duration}s</span>
          <span className="capitalize">{CATEGORY_LABELS[transition.category]}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {transition.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

interface TransitionLibraryProps {
  selectedTransition: Transition | null;
  onTransitionSelect: (transition: Transition) => void;
  onTransitionPreview: (transition: Transition) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const TransitionLibrary: React.FC<TransitionLibraryProps> = ({
  selectedTransition,
  onTransitionSelect,
  onTransitionPreview,
  isOpen,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TransitionCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'viral' | 'name' | 'duration'>('viral');
  const [intensityFilter, setIntensityFilter] = useState<TransitionIntensity | 'all'>('all');

  const filteredTransitions = useMemo(() => {
    let filtered = MOCK_TRANSITIONS;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Intensity filter
    if (intensityFilter !== 'all') {
      filtered = filtered.filter(t => t.intensity === intensityFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'viral':
          return b.viralScore - a.viralScore;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, intensityFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Transition Library</h2>
            <span className="bg-purple-600 text-white text-sm px-3 py-1 rounded-full">
              {filteredTransitions.length} transitions
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-700 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TransitionCategory | 'all')}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* Intensity Filter */}
            <select
              value={intensityFilter}
              onChange={(e) => setIntensityFilter(e.target.value as TransitionIntensity | 'all')}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Intensities</option>
              <option value="subtle">Subtle</option>
              <option value="moderate">Moderate</option>
              <option value="strong">Strong</option>
              <option value="extreme">Extreme</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'viral' | 'name' | 'duration')}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="viral">Viral Score</option>
              <option value="name">Name</option>
              <option value="duration">Duration</option>
            </select>
          </div>
        </div>

        {/* Transition Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTransitions.map((transition) => (
              <TransitionCard
                key={transition.id}
                transition={transition}
                isSelected={selectedTransition?.id === transition.id}
                onSelect={onTransitionSelect}
                onPreview={onTransitionPreview}
              />
            ))}
          </div>

          {filteredTransitions.length === 0 && (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No transitions found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
