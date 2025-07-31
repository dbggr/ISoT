/**
 * Client-side cache initialization component
 * Handles cache warming and route preloading on the client
 */

"use client"

import { useEffect } from 'react'
import { initializeCacheWarming, preloadCriticalRoutes } from '@/lib/cache-warming'

export function CacheInitializer() {
  useEffect(() => {
    // Initialize cache warming
    initializeCacheWarming()
    
    // Preload critical routes
    preloadCriticalRoutes()
  }, [])

  // This component doesn't render anything
  return null
}