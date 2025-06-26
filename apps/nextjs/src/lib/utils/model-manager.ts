// Model Manager Utility for AEON Platform
// Handles dynamic model switching and configuration

export type LLMMode = 'local' | 'openai' | 'claude' | 'replicate';

export interface ModelConfig {
  mode: LLMMode;
  label: string;
  description: string;
  icon: string;
  requiresApiKey?: boolean;
  requiresLocalService?: boolean;
}

export const AVAILABLE_MODELS: Record<LLMMode, ModelConfig> = {
  local: {
    mode: 'local',
    label: 'Local Model',
    description: 'Docker Model Runner on your machine',
    icon: 'Server',
    requiresLocalService: true,
  },
  openai: {
    mode: 'openai',
    label: 'OpenAI',
    description: 'GPT models via OpenAI API',
    icon: 'Zap',
    requiresApiKey: true,
  },
  claude: {
    mode: 'claude',
    label: 'Claude',
    description: 'Anthropic Claude models',
    icon: 'Brain',
    requiresApiKey: true,
  },
  replicate: {
    mode: 'replicate',
    label: 'Replicate',
    description: 'Open-source models via Replicate',
    icon: 'Repeat',
    requiresApiKey: true,
  },
};

/**
 * Model Manager class for handling LLM mode switching
 */
export class ModelManager {
  private static instance: ModelManager;
  private currentMode: LLMMode;
  private listeners: Array<(mode: LLMMode) => void> = [];

  private constructor() {
    this.currentMode = this.loadCurrentMode();
  }

  public static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  /**
   * Load current model mode from localStorage or environment
   */
  private loadCurrentMode(): LLMMode {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aeon-llm-mode') as LLMMode;
      if (saved && Object.keys(AVAILABLE_MODELS).includes(saved)) {
        return saved;
      }
    }
    
    // Fallback to environment variable or default
    const envMode = process.env.LLM_MODE as LLMMode;
    return envMode && Object.keys(AVAILABLE_MODELS).includes(envMode) ? envMode : 'openai';
  }

  /**
   * Get current model mode
   */
  public getCurrentMode(): LLMMode {
    return this.currentMode;
  }

  /**
   * Get current model configuration
   */
  public getCurrentConfig(): ModelConfig {
    return AVAILABLE_MODELS[this.currentMode];
  }

  /**
   * Switch to a new model mode
   */
  public async switchMode(newMode: LLMMode): Promise<void> {
    if (!Object.keys(AVAILABLE_MODELS).includes(newMode)) {
      throw new Error(`Invalid model mode: ${newMode}`);
    }

    const oldMode = this.currentMode;
    this.currentMode = newMode;

    try {
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('aeon-llm-mode', newMode);
      }

      // Update environment variable for current session
      if (typeof process !== 'undefined' && process.env) {
        process.env.LLM_MODE = newMode;
      }

      // Notify listeners
      this.notifyListeners(newMode);

      console.log(`Model switched from ${oldMode} to ${newMode}`);
    } catch (error) {
      // Rollback on error
      this.currentMode = oldMode;
      throw new Error(`Failed to switch model: ${error}`);
    }
  }

  /**
   * Add a listener for model changes
   */
  public addListener(callback: (mode: LLMMode) => void): void {
    this.listeners.push(callback);
  }

  /**
   * Remove a listener
   */
  public removeListener(callback: (mode: LLMMode) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notify all listeners of mode change
   */
  private notifyListeners(mode: LLMMode): void {
    this.listeners.forEach(callback => {
      try {
        callback(mode);
      } catch (error) {
        console.error('Error in model change listener:', error);
      }
    });
  }

  /**
   * Get all available models
   */
  public getAvailableModels(): ModelConfig[] {
    return Object.values(AVAILABLE_MODELS);
  }

  /**
   * Check if a model is available (for local models, check if service is running)
   */
  public async isModelAvailable(mode: LLMMode): Promise<boolean> {
    const config = AVAILABLE_MODELS[mode];
    
    if (config.requiresLocalService && mode === 'local') {
      try {
        const { isLocalLLMAvailable } = await import('../integrations/local-llm');
        return await isLocalLLMAvailable();
      } catch {
        return false;
      }
    }

    // For API-based models, assume available if API key is configured
    if (config.requiresApiKey) {
      // TODO: Add API key validation logic here
      return true;
    }

    return true;
  }

  /**
   * Get model status for UI display
   */
  public async getModelStatus(mode?: LLMMode): Promise<{
    mode: LLMMode;
    config: ModelConfig;
    available: boolean;
    status: string;
  }> {
    const targetMode = mode || this.currentMode;
    const config = AVAILABLE_MODELS[targetMode];
    const available = await this.isModelAvailable(targetMode);

    let status = 'Unknown';
    if (available) {
      status = targetMode === 'local' ? 'Connected' : 'Active';
    } else {
      status = targetMode === 'local' ? 'Offline' : 'Unavailable';
    }

    return {
      mode: targetMode,
      config,
      available,
      status,
    };
  }
}

// Export singleton instance
export const modelManager = ModelManager.getInstance();

/**
 * React hook for using model manager
 * Note: This should be moved to a separate hooks file in a real implementation
 */
export function createModelManagerHook() {
  return function useModelManager() {
    // This will be implemented when React is available
    // For now, return the basic manager functions
    return {
      currentMode: modelManager.getCurrentMode(),
      switchMode: (mode: LLMMode) => modelManager.switchMode(mode),
      getCurrentConfig: () => modelManager.getCurrentConfig(),
      getAvailableModels: () => modelManager.getAvailableModels(),
      isModelAvailable: (mode: LLMMode) => modelManager.isModelAvailable(mode),
      getModelStatus: (mode?: LLMMode) => modelManager.getModelStatus(mode),
    };
  };
}
