"use client"

import { useState, useCallback, useEffect } from 'react'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useConnectionStatus, useRetryWithConnection } from '@/hooks/use-connection-status'
import { ErrorDisplay } from './error-display'
import { LoadingSpinner } from './loading-spinner'

interface RetryWrapperProps {
  children: React.ReactNode
  onRetry: () => Promise<void>
  error: unknown
  loading: boolean
  maxRetries?: number
  retryDelay?: number
  showRetryProgress?: boolean
  autoRetry?: boolean
  retryText?: string
}

export function RetryWrapper({
  children,
  onRetry,
  error,
  loading,
  maxRetries = 3,
  retryDelay = 1000,
  showRetryProgress = true,
  autoRetry = false,
  retryText = 'Try Again'
}: RetryWrapperProps) {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryProgress, setRetryProgress] = useState(0)
  const { isOnline } = useConnectionStatus()
  const { retryWithConnectionCheck } = useRetryWithConnection()

  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) {
      return
    }

    setIsRetrying(true)
    setRetryProgress(0)

    try {
      await retryWithConnectionCheck(onRetry, 1, retryDelay)
      setRetryCount(0) // Reset on success
    } catch (error) {
      setRetryCount(prev => prev + 1)
    } finally {
      setIsRetrying(false)
      setRetryProgress(0)
    }
  }, [onRetry, retryCount, maxRetries, retryDelay, retryWithConnectionCheck])

  // Auto retry with exponential backoff
  useEffect(() => {
    if (!autoRetry || !error || loading || isRetrying || retryCount >= maxRetries) {
      return
    }

    const delay = retryDelay * Math.pow(2, retryCount)
    let progressInterval: NodeJS.Timeout

    const timeout = setTimeout(() => {
      handleRetry()
    }, delay)

    // Show progress if enabled
    if (showRetryProgress) {
      const progressStep = 100 / (delay / 100)
      progressInterval = setInterval(() => {
        setRetryProgress(prev => {
          const next = prev + progressStep
          return next >= 100 ? 100 : next
        })
      }, 100)
    }

    return () => {
      clearTimeout(timeout)
      if (progressInterval) {
        clearInterval(progressInterval)
      }
    }
  }, [error, loading, isRetrying, retryCount, maxRetries, autoRetry, retryDelay, showRetryProgress, handleRetry])

  // Reset retry count when error clears
  useEffect(() => {
    if (!error) {
      setRetryCount(0)
      setRetryProgress(0)
    }
  }, [error])

  if (loading || isRetrying) {
    return <LoadingSpinner text={isRetrying ? 'Retrying...' : 'Loading...'} />
  }

  if (error) {
    const canRetry = retryCount < maxRetries
    const isOffline = !isOnline

    return (
      <div className="space-y-4">
        <ErrorDisplay
          error={error}
          onRetry={canRetry ? handleRetry : undefined}
          retryText={retryText}
          variant="card"
        />
        
        {/* Connection status */}
        <Card className="border-l-4 border-l-muted">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm">
              {isOffline ? (
                <>
                  <WifiOff className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Online</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Retry information */}
        {retryCount > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Retry Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Attempts:</span>
                <span>{retryCount} / {maxRetries}</span>
              </div>
              
              {autoRetry && canRetry && showRetryProgress && retryProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Next retry in:</span>
                    <span>{Math.ceil((100 - retryProgress) / 10)}s</span>
                  </div>
                  <Progress value={retryProgress} className="h-1" />
                </div>
              )}
              
              {!canRetry && (
                <p className="text-xs text-muted-foreground">
                  Maximum retry attempts reached. Please refresh the page or contact support.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return <>{children}</>
}

// Specialized retry wrapper for data fetching
export function DataRetryWrapper({
  children,
  onRetry,
  error,
  loading,
  emptyState,
  ...props
}: RetryWrapperProps & {
  emptyState?: React.ReactNode
}) {
  // If no error and no loading, but children is empty, show empty state
  if (!error && !loading && !children && emptyState) {
    return <>{emptyState}</>
  }

  return (
    <RetryWrapper
      onRetry={onRetry}
      error={error}
      loading={loading}
      {...props}
    >
      {children}
    </RetryWrapper>
  )
}