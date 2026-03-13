/**
 * Video Source Management
 * Handles auto-refresh of expiring video URLs from various providers
 */

export type SourceProvider = 'DIRECT' | 'SAVEFILES' | 'M3U8' | 'MP4' | 'CUSTOM';

export interface VideoSourceConfig {
  id: string;
  name: string;
  provider: SourceProvider;
  apiKey?: string;
  apiEndpoint?: string;
  isActive: boolean;
  settings?: Record<string, any>;
}

export interface RefreshResult {
  success: boolean;
  newUrl?: string;
  expiresAt?: Date;
  error?: string;
}

/**
 * SaveFiles.com API integration
 */
export class SaveFilesProvider {
  private apiKey: string;
  private baseUrl = 'https://savefiles.com/api';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get account info
   */
  async getAccountInfo(): Promise<{ balance: number; bandwidth: number }> {
    const response = await fetch(`${this.baseUrl}/account/info?key=${this.apiKey}`);
    if (!response.ok) {
      throw new Error('Failed to fetch account info');
    }
    return response.json();
  }

  /**
   * Get file info and download URL
   */
  async getFileUrl(fileId: string): Promise<{ url: string; expiresAt: Date; fileName: string; fileSize: number }> {
    const response = await fetch(
      `${this.baseUrl}/file/info?key=${this.apiKey}&file_code=${fileId}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch file info');
    }
    
    const data = await response.json();
    
    // Calculate expiration (usually 12 hours for savefiles)
    const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
    
    return {
      url: data.download_url || data.url,
      expiresAt,
      fileName: data.name || data.file_name,
      fileSize: data.size || data.file_size || 0,
    };
  }

  /**
   * Get download link with custom expiration
   */
  async getDownloadLink(fileId: string, expirationHours: number = 12): Promise<{ url: string; expiresAt: Date }> {
    const exp = Math.floor((Date.now() + expirationHours * 60 * 60 * 1000) / 1000);
    
    const response = await fetch(
      `${this.baseUrl}/file/download?key=${this.apiKey}&file_code=${fileId}&exp=${exp}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to get download link');
    }
    
    const data = await response.json();
    const expiresAt = new Date(exp * 1000);
    
    return {
      url: data.download_url || data.url,
      expiresAt,
    };
  }

  /**
   * List files
   */
  async listFiles(folderId?: string): Promise<Array<{ id: string; name: string; size: number; created: string }>> {
    let url = `${this.baseUrl}/file/list?key=${this.apiKey}`;
    if (folderId) {
      url += `&fld_id=${folderId}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to list files');
    }
    
    const data = await response.json();
    return data.files || data.result || [];
  }

  /**
   * Extract file ID from SaveFiles URL
   */
  static extractFileId(url: string): string | null {
    // Match patterns like:
    // https://savefiles.com/abc123
    // https://savefiles.com/d/abc123
    // https://savefiles.com/file/abc123
    const match = url.match(/savefiles\.com\/(?:d\/|file\/)?([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Video Source Manager
 * Manages multiple video source providers
 */
export class VideoSourceManager {
  private sources: Map<string, VideoSourceConfig> = new Map();

  constructor(configs: VideoSourceConfig[]) {
    for (const config of configs) {
      this.sources.set(config.name, config);
    }
  }

  /**
   * Refresh a video URL that's about to expire
   */
  async refreshUrl(
    sourceType: SourceProvider,
    sourceId: string,
    configName?: string
  ): Promise<RefreshResult> {
    try {
      switch (sourceType) {
        case 'SAVEFILES': {
          const config = configName 
            ? this.sources.get(configName)
            : Array.from(this.sources.values()).find(s => s.provider === 'SAVEFILES');
          
          if (!config?.apiKey) {
            return { success: false, error: 'SaveFiles API key not configured' };
          }

          const provider = new SaveFilesProvider(config.apiKey);
          const result = await provider.getDownloadLink(sourceId);
          
          return {
            success: true,
            newUrl: result.url,
            expiresAt: result.expiresAt,
          };
        }

        case 'DIRECT':
        case 'M3U8':
        case 'MP4':
          // These don't need refresh - they should work indefinitely
          return { 
            success: false, 
            error: 'Direct URLs do not need refresh' 
          };

        default:
          return { success: false, error: `Unknown source type: ${sourceType}` };
      }
    } catch (error) {
      console.error('Error refreshing video URL:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check if a URL needs refresh (expires within threshold)
   */
  needsRefresh(expiresAt: Date | null, thresholdHours: number = 2): boolean {
    if (!expiresAt) return false;
    
    const threshold = thresholdHours * 60 * 60 * 1000;
    return expiresAt.getTime() - Date.now() < threshold;
  }

  /**
   * Extract file ID from SaveFiles URL
   */
  static extractSaveFilesId(url: string): string | null {
    return SaveFilesProvider.extractFileId(url);
  }

  /**
   * Detect source type from URL
   */
  static detectSourceType(url: string): SourceProvider {
    if (url.includes('savefiles.com')) {
      return 'SAVEFILES';
    }
    if (url.includes('.m3u8')) {
      return 'M3U8';
    }
    if (url.includes('.mp4')) {
      return 'MP4';
    }
    return 'DIRECT';
  }
}

/**
 * Get default video source manager from database configs
 */
export async function getVideoSourceManager(): Promise<VideoSourceManager> {
  const { query } = await import('@/server/db');
  
  const configs = await query<{
    id: string;
    name: string;
    provider: string;
    apiKey: string | null;
    apiEndpoint: string | null;
    isActive: number;
    settings: string | null;
  }>(`
    SELECT id, name, provider, apiKey, apiEndpoint, isActive, settings 
    FROM VideoSourceConfig 
    WHERE isActive = 1
  `);

  return new VideoSourceManager(
    configs.map(c => ({
      id: c.id,
      name: c.name,
      provider: c.provider as SourceProvider,
      apiKey: c.apiKey || undefined,
      apiEndpoint: c.apiEndpoint || undefined,
      isActive: Boolean(c.isActive),
      settings: c.settings ? JSON.parse(c.settings) : undefined,
    }))
  );
}
