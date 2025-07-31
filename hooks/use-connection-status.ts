"use client"

import { useState, useEffect, useCallback } from 'react'

interface ConnectionStatus {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string | null
  lastOnlineAt: Date | null
  retryCount: number
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSlowConnection: false,
    connectionType: null,
    lastOnlineAt: null,
    retryCount: 0
  })

  // Check connection speed by measuring a small request
  const checkConnectionSpeed = useCallback(async () => {
    if (!status.isOnline) return

    try {
      const startTime = Date.now()
      
      // Make a small request to check speed (using a 1x1 pixel image)
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      })
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      // Consider connection slow if health check takes more than 2 seconds
      const isSlowConnection = duration > 2000 || !response.ok
      
      setStatus(prev => ({
        ...prev,
        isSlowConnection,
        lastOnlineAt: response.ok ? new Date() : prev.lastOnlineAt
      }))
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        isSlowConnection: true
      }))
    }
  }, [status.isOnline])

  // Get connection type if available
  const getConnectionType = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const connection = (navigator as any).connection
      return connection?.effectiveType || connection?.type || null
    }
    return null
  }, [])

  // Handle online/offline events
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: true,
        lastOnlineAt: new Date(),
        retryCount: 0
      }))
      
      // Check connection speed when coming back online
      checkConnectionSpeed()
    }

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        isSlowConnection: false
      }))
    }

    const handleConnectionChange = () => {
      const connectionType = getConnectionType()
      setStatus(prev => ({
        ...prev,
        connectionType
      }))
      
      // Recheck speed when connection changes
      if (status.isOnline) {
        checkConnectionSpeed()
      }
    }

    // Add event listeners
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Listen for connection changes if supported
    if ('connection' in navigator) {
      const connection = (navigator as any).connection
      connection?.addEventListener('change', handleConnectionChange)
    }

    // Initial setup
    setStatus(prev => ({
      ...prev,
      isOnline: navigator.onLine,
      connectionType: getConnectionType()
    }))

    // Initial speed check if online
    if (navigator.onLine) {
      checkConnectionSpeed()
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection
        connection?.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [checkConnectionSpeed, getConnectionType, status.isOnline])

  // Retry connection check
  const retryConnection = useCallback(async () => {
    setStatus(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1
    }))

    try {
      // Try to make a request to check if we're really online
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-cache'
      })

      if (response.ok) {
        setStatus(prev => ({
          ...prev,
          isOnline: true,
          lastOnlineAt: new Date(),
          retryCount: 0
        }))
        return true
      }
    } catch (error) {
      // Still offline
    }

    return false
  }, [])

  // Periodic connection check when offline
  useEffect(() => {
    if (status.isOnline) return

    const interval = setInterval(() => {
      retryConnection()
    }, 30000) // Check every 30 seconds when offline

    return () => clearInterval(interval)
  }, [status.isOnline, retryConnection])

  return {
    ...status,
    retryConnection,
    checkConnectionSpeed
  }
}

// Hook for handling API request retries with connection awareness
export function useRetryWithConnection() {
  const { isOnline, retryConnection } = useConnectionStatus()

  const retryWithConnectionCheck = useCallback(async (
    retryFn: () => Promise<any>,
    maxRetries: number = 3,
    delay: number = 1000
  ) => {
    let attempts = 0
    
    while (attempts < maxRetries) {
      try {
        // If offline, try to reconnect first
        if (!isOnline) {
          const reconnected = await retryConnection()
          if (!reconnected) {
            throw new Error('No internet connection')
          }
        }

        return await retryFn()
      } catch (error) {
        attempts++
        
        if (attempts >= maxRetries) {
          throw error
        }

        // Wait before retrying with exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, delay * Math.pow(2, attempts - 1))
        )
      }
    }
  }, [isOnline, retryConnection])

  return {
    retryWithConnectionCheck,
    isOnline
  }
}