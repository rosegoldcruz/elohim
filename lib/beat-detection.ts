/**
 * Beat Detection & Audio Synchronization System
 * Analyzes audio tracks and synchronizes transitions to beats
 */

import { BeatMarker, AudioAnalysis } from '@/types/video-editor';

export interface BeatDetectionConfig {
  sampleRate: number;
  fftSize: number;
  hopSize: number;
  minBPM: number;
  maxBPM: number;
  sensitivity: number; // 0-1, higher = more sensitive
}

export interface BeatSyncOptions {
  snapTolerance: number; // seconds
  preferStrongBeats: boolean;
  beatTypes: ('kick' | 'snare' | 'hihat' | 'bass')[];
  minInterval: number; // minimum seconds between transitions
}

export class BeatDetector {
  private config: BeatDetectionConfig;
  private audioContext: AudioContext | null = null;

  constructor(config: Partial<BeatDetectionConfig> = {}) {
    this.config = {
      sampleRate: 44100,
      fftSize: 2048,
      hopSize: 512,
      minBPM: 60,
      maxBPM: 200,
      sensitivity: 0.7,
      ...config,
    };
  }

  /**
   * Analyze audio file and detect beats
   */
  async analyzeAudio(audioUrl: string): Promise<AudioAnalysis> {
    try {
      // Initialize audio context if needed
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      // Load audio file
      const audioBuffer = await this.loadAudioFile(audioUrl);
      
      // Extract audio features
      const beats = await this.detectBeats(audioBuffer);
      const bpm = this.calculateBPM(beats);
      const energy = this.calculateEnergyLevels(audioBuffer);
      const spectralCentroid = this.calculateSpectralCentroid(audioBuffer);

      return {
        duration: audioBuffer.duration,
        bpm,
        beats,
        energy,
        spectralCentroid,
      };

    } catch (error) {
      console.error('Error analyzing audio:', error);
      throw new Error('Failed to analyze audio');
    }
  }

  /**
   * Load audio file and decode to AudioBuffer
   */
  private async loadAudioFile(url: string): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return this.audioContext.decodeAudioData(arrayBuffer);
  }

  /**
   * Detect beats using onset detection algorithm
   */
  private async detectBeats(audioBuffer: AudioBuffer): Promise<BeatMarker[]> {
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const beats: BeatMarker[] = [];

    // Calculate spectral flux for onset detection
    const spectralFlux = this.calculateSpectralFlux(channelData);
    
    // Find peaks in spectral flux
    const onsets = this.findOnsets(spectralFlux);
    
    // Convert onsets to beat markers
    for (const onset of onsets) {
      const time = (onset * this.config.hopSize) / this.config.sampleRate;
      const strength = this.calculateBeatStrength(spectralFlux, onset);
      const type = this.classifyBeatType(channelData, onset);

      beats.push({
        time,
        strength,
        type,
      });
    }

    // Filter beats by sensitivity threshold
    const threshold = 1 - this.config.sensitivity;
    return beats.filter(beat => beat.strength > threshold);
  }

  /**
   * Calculate spectral flux for onset detection
   */
  private calculateSpectralFlux(audioData: Float32Array): Float32Array[] {
    const windowSize = this.config.fftSize;
    const hopSize = this.config.hopSize;
    const numFrames = Math.floor((audioData.length - windowSize) / hopSize) + 1;
    
    const spectralFlux: Float32Array[] = [];
    let previousSpectrum: Float32Array | null = null;

    for (let frame = 0; frame < numFrames; frame++) {
      const start = frame * hopSize;
      const end = start + windowSize;
      const frameData = audioData.slice(start, end);

      // Apply window function (Hanning)
      const windowedData = this.applyHanningWindow(frameData);
      
      // Calculate FFT
      const spectrum = this.calculateFFT(windowedData);
      
      if (previousSpectrum) {
        // Calculate spectral flux (positive differences)
        const flux = new Float32Array(spectrum.length);
        for (let i = 0; i < spectrum.length; i++) {
          flux[i] = Math.max(0, spectrum[i] - previousSpectrum[i]);
        }
        spectralFlux.push(flux);
      }

      previousSpectrum = spectrum;
    }

    return spectralFlux;
  }

  /**
   * Apply Hanning window to audio frame
   */
  private applyHanningWindow(frameData: Float32Array): Float32Array {
    const windowed = new Float32Array(frameData.length);
    for (let i = 0; i < frameData.length; i++) {
      const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (frameData.length - 1)));
      windowed[i] = frameData[i] * window;
    }
    return windowed;
  }

  /**
   * Calculate FFT magnitude spectrum
   */
  private calculateFFT(audioData: Float32Array): Float32Array {
    // Simplified FFT implementation
    // In a real implementation, you'd use a proper FFT library like fft.js
    const spectrum = new Float32Array(audioData.length / 2);
    
    for (let k = 0; k < spectrum.length; k++) {
      let real = 0;
      let imag = 0;
      
      for (let n = 0; n < audioData.length; n++) {
        const angle = -2 * Math.PI * k * n / audioData.length;
        real += audioData[n] * Math.cos(angle);
        imag += audioData[n] * Math.sin(angle);
      }
      
      spectrum[k] = Math.sqrt(real * real + imag * imag);
    }
    
    return spectrum;
  }

  /**
   * Find onset peaks in spectral flux
   */
  private findOnsets(spectralFlux: Float32Array[]): number[] {
    const onsets: number[] = [];
    const summedFlux = new Float32Array(spectralFlux.length);

    // Sum across frequency bins
    for (let frame = 0; frame < spectralFlux.length; frame++) {
      summedFlux[frame] = spectralFlux[frame].reduce((sum, val) => sum + val, 0);
    }

    // Find peaks using adaptive threshold
    const windowSize = Math.floor(this.config.sampleRate / this.config.hopSize * 0.1); // 100ms window
    
    for (let i = windowSize; i < summedFlux.length - windowSize; i++) {
      const current = summedFlux[i];
      
      // Calculate local mean and standard deviation
      let sum = 0;
      let sumSquares = 0;
      for (let j = i - windowSize; j <= i + windowSize; j++) {
        sum += summedFlux[j];
        sumSquares += summedFlux[j] * summedFlux[j];
      }
      
      const mean = sum / (2 * windowSize + 1);
      const variance = sumSquares / (2 * windowSize + 1) - mean * mean;
      const stdDev = Math.sqrt(variance);
      
      // Adaptive threshold
      const threshold = mean + stdDev * (1 + this.config.sensitivity);
      
      // Check if current value is a peak
      if (current > threshold && 
          current > summedFlux[i - 1] && 
          current > summedFlux[i + 1]) {
        onsets.push(i);
      }
    }

    return onsets;
  }

  /**
   * Calculate beat strength at onset
   */
  private calculateBeatStrength(spectralFlux: Float32Array[], onsetIndex: number): number {
    if (onsetIndex >= spectralFlux.length) return 0;
    
    const flux = spectralFlux[onsetIndex];
    const sum = flux.reduce((acc, val) => acc + val, 0);
    const max = Math.max(...flux);
    
    // Normalize strength between 0 and 1
    return Math.min(1, (sum + max) / (flux.length * 2));
  }

  /**
   * Classify beat type based on frequency content
   */
  private classifyBeatType(audioData: Float32Array, onsetIndex: number): 'kick' | 'snare' | 'hihat' | 'bass' {
    // Simplified classification based on frequency ranges
    // In a real implementation, this would use more sophisticated ML techniques
    
    const start = onsetIndex * this.config.hopSize;
    const end = Math.min(start + this.config.fftSize, audioData.length);
    const segment = audioData.slice(start, end);
    
    // Calculate energy in different frequency bands
    const spectrum = this.calculateFFT(segment);
    const bassEnergy = this.calculateBandEnergy(spectrum, 20, 250);
    const midEnergy = this.calculateBandEnergy(spectrum, 250, 4000);
    const highEnergy = this.calculateBandEnergy(spectrum, 4000, 20000);
    
    const total = bassEnergy + midEnergy + highEnergy;
    
    if (bassEnergy / total > 0.6) return 'kick';
    if (midEnergy / total > 0.5) return 'snare';
    if (highEnergy / total > 0.4) return 'hihat';
    return 'bass';
  }

  /**
   * Calculate energy in frequency band
   */
  private calculateBandEnergy(spectrum: Float32Array, lowFreq: number, highFreq: number): number {
    const sampleRate = this.config.sampleRate;
    const lowBin = Math.floor(lowFreq * spectrum.length * 2 / sampleRate);
    const highBin = Math.floor(highFreq * spectrum.length * 2 / sampleRate);
    
    let energy = 0;
    for (let i = lowBin; i <= highBin && i < spectrum.length; i++) {
      energy += spectrum[i] * spectrum[i];
    }
    
    return energy;
  }

  /**
   * Calculate BPM from detected beats
   */
  private calculateBPM(beats: BeatMarker[]): number {
    if (beats.length < 2) return 120; // Default BPM

    // Calculate intervals between beats
    const intervals: number[] = [];
    for (let i = 1; i < beats.length; i++) {
      intervals.push(beats[i].time - beats[i - 1].time);
    }

    // Find most common interval (mode)
    const intervalCounts = new Map<number, number>();
    const tolerance = 0.05; // 50ms tolerance

    for (const interval of intervals) {
      const roundedInterval = Math.round(interval / tolerance) * tolerance;
      intervalCounts.set(roundedInterval, (intervalCounts.get(roundedInterval) || 0) + 1);
    }

    let mostCommonInterval = 0.5; // Default to 120 BPM
    let maxCount = 0;

    for (const [interval, count] of intervalCounts) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonInterval = interval;
      }
    }

    const bpm = 60 / mostCommonInterval;
    return Math.max(this.config.minBPM, Math.min(this.config.maxBPM, bpm));
  }

  /**
   * Calculate energy levels over time
   */
  private calculateEnergyLevels(audioBuffer: AudioBuffer): number[] {
    const channelData = audioBuffer.getChannelData(0);
    const windowSize = Math.floor(this.config.sampleRate * 0.1); // 100ms windows
    const energy: number[] = [];

    for (let i = 0; i < channelData.length; i += windowSize) {
      const end = Math.min(i + windowSize, channelData.length);
      let sum = 0;
      
      for (let j = i; j < end; j++) {
        sum += channelData[j] * channelData[j];
      }
      
      energy.push(Math.sqrt(sum / (end - i)));
    }

    return energy;
  }

  /**
   * Calculate spectral centroid over time
   */
  private calculateSpectralCentroid(audioBuffer: AudioBuffer): number[] {
    const channelData = audioBuffer.getChannelData(0);
    const windowSize = this.config.fftSize;
    const hopSize = this.config.hopSize;
    const centroids: number[] = [];

    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const frame = channelData.slice(i, i + windowSize);
      const windowed = this.applyHanningWindow(frame);
      const spectrum = this.calculateFFT(windowed);
      
      let numerator = 0;
      let denominator = 0;
      
      for (let k = 0; k < spectrum.length; k++) {
        const frequency = k * this.config.sampleRate / (2 * spectrum.length);
        numerator += frequency * spectrum[k];
        denominator += spectrum[k];
      }
      
      const centroid = denominator > 0 ? numerator / denominator : 0;
      centroids.push(centroid);
    }

    return centroids;
  }
}

/**
 * Beat Synchronization Utilities
 */
export class BeatSynchronizer {
  /**
   * Find optimal transition points synchronized to beats
   */
  static findBeatSyncedTransitions(
    beats: BeatMarker[],
    sceneDurations: number[],
    options: Partial<BeatSyncOptions> = {}
  ): number[] {
    const config: BeatSyncOptions = {
      snapTolerance: 0.1,
      preferStrongBeats: true,
      beatTypes: ['kick', 'snare'],
      minInterval: 2.0,
      ...options,
    };

    const transitionPoints: number[] = [];
    let currentTime = 0;

    for (let i = 0; i < sceneDurations.length - 1; i++) {
      currentTime += sceneDurations[i];
      
      // Find nearest beat to the natural transition point
      const nearestBeat = this.findNearestBeat(beats, currentTime, config);
      
      if (nearestBeat) {
        transitionPoints.push(nearestBeat.time);
        currentTime = nearestBeat.time;
      } else {
        transitionPoints.push(currentTime);
      }
    }

    return transitionPoints;
  }

  /**
   * Find nearest suitable beat to a target time
   */
  private static findNearestBeat(
    beats: BeatMarker[],
    targetTime: number,
    config: BeatSyncOptions
  ): BeatMarker | null {
    const candidates = beats.filter(beat => {
      const timeDiff = Math.abs(beat.time - targetTime);
      const typeMatch = config.beatTypes.includes(beat.type);
      const strengthOk = !config.preferStrongBeats || beat.strength > 0.5;
      
      return timeDiff <= config.snapTolerance && typeMatch && strengthOk;
    });

    if (candidates.length === 0) return null;

    // Sort by distance to target time, then by strength
    candidates.sort((a, b) => {
      const distA = Math.abs(a.time - targetTime);
      const distB = Math.abs(b.time - targetTime);
      
      if (Math.abs(distA - distB) < 0.01) {
        return b.strength - a.strength; // Prefer stronger beats
      }
      
      return distA - distB; // Prefer closer beats
    });

    return candidates[0];
  }

  /**
   * Adjust transition timing to match beat grid
   */
  static snapToBeats(
    transitionTimes: number[],
    beats: BeatMarker[],
    tolerance: number = 0.1
  ): number[] {
    return transitionTimes.map(time => {
      const nearestBeat = beats.find(beat => 
        Math.abs(beat.time - time) <= tolerance
      );
      
      return nearestBeat ? nearestBeat.time : time;
    });
  }
}

// Export singleton instance
export const beatDetector = new BeatDetector();
