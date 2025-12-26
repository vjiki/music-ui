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
  // Track pending cache operations to prevent duplicate requests
  private pendingCacheOps = new Map<string, Promise<void>>();

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
    // Check if already cached to avoid duplicate requests
    const alreadyCached = await this.hasCachedImage(url);
    if (alreadyCached) {
      return;
    }

    // Check if there's already a pending cache operation for this URL
    const pendingOp = this.pendingCacheOps.get(url);
    if (pendingOp) {
      return pendingOp;
    }

    // Create the cache operation promise
    const cacheOp = (async () => {
      try {
        const cache = await this.ensureCache();
        // Double-check cache after acquiring lock (race condition protection)
        const doubleCheck = await this.hasCachedImage(url);
        if (doubleCheck) {
          return;
        }

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
      } finally {
        // Remove from pending operations
        this.pendingCacheOps.delete(url);
      }
    })();

    // Store the pending operation
    this.pendingCacheOps.set(url, cacheOp);
    return cacheOp;
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
    // Check if already cached to avoid duplicate requests
    const alreadyCached = await this.hasCachedAudio(url);
    if (alreadyCached) {
      return;
    }

    // Check if there's already a pending cache operation for this URL
    const pendingOp = this.pendingCacheOps.get(url);
    if (pendingOp) {
      return pendingOp;
    }

    // Create the cache operation promise
    const cacheOp = (async () => {
      try {
        const cache = await this.ensureCache();
        // Double-check cache after acquiring lock (race condition protection)
        const doubleCheck = await this.hasCachedAudio(url);
        if (doubleCheck) {
          return;
        }

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
      } finally {
        // Remove from pending operations
        this.pendingCacheOps.delete(url);
      }
    })();

    // Store the pending operation
    this.pendingCacheOps.set(url, cacheOp);
    return cacheOp;
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
    // Check if already cached to avoid duplicate requests
    const alreadyCached = await this.hasCachedVideo(url);
    if (alreadyCached) {
      return;
    }

    // Check if there's already a pending cache operation for this URL
    const pendingOp = this.pendingCacheOps.get(url);
    if (pendingOp) {
      return pendingOp;
    }

    // Create the cache operation promise
    const cacheOp = (async () => {
      try {
        const cache = await this.ensureCache();
        // Double-check cache after acquiring lock (race condition protection)
        const doubleCheck = await this.hasCachedVideo(url);
        if (doubleCheck) {
          return;
        }

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
      } finally {
        // Remove from pending operations
        this.pendingCacheOps.delete(url);
      }
    })();

    // Store the pending operation
    this.pendingCacheOps.set(url, cacheOp);
    return cacheOp;
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

      // Convert bytes to GB
      const toGB = (bytes: number) => bytes / (1024 * 1024 * 1024);

      return {
        total: toGB(images + audio + video),
        images: toGB(images),
        audio: toGB(audio),
        video: toGB(video),
      };
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
      return { total: 0, images: 0, audio: 0, video: 0 };
    }
  }

  // Get cache statistics with categories
  async getCacheStatistics(): Promise<{ totalSize: number; categories: Array<{ name: string; size: number; percentage: number; color: string }> }> {
    const cacheSize = await this.getCacheSize();
    const categories: Array<{ name: string; size: number; percentage: number; color: string }> = [];

    if (cacheSize.images > 0) {
      categories.push({
        name: 'Photos',
        size: cacheSize.images,
        percentage: cacheSize.total > 0 ? (cacheSize.images / cacheSize.total) * 100 : 0,
        color: '#06b6d4', // cyan
      });
    }

    if (cacheSize.audio > 0) {
      categories.push({
        name: 'Music',
        size: cacheSize.audio,
        percentage: cacheSize.total > 0 ? (cacheSize.audio / cacheSize.total) * 100 : 0,
        color: '#ef4444', // red
      });
    }

    if (cacheSize.video > 0) {
      categories.push({
        name: 'Videos',
        size: cacheSize.video,
        percentage: cacheSize.total > 0 ? (cacheSize.video / cacheSize.total) * 100 : 0,
        color: '#a855f7', // purple
      });
    }

    return {
      totalSize: cacheSize.total,
      categories,
    };
  }

  // Get cached metadata
  async getCachedImageMetadata(): Promise<CachedItemMetadata[]> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const index = store.index('type');
      const allMetadata = await new Promise<CachedItemMetadata[]>((resolve, reject) => {
        const request = index.getAll('image');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return allMetadata;
    } catch (error) {
      console.error('Failed to get cached image metadata:', error);
      return [];
    }
  }

  async getCachedAudioMetadata(): Promise<CachedItemMetadata[]> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const index = store.index('type');
      const allMetadata = await new Promise<CachedItemMetadata[]>((resolve, reject) => {
        const request = index.getAll('audio');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return allMetadata;
    } catch (error) {
      console.error('Failed to get cached audio metadata:', error);
      return [];
    }
  }

  async getCachedVideoMetadata(): Promise<CachedItemMetadata[]> {
    try {
      const db = await this.ensureDB();
      const transaction = db.transaction(['metadata'], 'readonly');
      const store = transaction.objectStore('metadata');
      const index = store.index('type');
      const allMetadata = await new Promise<CachedItemMetadata[]>((resolve, reject) => {
        const request = index.getAll('video');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      return allMetadata;
    } catch (error) {
      console.error('Failed to get cached video metadata:', error);
      return [];
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

  async clearCachedImage(url: string): Promise<void> {
    try {
      const cache = await this.ensureCache();
      await cache.delete(url);
      
      const db = await this.ensureDB();
      const transaction = db.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      await store.delete(url);
    } catch (error) {
      console.error('Failed to clear cached image:', error);
    }
  }

  async clearCachedAudio(url: string): Promise<void> {
    try {
      const cache = await this.ensureCache();
      await cache.delete(url);
      
      const db = await this.ensureDB();
      const transaction = db.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      await store.delete(url);
    } catch (error) {
      console.error('Failed to clear cached audio:', error);
    }
  }

  async clearCachedVideo(url: string): Promise<void> {
    try {
      const cache = await this.ensureCache();
      await cache.delete(url);
      
      const db = await this.ensureDB();
      const transaction = db.transaction(['metadata'], 'readwrite');
      const store = transaction.objectStore('metadata');
      await store.delete(url);
    } catch (error) {
      console.error('Failed to clear cached video:', error);
    }
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

