/**
 * Performance monitoring component for development
 * Shows real-time performance metrics and cache statistics
 */

"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { performanceMonitor, performanceDebug, bundleAnalysis } from '@/lib/performance'
import { cacheStats } from '@/lib/cache'
import { errorLogger } from '@/lib/error-logging'

interface PerformanceStats {
  api: {
    count: number
    averageDuration: number
    slowestCall: any
  }
  components: {
    count: number
    averageRenderTime: number
  }
  navigation: {
    pageLoadTime?: number
    firstPaint?: number
    firstContentfulPaint?: number
  }
  cache: {
    services: any
    service: any
    groups: any
    group: any
  }
  bundle: Array<{
    name: string
    duration: number
    size: number
    cached: boolean
    type: string
  }>
}

export function PerformanceMonitor() {
  const [stats, setStats] = useState<PerformanceStats | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Only show in development
  const isDevelopment = process.env.NODE_ENV === 'development'

  useEffect(() => {
    if (!isDevelopment) return

    const updateStats = () => {
      const summary = performanceMonitor.getSummary()
      const cacheData = cacheStats.getAll()
      const bundleData = bundleAnalysis.getResourcePerformance()

      // Log performance metrics
      if (summary.api.averageDuration > 1000) {
        errorLogger.logPerformanceMetric('slow_api_average', summary.api.averageDuration, {
          apiCallCount: summary.api.count
        })
      }

      if (summary.navigation.pageLoadTime && summary.navigation.pageLoadTime > 3000) {
        errorLogger.logPerformanceMetric('slow_page_load', summary.navigation.pageLoadTime)
      }

      setStats({
        api: summary.api,
        components: summary.components,
        navigation: summary.navigation,
        cache: cacheData,
        bundle: bundleData
      })
    }

    updateStats()

    let interval: NodeJS.Timeout | null = null
    if (autoRefresh) {
      interval = setInterval(updateStats, 2000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, isDevelopment])

  // Don't render in production
  if (!isDevelopment) return null

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          📊 Performance
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto">
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Performance Monitor</CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                className="text-xs h-6"
              >
                {autoRefresh ? "⏸️" : "▶️"}
              </Button>
              <Button
                onClick={() => performanceDebug.logSummary()}
                variant="outline"
                size="sm"
                className="text-xs h-6"
              >
                📋 Log
              </Button>
              <Button
                onClick={() => performanceDebug.exportData()}
                variant="outline"
                size="sm"
                className="text-xs h-6"
              >
                💾 Export
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="text-xs h-6"
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {stats && (
            <>
              {/* API Performance */}
              <div>
                <h4 className="font-medium mb-1">API Calls</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground">Count:</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {stats.api.count}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg:</span>
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {Math.round(stats.api.averageDuration)}ms
                    </Badge>
                  </div>
                </div>
                {stats.api.slowestCall && (
                  <div className="mt-1">
                    <span className="text-muted-foreground">Slowest:</span>
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {stats.api.slowestCall.name} ({Math.round(stats.api.slowestCall.duration)}ms)
                    </Badge>
                  </div>
                )}
              </div>

              <Separator />

              {/* Cache Performance */}
              <div>
                <h4 className="font-medium mb-1">Cache Stats</h4>
                <div className="space-y-1">
                  {Object.entries(stats.cache).map(([key, cache]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {cache.size}/{cache.maxSize}
                        </Badge>
                        <Badge 
                          variant={cache.hitRate > 0.7 ? "default" : cache.hitRate > 0.4 ? "secondary" : "destructive"}
                          className="text-xs"
                        >
                          {Math.round(cache.hitRate * 100)}% hit
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Navigation Performance */}
              {stats.navigation.pageLoadTime && (
                <>
                  <div>
                    <h4 className="font-medium mb-1">Navigation</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Page Load:</span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(stats.navigation.pageLoadTime)}ms
                        </Badge>
                      </div>
                      {stats.navigation.firstPaint && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">First Paint:</span>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(stats.navigation.firstPaint)}ms
                          </Badge>
                        </div>
                      )}
                      {stats.navigation.firstContentfulPaint && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">FCP:</span>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(stats.navigation.firstContentfulPaint)}ms
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Bundle Analysis */}
              {stats.bundle.length > 0 && (
                <div>
                  <h4 className="font-medium mb-1">Bundle Resources</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {stats.bundle.slice(0, 5).map((resource, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-muted-foreground truncate flex-1 mr-2">
                          {resource.name}
                        </span>
                        <div className="flex gap-1">
                          <Badge 
                            variant={resource.cached ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {resource.cached ? "cached" : Math.round(resource.duration) + "ms"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {resource.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {stats.bundle.length > 5 && (
                      <div className="text-center text-muted-foreground">
                        +{stats.bundle.length - 5} more resources
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Component Performance */}
              {stats.components.count > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-1">Components</h4>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Renders:</span>
                      <Badge variant="secondary" className="text-xs">
                        {stats.components.count}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avg Render:</span>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(stats.components.averageRenderTime)}ms
                      </Badge>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}