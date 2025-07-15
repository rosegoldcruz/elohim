/**
 * AEON StorageManager - Handles file storage and management
 * Integrates with Vercel Blob, Supabase Storage, and local filesystem
 */

import { put, del, list } from '@vercel/blob';
import { writeFile, readFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

export interface StorageOptions {
  provider?: 'vercel' | 'local';
  bucket?: string;
  public_access?: boolean;
  content_type?: string;
  metadata?: Record<string, string>;
}

export interface StorageResult {
  success: boolean;
  url: string;
  size: number;
  provider: string;
  metadata?: Record<string, any>;
  error?: string;
}

export interface FileInfo {
  name: string;
  url: string;
  size: number;
  created_at: string;
  content_type: string;
  provider: string;
}

export class StorageManager {
  private readonly defaultOptions: StorageOptions = {
    provider: 'vercel',
    public_access: true,
    content_type: 'application/octet-stream'
  };

  /**
   * Save file to storage
   */
  async saveFile(
    filename: string, 
    data: Buffer | string | Uint8Array, 
    options: StorageOptions = {}
  ): Promise<string> {
    console.log(`💾 StorageManager: Saving ${filename}`);
    
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      const result = await this.saveToProvider(filename, data, opts);
      
      if (result.success) {
        console.log(`✅ StorageManager: File saved successfully to ${result.provider}`);
        return result.url;
      } else {
        throw new Error(result.error || 'File save failed');
      }
      
    } catch (error) {
      console.error('❌ StorageManager error:', error);
      
      // Fallback to local storage
      if (opts.provider !== 'local') {
        console.log('🔄 StorageManager: Trying local fallback...');
        return this.saveToLocal(filename, data);
      }
      
      throw error;
    }
  }

  /**
   * Save multiple files in batch
   */
  async saveFiles(
    files: Array<{ filename: string; data: Buffer | string; options?: StorageOptions }>,
    options: StorageOptions = {}
  ): Promise<string[]> {
    console.log(`📦 StorageManager: Batch saving ${files.length} files`);
    
    const results: string[] = [];
    const errors: string[] = [];
    
    for (const file of files) {
      try {
        const url = await this.saveFile(file.filename, file.data, { ...options, ...file.options });
        results.push(url);
      } catch (error) {
        console.error(`Failed to save ${file.filename}:`, error);
        errors.push(`${file.filename}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    if (errors.length > 0) {
      console.warn(`⚠️ StorageManager: ${errors.length} files failed to save:`, errors);
    }
    
    return results;
  }

  /**
   * Delete file from storage
   */
  async deleteFile(url: string, provider?: 'vercel' | 'supabase' | 'local'): Promise<boolean> {
    console.log(`🗑️ StorageManager: Deleting file from ${provider || 'auto-detect'}`);
    
    try {
      if (!provider) {
        provider = this.detectProvider(url);
      }
      
      switch (provider) {
        case 'vercel':
          await del(url);
          break;
        case 'supabase':
          await this.deleteFromSupabase(url);
          break;
        case 'local':
          await this.deleteFromLocal(url);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
      
      console.log(`✅ StorageManager: File deleted successfully`);
      return true;
      
    } catch (error) {
      console.error('❌ StorageManager delete error:', error);
      return false;
    }
  }

  /**
   * List files in storage
   */
  async listFiles(
    prefix?: string, 
    provider: 'vercel' | 'supabase' | 'local' = 'vercel'
  ): Promise<FileInfo[]> {
    console.log(`📋 StorageManager: Listing files from ${provider}`);
    
    try {
      switch (provider) {
        case 'vercel':
          return this.listFromVercel(prefix);
        case 'supabase':
          return this.listFromSupabase(prefix);
        case 'local':
          return this.listFromLocal(prefix);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
      
    } catch (error) {
      console.error('❌ StorageManager list error:', error);
      return [];
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(url: string): Promise<FileInfo | null> {
    try {
      const provider = this.detectProvider(url);
      
      // This would fetch metadata from the respective provider
      return {
        name: path.basename(url),
        url,
        size: 0, // Would be fetched from provider
        created_at: new Date().toISOString(),
        content_type: 'application/octet-stream',
        provider
      };
      
    } catch (error) {
      console.error('Failed to get file info:', error);
      return null;
    }
  }

  /**
   * Save to specific provider
   */
  private async saveToProvider(
    filename: string,
    data: Buffer | string | Uint8Array,
    options: StorageOptions
  ): Promise<StorageResult> {
    
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
    
    switch (options.provider) {
      case 'vercel':
        return this.saveToVercel(filename, buffer, options);
      case 'supabase':
        return this.saveToSupabase(filename, buffer, options);
      case 'local':
        return this.saveToLocalStorage(filename, buffer, options);
      default:
        throw new Error(`Unsupported provider: ${options.provider}`);
    }
  }

  /**
   * Save to Vercel Blob
   */
  private async saveToVercel(
    filename: string,
    data: Buffer,
    options: StorageOptions
  ): Promise<StorageResult> {
    try {
      const blob = await put(filename, data, {
        access: options.public_access ? 'public' : 'private',
        contentType: options.content_type,
        addRandomSuffix: false
      });
      
      return {
        success: true,
        url: blob.url,
        size: data.length,
        provider: 'vercel',
        metadata: {
          downloadUrl: blob.downloadUrl,
          pathname: blob.pathname
        }
      };
      
    } catch (error) {
      return {
        success: false,
        url: '',
        size: 0,
        provider: 'vercel',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Supabase storage removed - use Vercel Blob or local storage
   */
  private async saveToSupabase(
    filename: string,
    data: Buffer,
    options: StorageOptions
  ): Promise<StorageResult> {
    return {
      success: false,
      url: '',
      size: 0,
      provider: 'supabase',
      error: 'Supabase storage removed - use Vercel Blob or local storage'
    };
  }

  /**
   * Save to local storage
   */
  private async saveToLocalStorage(
    filename: string,
    data: Buffer,
    options: StorageOptions
  ): Promise<StorageResult> {
    try {
      const outputDir = path.resolve(process.cwd(), 'output');
      await mkdir(outputDir, { recursive: true });
      
      const filePath = path.join(outputDir, filename);
      await writeFile(filePath, data);
      
      return {
        success: true,
        url: `/output/${filename}`,
        size: data.length,
        provider: 'local',
        metadata: {
          path: filePath
        }
      };
      
    } catch (error) {
      return {
        success: false,
        url: '',
        size: 0,
        provider: 'local',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Save to local (simple version)
   */
  private async saveToLocal(filename: string, data: Buffer | string): Promise<string> {
    const outputDir = path.resolve(process.cwd(), 'output');
    await mkdir(outputDir, { recursive: true });
    
    const filePath = path.join(outputDir, filename);
    await writeFile(filePath, data);
    
    return `/output/${filename}`;
  }

  /**
   * Supabase storage removed - use Vercel Blob or local storage
   */
  private async deleteFromSupabase(url: string): Promise<void> {
    throw new Error('Supabase storage removed - use Vercel Blob or local storage');
  }

  /**
   * Delete from local storage
   */
  private async deleteFromLocal(url: string): Promise<void> {
    const filename = path.basename(url);
    const filePath = path.resolve(process.cwd(), 'output', filename);
    
    await unlink(filePath);
  }

  /**
   * List files from Vercel Blob
   */
  private async listFromVercel(prefix?: string): Promise<FileInfo[]> {
    const { blobs } = await list({ prefix });
    
    return blobs.map(blob => ({
      name: blob.pathname,
      url: blob.url,
      size: blob.size,
      created_at: blob.uploadedAt.toISOString(),
      content_type: blob.contentType || 'application/octet-stream',
      provider: 'vercel'
    }));
  }

  /**
   * Supabase storage removed - use Vercel Blob or local storage
   */
  private async listFromSupabase(prefix?: string): Promise<FileInfo[]> {
    return [];
  }

  /**
   * List files from local storage
   */
  private async listFromLocal(prefix?: string): Promise<FileInfo[]> {
    // This would implement local file listing
    return [];
  }

  /**
   * Detect storage provider from URL
   */
  private detectProvider(url: string): 'vercel' | 'local' {
    if (url.includes('blob.vercel-storage.com')) {
      return 'vercel';
    } else {
      return 'local';
    }
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    total_files: number;
    total_size: number;
    by_provider: Record<string, { files: number; size: number }>;
  }> {
    const providers = ['vercel', 'local'] as const;
    const stats = {
      total_files: 0,
      total_size: 0,
      by_provider: {} as Record<string, { files: number; size: number }>
    };
    
    for (const provider of providers) {
      try {
        const files = await this.listFiles(undefined, provider);
        const providerStats = {
          files: files.length,
          size: files.reduce((sum, file) => sum + file.size, 0)
        };
        
        stats.by_provider[provider] = providerStats;
        stats.total_files += providerStats.files;
        stats.total_size += providerStats.size;
        
      } catch (error) {
        console.error(`Failed to get stats for ${provider}:`, error);
        stats.by_provider[provider] = { files: 0, size: 0 };
      }
    }
    
    return stats;
  }
}
