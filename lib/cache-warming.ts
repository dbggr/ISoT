/**
 * Cache warming utilities for better initial performance
 * Pre-loads essential data to improve user experience
 */

import { apiClient } from './api'
import { cacheWarming } from './cache'

/**
 * Initialize cache warming on application start
 */
export function initializeCacheWarming() {
  if (typeof window === 'undefined') return

  // Warm cache after a short delay to not block initial render
  setTimeout(() => {
    cacheWarming.warmEssentialCaches({
      getServices: () => apiClient.getServices(),
      getGroups: () => apiClient.getGroups()
    }).catch(error => {
      console.warn('Cache warming failed:', error)
    })
  }, 1000)

  // Warm cache on page visibility change (user returns to tab)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // Refresh cache when user returns to the tab
      setTimeout(() => {
        cacheWarming.warmEssentialCaches({
          getServices: () => apiClient.getServices(),
          getGroups: () => apiClient.getGroups()
        }).catch(error => {
          console.warn('Cache refresh failed:', error)
        })
      }, 500)
    }
  })
}

/**
 * Preload critical routes for better navigation performance
 */
export function preloadCriticalRoutes() {
  if (typeof window === 'undefined') return

  // Preload critical pages after initial load
  window.addEventListener('load', () => {
    setTimeout(() => {
      // Preload services page
      const servicesLink = document.createElement('link')
      servicesLink.rel = 'prefetch'
      servicesLink.href = '/services'
      document.head.appendChild(servicesLink)

      // Preload groups page
      const groupsLink = document.createElement('link')
      groupsLink.rel = 'prefetch'
      groupsLink.href = '/groups'
      document.head.appendChild(groupsLink)

      // Preload service creation page
      const newServiceLink = document.createElement('link')
      newServiceLink.rel = 'prefetch'
      newServiceLink.href = '/services/new'
      document.head.appendChild(newServiceLink)
    }, 2000)
  })
}