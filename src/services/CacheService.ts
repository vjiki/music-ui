/**
 * Cache Service for Web Application
 * Similar to iOS CacheService, caches images, audio, and video files
 * Uses IndexedDB for storage and Cache API for HTTP caching
 */

interface CachedItemMetadata {
  url: string;
  cachedAt: number;
  size: number;
  type: 'image' | 'audio' | 'video';
  title?: string;
  artist?: string;
  coverURL?: string;
}

class CacheService {
  private static instance: CacheService;
  private dbName = 'MusicAppCache';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private cacheName = 'music-app-cache-v1';
  private cache: Cache | null = null;

  private constructor() {
    this.init();
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private async init() {
    try {
      // Initialize IndexedDB
      this.db = await this.openDB();
      
      // Initialize Cache API
      if ('caches' in window) {
        this.cache = await caches.open(this.cacheName);
      }
    } catch (error) {
      console.error('Failed to initialize cache service:', error);
    }
  }

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('metadata')) {
          const metadataStore = db.createObjectStore('metadata', { keyPath: 'url' });
          metadataStore.createIndex('type', 'type', { unique: false });
          metadataStore.createIndex('cachedAt', 'cachedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'url' });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      this.db = await this.openDB();
    }
    return this.db;
  }

  private async ensureCache(): Promise<Cache> {
    if (!this.cache) {
      if ('caches' in window) {
        this.cache = await caches.open(this.cacheName);
      } else {
        throw new Error('Cache API not supported');
      }
    }
    return this.cache;
  }


  // Image Caching
  async cacheImage(url: string, title?: string, artist?: string): Promise<void> {
    try {
      const cache = await this.ensureCache();
      const response = await fetch(url);
      
      if (response.ok) {
        await cache.put(url, response.clone());
        
        const metadata: CachedItemMetadata = {
          url,
          cachedAt: Date.now(),
          size: parseInt(response.headers.get('content-length') || '0', 10),
          type: 'image',
          title,
          artist,
        };

        await this.saveMetadata(metadata);
      }
    } catch (error) {
      console.error('Failed to cache image:', error);
    }
  }

  async getCachedImage(url: string): Promise<Blob | null> {
    try {
      const cache = await this.ensureCache();
      const cachedResponse = await cache.match(url);
      
      if (cachedResponse) {
        return await cachedResponse.blob();
      }
    } catch (error) {
      console.error('Failed to get cached image:', error);
    }
    return null;
  }

  async hasCachedImage(url: string): Promise<boolean> {
    try {
      const cache = await this.ensureCache();
      const cachedResponse = await cache.match(url);
      return !!cachedResponse;
    } catch (error) {
      return false;
    }
  }

  // Audio Caching
  async cacheAudio(url: string, title?: string, artist?: string, coverURL?: string): Promise<void> {
    try {
      const cache = await this.ensureCache();
      const response = await fetch(url);
      
      if (response.ok) {
        await cache.put(url, response.clone());
        
        const metadata: CachedItemMetadata = {
          url,
          cachedAt: Date.now(),
          size: parseInt(response.headers.get('content-length') || '0', 10),
          type: 'audio',
          title,
          artist,
          coverURL,
        };

        await this.saveMetadata(metadata);
      }
    } catch (error) {
      console.error('Failed to cache audio:', error);
    }
  }

  async getCachedAudioURL(url: string): Promise<string | null> {
    try {
      const cache = await this.ensureCache();
      const cachedResponse = await cache.match(url);
      
      if (cachedResponse) {
        // Create a blob URL from cached response
        const blob = await cachedResponse.blob();
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error('Failed to get cached audio:', error);
    }
    return null;
  }

  async hasCachedAudio(url: string): Promise<boolean> {
    try {
      const cache = await this.ensureCache();
      const cachedResponse = await cache.match(url);
      return !!cachedResponse;
    } catch (error) {
      return false;
    }
  }

  // Video Caching
  async cacheVideo(url: string, title?: string, artist?: string, coverURL?: string): Promise<void> {
    try {
      const cache = await this.ensureCache();
      const response = await fetch(url);
      
      if (response.ok) {
        await cache.put(url, response.clone());
        
        const metadata: CachedItemMetadata = {
          url,
          cachedAt: Date.now(),
          size: parseInt(response.headers.get('content-length') || '0', 10),
          type: 'video',
          title,
          artist,
          coverURL,
        };

        await this.saveMetadata(metadata);
      }
    } catch (error) {
      console.error('Failed to cache video:', error);
    }
  }

  async getCachedVideoURL(url: string): Promise<string | null> {
    try {
      const cache = await this.ensureCache();
      const cachedResponse = await cache.match(url);
      
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        return URL.createObjectURL(blob);
      }
    } catch (error) {
      console.error('Failed to get cached video:', error);
    }
    return null;
  }

  async hasCachedVideo(url: string): Promise<boolean> {
    try {
      const cache = await this.ensureCache();
      const cachedResponse = await cache.match(url);
      return !!cachedResponse;
    } catch (error) {
      return false;
    }
  }

  // Metadata Management
  private async saveMetadata(metadata: CachedItemMetadata): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      await store.put(metadata);
    } catch (error) {
      console.error('Failed to save metadata:', error);
    }
  }

  async getMetadata(url: string): Promise<CachedItemMetadata | null> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      return await new Promise<CachedItemMetadata | null>((resolve, reject) => {
        const request = store.get(url);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to get metadata:', error);
      return null;
    }
  }

  // Cache Size Calculation
  async getCacheSize(): Promise<{ total: number; images: number; audio: number; video: number }> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const allMetadata = await new Promise<CachedItemMetadata[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      let images = 0;
      let audio = 0;
      let video = 0;

      allMetadata.forEach((item: CachedItemMetadata) => {
        if (item.type === 'image') images += item.size;
        else if (item.type === 'audio') audio += item.size;
        else if (item.type === 'video') video += item.size;
      });

      return {
        total: images + audio + video,
        images,
        audio,
        video,
      };
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return { total: 0, images: 0, audio: 0, video: 0 };
    }
  }

  // Clear Cache
  async clearAllCache(): Promise<void> {
    try {
      // Clear Cache API
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames
            .filter(name => name.startsWith('music-app-cache'))
            .map(name => caches.delete(name))
        );
      }

      // Clear IndexedDB
      const db = await this.ensureDB();
      const transaction = db.transaction(['metadata', 'files'], 'readwrite');
      await Promise.all([
        transaction.objectStore('metadata').clear(),
        transaction.objectStore('files').clear(),
      ]);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async clearImageCache(): Promise<void> {
    await this.clearCacheByType('image');
  }

  async clearAudioCache(): Promise<void> {
    await this.clearCacheByType('audio');
  }

  async clearVideoCache(): Promise<void> {
    await this.clearCacheByType('video');
  }

  private async clearCacheByType(type: 'image' | 'audio' | 'video'): Promise<void> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const index = store.index('type');
      const request = index.getAll(type);

      const items = await new Promise<CachedItemMetadata[]>((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const cache = await this.ensureCache();
      await Promise.all([
        ...items.map(item => cache.delete(item.url)),
        ...items.map(item => {
          const deleteTransaction = db.transaction(['metadata'], 'readwrite');
          return deleteTransaction.objectStore('metadata').delete(item.url);
        }),
      ]);
    } catch (error) {
      console.error(`Failed to clear ${type} cache:`, error);
    }
  }
}

export const cacheService = CacheService.getInstance();

