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
          className="bg-gray-900/90 backdrop-blur-sm border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-200 shadow-lg"
        >
          📊 Performance
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto">
      <Card className="bg-gray-900/95 backdrop-blur-sm border-2 border-cyan-500/30 shadow-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-cyan-400">Performance Monitor</CardTitle>
            <div className="flex gap-1">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                className={`text-xs h-6 ${autoRefresh ? 'bg-cyan-500 hover:bg-cyan-600' : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50'}`}
              >
                {autoRefresh ? "⏸️" : "▶️"}
              </Button>
              <Button
                onClick={() => performanceDebug.logSummary()}
                variant="outline"
                size="sm"
                className="text-xs h-6 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50"
              >
                📋 Log
              </Button>
              <Button
                onClick={() => performanceDebug.exportData()}
                variant="outline"
                size="sm"
                className="text-xs h-6 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50"
              >
                💾 Export
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
                className="text-xs h-6 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20"
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-gray-300">
          {stats && (
            <>
              {/* API Performance */}
              <div>
                <h4 className="font-medium mb-1 text-cyan-400">API Calls</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400">Count:</span>
                    <Badge variant="secondary" className="ml-1 text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      {stats.api.count}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-400">Avg:</span>
                    <Badge variant="secondary" className="ml-1 text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                      {Math.round(stats.api.averageDuration)}ms
                    </Badge>
                  </div>
                </div>
                {stats.api.slowestCall && (
                  <div className="mt-1">
                    <span className="text-gray-400">Slowest:</span>
                    <Badge variant="destructive" className="ml-1 text-xs bg-red-500/20 text-red-400 border-red-500/30">
                      {stats.api.slowestCall.name} ({Math.round(stats.api.slowestCall.duration)}ms)
                    </Badge>
                  </div>
                )}
              </div>

              <Separator />

              {/* Cache Performance */}
              <div>
                <h4 className="font-medium mb-1 text-cyan-400">Cache Stats</h4>
                <div className="space-y-1">
                  {Object.entries(stats.cache).map(([key, cache]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{key}:</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs bg-gray-800 text-gray-300 border-gray-600">
                          {cache.size}/{cache.maxSize}
                        </Badge>
                        <Badge 
                          variant={cache.hitRate > 0.7 ? "default" : cache.hitRate > 0.4 ? "secondary" : "destructive"}
                          className={`text-xs ${
                            cache.hitRate > 0.7 
                              ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                              : cache.hitRate > 0.4 
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}
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
                    <h4 className="font-medium mb-1 text-cyan-400">Navigation</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Page Load:</span>
                        <Badge variant="secondary" className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          {Math.round(stats.navigation.pageLoadTime)}ms
                        </Badge>
                      </div>
                      {stats.navigation.firstPaint && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">First Paint:</span>
                          <Badge variant="secondary" className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                            {Math.round(stats.navigation.firstPaint)}ms
                          </Badge>
                        </div>
                      )}
                      {stats.navigation.firstContentfulPaint && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">FCP:</span>
                          <Badge variant="secondary" className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
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
                  <h4 className="font-medium mb-1 text-cyan-400">Bundle Resources</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {stats.bundle.slice(0, 5).map((resource, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-400 truncate flex-1 mr-2">
                          {resource.name}
                        </span>
                        <div className="flex gap-1">
                          <Badge 
                            variant={resource.cached ? "default" : "secondary"}
                            className={`text-xs ${
                              resource.cached 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                                : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                            }`}
                          >
                            {resource.cached ? "cached" : Math.round(resource.duration) + "ms"}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-gray-800 text-gray-300 border-gray-600">
                            {resource.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {stats.bundle.length > 5 && (
                      <div className="text-center text-gray-400">
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
                    <h4 className="font-medium mb-1 text-cyan-400">Components</h4>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Renders:</span>
                      <Badge variant="secondary" className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                        {stats.components.count}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Render:</span>
                      <Badge variant="secondary" className="text-xs bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
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