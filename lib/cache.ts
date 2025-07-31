/**
 * API Cache and Deduplication Layer
 * Provides caching, deduplication, and performance optimizations for API calls
 */

import { NetworkService, Group } from './types'

// Cache configuration
interface CacheConfig {
  ttl: number // Time to live in milliseconds
  maxSize: number // Maximum number of entries
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface PendingRequest<T> {
  promise: Promise<T>
  timestamp: number
}

/**
 * Generic cache implementation with TTL and size limits
 */
class Cache<T> {
  private cache = new Map<string, CacheEntry<T>>()
  private pendingRequests = new Map<string, PendingRequest<T>>()
  private config: CacheConfig

  constructor(config: CacheConfig) {
    this.config = config
  }

  /**
   * Get cached data if valid, otherwise return null
   */
  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  /**
   * Set data in cache with TTL
   */
  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    }

    // Enforce size limit by removing oldest entries
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, entry)
  }

  /**
   * Remove specific entry from cache
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    this.pendingRequests.clear()
  }

  /**
   * Get or create a pending request to prevent duplicate API calls
   */
  getOrCreatePendingRequest(key: string, requestFn: () => Promise<T>): Promise<T> {
    const existing = this.pendingRequests.get(key)
    
    // Return existing pending request if it's still fresh (within 30 seconds)
    if (existing && Date.now() - existing.timestamp < 30000) {
      return existing.promise
    }

    // Create new pending request
    const promise = requestFn().finally(() => {
      this.pendingRequests.delete(key)
    })

    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now()
    })

    return promise
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      pendingRequests: this.pendingRequests.size,
      hitRate: this.calculateHitRate()
    }
  }

  private hitRate = { hits: 0, misses: 0 }

  private calculateHitRate(): number {
    const total = this.hitRate.hits + this.hitRate.misses
    return total > 0 ? this.hitRate.hits / total : 0
  }

  /**
   * Track cache hit
   */
  trackHit(): void {
    this.hitRate.hits++
  }

  /**
   * Track cache miss
   */
  trackMiss(): void {
    this.hitRate.misses++
  }
}

// Cache instances for different data types
const servicesCache = new Cache<NetworkService[]>({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 50
})

const serviceCache = new Cache<NetworkService>({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 100
})

const groupsCache = new Cache<Group[]>({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 20
})

const groupCache = new Cache<Group>({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 50
})

/**
 * Cache key generators
 */
export const cacheKeys = {
  services: (params?: Record<string, any>) => {
    if (!params || Object.keys(params).length === 0) {
      return 'services:all'
    }
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|')
    return `services:${sortedParams}`
  },
  service: (id: string) => `service:${id}`,
  groups: () => 'groups:all',
  group: (id: string) => `group:${id}`,
  groupServices: (groupId: string) => `group:${groupId}:services`
}

/**
 * Cached API wrapper functions
 */
export const cachedApi = {
  /**
   * Get services with caching and deduplication
   */
  async getServices(
    originalFetch: () => Promise<NetworkService[]>,
    params?: Record<string, any>
  ): Promise<NetworkService[]> {
    const key = cacheKeys.services(params)
    
    // Try cache first
    const cached = servicesCache.get(key)
    if (cached) {
      servicesCache.trackHit()
      return cached
    }

    servicesCache.trackMiss()

    // Use deduplication for pending requests
    return servicesCache.getOrCreatePendingRequest(key, async () => {
      const data = await originalFetch()
      servicesCache.set(key, data)
      return data
    })
  },

  /**
   * Get single service with caching
   */
  async getService(
    originalFetch: () => Promise<NetworkService>,
    id: string
  ): Promise<NetworkService> {
    const key = cacheKeys.service(id)
    
    const cached = serviceCache.get(key)
    if (cached) {
      serviceCache.trackHit()
      return cached
    }

    serviceCache.trackMiss()

    return serviceCache.getOrCreatePendingRequest(key, async () => {
      const data = await originalFetch()
      serviceCache.set(key, data)
      return data
    })
  },

  /**
   * Get groups with caching
   */
  async getGroups(
    originalFetch: () => Promise<Group[]>
  ): Promise<Group[]> {
    const key = cacheKeys.groups()
    
    const cached = groupsCache.get(key)
    if (cached) {
      groupsCache.trackHit()
      return cached
    }

    groupsCache.trackMiss()

    return groupsCache.getOrCreatePendingRequest(key, async () => {
      const data = await originalFetch()
      groupsCache.set(key, data)
      return data
    })
  },

  /**
   * Get single group with caching
   */
  async getGroup(
    originalFetch: () => Promise<Group>,
    id: string
  ): Promise<Group> {
    const key = cacheKeys.group(id)
    
    const cached = groupCache.get(key)
    if (cached) {
      groupCache.trackHit()
      return cached
    }

    groupCache.trackMiss()

    return groupCache.getOrCreatePendingRequest(key, async () => {
      const data = await originalFetch()
      groupCache.set(key, data)
      return data
    })
  }
}

/**
 * Cache invalidation functions
 */
export const cacheInvalidation = {
  /**
   * Invalidate services cache
   */
  invalidateServices(specificParams?: Record<string, any>): void {
    if (specificParams) {
      const key = cacheKeys.services(specificParams)
      servicesCache.delete(key)
    } else {
      // Clear all services cache entries
      servicesCache.clear()
    }
  },

  /**
   * Invalidate specific service
   */
  invalidateService(id: string): void {
    const key = cacheKeys.service(id)
    serviceCache.delete(key)
    // Also invalidate services list cache since it might contain this service
    this.invalidateServices()
  },

  /**
   * Invalidate groups cache
   */
  invalidateGroups(): void {
    groupsCache.clear()
  },

  /**
   * Invalidate specific group
   */
  invalidateGroup(id: string): void {
    const key = cacheKeys.group(id)
    groupCache.delete(key)
    // Also invalidate groups list cache
    this.invalidateGroups()
  },

  /**
   * Clear all caches
   */
  clearAll(): void {
    servicesCache.clear()
    serviceCache.clear()
    groupsCache.clear()
    groupCache.clear()
  }
}

/**
 * Cache statistics for monitoring
 */
export const cacheStats = {
  getAll() {
    return {
      services: servicesCache.getStats(),
      service: serviceCache.getStats(),
      groups: groupsCache.getStats(),
      group: groupCache.getStats()
    }
  },

  getTotalHitRate() {
    const stats = this.getAll()
    const totalHits = Object.values(stats).reduce((sum, stat) => sum + stat.hitRate, 0)
    return totalHits / Object.keys(stats).length
  }
}

/**
 * Background cache warming
 */
export const cacheWarming = {
  /**
   * Warm up essential caches on app start
   */
  async warmEssentialCaches(api: {
    getServices: () => Promise<NetworkService[]>
    getGroups: () => Promise<Group[]>
  }): Promise<void> {
    try {
      // Warm up groups cache first (smaller dataset)
      await cachedApi.getGroups(api.getGroups)
      
      // Warm up services cache
      await cachedApi.getServices(api.getServices)
    } catch (error) {
      console.warn('Cache warming failed:', error)
    }
  }
}

// Export cache instances for direct access if needed
export { servicesCache, serviceCache, groupsCache, groupCache }