import { ComprehensiveChapter, ContentCache, LearningRequest } from '@/types/learning';

export class CachingService {
  private static instance: CachingService;
  private cache: Map<string, ContentCache> = new Map();
  private maxCacheSize: number = 100;
  private cacheDurationHours: number = 24;

  private constructor() {
    // Clean up expired cache entries every hour
    setInterval(() => this.cleanupExpiredEntries(), 60 * 60 * 1000);
  }

  static getInstance(): CachingService {
    if (!CachingService.instance) {
      CachingService.instance = new CachingService();
    }
    return CachingService.instance;
  }

  // Generate cache key from learning request
  private generateCacheKey(request: LearningRequest): string {
    const keyParts = [
      request.subject.toLowerCase().replace(/\s+/g, '_'),
      request.chapter.toLowerCase().replace(/\s+/g, '_'),
      request.class?.toString() || 'general',
      request.board?.toLowerCase().replace(/\s+/g, '_') || 'general',
      request.depth_level || 'intermediate'
    ];
    return keyParts.join('::');
  }

  // Check if content exists in cache and is not expired
  getCachedContent(request: LearningRequest): ComprehensiveChapter | null {
    const key = this.generateCacheKey(request);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if expired
    if (new Date() > new Date(cached.expires_at)) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    cached.access_count++;
    cached.last_accessed = new Date().toISOString();

    console.log(`Cache hit for: ${key}`);
    return cached.content;
  }

  // Store content in cache
  setCachedContent(request: LearningRequest, content: ComprehensiveChapter): void {
    const key = this.generateCacheKey(request);
    
    // Check cache size limit
    if (this.cache.size >= this.maxCacheSize) {
      this.evictLeastRecentlyUsed();
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + (this.cacheDurationHours * 60 * 60 * 1000));

    const cacheEntry: ContentCache = {
      id: this.generateId(),
      key,
      content,
      created_at: now.toISOString(),
      access_count: 1,
      last_accessed: now.toISOString(),
      expires_at: expiresAt.toISOString()
    };

    this.cache.set(key, cacheEntry);
    console.log(`Cached content for: ${key}`);
  }

  // Remove least recently used entries when cache is full
  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = new Date();

    for (const [key, entry] of this.cache.entries()) {
      const lastAccessed = new Date(entry.last_accessed);
      if (lastAccessed < oldestTime) {
        oldestTime = lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`Evicted from cache: ${oldestKey}`);
    }
  }

  // Clean up expired entries
  private cleanupExpiredEntries(): void {
    const now = new Date();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > new Date(entry.expires_at)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => {
      this.cache.delete(key);
      console.log(`Expired cache entry removed: ${key}`);
    });

    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  // Get cache statistics
  getCacheStats(): {
    totalEntries: number;
    totalSize: string;
    hitRate: number;
    oldestEntry: string;
    newestEntry: string;
    mostAccessed: { key: string; count: number } | null;
  } {
    const entries = Array.from(this.cache.values());
    
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        totalSize: '0 KB',
        hitRate: 0,
        oldestEntry: 'None',
        newestEntry: 'None',
        mostAccessed: null
      };
    }

    // Calculate approximate size
    const sizeBytes = JSON.stringify(Array.from(this.cache.values())).length;
    const sizeKB = Math.round(sizeBytes / 1024);
    const totalSize = sizeKB > 1024 ? `${Math.round(sizeKB / 1024)} MB` : `${sizeKB} KB`;

    // Find oldest and newest entries
    const sortedByCreation = entries.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const oldestEntry = sortedByCreation[0]?.key || 'None';
    const newestEntry = sortedByCreation[sortedByCreation.length - 1]?.key || 'None';

    // Find most accessed entry
    const mostAccessed = entries.reduce((max, entry) => 
      entry.access_count > (max?.access_count || 0) ? entry : max, 
      null as ContentCache | null
    );

    // Calculate hit rate (simplified - would need request tracking for accurate rate)
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.access_count, 0);
    const hitRate = entries.length > 0 ? Math.round((totalAccesses / entries.length) * 100) / 100 : 0;

    return {
      totalEntries: entries.length,
      totalSize,
      hitRate,
      oldestEntry,
      newestEntry,
      mostAccessed: mostAccessed ? { key: mostAccessed.key, count: mostAccessed.access_count } : null
    };
  }

  // Clear all cache
  clearCache(): void {
    const count = this.cache.size;
    this.cache.clear();
    console.log(`Cleared ${count} cache entries`);
  }

  // Remove specific cache entry
  removeCachedContent(request: LearningRequest): boolean {
    const key = this.generateCacheKey(request);
    const removed = this.cache.delete(key);
    if (removed) {
      console.log(`Removed from cache: ${key}`);
    }
    return removed;
  }

  // Get all cached keys (for debugging/admin purposes)
  getCachedKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Check if content is cached
  isCached(request: LearningRequest): boolean {
    const key = this.generateCacheKey(request);
    const cached = this.cache.get(key);
    
    if (!cached) return false;
    
    // Check if expired
    if (new Date() > new Date(cached.expires_at)) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  // Update cache configuration
  updateConfig(maxSize?: number, durationHours?: number): void {
    if (maxSize !== undefined) {
      this.maxCacheSize = maxSize;
      
      // If new size is smaller, evict entries
      while (this.cache.size > this.maxCacheSize) {
        this.evictLeastRecentlyUsed();
      }
    }
    
    if (durationHours !== undefined) {
      this.cacheDurationHours = durationHours;
    }
    
    console.log(`Cache config updated: maxSize=${this.maxCacheSize}, duration=${this.cacheDurationHours}h`);
  }

  // Preload popular content (could be called during off-peak hours)
  async preloadPopularContent(popularRequests: LearningRequest[]): Promise<void> {
    console.log(`Preloading ${popularRequests.length} popular content items...`);
    
    for (const request of popularRequests) {
      if (!this.isCached(request)) {
        // This would trigger content generation and caching
        // Implementation would depend on the main service
        console.log(`Would preload: ${this.generateCacheKey(request)}`);
      }
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export const cachingService = CachingService.getInstance();
