"use client"

import { useEffect } from 'react'
import { HighContrastManager, ScreenReaderAnnouncer, createSkipLink } from '@/lib/accessibility'

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  useEffect(() => {
    // Initialize high contrast mode detection
    HighContrastManager.init()
    
    // Initialize screen reader announcer
    ScreenReaderAnnouncer.getInstance()
    
    // Add skip link to main content
    const skipLink = createSkipLink('main-content', 'Skip to main content')
    if (skipLink) {
      document.body.insertBefore(skipLink, document.body.firstChild)
    }
    
    // Add live region for announcements
    const liveRegion = document.createElement('div')
    liveRegion.id = 'live-region'
    liveRegion.setAttribute('aria-live', 'polite')
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'live-region'
    document.body.appendChild(liveRegion)
    
    // Add assertive live region for urgent announcements
    const assertiveLiveRegion = document.createElement('div')
    assertiveLiveRegion.id = 'assertive-live-region'
    assertiveLiveRegion.setAttribute('aria-live', 'assertive')
    assertiveLiveRegion.setAttribute('aria-atomic', 'true')
    assertiveLiveRegion.className = 'live-region'
    document.body.appendChild(assertiveLiveRegion)
    
    // Cleanup function
    return () => {
      const skipLinkElement = document.querySelector('a[href="#main-content"]')
      const liveRegionElement = document.getElementById('live-region')
      const assertiveLiveRegionElement = document.getElementById('assertive-live-region')
      
      if (skipLinkElement) {
        document.body.removeChild(skipLinkElement)
      }
      if (liveRegionElement) {
        document.body.removeChild(liveRegionElement)
      }
      if (assertiveLiveRegionElement) {
        document.body.removeChild(assertiveLiveRegionElement)
      }
    }
  }, [])

  return <>{children}</>
}