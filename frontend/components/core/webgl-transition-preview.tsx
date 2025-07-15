'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Transition, TransitionPreviewState } from '@/types/video-editor';
import { Play, Pause, RotateCcw, Settings, Download } from 'lucide-react';

// WebGL Shader utilities
const createShader = (gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null => {
  const shader = gl.createShader(type);
  if (!shader) return null;
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  
  return shader;
};

const createProgram = (gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null => {
  const program = gl.createProgram();
  if (!program) return null;
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  
  return program;
};

const createTexture = (gl: WebGLRenderingContext, video: HTMLVideoElement): WebGLTexture | null => {
  const texture = gl.createTexture();
  if (!texture) return null;
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  
  return texture;
};

// Default vertex shader
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

// Default transition fragment shader (crossfade)
const defaultFragmentShader = `
  precision mediump float;
  uniform sampler2D u_texture1;
  uniform sampler2D u_texture2;
  uniform float u_progress;
  varying vec2 v_texCoord;
  
  void main() {
    vec4 color1 = texture2D(u_texture1, v_texCoord);
    vec4 color2 = texture2D(u_texture2, v_texCoord);
    gl_FragColor = mix(color1, color2, u_progress);
  }
`;

interface WebGLTransitionPreviewProps {
  video1Url: string;
  video2Url: string;
  transition: Transition;
  width?: number;
  height?: number;
  onPreviewStateChange?: (state: TransitionPreviewState) => void;
}

export const WebGLTransitionPreview: React.FC<WebGLTransitionPreviewProps> = ({
  video1Url,
  video2Url,
  transition,
  width = 400,
  height = 600,
  onPreviewStateChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);
  const animationRef = useRef<number>();
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const texture1Ref = useRef<WebGLTexture | null>(null);
  const texture2Ref = useRef<WebGLTexture | null>(null);
  
  const [previewState, setPreviewState] = useState<TransitionPreviewState>({
    isPlaying: false,
    progress: 0,
    duration: transition.duration,
    currentFrame: 0,
    totalFrames: Math.floor(transition.duration * 30), // 30 FPS
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize WebGL context and shaders
  const initWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return false;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      setError('WebGL not supported');
      return false;
    }

    glRef.current = gl;

    // Create shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, transition.glslCode || defaultFragmentShader);

    if (!vertexShader || !fragmentShader) {
      setError('Failed to create shaders');
      return false;
    }

    // Create program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      setError('Failed to create WebGL program');
      return false;
    }

    programRef.current = program;

    // Set up geometry
    const positions = new Float32Array([
      -1, -1,  0, 0,
       1, -1,  1, 0,
      -1,  1,  0, 1,
       1,  1,  1, 1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);

    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

    return true;
  }, [transition.glslCode]);

  // Initialize video textures
  const initTextures = useCallback(() => {
    const gl = glRef.current;
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    if (!gl || !video1 || !video2) return false;

    texture1Ref.current = createTexture(gl, video1);
    texture2Ref.current = createTexture(gl, video2);

    return texture1Ref.current && texture2Ref.current;
  }, []);

  // Render frame
  const renderFrame = useCallback((progress: number) => {
    const gl = glRef.current;
    const program = programRef.current;
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;
    const texture1 = texture1Ref.current;
    const texture2 = texture2Ref.current;

    if (!gl || !program || !video1 || !video2 || !texture1 || !texture2) return;

    // Update textures with current video frames
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video1);

    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video2);

    // Set up rendering
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // Set uniforms
    const progressLocation = gl.getUniformLocation(program, 'u_progress');
    const texture1Location = gl.getUniformLocation(program, 'u_texture1');
    const texture2Location = gl.getUniformLocation(program, 'u_texture2');

    gl.uniform1f(progressLocation, progress);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.uniform1i(texture1Location, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    gl.uniform1i(texture2Location, 1);

    // Set custom transition parameters
    transition.parameters.forEach((param) => {
      const location = gl.getUniformLocation(program, `u_${param.name}`);
      if (location) {
        if (param.type === 'float') {
          gl.uniform1f(location, param.value as number);
        } else if (param.type === 'int') {
          gl.uniform1i(location, param.value as number);
        } else if (param.type === 'bool') {
          gl.uniform1i(location, param.value ? 1 : 0);
        }
      }
    });

    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, [transition.parameters]);

  // Animation loop
  const animate = useCallback(() => {
    if (!previewState.isPlaying) return;

    const newProgress = Math.min(previewState.progress + (1 / previewState.totalFrames), 1);
    const newFrame = Math.floor(newProgress * previewState.totalFrames);

    const newState = {
      ...previewState,
      progress: newProgress,
      currentFrame: newFrame,
    };

    setPreviewState(newState);
    onPreviewStateChange?.(newState);

    renderFrame(newProgress);

    if (newProgress >= 1) {
      // Loop the animation
      setPreviewState(prev => ({ ...prev, progress: 0, currentFrame: 0 }));
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [previewState, renderFrame, onPreviewStateChange]);

  // Initialize everything when videos are loaded
  useEffect(() => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    if (!video1 || !video2) return;

    let loadedCount = 0;
    const onVideoLoaded = () => {
      loadedCount++;
      if (loadedCount === 2) {
        if (initWebGL() && initTextures()) {
          setIsLoading(false);
          renderFrame(0);
        }
      }
    };

    video1.addEventListener('loadeddata', onVideoLoaded);
    video2.addEventListener('loadeddata', onVideoLoaded);

    return () => {
      video1.removeEventListener('loadeddata', onVideoLoaded);
      video2.removeEventListener('loadeddata', onVideoLoaded);
    };
  }, [initWebGL, initTextures, renderFrame]);

  // Handle play/pause
  useEffect(() => {
    if (previewState.isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [previewState.isPlaying, animate]);

  const togglePlayback = () => {
    setPreviewState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const resetPreview = () => {
    setPreviewState(prev => ({
      ...prev,
      progress: 0,
      currentFrame: 0,
      isPlaying: false,
    }));
    renderFrame(0);
  };

  const handleProgressChange = (newProgress: number) => {
    const newFrame = Math.floor(newProgress * previewState.totalFrames);
    setPreviewState(prev => ({
      ...prev,
      progress: newProgress,
      currentFrame: newFrame,
    }));
    renderFrame(newProgress);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="relative">
        {/* Hidden video elements */}
        <video
          ref={video1Ref}
          src={video1Url}
          className="hidden"
          crossOrigin="anonymous"
          loop
          muted
          playsInline
        />
        <video
          ref={video2Ref}
          src={video2Url}
          className="hidden"
          crossOrigin="anonymous"
          loop
          muted
          playsInline
        />

        {/* WebGL Canvas */}
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="w-full rounded-lg bg-black"
          style={{ aspectRatio: `${width}/${height}` }}
        />

        {/* Loading/Error Overlay */}
        {(isLoading || error) && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            {isLoading ? (
              <div className="text-white text-center">
                <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>Loading preview...</p>
              </div>
            ) : (
              <div className="text-red-400 text-center">
                <p>Error: {error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 space-y-3">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Progress</span>
            <span>{(previewState.progress * 100).toFixed(1)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={previewState.progress}
            onChange={(e) => handleProgressChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${previewState.progress * 100}%, #374151 ${previewState.progress * 100}%, #374151 100%)`
            }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayback}
              disabled={isLoading || !!error}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
              title={previewState.isPlaying ? 'Pause' : 'Play'}
            >
              {previewState.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={resetPreview}
              disabled={isLoading || !!error}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
              title="Export Preview"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Transition Info */}
        <div className="text-sm text-gray-400 text-center">
          {transition.name} • {transition.duration}s • Frame {previewState.currentFrame + 1}/{previewState.totalFrames}
        </div>
      </div>
    </div>
  );
};
