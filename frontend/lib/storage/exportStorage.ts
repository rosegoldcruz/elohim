/**
 * AEON Export Storage System
 * Handles file storage for exports with S3 integration, local fallback,
 * and secure access controls for compliance and audit requirements
 */

// Only import server-side modules when not in browser
let S3Client: any = null
let PutObjectCommand: any = null
let GetObjectCommand: any = null
let DeleteObjectCommand: any = null
let ListObjectsV2Command: any = null
let getSignedUrl: any = null
let fs: any = null
let path: any = null
let crypto: any = null

if (typeof window === 'undefined') {
  const s3 = require('@aws-sdk/client-s3')
  const presigner = require('@aws-sdk/s3-request-presigner')
  S3Client = s3.S3Client
  PutObjectCommand = s3.PutObjectCommand
  GetObjectCommand = s3.GetObjectCommand
  DeleteObjectCommand = s3.DeleteObjectCommand
  ListObjectsV2Command = s3.ListObjectsV2Command
  getSignedUrl = presigner.getSignedUrl
  fs = require('fs/promises')
  path = require('path')
  crypto = require('crypto')
}

export interface StorageConfig {
  provider: 'local' | 's3' | 'both'
  localPath: string
  s3Config?: {
    bucket: string
    region: string
    accessKeyId: string
    secretAccessKey: string
    endpoint?: string
  }
  encryption: boolean
  retentionDays: number
}

export interface StoredFile {
  id: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  storage: 'local' | 's3' | 'both'
  localPath?: string
  s3Key?: string
  encrypted: boolean
  uploadedAt: string
  expiresAt?: string
  downloadCount: number
  lastAccessed?: string
}

export interface UploadResult {
  success: boolean
  file?: StoredFile
  error?: string
}

export interface DownloadResult {
  success: boolean
  data?: Buffer | string
  url?: string
  error?: string
}

export class ExportStorage {
  private s3Client?: S3Client
  private config: StorageConfig
  private encryptionKey: string

  constructor() {
    // Only initialize on server side
    if (typeof window === 'undefined') {
      this.config = this.loadConfig()
      this.encryptionKey = process.env.EXPORT_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')

      if (this.config.provider === 's3' || this.config.provider === 'both') {
        this.initializeS3()
      }

      this.ensureLocalDirectory()
    }
  }

  /**
   * Load storage configuration from environment
   */
  private loadConfig(): StorageConfig {
    return {
      provider: (process.env.EXPORT_STORAGE_PROVIDER as 'local' | 's3' | 'both') || 'local',
      localPath: process.env.EXPORT_LOCAL_PATH || './exports',
      s3Config: process.env.AWS_S3_BUCKET ? {
        bucket: process.env.AWS_S3_BUCKET,
        region: process.env.AWS_REGION || 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        endpoint: process.env.AWS_S3_ENDPOINT
      } : undefined,
      encryption: process.env.EXPORT_ENCRYPTION === 'true',
      retentionDays: parseInt(process.env.EXPORT_RETENTION_DAYS || '90')
    }
  }

  /**
   * Initialize S3 client
   */
  private initializeS3(): void {
    if (!this.config.s3Config) {
      console.warn('S3 configuration missing, falling back to local storage')
      return
    }

    this.s3Client = new S3Client({
      region: this.config.s3Config.region,
      credentials: {
        accessKeyId: this.config.s3Config.accessKeyId,
        secretAccessKey: this.config.s3Config.secretAccessKey
      },
      endpoint: this.config.s3Config.endpoint
    })

    console.log('✅ S3 client initialized')
  }

  /**
   * Ensure local export directory exists
   */
  private async ensureLocalDirectory(): Promise<void> {
    try {
      await fs.access(this.config.localPath)
    } catch {
      await fs.mkdir(this.config.localPath, { recursive: true })
      console.log(`📁 Created export directory: ${this.config.localPath}`)
    }
  }

  /**
   * Store export file with optional encryption
   */
  async storeFile(
    filename: string,
    data: Buffer | string,
    mimeType: string = 'application/octet-stream'
  ): Promise<UploadResult> {
    try {
      const fileId = crypto.randomUUID()
      const sanitizedFilename = this.sanitizeFilename(filename)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const storedFilename = `${timestamp}_${sanitizedFilename}`

      let fileData = Buffer.isBuffer(data) ? data : Buffer.from(data)
      let encrypted = false

      // Encrypt if enabled
      if (this.config.encryption) {
        fileData = this.encryptData(fileData)
        encrypted = true
      }

      const storedFile: StoredFile = {
        id: fileId,
        filename: storedFilename,
        originalName: filename,
        size: fileData.length,
        mimeType,
        storage: this.config.provider,
        encrypted,
        uploadedAt: new Date().toISOString(),
        expiresAt: this.calculateExpiryDate(),
        downloadCount: 0
      }

      // Store locally
      if (this.config.provider === 'local' || this.config.provider === 'both') {
        const localPath = path.join(this.config.localPath, storedFilename)
        await fs.writeFile(localPath, fileData)
        storedFile.localPath = localPath
        console.log(`💾 File stored locally: ${localPath}`)
      }

      // Store in S3
      if ((this.config.provider === 's3' || this.config.provider === 'both') && this.s3Client && this.config.s3Config) {
        const s3Key = `exports/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${storedFilename}`
        
        await this.s3Client.send(new PutObjectCommand({
          Bucket: this.config.s3Config.bucket,
          Key: s3Key,
          Body: fileData,
          ContentType: mimeType,
          Metadata: {
            originalName: filename,
            fileId: fileId,
            encrypted: encrypted.toString(),
            uploadedAt: storedFile.uploadedAt
          }
        }))

        storedFile.s3Key = s3Key
        console.log(`☁️ File stored in S3: ${s3Key}`)
      }

      return {
        success: true,
        file: storedFile
      }

    } catch (error) {
      console.error('File storage failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Storage failed'
      }
    }
  }

  /**
   * Retrieve stored file
   */
  async retrieveFile(fileId: string, storedFile: StoredFile): Promise<DownloadResult> {
    try {
      let fileData: Buffer | null = null

      // Try local storage first
      if (storedFile.localPath && (this.config.provider === 'local' || this.config.provider === 'both')) {
        try {
          fileData = await fs.readFile(storedFile.localPath)
          console.log(`📁 File retrieved from local storage: ${storedFile.localPath}`)
        } catch (error) {
          console.warn('Local file not found, trying S3...')
        }
      }

      // Try S3 if local failed or S3-only
      if (!fileData && storedFile.s3Key && this.s3Client && this.config.s3Config) {
        try {
          const response = await this.s3Client.send(new GetObjectCommand({
            Bucket: this.config.s3Config.bucket,
            Key: storedFile.s3Key
          }))

          if (response.Body) {
            const chunks: Uint8Array[] = []
            const reader = response.Body as any
            
            for await (const chunk of reader) {
              chunks.push(chunk)
            }
            
            fileData = Buffer.concat(chunks)
            console.log(`☁️ File retrieved from S3: ${storedFile.s3Key}`)
          }
        } catch (error) {
          console.error('S3 retrieval failed:', error)
        }
      }

      if (!fileData) {
        return {
          success: false,
          error: 'File not found in any storage location'
        }
      }

      // Decrypt if necessary
      if (storedFile.encrypted) {
        fileData = this.decryptData(fileData)
      }

      // Update access tracking
      storedFile.downloadCount++
      storedFile.lastAccessed = new Date().toISOString()

      return {
        success: true,
        data: fileData
      }

    } catch (error) {
      console.error('File retrieval failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Retrieval failed'
      }
    }
  }

  /**
   * Generate secure download URL (for S3)
   */
  async generateDownloadUrl(storedFile: StoredFile, expiresIn: number = 3600): Promise<DownloadResult> {
    try {
      if (!storedFile.s3Key || !this.s3Client || !this.config.s3Config) {
        return {
          success: false,
          error: 'S3 not configured or file not in S3'
        }
      }

      const command = new GetObjectCommand({
        Bucket: this.config.s3Config.bucket,
        Key: storedFile.s3Key
      })

      const url = await getSignedUrl(this.s3Client, command, { expiresIn })

      return {
        success: true,
        url
      }

    } catch (error) {
      console.error('URL generation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'URL generation failed'
      }
    }
  }

  /**
   * Delete stored file
   */
  async deleteFile(storedFile: StoredFile): Promise<boolean> {
    try {
      let deletedFromLocal = false
      let deletedFromS3 = false

      // Delete from local storage
      if (storedFile.localPath) {
        try {
          await fs.unlink(storedFile.localPath)
          deletedFromLocal = true
          console.log(`🗑️ File deleted from local storage: ${storedFile.localPath}`)
        } catch (error) {
          console.warn('Local file deletion failed:', error)
        }
      }

      // Delete from S3
      if (storedFile.s3Key && this.s3Client && this.config.s3Config) {
        try {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: this.config.s3Config.bucket,
            Key: storedFile.s3Key
          }))
          deletedFromS3 = true
          console.log(`☁️ File deleted from S3: ${storedFile.s3Key}`)
        } catch (error) {
          console.warn('S3 file deletion failed:', error)
        }
      }

      return deletedFromLocal || deletedFromS3

    } catch (error) {
      console.error('File deletion failed:', error)
      return false
    }
  }

  /**
   * Clean up expired files
   */
  async cleanupExpiredFiles(): Promise<{ deleted: number; errors: number }> {
    let deleted = 0
    let errors = 0

    try {
      const now = new Date()

      // Clean up local files
      if (this.config.provider === 'local' || this.config.provider === 'both') {
        try {
          const files = await fs.readdir(this.config.localPath)
          
          for (const file of files) {
            const filePath = path.join(this.config.localPath, file)
            const stats = await fs.stat(filePath)
            const ageInDays = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24)
            
            if (ageInDays > this.config.retentionDays) {
              await fs.unlink(filePath)
              deleted++
              console.log(`🗑️ Cleaned up expired local file: ${file}`)
            }
          }
        } catch (error) {
          console.error('Local cleanup failed:', error)
          errors++
        }
      }

      // Clean up S3 files
      if ((this.config.provider === 's3' || this.config.provider === 'both') && this.s3Client && this.config.s3Config) {
        try {
          const listResponse = await this.s3Client.send(new ListObjectsV2Command({
            Bucket: this.config.s3Config.bucket,
            Prefix: 'exports/'
          }))

          if (listResponse.Contents) {
            for (const object of listResponse.Contents) {
              if (object.Key && object.LastModified) {
                const ageInDays = (now.getTime() - object.LastModified.getTime()) / (1000 * 60 * 60 * 24)
                
                if (ageInDays > this.config.retentionDays) {
                  await this.s3Client.send(new DeleteObjectCommand({
                    Bucket: this.config.s3Config.bucket,
                    Key: object.Key
                  }))
                  deleted++
                  console.log(`☁️ Cleaned up expired S3 file: ${object.Key}`)
                }
              }
            }
          }
        } catch (error) {
          console.error('S3 cleanup failed:', error)
          errors++
        }
      }

    } catch (error) {
      console.error('Cleanup operation failed:', error)
      errors++
    }

    console.log(`🧹 Cleanup complete: ${deleted} files deleted, ${errors} errors`)
    return { deleted, errors }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    local: { files: number; size: number }
    s3: { files: number; size: number }
    total: { files: number; size: number }
  }> {
    const stats = {
      local: { files: 0, size: 0 },
      s3: { files: 0, size: 0 },
      total: { files: 0, size: 0 }
    }

    try {
      // Local storage stats
      if (this.config.provider === 'local' || this.config.provider === 'both') {
        const files = await fs.readdir(this.config.localPath)
        stats.local.files = files.length
        
        for (const file of files) {
          const filePath = path.join(this.config.localPath, file)
          const fileStats = await fs.stat(filePath)
          stats.local.size += fileStats.size
        }
      }

      // S3 storage stats
      if ((this.config.provider === 's3' || this.config.provider === 'both') && this.s3Client && this.config.s3Config) {
        const listResponse = await this.s3Client.send(new ListObjectsV2Command({
          Bucket: this.config.s3Config.bucket,
          Prefix: 'exports/'
        }))

        if (listResponse.Contents) {
          stats.s3.files = listResponse.Contents.length
          stats.s3.size = listResponse.Contents.reduce((total, obj) => total + (obj.Size || 0), 0)
        }
      }

      // Calculate totals (avoid double counting for 'both' provider)
      if (this.config.provider === 'both') {
        stats.total.files = Math.max(stats.local.files, stats.s3.files)
        stats.total.size = Math.max(stats.local.size, stats.s3.size)
      } else {
        stats.total.files = stats.local.files + stats.s3.files
        stats.total.size = stats.local.size + stats.s3.size
      }

    } catch (error) {
      console.error('Failed to get storage stats:', error)
    }

    return stats
  }

  // Helper methods
  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  }

  private calculateExpiryDate(): string {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + this.config.retentionDays)
    return expiryDate.toISOString()
  }

  private encryptData(data: Buffer): Buffer {
    const algorithm = 'aes-256-gcm'
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipher(algorithm, this.encryptionKey)
    
    const encrypted = Buffer.concat([cipher.update(data), cipher.final()])
    return Buffer.concat([iv, encrypted])
  }

  private decryptData(encryptedData: Buffer): Buffer {
    const algorithm = 'aes-256-gcm'
    const iv = encryptedData.slice(0, 16)
    const encrypted = encryptedData.slice(16)
    const decipher = crypto.createDecipher(algorithm, this.encryptionKey)
    
    return Buffer.concat([decipher.update(encrypted), decipher.final()])
  }
}

// Export singleton instance (server-side only)
export const exportStorage = typeof window === 'undefined' ? new ExportStorage() : null as any
