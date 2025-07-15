'use client';

import React, { useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Scene, TransitionSlot, BeatMarker } from '@/types/video-editor';
import { Play, Pause, Clock, Zap, Music } from 'lucide-react';

interface SceneClipProps {
  scene: Scene;
  isSelected: boolean;
  onSelect: (sceneId: string) => void;
}

const SceneClip: React.FC<SceneClipProps> = ({ scene, isSelected, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative bg-gray-800 rounded-lg p-3 cursor-grab active:cursor-grabbing
        border-2 transition-all duration-200 min-w-[200px] max-w-[200px]
        ${isSelected ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-gray-500'}
      `}
      onClick={() => onSelect(scene.id)}
    >
      {/* Thumbnail */}
      <div className="relative mb-2">
        <img
          src={scene.thumbnail}
          alt={scene.name}
          className="w-full h-24 object-cover rounded"
        />
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
          {Math.floor(scene.duration / 60)}:{String(Math.floor(scene.duration % 60)).padStart(2, '0')}
        </div>
        {scene.beatMarkers.length > 0 && (
          <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs px-1 rounded flex items-center gap-1">
            <Music className="w-3 h-3" />
            {scene.beatMarkers.length}
          </div>
        )}
      </div>

      {/* Scene Info */}
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-white truncate">{scene.name}</h4>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{scene.metadata.resolution}</span>
          <span>{scene.metadata.fps}fps</span>
        </div>
      </div>

      {/* Beat Markers Visualization */}
      {scene.beatMarkers.length > 0 && (
        <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 relative">
            {scene.beatMarkers.slice(0, 10).map((beat, index) => (
              <div
                key={index}
                className="absolute top-0 w-0.5 h-full bg-white/60"
                style={{ left: `${(beat / scene.duration) * 100}%` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface TransitionSlotComponentProps {
  slot: TransitionSlot;
  onSelectTransition: (slotId: string) => void;
  onRemoveTransition: (slotId: string) => void;
}

const TransitionSlotComponent: React.FC<TransitionSlotComponentProps> = ({
  slot,
  onSelectTransition,
  onRemoveTransition,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-w-[80px] mx-2">
      {slot.transition ? (
        <div className="relative group">
          <button
            type="button"
            onClick={() => onSelectTransition(slot.id)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-2 hover:from-purple-700 hover:to-pink-700 transition-all"
            title={slot.transition.name}
          >
            <div className="w-12 h-8 bg-white/20 rounded flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </button>
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {slot.transition.name} ({slot.transition.viralScore.toFixed(1)}🔥)
          </div>
          <button
            type="button"
            onClick={() => onRemoveTransition(slot.id)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ×
          </button>
          {slot.beatSynced && (
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-purple-400 text-xs">
              <Music className="w-3 h-3" />
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onSelectTransition(slot.id)}
          className="border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-lg p-2 transition-colors group"
          title="Add Transition"
        >
          <div className="w-12 h-8 flex items-center justify-center text-gray-400 group-hover:text-purple-400">
            <span className="text-lg">+</span>
          </div>
        </button>
      )}
      <div className="text-xs text-gray-500 mt-1">
        {slot.transition ? `${slot.transition.duration}s` : 'Add'}
      </div>
    </div>
  );
};

interface SceneTimelineProps {
  scenes: Scene[];
  transitionSlots: TransitionSlot[];
  selectedSceneId: string | null;
  beatMarkers: BeatMarker[];
  showBeatMarkers: boolean;
  onScenesReorder: (scenes: Scene[]) => void;
  onSceneSelect: (sceneId: string) => void;
  onTransitionSelect: (slotId: string) => void;
  onTransitionRemove: (slotId: string) => void;
}

export const SceneTimeline: React.FC<SceneTimelineProps> = ({
  scenes,
  transitionSlots,
  selectedSceneId,
  beatMarkers,
  showBeatMarkers,
  onScenesReorder,
  onSceneSelect,
  onTransitionSelect,
  onTransitionRemove,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = scenes.findIndex((scene) => scene.id === active.id);
      const newIndex = scenes.findIndex((scene) => scene.id === over?.id);
      
      const reorderedScenes = arrayMove(scenes, oldIndex, newIndex);
      onScenesReorder(reorderedScenes);
    }
  }, [scenes, onScenesReorder]);

  const totalDuration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

  return (
    <div className="bg-gray-900 border-t border-gray-700 p-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">Scene Timeline</h3>
          <div className="text-sm text-gray-400">
            {scenes.length} scenes • {Math.floor(totalDuration / 60)}:{String(Math.floor(totalDuration % 60)).padStart(2, '0')} total
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`px-3 py-1 rounded text-sm transition-colors ${
              showBeatMarkers 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Music className="w-4 h-4 inline mr-1" />
            Beat Sync
          </button>
        </div>
      </div>

      {/* Beat Markers Visualization */}
      {showBeatMarkers && beatMarkers.length > 0 && (
        <div className="mb-4 h-8 bg-gray-800 rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 flex items-center">
            {beatMarkers.map((beat, index) => (
              <div
                key={index}
                className="absolute w-0.5 h-full bg-purple-400"
                style={{ 
                  left: `${(beat.time / totalDuration) * 100}%`,
                  opacity: beat.strength 
                }}
                title={`Beat at ${beat.time.toFixed(2)}s`}
              />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
            Beat Markers ({beatMarkers.length} detected)
          </div>
        </div>
      )}

      {/* Scene Timeline */}
      <div className="overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex items-center gap-2 pb-4 min-w-max">
            <SortableContext items={scenes.map(s => s.id)} strategy={horizontalListSortingStrategy}>
              {scenes.map((scene, index) => (
                <React.Fragment key={scene.id}>
                  <SceneClip
                    scene={scene}
                    isSelected={selectedSceneId === scene.id}
                    onSelect={onSceneSelect}
                  />
                  {index < scenes.length - 1 && (
                    <TransitionSlotComponent
                      slot={transitionSlots[index] || {
                        id: `slot-${index}`,
                        beforeSceneId: scene.id,
                        afterSceneId: scenes[index + 1].id,
                        beatSynced: false,
                      }}
                      onSelectTransition={onTransitionSelect}
                      onRemoveTransition={onTransitionRemove}
                    />
                  )}
                </React.Fragment>
              ))}
            </SortableContext>
          </div>
        </DndContext>
      </div>

      {/* Timeline Controls */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Play className="w-4 h-4" />
            Preview Timeline
          </button>
          <button
            type="button"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Auto-Sync Beats
          </button>
        </div>
        <div className="text-sm text-gray-400">
          Drag scenes to reorder • Click + to add transitions
        </div>
      </div>
    </div>
  );
};
