/**
 * AEON Video Models Configuration
 * Defines all supported video generation models with their API schemas and capabilities
 */

export interface VideoModel {
  name: string;
  label: string;
  duration: number;
  price: number;
  fields: string[];
  docs: string;
  provider: 'replicate';
  maxResolution?: string;
  aspectRatios?: string[];
  defaultParams?: Record<string, any>;
}

export const videoModels: VideoModel[] = [
  {
    name: "minimax/video-01",
    label: "MiniMax Video 01",
    duration: 6,
    price: 0.5,
    fields: ["prompt", "first_frame_image", "subject_reference", "prompt_optimizer"],
    docs: "https://replicate.com/minimax/video-01",
    provider: "replicate",
    maxResolution: "1280x720",
    aspectRatios: ["16:9", "9:16", "1:1"],
    defaultParams: {
      prompt_optimizer: true
    }
  },
  {
    name: "minimax/video-01-director",
    label: "MiniMax Director",
    duration: 6,
    price: 0.5,
    fields: ["prompt", "first_frame_image", "prompt_optimizer"],
    docs: "https://replicate.com/minimax/video-01-director",
    provider: "replicate",
    maxResolution: "1280x720",
    aspectRatios: ["16:9", "9:16"],
    defaultParams: {
      prompt_optimizer: true
    }
  },
  {
    name: "minimax/video-01-live",
    label: "MiniMax Live",
    duration: 6,
    price: 0.5,
    fields: ["prompt", "first_frame_image", "prompt_optimizer"],
    docs: "https://replicate.com/minimax/video-01-live",
    provider: "replicate",
    maxResolution: "1280x720",
    aspectRatios: ["16:9", "9:16"],
    defaultParams: {
      prompt_optimizer: true
    }
  },
  {
    name: "kwaivgi/kling-v1.6-standard",
    label: "Kling v1.6 Standard",
    duration: 5,
    price: 0.9,
    fields: ["prompt", "negative_prompt", "aspect_ratio", "start_image", "reference_images", "cfg_scale", "duration"],
    docs: "https://replicate.com/kwaii/kling-v1.6-standard",
    provider: "replicate",
    maxResolution: "1920x1080",
    aspectRatios: ["16:9", "9:16", "1:1"],
    defaultParams: {
      aspect_ratio: "16:9",
      cfg_scale: 7.5,
      duration: 5
    }
  },
  {
    name: "wan-video/wan-2.1-1.3b",
    label: "Wan Video 2.1 1.3b",
    duration: 5,
    price: 0.3,
    fields: ["prompt", "aspect_ratio", "frame_num", "resolution", "sample_steps", "sample_guide_scale", "sample_shift", "seed"],
    docs: "https://replicate.com/wan-video/wan-2.1-1.3b",
    provider: "replicate",
    maxResolution: "1024x576",
    aspectRatios: ["16:9", "9:16"],
    defaultParams: {
      aspect_ratio: "16:9",
      frame_num: 120,
      resolution: "1024x576",
      sample_steps: 20,
      sample_guide_scale: 7.5,
      sample_shift: 1.0
    }
  }
];

/**
 * Get model by name
 */
export function getModelByName(name: string): VideoModel | undefined {
  return videoModels.find(model => model.name === name);
}

/**
 * Get default model names for parallel generation
 */
export function getDefaultModelNames(): string[] {
  return videoModels.map(model => model.name);
}

/**
 * Validate model configuration
 */
export function validateModelConfig(modelName: string): boolean {
  const model = getModelByName(modelName);
  if (!model) {
    console.error(`❌ Model not found: ${modelName}`);
    return false;
  }
  
  if (!model.fields.includes('prompt')) {
    console.error(`❌ Model ${modelName} missing required 'prompt' field`);
    return false;
  }
  
  return true;
}

/**
 * Get total estimated cost for parallel generation
 */
export function calculateTotalCost(modelNames: string[], scenesPerAgent: number = 2): number {
  return modelNames.reduce((total, modelName) => {
    const model = getModelByName(modelName);
    return total + (model ? model.price * scenesPerAgent : 0);
  }, 0);
}

/**
 * Get model capabilities summary
 */
export function getModelCapabilities() {
  return videoModels.map(model => ({
    name: model.name,
    label: model.label,
    duration: model.duration,
    price: model.price,
    maxResolution: model.maxResolution,
    aspectRatios: model.aspectRatios,
    fieldCount: model.fields.length
  }));
}
