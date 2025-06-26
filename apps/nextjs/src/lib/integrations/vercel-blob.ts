// Vercel Blob Storage Integration for AEON Video Assets
import { put, del, list, head } from '@vercel/blob';

export class VercelBlobStorage {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = process.env.BLOB_READ_WRITE_TOKEN ? 'https://blob.vercel-storage.com' : '';
  }

  async uploadVideo(
    file: File | Buffer,
    filename: string,
    metadata?: VideoMetadata
  ): Promise<UploadResult> {
    try {
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: true,
        contentType: 'video/mp4',
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      });

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        metadata
      };
    } catch (error) {
      console.error('Video upload error:', error);
      throw new Error(`Failed to upload video: ${error}`);
    }
  }

  async uploadImage(
    file: File | Buffer,
    filename: string,
    metadata?: ImageMetadata
  ): Promise<UploadResult> {
    try {
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: true,
        contentType: this.getImageContentType(filename),
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      });

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        metadata
      };
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error(`Failed to upload image: ${error}`);
    }
  }

  async uploadAudio(
    file: File | Buffer,
    filename: string,
    metadata?: AudioMetadata
  ): Promise<UploadResult> {
    try {
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: true,
        contentType: this.getAudioContentType(filename),
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      });

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        metadata
      };
    } catch (error) {
      console.error('Audio upload error:', error);
      throw new Error(`Failed to upload audio: ${error}`);
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      await del(url);
    } catch (error) {
      console.error('File deletion error:', error);
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  async listFiles(options?: ListOptions): Promise<BlobFile[]> {
    try {
      const result = await list(options);
      return result.blobs.map(blob => ({
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        metadata: blob.metadata ? JSON.parse(blob.metadata) : undefined
      }));
    } catch (error) {
      console.error('File listing error:', error);
      throw new Error(`Failed to list files: ${error}`);
    }
  }

  async getFileInfo(url: string): Promise<BlobFile | null> {
    try {
      const info = await head(url);
      return {
        url: info.url,
        pathname: info.pathname,
        size: info.size,
        uploadedAt: info.uploadedAt,
        metadata: info.metadata ? JSON.parse(info.metadata) : undefined
      };
    } catch (error) {
      console.error('File info error:', error);
      return null;
    }
  }

  async uploadFromUrl(
    sourceUrl: string,
    filename: string,
    contentType: string,
    metadata?: any
  ): Promise<UploadResult> {
    try {
      // Fetch the file from the source URL
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch from URL: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      const file = new Uint8Array(buffer);

      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: true,
        contentType,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      });

      return {
        url: blob.url,
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        metadata
      };
    } catch (error) {
      console.error('Upload from URL error:', error);
      throw new Error(`Failed to upload from URL: ${error}`);
    }
  }

  async createVideoThumbnail(videoUrl: string, timestamp: number = 0): Promise<UploadResult> {
    // This would require a video processing service or edge function
    // For now, return a placeholder implementation
    throw new Error('Video thumbnail generation not implemented yet');
  }

  async getStorageUsage(): Promise<StorageUsage> {
    try {
      const files = await this.listFiles();
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const videoFiles = files.filter(file => file.pathname.includes('.mp4'));
      const imageFiles = files.filter(file => 
        file.pathname.includes('.jpg') || 
        file.pathname.includes('.png') || 
        file.pathname.includes('.webp')
      );

      return {
        totalFiles: files.length,
        totalSize,
        videoFiles: videoFiles.length,
        imageFiles: imageFiles.length,
        videoSize: videoFiles.reduce((sum, file) => sum + file.size, 0),
        imageSize: imageFiles.reduce((sum, file) => sum + file.size, 0),
      };
    } catch (error) {
      console.error('Storage usage error:', error);
      throw new Error(`Failed to get storage usage: ${error}`);
    }
  }

  private getImageContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const types: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'webp': 'image/webp',
      'gif': 'image/gif',
      'svg': 'image/svg+xml'
    };
    return types[ext || ''] || 'image/jpeg';
  }

  private getAudioContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const types: Record<string, string> = {
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'aac': 'audio/aac',
      'm4a': 'audio/mp4'
    };
    return types[ext || ''] || 'audio/mpeg';
  }
}

// Types
export interface VideoMetadata {
  projectId?: string;
  agentId?: string;
  duration?: number;
  resolution?: string;
  fps?: number;
  title?: string;
  description?: string;
  tags?: string[];
}

export interface ImageMetadata {
  projectId?: string;
  agentId?: string;
  width?: number;
  height?: number;
  title?: string;
  description?: string;
  tags?: string[];
}

export interface AudioMetadata {
  projectId?: string;
  agentId?: string;
  duration?: number;
  bitrate?: number;
  title?: string;
  description?: string;
  tags?: string[];
}

export interface UploadResult {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
  metadata?: any;
}

export interface BlobFile {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
  metadata?: any;
}

export interface ListOptions {
  prefix?: string;
  limit?: number;
  cursor?: string;
}

export interface StorageUsage {
  totalFiles: number;
  totalSize: number;
  videoFiles: number;
  imageFiles: number;
  videoSize: number;
  imageSize: number;
}

// Export singleton instance
export const blobStorage = new VercelBlobStorage();
